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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search, Filter, CheckCircle2, XCircle, Loader2 } from "lucide-react"
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
      return "bg-primary/20 text-primary"
    case "média":
    case "media":
    case "médio":
      return "bg-warning/20 text-warning"
    case "difícil":
    case "dificil":
      return "bg-destructive/20 text-destructive"
    default:
      return "bg-secondary text-muted-foreground"
  }
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
      body: JSON.stringify({
        userId,
        questionId: questao.id,
        simuladoId: null,
        resposta,
      }),
    })

    const data = await res.json()
    setVerificando(false)

    if (!res.ok) {
      console.error("Erro ao verificar:", data.error)
      return
    }

    setAcertou(data.acertou)
    setRespostaCorreta(data.resposta_correta)
    setMostrarResposta(true)

    // Busca explicação da questão
    const { data: qData } = await supabase
      .from("questions")
      .select("explicacao")
      .eq("id", questao.id)
      .single()

    if (qData?.explicacao) setExplicacao(qData.explicacao)
  }

  const handleTentarNovamente = () => {
    setResposta("")
    setMostrarResposta(false)
    setRespostaCorreta(null)
    setExplicacao(null)
    setAcertou(null)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header da questão */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary/30 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{questao.subject_name}</Badge>
            <Badge variant="outline">{questao.topic_name}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {questao.dificuldade && (
              <Badge className={getDificuldadeColor(questao.dificuldade)}>
                {questao.dificuldade}
              </Badge>
            )}
            {(questao.banca || questao.ano) && (
              <span className="text-xs text-muted-foreground">
                {questao.banca} {questao.ano}
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <p className="mb-4 text-foreground leading-relaxed">{questao.enunciado}</p>

          <RadioGroup
            value={resposta}
            onValueChange={setResposta}
            className="space-y-2"
            disabled={mostrarResposta}
          >
            {alternativas.map((alt) => (
              <div
                key={alt.letra}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  mostrarResposta
                    ? alt.letra === respostaCorreta
                      ? "border-primary bg-primary/5"
                      : resposta === alt.letra
                      ? "border-destructive bg-destructive/5"
                      : "border-border"
                    : resposta === alt.letra
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value={alt.letra} id={`q${questao.id}-${alt.letra}`} className="mt-0.5" />
                <Label
                  htmlFor={`q${questao.id}-${alt.letra}`}
                  className="flex-1 cursor-pointer text-sm text-foreground"
                >
                  <span className="font-medium">{alt.letra})</span> {alt.texto}
                </Label>
                {mostrarResposta && alt.letra === respostaCorreta && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                )}
                {mostrarResposta && resposta === alt.letra && alt.letra !== respostaCorreta && (
                  <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                )}
              </div>
            ))}
          </RadioGroup>

          {/* Feedback */}
          {mostrarResposta && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-4">
              <div className="mb-2 flex items-center gap-2">
                {acertou ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium text-primary">Resposta correta!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="font-medium text-destructive">Resposta incorreta</span>
                  </>
                )}
              </div>
              {explicacao && (
                <p className="text-sm text-muted-foreground">{explicacao}</p>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-end">
            {!mostrarResposta ? (
              <Button onClick={handleVerificar} disabled={!resposta || verificando}>
                {verificando
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</>
                  : "Verificar resposta"
                }
              </Button>
            ) : (
              <Button variant="outline" onClick={handleTentarNovamente}>
                Tentar novamente
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

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectId, setSubjectId] = useState("todas")
  const [dificuldade, setDificuldade] = useState("todas")
  const [banca, setBanca] = useState("todas")
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  // Busca usuário e filtros ao montar
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

  // Busca questões quando filtros ou página mudam
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

  useEffect(() => {
    fetchQuestoes()
  }, [fetchQuestoes])

  const handleLimparFiltros = () => {
    setSubjectId("todas")
    setDificuldade("todas")
    setBanca("todas")
    setSearchTerm("")
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Banco de Questões</h1>
        <p className="text-muted-foreground">
          {pagination.total > 0
            ? `${pagination.total.toLocaleString("pt-BR")} questões organizadas por disciplina e tema`
            : "Questões organizadas por disciplina e tema"
          }
        </p>
      </div>

      {/* Barra de busca e filtros */}
      <div className="space-y-4">
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
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Disciplina</Label>
                  <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setPage(1) }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      {loadingFiltros ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : (
                        filtros.subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dificuldade</Label>
                  <Select value={dificuldade} onValueChange={(v) => { setDificuldade(v); setPage(1) }}>
                    <SelectTrigger>
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
                    <SelectTrigger>
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
      </div>

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
          <Button
            variant="outline"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1 || loading}
          >
            Anterior
          </Button>
          <span className="px-4 text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === pagination.totalPages || loading}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  )
}