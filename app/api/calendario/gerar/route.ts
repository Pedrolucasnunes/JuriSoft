import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { gerarEventos } from "@/lib/services/agenda"

export async function POST(req: NextRequest) {
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

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const userId = user.id

  // 1. Busca desempenho por matéria
  const { data: desempenhoRaw } = await supabase
    .from("desempenho_materia")
    .select("subject_id, acertos, total")
    .eq("user_id", userId)

  // 2. Busca nomes das matérias
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")

  const subjectMap = Object.fromEntries(
    (subjects ?? []).map((s) => [s.id, s.name])
  )

  // 3. Agrupa por subject_id e calcula taxa
  const grouped = new Map<string, { acertos: number; total: number }>()

  for (const r of desempenhoRaw ?? []) {
    const existing = grouped.get(r.subject_id)
    if (existing) {
      existing.acertos += r.acertos ?? 0
      existing.total   += r.total   ?? 0
    } else {
      grouped.set(r.subject_id, {
        acertos: r.acertos ?? 0,
        total:   r.total   ?? 0,
      })
    }
  }

  let desempenho = Array.from(grouped.entries()).map(([subject_id, { acertos, total }]) => ({
    subject_id,
    nome:       subjectMap[subject_id] ?? "Matéria",
    taxa_acerto: total > 0
      ? parseFloat(((acertos / total) * 100).toFixed(2))
      : 0,
  }))

  // 4. Fallback: sem histórico → usa todas as matérias como médias (50%)
  if (desempenho.length === 0 && subjects && subjects.length > 0) {
    desempenho = subjects.map((s) => ({
      subject_id:  s.id,
      nome:        s.name,
      taxa_acerto: 50,
    }))
  }

  // 5. Busca disponibilidade do usuário
  const { data: availabilityRaw } = await supabase
    .from("user_availability")
    .select("day_of_week, start_time, end_time")
    .eq("user_id", userId)

  const availability = (availabilityRaw ?? []).map((a) => ({
    day_of_week: a.day_of_week,
    start_time:  String(a.start_time).slice(0, 5),
    end_time:    String(a.end_time).slice(0, 5),
  }))

  // 6. Remove eventos automáticos existentes dos próximos 7 dias
  const today   = new Date()
  const endDate = new Date()
  endDate.setDate(today.getDate() + 6)

  const todayStr   = today.toISOString().split("T")[0]
  const endDateStr = endDate.toISOString().split("T")[0]

  await supabase
    .from("calendar_events")
    .delete()
    .eq("user_id", userId)
    .eq("is_auto", true)
    .gte("date", todayStr)
    .lte("date", endDateStr)

  // 7. Gera e insere novos eventos (com disponibilidade)
  const events = gerarEventos(userId, desempenho, availability)

  const { data: inserted, error: insertError } = await supabase
    .from("calendar_events")
    .insert(events)
    .select()

  if (insertError) {
    console.error("[calendario/gerar] Erro ao inserir:", insertError.message)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  console.log(`[calendario/gerar] ${inserted?.length ?? 0} eventos criados para userId=${userId}`)

  return NextResponse.json({
    events: inserted ?? [],
    count:  inserted?.length ?? 0,
    stats: {
      criticas: desempenho.filter((d) => d.taxa_acerto < 40).length,
      medias:   desempenho.filter((d) => d.taxa_acerto >= 40 && d.taxa_acerto <= 70).length,
      boas:     desempenho.filter((d) => d.taxa_acerto > 70).length,
    },
  })
}
