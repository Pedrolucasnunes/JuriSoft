"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Questao {
  id: string
  attemptId: string
  enunciado: string
  alternativa_a: string
  alternativa_b: string
  alternativa_c: string
  alternativa_d: string
  subject_name: string
  topic_name: string
}

interface Resultado {
  acertos: number
  erros: number
  percentual: number
  total: number
  gabarito: {
    question_id: string
    enunciado: string
    resposta_usuario: string
    resposta_correta: string
    acertou: boolean
    subject_name: string
  }[]
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default function SimuladoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: simuladoId } = use(params)
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [loadingQuestoes, setLoadingQuestoes] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(5 * 60 * 60)
  const [showFinishDialog, setShowFinishDialog] = useState(false)
  const [finalizando, setFinalizando] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)

      const res = await fetch(`/api/simulados/${simuladoId}/questoes`)
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Erro ao carregar questões")
        return
      }

      setQuestoes(data.questions)
      setLoadingQuestoes(false)
    }
    init()
  }, [simuladoId])

  useEffect(() => {
    if (resultado) return
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) { clearInterval(timer); setShowFinishDialog(true); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [resultado])

  const questao = questoes[currentQuestion]
  const totalQuestions = questoes.length
  const answeredCount = Object.keys(answers).length

  const handleAnswer = async (valor: string) => {
    if (!userId || !questao) return

    // Salva localmente imediatamente
    setAnswers((prev) => ({ ...prev, [questao.id]: valor }))

    // Registra no backend
    const res = await fetch("/api/simulados/resposta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, questionId: questao.id, simuladoId, resposta: valor }),
    })

    const data = await res.json()

    if (res.ok) {
      if (data.acertou) {
        toast.success("Resposta correta! ✓")
      } else {
        toast.error(`Incorreto — gabarito: ${data.resposta_correta}`)
      }
    }
  }

  const toggleFlag = () => {
    if (!questao) return
    setFlagged((prev) => {
      const s = new Set(prev)
      s.has(questao.id) ? s.delete(questao.id) : s.add(questao.id)
      return s
    })
  }

  const finalizarSimulado = async () => {
    if (!userId) return
    setFinalizando(true)

    const res = await fetch("/api/simulados/finalizar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ simuladoId, userId }),
    })

    const data = await res.json()
    setFinalizando(false)
    setShowFinishDialog(false)

    if (!res.ok) {
      toast.error(data.error ?? "Erro ao finalizar simulado")
      return
    }

    toast.success("Simulado finalizado!")
    setResultado(data)
  }

  if (resultado) {
    return (
      <div className="space-y-6 pb-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Simulado Concluído!</h1>
          <p className="text-muted-foreground">Confira seu resultado abaixo</p>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto sm:grid-cols-4">
          <div className="rounded-lg border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{resultado.acertos}</p>
            <p className="text-xs text-muted-foreground">Acertos</p>
          </div>
          <div className="rounded-lg border border-border p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{resultado.erros}</p>
            <p className="text-xs text-muted-foreground">Erros</p>
          </div>
          <div className="rounded-lg border border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary">{resultado.percentual}%</p>
            <p className="text-xs text-muted-foreground">Aproveitamento</p>
          </div>
          <div className="rounded-lg border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{resultado.total}</p>
            <p className="text-xs text-muted-foreground">Respondidas</p>
          </div>
        </div>
        <div className={`max-w-lg mx-auto rounded-lg border p-4 text-center text-sm font-medium ${resultado.percentual >= 60 ? "border-primary/30 bg-primary/5 text-primary" : "border-destructive/30 bg-destructive/5 text-destructive"}`}>
          {resultado.percentual >= 60 ? "✓ Aprovado — você atingiu a nota mínima da OAB (60%)" : "✗ Reprovado — a nota mínima da OAB é 60%"}
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Gabarito ({resultado.total} questões respondidas)</h2>
          {(resultado.gabarito ?? []).map((item, index) => (
            <div key={`${item.question_id}-${index}`} className={`rounded-lg border p-4 space-y-2 ${item.acertou ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Q{index + 1}</span>
                  <Badge variant="secondary" className="text-xs">{item.subject_name}</Badge>
                </div>
                <Badge variant={item.acertou ? "default" : "destructive"} className={item.acertou ? "bg-primary shrink-0" : "shrink-0"}>
                  {item.acertou ? "✓ Acerto" : "✗ Erro"}
                </Badge>
              </div>
              <p className="text-sm text-foreground leading-relaxed line-clamp-2">{item.enunciado}</p>
              <div className="flex gap-4 text-xs">
                <span className="text-muted-foreground">
                  Sua resposta: <span className={item.acertou ? "text-primary font-medium" : "text-destructive font-medium"}>{item.resposta_usuario}</span>
                </span>
                {!item.acertou && (
                  <span className="text-muted-foreground">
                    Resposta correta: <span className="text-primary font-medium">{item.resposta_correta}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Button onClick={() => router.push("/dashboard/simulados")}>Voltar para Simulados</Button>
        </div>
      </div>
    )
  }

  if (loadingQuestoes) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!questao) return null

  const alternativas = [
    { letra: "A", texto: questao.alternativa_a },
    { letra: "B", texto: questao.alternativa_b },
    { letra: "C", texto: questao.alternativa_c },
    { letra: "D", texto: questao.alternativa_d },
  ]

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground sm:text-lg">Simulado OAB</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">Questão {currentQuestion + 1} de {totalQuestions}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 sm:px-4 sm:py-2">
            <Clock className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
            <span className="font-mono text-base font-semibold text-foreground sm:text-lg">{formatTime(timeRemaining)}</span>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setShowFinishDialog(true)}>Finalizar</Button>
        </div>
      </div>

      <div className="py-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>{answeredCount} de {totalQuestions} respondidas</span>
          <span>{totalQuestions > 0 ? ((answeredCount / totalQuestions) * 100).toFixed(0) : 0}%</span>
        </div>
        <Progress value={totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0} className="h-2" />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="secondary">{questao.subject_name}</Badge>
                <Button variant={flagged.has(questao.id) ? "default" : "ghost"} size="sm" onClick={toggleFlag}>
                  <Flag className="h-4 w-4" />
                  {flagged.has(questao.id) ? "Marcada" : "Marcar para revisão"}
                </Button>
              </div>
              <p className="mb-6 text-foreground leading-relaxed">{questao.enunciado}</p>
              <RadioGroup value={answers[questao.id] || ""} onValueChange={handleAnswer} className="space-y-3">
                {alternativas.map((alt) => (
                  <div key={alt.letra} className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${answers[questao.id] === alt.letra ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <RadioGroupItem value={alt.letra} id={`alt-${alt.letra}`} className="mt-0.5" />
                    <Label htmlFor={`alt-${alt.letra}`} className="flex-1 cursor-pointer text-foreground">
                      <span className="font-medium">{alt.letra})</span> {alt.texto}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="mt-6 flex items-center justify-between">
                <Button variant="outline" onClick={() => setCurrentQuestion((p) => p - 1)} disabled={currentQuestion === 0}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button onClick={() => setCurrentQuestion((p) => p + 1)} disabled={currentQuestion === totalQuestions - 1}>
                  Próxima <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hidden lg:block">
            <CardContent className="p-4">
              <h3 className="mb-4 font-medium text-foreground">Navegação</h3>
              <div className="grid grid-cols-5 gap-2">
                {questoes.map((q, index) => (
                  <button key={q.id} onClick={() => setCurrentQuestion(index)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentQuestion === index ? "bg-primary text-primary-foreground" : answers[q.id] ? "bg-primary/20 text-primary" : flagged.has(q.id) ? "bg-warning/20 text-warning" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-primary/20" /><span className="text-muted-foreground">Respondida</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-warning/20" /><span className="text-muted-foreground">Marcada para revisão</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-secondary" /><span className="text-muted-foreground">Não respondida</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar simulado?</DialogTitle>
            <DialogDescription>
              Você respondeu {answeredCount} de {totalQuestions} questões.
              {answeredCount < totalQuestions && <span className="block mt-2 text-warning">Atenção: {totalQuestions - answeredCount} questões não respondidas.</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowFinishDialog(false)} className="flex-1">Continuar</Button>
            <Button onClick={finalizarSimulado} disabled={finalizando} className="flex-1">
              {finalizando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizando...</> : <><CheckCircle2 className="mr-2 h-4 w-4" /> Finalizar</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}