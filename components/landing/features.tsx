import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Dumbbell, Monitor, BarChart3, Brain, ArrowRight } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"

const features = [
  {
    icon: AlertTriangle,
    title: "Aponta exatamente onde você erra",
    description:
      "Identifica as disciplinas e temas que mais te derrubam — com base nas suas respostas reais, não em suposições.",
  },
  {
    icon: Dumbbell,
    title: "Treino montado com base nos seus erros",
    description:
      "Cada sessão é gerada a partir do que você ainda não domina. Você pratica o que importa, não o que já sabe.",
  },
  {
    icon: Monitor,
    title: "Simulado no formato real da OAB",
    description:
      "80 questões, cronômetro, estrutura idêntica ao exame oficial. Você entra na prova sem surpresa.",
  },
  {
    icon: BarChart3,
    title: "Desempenho por disciplina em tempo real",
    description:
      "Veja seu percentual de acertos nas 17 matérias da OAB. Sabe exatamente onde investir seu tempo.",
  },
  {
    icon: Brain,
    title: "Análise que evolui com você",
    description:
      "Quanto mais você usa, mais preciso fica o diagnóstico. O foco é ajustado com base no seu histórico real.",
  },
]

export function Features() {
  return (
    <section id="diferenciais" className="bg-secondary/30 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">

        {/* Heading */}
        <FadeIn>
          <div className="mx-auto max-w-2xl">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#b8860b]">
              Diferenciais
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Tudo que você precisa<br className="hidden sm:block" /> para parar de reprovar
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Ferramentas diretas, sem enrolação — cada uma com um objetivo claro: sua aprovação.
            </p>
          </div>
        </FadeIn>

        {/* Grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FadeIn key={feature.title} delay={index * 100} duration={600}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold leading-snug text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Section CTA */}
        <FadeIn delay={600}>
          <div className="mt-12 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button size="lg" asChild className="w-full gap-2 py-6 text-base font-semibold sm:w-fit sm:px-8">
              <Link href="/cadastro">
                Descobrir meu nível real
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="font-mono text-xs tracking-wide text-muted-foreground">
              Diagnóstico gratuito · Sem compromisso
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
