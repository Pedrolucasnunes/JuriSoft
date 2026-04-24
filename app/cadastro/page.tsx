"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Eye, EyeOff, Check, Mail } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Step = "form" | "verify" | "success"

export default function CadastroPage() {
  const [step, setStep] = useState<Step>("form")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [emailCadastro, setEmailCadastro] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { label: "Uma letra maiúscula", valid: /[A-Z]/.test(password) },
    { label: "Um número", valid: /[0-9]/.test(password) },
  ]

  const senhaValida = passwordRequirements.every((r) => r.valid)

  const handleSubmit = async (e: { preventDefault(): void; currentTarget: HTMLFormElement }) => {
    e.preventDefault()
    setError(null)

    if (!senhaValida) {
      setError("A senha não atende aos requisitos mínimos.")
      return
    }

    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const nome = formData.get("name") as string
    const email = formData.get("email") as string
    const senha = formData.get("password") as string

    await supabase.auth.signOut()

    const { error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { full_name: nome } },
    })

    setIsLoading(false)

    if (authError) {
      if (authError.message.includes("already registered")) {
        setError("Este e-mail já está cadastrado. Faça login.")
      } else {
        setError(authError.message)
      }
      return
    }

    setEmailCadastro(email)
    await supabase.auth.signOut()
    setStep("verify")
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: { key: string }) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: { clipboardData: DataTransfer; preventDefault(): void }) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!text) return
    e.preventDefault()
    const next = [...otp]
    text.split("").forEach((char, i) => { next[i] = char })
    setOtp(next)
    inputsRef.current[Math.min(text.length, 5)]?.focus()
  }

  const handleVerifyOtp = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError(null)
    const token = otp.join("")
    if (token.length < 6) {
      setError("Digite os 6 dígitos do código enviado.")
      return
    }

    setIsLoading(true)
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: emailCadastro,
      token,
      type: "signup",
    })
    setIsLoading(false)

    if (verifyError) {
      setError("Código inválido ou expirado. Solicite um novo código.")
      return
    }

    await supabase.auth.signOut()
    setStep("success")
  }

  const handleResend = async () => {
    setError(null)
    setOtp(["", "", "", "", "", ""])
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: emailCadastro,
    })
    if (resendError) {
      setError("Não foi possível reenviar o código. Tente novamente.")
    }
  }

  if (step === "success") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md border-border text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Conta ativada!
              </CardTitle>
              <CardDescription>
                Seu e-mail foi verificado com sucesso. Agora você pode fazer login.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/login">Ir para o login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === "verify") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="absolute left-4 top-4 lg:left-8 lg:top-8">
          <button
            onClick={() => setStep("form")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md border-border">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Verifique seu e-mail
                </CardTitle>
                <CardDescription className="mt-2">
                  Enviamos um código de 6 dígitos para{" "}
                  <span className="font-medium text-foreground">{emailCadastro}</span>
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-center block">Código de verificação</Label>
                  <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputsRef.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="h-12 w-10 rounded-md border border-input bg-input text-center text-lg font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verificando..." : "Verificar código"}
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Não recebeu o código?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-medium text-primary hover:underline"
                >
                  Reenviar
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
              <CardTitle className="text-2xl font-bold text-foreground">Crie sua conta</CardTitle>
              <CardDescription className="mt-2 text-muted-foreground">
                Comece sua jornada rumo à aprovação na OAB
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  required
                  className="bg-input"
                />
              </div>

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
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie uma senha"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {password && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req) => (
                      <div key={req.label} className="flex items-center gap-2 text-xs">
                        <Check className={`h-3 w-3 ${req.valid ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={req.valid ? "text-primary" : "text-muted-foreground"}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || (password.length > 0 && !senhaValida)}
              >
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Ao criar uma conta, você concorda com nossos{" "}
              <Link href="#" className="text-primary hover:underline">Termos de Uso</Link>{" "}
              e{" "}
              <Link href="#" className="text-primary hover:underline">Política de Privacidade</Link>.
            </p>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
