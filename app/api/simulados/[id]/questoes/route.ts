import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: simuladoId } = await params  // ← await aqui

  if (!simuladoId) {
    return NextResponse.json({ error: "simuladoId inválido" }, { status: 400 })
  }

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

  if (error) {
    console.error("Erro ao buscar questões:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const questions = data
    .map((row) => ({
      attemptId: row.id,
      ...(row.questions as object),
    }))
    .filter(Boolean)

  return NextResponse.json({ questions }, { status: 200 })
}