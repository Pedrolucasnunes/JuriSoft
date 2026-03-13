"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Clock, Play, CheckCircle2, BarChart3, Trophy } from "lucide-react"

const simuladosDisponiveis = [
  {
    id: 1,
    title: "Simulado Diagnóstico",
    description: "Avalie seu nível inicial de conhecimento",
    questions: 80,
    duration: "5 horas",
    difficulty: "Misto",
    status: "disponível",
  },
  {
    id: 2,
    title: "OAB XXXVIII - 2023.2",
    description: "Simulado baseado na prova do 38º Exame",
    questions: 80,
    duration: "5 horas",
    difficulty: "Real",
    status: "disponível",
  },
  {
    id: 3,
    title: "OAB XXXVII - 2023.1",
    description: "Simulado baseado na prova do 37º Exame",
    questions: 80,
    duration: "5 horas",
    difficulty: "Real",
    status: "disponível",
  },
  {
    id: 4,
    title: "Simulado Express",
    description: "Versão reduzida para treino rápido",
    questions: 40,
    duration: "2h 30min",
    difficulty: "Misto",
    status: "disponível",
  },
]

const simuladosRealizados = [
  {
    id: 1,
    title: "OAB XXXVI - 2022.2",
    date: "15 Jan 2024",
    score: 68,
    total: 80,
    percentage: 85,
    time: "4h 32min",
    status: "aprovado",
  },
  {
    id: 2,
    title: "Simulado Diagnóstico",
    date: "08 Jan 2024",
    score: 52,
    total: 80,
    percentage: 65,
    time: "4h 58min",
    status: "reprovado",
  },
  {
    id: 3,
    title: "OAB XXXV - 2022.1",
    date: "02 Jan 2024",
    score: 45,
    total: 80,
    percentage: 56,
    time: "5h 00min",
    status: "reprovado",
  },
]

const resultadoExemplo = {
  score: 68,
  total: 80,
  percentage: 85,
  time: "4h 32min",
  avgTimePerQuestion: "3min 24s",
  disciplines: [
    { name: "Ética Profissional", acertos: 7, total: 8, percentage: 87.5 },
    { name: "Direito Constitucional", acertos: 5, total: 7, percentage: 71.4 },
    { name: "Direito Civil", acertos: 6, total: 8, percentage: 75 },
    { name: "Direito Penal", acertos: 4, total: 6, percentage: 66.7 },
    { name: "Direito Processual Civil", acertos: 7, total: 9, percentage: 77.8 },
    { name: "Direito Processual Penal", acertos: 4, total: 7, percentage: 57.1 },
    { name: "Direito do Trabalho", acertos: 6, total: 7, percentage: 85.7 },
    { name: "Direito Administrativo", acertos: 5, total: 7, percentage: 71.4 },
    { name: "Direito Tributário", acertos: 4, total: 5, percentage: 80 },
    { name: "Direito Empresarial", acertos: 5, total: 6, percentage: 83.3 },
    { name: "Direitos Humanos", acertos: 5, total: 5, percentage: 100 },
    { name: "Estatuto da OAB", acertos: 5, total: 5, percentage: 100 },
  ],
  criticalAreas: ["Direito Processual Penal", "Direito Penal"],
}

function SimuladoCard({ simulado }: { simulado: typeof simuladosDisponiveis[0] }) {
  return (
    <Card className="transition-all hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{simulado.title}</CardTitle>
            <CardDescription className="mt-1">{simulado.description}</CardDescription>
          </div>
          <Badge variant="secondary">{simulado.difficulty}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {simulado.questions} questões
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {simulado.duration}
          </div>
        </div>
        <Button className="mt-4 w-full" asChild>
          <a href={`/dashboard/simulados/${simulado.id}`}>
            <Play className="mr-2 h-4 w-4" />
            Iniciar simulado
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

function ResultadoCard({ resultado }: { resultado: typeof simuladosRealizados[0] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer transition-all hover:border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    resultado.status === "aprovado" ? "bg-primary/10" : "bg-destructive/10"
                  }`}
                >
                  {resultado.status === "aprovado" ? (
                    <Trophy className="h-6 w-6 text-primary" />
                  ) : (
                    <BarChart3 className="h-6 w-6 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{resultado.title}</p>
                  <p className="text-sm text-muted-foreground">{resultado.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {resultado.score}/{resultado.total}
                </p>
                <Badge
                  variant={resultado.status === "aprovado" ? "default" : "destructive"}
                  className={resultado.status === "aprovado" ? "bg-primary" : ""}
                >
                  {resultado.percentage}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resultado: {resultado.title}</DialogTitle>
          <DialogDescription>Análise detalhada do seu desempenho</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{resultadoExemplo.score}/{resultadoExemplo.total}</p>
              <p className="text-xs text-muted-foreground">Acertos</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{resultadoExemplo.percentage}%</p>
              <p className="text-xs text-muted-foreground">Aproveitamento</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{resultadoExemplo.time}</p>
              <p className="text-xs text-muted-foreground">Tempo total</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{resultadoExemplo.avgTimePerQuestion}</p>
              <p className="text-xs text-muted-foreground">Média/questão</p>
            </div>
          </div>

          {/* Desempenho por disciplina */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Desempenho por Disciplina</h4>
            <div className="space-y-3">
              {resultadoExemplo.disciplines.map((discipline) => (
                <div key={discipline.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{discipline.name}</span>
                    <span className="text-muted-foreground">
                      {discipline.acertos}/{discipline.total} ({discipline.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress
                    value={discipline.percentage}
                    className={`h-2 ${discipline.percentage < 60 ? "[&>div]:bg-destructive" : ""}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Matérias críticas */}
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <h4 className="mb-2 font-semibold text-foreground">Matérias Críticas</h4>
            <p className="text-sm text-muted-foreground">
              Recomendamos focar seus estudos em:{" "}
              <span className="font-medium text-destructive">
                {resultadoExemplo.criticalAreas.join(", ")}
              </span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function SimuladosPage() {
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
            {simuladosDisponiveis.map((simulado) => (
              <SimuladoCard key={simulado.id} simulado={simulado} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="realizados" className="mt-6">
          <div className="space-y-4">
            {simuladosRealizados.map((resultado) => (
              <ResultadoCard key={resultado.id} resultado={resultado} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
