import { FadeIn } from "@/components/ui/fade-in"

const testimonials = [
  {
    initials: "MC",
    name: "Marina Costa",
    role: "Aprovada — XL Exame",
    text: "Passei no 1º exame depois de 2 reprovações. O diagnóstico mostrou que eu perdia tempo revisando o que já sabia.",
    highlight: false,
  },
  {
    initials: "RS",
    name: "Rafael Souza",
    role: "Aprovado — XL Exame",
    text: "Trabalho 8h por dia. Com a IA estudei 1h20 por noite e passei. Mudou minha vida profissional.",
    highlight: true,
  },
  {
    initials: "JA",
    name: "Juliana Alves",
    role: "Aprovada — XXXIX Exame",
    text: "O tutor IA explica melhor que muito professor. Tiro dúvida às 2h da manhã e continuo estudando.",
    highlight: false,
  },
  {
    initials: "PL",
    name: "Pedro Lima",
    role: "Aprovado — XL Exame",
    text: "Os simulados são iguais à prova real. Cheguei no dia sem ansiedade porque já tinha treinado o suficiente.",
    highlight: false,
  },
  {
    initials: "CF",
    name: "Camila Ferreira",
    role: "Aprovada — XXXIX Exame",
    text: "Gastei R$ 3 mil em cursinho e não passei. Aqui paguei R$ 49 e passei em 4 meses. Inacreditável.",
    highlight: false,
  },
  {
    initials: "AN",
    name: "Ana Nogueira",
    role: "Aprovada — XL Exame",
    text: "Mãe de 2 filhos, 36 anos. Achei que não ia conseguir. O cronograma adaptativo entendeu meu ritmo real.",
    highlight: false,
  },
]

export function Testimonials() {
  return (
    <section id="depoimentos" className="bg-muted/20 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">

        {/* Heading */}
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge-pill mb-4 inline-flex">Depoimentos</span>
            <h2
              className="mt-4 text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              +32 mil alunos.{" "}
              <em className="not-italic text-primary">Milhares de aprovações.</em>
            </h2>
          </div>
        </FadeIn>

        {/* Grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <FadeIn key={t.name} delay={index * 80} duration={600}>
              <div
                className={`flex h-full flex-col rounded-2xl border p-6 ${
                  t.highlight
                    ? "border-primary bg-primary text-primary-foreground shadow-2xl shadow-primary/20"
                    : "border-border bg-card"
                }`}
              >
                {/* Stars */}
                <div className={`mb-3 flex gap-0.5 text-sm ${t.highlight ? "" : "text-[#b8860b]"}`}>
                  ★★★★★
                </div>

                {/* Quote */}
                <p
                  className={`flex-1 text-sm leading-relaxed ${
                    t.highlight ? "text-primary-foreground/90" : "text-muted-foreground"
                  }`}
                >
                  "{t.text}"
                </p>

                {/* Author */}
                <div className="mt-5 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold text-sm ${
                      t.highlight
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        t.highlight ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {t.name}
                    </p>
                    <p
                      className={`font-mono text-xs ${
                        t.highlight ? "text-primary-foreground/60" : "text-muted-foreground"
                      }`}
                    >
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
