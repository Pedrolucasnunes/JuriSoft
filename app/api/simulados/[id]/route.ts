import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: simuladoId } = await params
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

  // Garante que o simulado pertence ao usuário
  const { data: simulado } = await supabase
    .from("simulados")
    .select("id")
    .eq("id", simuladoId)
    .eq("user_id", user.id)
    .single()

  if (!simulado) {
    return NextResponse.json({ error: "Simulado não encontrado" }, { status: 404 })
  }

  // Busca attempts para deletar respostas relacionadas
  const { data: attempts } = await supabase
    .from("simulado_attempts")
    .select("id")
    .eq("simulado_id", simuladoId)

  if (attempts && attempts.length > 0) {
    const attemptIds = attempts.map((a) => a.id)
    await supabase.from("simulado_respostas").delete().in("attempt_id", attemptIds)
  }

  await supabase.from("simulado_attempts").delete().eq("simulado_id", simuladoId)

  const { error: delError } = await supabase
    .from("simulados")
    .delete()
    .eq("id", simuladoId)
    .eq("user_id", user.id)

  if (delError) {
    return NextResponse.json({ error: delError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
