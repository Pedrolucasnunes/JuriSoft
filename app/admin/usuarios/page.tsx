"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, ShieldOff, ShieldCheck, Loader2, Activity } from "lucide-react"
import { useRouter } from "next/navigation"

interface Usuario {
  id: string
  role: string
  email: string
  nome: string
  simulados: number
  questoes: number
}

export default function AdminUsuariosPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [atualizando, setAtualizando] = useState<string | null>(null)

  const fetchUsuarios = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/usuarios?page=${page}`)
    const data = await res.json()
    setUsuarios(data.users ?? [])
    setPagination(data.pagination ?? { total: 0, page: 1, totalPages: 0 })
    setLoading(false)
  }, [page])

  useEffect(() => { fetchUsuarios() }, [fetchUsuarios])

  const toggleRole = async (id: string, roleAtual: string) => {
    const novoRole = roleAtual === "blocked" ? "user" : "blocked"
    setAtualizando(id)
    await fetch(`/api/admin/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: novoRole }),
    })
    setAtualizando(null)
    fetchUsuarios()
  }

  const setAdmin = async (id: string) => {
    setAtualizando(id)
    await fetch(`/api/admin/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "admin" }),
    })
    setAtualizando(null)
    fetchUsuarios()
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge className="bg-primary">Admin</Badge>
      case "blocked": return <Badge variant="destructive">Bloqueado</Badge>
      default: return <Badge variant="secondary">Usuário</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gerenciar Usuários</h1>
        <p className="text-muted-foreground">Visualize e gerencie todos os usuários da plataforma</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{pagination.total.toLocaleString("pt-BR")}</p>
            <p className="text-xs text-muted-foreground">Total de usuários</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-primary">{usuarios.filter(u => u.role === "admin").length}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-destructive">{usuarios.filter(u => u.role === "blocked").length}</p>
            <p className="text-xs text-muted-foreground">Bloqueados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center h-32 items-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Simulados</TableHead>
                  <TableHead>Questões</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {u.nome || "Sem nome"}
                        </span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                    <TableCell>{u.simulados}</TableCell>
                    <TableCell>{u.questoes}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={atualizando === u.id}>
                            {atualizando === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/admin/usuarios/${u.id}`)}>
                            <Activity className="mr-2 h-4 w-4" /> Ver atividade
                          </DropdownMenuItem>
                          {u.role !== "admin" && (
                            <DropdownMenuItem onClick={() => setAdmin(u.id)}>
                              <ShieldCheck className="mr-2 h-4 w-4" /> Tornar Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => toggleRole(u.id, u.role)}>
                            {u.role === "blocked"
                              ? <><ShieldCheck className="mr-2 h-4 w-4" /> Desbloquear</>
                              : <><ShieldOff className="mr-2 h-4 w-4 text-destructive" /><span className="text-destructive">Bloquear</span></>
                            }
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1 || loading}>Anterior</Button>
            <span className="px-4 text-sm text-muted-foreground">Página {pagination.page} de {pagination.totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages || loading}>Próximo</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}