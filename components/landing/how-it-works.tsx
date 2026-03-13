import { ClipboardCheck, BarChart3, Target } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"

const steps = [
  {
    step: "01",
    icon: ClipboardCheck,
    title: "Resolva um simulado diagnóstico",
    description:
      "Faça um simulado completo com questões idênticas à prova real da OAB para mapear seu nível atual de conhecimento.",
  },
  {
    step: "02",
    icon: BarChart3,
    title: "A plataforma analisa seu desempenho",
    description:
      "Nossa inteligência artificial analisa suas respostas e identifica padrões de erros por disciplina e tema.",
  },
  {
    step: "03",
    icon: Target,
    title: "Receba recomendações estratégicas",
    description:
      "Obtenha um plano de estudos personalizado com treinos focados nas suas maiores dificuldades.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Como funciona
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Três passos simples para transformar sua preparação para a OAB
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step, index) => (
            <FadeIn key={step.step} delay={index * 150} duration={700}>
              <div className="group relative h-full rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:bg-card/80">
                <div className="absolute -top-4 left-8 flex h-8 items-center justify-center rounded-full bg-primary px-3">
                  <span className="text-sm font-semibold text-primary-foreground">{step.step}</span>
                </div>

                <div className="mb-6 mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-muted-foreground">{step.description}</p>

                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 hidden h-0.5 w-8 bg-border lg:block" />
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
