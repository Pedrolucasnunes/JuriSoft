import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  let body: any

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  const { userId, quantidade } = body

  if (!userId) {
    return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 })
  }

  const totalQuestoes = [10, 20, 30].includes(Number(quantidade)) ? Number(quantidade) : 10
  const qtdRisco = Math.round(totalQuestoes * 0.7)   // 70%
  const qtdGeral = totalQuestoes - qtdRisco           // 30%

  // 1. Busca questões que o usuário JÁ ACERTOU (para evitar repetir)
  const { data: jaAcertou } = await supabase
    .from("simulado_respostas")
    .select("question_id")
    .eq("acertou", true)
    .in(
      "attempt_id",
      (
        await supabase
          .from("simulado_attempts")
          .select("id")
          .eq("user_id", userId)
      ).data?.map((a) => a.id) ?? []
    )

  const idsJaAcertou = (jaAcertou ?? []).map((r) => r.question_id)

  // 2. Busca matérias em risco do usuário (ordenadas pela menor taxa)
  const { data: materiasRisco } = await supabase
    .from("materias_risco")
    .select("subject_id, taxa")
    .eq("user_id", userId)
    .order("taxa", { ascending: true })
    .limit(3) // top 3 matérias mais fracas

  const subjectIdsRisco = (materiasRisco ?? []).map((m) => m.subject_id)

  // 3. Busca questões das matérias em risco (70%)
  let questoesRisco: any[] = []

  if (subjectIdsRisco.length > 0) {
    let query = supabase
      .from("questions")
      .select("id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, subject_id, topic_id")
      .in("subject_id", subjectIdsRisco)
      .limit(qtdRisco * 5) // pool maior para embaralhar

    // Exclui as que já acertou
    if (idsJaAcertou.length > 0) {
      query = query.not("id", "in", `(${idsJaAcertou.join(",")})`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Erro questões risco:", error.message)
    }

    questoesRisco = (data ?? [])
      .sort(() => Math.random() - 0.5)
      .slice(0, qtdRisco)
  }

  // 4. IDs já selecionados para não repetir no pool geral
  const idsJaSelecionados = [
    ...idsJaAcertou,
    ...questoesRisco.map((q) => q.id),
  ]

  // 5. Busca questões gerais aleatórias (30%)
  let query = supabase
    .from("questions")
    .select("id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, subject_id, topic_id")
    .limit(qtdGeral * 5)

  if (idsJaSelecionados.length > 0) {
    query = query.not("id", "in", `(${idsJaSelecionados.join(",")})`)
  }

  const { data: questoesGeral, error: geralError } = await query

  if (geralError) {
    console.error("Erro questões gerais:", geralError.message)
  }

  const questoesGeralSelecionadas = (questoesGeral ?? [])
    .sort(() => Math.random() - 0.5)
    .slice(0, qtdGeral)

  // 6. Monta lista final embaralhada
  const questoesFinal = [
    ...questoesRisco,
    ...questoesGeralSelecionadas,
  ].sort(() => Math.random() - 0.5)

  // 7. Busca nomes das matérias para exibir no front
  const subjectIdsFinal = [...new Set(questoesFinal.map((q) => q.subject_id))]
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .in("id", subjectIdsFinal)

  const subjectMap = Object.fromEntries(
    (subjects ?? []).map((s) => [s.id, s.name])
  )

  const questoesComMateria = questoesFinal.map((q) => ({
    ...q,
    subject_name: subjectMap[q.subject_id] ?? "Desconhecida",
  }))

  return NextResponse.json({
    distribuicao: {
      total: questoesFinal.length,
      risco: questoesRisco.length,
      geral: questoesGeralSelecionadas.length,
    },
    questoes: questoesComMateria,
  }, { status: 200 })
}