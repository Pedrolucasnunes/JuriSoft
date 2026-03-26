import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
        return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 })
    }

    // 1. Resumo geral via desempenho_materia
    const { data: resumo, error: resumoError } = await supabase
        .from("desempenho_materia")
        .select("total, acertos, taxa_acerto, subject_id")
        .eq("user_id", userId)

    if (resumoError) {
        console.error("Erro resumo:", resumoError.message)
        return NextResponse.json({ error: resumoError.message }, { status: 500 })
    }

    const totalRespondidas = resumo?.reduce((acc, r) => acc + (r.total ?? 0), 0) ?? 0
    const totalAcertos = resumo?.reduce((acc, r) => acc + (r.acertos ?? 0), 0) ?? 0
    const taxaGeralAcerto = totalRespondidas > 0
        ? parseFloat(((totalAcertos / totalRespondidas) * 100).toFixed(2))
        : 0

    // 2. Último simulado
    const { data: ultimoSimulado, error: simError } = await supabase
        .from("simulados")
        .select("id, created_at, acertos, erros, percentual, numero_questoes, titulo")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

    if (simError && simError.code !== "PGRST116") {
        console.error("Erro último simulado:", simError.message)
    }

    // 3. Busca nomes das matérias separadamente
    const { data: subjects } = await supabase
        .from("subjects")
        .select("id, name")

    const subjectMap = Object.fromEntries(
        (subjects ?? []).map((s) => [s.id, s.name])
    )

    // 4. Matérias em risco (sem join)
    const { data: materiasRiscoRaw, error: riscoError } = await supabase
        .from("materias_risco")
        .select("user_id, subject_id, taxa")
        .eq("user_id", userId)
        .order("taxa", { ascending: true })
        .limit(5)

    if (riscoError) {
        console.error("Erro matérias risco:", riscoError.message)
    }

    const materiasRisco = (materiasRiscoRaw ?? []).map((m) => ({
        subject_id: m.subject_id,
        nome: subjectMap[m.subject_id] ?? "Matéria desconhecida",
        taxa: m.taxa,
    }))

    // 5. Desempenho por matéria (sem join)
    const desempenhoPorMateria = (resumo ?? [])
        .map((r) => ({
            subject_id: r.subject_id,
            nome: subjectMap[r.subject_id] ?? "Matéria desconhecida",
            total: r.total,
            acertos: r.acertos,
            taxa_acerto: r.taxa_acerto,
        }))
        .sort((a, b) => Number(a.taxa_acerto) - Number(b.taxa_acerto))

    // 6. Evolução do desempenho — histórico real de simulados
    const { data: historicoSimulados, error: historicoError } = await supabase
        .from("simulados")
        .select("created_at, percentual")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(20)

    if (historicoError) {
        console.error("Erro histórico:", historicoError.message)
    }

    const evolucao = (historicoSimulados ?? []).map((s) => ({
        date: new Date(s.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        nota: parseFloat(Number(s.percentual).toFixed(1)),
    }))

    return NextResponse.json({
        resumo: {
            totalRespondidas,
            totalAcertos,
            taxaGeralAcerto,
        },
        ultimoSimulado: ultimoSimulado ?? null,
        materiasRisco,
        desempenhoPorMateria,
         evolucao,
    }, { status: 200 })
}