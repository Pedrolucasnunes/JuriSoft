import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  const { userId, questionId, simuladoId, resposta } = body

  if (!userId || !questionId || !resposta) {
    return NextResponse.json(
      { error: "userId, questionId e resposta são obrigatórios" },
      { status: 400 }
    )
  }

  const respostaFormatada = String(resposta).toUpperCase().trim()

  if (!["A", "B", "C", "D"].includes(respostaFormatada)) {
    return NextResponse.json(
      { error: "Resposta inválida. Use A, B, C ou D" },
      { status: 400 }
    )
  }

  // Busca o gabarito
  const { data: question, error: qError } = await supabase
    .from("questions")
    .select("resposta_correta")
    .eq("id", questionId)
    .single()

  if (qError || !question) {
    return NextResponse.json({ error: "Questão não encontrada" }, { status: 404 })
  }

  const acertou = respostaFormatada === question.resposta_correta.toUpperCase().trim()

  // Se tem simuladoId — fluxo do simulado (salva em simulado_respostas)
  if (simuladoId) {
    const { data: attempt, error: atError } = await supabase
      .from("simulado_attempts")
      .select("id")
      .eq("simulado_id", simuladoId)
      .eq("question_id", questionId)
      .single()

    if (atError || !attempt) {
      return NextResponse.json(
        { error: "Questão não pertence a este simulado" },
        { status: 404 }
      )
    }

    const { error: rError } = await supabase
      .from("simulado_respostas")
      .insert({
        attempt_id: attempt.id,
        question_id: questionId,
        resposta_usuario: respostaFormatada,
        acertou,
      })

    if (rError) {
      console.error("Erro ao salvar resposta:", rError.message)
      return NextResponse.json({ error: rError.message }, { status: 500 })
    }
  } else {
    // Treino avulso ou banco de questões — salva em question_attempts
    const { error: qaError } = await supabase
      .from("question_attempts")
      .insert({
        user_id: userId,
        question_id: questionId,
        resposta_usuario: respostaFormatada,
        acertou,
      })

    if (qaError) {
      console.error("Erro ao salvar treino:", qaError.message)
      return NextResponse.json({ error: qaError.message }, { status: 500 })
    }
  }

  return NextResponse.json(
    { acertou, resposta_correta: question.resposta_correta },
    { status: 200 }
  )
}