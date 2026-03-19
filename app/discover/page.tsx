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
      
      <main className="pb-20 pt-20 lg:pb-8 lg:pt-24">
        {/* Header */}
        <div className="px-6 py-8 lg:px-16">
          <h1 className="mb-6 text-3xl font-bold text-foreground lg:text-4xl">Discover</h1>
          
          {/* Type tabs */}
          <div className="mb-6 flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  "rounded-full px-6 py-2.5 text-sm font-medium transition-all",
                  type === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground/10 text-foreground/70 hover:bg-foreground/20 hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Genre filter */}
          <div className="scrollbar-hide -mx-6 flex gap-2 overflow-x-auto px-6 pb-2 lg:-mx-16 lg:px-16">
            <button
              onClick={() => setGenre(null)}
              className={cn(
                "flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                !genre
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border text-foreground/60 hover:border-foreground/30 hover:text-foreground"
              )}
            >
              All
            </button>
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={cn(
                  "flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  genre === g
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border text-foreground/60 hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-2 gap-4 px-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6 lg:px-16 xl:grid-cols-6 2xl:grid-cols-7">
          {isLoading
            ? Array.from({ length: 21 }).map((_, i) => (
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
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <p className="text-lg text-muted-foreground">
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
