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
  className?: string
}

export function ContentCard({
  id,
  type,
  title,
  poster,
  year,
  rating,
  className,
}: ContentCardProps) {
  return (
    <Link
      href={`/${type}/${id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20",
        className
      )}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        {poster ? (
          <Image
            src={poster}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Play className="h-12 w-12" />
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Play className="h-6 w-6 fill-current" />
          </div>
        </div>
        
        {/* Rating badge */}
        {rating !== undefined && rating > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            {rating.toFixed(1)}
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">
          {title}
        </h3>
        {year && (
          <span className="text-xs text-muted-foreground">{year}</span>
        )}
      </div>
    </Link>
  )
}

export function ContentCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="aspect-[2/3] w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
