"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ContentCard, ContentCardSkeleton } from "./content-card"
import { cn } from "@/lib/utils"

interface ContentItem {
  id: string
  type: "movie" | "series"
  name: string
  poster?: string
  releaseInfo?: string
  imdbRating?: string
}

interface ContentRowProps {
  title: string
  items: ContentItem[]
  isLoading?: boolean
  className?: string
}

export function ContentRow({ title, items, isLoading, className }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <section className={cn("relative", className)}>
      <div className="mb-4 flex items-center justify-between px-4 lg:px-0">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <div className="hidden gap-2 lg:flex">
          <button
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-4 lg:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-32 flex-shrink-0 sm:w-36 md:w-40">
                <ContentCardSkeleton />
              </div>
            ))
          : items.map((item) => (
              <div key={item.id} className="w-32 flex-shrink-0 sm:w-36 md:w-40">
                <ContentCard
                  id={item.id}
                  type={item.type}
                  title={item.name}
                  poster={item.poster}
                  year={item.releaseInfo}
                  rating={item.imdbRating ? parseFloat(item.imdbRating) : undefined}
                />
              </div>
            ))}
      </div>
    </section>
  )
}
