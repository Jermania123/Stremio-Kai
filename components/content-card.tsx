"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentCardProps {
  id: string
  type: "movie" | "series"
  title: string
  poster?: string
  year?: string
  rating?: number
  variant?: "poster" | "landscape"
  showTitle?: boolean
  className?: string
}

export function ContentCard({
  id,
  type,
  title,
  poster,
  year,
  rating,
  variant = "poster",
  showTitle = true,
  className,
}: ContentCardProps) {
  const isLandscape = variant === "landscape"

  return (
    <Link
      href={`/${type}/${id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl transition-all duration-300",
        "hover:scale-105 hover:z-10",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        className
      )}
    >
      {/* Poster/Thumbnail */}
      <div className={cn(
        "relative w-full overflow-hidden rounded-xl bg-muted",
        isLandscape ? "aspect-video" : "aspect-[2/3]"
      )}>
        {poster ? (
          <Image
            src={poster}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes={isLandscape 
              ? "(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 300px"
              : "(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 180px"
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-muted text-muted-foreground">
            <Play className="h-12 w-12" />
          </div>
        )}
        
        {/* Hover overlay with play button - Stremio Kai style */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div className="flex h-14 w-14 transform items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform duration-300 group-hover:scale-110">
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </div>
        </div>
        
        {/* Rating badge */}
        {rating !== undefined && rating > 0 && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs font-semibold backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            {rating.toFixed(1)}
          </div>
        )}

        {/* Bottom gradient for title on landscape cards */}
        {isLandscape && (
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/90 to-transparent" />
        )}

        {/* Title overlay for landscape cards */}
        {isLandscape && (
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="line-clamp-1 text-sm font-semibold text-foreground drop-shadow-lg">
              {title}
            </h3>
          </div>
        )}
      </div>
      
      {/* Info below - only for poster variant */}
      {!isLandscape && showTitle && (
        <div className="mt-3 flex flex-col gap-1 px-1">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground">
            {title}
          </h3>
          {year && (
            <span className="text-xs text-muted-foreground">{year}</span>
          )}
        </div>
      )}
    </Link>
  )
}

export function ContentCardSkeleton({ variant = "poster" }: { variant?: "poster" | "landscape" }) {
  const isLandscape = variant === "landscape"
  
  return (
    <div className="flex flex-col overflow-hidden">
      <div className={cn(
        "w-full animate-pulse rounded-xl bg-muted",
        isLandscape ? "aspect-video" : "aspect-[2/3]"
      )} />
      {!isLandscape && (
        <div className="mt-3 flex flex-col gap-2 px-1">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      )}
    </div>
  )
}
