"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Target, Clock, BookOpen, Zap } from "lucide-react"
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
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts"

// Dados de simulados
const evolutionSimulados = [
  { date: "Jan", nota: 45, meta: 50 },
  { date: "Fev", nota: 52, meta: 50 },
  { date: "Mar", nota: 48, meta: 50 },
  { date: "Abr", nota: 58, meta: 50 },
  { date: "Mai", nota: 62, meta: 50 },
  { date: "Jun", nota: 68, meta: 50 },
]

const disciplinePerformance = [
  { name: "Ética", acerto: 85, questoes: 120, meta: 70 },
  { name: "Constitucional", acerto: 62, questoes: 180, meta: 70 },
  { name: "Civil", acerto: 70, questoes: 200, meta: 70 },
  { name: "Penal", acerto: 55, questoes: 150, meta: 70 },
  { name: "Proc. Civil", acerto: 72, questoes: 165, meta: 70 },
  { name: "Proc. Penal", acerto: 45, questoes: 140, meta: 70 },
  { name: "Trabalho", acerto: 68, questoes: 95, meta: 70 },
  { name: "Administrativo", acerto: 58, questoes: 130, meta: 70 },
  { name: "Tributário", acerto: 65, questoes: 80, meta: 70 },
  { name: "Empresarial", acerto: 72, questoes: 70, meta: 70 },
  { name: "D. Humanos", acerto: 78, questoes: 55, meta: 70 },
  { name: "Estatuto OAB", acerto: 82, questoes: 85, meta: 70 },
]

const riskMatrix = [
  { name: "Processo Penal", risk: "alto", percentage: 45, trend: -5, questions: 140 },
  { name: "Direito Penal", risk: "alto", percentage: 55, trend: 3, questions: 150 },
  { name: "Administrativo", risk: "médio", percentage: 58, trend: 5, questions: 130 },
  { name: "Constitucional", risk: "médio", percentage: 62, trend: 4, questions: 180 },
  { name: "Trabalho", risk: "baixo", percentage: 68, trend: 2, questions: 95 },
  { name: "Civil", risk: "baixo", percentage: 70, trend: 1, questions: 200 },
  { name: "Proc. Civil", risk: "baixo", percentage: 72, trend: 3, questions: 165 },
  { name: "D. Humanos", risk: "baixo", percentage: 78, trend: 5, questions: 55 },
  { name: "Estatuto OAB", risk: "baixo", percentage: 82, trend: 2, questions: 85 },
  { name: "Ética", risk: "baixo", percentage: 85, trend: 1, questions: 120 },
]

// Dados de questões avulsas
const questoesStats = {
  total: 1470,
  acertos: 985,
  erros: 485,
  taxaAcerto: 67,
  eficiencia: 23, // questões por 1% de aumento
  tempoMedio: "2min 45s",
  sequencia: 5,
}

const weeklyProgress = [
  { dia: "Seg", questoes: 45, acertos: 32 },
  { dia: "Ter", questoes: 38, acertos: 28 },
  { dia: "Qua", questoes: 52, acertos: 38 },
  { dia: "Qui", questoes: 41, acertos: 30 },
  { dia: "Sex", questoes: 35, acertos: 26 },
  { dia: "Sáb", questoes: 60, acertos: 45 },
  { dia: "Dom", questoes: 48, acertos: 35 },
]

function getRiskColor(risk: string) {
  switch (risk) {
    case "alto":
      return "bg-destructive text-destructive-foreground"
    case "médio":
      return "bg-warning text-warning-foreground"
    case "baixo":
      return "bg-primary text-primary-foreground"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

export default function DesempenhoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Desempenho</h1>
        <p className="text-muted-foreground">
          Análise completa do seu progresso e áreas de melhoria
        </p>
      </div>

      <Tabs defaultValue="simulados">
        <TabsList>
          <TabsTrigger value="simulados">Simulados</TabsTrigger>
          <TabsTrigger value="questoes">Questões Avulsas</TabsTrigger>
        </TabsList>

        {/* Tab Simulados */}
        <TabsContent value="simulados" className="mt-6 space-y-6">
          {/* Cards de estatísticas */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Média de Acertos
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">67%</span>
                  <span className="flex items-center text-xs font-medium text-primary">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +5%
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Meta: 50% para aprovação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Simulados Realizados
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">12</div>
                <p className="mt-1 text-xs text-muted-foreground">6 acima de 50%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tempo Médio/Questão
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">3:24</div>
                <p className="mt-1 text-xs text-muted-foreground">Meta: 3:45 por questão</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Maior Nota
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">68/80</div>
                <p className="mt-1 text-xs text-muted-foreground">85% de aproveitamento</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de evolução */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução das Notas</CardTitle>
              <CardDescription>Sua performance nos simulados ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolutionSimulados}>
                    <defs>
                      <linearGradient id="colorNota2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                    <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" domain={[0, 100]} />
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
                      fill="url(#colorNota2)"
                      name="Nota"
                    />
                    <Area
                      type="monotone"
                      dataKey="meta"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      fillOpacity={0}
                      name="Meta"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Matriz de risco */}
          <Card>
            <CardHeader>
              <CardTitle>Índice de Risco de Reprovação</CardTitle>
              <CardDescription>Análise por disciplina baseada no seu desempenho</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riskMatrix.map((discipline) => (
                  <div
                    key={discipline.name}
                    className="flex items-center gap-4 rounded-lg border border-border p-3"
                  >
                    <Badge className={getRiskColor(discipline.risk)}>
                      {discipline.risk}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{discipline.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {discipline.questions} questões
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress
                          value={discipline.percentage}
                          className={`h-2 flex-1 ${
                            discipline.percentage < 60
                              ? "[&>div]:bg-destructive"
                              : discipline.percentage < 70
                              ? "[&>div]:bg-warning"
                              : ""
                          }`}
                        />
                        <span className="w-12 text-right text-sm font-medium text-foreground">
                          {discipline.percentage}%
                        </span>
                        <span
                          className={`flex items-center text-xs ${
                            discipline.trend >= 0 ? "text-primary" : "text-destructive"
                          }`}
                        >
                          {discipline.trend >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(discipline.trend)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Questões Avulsas */}
        <TabsContent value="questoes" className="mt-6 space-y-6">
          {/* Cards de estatísticas */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Resolvidas
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{questoesStats.total}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {questoesStats.acertos} acertos / {questoesStats.erros} erros
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Acerto
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{questoesStats.taxaAcerto}%</span>
                  <span className="flex items-center text-xs font-medium text-primary">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +3%
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Eficiência de Estudo
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{questoesStats.eficiencia}</div>
                <p className="mt-1 text-xs text-muted-foreground">Questões por 1% de aumento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sequência Ativa
                </CardTitle>
                <Zap className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{questoesStats.sequencia} dias</div>
                <p className="mt-1 text-xs text-muted-foreground">Continue assim!</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico semanal */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Semanal</CardTitle>
              <CardDescription>Questões respondidas nos últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="dia" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                    <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend />
                    <Bar dataKey="questoes" fill="var(--chart-2)" name="Total" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="acertos" fill="var(--chart-1)" name="Acertos" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Taxa de acerto por disciplina */}
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Disciplina</CardTitle>
              <CardDescription>Taxa de acerto em questões avulsas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {disciplinePerformance.map((discipline) => (
                  <div key={discipline.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{discipline.name}</span>
                      <span className="text-muted-foreground">
                        {discipline.acerto}% ({discipline.questoes} questões)
                      </span>
                    </div>
                    <Progress
                      value={discipline.acerto}
                      className={`h-2 ${
                        discipline.acerto < 60
                          ? "[&>div]:bg-destructive"
                          : discipline.acerto < 70
                          ? "[&>div]:bg-warning"
                          : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
