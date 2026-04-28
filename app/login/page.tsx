"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Eye, EyeOff, Mail } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const senhaRedefinida = searchParams.get("senha_redefinida") === "1"
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleResend = async () => {
    if (!unverifiedEmail) return
    setResendLoading(true)
    setResendSuccess(false)
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: unverifiedEmail,
    })
    setResendLoading(false)
    if (!resendError) {
      setResendSuccess(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setUnverifiedEmail(null)
    setResendSuccess(false)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      if (authError.message.toLowerCase().includes("not confirmed") || authError.message.toLowerCase().includes("email not confirmed")) {
        setUnverifiedEmail(email)
      } else {
        setError("E-mail ou senha incorretos. Tente novamente.")
      }
      setIsLoading(false)
      return
    }

    if (!signInData.user?.email_confirmed_at) {
      await supabase.auth.signOut()
      setUnverifiedEmail(email)
      setIsLoading(false)
      return
    }

    const res = await fetch("/api/admin/check")
    const { isAdmin } = await res.json()

    if (isAdmin) {
      router.push("/admin")
      return
    }

    const params = new URLSearchParams(window.location.search)
    const redirect = params.get("redirect")

    if (redirect) {
      router.push(redirect)
      return
    }

    const needsOnboarding = !signInData.user?.user_metadata?.onboarding_completed
    router.push(needsOnboarding ? "/dashboard?onboarding=true" : "/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="absolute left-4 top-4 lg:left-8 lg:top-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="space-y-4 text-center">
            <Link href="/" className="mx-auto flex items-center gap-2">
              <img src="/Sem fundo.png" alt="AprovaOAB" className="h-12 w-12 object-contain" />
            </Link>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Bem-vindo de volta</CardTitle>
              <CardDescription className="mt-2 text-muted-foreground">
                Entre na sua conta para continuar estudando
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {unverifiedEmail ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Conta não verificada</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Confirme seu e-mail antes de entrar. Enviamos um código para{" "}
                    <span className="font-medium text-foreground">{unverifiedEmail}</span>.
                  </p>
                </div>

                {resendSuccess && (
                  <p className="text-sm text-primary">Código reenviado! Verifique sua caixa de entrada.</p>
                )}

                <Button
                  className="w-full"
                  onClick={handleResend}
                  disabled={resendLoading}
                >
                  {resendLoading ? "Enviando..." : "Reenviar código de verificação"}
                </Button>

                <button
                  type="button"
                  onClick={() => { setUnverifiedEmail(null); setResendSuccess(false) }}
                  className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                >
                  Voltar ao login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="bg-input"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link
                      href="/recuperar-senha"
                      className="text-xs text-primary hover:underline"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      required
                      className="bg-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {senhaRedefinida && (
                  <p className="text-sm text-primary">Senha redefinida com sucesso! Faça login.</p>
                )}

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleGoogleLogin}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continuar com Google
                </Button>

                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <Link href="/cadastro" className="font-medium text-primary hover:underline">
                    Criar conta
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
