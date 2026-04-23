import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"

export function MidCTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <FadeIn duration={800}>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center md:p-14"
            style={{ boxShadow: '0 10px 40px -12px rgba(0,0,0,0.4)' }}
          >

            {/* Green radial glow inside card */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: 'radial-gradient(60% 60% at 50% 30%, rgba(16,185,129,0.15), transparent 70%)',
              }}
            />

            <div className="relative">
              <h2
                className="text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Pronto pra saber{" "}
                <em className="not-italic text-primary">onde você está</em>?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Faça o diagnóstico gratuito em 10 minutos. Sem cartão, sem compromisso.
              </p>
              <Button
                size="lg"
                asChild
                className="mt-8 gap-2 px-8 py-6 text-base font-semibold"
              >
                <Link href="/cadastro">
                  Começar diagnóstico gratuito
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
