"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search, SlidersHorizontal, CheckCircle2, XCircle, Loader2, RotateCcw } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Questao {
  id: string
  enunciado: string
  alternativa_a: string
  alternativa_b: string
  alternativa_c: string
  alternativa_d: string
  dificuldade: string
  banca: string
  ano: number
  subject_id: string
  topic_id: string
  subject_name: string
  topic_name: string
}

interface Filtros {
  subjects: { id: string; name: string }[]
  dificuldades: string[]
  bancas: string[]
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

function getDificuldadeColor(dificuldade: string) {
  switch (dificuldade?.toLowerCase()) {
    case "fácil":
    case "facil":
      return "bg-primary/15 text-primary border-primary/20"
    case "média":
    case "media":
    case "médio":
    case "medio":
      return "bg-yellow-500/15 text-yellow-500 border-yellow-500/20"
    case "difícil":
    case "dificil":
      return "bg-destructive/15 text-destructive border-destructive/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function LetraBox({ letra, estado }: { letra: string; estado: "neutro" | "selecionado" | "correto" | "errado" | "desbotado" }) {
  const classes = {
    neutro: "bg-muted text-muted-foreground",
    selecionado: "bg-primary/20 text-primary",
    correto: "bg-primary text-primary-foreground",
    errado: "bg-destructive text-destructive-foreground",
    desbotado: "bg-muted/50 text-muted-foreground/50",
  }
  return (
    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold ${classes[estado]}`}>
      {letra}
    </span>
  )
}

function QuestaoCard({ questao, userId }: { questao: Questao; userId: string }) {
  const [resposta, setResposta] = useState<string>("")
  const [mostrarResposta, setMostrarResposta] = useState(false)
  const [respostaCorreta, setRespostaCorreta] = useState<string | null>(null)
  const [explicacao, setExplicacao] = useState<string | null>(null)
  const [acertou, setAcertou] = useState<boolean | null>(null)
  const [verificando, setVerificando] = useState(false)

  const alternativas = [
    { letra: "A", texto: questao.alternativa_a },
    { letra: "B", texto: questao.alternativa_b },
    { letra: "C", texto: questao.alternativa_c },
    { letra: "D", texto: questao.alternativa_d },
  ]

  const handleVerificar = async () => {
    if (!resposta || !userId) return
    setVerificando(true)

    const res = await fetch("/api/simulados/resposta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, questionId: questao.id, simuladoId: null, resposta }),
    })

    const data = await res.json()
    setVerificando(false)

    if (!res.ok) { console.error("Erro ao verificar:", data.error); return }

    setAcertou(data.acertou)
    setRespostaCorreta(data.resposta_correta)
    setMostrarResposta(true)

    const { data: qData } = await supabase
      .from("questions").select("explicacao").eq("id", questao.id).single()
    if (qData?.explicacao) setExplicacao(qData.explicacao)
  }

  const handleTentarNovamente = () => {
    setResposta(""); setMostrarResposta(false)
    setRespostaCorreta(null); setExplicacao(null); setAcertou(null)
  }

  const getEstadoLetra = (letra: string) => {
    if (!mostrarResposta) return resposta === letra ? "selecionado" : "neutro"
    if (letra === respostaCorreta) return "correto"
    if (letra === resposta) return "errado"
    return "desbotado"
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/15 text-primary border border-primary/20 font-medium">
              {questao.subject_name}
            </Badge>
            {questao.topic_name && (
              <span className="text-xs text-muted-foreground">{questao.topic_name}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {questao.dificuldade && (
              <Badge className={`border text-xs ${getDificuldadeColor(questao.dificuldade)}`}>
                {questao.dificuldade}
              </Badge>
            )}
            {(questao.banca || questao.ano) && (
              <span className="font-mono text-xs text-muted-foreground">
                {[questao.banca, questao.ano].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        </div>

        {/* Enunciado */}
        <div className="px-4 pt-4 pb-3">
          <p className="text-sm leading-relaxed text-foreground">{questao.enunciado}</p>
        </div>

        {/* Alternativas */}
        <div className="space-y-2 px-4 pb-4">
          {alternativas.map((alt) => {
            const estado = getEstadoLetra(alt.letra)
            const isCorreto = mostrarResposta && alt.letra === respostaCorreta
            const isErrado = mostrarResposta && alt.letra === resposta && alt.letra !== respostaCorreta
            const isDesbotado = mostrarResposta && alt.letra !== respostaCorreta && alt.letra !== resposta

            return (
              <button
                key={alt.letra}
                disabled={mostrarResposta}
                onClick={() => !mostrarResposta && setResposta(alt.letra)}
                className={`w-full flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-150 ${
                  isCorreto
                    ? "border-primary/40 bg-primary/8"
                    : isErrado
                    ? "border-destructive/40 bg-destructive/8"
                    : isDesbotado
                    ? "border-border/50 opacity-50"
                    : resposta === alt.letra
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/40 cursor-pointer"
                }`}
              >
                <LetraBox letra={alt.letra} estado={estado} />
                <span className={`flex-1 text-sm leading-relaxed ${isDesbotado ? "text-muted-foreground" : "text-foreground"}`}>
                  {alt.texto}
                </span>
                {isCorreto && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />}
                {isErrado && <XCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />}
              </button>
            )
          })}

          {/* Gabarito + Explicação */}
          {mostrarResposta && (
            <div className={`mt-1 rounded-lg border p-4 ${acertou ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}`}>
              <p className={`text-sm font-semibold ${acertou ? "text-primary" : "text-destructive"}`}>
                Gabarito {respostaCorreta} — {acertou ? "Correto" : "Incorreto"}
              </p>
              {explicacao && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{explicacao}</p>
              )}
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end pt-1">
            {!mostrarResposta ? (
              <Button size="sm" onClick={handleVerificar} disabled={!resposta || verificando}>
                {verificando
                  ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Verificando...</>
                  : "Verificar resposta"
                }
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={handleTentarNovamente}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Tentar novamente
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function QuestoesPage() {
  const [userId, setUserId] = useState<string>("")
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [filtros, setFiltros] = useState<Filtros>({ subjects: [], dificuldades: [], bancas: [] })
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [loadingFiltros, setLoadingFiltros] = useState(true)
  const [showFiltrosAvancados, setShowFiltrosAvancados] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [subjectId, setSubjectId] = useState("todas")
  const [dificuldade, setDificuldade] = useState("todas")
  const [banca, setBanca] = useState("todas")
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const res = await fetch("/api/questions/filtros")
      const data = await res.json()
      setFiltros(data)
      setLoadingFiltros(false)
    }
    init()
  }, [])

  const fetchQuestoes = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(page))
    if (subjectId !== "todas") params.set("subjectId", subjectId)
    if (dificuldade !== "todas") params.set("dificuldade", dificuldade)
    if (banca !== "todas") params.set("banca", banca)
    if (searchTerm.trim()) params.set("busca", searchTerm.trim())

    const res = await fetch(`/api/questions?${params.toString()}`)
    const data = await res.json()
    setQuestoes(data.questions ?? [])
    setPagination(data.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 0 })
    setLoading(false)
  }, [page, subjectId, dificuldade, banca, searchTerm])

  useEffect(() => { fetchQuestoes() }, [fetchQuestoes])

  const handleLimparFiltros = () => {
    setSubjectId("todas"); setDificuldade("todas")
    setBanca("todas"); setSearchTerm(""); setPage(1)
  }

  const temFiltrosAtivos = subjectId !== "todas" || dificuldade !== "todas" || banca !== "todas"

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Banco de Questões</h1>
        <p className="text-muted-foreground text-sm">
          {pagination.total > 0
            ? `${pagination.total.toLocaleString("pt-BR")} questões organizadas por disciplina e tema`
            : "Questões organizadas por disciplina e tema"}
        </p>
      </div>

      {/* Busca + botão filtros avançados */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por tema ou palavra-chave..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFiltrosAvancados(!showFiltrosAvancados)}
          className={temFiltrosAtivos ? "border-primary/50 text-primary" : ""}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filtros
          {temFiltrosAtivos && (
            <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
              {(subjectId !== "todas" ? 1 : 0) + (dificuldade !== "todas" ? 1 : 0) + (banca !== "todas" ? 1 : 0)}
            </span>
          )}
        </Button>
      </div>

      {/* Filtros avançados */}
      {showFiltrosAvancados && (
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label>Disciplina</Label>
                <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setPage(1) }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {loadingFiltros
                      ? <SelectItem value="_loading" disabled>Carregando...</SelectItem>
                      : filtros.subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Select value={dificuldade} onValueChange={(v) => { setDificuldade(v); setPage(1) }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {filtros.dificuldades.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Banca</Label>
                <Select value={banca} onValueChange={(v) => { setBanca(v); setPage(1) }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {filtros.bancas.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={handleLimparFiltros} className="w-full">
                  Limpar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de questões */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : questoes.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground text-sm">Nenhuma questão encontrada com esses filtros.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questoes.map((questao) => (
            <QuestaoCard key={questao.id} questao={questao} userId={userId} />
          ))}
        </div>
      )}

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setPage((p) => p - 1)} disabled={page === 1 || loading}>
            Anterior
          </Button>
          <span className="px-4 text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={page === pagination.totalPages || loading}>
            Próximo
          </Button>
        </div>
      )}
    </div>
  )
}
