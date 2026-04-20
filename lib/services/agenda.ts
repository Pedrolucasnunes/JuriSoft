// lib/services/agenda.ts
// Lógica de geração da Agenda Inteligente

export interface AgendaEvent {
  user_id: string
  title: string
  type: "study" | "simulado" | "revisao" | "prova"
  date: string   // YYYY-MM-DD
  time: string   // HH:MM
  is_auto: boolean
  subject: string | null
  reason: string | null
}

interface DisciplinaClassificada {
  subject_id: string
  nome: string
  taxa: number
  categoria: "critica" | "media" | "boa"
}

// ─────────────────────────────────────────────────────────────────────────────
// Classifica disciplinas por taxa de acerto
//   < 40%  → crítica   (60% do tempo de estudo)
//  40–70%  → média     (30% do tempo de estudo)
//   > 70%  → boa       (10% do tempo de estudo)
// ─────────────────────────────────────────────────────────────────────────────
function classificar(
  desempenho: { subject_id: string; nome: string; taxa_acerto: number }[]
) {
  const criticas: DisciplinaClassificada[] = []
  const medias:   DisciplinaClassificada[] = []
  const boas:     DisciplinaClassificada[] = []

  for (const d of desempenho) {
    const item: DisciplinaClassificada = {
      subject_id: d.subject_id,
      nome:       d.nome,
      taxa:       d.taxa_acerto,
      categoria:  d.taxa_acerto < 40 ? "critica" : d.taxa_acerto <= 70 ? "media" : "boa",
    }
    if      (item.categoria === "critica") criticas.push(item)
    else if (item.categoria === "media")   medias.push(item)
    else                                   boas.push(item)
  }

  // Pior desempenho primeiro
  criticas.sort((a, b) => a.taxa - b.taxa)
  medias.sort((a, b)   => a.taxa - b.taxa)

  return { criticas, medias, boas }
}

// ─────────────────────────────────────────────────────────────────────────────
// Função principal — gera eventos para os próximos 7 dias
// ─────────────────────────────────────────────────────────────────────────────
export function gerarEventos(
  userId:     string,
  desempenho: { subject_id: string; nome: string; taxa_acerto: number }[]
): AgendaEvent[] {
  const { criticas, medias, boas } = classificar(desempenho)

  // Índices de rotação por categoria
  let cIdx = 0
  let mIdx = 0
  let bIdx = 0

  const pickCritical = (): DisciplinaClassificada | null =>
    criticas.length ? criticas[cIdx++ % criticas.length] : null

  const pickMedium = (): DisciplinaClassificada | null =>
    medias.length   ? medias[mIdx++ % medias.length]     : null

  const pickGood = (): DisciplinaClassificada | null =>
    boas.length     ? boas[bIdx++ % boas.length]         : null

  // Sequência determinística ponderada: 60% crítica | 30% média | 10% boa
  const weights: ("c" | "m" | "g")[] = [
    "c", "c", "c", "m", "c", "c", "m", "c", "m", "g",
    "c", "c", "m", "c", "c", "m", "c", "c", "m", "g",
  ]
  let wIdx = 0

  const pickWeighted = (): DisciplinaClassificada | null => {
    const w = weights[wIdx++ % weights.length]
    if (w === "c") return pickCritical() ?? pickMedium() ?? pickGood()
    if (w === "m") return pickMedium()   ?? pickCritical() ?? pickGood()
    return           pickGood()          ?? pickMedium()   ?? pickCritical()
  }

  const reasonFor = (d: DisciplinaClassificada): string => {
    if (d.categoria === "critica")
      return `Baixo desempenho: ${d.taxa.toFixed(0)}% de acerto. Prioridade máxima para subir a nota.`
    if (d.categoria === "media")
      return `Desempenho intermediário: ${d.taxa.toFixed(0)}% de acerto — reforço necessário para a aprovação.`
    return `Bom desempenho: ${d.taxa.toFixed(0)}% de acerto — manutenção para não perder o ritmo.`
  }

  const dateStr = (offsetDays: number): string => {
    const d = new Date()
    d.setDate(d.getDate() + offsetDays)
    return d.toISOString().split("T")[0]
  }

  const events: AgendaEvent[] = []

  for (let day = 0; day < 7; day++) {
    const date = dateStr(day)

    // ── Dia 4 (index 3): Simulado completo ──────────────────────────
    if (day === 3) {
      events.push({
        user_id: userId,
        title:   "Simulado Completo OAB",
        type:    "simulado",
        date,
        time:    "09:00",
        is_auto: true,
        subject: null,
        reason:  "Simulado semanal para medir seu progresso e simular as condições reais da prova.",
      })
      continue
    }

    // ── Dia 7 (index 6): Treino + Revisão Geral ──────────────────────
    if (day === 6) {
      const d = pickCritical() ?? pickMedium()
      if (d) {
        events.push({
          user_id: userId,
          title:   `Treino: ${d.nome}`,
          type:    "study",
          date,
          time:    "09:00",
          is_auto: true,
          subject: d.nome,
          reason:  reasonFor(d),
        })
      }
      events.push({
        user_id: userId,
        title:   "Revisão Geral da Semana",
        type:    "revisao",
        date,
        time:    "19:00",
        is_auto: true,
        subject: null,
        reason:  "Revisão de todos os conteúdos estudados na semana para consolidar o aprendizado.",
      })
      continue
    }

    // ── Dias regulares: manhã + noite ────────────────────────────────
    const morning = pickWeighted()
    if (morning) {
      events.push({
        user_id: userId,
        title:   `Treino: ${morning.nome}`,
        type:    "study",
        date,
        time:    "08:00",
        is_auto: true,
        subject: morning.nome,
        reason:  reasonFor(morning),
      })
    }

    if (day % 2 === 1) {
      // Dias ímpares → revisão do bloco
      const ultimas = events
        .filter((e) => e.type === "study" && e.subject)
        .slice(-2)
        .map((e) => e.subject)
        .join(" e ")

      events.push({
        user_id: userId,
        title:   "Revisão do Bloco",
        type:    "revisao",
        date,
        time:    "19:00",
        is_auto: true,
        subject: null,
        reason:  `Revisão de ${ultimas || "conteúdos recentes"} para fixar o que foi aprendido.`,
      })
    } else {
      // Dias pares → mais um treino
      const evening = pickWeighted()
      if (evening) {
        events.push({
          user_id: userId,
          title:   `Treino: ${evening.nome}`,
          type:    "study",
          date,
          time:    "19:00",
          is_auto: true,
          subject: evening.nome,
          reason:  reasonFor(evening),
        })
      }
    }
  }

  return events
}
