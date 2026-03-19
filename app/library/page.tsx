"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { AddonProvider } from "@/components/addon-provider"
import { ContentCard } from "@/components/content-card"
import { useAddonStore } from "@/lib/stremio/store"
import { Bookmark, History, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "watchlist", label: "Watchlist", icon: Bookmark },
  { id: "continue", label: "Continue", icon: Clock },
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
      
      <main className="pb-20 pt-14 lg:pb-8 lg:pl-64 lg:pt-0">
        {/* Header */}
        <div className="border-b border-border bg-card/50 px-4 py-6 lg:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Library</h1>
            {tab === "history" && history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-sm text-muted-foreground hover:text-destructive"
              >
                Clear History
              </button>
            )}
          </div>
          
          {/* Tabs */}
          <div className="mt-4 flex gap-2">
            {TABS.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    tab === t.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
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
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6 lg:p-6 xl:grid-cols-6">
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
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            {tab === "watchlist" && (
              <>
                <Bookmark className="mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="mb-2 text-lg font-medium text-foreground">
                  Your watchlist is empty
                </h2>
                <p className="text-sm text-muted-foreground">
                  Save movies and series to watch later
                </p>
              </>
            )}
            {tab === "continue" && (
              <>
                <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="mb-2 text-lg font-medium text-foreground">
                  Nothing to continue
                </h2>
                <p className="text-sm text-muted-foreground">
                  Start watching something and it will appear here
                </p>
              </>
            )}
            {tab === "history" && (
              <>
                <History className="mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="mb-2 text-lg font-medium text-foreground">
                  No watch history
                </h2>
                <p className="text-sm text-muted-foreground">
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
