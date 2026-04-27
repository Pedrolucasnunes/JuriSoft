import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-server"
import { exchangeCodeForTokens } from "@/lib/services/googleCalendar"
import { encrypt } from "@/lib/crypto"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get("code")
  const error = searchParams.get("error")

  const base = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/calendario`

  if (error || !code) {
    return NextResponse.redirect(`${base}?google=error`)
  }

  const { user, supabase, error: authError } = await requireUser()
  if (authError) {
    return NextResponse.redirect(`${base}?google=error`)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    const [encryptedAccess, encryptedRefresh] = await Promise.all([
      encrypt(tokens.access_token),
      encrypt(tokens.refresh_token),
    ])
    await supabase.from("google_calendar_tokens").upsert({
      user_id:       user.id,
      access_token:  encryptedAccess,
      refresh_token: encryptedRefresh,
      expires_at:    new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    })
    return NextResponse.redirect(`${base}?google=success`)
  } catch {
    return NextResponse.redirect(`${base}?google=error`)
  }
}
