"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2 } from "lucide-react"

// Questões de exemplo
const questoes = [
  {
    id: 1,
    numero: 1,
    disciplina: "Ética Profissional",
    enunciado:
      "João, advogado regularmente inscrito na OAB, foi contratado por uma empresa para prestar serviços de consultoria jurídica. Durante a execução do contrato, João percebeu que a empresa estava praticando atos ilegais. Diante dessa situação, qual deve ser a conduta de João?",
    alternativas: [
      { letra: "A", texto: "Denunciar imediatamente a empresa às autoridades competentes." },
      { letra: "B", texto: "Continuar prestando os serviços, pois não pode violar o sigilo profissional." },
      { letra: "C", texto: "Renunciar ao mandato e comunicar ao cliente os motivos da renúncia." },
      { letra: "D", texto: "Orientar a empresa sobre a necessidade de regularização e, não sendo atendido, renunciar ao mandato." },
    ],
    respostaCorreta: "D",
  },
  {
    id: 2,
    numero: 2,
    disciplina: "Direito Constitucional",
    enunciado:
      "A Constituição Federal estabelece que são brasileiros natos os nascidos no estrangeiro de pai brasileiro ou de mãe brasileira, desde que sejam registrados em repartição brasileira competente ou venham a residir na República Federativa do Brasil e optem, em qualquer tempo, depois de atingida a maioridade, pela nacionalidade brasileira. Com base nesse dispositivo, é correto afirmar que:",
    alternativas: [
      { letra: "A", texto: "A opção pela nacionalidade brasileira pode ser feita a qualquer tempo, mesmo antes da maioridade." },
      { letra: "B", texto: "O registro em repartição brasileira competente é obrigatório para aquisição da nacionalidade brasileira." },
      { letra: "C", texto: "A residência no Brasil e a opção pela nacionalidade são requisitos alternativos ao registro." },
      { letra: "D", texto: "A opção pela nacionalidade brasileira é irrevogável uma vez exercida." },
    ],
    respostaCorreta: "C",
  },
  {
    id: 3,
    numero: 3,
    disciplina: "Direito Civil",
    enunciado:
      "Em relação à prescrição no Código Civil, assinale a alternativa correta:",
    alternativas: [
      { letra: "A", texto: "A prescrição pode ser reconhecida de ofício pelo juiz em qualquer caso." },
      { letra: "B", texto: "Os absolutamente incapazes estão sujeitos à prescrição." },
      { letra: "C", texto: "A renúncia à prescrição pode ser expressa ou tácita, e só valerá, sendo feita, sem prejuízo de terceiro, depois que a prescrição se consumar." },
      { letra: "D", texto: "As causas que impedem a prescrição são as mesmas que a suspendem e a interrompem." },
    ],
    respostaCorreta: "C",
  },
]

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default function SimuladoPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(5 * 60 * 60) // 5 horas em segundos
  const [showFinishDialog, setShowFinishDialog] = useState(false)

  const questao = questoes[currentQuestion]
  const totalQuestions = questoes.length
  const answeredCount = Object.keys(answers).length

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          setShowFinishDialog(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questao.id]: value,
    }))
  }

  const toggleFlag = () => {
    setFlagged((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questao.id)) {
        newSet.delete(questao.id)
      } else {
        newSet.add(questao.id)
      }
      return newSet
    })
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index)
  }

  const finishSimulado = () => {
    router.push("/dashboard/simulados")
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header do simulado */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Simulado Diagnóstico</h1>
          <p className="text-sm text-muted-foreground">
            Questão {currentQuestion + 1} de {totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-lg font-semibold text-foreground">
              {formatTime(timeRemaining)}
            </span>
          </div>
          <Button variant="destructive" onClick={() => setShowFinishDialog(true)}>
            Finalizar
          </Button>
        </div>
      </div>

      {/* Progresso */}
      <div className="py-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>{answeredCount} de {totalQuestions} respondidas</span>
          <span>{((answeredCount / totalQuestions) * 100).toFixed(0)}%</span>
        </div>
        <Progress value={(answeredCount / totalQuestions) * 100} className="h-2" />
      </div>

      {/* Conteúdo da questão */}
      <div className="flex-1 overflow-auto">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Questão */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="secondary">{questao.disciplina}</Badge>
                <Button
                  variant={flagged.has(questao.id) ? "default" : "ghost"}
                  size="sm"
                  onClick={toggleFlag}
                >
                  <Flag className="h-4 w-4" />
                  {flagged.has(questao.id) ? "Marcada" : "Marcar para revisão"}
                </Button>
              </div>

              <div className="mb-6">
                <p className="text-foreground leading-relaxed">{questao.enunciado}</p>
              </div>

              <RadioGroup
                value={answers[questao.id] || ""}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {questao.alternativas.map((alt) => (
                  <div
                    key={alt.letra}
                    className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                      answers[questao.id] === alt.letra
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={alt.letra} id={`alt-${alt.letra}`} className="mt-0.5" />
                    <Label htmlFor={`alt-${alt.letra}`} className="flex-1 cursor-pointer text-foreground">
                      <span className="font-medium">{alt.letra})</span> {alt.texto}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Navegação */}
              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => goToQuestion(currentQuestion - 1)}
                  disabled={currentQuestion === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  onClick={() => goToQuestion(currentQuestion + 1)}
                  disabled={currentQuestion === totalQuestions - 1}
                >
                  Próxima
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Painel de navegação */}
          <Card className="hidden lg:block">
            <CardContent className="p-4">
              <h3 className="mb-4 font-medium text-foreground">Navegação</h3>
              <div className="grid grid-cols-5 gap-2">
                {questoes.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(index)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentQuestion === index
                        ? "bg-primary text-primary-foreground"
                        : answers[q.id]
                        ? "bg-primary/20 text-primary"
                        : flagged.has(q.id)
                        ? "bg-warning/20 text-warning"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-primary/20" />
                  <span className="text-muted-foreground">Respondida</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-warning/20" />
                  <span className="text-muted-foreground">Marcada para revisão</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-secondary" />
                  <span className="text-muted-foreground">Não respondida</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de finalização */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar simulado?</DialogTitle>
            <DialogDescription>
              Você respondeu {answeredCount} de {totalQuestions} questões.
              {answeredCount < totalQuestions && (
                <span className="block mt-2 text-warning">
                  Atenção: Existem {totalQuestions - answeredCount} questões não respondidas.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowFinishDialog(false)} className="flex-1">
              Continuar
            </Button>
            <Button onClick={finishSimulado} className="flex-1">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finalizar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
