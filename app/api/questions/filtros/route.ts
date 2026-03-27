import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
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

  // ✅ Verifica autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("[filtros] Não autenticado:", authError?.message)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const [
    { data: subjects },
    { data: dificuldades },
    { data: bancas },
  ] = await Promise.all([
    supabase.from("subjects").select("id, name").order("name"),
    supabase.from("questions").select("dificuldade").not("dificuldade", "is", null),
    supabase.from("questions").select("banca").not("banca", "is", null),
  ])

  const dificuldadesUnicas = [...new Set((dificuldades ?? []).map((d) => d.dificuldade))].sort()
  const bancasUnicas = [...new Set((bancas ?? []).map((b) => b.banca))].sort()

  return NextResponse.json({
    subjects: subjects ?? [],
    dificuldades: dificuldadesUnicas,
    bancas: bancasUnicas,
  }, { status: 200 })
}