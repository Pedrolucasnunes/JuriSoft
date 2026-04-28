import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-server"

export async function GET(req: NextRequest) {
  const { user, supabase, error } = await requireUser()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("start")
  const endDate   = searchParams.get("end")

  let query = supabase
    .from("calendar_events")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true })
    .order("time", { ascending: true })

  if (startDate) query = query.gte("date", startDate)
  if (endDate)   query = query.lte("date", endDate)

  const { data, error: dbError } = await query

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ events: data ?? [] })
}
