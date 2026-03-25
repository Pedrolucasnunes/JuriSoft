"use client"

import { toast } from "sonner"
import { SkeletonDashboard } from "@/components/ui/skeleton-cards"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Target, FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { supabase } from "@/lib/supabase"

const evolutionData = [
  { date: "Jan", nota: 45 }, { date: "Fev", nota: 52 }, { date: "Mar", nota: 48 },
  { date: "Abr", nota: 58 }, { date: "Mai", nota: 62 }, { date: "Jun", nota: 68 },
]

const getBarColor = (taxa: number) => {
  if (taxa >= 70) return "var(--chart-1)"
  if (taxa >= 55) return "var(--chart-3)"
  return "var(--chart-4)"
}

const getRiskLevel = (taxa: number): "alto" | "médio" | "baixo" => {
  if (taxa < 55) return "alto"
  if (taxa < 70) return "médio"
  return "baixo"
}

function getRiskBadge(risk: string) {
  switch (risk) {
    case "alto": return <Badge variant="destructive">Alto risco</Badge>
    case "médio": return <Badge className="bg-warning text-warning-foreground">Médio risco</Badge>
    case "baixo": return <Badge className="bg-success text-success-foreground">Baixo risco</Badge>
    default: return null
  }
}

interface DashboardData {
  resumo: { totalRespondidas: number; totalAcertos: number; taxaGeralAcerto: number }
  ultimoSimulado: { id: string; acertos: number; erros: number; percentual: number; numero_questoes: number; titulo: string; created_at: string } | null
  materiasRisco: { subject_id: string; nome: string; taxa: number }[]
  desempenhoPorMateria: { subject_id: string; nome: string; total: number; acertos: number; taxa_acerto: number }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setError("Usuário não autenticado")
          setLoading(false)
          return
        }

        const res = await fetch(`/api/dashboard?userId=${user.id}`)
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

  const statsCards = [
    {
      title: "Último Simulado",
      value: data?.ultimoSimulado ? `${data.ultimoSimulado.acertos}/${data.ultimoSimulado.numero_questoes}` : "—",
      description: data?.ultimoSimulado ? `${data.ultimoSimulado.percentual}% de acerto` : "Nenhum simulado ainda",
      icon: FileText, trend: "neutral" as const, trendValue: "",
    },
    {
      title: "Taxa de Acerto Geral",
      value: data?.resumo ? `${data.resumo.taxaGeralAcerto}%` : "—",
      description: "Média geral acumulada",
      icon: Target,
      trend: (data?.resumo?.taxaGeralAcerto ?? 0) >= 70 ? "up" as const : "down" as const,
      trendValue: "",
    },
    {
      title: "Questões Resolvidas",
      value: data?.resumo?.totalRespondidas?.toLocaleString("pt-BR") ?? "0",
      description: "Total acumulado",
      icon: CheckCircle2, trend: "neutral" as const, trendValue: "",
    },
    {
      title: "Matérias em Risco",
      value: String(data?.materiasRisco?.length ?? 0),
      description: "Precisam de atenção",
      icon: AlertTriangle,
      trend: (data?.materiasRisco?.length ?? 0) > 0 ? "down" as const : "up" as const,
      trendValue: "",
    },
  ]

  const disciplineData = (data?.desempenhoPorMateria ?? []).map((d) => ({
    name: d.nome.length > 12 ? d.nome.slice(0, 12) + "…" : d.nome,
    acerto: Number(d.taxa_acerto),
  }))

  const riskDisciplines = (data?.materiasRisco ?? []).map((m) => ({
    name: m.nome,
    risk: getRiskLevel(Number(m.taxa)),
    percentage: Number(m.taxa),
    trend: Number(m.taxa) >= 50 ? "up" : "down",
  }))

  return (
    <div className="space-y-6">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{card.value}</span>
                {card.trendValue && (
                  <span className={`flex items-center text-xs font-medium ${card.trend === "up" ? "text-primary" : card.trend === "down" ? "text-destructive" : "text-muted-foreground"}`}>
                    {card.trend === "up" ? <TrendingUp className="mr-1 h-3 w-3" /> : card.trend === "down" ? <TrendingDown className="mr-1 h-3 w-3" /> : null}
                    {card.trendValue}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Desempenho</CardTitle>
            <CardDescription>Sua nota nos simulados ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData}>
                  <defs>
                    <linearGradient id="colorNota" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} labelStyle={{ color: "hsl(var(--foreground))" }} />
                  <Area type="monotone" dataKey="nota" stroke="var(--chart-1)" strokeWidth={2} fillOpacity={1} fill="url(#colorNota)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Acerto por Disciplina</CardTitle>
            <CardDescription>Seu desempenho em cada área do conhecimento</CardDescription>
          </CardHeader>
          <CardContent>
            {disciplineData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                Responda questões para ver seu desempenho por disciplina
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={disciplineData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" width={100} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} labelStyle={{ color: "hsl(var(--foreground))" }} />
                    <Bar dataKey="acerto" radius={[0, 4, 4, 0]}>
                      {disciplineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.acerto)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-foreground">{discipline.name}</span>
                      <div className="flex items-center gap-2">
                        {getRiskBadge(discipline.risk)}
                        <span className="text-xs text-muted-foreground">{discipline.percentage}% de acerto</span>
                      </div>
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