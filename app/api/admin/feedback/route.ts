import { requireAdmin } from "@/lib/auth-server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { NextResponse } from "next/server"

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const { data, error: dbError } = await supabaseAdmin
    .from("feedback")
    .select("id, user_id, type, message, page, created_at")
    .order("created_at", { ascending: false })
    .limit(200)

  if (dbError) {
    console.error("[admin/feedback] Erro ao buscar feedbacks:", dbError.message)
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  const totais = {
    total: data?.length ?? 0,
    bug: data?.filter((f) => f.type === "bug").length ?? 0,
    sugestao: data?.filter((f) => f.type === "sugestao").length ?? 0,
    elogio: data?.filter((f) => f.type === "elogio").length ?? 0,
  }

  return NextResponse.json({ feedbacks: data ?? [], totais })
}
