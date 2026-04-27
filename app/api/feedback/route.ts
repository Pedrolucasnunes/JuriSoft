import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

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
