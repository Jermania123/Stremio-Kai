"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import type { Stream } from "@/lib/stremio/types"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  X,
  SkipBack,
  SkipForward,
  Settings,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  stream: Stream
  title: string
  onClose: () => void
  onProgress?: (progress: number) => void
}

export function VideoPlayer({ stream, title, onClose, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolume] = useState(1)

  // Get video URL
  const videoUrl = stream.url || stream.externalUrl

  // Format time
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Hide controls after inactivity
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true)
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [isPlaying])

  // Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  // Mute
  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  // Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const value = parseFloat(e.target.value)
    videoRef.current.volume = value
    setVolume(value)
    setIsMuted(value === 0)
  }

  // Fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error("Fullscreen error:", err)
    }
  }

  // Seek
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = percent * duration
  }

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime += seconds
  }

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      if (duration > 0) {
        onProgress?.(video.currentTime / duration)
      }
    }
    const onDurationChange = () => setDuration(video.duration)
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1))
      }
    }
    const onWaiting = () => setIsLoading(true)
    const onCanPlay = () => setIsLoading(false)
    const onError = () => setError("Failed to load video")

    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("durationchange", onDurationChange)
    video.addEventListener("progress", onProgress)
    video.addEventListener("waiting", onWaiting)
    video.addEventListener("canplay", onCanPlay)
    video.addEventListener("error", onError)

    return () => {
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("durationchange", onDurationChange)
      video.removeEventListener("progress", onProgress)
      video.removeEventListener("waiting", onWaiting)
      video.removeEventListener("canplay", onCanPlay)
      video.removeEventListener("error", onError)
    }
  }, [duration, onProgress])

  // Fullscreen change listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault()
          togglePlay()
          break
        case "f":
          e.preventDefault()
          toggleFullscreen()
          break
        case "m":
          e.preventDefault()
          toggleMute()
          break
        case "ArrowLeft":
          e.preventDefault()
          skip(-10)
          break
        case "ArrowRight":
          e.preventDefault()
          skip(10)
          break
        case "Escape":
          if (!document.fullscreenElement) {
            onClose()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Auto-play
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.play().catch(() => {
        // Auto-play blocked, user will need to click play
      })
    }
  }, [videoUrl])

  if (!videoUrl) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-white mb-4">This stream requires an external player</p>
          {stream.externalUrl && (
            <a
              href={stream.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
            >
              Open External Link
            </a>
          )}
          <button
            onClick={onClose}
            className="block mx-auto mt-4 text-muted-foreground hover:text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black"
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full"
        playsInline
        onClick={togglePlay}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <p className="text-white mb-4">{error}</p>
            <button
              onClick={onClose}
              className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/50 via-transparent to-black/80 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 safe-top">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="flex-1 px-4 text-center text-sm font-medium text-white truncate">
            {title}
          </h2>
          <div className="w-10" />
        </div>

        {/* Center play button */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => skip(-10)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <SkipBack className="h-6 w-6" />
          </button>
          <button
            onClick={togglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 fill-current" />
            ) : (
              <Play className="h-8 w-8 fill-current ml-1" />
            )}
          </button>
          <button
            onClick={() => skip(10)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <SkipForward className="h-6 w-6" />
          </button>
        </div>

        {/* Bottom controls */}
        <div className="p-4 safe-bottom">
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="group mb-4 h-1 cursor-pointer rounded-full bg-white/30"
            onClick={handleProgressClick}
          >
            {/* Buffered */}
            <div
              className="absolute h-1 rounded-full bg-white/50"
              style={{ width: `${(buffered / duration) * 100}%` }}
            />
            {/* Progress */}
            <div
              className="relative h-1 rounded-full bg-primary"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100" />
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white transition-colors hover:text-primary"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </button>

              {/* Volume */}
              <div className="group flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white transition-colors hover:text-primary"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-6 w-6" />
                  ) : (
                    <Volume2 className="h-6 w-6" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="hidden h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30 group-hover:block [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
              </div>

              {/* Time */}
              <span className="text-sm text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white transition-colors hover:text-primary"
              >
                {isFullscreen ? (
                  <Minimize className="h-6 w-6" />
                ) : (
                  <Maximize className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
