import { supabaseAdmin } from "@/lib/supabase-admin"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ isAdmin: false })
  }

  const { data } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", userId)
    .single()

  return NextResponse.json({ isAdmin: data?.role === "admin" })
}