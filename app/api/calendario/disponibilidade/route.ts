import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-server"

export async function GET() {
  const { user, supabase, error } = await requireUser()
  if (error) return error

  const { data, error: dbError } = await supabase
    .from("user_availability")
    .select("day_of_week, start_time, end_time")
    .eq("user_id", user.id)
    .order("day_of_week", { ascending: true })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ availability: data ?? [] })
}

export async function POST(req: NextRequest) {
  const { user, supabase, error } = await requireUser()
  if (error) return error

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
