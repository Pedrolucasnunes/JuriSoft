"use client"

import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Questao {
  id: string
  enunciado: string
  alternativa_a: string
  alternativa_b: string
  alternativa_c: string
  alternativa_d: string
  resposta_correta: string
  dificuldade: string
  banca: string
  ano: number
  subject_id: string
  topic_id: string
  explicacao: string
  subject_name: string
}

const questaoVazia = {
  enunciado: "", alternativa_a: "", alternativa_b: "", alternativa_c: "", alternativa_d: "",
  resposta_correta: "A", dificuldade: "média", banca: "", ano: new Date().getFullYear(),
  subject_id: "", topic_id: "", explicacao: "",
}

const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

export default function AdminQuestoesPage() {
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Questao | null>(null)
  const [form, setForm] = useState(questaoVazia)
  const [salvando, setSalvando] = useState(false)
  const [deletando, setDeletando] = useState<string | null>(null)

  useEffect(() => {
    supabase.from("subjects").select("id, name").order("name")
      .then(({ data }) => setSubjects(data ?? []))
  }, [])

  const fetchQuestoes = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (busca) params.set("busca", busca)

    const res = await fetch(`/api/admin/questoes?${params}`)
    const data = await res.json()
    setQuestoes(data.questions ?? [])
    setPagination(data.pagination ?? { total: 0, page: 1, totalPages: 0 })
    setLoading(false)
  }, [page, busca])

  useEffect(() => { fetchQuestoes() }, [fetchQuestoes])

  const abrirCriar = () => {
    setEditando(null)
    setForm(questaoVazia)
    setModalOpen(true)
  }

  const abrirEditar = (q: Questao) => {
    setEditando(q)
    setForm({
      enunciado: q.enunciado, alternativa_a: q.alternativa_a, alternativa_b: q.alternativa_b,
      alternativa_c: q.alternativa_c, alternativa_d: q.alternativa_d,
      resposta_correta: q.resposta_correta, dificuldade: q.dificuldade,
      banca: q.banca, ano: q.ano, subject_id: q.subject_id,
      topic_id: q.topic_id, explicacao: q.explicacao,
    })
    setModalOpen(true)
  }

  const salvar = async () => {
    setSalvando(true)
    const url = editando ? `/api/admin/questoes/${editando.id}` : "/api/admin/questoes"
    const method = editando ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setSalvando(false)
    if (res.ok) {
      toast.success(editando ? "Questão atualizada!" : "Questão criada!")
      setModalOpen(false)
      fetchQuestoes()
    } else {
      toast.error("Erro ao salvar questão")
    }
  }

  const deletar = async (id: string) => {
    setDeletando(id)
    const res = await fetch(`/api/admin/questoes/${id}`, { method: "DELETE" })
    setDeletando(null)
    if (res.ok) {
      toast.success("Questão excluída")
      fetchQuestoes()
    } else {
      toast.error("Erro ao excluir questão")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Questões</h1>
          <p className="text-muted-foreground">Adicione, edite e gerencie o banco de questões</p>
        </div>
        <Button onClick={abrirCriar}>
          <Plus className="mr-2 h-4 w-4" /> Nova Questão
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{pagination.total.toLocaleString("pt-BR")}</p>
            <p className="text-xs text-muted-foreground">Total de questões</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-primary">{subjects.length}</p>
            <p className="text-xs text-muted-foreground">Disciplinas cadastradas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Banco de Questões</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar questão..."
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPage(1) }}
                className="pl-10"
              />
            </div>
          </div>
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
                  <TableHead>Enunciado</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead className="hidden sm:table-cell">Banca/Ano</TableHead>
                  <TableHead className="hidden lg:table-cell">Dificuldade</TableHead>
                  <TableHead className="hidden lg:table-cell">Gabarito</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questoes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm">{q.enunciado}</p>
                    </TableCell>
                    <TableCell>{q.subject_name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {q.banca} {q.ano}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {q.dificuldade && (
                        <Badge variant="secondary" className={
                          q.dificuldade === "fácil" ? "bg-primary/10 text-primary" :
                            q.dificuldade === "médio" || q.dificuldade === "média" ? "bg-warning/10 text-warning" :
                              "bg-destructive/10 text-destructive"
                        }>
                          {q.dificuldade}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline">{q.resposta_correta}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={deletando === q.id}>
                            {deletando === q.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => abrirEditar(q)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setConfirmDelete(q.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
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

      {/* Modal criar/editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Questão" : "Nova Questão"}</DialogTitle>
            <DialogDescription>Preencha todos os campos obrigatórios</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Enunciado *</Label>
              <Textarea value={form.enunciado} onChange={e => setForm(f => ({ ...f, enunciado: e.target.value }))} rows={4} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["a", "b", "c", "d"] as const).map(l => (
                <div key={l} className="space-y-2">
                  <Label>Alternativa {l.toUpperCase()} *</Label>
                  <Input value={form[`alternativa_${l}` as keyof typeof form] as string}
                    onChange={e => setForm(f => ({ ...f, [`alternativa_${l}`]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Resposta Correta *</Label>
                <Select value={form.resposta_correta} onValueChange={v => setForm(f => ({ ...f, resposta_correta: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Select value={form.dificuldade} onValueChange={v => setForm(f => ({ ...f, dificuldade: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fácil">Fácil</SelectItem>
                    <SelectItem value="médio">Médio</SelectItem>
                    <SelectItem value="difícil">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Disciplina *</Label>
                <Select value={form.subject_id} onValueChange={v => setForm(f => ({ ...f, subject_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Banca</Label>
                <Input value={form.banca} onChange={e => setForm(f => ({ ...f, banca: e.target.value }))} placeholder="Ex: FGV" />
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Input type="number" value={form.ano} onChange={e => setForm(f => ({ ...f, ano: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Explicação</Label>
              <Textarea value={form.explicacao} onChange={e => setForm(f => ({ ...f, explicacao: e.target.value }))} rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={salvar} disabled={salvando}>
                {salvando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ConfirmDialog FORA do Dialog anterior */}
      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
        title="Excluir questão?"
        description="Esta ação não pode ser desfeita. A questão será removida permanentemente."
        confirmLabel="Excluir"
        destructive
        onConfirm={() => {
          if (confirmDelete) deletar(confirmDelete)
          setConfirmDelete(null)
        }}
      />
    </div>
  )
}