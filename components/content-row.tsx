"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ContentCard, ContentCardSkeleton } from "./content-card"
import { cn } from "@/lib/utils"
import Link from "next/link"

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
  variant?: "poster" | "landscape"
  seeAllHref?: string
  className?: string
}

export function ContentRow({ 
  title, 
  items, 
  isLoading, 
  variant = "poster",
  seeAllHref,
  className 
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener("scroll", checkScroll)
      window.addEventListener("resize", checkScroll)
      return () => {
        el.removeEventListener("scroll", checkScroll)
        window.removeEventListener("resize", checkScroll)
      }
    }
  }, [items])

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  const isLandscape = variant === "landscape"

  return (
    <section className={cn("relative group/row", className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between px-6 lg:px-16">
        <h2 className="text-xl font-semibold text-foreground lg:text-2xl">{title}</h2>
        {seeAllHref && (
          <Link 
            href={seeAllHref}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            See All
          </Link>
        )}
      </div>

      {/* Scroll container wrapper */}
      <div className="relative">
        {/* Left scroll button */}
        <button
          onClick={() => scroll("left")}
          className={cn(
            "absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-lg backdrop-blur-sm transition-all lg:left-4 lg:h-12 lg:w-12",
            canScrollLeft 
              ? "opacity-0 group-hover/row:opacity-100" 
              : "opacity-0 pointer-events-none"
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
        </button>

        {/* Right scroll button */}
        <button
          onClick={() => scroll("right")}
          className={cn(
            "absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-lg backdrop-blur-sm transition-all lg:right-4 lg:h-12 lg:w-12",
            canScrollRight 
              ? "opacity-0 group-hover/row:opacity-100" 
              : "opacity-0 pointer-events-none"
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
        </button>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-3 overflow-x-auto px-6 pb-4 lg:gap-4 lg:px-16"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-shrink-0",
                    isLandscape 
                      ? "w-64 sm:w-72 lg:w-80" 
                      : "w-28 sm:w-32 lg:w-40"
                  )}
                >
                  <ContentCardSkeleton variant={variant} />
                </div>
              ))
            : items.map((item) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "flex-shrink-0",
                    isLandscape 
                      ? "w-64 sm:w-72 lg:w-80" 
                      : "w-28 sm:w-32 lg:w-40"
                  )}
                >
                  <ContentCard
                    id={item.id}
                    type={item.type}
                    title={item.name}
                    poster={item.poster}
                    year={item.releaseInfo}
                    rating={item.imdbRating ? parseFloat(item.imdbRating) : undefined}
                    variant={variant}
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
