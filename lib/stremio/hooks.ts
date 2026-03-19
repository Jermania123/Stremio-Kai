"use client"

import useSWR from "swr"
import { stremioClient } from "./client"
import { useAddonStore } from "./store"
import type { Meta, Stream } from "./types"

// Fetcher for catalog
async function catalogFetcher([type, catalogId, extra]: [
  string,
  string,
  Record<string, string>?
]): Promise<Meta[]> {
  const addons = stremioClient.getAddons()
  const results: Meta[] = []
  const seen = new Set<string>()

  for (const addon of addons) {
    const catalog = addon.manifest.catalogs.find(
      (c) => c.type === type && c.id === catalogId
    )
    
    if (catalog) {
      const metas = await stremioClient.getCatalog(addon, type, catalogId, extra)
      for (const meta of metas) {
        if (!seen.has(meta.id)) {
          seen.add(meta.id)
          results.push({ ...meta, type })
        }
      }
    }
  }

  return results
}

// Fetcher for metadata
async function metaFetcher([type, id]: [string, string]): Promise<Meta | null> {
  const addons = stremioClient.getAddons()

  for (const addon of addons) {
    if (stremioClient.addonSupports(addon, "meta", type)) {
      const meta = await stremioClient.getMeta(addon, type, id)
      if (meta) return { ...meta, type }
    }
  }

  return null
}

// Fetcher for streams
async function streamFetcher([type, id]: [string, string]): Promise<Stream[]> {
  const addons = stremioClient.getAddons()
  const allStreams: Stream[] = []

  for (const addon of addons) {
    if (stremioClient.addonSupports(addon, "stream", type)) {
      const streams = await stremioClient.getStreams(addon, type, id)
      allStreams.push(...streams)
    }
  }

  return allStreams
}

// Fetcher for search
async function searchFetcher([query, type]: [string, string?]): Promise<Meta[]> {
  if (!query || query.length < 2) return []
  return stremioClient.search(query, type)
}

/**
 * Hook to get catalog content
 */
export function useCatalog(type: string, catalogId: string, extra?: Record<string, string>) {
  const { addons } = useAddonStore()
  
  return useSWR(
    addons.length > 0 ? [type, catalogId, extra] : null,
    catalogFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  )
}

/**
 * Hook to get metadata for a specific item
 */
export function useMeta(type: string | null, id: string | null) {
  const { addons } = useAddonStore()
  
  return useSWR(
    addons.length > 0 && type && id ? [type, id] : null,
    metaFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  )
}

/**
 * Hook to get streams for an item
 */
export function useStreams(type: string | null, id: string | null) {
  const { addons } = useAddonStore()
  
  return useSWR(
    addons.length > 0 && type && id ? [`stream-${type}`, id] : null,
    ([, streamId]) => streamFetcher([type!, streamId]),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )
}

/**
 * Hook to search content
 */
export function useSearch(query: string, type?: string) {
  const { addons } = useAddonStore()
  
  return useSWR(
    addons.length > 0 && query.length >= 2 ? [query, type] : null,
    searchFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )
}

/**
 * Hook to get multiple catalog rows for the home page
 */
export function useHomeCatalogs() {
  const { addons } = useAddonStore()
  
  const movieTop = useCatalog("movie", "top")
  const seriesTop = useCatalog("series", "top")
  const moviePopular = useCatalog("movie", "year", { genre: "2024" })
  
  return {
    isLoading: !addons.length || movieTop.isLoading || seriesTop.isLoading,
    catalogs: [
      { title: "Top Movies", data: movieTop.data || [], isLoading: movieTop.isLoading },
      { title: "Top Series", data: seriesTop.data || [], isLoading: seriesTop.isLoading },
      { title: "Movies 2024", data: moviePopular.data || [], isLoading: moviePopular.isLoading },
    ],
  }
}
