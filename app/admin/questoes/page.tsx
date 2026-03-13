"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"

const questoesAdmin = [
  {
    id: 1,
    codigo: "Q-001",
    disciplina: "Ética Profissional",
    tema: "Deveres do Advogado",
    banca: "FGV",
    ano: 2023,
    dificuldade: "Média",
    status: "ativo",
  },
  {
    id: 2,
    codigo: "Q-002",
    disciplina: "Direito Constitucional",
    tema: "Controle de Constitucionalidade",
    banca: "FGV",
    ano: 2023,
    dificuldade: "Difícil",
    status: "ativo",
  },
  {
    id: 3,
    codigo: "Q-003",
    disciplina: "Direito Civil",
    tema: "Contratos",
    banca: "FGV",
    ano: 2022,
    dificuldade: "Fácil",
    status: "ativo",
  },
  {
    id: 4,
    codigo: "Q-004",
    disciplina: "Direito Penal",
    tema: "Teoria do Crime",
    banca: "CESPE",
    ano: 2023,
    dificuldade: "Média",
    status: "revisão",
  },
  {
    id: 5,
    codigo: "Q-005",
    disciplina: "Processo Civil",
    tema: "Recursos",
    banca: "FGV",
    ano: 2023,
    dificuldade: "Difícil",
    status: "ativo",
  },
]

export default function AdminQuestoesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Questões</h1>
          <p className="text-muted-foreground">Adicione, edite e gerencie o banco de questões</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Questão
        </Button>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">15.423</p>
            <p className="text-xs text-muted-foreground">Total de questões</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-primary">14.892</p>
            <p className="text-xs text-muted-foreground">Questões ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-warning">423</p>
            <p className="text-xs text-muted-foreground">Em revisão</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-muted-foreground">108</p>
            <p className="text-xs text-muted-foreground">Desativadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de questões */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Banco de Questões</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar questão..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead className="hidden md:table-cell">Tema</TableHead>
                <TableHead className="hidden sm:table-cell">Banca/Ano</TableHead>
                <TableHead className="hidden lg:table-cell">Dificuldade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questoesAdmin.map((questao) => (
                <TableRow key={questao.id}>
                  <TableCell className="font-medium">{questao.codigo}</TableCell>
                  <TableCell>{questao.disciplina}</TableCell>
                  <TableCell className="hidden md:table-cell">{questao.tema}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {questao.banca} {questao.ano}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge
                      variant="secondary"
                      className={
                        questao.dificuldade === "Fácil"
                          ? "bg-primary/10 text-primary"
                          : questao.dificuldade === "Média"
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      }
                    >
                      {questao.dificuldade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={questao.status === "ativo" ? "default" : "secondary"}
                      className={questao.status === "ativo" ? "bg-primary" : "bg-warning text-warning-foreground"}
                    >
                      {questao.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Paginação */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <span className="px-4 text-sm text-muted-foreground">Página 1 de 320</span>
            <Button variant="outline" size="sm">
              Próximo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
