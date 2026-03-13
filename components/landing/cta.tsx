import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"

export function CTA() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <FadeIn duration={800}>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12 lg:p-16">
            <div className="absolute inset-0 -z-10">
              <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-br from-primary/10 via-transparent to-chart-2/10" />
            </div>

            <div className="mx-auto max-w-2xl text-center">
              <FadeIn delay={100}>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Comece agora</span>
                </div>
              </FadeIn>

              <FadeIn delay={200}>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                  Descubra agora suas chances de aprovação
                </h2>
              </FadeIn>

              <FadeIn delay={300}>
                <p className="mt-4 text-lg text-muted-foreground text-pretty">
                  Faça o diagnóstico gratuito e receba um relatório completo sobre seus pontos fortes e fracos.
                </p>
              </FadeIn>

              <FadeIn delay={400}>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button size="lg" asChild className="gap-2">
                    <Link href="/cadastro">
                      Criar conta grátis
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/cadastro">Fazer diagnóstico</Link>
                  </Button>
                </div>
              </FadeIn>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
