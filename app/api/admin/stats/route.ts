import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  // 1. Total de usuários
  const { count: totalUsuarios } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })

  // 2. Total de questões
  const { count: totalQuestoes } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })

  // 3. Total de simulados realizados
  const { count: totalSimulados } = await supabase
    .from("simulados")
    .select("id", { count: "exact", head: true })

  // 4. Média geral de aproveitamento
  const { data: mediaData } = await supabase
    .from("simulados")
    .select("percentual")

  const mediaAproveitamento = mediaData && mediaData.length > 0
    ? parseFloat((mediaData.reduce((acc, s) => acc + Number(s.percentual), 0) / mediaData.length).toFixed(1))
    : 0

  // 5. Questões por disciplina
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")

  const subjectMap = Object.fromEntries((subjects ?? []).map(s => [s.id, s.name]))

  const { data: questoesPorSubject } = await supabase
    .from("questions")
    .select("subject_id")

  const contagemPorSubject = new Map<string, number>()
  for (const q of questoesPorSubject ?? []) {
    if (!q.subject_id) continue
    contagemPorSubject.set(q.subject_id, (contagemPorSubject.get(q.subject_id) ?? 0) + 1)
  }

  const questoesPorDisciplina = Array.from(contagemPorSubject.entries())
    .map(([subject_id, total]) => ({
      name: subjectMap[subject_id] ?? "Desconhecida",
      questoes: total,
    }))
    .sort((a, b) => b.questoes - a.questoes)

  // 6. Simulados por dia (últimos 7 dias)
  const hoje = new Date()
  const seteDiasAtras = new Date(hoje)
  seteDiasAtras.setDate(hoje.getDate() - 6)

  const { data: simuladosRecentes } = await supabase
    .from("simulados")
    .select("created_at")
    .gte("created_at", seteDiasAtras.toISOString())
    .order("created_at", { ascending: true })

  // Agrupa por dia
  const contagemPorDia = new Map<string, number>()
  for (let i = 0; i < 7; i++) {
    const d = new Date(seteDiasAtras)
    d.setDate(seteDiasAtras.getDate() + i)
    const key = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    contagemPorDia.set(key, 0)
  }
  for (const s of simuladosRecentes ?? []) {
    const key = new Date(s.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    if (contagemPorDia.has(key)) {
      contagemPorDia.set(key, (contagemPorDia.get(key) ?? 0) + 1)
    }
  }

  const simuladosPorDia = Array.from(contagemPorDia.entries()).map(([date, total]) => ({
    date,
    total,
  }))

  // 7. Usuários recentes (últimos 5)
  const { data: usuariosRecentes } = await supabase
    .from("users")
    .select("id, role")
    .order("id", { ascending: false })
    .limit(5)

  return NextResponse.json({
    totais: {
      usuarios: totalUsuarios ?? 0,
      questoes: totalQuestoes ?? 0,
      simulados: totalSimulados ?? 0,
      mediaAproveitamento,
    },
    questoesPorDisciplina,
    simuladosPorDia,
    usuariosRecentes: usuariosRecentes ?? [],
  })
}