import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-server"

export async function GET() {
  const { supabase, error } = await requireUser()
  if (error) return error

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