import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-chart-2/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn delay={0} duration={700}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">Plataforma de preparação para OAB</span>
            </div>
          </FadeIn>

          <FadeIn delay={100} duration={700}>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              A forma inteligente de se preparar para a{" "}
              <span className="text-primary">OAB</span>
            </h1>
          </FadeIn>

          <FadeIn delay={200} duration={700}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              Descubra exatamente o que estudar para passar na OAB usando análise inteligente de desempenho baseada em questões.
            </p>
          </FadeIn>

          <FadeIn delay={300} duration={700}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link href="/cadastro">
                  Começar diagnóstico
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2">
                <Link href="/cadastro">
                  <Play className="h-4 w-4" />
                  Criar conta grátis
                </Link>
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={500} duration={800}>
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: "15k+", label: "Questões disponíveis" },
                { value: "92%", label: "Taxa de aprovação" },
                { value: "50k+", label: "Alunos preparados" },
                { value: "4.9", label: "Avaliação média" },
              ].map((stat, index) => (
                <FadeIn key={stat.label} delay={600 + index * 100} duration={600}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
