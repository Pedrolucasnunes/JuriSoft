import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens } from "@/lib/services/googleCalendar"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get("code")
  const error = searchParams.get("error")

  const base = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/calendario`

  if (error || !code) {
    return NextResponse.redirect(`${base}?google=error`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.redirect(`${base}?google=error`)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    await supabase.from("google_calendar_tokens").upsert({
      user_id:       user.id,
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at:    new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    })
    return NextResponse.redirect(`${base}?google=success`)
  } catch {
    return NextResponse.redirect(`${base}?google=error`)
  }
}
