import { Brain, FileText, PieChart, AlertTriangle, Dumbbell } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"

const features = [
  {
    icon: Brain,
    title: "Diagnóstico inteligente de desempenho",
    description:
      "Algoritmos avançados analisam suas respostas e identificam exatamente onde você precisa melhorar.",
  },
  {
    icon: FileText,
    title: "Simulados idênticos à prova real",
    description:
      "Questões no formato oficial da OAB, com 80 questões e cronômetro para simular o ambiente da prova.",
  },
  {
    icon: PieChart,
    title: "Análise por disciplina da OAB",
    description:
      "Visualize seu desempenho detalhado em cada uma das 17 disciplinas cobradas no exame.",
  },
  {
    icon: AlertTriangle,
    title: "Identificação de matérias críticas",
    description:
      "Saiba exatamente quais disciplinas representam maior risco para sua aprovação.",
  },
  {
    icon: Dumbbell,
    title: "Treinos personalizados",
    description:
      "Questões selecionadas com base nos seus erros anteriores para maximizar seu aprendizado.",
  },
]

export function Features() {
  return (
    <section id="diferenciais" className="py-20 lg:py-32 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Diferenciais da plataforma
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Tudo que você precisa para uma preparação estratégica e eficiente
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FadeIn key={feature.title} delay={index * 100} duration={600}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
