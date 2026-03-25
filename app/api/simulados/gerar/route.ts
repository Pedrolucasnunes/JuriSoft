import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  let userId: string | undefined

  try {
    const body = await req.json()
    userId = body?.userId
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  if (!userId) {
    return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 })
  }

  // 1. Busca pool de questões
  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select("id")
    .limit(500)

  if (qError) {
    console.error("Erro ao buscar questões:", qError.message)
    return NextResponse.json({ error: qError.message }, { status: 500 })
  }

  if (!questions || questions.length < 80) {
    return NextResponse.json(
      { error: `Questões insuficientes: ${questions?.length ?? 0} encontradas` },
      { status: 500 }
    )
  }

  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 80)

  // 2. Cria o simulado
  const { data: simulado, error: sError } = await supabase
    .from("simulados")
    .insert({
      user_id: userId,
      numero_questoes: 80,
      titulo: "Simulado OAB",
      tipo: "oab_completo",
    })
    .select("id")
    .single()

  if (sError || !simulado) {
    console.error("Erro ao criar simulado:", sError?.message)
    return NextResponse.json({ error: sError?.message }, { status: 500 })
  }

  // 3. Cria os vínculos em simulado_attempts (1 por questão)
  const attempts = shuffled.map((q) => ({
    user_id: userId,
    simulado_id: simulado.id,
    question_id: q.id,
  }))

  const { error: aError } = await supabase
    .from("simulado_attempts")
    .insert(attempts)

  if (aError) {
    console.error("Erro ao criar attempts:", aError.message)
    // Rollback do simulado
    await supabase.from("simulados").delete().eq("id", simulado.id)
    return NextResponse.json({ error: aError.message }, { status: 500 })
  }

  return NextResponse.json({ simuladoId: simulado.id }, { status: 201 })
}