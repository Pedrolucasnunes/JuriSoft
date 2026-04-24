import { requireAdmin } from "@/lib/auth-server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const limit = 20
  const offset = (page - 1) * limit

  const { data: users, error: dbError, count } = await supabaseAdmin
    .from("users")
    .select("id, role", { count: "exact" })
    .range(offset, offset + limit - 1)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  const usersWithStats = await Promise.all(
    (users ?? []).map(async (u) => {
      const [{ count: totalSimulados }, { count: totalQuestoes }] = await Promise.all([
        supabaseAdmin.from("simulados").select("id", { count: "exact" }).eq("user_id", u.id).gt("acertos", 0),
        supabaseAdmin.from("question_attempts").select("id", { count: "exact" }).eq("user_id", u.id),
      ])
      return {
        id: u.id,
        role: u.role,
        simulados: totalSimulados ?? 0,
        questoes: totalQuestoes ?? 0,
      }
    })
  )

  return NextResponse.json({
    users: usersWithStats,
    pagination: { total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) }
  })
}
