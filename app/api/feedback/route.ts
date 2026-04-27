import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-server"

export async function POST(req: NextRequest) {
  const { user, supabase, error } = await requireUser()
  if (error) return error

  let body: { type?: string; message?: string; page?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  const { type, message, page } = body

  if (!type || !message?.trim()) {
    return NextResponse.json({ error: "type e message são obrigatórios" }, { status: 400 })
  }

  const VALID_TYPES = ["bug", "sugestao", "elogio"]
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    type,
    message: message.trim(),
    page: page ?? null,
  })

  if (error) {
    console.error("[feedback] Erro ao salvar:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
