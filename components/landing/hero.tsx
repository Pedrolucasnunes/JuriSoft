import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Atmospheric glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[380px] w-[380px] rounded-full bg-[#b8860b]/6 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

          {/* ── Conteúdo ── */}
          <div>
            <FadeIn delay={0} duration={700}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b8860b]/30 bg-[#fff4cc]/60 px-4 py-1.5 dark:bg-[#b8860b]/10 dark:border-[#b8860b]/20">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#b8860b]" />
                <span className="font-mono text-xs font-medium uppercase tracking-widest text-[#b8860b]">
                  Diagnóstico gratuito para a OAB
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={100} duration={700}>
              <h1 className="text-4xl font-black leading-[1.07] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                Pare de estudar<br />
                no escuro.{" "}
                <em className="not-italic text-primary">
                  Descubra o que<br />te faz errar.
                </em>
              </h1>
            </FadeIn>

            <FadeIn delay={200} duration={700}>
              <p className="mt-6 max-w-[480px] text-lg leading-relaxed text-muted-foreground">
                O AprovaOAB analisa seus erros questão por questão, identifica suas matérias mais fracas e gera um treino focado — para você parar de desperdiçar tempo e passar na OAB.
              </p>
            </FadeIn>

            <FadeIn delay={300} duration={700}>
              <div className="mt-8 flex flex-col gap-3">
                <Button
                  size="lg"
                  asChild
                  className="w-full gap-2 py-6 text-base font-semibold sm:w-fit sm:px-8"
                >
                  <Link href="/cadastro">
                    Começar diagnóstico gratuito
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="font-mono text-xs tracking-wide text-muted-foreground">
                  ✓ Leva menos de 10 minutos &nbsp;·&nbsp; ✓ Sem cartão de crédito
                </p>
              </div>
            </FadeIn>
          </div>

          {/* ── Mockup card ── */}
          <FadeIn delay={250} duration={800}>
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5">
                {/* Card header */}
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-semibold text-foreground">Seu diagnóstico OAB</span>
                  <span className="rounded bg-destructive/10 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-destructive">
                    3 matérias críticas
                  </span>
                </div>

                {/* Score ring */}
                <div className="relative mx-auto mb-1 flex h-20 w-20 items-center justify-center">
                  <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--secondary))" strokeWidth="7" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--primary))" strokeWidth="7"
                      strokeDasharray="213" strokeDashoffset="75" strokeLinecap="round" />
                  </svg>
                  <span className="text-2xl font-black text-primary" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>65%</span>
                </div>
                <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  aproveitamento geral
                </p>

                {/* Disciplinas */}
                <div className="flex flex-col gap-2.5">
                  {[
                    { name: "Direito Civil",  pct: 32, color: "bg-destructive" },
                    { name: "Proc. Penal",    pct: 40, color: "bg-destructive" },
                    { name: "Tributário",     pct: 54, color: "bg-[#b8860b]" },
                    { name: "Constitucional", pct: 78, color: "bg-primary" },
                    { name: "Ética OAB",      pct: 85, color: "bg-primary" },
                  ].map((d) => (
                    <div key={d.name} className="flex items-center gap-2.5">
                      <span className="w-[110px] shrink-0 text-[11px] text-muted-foreground">{d.name}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.pct}%` }} />
                      </div>
                      <span className="w-7 shrink-0 text-right font-mono text-[11px] text-muted-foreground">{d.pct}%</span>
                    </div>
                  ))}
                </div>

                {/* Card footer */}
                <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                  <span className="text-[#b8860b] text-sm">⚠</span>
                  <span className="text-xs text-muted-foreground">
                    Treino focado gerado para <strong className="text-foreground">Direito Civil</strong>
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ── Stats ── */}
        <FadeIn delay={500} duration={800}>
          <div className="mt-16 grid grid-cols-2 gap-6 border-t border-border pt-12 sm:grid-cols-4 sm:gap-8">
            {[
              { value: "15k+", label: "Questões OAB" },
              { value: "92%",  label: "Taxa de aprovação" },
              { value: "50k+", label: "Candidatos aprovados" },
              { value: "4.9",  label: "Avaliação média" },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={600 + i * 100} duration={600}>
                <div className="text-center">
                  <div className="text-2xl font-black tracking-tight text-foreground sm:text-3xl"
                       style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                    {stat.value}
                  </div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
