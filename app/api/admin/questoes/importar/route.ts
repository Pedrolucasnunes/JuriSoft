import { supabaseAdmin } from "@/lib/supabase-admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { questoes } = body

  if (!questoes || !Array.isArray(questoes) || questoes.length === 0) {
    return NextResponse.json({ error: "Nenhuma questão para importar" }, { status: 400 })
  }

  const validas = questoes.filter((q: any) =>
    q.enunciado && q.alternativa_a && q.alternativa_b &&
    q.alternativa_c && q.alternativa_d &&
    q.resposta_correta && q.subject_id
  )

  if (validas.length === 0) {
    return NextResponse.json({ error: "Nenhuma questão válida encontrada" }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from("questions")
    .insert(validas.map((q: any) => ({
      enunciado: q.enunciado,
      alternativa_a: q.alternativa_a,
      alternativa_b: q.alternativa_b,
      alternativa_c: q.alternativa_c,
      alternativa_d: q.alternativa_d,
      resposta_correta: String(q.resposta_correta).toUpperCase(),
      dificuldade: q.dificuldade ?? "médio",
      banca: q.banca ?? "",
      ano: q.ano ? Number(q.ano) : null,
      subject_id: q.subject_id,
      topic_id: q.topic_id ?? null,
      explicacao: q.explicacao ?? "",
    })))

  if (error) {
    console.error("[importar] Erro:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ importadas: validas.length }, { status: 201 })
}