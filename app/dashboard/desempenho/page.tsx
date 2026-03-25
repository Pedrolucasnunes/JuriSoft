"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Target, BookOpen, Zap, Loader2 } from "lucide-react"
import {
  Area, AreaChart, Bar, BarChart, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts"
import { supabase } from "@/lib/supabase"

function getRiskColor(taxa: number) {
  if (taxa < 55) return "bg-destructive text-destructive-foreground"
  if (taxa < 70) return "bg-warning text-warning-foreground"
  return "bg-primary text-primary-foreground"
}

function getRiskLabel(taxa: number) {
  if (taxa < 55) return "alto"
  if (taxa < 70) return "médio"
  return "baixo"
}

export default function DesempenhoPage() {
  const [loading, setLoading] = useState(true)
  const [evolutionData, setEvolutionData] = useState<any[]>([])
  const [statsSimulados, setStatsSimulados] = useState({
    mediaAcerto: 0, totalSimulados: 0, aprovados: 0,
    maiorNota: 0, maiorTotal: 80, maiorPercentual: 0,
  })
  const [statsQuestoes, setStatsQuestoes] = useState({
    total: 0, acertos: 0, erros: 0, taxaAcerto: 0,
  })
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [desempenhoPorMateria, setDesempenhoPorMateria] = useState<any[]>([])
  const [materiasRisco, setMateriasRisco] = useState<any[]>([])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await Promise.all([
        fetchSimulados(user.id),
        fetchQuestoes(user.id),
        fetchDesempenho(user.id),
      ])

      setLoading(false)
    }
    init()
  }, [])

  async function fetchSimulados(uid: string) {
    const { data } = await supabase
      .from("simulados")
      .select("id, acertos, erros, percentual, numero_questoes, created_at")
      .eq("user_id", uid)
      .gt("acertos", 0)
      .order("created_at", { ascending: true })

    if (!data || data.length === 0) return

    const media = data.reduce((acc, s) => acc + s.percentual, 0) / data.length
    const melhor = data.reduce((prev, curr) => curr.percentual > prev.percentual ? curr : prev, data[0])
    const aprovados = data.filter(s => s.percentual >= 60).length

    setStatsSimulados({
      mediaAcerto: parseFloat(media.toFixed(1)),
      totalSimulados: data.length,
      aprovados,
      maiorNota: melhor.acertos,
      maiorTotal: melhor.numero_questoes,
      maiorPercentual: melhor.percentual,
    })

    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    const porMes: Record<string, { soma: number; count: number }> = {}
    data.forEach(s => {
      const key = meses[new Date(s.created_at).getMonth()]
      if (!porMes[key]) porMes[key] = { soma: 0, count: 0 }
      porMes[key].soma += s.percentual
      porMes[key].count++
    })
    setEvolutionData(Object.entries(porMes).map(([date, v]) => ({
      date,
      nota: parseFloat((v.soma / v.count).toFixed(1)),
      meta: 60,
    })))
  }

  async function fetchQuestoes(uid: string) {
    const { data } = await supabase
      .from("question_attempts")
      .select("acertou, created_at")
      .eq("user_id", uid)

    if (!data) return

    const total = data.length
    const acertos = data.filter(q => q.acertou).length
    setStatsQuestoes({
      total, acertos, erros: total - acertos,
      taxaAcerto: total > 0 ? parseFloat(((acertos / total) * 100).toFixed(2)) : 0,
    })

    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    const hoje = new Date()
    const semana = []
    for (let i = 6; i >= 0; i--) {
      const dia = new Date(hoje)
      dia.setDate(hoje.getDate() - i)
      const dateStr = dia.toISOString().split("T")[0]
      const doDia = data.filter(q => q.created_at.startsWith(dateStr))
      semana.push({
        dia: dias[dia.getDay()],
        questoes: doDia.length,
        acertos: doDia.filter(q => q.acertou).length,
      })
    }
    setWeeklyData(semana)
  }

  async function fetchDesempenho(uid: string) {
    const { data: desempenho } = await supabase
      .from("desempenho_materia")
      .select("subject_id, total, acertos, taxa_acerto")
      .eq("user_id", uid)

    const { data: risco } = await supabase
      .from("materias_risco")
      .select("subject_id, taxa")
      .eq("user_id", uid)
      .order("taxa", { ascending: true })

    const subjectIds = [...new Set([
      ...(desempenho ?? []).map(d => d.subject_id),
      ...(risco ?? []).map(r => r.subject_id),
    ])]

    const { data: subjects } = await supabase
      .from("subjects")
      .select("id, name")
      .in("id", subjectIds.length > 0 ? subjectIds : ["null"])

    const subjectMap = Object.fromEntries((subjects ?? []).map(s => [s.id, s.name]))

    // Agrupa por subject_id antes de renderizar
    const agrupado: Record<string, { total: number; acertos: number; name: string }> = {}

      ; (desempenho ?? []).forEach(d => {
        if (!agrupado[d.subject_id]) {
          agrupado[d.subject_id] = { total: 0, acertos: 0, name: subjectMap[d.subject_id] ?? "Desconhecida" }
        }
        agrupado[d.subject_id].total += d.total
        agrupado[d.subject_id].acertos += d.acertos
      })

    setDesempenhoPorMateria(
      Object.entries(agrupado).map(([subject_id, v]) => ({
        subject_id,
        name: v.name,
        acerto: v.total > 0 ? parseFloat(((v.acertos / v.total) * 100).toFixed(1)) : 0,
        questoes: v.total,
      })).sort((a, b) => a.acerto - b.acerto)
    )

    // Agrupa materias_risco por subject_id
    const riscoAgrupado: Record<string, { soma: number; count: number; name: string }> = {}

      ; (risco ?? []).forEach(r => {
        if (!riscoAgrupado[r.subject_id]) {
          riscoAgrupado[r.subject_id] = { soma: 0, count: 0, name: subjectMap[r.subject_id] ?? "Desconhecida" }
        }
        riscoAgrupado[r.subject_id].soma += Number(r.taxa)
        riscoAgrupado[r.subject_id].count++
      })

    setMateriasRisco(
      Object.entries(riscoAgrupado).map(([subject_id, v]) => ({
        subject_id,
        name: v.name,
        taxa: parseFloat((v.soma / v.count).toFixed(1)),
      })).sort((a, b) => a.taxa - b.taxa)
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Desempenho</h1>
        <p className="text-muted-foreground">Análise completa do seu progresso e áreas de melhoria</p>
      </div>

      <Tabs defaultValue="simulados">
        <TabsList>
          <TabsTrigger value="simulados">Simulados</TabsTrigger>
          <TabsTrigger value="questoes">Questões Avulsas</TabsTrigger>
        </TabsList>

        <TabsContent value="simulados" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Média de Acertos</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{statsSimulados.mediaAcerto}%</span>
                  <span className={`flex items-center text-xs font-medium ${statsSimulados.mediaAcerto >= 60 ? "text-primary" : "text-destructive"}`}>
                    {statsSimulados.mediaAcerto >= 60 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Meta: 60% para aprovação</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Simulados Realizados</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{statsSimulados.totalSimulados}</div>
                <p className="mt-1 text-xs text-muted-foreground">{statsSimulados.aprovados} acima de 60%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Maior Nota</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{statsSimulados.maiorNota}/{statsSimulados.maiorTotal}</div>
                <p className="mt-1 text-xs text-muted-foreground">{statsSimulados.maiorPercentual}% de aproveitamento</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {statsSimulados.totalSimulados > 0 ? Math.round((statsSimulados.aprovados / statsSimulados.totalSimulados) * 100) : 0}%
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{statsSimulados.aprovados} de {statsSimulados.totalSimulados} simulados</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evolução das Notas</CardTitle>
              <CardDescription>Sua performance nos simulados ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              {evolutionData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">Realize simulados para ver sua evolução</div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={evolutionData}>
                      <defs>
                        <linearGradient id="colorNota2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                      <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} labelStyle={{ color: "hsl(var(--foreground))" }} />
                      <Area type="monotone" dataKey="nota" stroke="var(--chart-1)" strokeWidth={2} fillOpacity={1} fill="url(#colorNota2)" name="Nota" />
                      <Area type="monotone" dataKey="meta" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="5 5" fillOpacity={0} name="Meta (60%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Índice de Risco de Reprovação</CardTitle>
              <CardDescription>Análise por disciplina baseada no seu desempenho</CardDescription>
            </CardHeader>
            <CardContent>
              {materiasRisco.length === 0 ? (
                <p className="text-sm text-muted-foreground">Responda questões para ver sua análise de risco.</p>
              ) : (
                <div className="space-y-3">
                  {materiasRisco.map((m, i) => (
                    <div key={`${m.subject_id}-${i}`} className="flex items-center gap-4 rounded-lg border border-border p-3">
                      <Badge className={getRiskColor(m.taxa)}>{getRiskLabel(m.taxa)}</Badge>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{m.name}</span>
                          <span className="text-sm font-medium text-foreground">{m.taxa}%</span>
                        </div>
                        <Progress value={m.taxa} className={`mt-1 h-2 ${m.taxa < 60 ? "[&>div]:bg-destructive" : m.taxa < 70 ? "[&>div]:bg-warning" : ""}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questoes" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Resolvidas</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{statsQuestoes.total.toLocaleString("pt-BR")}</div>
                <p className="mt-1 text-xs text-muted-foreground">{statsQuestoes.acertos} acertos / {statsQuestoes.erros} erros</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Acerto</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{statsQuestoes.taxaAcerto}%</span>
                  <span className={`flex items-center text-xs font-medium ${statsQuestoes.taxaAcerto >= 60 ? "text-primary" : "text-destructive"}`}>
                    {statsQuestoes.taxaAcerto >= 60 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Taxa geral acumulada</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Acertos</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{statsQuestoes.acertos.toLocaleString("pt-BR")}</div>
                <p className="mt-1 text-xs text-muted-foreground">Total de acertos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Erros</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{statsQuestoes.erros.toLocaleString("pt-BR")}</div>
                <p className="mt-1 text-xs text-muted-foreground">Total de erros</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Atividade Semanal</CardTitle>
              <CardDescription>Questões respondidas nos últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyData.every(d => d.questoes === 0) ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">Nenhuma atividade nos últimos 7 dias</div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis dataKey="dia" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                      <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} labelStyle={{ color: "hsl(var(--foreground))" }} />
                      <Legend />
                      <Bar dataKey="questoes" fill="var(--chart-2)" name="Total" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="acertos" fill="var(--chart-1)" name="Acertos" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Disciplina</CardTitle>
              <CardDescription>Taxa de acerto em questões avulsas</CardDescription>
            </CardHeader>
            <CardContent>
              {desempenhoPorMateria.length === 0 ? (
                <p className="text-sm text-muted-foreground">Responda questões para ver seu desempenho por disciplina.</p>
              ) : (
                <div className="space-y-3">
                  {desempenhoPorMateria.map((d, i) => (
                    <div key={`${d.subject_id}-${i}`} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{d.name}</span>
                        <span className="text-muted-foreground">{d.acerto}% ({d.questoes} questões)</span>
                      </div>
                      <Progress value={d.acerto} className={`h-2 ${d.acerto < 60 ? "[&>div]:bg-destructive" : d.acerto < 70 ? "[&>div]:bg-warning" : ""}`} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}