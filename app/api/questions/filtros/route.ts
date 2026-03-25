import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  const [
    { data: subjects },
    { data: dificuldades },
    { data: bancas },
  ] = await Promise.all([
    supabase.from("subjects").select("id, name").order("name"),
    supabase.from("questions").select("dificuldade").not("dificuldade", "is", null),
    supabase.from("questions").select("banca").not("banca", "is", null),
  ])

  // Valores únicos de dificuldade e banca
  const dificuldadesUnicas = [...new Set((dificuldades ?? []).map((d) => d.dificuldade))].sort()
  const bancasUnicas = [...new Set((bancas ?? []).map((b) => b.banca))].sort()

  return NextResponse.json({
    subjects: subjects ?? [],
    dificuldades: dificuldadesUnicas,
    bancas: bancasUnicas,
  }, { status: 200 })
}
