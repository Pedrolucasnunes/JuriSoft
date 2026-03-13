"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={cn("h-9 w-9", className)}>
        <span className="sr-only">Alternar tema</span>
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-9 w-9 transition-all duration-300",
        className
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className={cn(
        "h-4 w-4 transition-all duration-300",
        isDark ? "rotate-0 scale-100" : "rotate-90 scale-0"
      )} />
      <Moon className={cn(
        "absolute h-4 w-4 transition-all duration-300",
        isDark ? "rotate-90 scale-0" : "rotate-0 scale-100"
      )} />
      <span className="sr-only">
        {isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      </span>
    </Button>
  )
}
