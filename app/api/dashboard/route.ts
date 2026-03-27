import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // ✅ Obtém usuário autenticado — ignora userId da query string
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("[dashboard] Não autenticado:", authError?.message)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const userId = user.id
  console.log(`[dashboard] Carregando dados para userId=${userId}`)

  // 1. Resumo geral via desempenho_materia
  const { data: resumo, error: resumoError } = await supabase
    .from("desempenho_materia")
    .select("total, acertos, taxa_acerto, subject_id")
    .eq("user_id", userId)

  if (resumoError) {
    console.error("[dashboard] Erro resumo:", resumoError.message)
    return NextResponse.json({ error: resumoError.message }, { status: 500 })
  }

  const totalRespondidas = resumo?.reduce((acc, r) => acc + (r.total ?? 0), 0) ?? 0
  const totalAcertos = resumo?.reduce((acc, r) => acc + (r.acertos ?? 0), 0) ?? 0
  const taxaGeralAcerto = totalRespondidas > 0
    ? parseFloat(((totalAcertos / totalRespondidas) * 100).toFixed(2))
    : 0

  // 2. Último simulado
  const { data: ultimoSimulado, error: simError } = await supabase
    .from("simulados")
    .select("id, created_at, acertos, erros, percentual, numero_questoes, titulo")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (simError && simError.code !== "PGRST116") {
    console.error("[dashboard] Erro último simulado:", simError.message)
  }

  // 3. Nomes das matérias
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")

  const subjectMap = Object.fromEntries(
    (subjects ?? []).map((s) => [s.id, s.name])
  )

  // 4. Matérias em risco
  const { data: materiasRiscoRaw, error: riscoError } = await supabase
    .from("materias_risco")
    .select("subject_id, taxa")
    .eq("user_id", userId)
    .order("taxa", { ascending: true })
    .limit(5)

  if (riscoError) {
    console.error("[dashboard] Erro matérias risco:", riscoError.message)
  }

  const materiasRisco = (materiasRiscoRaw ?? []).map((m) => ({
    subject_id: m.subject_id,
    nome: subjectMap[m.subject_id] ?? "Matéria desconhecida",
    taxa: m.taxa,
  }))

  // 5. Desempenho por matéria agrupado
  const agrupado = new Map<string, { subject_id: string; nome: string; total: number; acertos: number }>()

  for (const r of resumo ?? []) {
    const existing = agrupado.get(r.subject_id)
    if (existing) {
      existing.total += r.total ?? 0
      existing.acertos += r.acertos ?? 0
    } else {
      agrupado.set(r.subject_id, {
        subject_id: r.subject_id,
        nome: subjectMap[r.subject_id] ?? "Matéria desconhecida",
        total: r.total ?? 0,
        acertos: r.acertos ?? 0,
      })
    }
  }

  const desempenhoPorMateria = Array.from(agrupado.values())
    .map((r) => ({
      ...r,
      taxa_acerto: r.total > 0 ? parseFloat(((r.acertos / r.total) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => a.taxa_acerto - b.taxa_acerto)

  // 6. Evolução do desempenho
  const { data: historicoSimulados, error: historicoError } = await supabase
    .from("simulados")
    .select("created_at, percentual")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(20)

  if (historicoError) {
    console.error("[dashboard] Erro histórico:", historicoError.message)
  }

  const evolucao = (historicoSimulados ?? []).map((s) => ({
    date: new Date(s.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    nota: parseFloat(Number(s.percentual).toFixed(1)),
  }))

  return NextResponse.json({
    resumo: { totalRespondidas, totalAcertos, taxaGeralAcerto },
    ultimoSimulado: ultimoSimulado ?? null,
    materiasRisco,
    desempenhoPorMateria,
    evolucao,
  }, { status: 200 })
}