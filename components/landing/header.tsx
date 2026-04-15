"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Scale, Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Scale className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            JuriSoft
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#como-funciona" className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground">
            Como funciona
          </Link>
          <Link href="#diferenciais" className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground">
            Diferenciais
          </Link>
          <Link href="#precos" className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground">
            Preços
          </Link>
        </nav>

        {/* Actions desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button variant="ghost" asChild className="font-mono text-sm">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild className="gap-1.5 font-semibold">
            <Link href="/cadastro">Diagnóstico grátis</Link>
          </Button>
        </div>

        {/* Hamburger mobile */}
        <button
          className="rounded-md p-2 transition-colors duration-150 hover:bg-muted active:scale-[0.95] md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          {isMenuOpen
            ? <X className="h-6 w-6 text-foreground" />
            : <Menu className="h-6 w-6 text-foreground" />}
        </button>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-5 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              href="#como-funciona"
              className="rounded-lg px-3 py-3 font-mono text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Como funciona
            </Link>
            <Link
              href="#diferenciais"
              className="rounded-lg px-3 py-3 font-mono text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Diferenciais
            </Link>
            <Link
              href="#precos"
              className="rounded-lg px-3 py-3 font-mono text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Preços
            </Link>

            <div className="my-3 flex items-center justify-between border-t border-border pt-3">
              <span className="font-mono text-sm text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>

            <div className="flex flex-col gap-2.5">
              <Button variant="outline" asChild className="h-12 w-full text-base">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild className="h-12 w-full text-base font-semibold">
                <Link href="/cadastro">Diagnóstico grátis — é de graça</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
