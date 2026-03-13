"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileQuestion, FileText, TrendingUp, UserPlus, Activity } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

const statsCards = [
  {
    title: "Total de Usuários",
    value: "12.847",
    change: "+234",
    changeLabel: "este mês",
    icon: Users,
    trend: "up",
  },
  {
    title: "Questões Cadastradas",
    value: "15.423",
    change: "+127",
    changeLabel: "esta semana",
    icon: FileQuestion,
    trend: "up",
  },
  {
    title: "Simulados Ativos",
    value: "48",
    change: "+3",
    changeLabel: "novos",
    icon: FileText,
    trend: "up",
  },
  {
    title: "Taxa de Aprovação",
    value: "68%",
    change: "+5%",
    changeLabel: "vs. mês passado",
    icon: TrendingUp,
    trend: "up",
  },
]

const userGrowthData = [
  { month: "Jan", usuarios: 8500 },
  { month: "Fev", usuarios: 9200 },
  { month: "Mar", usuarios: 9800 },
  { month: "Abr", usuarios: 10500 },
  { month: "Mai", usuarios: 11400 },
  { month: "Jun", usuarios: 12847 },
]

const questoesPorDisciplina = [
  { name: "Ética", questoes: 1250 },
  { name: "Constitucional", questoes: 1820 },
  { name: "Civil", questoes: 2100 },
  { name: "Penal", questoes: 1650 },
  { name: "Proc. Civil", questoes: 1780 },
  { name: "Proc. Penal", questoes: 1420 },
  { name: "Trabalho", questoes: 980 },
  { name: "Administrativo", questoes: 1340 },
  { name: "Tributário", questoes: 820 },
  { name: "Empresarial", questoes: 750 },
  { name: "D. Humanos", questoes: 680 },
  { name: "Estatuto", questoes: 833 },
]

const recentActivity = [
  { type: "user", message: "Novo usuário cadastrado: Maria Silva", time: "Há 5 minutos" },
  { type: "question", message: "10 novas questões adicionadas em Direito Civil", time: "Há 15 minutos" },
  { type: "simulado", message: "Simulado OAB XXXVIII ativado", time: "Há 1 hora" },
  { type: "user", message: "Novo usuário cadastrado: Pedro Santos", time: "Há 2 horas" },
  { type: "question", message: "Questão #12847 atualizada", time: "Há 3 horas" },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">Visão geral da plataforma JuriSoft</p>
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
                <span className="flex items-center text-xs font-medium text-primary">
                  {card.change}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{card.changeLabel}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Crescimento de usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Usuários</CardTitle>
            <CardDescription>Evolução do número de usuários cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
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
                    dataKey="usuarios"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Questões por disciplina */}
        <Card>
          <CardHeader>
            <CardTitle>Questões por Disciplina</CardTitle>
            <CardDescription>Distribuição do banco de questões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={questoesPorDisciplina} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="questoes" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividade recente */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Últimas ações na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    activity.type === "user"
                      ? "bg-primary/10"
                      : activity.type === "question"
                      ? "bg-chart-2/10"
                      : "bg-chart-3/10"
                  }`}
                >
                  {activity.type === "user" ? (
                    <UserPlus className="h-5 w-5 text-primary" />
                  ) : activity.type === "question" ? (
                    <FileQuestion className="h-5 w-5 text-chart-2" />
                  ) : (
                    <Activity className="h-5 w-5 text-chart-3" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
