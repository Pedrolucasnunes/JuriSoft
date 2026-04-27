import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-server"

export async function DELETE() {
  const { user, supabase, error } = await requireUser()
  if (error) return error

  await supabase
    .from("google_calendar_tokens")
    .delete()
    .eq("user_id", user.id)

  return NextResponse.json({ ok: true })
}
