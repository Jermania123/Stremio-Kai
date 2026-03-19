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
      
      <main className="pb-20 pt-14 lg:pb-8 lg:pl-64 lg:pt-0">
        {/* Search header */}
        <div className="sticky top-14 z-30 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl lg:top-0 lg:px-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies and series..."
              className="w-full rounded-xl border border-border bg-card py-3 pl-12 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="p-4 lg:p-6">
          {!debouncedQuery ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-lg font-medium text-foreground">
                Search for content
              </h2>
              <p className="text-sm text-muted-foreground">
                Find movies and series across all your addons
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <ContentCardSkeleton key={i} />
              ))}
            </div>
          ) : results && results.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? "s" : ""} for "{debouncedQuery}"
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6 xl:grid-cols-6">
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
              <p className="text-muted-foreground">
                No results found for "{debouncedQuery}"
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
