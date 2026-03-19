"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { AddonProvider } from "@/components/addon-provider"
import { ContentCard, ContentCardSkeleton } from "@/components/content-card"
import { useSearch } from "@/lib/stremio/hooks"
import { Search as SearchIcon, X } from "lucide-react"

function SearchPage() {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  
  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data: results, isLoading } = useSearch(debouncedQuery)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pb-20 pt-20 lg:pb-8 lg:pt-24">
        {/* Search header */}
        <div className="px-6 py-8 lg:px-16">
          <h1 className="mb-6 text-3xl font-bold text-foreground lg:text-4xl">Search</h1>
          
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies and series..."
              className="w-full rounded-full border border-border bg-foreground/5 py-4 pl-14 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-foreground/10 focus:outline-none transition-all"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="px-6 lg:px-16">
          {!debouncedQuery ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-foreground/5">
                <SearchIcon className="h-10 w-10 text-foreground/30" />
              </div>
              <h2 className="mb-2 text-xl font-medium text-foreground">
                Search for content
              </h2>
              <p className="text-muted-foreground">
                Find movies and series across all your addons
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6 xl:grid-cols-6 2xl:grid-cols-7">
              {Array.from({ length: 14 }).map((_, i) => (
                <ContentCardSkeleton key={i} />
              ))}
            </div>
          ) : results && results.length > 0 ? (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{debouncedQuery}&rdquo;
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6 xl:grid-cols-6 2xl:grid-cols-7">
                {results.map((item) => (
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg text-muted-foreground">
                No results found for &ldquo;{debouncedQuery}&rdquo;
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function Search() {
  return (
    <AddonProvider>
      <SearchPage />
    </AddonProvider>
  )
}
