"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Addon, Meta } from "./types"
import { stremioClient, initializeAddons, DEFAULT_ADDONS } from "./client"

interface AddonStore {
  // Addons
  installedAddonUrls: string[]
  addons: Addon[]
  isLoading: boolean
  error: string | null

  // Actions
  initializeStore: () => Promise<void>
  installAddon: (url: string) => Promise<boolean>
  uninstallAddon: (id: string) => void

  // Watchlist
  watchlist: Meta[]
  addToWatchlist: (meta: Meta) => void
  removeFromWatchlist: (id: string) => void
  isInWatchlist: (id: string) => boolean

  // Watch history
  history: { meta: Meta; timestamp: number; progress?: number }[]
  addToHistory: (meta: Meta, progress?: number) => void
  clearHistory: () => void

  // Continue watching
  continueWatching: { meta: Meta; videoId: string; progress: number; timestamp: number }[]
  updateProgress: (meta: Meta, videoId: string, progress: number) => void
  getContinueWatching: () => { meta: Meta; videoId: string; progress: number }[]
}

export const useAddonStore = create<AddonStore>()(
  persist(
    (set, get) => ({
      // Initial state
      installedAddonUrls: DEFAULT_ADDONS,
      addons: [],
      isLoading: false,
      error: null,
      watchlist: [],
      history: [],
      continueWatching: [],

      // Initialize addons
      initializeStore: async () => {
        set({ isLoading: true, error: null })
        try {
          const { installedAddonUrls } = get()
          
          // Load all installed addons
          await Promise.all(
            installedAddonUrls.map((url) => stremioClient.loadAddon(url))
          )
          
          // Also ensure defaults are loaded
          await initializeAddons()
          
          set({ addons: stremioClient.getAddons(), isLoading: false })
        } catch (error) {
          set({ error: "Failed to initialize addons", isLoading: false })
        }
      },

      // Install addon
      installAddon: async (url: string) => {
        const addon = await stremioClient.loadAddon(url)
        if (addon) {
          const { installedAddonUrls } = get()
          if (!installedAddonUrls.includes(url)) {
            set({
              installedAddonUrls: [...installedAddonUrls, url],
              addons: stremioClient.getAddons(),
            })
          }
          return true
        }
        return false
      },

      // Uninstall addon
      uninstallAddon: (id: string) => {
        const addon = get().addons.find((a) => a.manifest.id === id)
        if (addon && !DEFAULT_ADDONS.includes(addon.transportUrl + "/manifest.json")) {
          stremioClient.removeAddon(id)
          set({
            installedAddonUrls: get().installedAddonUrls.filter(
              (url) => !url.includes(addon.transportUrl)
            ),
            addons: stremioClient.getAddons(),
          })
        }
      },

      // Watchlist
      addToWatchlist: (meta: Meta) => {
        const { watchlist } = get()
        if (!watchlist.some((m) => m.id === meta.id)) {
          set({ watchlist: [meta, ...watchlist] })
        }
      },

      removeFromWatchlist: (id: string) => {
        set({ watchlist: get().watchlist.filter((m) => m.id !== id) })
      },

      isInWatchlist: (id: string) => {
        return get().watchlist.some((m) => m.id === id)
      },

      // History
      addToHistory: (meta: Meta, progress?: number) => {
        const { history } = get()
        const filtered = history.filter((h) => h.meta.id !== meta.id)
        set({
          history: [{ meta, timestamp: Date.now(), progress }, ...filtered].slice(0, 100),
        })
      },

      clearHistory: () => set({ history: [] }),

      // Continue watching
      updateProgress: (meta: Meta, videoId: string, progress: number) => {
        const { continueWatching } = get()
        const filtered = continueWatching.filter(
          (cw) => !(cw.meta.id === meta.id && cw.videoId === videoId)
        )
        
        // Only save if not completed (less than 95%)
        if (progress < 0.95) {
          set({
            continueWatching: [
              { meta, videoId, progress, timestamp: Date.now() },
              ...filtered,
            ].slice(0, 20),
          })
        } else {
          set({ continueWatching: filtered })
        }
      },

      getContinueWatching: () => {
        return get()
          .continueWatching
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10)
      },
    }),
    {
      name: "stremio-kai-storage",
      partialize: (state) => ({
        installedAddonUrls: state.installedAddonUrls,
        watchlist: state.watchlist,
        history: state.history,
        continueWatching: state.continueWatching,
      }),
    }
  )
)
