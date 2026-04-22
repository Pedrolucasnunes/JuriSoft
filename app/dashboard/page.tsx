"use client"

import { toast } from "sonner"
import { SkeletonDashboard } from "@/components/ui/skeleton-cards"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingDown, Target, FileText, CheckCircle2, AlertTriangle, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

// ── Helpers taxa de acerto ───────────────────────────────────────
function getBarColor(taxa: number): string {
  if (taxa < 40) return "bg-destructive"
  if (taxa < 70) return "bg-yellow-500"
  return "bg-primary"
}

function getTextColor(taxa: number): string {
  if (taxa < 40) return "text-destructive"
  if (taxa < 70) return "text-yellow-500"
  return "text-primary"
}

const getRiskLevel = (taxa: number): "alto" | "médio" | "baixo" => {
  if (taxa < 55) return "alto"
  if (taxa < 70) return "médio"
  return "baixo"
}

function getRiskBadge(risk: string) {
  switch (risk) {
    case "alto": return <Badge variant="destructive">Alto risco</Badge>
    case "médio": return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Médio risco</Badge>
    case "baixo": return <Badge className="bg-primary/10 text-primary border-primary/20">Baixo risco</Badge>
    default: return null
  }
}

// ── Legenda de cores ─────────────────────────────────────────────
function Legenda() {
  return (
    <div className="flex gap-3 pt-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive inline-block" /> Abaixo de 40%</span>
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-500 inline-block" /> 40–70%</span>
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary inline-block" /> Acima de 70%</span>
    </div>
  )
}

// ── Linha de disciplina ──────────────────────────────────────────
interface DisciplinaItem {
  nome: string
  taxa_acerto: number
}

function DisciplinaRow({ item, index, showBadge }: { item: DisciplinaItem; index?: number; showBadge?: boolean }) {
  const taxa = Number(item.taxa_acerto)
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-1.5 cursor-default">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {index !== undefined && (
                  <span className="text-xs text-muted-foreground w-4 shrink-0">{index + 1}.</span>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-foreground truncate max-w-[180px]">{item.nome}</span>
                  {showBadge && (
                    <div className="mt-0.5">{getRiskBadge(getRiskLevel(taxa))}</div>
                  )}
                </div>
              </div>
              <span className={`text-sm font-semibold shrink-0 ${getTextColor(taxa)}`}>
                {taxa.toFixed(0)}%
              </span>
            </div>

            {/* bg-muted/50 no fundo — sem competir com a cor do progresso */}
            <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getBarColor(taxa)}`}
                style={{ width: `${Math.min(taxa, 100)}%` }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-medium">{item.nome}</p>
          <p className="text-xs text-muted-foreground">{taxa.toFixed(1)}% de acerto</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
// ── Interfaces ───────────────────────────────────────────────────
interface DashboardData {
  resumo: { totalRespondidas: number; totalAcertos: number; taxaGeralAcerto: number }
  ultimoSimulado: { id: string; acertos: number; erros: number; percentual: number; numero_questoes: number; titulo: string; created_at: string } | null
  materiasRisco: { subject_id: string; nome: string; taxa: number }[]
  desempenhoPorMateria: { subject_id: string; nome: string; total: number; acertos: number; taxa_acerto: number }[]
  evolucao: { date: string; nota: number }[]
  actionCards: {
    proximaAcao:     { subject: string; horario: string | null } | null
    proximoSimulado: { date: string; time: string; numero: number } | null
    insightMateria:  { subject: string; taxa: number; diasSemTreino: number | null } | null
  }
}

function getSaudacao(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return "Bom dia"
  if (h >= 12 && h < 18) return "Boa tarde"
  return "Boa noite"
}

// ── Page ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setError("Usuário não autenticado"); setLoading(false); return }

        const firstName = user.user_metadata?.full_name?.split(" ")[0]
          ?? user.user_metadata?.name?.split(" ")[0]
          ?? user.email?.split("@")[0]
          ?? ""
        setUserName(firstName)

        const res = await fetch(`/api/dashboard`)
        const json = await res.json()

        if (!res.ok) {
          toast.error("Erro ao carregar dashboard")
          setError(json.error ?? "Erro ao carregar dashboard")
          setLoading(false)
          return
        }

        setData(json)
      } catch (err) {
        toast.error("Erro inesperado ao carregar dados")
        setError("Erro inesperado ao carregar dados")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <SkeletonDashboard />
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  // Helpers para os action cards
  const DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  function fmtSimDate(dateStr: string, time: string) {
    const [y, m, d] = dateStr.split("-").map(Number)
    return `${DAYS_SHORT[new Date(y, m - 1, d).getDay()]} · ${time}`
  }
  function insightTitle(subject: string, dias: number | null) {
    if (dias === null) return `Comece a treinar ${subject}`
    if (dias >= 7)     return `Retome ${subject}`
    return                    `Intensifique ${subject}`
  }
  function insightDesc(subject: string, taxa: number, dias: number | null) {
    if (dias === null) return `Você nunca praticou ${subject} no treino avulso. Com ${taxa}% de acerto em simulados, é uma prioridade.`
    if (dias >= 7)     return `Você está ${dias} dias sem praticar ${subject}. Com ${taxa}% de acerto, precisa de atenção regular.`
    return                    `${subject} ainda está com ${taxa}% de acerto. Continue o ritmo de treino para subir a nota.`
  }

  const ac   = data?.actionCards
  const acão = ac?.proximaAcao
  const sim  = ac?.proximoSimulado
  const ins  = ac?.insightMateria

  // Usa a mesma fonte que o card de Recomendação: materias_risco VIEW (já ordenada e limitada a 5 pela API)
  // Isso garante que a disciplina sugerida no insight sempre aparece na lista abaixo.
  const emRisco = (data?.materiasRisco ?? []).map(m => ({ ...m, taxa_acerto: m.taxa }))

  const metaAcerto = 60
  const taxaGeral = data?.resumo?.taxaGeralAcerto ?? 0
  const numRisco = data?.materiasRisco?.length ?? 0
  const isNewUser = !data?.ultimoSimulado && (data?.resumo?.totalRespondidas ?? 0) === 0

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Acompanhe seu progresso e desempenho</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/simulados">
            Fazer simulado <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* ── Banner: onboarding ou alerta de risco ── */}
      {isNewUser ? (
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div>
            <p className="font-semibold text-foreground">
              {userName ? `${getSaudacao()}, ${userName}! ` : ""}Bem-vindo ao AprovaOAB.
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Siga estes 3 passos para começar seu estudo de forma inteligente.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <div>
                <p className="text-sm font-medium text-foreground">Faça um simulado</p>
                <p className="text-xs text-muted-foreground mt-0.5">Identifica seu nível atual e as disciplinas críticas.</p>
                <Link href="/dashboard/simulados" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  Iniciar agora <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border p-3 opacity-60">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">2</span>
              <div>
                <p className="text-sm font-medium text-foreground">Gere sua agenda</p>
                <p className="text-xs text-muted-foreground mt-0.5">A IA monta um calendário de estudos personalizado.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border p-3 opacity-60">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">3</span>
              <div>
                <p className="text-sm font-medium text-foreground">Treine estrategicamente</p>
                <p className="text-xs text-muted-foreground mt-0.5">Questões priorizadas pelo seu ponto fraco.</p>
              </div>
            </div>
          </div>
        </div>
      ) : numRisco > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
          <p className="text-sm text-foreground">
            {userName ? <><span className="font-semibold">{getSaudacao()}, {userName}.</span> </> : ""}
            Você tem <span className="font-semibold text-primary">{numRisco} {numRisco === 1 ? "matéria em risco" : "matérias em risco"}</span>.{" "}
            Que tal um treino rápido de 10 questões agora?
          </p>
          <Button size="sm" className="shrink-0" asChild>
            <Link href="/dashboard/treino">Treinar agora</Link>
          </Button>
        </div>
      ) : null}

      {/* ── Stats cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Último Simulado */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Último simulado</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-foreground">
              {data?.ultimoSimulado ? `${data.ultimoSimulado.acertos}/${data.ultimoSimulado.numero_questoes}` : "—"}
            </span>
            {data?.ultimoSimulado && (
              <p className={`mt-1 text-xs font-medium ${data.ultimoSimulado.percentual < 40 ? "text-destructive" : data.ultimoSimulado.percentual < 70 ? "text-yellow-500" : "text-primary"}`}>
                {data.ultimoSimulado.percentual}% de acerto
              </p>
            )}
            {!data?.ultimoSimulado && (
              <p className="mt-1 text-xs text-muted-foreground">Nenhum simulado ainda</p>
            )}
          </CardContent>
        </Card>

        {/* Taxa de Acerto Geral */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de acerto geral</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-foreground">{taxaGeral}%</span>
            <div className="mt-2 space-y-1">
              <div className="relative">
                <Progress value={taxaGeral} className="h-2" />
                {/* Marcador da meta — linha vertical em exatamente metaAcerto% da largura */}
                <div
                  className="absolute top-0 h-full w-px bg-foreground/50"
                  style={{ left: `${metaAcerto}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0%</span>
                <span>meta: {metaAcerto}%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questões Resolvidas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Questões resolvidas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-foreground">
              {data?.resumo?.totalRespondidas?.toLocaleString("pt-BR") ?? "0"}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>

        {/* Matérias em Risco */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Matérias em risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-foreground">{numRisco}</span>
            <p className="mt-1 text-xs text-muted-foreground">Precisam de atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Smart Action Cards ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Card 1 — Próxima ação */}
        <Card className="flex flex-col">
          <CardContent className="pt-5 pb-4 flex flex-col h-full gap-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Próxima ação
              </span>
              <span className="text-xs text-muted-foreground">
                {acão?.horario ? `Hoje · ${acão.horario}` : "Hoje"}
              </span>
            </div>
            {acão ? (
              <div>
                <h3 className="text-base font-bold text-foreground">Treino de {acão.subject}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  10 questões adaptativas priorizando sua matéria mais crítica.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma matéria em risco identificada.</p>
            )}
            <div className="mt-auto space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                <Clock className="h-3 w-3" />
                <span>18 min</span>
                <span className="text-border">·</span>
                <span>10 questões</span>
              </div>
              <Link href="/dashboard/treino" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                Iniciar treino <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 — Simulado */}
        <Card className="flex flex-col">
          <CardContent className="pt-5 pb-4 flex flex-col h-full gap-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-500">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                Simulado
              </span>
              <span className="text-xs text-muted-foreground">
                {sim ? fmtSimDate(sim.date, sim.time) : "—"}
              </span>
            </div>
            {sim ? (
              <div>
                <h3 className="text-base font-bold text-foreground">Simulado completo {sim.numero}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  80 questões · 1ª fase OAB. Replica a estrutura oficial. Tempo: 5h.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum simulado agendado. Gere sua agenda inteligente.</p>
            )}
            <div className="mt-auto space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                <Clock className="h-3 w-3" />
                <span>5 horas</span>
                <span className="text-border">·</span>
                <span>80 questões</span>
              </div>
              <Link href={sim ? "/dashboard/simulados" : "/dashboard/calendario"} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                {sim ? "Iniciar simulado" : "Ir para agenda"} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 — IA sugere */}
        <Card className="flex flex-col">
          <CardContent className="pt-5 pb-4 flex flex-col h-full gap-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                Recomendação
              </span>
              <span className="text-xs text-muted-foreground">Baseado no seu histórico</span>
            </div>
            {ins ? (
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {insightTitle(ins.subject, ins.diasSemTreino)}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {insightDesc(ins.subject, ins.taxa, ins.diasSemTreino)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma sugestão disponível ainda.</p>
            )}
            <div className="mt-auto space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                {ins ? (
                  <>
                    <span>Acerto: {ins.taxa}%</span>
                    <span className="text-border">·</span>
                    <span>{ins.diasSemTreino === null ? "Sem histórico de treino" : ins.diasSemTreino === 0 ? "Treinado hoje" : `${ins.diasSemTreino}d sem treinar`}</span>
                  </>
                ) : (
                  <span>Faça simulados para gerar insights</span>
                )}
              </div>
              <Link href="/dashboard/treino" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                Aplicar sugestão <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Disciplinas em risco ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Disciplinas em risco
            </CardTitle>
          </div>
          <Link href="/dashboard/desempenho" className="text-xs text-primary hover:underline flex items-center gap-1">
            Ver análise completa <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {emRisco.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Faça seu primeiro simulado para ver seu desempenho por disciplina
            </p>
          ) : (
            <div className="space-y-4">
              {emRisco.map((item, i) => (
                <DisciplinaRow key={item.subject_id} item={item} index={i} showBadge />
              ))}
              <Legenda />
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}