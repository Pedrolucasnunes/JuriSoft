import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-server"

export async function GET() {
  const { user, supabase, error } = await requireUser()
  if (error) return NextResponse.json({ connected: false })

  const { data } = await supabase
    .from("google_calendar_tokens")
    .select("user_id")
    .eq("user_id", user.id)
    .single()

  return NextResponse.json({ connected: !!data })
}
