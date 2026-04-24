import { requireAdmin } from "@/lib/auth-server"
import { NextResponse } from "next/server"

export async function GET() {
  const { error } = await requireAdmin()

  if (error) return error

  return NextResponse.json({ isAdmin: true })
}
