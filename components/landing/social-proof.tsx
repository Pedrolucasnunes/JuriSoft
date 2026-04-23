import { FadeIn } from "@/components/ui/fade-in"

const schools = ["USP", "PUC-SP", "Mackenzie", "UFMG", "UFRJ", "UnB", "FGV Direito", "UFRGS"]

const stats = [
  { value: "+32 mil", label: "alunos ativos" },
  { value: "87%",     label: "taxa de aprovação" },
  { value: "4.9★",    label: "em 2.140 avaliações" },
  { value: "−47%",    label: "de tempo estudando" },
]

export function SocialProof() {
  return (
    <section className="border-y border-border bg-muted/30 py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">

        <p className="mb-6 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Aprovados em faculdades e escritórios de todo o Brasil
        </p>

        {/* Marquee */}
        <div className="overflow-hidden">
          <div className="marquee-track opacity-70">
            {[...schools, ...schools].map((school, i) => (
              <span
                key={i}
                className="mx-6 shrink-0 font-display text-2xl text-muted-foreground"
              >
                {school}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <FadeIn delay={200}>
          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-10 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="text-4xl font-black text-primary"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  {stat.value}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>

      </div>
    </section>
  )
}
