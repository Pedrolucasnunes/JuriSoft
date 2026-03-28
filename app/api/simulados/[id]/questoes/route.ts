import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: simuladoId } = await params

  if (!simuladoId) {
    return NextResponse.json({ error: "simuladoId inválido" }, { status: 400 })
  }

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
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  // ✅ Filtra por user_id para respeitar RLS
  const { data, error } = await supabase
    .from("simulado_attempts")
    .select(`
      id,
      question_id,
      questions (
        id,
        enunciado,
        alternativa_a,
        alternativa_b,
        alternativa_c,
        alternativa_d,
        subject_id,
        topic_id
      )
    `)
    .eq("simulado_id", simuladoId)
    .eq("user_id", user.id)

  if (error) {
    console.error("[questoes] Erro:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Busca nomes das matérias
  const subjectIds = [...new Set(
    data.map((row: any) => row.questions?.subject_id).filter(Boolean)
  )]

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .in("id", subjectIds.length > 0 ? subjectIds : ["null"])

  const subjectMap = Object.fromEntries((subjects ?? []).map(s => [s.id, s.name]))

  const questions = data
    .map((row: any) => ({
      attemptId: row.id,
      ...row.questions,
      subject_name: subjectMap[row.questions?.subject_id] ?? "Desconhecida",
      topic_name: "",
    }))
    .filter((q: any) => q.id)

  return NextResponse.json({ questions }, { status: 200 })
}