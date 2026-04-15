import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/Sem fundo.png" alt="AprovaOAB" className="h-7 w-7 object-contain" />
            <span className="text-lg font-bold tracking-tight"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              <span className="text-primary">aprova</span><span className="text-foreground/70">OAB</span>
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
            © {new Date().getFullYear()} AprovaOAB
          </p>
        </div>
      </div>
    </footer>
  )
}
