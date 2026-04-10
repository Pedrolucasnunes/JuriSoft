import Link from "next/link"
import { Scale } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Scale className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              JuriSoft
            </span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link href="#" className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground">
              Termos de uso
            </Link>
            <Link href="#" className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground">
              Privacidade
            </Link>
            <Link href="#" className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground">
              Suporte
            </Link>
          </nav>

          {/* Copyright */}
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} JuriSoft
          </p>
        </div>
      </div>
    </footer>
  )
}
