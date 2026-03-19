"use client"

import { Navbar } from "@/components/navbar"
import { AddonProvider } from "@/components/addon-provider"
import { ContentRow } from "@/components/content-row"
import { HeroBillboard } from "@/components/hero-billboard"
import { useHomeCatalogs } from "@/lib/stremio/hooks"
import { useAddonStore } from "@/lib/stremio/store"
import { Play, Plus } from "lucide-react"
import Link from "next/link"

function HomePage() {
  const { catalogs } = useHomeCatalogs()
  const { getContinueWatching, watchlist } = useAddonStore()
  const continueWatching = getContinueWatching()

  // Get featured items for hero from the first catalog with data
  const featuredCatalog = catalogs.find((c) => c.data.length > 0)
  const featuredItems = featuredCatalog?.data.slice(0, 5) || []

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main content */}
      <main className="pb-20 lg:pb-8">
        {/* Hero Billboard */}
        {featuredItems.length > 0 ? (
          <HeroBillboard items={featuredItems} />
        ) : (
          // Placeholder hero when no content
          <section className="relative flex h-[60vh] min-h-[400px] items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
            <div className="relative z-10 flex flex-col items-center px-6 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/20">
                <span className="text-5xl font-bold text-primary">K</span>
              </div>
              <h1 className="mb-3 text-3xl font-bold text-foreground lg:text-4xl">
                Welcome to Stremio Kai
              </h1>
              <p className="mb-6 max-w-md text-muted-foreground">
                Browse and stream movies and series from your favorite addons
              </p>
              <Link
                href="/settings"
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                <Plus className="h-5 w-5" />
                Install Addons
              </Link>
            </div>
          </section>
        )}

        {/* Content rows */}
        <div className="-mt-20 relative z-10 flex flex-col gap-10 pt-4">
          {/* Continue Watching - Landscape cards like Stremio Kai */}
          {continueWatching.length > 0 && (
            <ContentRow
              title="Continue Watching"
              variant="landscape"
              items={continueWatching.map((cw) => ({
                id: cw.meta.id,
                type: cw.meta.type as "movie" | "series",
                name: cw.meta.name,
                poster: cw.meta.background || cw.meta.poster,
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
              seeAllHref="/library"
            />
          )}

          {/* Catalog rows */}
          {catalogs.map((catalog, index) => (
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
              // Alternate between landscape and poster for visual variety
              variant={index === 0 ? "landscape" : "poster"}
            />
          ))}

          {/* Empty state if no catalogs loaded yet */}
          {catalogs.every((c) => c.data.length === 0 && !c.isLoading) && featuredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <Play className="mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-xl font-medium text-foreground">
                No content available
              </h2>
              <p className="mb-6 text-muted-foreground">
                Install addons to start browsing movies and series
              </p>
              <Link
                href="/settings"
                className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
