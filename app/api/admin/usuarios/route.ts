import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const busca = searchParams.get("busca") ?? ""
  const limit = 20
  const offset = (page - 1) * limit

  // Busca da tabela users (pública)
  let query = supabase
    .from("users")
    .select("id, role", { count: "exact" })

  query = query.range(offset, offset + limit - 1)

  const { data: users, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Busca stats de cada usuário
  const usersWithStats = await Promise.all(
    (users ?? []).map(async (u) => {
      const [{ count: totalSimulados }, { count: totalQuestoes }] = await Promise.all([
        supabase.from("simulados").select("id", { count: "exact" }).eq("user_id", u.id).gt("acertos", 0),
        supabase.from("question_attempts").select("id", { count: "exact" }).eq("user_id", u.id),
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