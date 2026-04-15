"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileQuestion, FileText, TrendingUp, Loader2 } from "lucide-react"
import {
  Area, AreaChart, Bar, BarChart,
  ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts"
import { toast } from "sonner"

interface AdminStats {
  totais: {
    usuarios: number
    questoes: number
    simulados: number
    mediaAproveitamento: number
  }
  questoesPorDisciplina: { name: string; questoes: number }[]
  simuladosPorDia: { date: string; total: number }[]
  usuariosRecentes: { id: string; role: string }[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats")
        const data = await res.json()
        if (!res.ok) {
          toast.error("Erro ao carregar métricas")
          return
        }
        setStats(data)
      } catch {
        toast.error("Erro inesperado ao carregar dashboard")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!stats) return null

  const statsCards = [
    {
      title: "Total de Usuários",
      value: stats.totais.usuarios.toLocaleString("pt-BR"),
      description: "Cadastrados na plataforma",
      icon: Users,
    },
    {
      title: "Questões Cadastradas",
      value: stats.totais.questoes.toLocaleString("pt-BR"),
      description: "No banco de questões",
      icon: FileQuestion,
    },
    {
      title: "Simulados Realizados",
      value: stats.totais.simulados.toLocaleString("pt-BR"),
      description: "Total acumulado",
      icon: FileText,
    },
    {
      title: "Média de Aproveitamento",
      value: `${stats.totais.mediaAproveitamento}%`,
      description: "Média geral dos simulados",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">Visão geral da plataforma AprovaOAB</p>
      </div>

      {/* ── Stats cards ── */}
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
              <span className="text-2xl font-bold text-foreground">{card.value}</span>
              <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Gráficos ── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Simulados por dia */}
        <Card>
          <CardHeader>
            <CardTitle>Simulados por Dia</CardTitle>
            <CardDescription>Últimos 7 dias de atividade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.simuladosPorDia}>
                  <defs>
                    <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [value, "Simulados"]}
                  />
                  <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorSim)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Questões por disciplina */}
        <Card>
          <CardHeader>
            <CardTitle>Questões por Disciplina</CardTitle>
            <CardDescription>Distribuição real do banco de questões</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.questoesPorDisciplina.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                Nenhuma questão cadastrada ainda
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.questoesPorDisciplina.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      className="text-xs fill-muted-foreground"
                      width={90}
                      tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + "…" : v}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: number) => [value, "Questões"]}
                    />
                    <Bar dataKey="questoes" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Usuários recentes ── */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Recentes</CardTitle>
          <CardDescription>Últimos 5 usuários cadastrados na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.usuariosRecentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
          ) : (
            <div className="space-y-3">
              {stats.usuariosRecentes.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-mono text-muted-foreground truncate max-w-[200px]">
                      {u.id}
                    </span>
                  </div>
                  <Badge variant={
                    u.role === "admin" ? "default" :
                    u.role === "blocked" ? "destructive" :
                    "secondary"
                  }>
                    {u.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}