"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dumbbell, Target, Lightbulb, Play, AlertTriangle, TrendingUp } from "lucide-react"

const treinoOptions = [
  { value: "10", label: "10 questões", description: "Treino rápido (15-20 min)" },
  { value: "20", label: "20 questões", description: "Treino médio (30-40 min)" },
  { value: "30", label: "30 questões", description: "Treino completo (45-60 min)" },
]

const materiasParaTreinar = [
  {
    name: "Processo Penal",
    percentage: 45,
    questoesDisponiveis: 234,
    status: "crítico",
    recomendacao: "Foque em: recursos e nulidades",
  },
  {
    name: "Direito Penal",
    percentage: 55,
    questoesDisponiveis: 312,
    status: "alerta",
    recomendacao: "Revise: teoria do crime e concurso de pessoas",
  },
  {
    name: "Direito Administrativo",
    percentage: 58,
    questoesDisponiveis: 287,
    status: "alerta",
    recomendacao: "Pratique: atos administrativos e licitações",
  },
  {
    name: "Direito Constitucional",
    percentage: 62,
    questoesDisponiveis: 456,
    status: "atenção",
    recomendacao: "Aprofunde: controle de constitucionalidade",
  },
]

const ultimosTreinos = [
  {
    id: 1,
    data: "Hoje, 14:30",
    questoes: 20,
    acertos: 14,
    materias: ["Processo Penal", "Penal"],
    tempo: "28 min",
  },
  {
    id: 2,
    data: "Ontem, 10:15",
    questoes: 10,
    acertos: 8,
    materias: ["Administrativo"],
    tempo: "12 min",
  },
  {
    id: 3,
    data: "20 Jan, 16:45",
    questoes: 30,
    acertos: 21,
    materias: ["Constitucional", "Civil"],
    tempo: "42 min",
  },
]

export default function TreinoPage() {
  const [quantidadeQuestoes, setQuantidadeQuestoes] = useState("20")
  const [treinoIniciado, setTreinoIniciado] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Treino Estratégico</h1>
        <p className="text-muted-foreground">
          Questões personalizadas baseadas no seu desempenho
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="space-y-6 lg:col-span-2">
          {/* Alerta de recomendação */}
          <Alert className="border-warning/50 bg-warning/5">
            <Lightbulb className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning">Recomendação inteligente</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Você errou várias questões sobre <strong>controle de constitucionalidade</strong> e{" "}
              <strong>recursos no processo penal</strong>. Recomendamos revisar estes temas antes de continuar.
            </AlertDescription>
          </Alert>

          {/* Card de iniciar treino */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Iniciar novo treino
              </CardTitle>
              <CardDescription>
                70% das questões serão de matérias com baixo desempenho, 30% de questões gerais para manter o ritmo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block text-sm font-medium">
                  Quantas questões você quer resolver?
                </Label>
                <RadioGroup
                  value={quantidadeQuestoes}
                  onValueChange={setQuantidadeQuestoes}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  {treinoOptions.map((option) => (
                    <div key={option.value}>
                      <RadioGroupItem
                        value={option.value}
                        id={`treino-${option.value}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`treino-${option.value}`}
                        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-border p-4 transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-secondary"
                      >
                        <span className="text-2xl font-bold text-foreground">{option.value}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <h4 className="mb-3 text-sm font-medium text-foreground">
                  Distribuição do treino
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Matérias em risco (70%)</span>
                    <span className="font-medium text-foreground">
                      {Math.round(parseInt(quantidadeQuestoes) * 0.7)} questões
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Questões gerais (30%)</span>
                    <span className="font-medium text-foreground">
                      {Math.round(parseInt(quantidadeQuestoes) * 0.3)} questões
                    </span>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg">
                <Play className="mr-2 h-5 w-5" />
                Iniciar treino com {quantidadeQuestoes} questões
              </Button>
            </CardContent>
          </Card>

          {/* Matérias para treinar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Matérias para treinar
              </CardTitle>
              <CardDescription>
                Baseado no seu desempenho nos últimos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {materiasParaTreinar.map((materia) => (
                  <div
                    key={materia.name}
                    className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{materia.name}</span>
                        <Badge
                          variant={
                            materia.status === "crítico"
                              ? "destructive"
                              : materia.status === "alerta"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            materia.status === "alerta"
                              ? "bg-warning text-warning-foreground"
                              : ""
                          }
                        >
                          {materia.status}
                        </Badge>
                      </div>
                      <Progress
                        value={materia.percentage}
                        className={`h-2 ${materia.percentage < 60 ? "[&>div]:bg-destructive" : materia.percentage < 70 ? "[&>div]:bg-warning" : ""}`}
                      />
                      <p className="text-xs text-muted-foreground">
                        {materia.recomendacao}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{materia.percentage}%</p>
                      <p className="text-xs text-muted-foreground">
                        {materia.questoesDisponiveis} questões
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">
          {/* Estatísticas de treino */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seu progresso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Questões esta semana</span>
                <span className="text-lg font-bold text-foreground">127</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taxa de acerto</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-foreground">72%</span>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sequência</span>
                <span className="text-lg font-bold text-foreground">5 dias</span>
              </div>
            </CardContent>
          </Card>

          {/* Últimos treinos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Últimos treinos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ultimosTreinos.map((treino) => (
                  <div
                    key={treino.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {treino.acertos}/{treino.questoes} acertos
                      </p>
                      <p className="text-xs text-muted-foreground">{treino.data}</p>
                    </div>
                    <Badge variant="secondary">
                      {Math.round((treino.acertos / treino.questoes) * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
