"use client"

import { useState } from "react"
import Image from "next/image"
import { useMeta, useStreams } from "@/lib/stremio/hooks"
import { useAddonStore } from "@/lib/stremio/store"
import type { Video, Stream } from "@/lib/stremio/types"
import { VideoPlayer } from "./video-player"
import {
  Play,
  Star,
  Clock,
  Bookmark,
  BookmarkCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Content not found</p>
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
    <div className="relative">
      {/* Background */}
      {meta.background && (
        <div className="absolute inset-x-0 top-0 h-64 overflow-hidden lg:h-80">
          <Image
            src={meta.background}
            alt=""
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        </div>
      )}

      {/* Content */}
      <div className="relative px-4 py-6 lg:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="relative mx-auto aspect-[2/3] w-40 overflow-hidden rounded-lg border border-border shadow-xl lg:w-56">
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
                  <Play className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="mb-2 text-2xl font-bold text-foreground lg:text-3xl">
              {meta.name}
            </h1>

            {/* Meta info */}
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {meta.releaseInfo && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {meta.releaseInfo}
                </span>
              )}
              {meta.runtime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {meta.runtime}
                </span>
              )}
              {meta.imdbRating && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  {meta.imdbRating}
                </span>
              )}
            </div>

            {/* Genres */}
            {meta.genres && meta.genres.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {meta.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="mb-6 flex flex-wrap gap-3">
              <button
                onClick={() => handlePlay()}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Play className="h-5 w-5 fill-current" />
                {type === "movie" ? "Watch Now" : "Play"}
              </button>
              <button
                onClick={toggleWatchlist}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-4 py-3 font-medium transition-colors",
                  inWatchlist
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                )}
              >
                {inWatchlist ? (
                  <BookmarkCheck className="h-5 w-5" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
                {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </button>
            </div>

            {/* Description */}
            {meta.description && (
              <p className="text-sm leading-relaxed text-muted-foreground lg:text-base">
                {meta.description}
              </p>
            )}

            {/* Cast */}
            {meta.cast && meta.cast.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Cast:</strong>{" "}
                  {meta.cast.slice(0, 5).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Episodes (for series) */}
        {type === "series" && seasons && seasonNumbers.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Episodes</h2>
              
              {/* Season selector */}
              {seasonNumbers.length > 1 && (
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                >
                  {seasonNumbers.map((season) => (
                    <option key={season} value={season}>
                      Season {season}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              {displayedEpisodes.map((video) => (
                <button
                  key={video.id}
                  onClick={() => handlePlay(video)}
                  className="flex w-full items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary"
                >
                  {video.thumbnail ? (
                    <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded bg-muted">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-28 flex-shrink-0 items-center justify-center rounded bg-muted">
                      <Play className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate">
                      {video.episode && `E${video.episode}. `}
                      {video.title}
                    </h3>
                    {video.overview && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {video.overview}
                      </p>
                    )}
                  </div>
                  <Play className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>

            {currentSeasonEpisodes.length > 10 && (
              <button
                onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {showAllEpisodes ? (
                  <>
                    Show Less <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show All {currentSeasonEpisodes.length} Episodes{" "}
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </section>
        )}

        {/* Stream selection (when video is selected but no stream yet) */}
        {selectedVideo && !selectedStream && (
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Select Stream
            </h2>
            {streamsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            ) : streams && streams.length > 0 ? (
              <div className="space-y-2">
                {streams.map((stream, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectStream(stream)}
                    disabled={!stream.url && !stream.externalUrl}
                    className="flex w-full items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary disabled:opacity-50"
                  >
                    <Play className="h-5 w-5 flex-shrink-0 text-primary" />
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
              <p className="text-muted-foreground">
                No streams available for this content
              </p>
            )}
            
            <button
              onClick={() => setSelectedVideo(null)}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </section>
        )}
      </div>
    </div>
  )
}

function ContentDetailSkeleton() {
  return (
    <div className="px-4 py-6 lg:px-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="mx-auto h-60 w-40 animate-pulse rounded-lg bg-muted lg:h-80 lg:w-56" />
        <div className="flex-1 space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
