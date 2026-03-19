"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/library", label: "Library" },
  { href: "/settings", label: "Settings" },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Top navigation bar - Apple TV style */}
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/90 backdrop-blur-xl"
            : "bg-gradient-to-b from-background/80 to-transparent"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 lg:h-20 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">K</span>
            </div>
            <span className="text-lg font-semibold text-foreground lg:text-xl">
              Stremio Kai
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side - Search */}
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed left-0 right-0 top-16 z-40 transform bg-background/95 backdrop-blur-xl transition-all duration-300 lg:hidden",
          mobileOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-3 text-base font-medium transition-all",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border/50 bg-background/90 backdrop-blur-xl safe-bottom lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-foreground/50"
              )}
            >
              <span className={cn(
                "h-1 w-1 rounded-full transition-all",
                isActive ? "bg-primary w-4" : "bg-transparent"
              )} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
