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

        const { data: { user }, error } = await supabase.auth.getUser()
        
        console.log("=== ADMIN GUARD DEBUG ===")
        console.log("user:", user)
        console.log("user.id:", user?.id)
        console.log("user.email:", user?.email)
        console.log("auth error:", error)

        if (!user) {
          console.log("→ Redirecionando para /login (sem user)")
          router.push("/login")
          return
        }

        const res = await fetch(`/api/admin/check?userId=${user.id}`)
        const json = await res.json()
        
        console.log("admin check response:", json)
        console.log("isAdmin:", json.isAdmin)

        if (!json.isAdmin) {
          console.log("→ Redirecionando para /dashboard (não é admin)")
          router.push("/dashboard")
          return
        }

        console.log("→ Acesso liberado!")
        setAllowed(true)
      } catch (err) {
        console.log("→ Erro no AdminGuard:", err)
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