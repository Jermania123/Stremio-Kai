"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Plus, Info, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Meta } from "@/lib/stremio/types"

interface HeroBillboardProps {
  items: Meta[]
  className?: string
}

export function HeroBillboard({ items, className }: HeroBillboardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const featured = items.slice(0, 5)
  const current = featured[currentIndex]

  useEffect(() => {
    if (!isAutoPlaying || featured.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, featured.length])

  if (!current) return null

  const goTo = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length)
    setIsAutoPlaying(false)
  }

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length)
    setIsAutoPlaying(false)
  }

  return (
    <section className={cn("relative h-[70vh] min-h-[500px] overflow-hidden", className)}>
      {/* Background image with gradient */}
      <div className="absolute inset-0">
        {current.background || current.poster ? (
          <Image
            src={current.background || current.poster || ""}
            alt={current.name}
            fill
            className="object-cover object-center transition-opacity duration-700"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 to-background" />
        )}
        {/* Gradients for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Navigation arrows */}
      {featured.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-background/50 text-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-background/80 group-hover:opacity-100 lg:opacity-100"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-background/50 text-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-background/80 group-hover:opacity-100 lg:opacity-100"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-32 lg:px-16 lg:pb-40">
        {/* Title */}
        <h1 className="mb-3 max-w-2xl text-4xl font-bold text-foreground text-balance lg:text-6xl">
          {current.name}
        </h1>

        {/* Meta info */}
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {current.imdbRating && (
            <span className="flex items-center gap-1 rounded bg-yellow-500/20 px-2 py-0.5 text-yellow-400">
              <Star className="h-3.5 w-3.5 fill-yellow-400" />
              {current.imdbRating}
            </span>
          )}
          {current.releaseInfo && (
            <span>{current.releaseInfo}</span>
          )}
          {current.runtime && (
            <span>{current.runtime}</span>
          )}
          {current.genres && current.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {current.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-border px-3 py-0.5 text-xs text-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {current.description && (
          <p className="mb-6 line-clamp-3 max-w-xl text-sm text-muted-foreground lg:text-base">
            {current.description}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/${current.type}/${current.id}`}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
          >
            <Play className="h-5 w-5 fill-current" />
            Watch Now
          </Link>
          <Link
            href={`/${current.type}/${current.id}`}
            className="flex items-center gap-2 rounded-lg bg-foreground/10 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-foreground/20"
          >
            <Info className="h-5 w-5" />
            More Info
          </Link>
        </div>

        {/* Indicators */}
        {featured.length > 1 && (
          <div className="mt-8 flex items-center gap-2">
            {featured.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={cn(
                  "h-1 rounded-full transition-all",
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "w-4 bg-foreground/30 hover:bg-foreground/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
