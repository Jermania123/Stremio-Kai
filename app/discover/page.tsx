"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { AddonProvider } from "@/components/addon-provider"
import { ContentCard, ContentCardSkeleton } from "@/components/content-card"
import { useCatalog } from "@/lib/stremio/hooks"
import { cn } from "@/lib/utils"

const TYPES = [
  { id: "movie", label: "Movies" },
  { id: "series", label: "Series" },
]

const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
]

function DiscoverPage() {
  const [type, setType] = useState("movie")
  const [genre, setGenre] = useState<string | null>(null)
  
  const { data: items, isLoading } = useCatalog(
    type,
    "top",
    genre ? { genre } : undefined
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pb-20 pt-14 lg:pb-8 lg:pl-64 lg:pt-0">
        {/* Header */}
        <div className="border-b border-border bg-card/50 px-4 py-6 lg:px-6">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Discover</h1>
          
          {/* Type tabs */}
          <div className="mb-4 flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  type === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Genre filter */}
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setGenre(null)}
              className={cn(
                "flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                !genre
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              All
            </button>
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={cn(
                  "flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  genre === g
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6 lg:p-6 xl:grid-cols-6">
          {isLoading
            ? Array.from({ length: 18 }).map((_, i) => (
                <ContentCardSkeleton key={i} />
              ))
            : items?.map((item) => (
                <ContentCard
                  key={item.id}
                  id={item.id}
                  type={item.type as "movie" | "series"}
                  title={item.name}
                  poster={item.poster}
                  year={item.releaseInfo}
                  rating={item.imdbRating ? parseFloat(item.imdbRating) : undefined}
                />
              ))}
        </div>

        {/* Empty state */}
        {!isLoading && (!items || items.length === 0) && (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <p className="text-muted-foreground">
              No content found for this category
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function Discover() {
  return (
    <AddonProvider>
      <DiscoverPage />
    </AddonProvider>
  )
}
