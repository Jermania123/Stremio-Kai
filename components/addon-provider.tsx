"use client"

import { useEffect, useState } from "react"
import { useAddonStore } from "@/lib/stremio/store"

export function AddonProvider({ children }: { children: React.ReactNode }) {
  const { initializeStore, isLoading } = useAddonStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    initializeStore().then(() => setInitialized(true))
  }, [initializeStore])

  if (!initialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <span className="text-3xl font-bold text-primary">K</span>
          </div>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading addons...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
