"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  BookOpen,
  FileText,
  RotateCcw,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  Brain,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface CalendarEvent {
  id: string
  user_id: string
  title: string
  type: "study" | "simulado" | "revisao" | "prova"
  date: string   // YYYY-MM-DD
  time: string   // HH:MM
  is_auto: boolean
  subject: string | null
  reason: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  study: {
    label: "Treino",
    icon: BookOpen,
    badge: "bg-primary/15 text-primary border-primary/25",
    dot:   "bg-primary",
    card:  "border-l-primary",
  },
  simulado: {
    label: "Simulado",
    icon: FileText,
    badge: "bg-secondary/15 text-secondary border-secondary/25",
    dot:   "bg-secondary",
    card:  "border-l-secondary",
  },
  revisao: {
    label: "Revisão",
    icon: RotateCcw,
    badge: "bg-yellow-500/15 text-yellow-500 border-yellow-500/25",
    dot:   "bg-yellow-500",
    card:  "border-l-yellow-500",
  },
  prova: {
    label: "Prova",
    icon: Trophy,
    badge: "bg-destructive/15 text-destructive border-destructive/25",
    dot:   "bg-destructive",
    card:  "border-l-destructive",
  },
}

const WEEKDAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTHS_PT   = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
]

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  const date      = new Date(y, m - 1, d)
  const weekday   = WEEKDAYS_PT[date.getDay()]
  const month     = MONTHS_PT[m - 1]
  return { weekday, day: d, month, full: `${weekday}, ${d} ${month}` }
}

function isoWeekStart(offset = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split("T")[0]
}

function addDaysToDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return date.toISOString().split("T")[0]
}

function formatTime(time: string): string {
  return time?.slice(0, 5) ?? ""
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Card
// ─────────────────────────────────────────────────────────────────────────────
function EventCard({ event }: { event: CalendarEvent }) {
  const cfg   = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.study
  const Icon  = cfg.icon

  return (
    <div className={`flex gap-3 rounded-lg border border-l-4 bg-card p-3.5 ${cfg.card}`}>
      {/* Time column */}
      <div className="flex w-12 shrink-0 flex-col items-center">
        <span className="font-mono text-xs font-semibold text-muted-foreground">
          {formatTime(event.time)}
        </span>
        <div className={`mt-1.5 h-2 w-2 rounded-full ${cfg.dot}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-start gap-2">
          <span className="text-sm font-semibold text-foreground leading-tight">
            {event.title}
          </span>
          <div className="flex gap-1.5 flex-wrap">
            <Badge
              variant="outline"
              className={`flex items-center gap-1 border text-[10px] font-medium uppercase tracking-wide ${cfg.badge}`}
            >
              <Icon className="h-2.5 w-2.5" />
              {cfg.label}
            </Badge>
            {event.is_auto && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border border-[#b8860b]/30 bg-[#b8860b]/10 text-[10px] font-medium uppercase tracking-wide text-[#b8860b]"
              >
                <Sparkles className="h-2.5 w-2.5" />
                IA
              </Badge>
            )}
          </div>
        </div>

        {event.reason && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {event.reason}
          </p>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Day Column
// ─────────────────────────────────────────────────────────────────────────────
function DaySection({
  dateStr,
  events,
  isToday,
}: {
  dateStr:  string
  events:   CalendarEvent[]
  isToday:  boolean
}) {
  const { weekday, day, month } = formatDate(dateStr)

  return (
    <div className="space-y-2">
      {/* Day header */}
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg
            ${isToday
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
            }`}
        >
          <span className="text-[10px] font-medium uppercase leading-none">{weekday}</span>
          <span className="text-base font-black leading-none">{day}</span>
        </div>
        <div>
          <span className={`text-sm font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
            {isToday ? "Hoje" : weekday + "-feira"}
          </span>
          <span className="ml-1.5 text-xs text-muted-foreground capitalize">{day} {month}</span>
        </div>
        {events.length === 0 && (
          <span className="ml-auto text-xs text-muted-foreground italic">Sem eventos</span>
        )}
      </div>

      {/* Events */}
      {events.length > 0 && (
        <div className="ml-13 space-y-2 pl-1">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats bar
// ─────────────────────────────────────────────────────────────────────────────
function StatsBar({ events }: { events: CalendarEvent[] }) {
  const treinos   = events.filter((e) => e.type === "study").length
  const simulados = events.filter((e) => e.type === "simulado").length
  const revisoes  = events.filter((e) => e.type === "revisao").length

  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: "Treinos",   value: treinos,   color: "text-primary",     dot: "bg-primary" },
        { label: "Revisões",  value: revisoes,  color: "text-yellow-500",  dot: "bg-yellow-500" },
        { label: "Simulados", value: simulados, color: "text-secondary",   dot: "bg-secondary" },
      ].map(({ label, value, color, dot }) => (
        <div key={label} className="flex flex-col items-center rounded-lg bg-muted/40 py-3">
          <div className={`flex items-center gap-1.5 text-xl font-black ${color}`}>
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            {value}
          </div>
          <span className="mt-0.5 text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState({ onGenerate, loading }: { onGenerate: () => void; loading: boolean }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <div className="max-w-sm space-y-1.5">
          <h3 className="font-semibold text-foreground">Nenhum plano gerado ainda</h3>
          <p className="text-sm text-muted-foreground">
            Clique em <strong>Gerar Plano</strong> para criar sua agenda personalizada com base no seu desempenho por disciplina.
          </p>
        </div>
        <Button onClick={onGenerate} disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Gerar Plano com IA
        </Button>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function CalendarioPage() {
  const [events,        setEvents]        = useState<CalendarEvent[]>([])
  const [loading,       setLoading]       = useState(true)
  const [generating,    setGenerating]    = useState(false)
  const [weekOffset,    setWeekOffset]    = useState(0)  // 0 = semana atual

  // Intervalo da semana exibida
  const weekStart = isoWeekStart(weekOffset * 7)
  const weekEnd   = addDaysToDate(weekStart, 6)

  const today = new Date().toISOString().split("T")[0]

  // 7 dias da semana
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDaysToDate(weekStart, i)
  )

  // ─── Busca eventos da semana ──────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/calendario?start=${weekStart}&end=${weekEnd}`
      )
      if (!res.ok) throw new Error("Erro ao buscar eventos")
      const { events: data } = await res.json()
      setEvents(data ?? [])
    } catch {
      toast.error("Não foi possível carregar a agenda.")
    } finally {
      setLoading(false)
    }
  }, [weekStart, weekEnd])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // ─── Gerar plano ─────────────────────────────────────────────────
  async function handleGerar() {
    setGenerating(true)
    try {
      const res = await fetch("/api/calendario/gerar", { method: "POST" })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? "Erro ao gerar plano")
      }
      const { count, stats } = await res.json()
      toast.success(
        `Plano gerado! ${count} eventos criados — ${stats.criticas} matérias críticas priorizadas.`
      )
      // Volta para a semana atual e recarrega
      setWeekOffset(0)
      await fetchEvents()
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao gerar plano.")
    } finally {
      setGenerating(false)
    }
  }

  // ─── Agrupa eventos por data ──────────────────────────────────────
  const eventsByDate = weekDays.reduce<Record<string, CalendarEvent[]>>(
    (acc, d) => {
      acc[d] = events.filter((e) => e.date === d)
      return acc
    },
    {}
  )

  const totalEvents = events.length

  // Label da semana no header
  const [sy, sm, sd] = weekStart.split("-").map(Number)
  const [ey, em, ed] = weekEnd.split("-").map(Number)
  const weekLabel = `${sd} ${MONTHS_PT[sm - 1]} — ${ed} ${MONTHS_PT[em - 1]} ${ey}`

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Agenda Inteligente
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Plano de estudos gerado automaticamente com base no seu desempenho
          </p>
        </div>

        <Button
          onClick={handleGerar}
          disabled={generating || loading}
          className="shrink-0 gap-2"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {generating ? "Gerando..." : "Gerar Plano"}
        </Button>
      </div>

      {/* ── Aviso IA ───────────────────────────────────────────────── */}
      <div className="flex items-start gap-2.5 rounded-lg border border-[#b8860b]/20 bg-[#b8860b]/5 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#b8860b]" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          A IA prioriza <strong className="text-foreground">60%</strong> do tempo nas matérias críticas (&lt;40% de acerto),{" "}
          <strong className="text-foreground">30%</strong> nas intermediárias e{" "}
          <strong className="text-foreground">10%</strong> nas boas. Inclui 1 simulado e revisões semanais.
        </p>
      </div>

      {/* ── Navegação de semana ────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-2.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekOffset((o) => o - 1)}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <span className="text-sm font-semibold text-foreground capitalize">{weekLabel}</span>
          {weekOffset === 0 && (
            <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary">
              Esta semana
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekOffset((o) => o + 1)}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────── */}
      {!loading && totalEvents > 0 && <StatsBar events={events} />}

      {/* ── Conteúdo ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : totalEvents === 0 && weekOffset === 0 ? (
        <EmptyState onGenerate={handleGerar} loading={generating} />
      ) : totalEvents === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum evento nesta semana.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {weekDays.map((dateStr) => (
            <DaySection
              key={dateStr}
              dateStr={dateStr}
              events={eventsByDate[dateStr] ?? []}
              isToday={dateStr === today}
            />
          ))}
        </div>
      )}

      {/* ── Legenda ───────────────────────────────────────────────── */}
      {!loading && totalEvents > 0 && (
        <div className="flex flex-wrap gap-3 border-t border-border pt-4">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon
            return (
              <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="h-3 w-3" />
                {cfg.label}
              </div>
            )
          })}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-[#b8860b]" />
            Gerado por IA
          </div>
        </div>
      )}
    </div>
  )
}
