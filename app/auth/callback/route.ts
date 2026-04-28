import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get("code")
  const type = searchParams.get("type")

  if (code) {
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
    await supabase.auth.exchangeCodeForSession(code)

    if (type === "recovery") {
      return NextResponse.redirect(`${origin}/recuperar-senha/nova-senha`)
    }

    const { data: { user } } = await supabase.auth.getUser()
    const needsOnboarding = !user?.user_metadata?.onboarding_completed
    return NextResponse.redirect(
      `${origin}/dashboard${needsOnboarding ? "?onboarding=true" : ""}`
    )
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
