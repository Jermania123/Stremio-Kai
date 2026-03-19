"use client"

import { Navbar } from "@/components/navbar"
import { AddonProvider } from "@/components/addon-provider"
import { ContentRow } from "@/components/content-row"
import { useHomeCatalogs } from "@/lib/stremio/hooks"
import { useAddonStore } from "@/lib/stremio/store"
import { Play } from "lucide-react"
import Link from "next/link"

function HomePage() {
  const { catalogs } = useHomeCatalogs()
  const { getContinueWatching, watchlist } = useAddonStore()
  const continueWatching = getContinueWatching()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main content */}
      <main className="pb-20 pt-14 lg:pb-8 lg:pl-64 lg:pt-0">
        {/* Hero section */}
        <section className="relative h-64 overflow-hidden bg-gradient-to-b from-primary/20 to-background lg:h-80">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.3),transparent_50%)]" />
          <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 glow">
              <span className="text-4xl font-bold text-primary">K</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-foreground lg:text-3xl">
              Welcome to Stremio Kai
            </h1>
            <p className="max-w-md text-sm text-muted-foreground lg:text-base">
              Browse movies and series from your installed addons
            </p>
          </div>
        </section>

        {/* Content rows */}
        <div className="mt-6 flex flex-col gap-8 lg:px-6">
          {/* Continue Watching */}
          {continueWatching.length > 0 && (
            <ContentRow
              title="Continue Watching"
              items={continueWatching.map((cw) => ({
                id: cw.meta.id,
                type: cw.meta.type as "movie" | "series",
                name: cw.meta.name,
                poster: cw.meta.poster,
                releaseInfo: `${Math.round(cw.progress * 100)}% watched`,
              }))}
            />
          )}

          {/* Watchlist */}
          {watchlist.length > 0 && (
            <ContentRow
              title="My Watchlist"
              items={watchlist.map((m) => ({
                id: m.id,
                type: m.type as "movie" | "series",
                name: m.name,
                poster: m.poster,
                releaseInfo: m.releaseInfo,
                imdbRating: m.imdbRating,
              }))}
            />
          )}

          {/* Catalog rows */}
          {catalogs.map((catalog) => (
            <ContentRow
              key={catalog.title}
              title={catalog.title}
              items={catalog.data.map((m) => ({
                id: m.id,
                type: m.type as "movie" | "series",
                name: m.name,
                poster: m.poster,
                releaseInfo: m.releaseInfo,
                imdbRating: m.imdbRating,
              }))}
              isLoading={catalog.isLoading}
            />
          ))}

          {/* Empty state if no catalogs loaded yet */}
          {catalogs.every((c) => c.data.length === 0 && !c.isLoading) && (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <Play className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-lg font-medium text-foreground">
                No content yet
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Install addons to start browsing content
              </p>
              <Link
                href="/settings"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Manage Addons
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AddonProvider>
      <HomePage />
    </AddonProvider>
  )
}
