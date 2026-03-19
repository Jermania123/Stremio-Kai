"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { AddonProvider } from "@/components/addon-provider"
import { ContentCard } from "@/components/content-card"
import { useAddonStore } from "@/lib/stremio/store"
import { Bookmark, History, Clock, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "watchlist", label: "Watchlist", icon: Bookmark },
  { id: "continue", label: "Continue Watching", icon: Clock },
  { id: "history", label: "History", icon: History },
]

function LibraryPage() {
  const [tab, setTab] = useState("watchlist")
  const { watchlist, history, getContinueWatching, clearHistory } = useAddonStore()
  const continueWatching = getContinueWatching()

  const getContent = () => {
    switch (tab) {
      case "watchlist":
        return watchlist
      case "continue":
        return continueWatching.map((cw) => cw.meta)
      case "history":
        return history.map((h) => h.meta)
      default:
        return []
    }
  }

  const content = getContent()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pb-20 pt-20 lg:pb-8 lg:pt-24">
        {/* Header */}
        <div className="px-6 py-8 lg:px-16">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl">Library</h1>
            {tab === "history" && history.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-foreground/60 transition-colors hover:bg-destructive/20 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Clear History
              </button>
            )}
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {TABS.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
                    tab === t.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground/10 text-foreground/70 hover:bg-foreground/20 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        {content.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 px-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6 lg:px-16 xl:grid-cols-6 2xl:grid-cols-7">
            {content.map((item) => (
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
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            {tab === "watchlist" && (
              <>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-foreground/5">
                  <Bookmark className="h-10 w-10 text-foreground/30" />
                </div>
                <h2 className="mb-2 text-xl font-medium text-foreground">
                  Your watchlist is empty
                </h2>
                <p className="text-muted-foreground">
                  Save movies and series to watch later
                </p>
              </>
            )}
            {tab === "continue" && (
              <>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-foreground/5">
                  <Clock className="h-10 w-10 text-foreground/30" />
                </div>
                <h2 className="mb-2 text-xl font-medium text-foreground">
                  Nothing to continue
                </h2>
                <p className="text-muted-foreground">
                  Start watching something and pick up where you left off
                </p>
              </>
            )}
            {tab === "history" && (
              <>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-foreground/5">
                  <History className="h-10 w-10 text-foreground/30" />
                </div>
                <h2 className="mb-2 text-xl font-medium text-foreground">
                  No watch history yet
                </h2>
                <p className="text-muted-foreground">
                  Content you watch will appear here
                </p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default function Library() {
  return (
    <AddonProvider>
      <LibraryPage />
    </AddonProvider>
  )
}
