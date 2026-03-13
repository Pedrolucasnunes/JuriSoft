"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Target, FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

// Dados de exemplo
const evolutionData = [
  { date: "Jan", nota: 45 },
  { date: "Fev", nota: 52 },
  { date: "Mar", nota: 48 },
  { date: "Abr", nota: 58 },
  { date: "Mai", nota: 62 },
  { date: "Jun", nota: 68 },
]

const disciplineData = [
  { name: "Ética", acerto: 85, meta: 70, status: "success" },
  { name: "Constitucional", acerto: 62, meta: 70, status: "warning" },
  { name: "Civil", acerto: 70, meta: 70, status: "success" },
  { name: "Penal", acerto: 55, meta: 70, status: "danger" },
  { name: "Processo Civil", acerto: 72, meta: 70, status: "success" },
  { name: "Processo Penal", acerto: 45, meta: 70, status: "danger" },
  { name: "Trabalho", acerto: 68, meta: 70, status: "warning" },
  { name: "Administrativo", acerto: 58, meta: 70, status: "warning" },
]

const getBarColor = (status: string) => {
  switch (status) {
    case "success":
      return "var(--chart-1)" // Green
    case "warning":
      return "var(--chart-3)" // Amber
    case "danger":
      return "var(--chart-4)" // Red
    default:
      return "var(--chart-2)" // Blue
  }
}

const riskDisciplines = [
  { name: "Processo Penal", risk: "alto", percentage: 45, trend: "down" },
  { name: "Penal", risk: "alto", percentage: 55, trend: "up" },
  { name: "Administrativo", risk: "médio", percentage: 58, trend: "up" },
  { name: "Constitucional", risk: "médio", percentage: 62, trend: "up" },
]

const statsCards = [
  {
    title: "Último Simulado",
    value: "68/80",
    description: "85% de acerto",
    icon: FileText,
    trend: "up",
    trendValue: "+5%",
  },
  {
    title: "Taxa de Acerto Geral",
    value: "67%",
    description: "Média dos últimos 30 dias",
    icon: Target,
    trend: "up",
    trendValue: "+3%",
  },
  {
    title: "Questões Resolvidas",
    value: "1.234",
    description: "Total acumulado",
    icon: CheckCircle2,
    trend: "neutral",
    trendValue: "",
  },
  {
    title: "Matérias em Risco",
    value: "4",
    description: "Precisam de atenção",
    icon: AlertTriangle,
    trend: "down",
    trendValue: "-1",
  },
]

function getRiskBadge(risk: string) {
  switch (risk) {
    case "alto":
      return <Badge variant="destructive">Alto risco</Badge>
    case "médio":
      return <Badge className="bg-warning text-warning-foreground">Médio risco</Badge>
    case "baixo":
      return <Badge className="bg-success text-success-foreground">Baixo risco</Badge>
    default:
      return null
  }
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Acompanhe seu progresso e desempenho</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/simulados">
            Fazer simulado
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{card.value}</span>
                {card.trendValue && (
                  <span
                    className={`flex items-center text-xs font-medium ${
                      card.trend === "up"
                        ? "text-primary"
                        : card.trend === "down"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {card.trend === "up" ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : card.trend === "down" ? (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    ) : null}
                    {card.trendValue}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Evolução do desempenho */}
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
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    className="text-xs fill-muted-foreground"
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="nota"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorNota)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de acerto por disciplina */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Acerto por Disciplina</CardTitle>
            <CardDescription>Seu desempenho em cada área do conhecimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disciplineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    className="text-xs fill-muted-foreground"
                    domain={[0, 100]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    className="text-xs fill-muted-foreground"
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="acerto" radius={[0, 4, 4, 0]}>
                    {disciplineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matérias em risco */}
      <Card>
        <CardHeader>
          <CardTitle>Índice de Risco de Reprovação</CardTitle>
          <CardDescription>
            Disciplinas que precisam de mais atenção para garantir a aprovação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskDisciplines.map((discipline) => (
              <div
                key={discipline.name}
                className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">{discipline.name}</span>
                    <div className="flex items-center gap-2">
                      {getRiskBadge(discipline.risk)}
                      <span className="text-xs text-muted-foreground">
                        {discipline.percentage}% de acerto
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 hidden sm:block">
                    <Progress value={discipline.percentage} className="h-2" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      discipline.trend === "up" ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {discipline.trend === "up" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
