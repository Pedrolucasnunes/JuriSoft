"use client"

import { toast } from "sonner"
import { SkeletonDashboard } from "@/components/ui/skeleton-cards"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, TrendingDown, Target, FileText, CheckCircle2, AlertTriangle, ArrowRight, List } from "lucide-react"
import Link from "next/link"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from "recharts"
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

function DisciplinaRow({ item, index }: { item: DisciplinaItem; index?: number }) {
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
                <span className="text-sm text-foreground truncate max-w-[180px]">{item.nome}</span>
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

  // Dados para o novo componente de disciplinas
  const disciplinas = data?.desempenhoPorMateria ?? []
  const sortedAsc = [...disciplinas].sort((a, b) => Number(a.taxa_acerto) - Number(b.taxa_acerto))
  const sortedDesc = [...disciplinas].sort((a, b) => Number(b.taxa_acerto) - Number(a.taxa_acerto))
  const emRisco = sortedAsc.slice(0, 5)
  const melhores = sortedDesc.slice(0, 5)

  const riskDisciplines = (data?.materiasRisco ?? []).map((m) => ({
    name: m.nome,
    risk: getRiskLevel(Number(m.taxa)),
    percentage: Number(m.taxa),
    trend: Number(m.taxa) >= 50 ? "up" : "down",
  }))

  const metaAcerto = 50
  const taxaGeral = data?.resumo?.taxaGeralAcerto ?? 0
  const numRisco = data?.materiasRisco?.length ?? 0

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

      {/* ── Banner de alerta ── */}
      {numRisco > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
          <p className="text-sm text-foreground">
            {userName ? <><span className="font-semibold">Bom dia, {userName}.</span> </> : ""}
            Você tem <span className="font-semibold text-primary">{numRisco} {numRisco === 1 ? "matéria em risco" : "matérias em risco"}</span>.{" "}
            Que tal um treino rápido de 10 questões agora?
          </p>
          <Button size="sm" className="shrink-0" asChild>
            <Link href="/dashboard/treino">Treinar agora</Link>
          </Button>
        </div>
      )}

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
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Atual</span>
                <span>meta: {metaAcerto}%</span>
              </div>
              <Progress value={taxaGeral} className="h-1.5" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0%</span>
                <span>{metaAcerto}%</span>
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
          <CardContent className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-foreground">{numRisco}</span>
              <p className="mt-1 text-xs text-muted-foreground">Precisam de atenção</p>
            </div>
            {numRisco > 0 && (
              <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" asChild>
                <Link href="/dashboard/treino">
                  Treinar <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Gráficos ── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Evolução do Desempenho */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Desempenho</CardTitle>
            <CardDescription>Sua nota nos simulados ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            {(data?.evolucao?.length ?? 0) === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                Faça mais simulados para ver sua curva de progresso
              </div>
            ) : (data?.evolucao?.length ?? 0) === 1 ? (
              <div className="space-y-2">
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data!.evolucao}>
                      <defs>
                        <linearGradient id="colorNota" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                      <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" domain={[0, 100]} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value: number) => [`${value}%`, "Aproveitamento"]}
                      />
                      <Area type="monotone" dataKey="nota" stroke="var(--chart-1)" strokeWidth={2} fillOpacity={1} fill="url(#colorNota)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-center text-xs text-muted-foreground">1 simulado realizado — continue para ver sua evolução</p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data!.evolucao}>
                    <defs>
                      <linearGradient id="colorNota" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                    <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" domain={[0, 100]} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: number) => [`${value}%`, "Aproveitamento"]}
                    />
                    <Area type="monotone" dataKey="nota" stroke="var(--chart-1)" strokeWidth={2} fillOpacity={1} fill="url(#colorNota)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Taxa de Acerto por Disciplina — novo */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Acerto por Disciplina</CardTitle>
            <CardDescription>Seu desempenho em cada área do conhecimento</CardDescription>
          </CardHeader>
          <CardContent>
            {disciplinas.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                Responda questões para ver seu desempenho por disciplina
              </div>
            ) : (
              <Tabs defaultValue="risco">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="risco" className="flex-1 gap-1.5">
                    <TrendingDown className="h-3.5 w-3.5" />
                    Em risco
                    <Badge variant="secondary" className="ml-1 text-xs px-1.5">{emRisco.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="melhores" className="flex-1 gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Melhores
                    <Badge variant="secondary" className="ml-1 text-xs px-1.5">{melhores.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="todas" className="flex-1 gap-1.5">
                    <List className="h-3.5 w-3.5" />
                    Todas
                    <Badge variant="secondary" className="ml-1 text-xs px-1.5">{disciplinas.length}</Badge>
                  </TabsTrigger>
                </TabsList>

                {/* Em risco */}
                <TabsContent value="risco" className="space-y-4 mt-0">
                  <p className="text-xs text-muted-foreground">As 5 disciplinas com menor aproveitamento — foque aqui primeiro.</p>
                  <div className="space-y-4">
                    {emRisco.map((item, i) => (
                      <DisciplinaRow key={item.subject_id} item={item} index={i} />
                    ))}
                  </div>
                  <Legenda />
                </TabsContent>

                {/* Melhores */}
                <TabsContent value="melhores" className="space-y-4 mt-0">
                  <p className="text-xs text-muted-foreground">As 5 disciplinas com melhor aproveitamento.</p>
                  <div className="space-y-4">
                    {melhores.map((item, i) => (
                      <DisciplinaRow key={item.subject_id} item={item} index={i} />
                    ))}
                  </div>
                  <Legenda />
                </TabsContent>

                {/* Todas */}
                <TabsContent value="todas" className="mt-0">
                  <p className="text-xs text-muted-foreground mb-4">Todas as disciplinas do pior para o melhor aproveitamento.</p>
                  <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                    {sortedAsc.map((item, i) => (
                      <DisciplinaRow key={item.subject_id} item={item} index={i} />
                    ))}
                  </div>
                  <div className="border-t border-border mt-3 pt-3">
                    <Legenda />
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Índice de Risco ── */}
      <Card>
        <CardHeader>
          <CardTitle>Índice de Risco de Reprovação</CardTitle>
          <CardDescription>Disciplinas que precisam de mais atenção para garantir a aprovação</CardDescription>
        </CardHeader>
        <CardContent>
          {riskDisciplines.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma matéria em risco identificada ainda.</p>
          ) : (
            <div className="space-y-4">
              {riskDisciplines.map((discipline) => (
                <div key={discipline.name} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">{discipline.name}</span>
                    <div className="flex items-center gap-2">
                      {getRiskBadge(discipline.risk)}
                      <span className="text-xs text-muted-foreground">{discipline.percentage}% de acerto</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 hidden sm:block">
                      <Progress value={discipline.percentage} className="h-2" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${discipline.trend === "up" ? "text-primary" : "text-destructive"}`}>
                      {discipline.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}