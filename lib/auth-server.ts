import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "./supabase-admin"

type AdminAuthResult =
  | { user: { id: string }; error: null }
  | { user: null; error: NextResponse }

export async function requireAdmin(): Promise<AdminAuthResult> {
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
    return { user: null, error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) }
  }

  const { data } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (data?.role !== "admin") {
    return { user: null, error: NextResponse.json({ error: "Acesso negado" }, { status: 403 }) }
  }

  return { user, error: null }
}
