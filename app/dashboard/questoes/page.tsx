"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search, Filter, BookmarkPlus, Bookmark, CheckCircle2, XCircle, Eye } from "lucide-react"

const disciplinas = [
  "Todas",
  "Ética Profissional",
  "Direito Constitucional",
  "Direito Civil",
  "Direito Penal",
  "Direito Processual Civil",
  "Direito Processual Penal",
  "Direito do Trabalho",
  "Direito Administrativo",
  "Direito Tributário",
  "Direito Empresarial",
  "Direitos Humanos",
  "Estatuto da OAB",
]

const dificuldades = ["Todas", "Fácil", "Média", "Difícil"]
const bancas = ["Todas", "FGV", "CESPE", "VUNESP"]

const questoesExemplo = [
  {
    id: 1,
    disciplina: "Ética Profissional",
    tema: "Deveres do Advogado",
    banca: "FGV",
    ano: 2023,
    dificuldade: "Média",
    incidencia: "Alta",
    salva: false,
    enunciado:
      "O advogado tem o dever de guardar sigilo profissional sobre os fatos de que tenha tomado conhecimento no exercício da profissão. Sobre esse dever, é correto afirmar que:",
    alternativas: [
      { letra: "A", texto: "O sigilo profissional é absoluto e não comporta exceções." },
      { letra: "B", texto: "O advogado pode revelar segredo profissional para sua própria defesa em processo disciplinar." },
      { letra: "C", texto: "O dever de sigilo se extingue com a morte do cliente." },
      { letra: "D", texto: "O sigilo profissional pode ser dispensado por autorização judicial." },
    ],
    respostaCorreta: "B",
    explicacao:
      "O sigilo profissional do advogado não é absoluto. Uma das exceções previstas no Código de Ética da OAB é justamente a possibilidade de revelação de fatos para a própria defesa em processo disciplinar ou judicial, limitando-se ao estritamente necessário.",
  },
  {
    id: 2,
    disciplina: "Direito Constitucional",
    tema: "Controle de Constitucionalidade",
    banca: "FGV",
    ano: 2023,
    dificuldade: "Difícil",
    incidencia: "Alta",
    salva: true,
    enunciado:
      "Sobre o controle de constitucionalidade no Brasil, assinale a alternativa correta:",
    alternativas: [
      { letra: "A", texto: "O controle difuso somente pode ser exercido pelo STF." },
      { letra: "B", texto: "A ADI pode ser proposta por qualquer cidadão brasileiro." },
      { letra: "C", texto: "O efeito da decisão em ADI é, em regra, erga omnes e vinculante." },
      { letra: "D", texto: "O controle preventivo é exclusivo do Poder Executivo." },
    ],
    respostaCorreta: "C",
    explicacao:
      "A decisão proferida em Ação Direta de Inconstitucionalidade (ADI) possui, em regra, eficácia erga omnes (contra todos) e efeito vinculante em relação aos demais órgãos do Poder Judiciário e à Administração Pública direta e indireta, nas esferas federal, estadual e municipal.",
  },
  {
    id: 3,
    disciplina: "Direito Civil",
    tema: "Contratos",
    banca: "FGV",
    ano: 2022,
    dificuldade: "Fácil",
    incidencia: "Média",
    salva: false,
    enunciado:
      "No Código Civil brasileiro, a evicção corresponde:",
    alternativas: [
      { letra: "A", texto: "À perda total ou parcial da coisa por sentença judicial, reconhecendo direito anterior de outrem." },
      { letra: "B", texto: "Ao defeito oculto na coisa que a torna imprópria ao uso." },
      { letra: "C", texto: "À rescisão contratual por lesão." },
      { letra: "D", texto: "À nulidade do contrato por vício de consentimento." },
    ],
    respostaCorreta: "A",
    explicacao:
      "A evicção ocorre quando o adquirente de um bem perde a propriedade, a posse ou o uso desse bem, em virtude de sentença judicial ou ato de autoridade administrativa, que reconhece a um terceiro direito anterior sobre a coisa.",
  },
]

function QuestaoCard({ questao }: { questao: typeof questoesExemplo[0] }) {
  const [resposta, setResposta] = useState<string>("")
  const [mostrarResposta, setMostrarResposta] = useState(false)
  const [salva, setSalva] = useState(questao.salva)

  const handleResponder = () => {
    setMostrarResposta(true)
  }

  const acertou = resposta === questao.respostaCorreta

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary/30 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{questao.disciplina}</Badge>
            <Badge variant="outline">{questao.tema}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={
                questao.dificuldade === "Fácil"
                  ? "bg-primary/20 text-primary"
                  : questao.dificuldade === "Média"
                  ? "bg-warning/20 text-warning"
                  : "bg-destructive/20 text-destructive"
              }
            >
              {questao.dificuldade}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {questao.banca} {questao.ano}
            </span>
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
            {questao.alternativas.map((alt) => (
              <div
                key={alt.letra}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  mostrarResposta
                    ? alt.letra === questao.respostaCorreta
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
                {mostrarResposta && alt.letra === questao.respostaCorreta && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                )}
                {mostrarResposta && resposta === alt.letra && alt.letra !== questao.respostaCorreta && (
                  <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                )}
              </div>
            ))}
          </RadioGroup>

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
              <p className="text-sm text-muted-foreground">{questao.explicacao}</p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSalva(!salva)}
              className={salva ? "text-primary" : "text-muted-foreground"}
            >
              {salva ? (
                <Bookmark className="mr-2 h-4 w-4 fill-current" />
              ) : (
                <BookmarkPlus className="mr-2 h-4 w-4" />
              )}
              {salva ? "Salva" : "Salvar para revisão"}
            </Button>

            {!mostrarResposta ? (
              <Button onClick={handleResponder} disabled={!resposta}>
                Verificar resposta
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setResposta("")
                  setMostrarResposta(false)
                }}
              >
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
  const [searchTerm, setSearchTerm] = useState("")
  const [disciplina, setDisciplina] = useState("Todas")
  const [dificuldade, setDificuldade] = useState("Todas")
  const [banca, setBanca] = useState("Todas")
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Banco de Questões</h1>
        <p className="text-muted-foreground">
          Mais de 15.000 questões organizadas por disciplina e tema
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
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
                  <Select value={disciplina} onValueChange={setDisciplina}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplinas.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dificuldade</Label>
                  <Select value={dificuldade} onValueChange={setDificuldade}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dificuldades.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Banca</Label>
                  <Select value={banca} onValueChange={setBanca}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bancas.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDisciplina("Todas")
                      setDificuldade("Todas")
                      setBanca("Todas")
                      setSearchTerm("")
                    }}
                    className="w-full"
                  >
                    Limpar filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lista de questões */}
      <div className="space-y-4">
        {questoesExemplo.map((questao) => (
          <QuestaoCard key={questao.id} questao={questao} />
        ))}
      </div>

      {/* Paginação simples */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" disabled>
          Anterior
        </Button>
        <span className="px-4 text-sm text-muted-foreground">Página 1 de 100</span>
        <Button variant="outline">Próximo</Button>
      </div>
    </div>
  )
}
