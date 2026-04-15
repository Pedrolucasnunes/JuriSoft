import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
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

  // Busca simulado (precisa ser do usuário e já finalizado)
  const { data: simulado, error: sError } = await supabase
    .from("simulados")
    .select("id, acertos, erros, percentual, numero_questoes")
    .eq("id", simuladoId)
    .eq("user_id", user.id)
    .not("acertos", "is", null)
    .single()

  if (sError || !simulado) {
    return NextResponse.json({ error: "Simulado não encontrado ou ainda em andamento" }, { status: 404 })
  }

  // Busca attempts
  const { data: attempts } = await supabase
    .from("simulado_attempts")
    .select("id, question_id")
    .eq("simulado_id", simuladoId)
    .eq("user_id", user.id)

  if (!attempts || attempts.length === 0) {
    return NextResponse.json({ error: "Nenhuma questão encontrada" }, { status: 404 })
  }

  const attemptIds = attempts.map((a) => a.id)

  // Busca respostas
  const { data: respostas } = await supabase
    .from("simulado_respostas")
    .select("attempt_id, question_id, resposta_usuario, acertou")
    .in("attempt_id", attemptIds)

  if (!respostas || respostas.length === 0) {
    return NextResponse.json({ error: "Nenhuma resposta encontrada" }, { status: 404 })
  }

  const questionIds = respostas.map((r) => r.question_id)

  const { data: questions } = await supabase
    .from("questions")
    .select("id, enunciado, resposta_correta, subject_id")
    .in("id", questionIds)

  const subjectIds = [...new Set((questions ?? []).map((q) => q.subject_id).filter(Boolean))]
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .in("id", subjectIds.length > 0 ? subjectIds : ["null"])

  const subjectMap = Object.fromEntries((subjects ?? []).map((s) => [s.id, s.name]))
  const questionMap = Object.fromEntries((questions ?? []).map((q) => [q.id, q]))

  const gabarito = respostas.map((r) => {
    const q = questionMap[r.question_id]
    return {
      question_id: r.question_id,
      enunciado: q?.enunciado ?? "",
      resposta_usuario: r.resposta_usuario,
      resposta_correta: q?.resposta_correta ?? "",
      acertou: r.acertou,
      subject_name: subjectMap[q?.subject_id] ?? "Desconhecida",
    }
  })

  return NextResponse.json({
    acertos: simulado.acertos,
    erros: simulado.erros,
    percentual: simulado.percentual,
    total: respostas.length,
    gabarito,
  })
}
