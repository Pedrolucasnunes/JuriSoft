"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Search, MoreHorizontal, Edit, Trash2, Eye, Mail } from "lucide-react"

const usuariosAdmin = [
  {
    id: 1,
    nome: "João Silva",
    email: "joao@email.com",
    plano: "Premium",
    cadastro: "10 Jan 2024",
    ultimoAcesso: "Hoje, 14:30",
    simulados: 12,
    status: "ativo",
  },
  {
    id: 2,
    nome: "Maria Santos",
    email: "maria@email.com",
    plano: "Free",
    cadastro: "15 Jan 2024",
    ultimoAcesso: "Ontem, 18:45",
    simulados: 3,
    status: "ativo",
  },
  {
    id: 3,
    nome: "Pedro Costa",
    email: "pedro@email.com",
    plano: "Premium",
    cadastro: "08 Jan 2024",
    ultimoAcesso: "Hoje, 09:15",
    simulados: 8,
    status: "ativo",
  },
  {
    id: 4,
    nome: "Ana Oliveira",
    email: "ana@email.com",
    plano: "Free",
    cadastro: "20 Jan 2024",
    ultimoAcesso: "3 dias atrás",
    simulados: 1,
    status: "inativo",
  },
  {
    id: 5,
    nome: "Carlos Lima",
    email: "carlos@email.com",
    plano: "Premium",
    cadastro: "05 Jan 2024",
    ultimoAcesso: "Hoje, 11:00",
    simulados: 15,
    status: "ativo",
  },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function AdminUsuariosPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gerenciar Usuários</h1>
        <p className="text-muted-foreground">Visualize e gerencie todos os usuários da plataforma</p>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">12.847</p>
            <p className="text-xs text-muted-foreground">Total de usuários</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-primary">4.231</p>
            <p className="text-xs text-muted-foreground">Usuários Premium</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">8.616</p>
            <p className="text-xs text-muted-foreground">Usuários Free</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-primary">+234</p>
            <p className="text-xs text-muted-foreground">Novos este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de usuários */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Lista de Usuários</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário..."
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
                <TableHead>Usuário</TableHead>
                <TableHead className="hidden md:table-cell">Plano</TableHead>
                <TableHead className="hidden sm:table-cell">Cadastro</TableHead>
                <TableHead className="hidden lg:table-cell">Último Acesso</TableHead>
                <TableHead className="hidden lg:table-cell">Simulados</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuariosAdmin.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(usuario.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{usuario.nome}</p>
                        <p className="text-xs text-muted-foreground">{usuario.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={usuario.plano === "Premium" ? "default" : "secondary"}
                      className={usuario.plano === "Premium" ? "bg-primary" : ""}
                    >
                      {usuario.plano}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{usuario.cadastro}</TableCell>
                  <TableCell className="hidden lg:table-cell">{usuario.ultimoAcesso}</TableCell>
                  <TableCell className="hidden lg:table-cell">{usuario.simulados}</TableCell>
                  <TableCell>
                    <Badge
                      variant={usuario.status === "ativo" ? "default" : "secondary"}
                      className={usuario.status === "ativo" ? "bg-primary" : ""}
                    >
                      {usuario.status}
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
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar e-mail
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
            <span className="px-4 text-sm text-muted-foreground">Página 1 de 128</span>
            <Button variant="outline" size="sm">
              Próximo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
