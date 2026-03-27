"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Loader2 } from "lucide-react"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        // ✅ Passa userId — supabaseAdmin ignora RLS
        const res = await fetch(`/api/admin/check?userId=${user.id}`)
        const { isAdmin } = await res.json()

        if (!isAdmin) {
          router.push("/dashboard")
          return
        }

        setAllowed(true)
      } catch (err) {
        router.push("/dashboard")
      } finally {
        setChecking(false)
      }
    }

    check()
  }, [])

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!allowed) return null

  return <>{children}</>
}