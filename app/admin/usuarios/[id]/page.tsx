"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle, Loader2, FileText, BookOpen } from "lucide-react"

interface Resumo {
  hoje: number
  semana: number
  total: number
  max_por_hora: number
}

interface DiaAtividade {
  data: string
  questoes: number
  simulados: number
}

interface HoraAtividade {
  hora: number
  count: number
}

interface UltimaAtividade {
  created_at: string
  tipo: "questao" | "simulado"
}

interface AtividadeData {
  user: { id: string; email: string | null; nome: string | null }
  resumo: Resumo
  por_dia: DiaAtividade[]
  por_hora: HoraAtividade[]
  ultimas_atividades: UltimaAtividade[]
}

const ALERTA_MAX_HORA = 60

export default function UsuarioAtividadePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<AtividadeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/usuarios/${id}/atividade`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>Usuário não encontrado.</p>
        <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
      </div>
    )
  }

  const { user, resumo, por_dia, por_hora, ultimas_atividades } = data
  const temAlerta = resumo.max_por_hora >= ALERTA_MAX_HORA

  const maxDia = Math.max(...por_dia.map((d) => d.questoes), 1)
  const maxHora = Math.max(...por_hora.map((h) => h.count), 1)

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">
            {user.nome ?? "Usuário sem nome"}
          </h1>
          <p className="text-sm text-muted-foreground font-mono truncate">{user.email ?? user.id}</p>
        </div>
        {temAlerta && (
          <Badge variant="destructive" className="flex items-center gap-1 shrink-0">
            <AlertTriangle className="h-3 w-3" />
            Atividade suspeita
          </Badge>
        )}
      </div>

      {/* Alerta de atividade suspeita */}
      {temAlerta && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive text-sm">Atividade suspeita detectada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Este usuário respondeu <strong>{resumo.max_por_hora} questões em 1 hora</strong> — acima do limite esperado de {ALERTA_MAX_HORA}. Isso pode indicar uso de bot ou scraping.
            </p>
          </div>
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{resumo.hoje}</p>
            <p className="text-xs text-muted-foreground">Questões hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{resumo.semana}</p>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{resumo.total.toLocaleString("pt-BR")}</p>
            <p className="text-xs text-muted-foreground">Total de questões</p>
          </CardContent>
        </Card>
        <Card className={temAlerta ? "border-destructive/50" : ""}>
          <CardContent className="p-4">
            <p className={`text-2xl font-bold ${temAlerta ? "text-destructive" : ""}`}>
              {resumo.max_por_hora}
            </p>
            <p className="text-xs text-muted-foreground">Máx. questões/hora</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico: questões por dia */}
      <Card>
        <CardHeader>
          <CardTitle>Questões por dia</CardTitle>
          <CardDescription>Últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={por_dia} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="data"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => {
                  const d = new Date(v + "T00:00:00")
                  return `${d.getDate()}/${d.getMonth() + 1}`
                }}
                interval={4}
              />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                formatter={(v) => [`${v} questões`, ""]}
                labelFormatter={(l) => {
                  const d = new Date(l + "T00:00:00")
                  return d.toLocaleDateString("pt-BR")
                }}
              />
              <Bar dataKey="questoes" radius={[3, 3, 0, 0]}>
                {por_dia.map((entry) => (
                  <Cell
                    key={entry.data}
                    fill={entry.questoes >= maxDia * 0.8 && entry.questoes > 50
                      ? "hsl(var(--destructive))"
                      : "hsl(var(--primary))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição por horário */}
      <Card>
        <CardHeader>
          <CardTitle>Horário de estudo</CardTitle>
          <CardDescription>Distribuição das questões por hora do dia (últimos 30 dias)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-1">
            {por_hora.map(({ hora, count }) => {
              const pct = maxHora > 0 ? Math.round((count / maxHora) * 100) : 0
              const isAlto = count >= ALERTA_MAX_HORA
              return (
                <div key={hora} className="flex flex-col items-center gap-1">
                  <div className="relative w-full flex items-end" style={{ height: 60 }}>
                    <div
                      className={`w-full rounded-sm transition-all ${isAlto ? "bg-destructive" : "bg-primary/70"}`}
                      style={{ height: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                      title={`${hora}h: ${count} questões`}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{hora}h</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Últimas atividades */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas atividades</CardTitle>
          <CardDescription>As 20 ações mais recentes nos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          {ultimas_atividades.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma atividade nos últimos 30 dias.</p>
          ) : (
            <div className="space-y-2">
              {ultimas_atividades.map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${a.tipo === "simulado" ? "bg-primary/10" : "bg-secondary"}`}>
                    {a.tipo === "simulado"
                      ? <FileText className="h-3.5 w-3.5 text-primary" />
                      : <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    }
                  </div>
                  <span className="flex-1 text-foreground">
                    {a.tipo === "simulado" ? "Simulado realizado" : "Questão respondida"}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(a.created_at).toLocaleString("pt-BR", {
                      day: "2-digit", month: "short",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
