import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, BarChart3, Target, ArrowRight } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"

const steps = [
  {
    step: "01",
    icon: ClipboardCheck,
    before: "estudando sem direção",
    title: "Faça o simulado diagnóstico",
    description:
      "80 questões no formato real da OAB. Em menos de 10 minutos você tem dados concretos sobre onde está errando — sem achismo.",
  },
  {
    step: "02",
    icon: BarChart3,
    before: "sem saber suas fraquezas",
    title: "Veja exatamente onde você falha",
    description:
      "A plataforma mapeia seus erros por disciplina e tema. Você vê, em números, o que está te impedindo de passar.",
  },
  {
    step: "03",
    icon: Target,
    before: "revisando tudo sem foco",
    title: "Treine só o que importa",
    description:
      "Receba um plano de treinos focado nas suas maiores fraquezas. Sem enrolação — só o que vai te aproximar da aprovação.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">

        {/* Heading */}
        <FadeIn>
          <div className="mx-auto max-w-2xl">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#b8860b]">
              Como funciona
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              De "estudando muito<br className="hidden sm:block" /> e reprovando" para aprovado
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Três passos para parar de desperdiçar tempo e estudar o que realmente importa.
            </p>
          </div>
        </FadeIn>

        {/* Steps */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <FadeIn key={step.step} delay={index * 150} duration={700}>
              <div className="group relative h-full rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">

                {/* Step badge */}
                <div className="absolute -top-4 left-8 flex h-8 items-center justify-center rounded-full bg-primary px-3">
                  <span className="font-mono text-sm font-semibold text-primary-foreground">{step.step}</span>
                </div>

                {/* Before tag — estado anterior riscado */}
                <div className="mb-4 mt-4 inline-block rounded border border-border/60 bg-secondary/50 px-2.5 py-1">
                  <p className="font-mono text-[11px] text-muted-foreground line-through">{step.before}</p>
                </div>

                {/* Icon */}
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>

                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>

                {/* Connector line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-border lg:block" />
                )}
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Section CTA */}
        <FadeIn delay={500}>
          <div className="mt-12 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button size="lg" asChild className="w-full gap-2 py-6 text-base font-semibold sm:w-fit sm:px-8">
              <Link href="/cadastro">
                Começar meu diagnóstico agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="font-mono text-xs tracking-wide text-muted-foreground">
              Grátis · Resultado em minutos
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
