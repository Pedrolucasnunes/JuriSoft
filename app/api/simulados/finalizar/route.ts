import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  const { simuladoId, userId } = body

  if (!simuladoId || !userId) {
    return NextResponse.json(
      { error: "simuladoId e userId são obrigatórios" },
      { status: 400 }
    )
  }

  // 1. Busca attempt_ids do simulado
  const { data: attempts, error: atError } = await supabase
    .from("simulado_attempts")
    .select("id, question_id")
    .eq("simulado_id", simuladoId)
    .eq("user_id", userId)

  if (atError || !attempts || attempts.length === 0) {
    return NextResponse.json(
      { error: "Simulado não encontrado ou sem questões" },
      { status: 404 }
    )
  }

  const attemptIds = attempts.map((a) => a.id)

  // 2. Busca respostas
  const { data: respostas, error: rError } = await supabase
    .from("simulado_respostas")
    .select("attempt_id, question_id, resposta_usuario, acertou")
    .in("attempt_id", attemptIds)

  if (rError || !respostas) {
    return NextResponse.json({ error: "Erro ao buscar respostas" }, { status: 500 })
  }

  if (respostas.length === 0) {
    return NextResponse.json({ error: "Nenhuma questão respondida" }, { status: 400 })
  }

  // 3. Calcula métricas
  const total = respostas.length
  const acertos = respostas.filter((r) => r.acertou).length
  const erros = total - acertos
  const percentual = parseFloat(((acertos / total) * 100).toFixed(2))

  // 4. Atualiza simulados
  const { error: uError } = await supabase
    .from("simulados")
    .update({ acertos, erros, percentual })
    .eq("id", simuladoId)
    .eq("user_id", userId)

  if (uError) {
    return NextResponse.json({ error: uError.message }, { status: 500 })
  }

  // 5. Busca gabarito das questões respondidas
  const questionIds = respostas.map((r) => r.question_id)

  const { data: questions } = await supabase
    .from("questions")
    .select("id, enunciado, resposta_correta, subject_id")
    .in("id", questionIds)

  // 6. Busca nomes das matérias
  const subjectIds = [...new Set((questions ?? []).map((q) => q.subject_id).filter(Boolean))]
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .in("id", subjectIds.length > 0 ? subjectIds : ["null"])

  const subjectMap = Object.fromEntries((subjects ?? []).map((s) => [s.id, s.name]))
  const questionMap = Object.fromEntries((questions ?? []).map((q) => [q.id, q]))

  // 7. Monta gabarito detalhado
  const gabarito = respostas.map((r) => {
    const q = questionMap[r.question_id]
    return {
      question_id: r.question_id,
      enunciado: q?.enunciado ?? "",
      resposta_usuario: r.resposta_usuario,
      resposta_correta: q?.resposta_correta ?? "",
      acertou: r.acertou,
      subject_name: subjectMap[q?.subject_id] ?? "Desconhecida",
    }
  })

  return NextResponse.json({
    acertos,
    erros,
    percentual,
    total,
    gabarito,
  }, { status: 200 })
}