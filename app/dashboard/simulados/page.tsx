"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Clock, Play, Loader2, RotateCcw } from "lucide-react"
import { toast } from "sonner"

interface SimuladoRealizado {
  id: string
  titulo: string
  created_at: string
  acertos: number
  erros: number
  percentual: number
  numero_questoes: number
}

export default function SimuladosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [refazendoId, setRefazendoId] = useState<string | null>(null)
  const [loadingHistorico, setLoadingHistorico] = useState(true)
  const [simuladosRealizados, setSimuladosRealizados] = useState<SimuladoRealizado[]>([])

  useEffect(() => {
    async function init() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("simulados")
        .select("id, titulo, created_at, acertos, erros, percentual, numero_questoes")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      setSimuladosRealizados(data ?? [])
      setLoadingHistorico(false)
    }
    init()
  }, [])

  const iniciarSimulado = async (refazendoSimuladoId?: string) => {
    if (refazendoSimuladoId) {
      setRefazendoId(refazendoSimuladoId)
    } else {
      setLoading(true)
    }

    try {
      const res = await fetch("/api/simulados/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao gerar simulado")
        return
      }
      router.push(`/dashboard/simulados/${data.simuladoId}`)
    } catch {
      toast.error("Erro inesperado ao gerar simulado")
    } finally {
      setLoading(false)
      setRefazendoId(null)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })

  // Simulados disponíveis (hardcoded por enquanto)
  const simuladosDisponiveis = [
    {
      id: "oab-multidisciplinar",
      titulo: "Simulado OAB — Multidisciplinar",
      descricao: "80 questões aleatórias cobrindo todas as disciplinas no formato oficial da OAB",
      badge: "Todas as matérias",
      questoes: 80,
      duracao: "5 horas",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Simulados</h1>
        <p className="text-muted-foreground">
          Pratique com simulados completos no formato da prova oficial da OAB
        </p>
      </div>

      <Tabs defaultValue="disponiveis">
        <TabsList>
          <TabsTrigger value="disponiveis">
            Disponíveis ({simuladosDisponiveis.length})
          </TabsTrigger>
          <TabsTrigger value="realizados">
            Realizados ({loadingHistorico ? "…" : simuladosRealizados.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Disponíveis ── */}
        <TabsContent value="disponiveis" className="mt-6 space-y-8">
          <div className="space-y-4">
            {simuladosDisponiveis.map((s) => (
              <Card key={s.id} className="transition-all hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{s.titulo}</CardTitle>
                      <CardDescription className="mt-1">{s.descricao}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0">{s.badge}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" /> {s.questoes} questões
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {s.duracao}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => iniciarSimulado()}
                    disabled={loading}
                  >
                    {loading
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...</>
                      : <><Play className="mr-2 h-4 w-4" /> Iniciar simulado</>
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

        </TabsContent>

        {/* ── Realizados (aba dedicada) ── */}
        <TabsContent value="realizados" className="mt-6">
          {loadingHistorico ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : simuladosRealizados.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum simulado realizado ainda.</p>
          ) : (
            <div className="space-y-3">
              {simuladosRealizados.map((s) => {
                const aprovado = s.percentual >= 60
                return (
                  <Card key={s.id} className="transition-all hover:border-border/80">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {s.titulo ?? "Simulado OAB — Multidisciplinar"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(s.created_at)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xl font-bold ${aprovado ? "text-primary" : "text-destructive"}`}>
                            {s.acertos}/{s.numero_questoes}
                          </p>
                          <p className={`text-xs font-medium ${aprovado ? "text-primary" : "text-destructive"}`}>
                            {s.percentual}% — {aprovado ? "Aprovado" : "Reprovado"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/dashboard/simulados/${s.id}`)}
                        >
                          Ver gabarito
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => iniciarSimulado(s.id)}
                          disabled={refazendoId === s.id}
                        >
                          {refazendoId === s.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <><RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Refazer</>
                          }
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
