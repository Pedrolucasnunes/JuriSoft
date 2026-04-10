import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"

export function CTA() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <FadeIn duration={800}>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12 lg:p-16">

            {/* Barra de acento topo */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-[#b8860b] to-primary" />

            {/* Glow de fundo */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-br from-primary/8 via-transparent to-[#b8860b]/6" />
            </div>

            <div className="mx-auto max-w-2xl text-center">

              {/* Eyebrow */}
              <FadeIn delay={100}>
                <p className="mb-5 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#b8860b]">
                  Comece agora
                </p>
              </FadeIn>

              {/* Headline */}
              <FadeIn delay={200}>
                <h2 className="text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                  Quanto tempo você ainda vai estudar sem saber o que está errado?
                </h2>
              </FadeIn>

              {/* Sub */}
              <FadeIn delay={300}>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  Faça o diagnóstico agora, descubra suas maiores fraquezas e comece a estudar com propósito. Em menos de 10 minutos você já sabe o que muda.
                </p>
              </FadeIn>

              {/* Buttons */}
              <FadeIn delay={400}>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button size="lg" asChild className="w-full gap-2 py-6 text-base font-semibold sm:w-fit sm:px-8">
                    <Link href="/cadastro">
                      Começar diagnóstico gratuito
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="w-full py-6 text-base sm:w-fit sm:px-8">
                    <Link href="/cadastro">Criar conta e explorar</Link>
                  </Button>
                </div>
                <p className="mt-4 font-mono text-xs tracking-wide text-muted-foreground">
                  Sem cartão de crédito · Resultado em minutos · Cancele quando quiser
                </p>
              </FadeIn>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
