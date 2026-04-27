import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser()
  if (error) return error

  let body: { exam_date?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  const { exam_date } = body

  // Valida formato YYYY-MM se fornecido
  if (exam_date && !/^\d{4}-\d{2}$/.test(exam_date)) {
    return NextResponse.json({ error: "exam_date inválido" }, { status: 400 })
  }

  // Usa admin para atualizar user_metadata no servidor — nunca confia no cliente
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: { exam_date: exam_date ?? null, onboarding_completed: true },
  })

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
