import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight, Zap } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"

const plans = [
  {
    id: "mensal",
    label: "Mensal",
    price: "R$ 49",
    period: "/mês",
    priceTotal: null,
    description: "Para quem quer testar antes de se comprometer.",
    highlight: false,
    badge: null,
    features: [
      "Diagnóstico completo por matéria",
      "Simulados ilimitados no formato OAB",
      "Treinos gerados pelos seus erros",
      "Análise de desempenho por disciplina",
      "Acesso ao banco de 15k+ questões",
    ],
    cta: "Começar agora",
    href: "/cadastro",
  },
  {
    id: "trimestral",
    label: "3 Meses",
    price: "R$ 39",
    period: "/mês",
    priceTotal: "R$ 117 cobrado a cada 3 meses",
    description: "O prazo certo para quem tem exame marcado.",
    highlight: true,
    badge: "Mais escolhido",
    features: [
      "Tudo do plano mensal",
      "Economia de R$ 30 vs mensal",
      "Plano de estudos semanal",
      "Relatório de evolução quinzenal",
      "Suporte prioritário por chat",
    ],
    cta: "Escolher este plano",
    href: "/cadastro",
  },
  {
    id: "anual",
    label: "Anual",
    price: "R$ 29",
    period: "/mês",
    priceTotal: "R$ 348 cobrado anualmente",
    description: "Para quem estuda com consistência e quer o melhor custo.",
    highlight: false,
    badge: "Melhor custo",
    features: [
      "Tudo do plano trimestral",
      "Economia de R$ 240 vs mensal",
      "Módulos de revisão OAB 2ª fase",
      "Histórico completo de evolução",
      "Suporte prioritário + onboarding",
    ],
    cta: "Escolher este plano",
    href: "/cadastro",
  },
]

export function Pricing() {
  return (
    <section id="precos" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">

        {/* Heading */}
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#b8860b]">
              Planos
            </p>
            <h2
              className="text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Invista no que realmente<br className="hidden sm:block" /> vai te aprovar
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Sem enrolação. Escolha o período, comece hoje e pare de reprovar.
            </p>
          </div>
        </FadeIn>

        {/* Cards */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-start">
          {plans.map((plan, index) => (
            <FadeIn key={plan.id} delay={index * 120} duration={700}>
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-8 transition-all ${
                  plan.highlight
                    ? "border-primary bg-primary text-primary-foreground shadow-2xl shadow-primary/20 ring-1 ring-primary"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                        plan.highlight
                          ? "bg-[#b8860b] text-white"
                          : "border border-[#b8860b]/30 bg-[#fff4cc] text-[#b8860b]"
                      }`}
                    >
                      <Zap className="h-3 w-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Label */}
                <p
                  className={`font-mono text-xs font-medium uppercase tracking-[0.12em] ${
                    plan.highlight ? "text-primary-foreground/60" : "text-[#b8860b]"
                  }`}
                >
                  {plan.label}
                </p>

                {/* Preço */}
                <div className="mt-3 flex items-end gap-1">
                  <span
                    className="text-4xl font-black tracking-tight"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`mb-1 text-sm font-medium ${
                      plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>

                {/* Total */}
                {plan.priceTotal && (
                  <p
                    className={`mt-1 font-mono text-xs ${
                      plan.highlight ? "text-primary-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    {plan.priceTotal}
                  </p>
                )}

                {/* Description */}
                <p
                  className={`mt-3 text-sm leading-relaxed ${
                    plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {plan.description}
                </p>

                {/* Divider */}
                <div
                  className={`my-6 h-px ${
                    plan.highlight ? "bg-primary-foreground/20" : "bg-border"
                  }`}
                />

                {/* Features */}
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                          plan.highlight ? "bg-primary-foreground/20" : "bg-primary/10"
                        }`}
                      >
                        <Check
                          className={`h-2.5 w-2.5 ${
                            plan.highlight ? "text-primary-foreground" : "text-primary"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-sm leading-snug ${
                          plan.highlight ? "text-primary-foreground/90" : "text-muted-foreground"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA — empurrado para o fundo */}
                <div className="mt-auto pt-8">
                  <Button
                    size="lg"
                    asChild
                    className={`w-full gap-2 py-6 text-base font-semibold ${
                      plan.highlight
                        ? "bg-white text-primary hover:bg-white/90"
                        : ""
                    }`}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    <Link href={plan.href}>
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Rodapé */}
        <FadeIn delay={400}>
          <p className="mt-10 text-center font-mono text-xs text-muted-foreground">
            Todos os planos incluem acesso completo · Cancele quando quiser · Pagamento seguro
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
