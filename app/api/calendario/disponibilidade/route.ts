import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) =>
          c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
}

// GET — retorna a disponibilidade salva do usuário
export async function GET() {
  const supabase = await getSupabase()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("user_availability")
    .select("day_of_week, start_time, end_time")
    .eq("user_id", user.id)
    .order("day_of_week", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ availability: data ?? [] })
}

// POST — salva / atualiza disponibilidade (upsert completo)
export async function POST(req: NextRequest) {
  const supabase = await getSupabase()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  let body: { availability: { day_of_week: number; start_time: string; end_time: string }[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  const { availability } = body

  if (!Array.isArray(availability)) {
    return NextResponse.json({ error: "Campo 'availability' deve ser um array" }, { status: 400 })
  }

  // Apaga registros antigos do usuário e reinsere
  await supabase.from("user_availability").delete().eq("user_id", user.id)

  if (availability.length > 0) {
    const rows = availability.map((a) => ({
      user_id:     user.id,
      day_of_week: a.day_of_week,
      start_time:  a.start_time,
      end_time:    a.end_time,
    }))

    const { error: insertError } = await supabase
      .from("user_availability")
      .insert(rows)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, saved: availability.length })
}
