import Link from "next/link"
import { ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContaBloqueadaPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Conta suspensa</h1>
          <p className="text-muted-foreground">
            Sua conta foi suspensa temporariamente. Se acredita que isso foi um
            engano, entre em contato com o suporte.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="mailto:suporte@aprovaoab.com.br">
            Contatar suporte
          </Link>
        </Button>
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}
