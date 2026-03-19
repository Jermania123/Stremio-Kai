"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useMeta, useStreams } from "@/lib/stremio/hooks"
import { useAddonStore } from "@/lib/stremio/store"
import type { Video, Stream } from "@/lib/stremio/types"
import { VideoPlayer } from "./video-player"
import { Navbar } from "./navbar"
import {
  Play,
  Star,
  Clock,
  Bookmark,
  BookmarkCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentDetailProps {
  type: "movie" | "series"
  id: string
}

export function ContentDetail({ type, id }: ContentDetailProps) {
  const { data: meta, isLoading } = useMeta(type, id)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, addToHistory } = useAddonStore()
  
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
  const [showAllEpisodes, setShowAllEpisodes] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<number>(1)

  const inWatchlist = meta ? isInWatchlist(meta.id) : false

  // Get streams for the selected video
  const videoId = selectedVideo ? `${id}:${selectedVideo.id}` : type === "movie" ? id : null
  const { data: streams, isLoading: streamsLoading } = useStreams(type, videoId)

  const handlePlay = (video?: Video) => {
    if (video) {
      setSelectedVideo(video)
    } else if (meta) {
      // For movies, play directly
      if (type === "movie") {
        setSelectedVideo({ id: meta.id, title: meta.name })
      } else if (meta.videos && meta.videos.length > 0) {
        // For series, play first episode
        setSelectedVideo(meta.videos[0])
      }
    }
  }

  const handleSelectStream = (stream: Stream) => {
    setSelectedStream(stream)
    if (meta) {
      addToHistory(meta)
    }
  }

  const handleClosePlayer = () => {
    setSelectedStream(null)
    setSelectedVideo(null)
  }

  const toggleWatchlist = () => {
    if (!meta) return
    if (inWatchlist) {
      removeFromWatchlist(meta.id)
    } else {
      addToWatchlist(meta)
    }
  }

  // Group episodes by season
  const seasons = meta?.videos?.reduce((acc, video) => {
    const season = video.season || 1
    if (!acc[season]) acc[season] = []
    acc[season].push(video)
    return acc
  }, {} as Record<number, Video[]>)

  const seasonNumbers = seasons ? Object.keys(seasons).map(Number).sort((a, b) => a - b) : []
  const currentSeasonEpisodes = seasons?.[selectedSeason] || []
  const displayedEpisodes = showAllEpisodes
    ? currentSeasonEpisodes
    : currentSeasonEpisodes.slice(0, 10)

  if (isLoading) {
    return <ContentDetailSkeleton />
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[80vh] items-center justify-center">
          <p className="text-muted-foreground">Content not found</p>
        </div>
      </div>
    )
  }

  // Show video player if stream is selected
  if (selectedStream) {
    return (
      <VideoPlayer
        stream={selectedStream}
        title={selectedVideo?.title || meta.name}
        onClose={handleClosePlayer}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Background */}
      <div className="relative">
        {/* Background image with overlay */}
        <div className="absolute inset-0 h-[70vh] overflow-hidden">
          {(meta.background || meta.poster) && (
            <Image
              src={meta.background || meta.poster || ""}
              alt=""
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative px-6 pb-8 pt-32 lg:px-16 lg:pt-40">
          {/* Back button */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-12">
            {/* Poster */}
            <div className="flex-shrink-0 hidden lg:block">
              <div className="relative aspect-[2/3] w-64 overflow-hidden rounded-xl shadow-2xl">
                {meta.poster ? (
                  <Image
                    src={meta.poster}
                    alt={meta.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <Play className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 max-w-3xl">
              <h1 className="mb-4 text-4xl font-bold text-foreground text-balance lg:text-5xl">
                {meta.name}
              </h1>

              {/* Meta info */}
              <div className="mb-5 flex flex-wrap items-center gap-4 text-sm">
                {meta.imdbRating && (
                  <span className="flex items-center gap-1.5 rounded-md bg-yellow-500/20 px-3 py-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-yellow-400" />
                    {meta.imdbRating}
                  </span>
                )}
                {meta.releaseInfo && (
                  <span className="flex items-center gap-1.5 text-foreground/70">
                    <Calendar className="h-4 w-4" />
                    {meta.releaseInfo}
                  </span>
                )}
                {meta.runtime && (
                  <span className="flex items-center gap-1.5 text-foreground/70">
                    <Clock className="h-4 w-4" />
                    {meta.runtime}
                  </span>
                )}
              </div>

              {/* Genres */}
              {meta.genres && meta.genres.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {meta.genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground/80"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {meta.description && (
                <p className="mb-6 line-clamp-4 text-foreground/70 leading-relaxed lg:text-lg">
                  {meta.description}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handlePlay()}
                  className="flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
                >
                  <Play className="h-6 w-6 fill-current" />
                  {type === "movie" ? "Watch Now" : "Play"}
                </button>
                <button
                  onClick={toggleWatchlist}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-6 py-4 font-semibold transition-all",
                    inWatchlist
                      ? "bg-primary/20 text-primary"
                      : "bg-foreground/10 text-foreground/80 hover:bg-foreground/20 hover:text-foreground"
                  )}
                >
                  {inWatchlist ? (
                    <BookmarkCheck className="h-5 w-5" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                  {inWatchlist ? "In Watchlist" : "Watchlist"}
                </button>
              </div>

              {/* Cast */}
              {meta.cast && meta.cast.length > 0 && (
                <div className="mt-6">
                  <span className="text-sm text-foreground/60">
                    <strong className="text-foreground/80">Cast:</strong>{" "}
                    {meta.cast.slice(0, 5).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Episodes (for series) */}
      {type === "series" && seasons && seasonNumbers.length > 0 && (
        <section className="px-6 py-10 lg:px-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Episodes</h2>
            
            {/* Season selector */}
            {seasonNumbers.length > 1 && (
              <div className="flex gap-2">
                {seasonNumbers.map((season) => (
                  <button
                    key={season}
                    onClick={() => setSelectedSeason(season)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-all",
                      selectedSeason === season
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/10 text-foreground/70 hover:bg-foreground/20"
                    )}
                  >
                    Season {season}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedEpisodes.map((video) => (
              <button
                key={video.id}
                onClick={() => handlePlay(video)}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-foreground/5 text-left transition-all hover:border-primary hover:bg-foreground/10"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-muted">
                      <Play className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-foreground">
                    {video.episode && `E${video.episode}. `}
                    {video.title}
                  </h3>
                  {video.overview && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {video.overview}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {currentSeasonEpisodes.length > 10 && (
            <button
              onClick={() => setShowAllEpisodes(!showAllEpisodes)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-4 text-foreground/70 transition-all hover:border-primary hover:text-primary"
            >
              {showAllEpisodes ? (
                <>
                  Show Less <ChevronUp className="h-5 w-5" />
                </>
              ) : (
                <>
                  Show All {currentSeasonEpisodes.length} Episodes{" "}
                  <ChevronDown className="h-5 w-5" />
                </>
              )}
            </button>
          )}
        </section>
      )}

      {/* Stream selection modal */}
      {selectedVideo && !selectedStream && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg rounded-t-2xl bg-card p-6 shadow-2xl sm:rounded-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Select Stream
              </h2>
              <button
                onClick={() => setSelectedVideo(null)}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {streamsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-xl bg-muted"
                  />
                ))}
              </div>
            ) : streams && streams.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {streams.map((stream, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectStream(stream)}
                    disabled={!stream.url && !stream.externalUrl}
                    className="flex w-full items-center gap-4 rounded-xl border border-border bg-foreground/5 p-4 text-left transition-all hover:border-primary hover:bg-foreground/10 disabled:opacity-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-foreground">
                        {stream.name || stream.title || "Stream"}
                      </h3>
                      {stream.title && stream.name && (
                        <p className="text-sm text-muted-foreground truncate">
                          {stream.title}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                No streams available for this content
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ContentDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative">
        <div className="h-[50vh] animate-pulse bg-muted" />
        <div className="px-6 py-8 lg:px-16">
          <div className="h-12 w-2/3 animate-pulse rounded-lg bg-muted mb-4" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-muted mb-6" />
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  )
}
