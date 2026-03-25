"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Clock, Play, BarChart3, Trophy, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

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
  const [loadingHistorico, setLoadingHistorico] = useState(true)
  const [simuladosRealizados, setSimuladosRealizados] = useState<SimuladoRealizado[]>([])
  const [selectedSimulado, setSelectedSimulado] = useState<SimuladoRealizado | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

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

  const iniciarSimulado = async () => {
    if (!userId) return
    setLoading(true)

    try {
      const res = await fetch("/api/simulados/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error ?? "Erro ao gerar simulado")
        return
      }

      router.push(`/dashboard/simulados/${data.simuladoId}`)
    } catch {
      alert("Erro inesperado ao gerar simulado")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })

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
          <TabsTrigger value="disponiveis">Disponíveis</TabsTrigger>
          <TabsTrigger value="realizados">Realizados</TabsTrigger>
        </TabsList>

        <TabsContent value="disponiveis" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card único — simulado padrão OAB */}
            <Card className="transition-all hover:border-primary/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Simulado OAB</CardTitle>
                    <CardDescription className="mt-1">
                      80 questões aleatórias no formato oficial da OAB
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Misto</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    80 questões
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    5 horas
                  </div>
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={iniciarSimulado}
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...</>
                  ) : (
                    <><Play className="mr-2 h-4 w-4" /> Iniciar simulado</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realizados" className="mt-6">
          {loadingHistorico ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : simuladosRealizados.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum simulado realizado ainda.</p>
          ) : (
            <div className="space-y-4">
              {simuladosRealizados.map((s) => (
                <Card
                  key={s.id}
                  className="cursor-pointer transition-all hover:border-primary/50"
                  onClick={() => setSelectedSimulado(s)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                          s.percentual >= 60 ? "bg-primary/10" : "bg-destructive/10"
                        }`}>
                          {s.percentual >= 60
                            ? <Trophy className="h-6 w-6 text-primary" />
                            : <BarChart3 className="h-6 w-6 text-destructive" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{s.titulo ?? "Simulado OAB"}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(s.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          {s.acertos}/{s.numero_questoes}
                        </p>
                        <Badge variant={s.percentual >= 60 ? "default" : "destructive"}>
                          {s.percentual}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog resultado */}
      <Dialog open={!!selectedSimulado} onOpenChange={() => setSelectedSimulado(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resultado: {selectedSimulado?.titulo ?? "Simulado OAB"}</DialogTitle>
            <DialogDescription>Resumo do seu desempenho</DialogDescription>
          </DialogHeader>
          {selectedSimulado && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-border p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {selectedSimulado.acertos}/{selectedSimulado.numero_questoes}
                  </p>
                  <p className="text-xs text-muted-foreground">Acertos</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{selectedSimulado.percentual}%</p>
                  <p className="text-xs text-muted-foreground">Aproveitamento</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedSimulado.erros}</p>
                  <p className="text-xs text-muted-foreground">Erros</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Aproveitamento</span>
                  <span className="font-medium">{selectedSimulado.percentual}%</span>
                </div>
                <Progress value={selectedSimulado.percentual} className="h-2" />
              </div>
              <div className={`rounded-lg border p-3 text-sm ${
                selectedSimulado.percentual >= 60
                  ? "border-primary/30 bg-primary/5 text-primary"
                  : "border-destructive/30 bg-destructive/5 text-destructive"
              }`}>
                {selectedSimulado.percentual >= 60
                  ? "✓ Aprovado — você atingiu a nota mínima da OAB (60%)"
                  : "✗ Reprovado — a nota mínima da OAB é 60%"
                }
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}