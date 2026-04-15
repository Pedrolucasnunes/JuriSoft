"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, BarChart3, Target, TrendingUp } from "lucide-react"

const steps = [
  {
    icon: ClipboardCheck,
    title: "Faça seu simulado diagnóstico",
    description: "Resolva questões para mapearmos seu nível de conhecimento",
  },
  {
    icon: BarChart3,
    title: "Veja sua análise de desempenho",
    description: "Descubra seus pontos fortes e fracos por disciplina",
  },
  {
    icon: Target,
    title: "Receba questões estratégicas",
    description: "Questões personalizadas para suas maiores dificuldades",
  },
  {
    icon: TrendingUp,
    title: "Acompanhe sua evolução",
    description: "Monitore seu progresso até a aprovação",
  },
]

export function OnboardingModal() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get("onboarding") === "true") {
      setIsOpen(true)
    }
  }, [searchParams])

  const handleClose = () => {
    setIsOpen(false)
    router.replace("/dashboard")
  }

  const handleStartDiagnostic = () => {
    setIsOpen(false)
    router.replace("/dashboard/simulados")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="text-center">
          <img src="/Sem fundo.png" alt="AprovaOAB" className="mx-auto mb-4 h-16 w-16 object-contain" />
          <DialogTitle className="text-2xl">Bem-vindo ao AprovaOAB</DialogTitle>
          <DialogDescription className="text-base text-pretty">
            O AprovaOAB analisa seu desempenho em questões da OAB e identifica exatamente o que você precisa estudar para aumentar suas chances de aprovação.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                  {step.title}
                </p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={handleStartDiagnostic} className="flex-1">
            Fazer diagnóstico agora
          </Button>
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Explorar a plataforma
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
