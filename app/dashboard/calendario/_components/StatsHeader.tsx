"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Edit2, Check, X, TrendingDown, Minus, TrendingUp } from "lucide-react"

interface SubjectStats {
  criticas: number
  medias:   number
  boas:     number
}

export function StatsHeader() {
  const [examDate,  setExamDate]  = useState<string>("")
  const [tempDate,  setTempDate]  = useState<string>("")
  const [editing,   setEditing]   = useState(false)
  const [stats,     setStats]     = useState<SubjectStats>({ criticas: 0, medias: 0, boas: 0 })
  const [noData,    setNoData]    = useState(false)

  useEffect(() => {
    // Carrega data da prova do localStorage
    const saved = localStorage.getItem("oab_exam_date")
    if (saved) setExamDate(saved)

    // Carrega desempenho por matéria
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        const subjects = (data.desempenhoPorMateria ?? []) as { taxa_acerto: number }[]
        if (subjects.length === 0) { setNoData(true); return }
        setStats({
          criticas: subjects.filter((s) => s.taxa_acerto < 40).length,
          medias:   subjects.filter((s) => s.taxa_acerto >= 40 && s.taxa_acerto <= 70).length,
          boas:     subjects.filter((s) => s.taxa_acerto > 70).length,
        })
      })
      .catch(() => {})
  }, [])

  const daysLeft = examDate
    ? Math.ceil((new Date(examDate).getTime() - Date.now()) / 86_400_000)
    : null

  const daysColor =
    daysLeft === null  ? "text-muted-foreground"
    : daysLeft <= 30   ? "text-destructive"
    : daysLeft <= 90   ? "text-yellow-500"
    : "text-primary"

  function saveDate() {
    if (!tempDate) return
    setExamDate(tempDate)
    localStorage.setItem("oab_exam_date", tempDate)
    setEditing(false)
  }

  function startEdit() {
    setTempDate(examDate)
    setEditing(true)
  }

  return (
    <Card className="border-border bg-card/60">
      <CardContent className="px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">

          {/* ── Countdown ──────────────────────────────── */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary shrink-0" />

            {editing ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={tempDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="h-7 w-36 rounded-md border border-input bg-input px-2 text-xs
                    text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={saveDate}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6"
                  onClick={() => setEditing(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : daysLeft !== null ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Faltam</span>
                <span
                  className={`text-xl font-black leading-none ${daysColor}`}
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  {daysLeft}
                </span>
                <span className="text-sm text-muted-foreground">
                  dia{daysLeft !== 1 ? "s" : ""} para a OAB
                </span>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground/60"
                  onClick={startEdit}>
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <button
                onClick={startEdit}
                className="text-sm text-primary hover:underline underline-offset-2"
              >
                Definir data da prova
              </button>
            )}
          </div>

          {/* ── Divider ─────────────────────────────────── */}
          <div className="hidden sm:block h-6 w-px bg-border" />

          {/* ── Subject stats ────────────────────────────── */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-muted-foreground">Matérias:</span>

            {noData ? (
              <span className="text-xs text-muted-foreground italic">
                Faça questões para ver a análise
              </span>
            ) : (
              <div className="flex gap-1.5">
                {stats.criticas > 0 && (
                  <Badge variant="outline"
                    className="gap-1 text-[11px] border-destructive/30 bg-destructive/10 text-destructive">
                    <TrendingDown className="h-3 w-3" />
                    {stats.criticas} crítica{stats.criticas !== 1 ? "s" : ""}
                  </Badge>
                )}
                {stats.medias > 0 && (
                  <Badge variant="outline"
                    className="gap-1 text-[11px] border-yellow-500/30 bg-yellow-500/10 text-yellow-500">
                    <Minus className="h-3 w-3" />
                    {stats.medias} média{stats.medias !== 1 ? "s" : ""}
                  </Badge>
                )}
                {stats.boas > 0 && (
                  <Badge variant="outline"
                    className="gap-1 text-[11px] border-primary/30 bg-primary/10 text-primary">
                    <TrendingUp className="h-3 w-3" />
                    {stats.boas} boa{stats.boas !== 1 ? "s" : ""}
                  </Badge>
                )}
                {stats.criticas + stats.medias + stats.boas === 0 && (
                  <span className="text-xs text-muted-foreground italic">Sem dados ainda</span>
                )}
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
