import type {
  Addon,
  AddonManifest,
  CatalogResponse,
  MetaResponse,
  StreamResponse,
  Meta,
  Stream,
} from "./types"

// Default addons for discovery
export const DEFAULT_ADDONS = [
  // Cinemeta - Official metadata addon
  "https://v3-cinemeta.strem.io/manifest.json",
  // Public domain movies
  "https://watchhub.strem.io/manifest.json",
]

// Popular community addons (user can add these)
export const COMMUNITY_ADDONS = [
  {
    name: "Torrentio",
    url: "https://torrentio.strem.fun/manifest.json",
    description: "Torrent streams from various sources",
  },
  {
    name: "Streaming Catalogs",
    url: "https://7a82163c306e-stremio-netflix-catalog.baby-beamup.club/manifest.json",
    description: "Browse Netflix, Prime, Disney+ catalogs",
  },
]

class StremioClient {
  private addons: Map<string, Addon> = new Map()

  /**
   * Fetch and parse addon manifest
   */
  async loadAddon(manifestUrl: string): Promise<Addon | null> {
    try {
      // Normalize URL
      const url = manifestUrl.endsWith("/manifest.json")
        ? manifestUrl
        : `${manifestUrl}/manifest.json`

      const baseUrl = url.replace("/manifest.json", "")

      const response = await fetch(url)
      if (!response.ok) {
        console.error(`Failed to load addon: ${response.status}`)
        return null
      }

      const manifest: AddonManifest = await response.json()
      const addon: Addon = {
        transportUrl: baseUrl,
        manifest,
      }

      this.addons.set(manifest.id, addon)
      return addon
    } catch (error) {
      console.error("Failed to load addon:", error)
      return null
    }
  }

  /**
   * Get catalog from addon
   */
  async getCatalog(
    addon: Addon,
    type: string,
    catalogId: string,
    extra?: Record<string, string>
  ): Promise<Meta[]> {
    try {
      let url = `${addon.transportUrl}/catalog/${type}/${catalogId}`

      if (extra && Object.keys(extra).length > 0) {
        const extraStr = Object.entries(extra)
          .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
          .join("&")
        url += `/${extraStr}`
      }

      url += ".json"

      const response = await fetch(url)
      if (!response.ok) return []

      const data: CatalogResponse = await response.json()
      return data.metas || []
    } catch (error) {
      console.error("Failed to get catalog:", error)
      return []
    }
  }

  /**
   * Get metadata for a specific item
   */
  async getMeta(addon: Addon, type: string, id: string): Promise<Meta | null> {
    try {
      const url = `${addon.transportUrl}/meta/${type}/${encodeURIComponent(id)}.json`
      const response = await fetch(url)
      if (!response.ok) return null

      const data: MetaResponse = await response.json()
      return data.meta || null
    } catch (error) {
      console.error("Failed to get meta:", error)
      return null
    }
  }

  /**
   * Get streams for a specific item
   */
  async getStreams(addon: Addon, type: string, id: string): Promise<Stream[]> {
    try {
      const url = `${addon.transportUrl}/stream/${type}/${encodeURIComponent(id)}.json`
      const response = await fetch(url)
      if (!response.ok) return []

      const data: StreamResponse = await response.json()
      return data.streams || []
    } catch (error) {
      console.error("Failed to get streams:", error)
      return []
    }
  }

  /**
   * Search across all loaded addons
   */
  async search(query: string, type?: string): Promise<Meta[]> {
    const results: Meta[] = []
    const seen = new Set<string>()

    for (const addon of this.addons.values()) {
      // Find catalogs that support search
      for (const catalog of addon.manifest.catalogs) {
        if (type && catalog.type !== type) continue

        const supportsSearch =
          catalog.extraSupported?.includes("search") ||
          catalog.extra?.some((e) => e.name === "search")

        if (supportsSearch) {
          const metas = await this.getCatalog(addon, catalog.type, catalog.id, {
            search: query,
          })

          for (const meta of metas) {
            const key = `${meta.type}:${meta.id}`
            if (!seen.has(key)) {
              seen.add(key)
              results.push(meta)
            }
          }
        }
      }
    }

    return results
  }

  /**
   * Get all loaded addons
   */
  getAddons(): Addon[] {
    return Array.from(this.addons.values())
  }

  /**
   * Remove an addon
   */
  removeAddon(id: string): void {
    this.addons.delete(id)
  }

  /**
   * Check if addon supports a resource
   */
  addonSupports(addon: Addon, resource: string, type: string): boolean {
    return addon.manifest.resources.some((r) => {
      if (typeof r === "string") return r === resource
      return r.name === resource && r.types.includes(type)
    })
  }
}

// Singleton instance
export const stremioClient = new StremioClient()

// Initialize default addons
export async function initializeAddons(): Promise<void> {
  await Promise.all(DEFAULT_ADDONS.map((url) => stremioClient.loadAddon(url)))
}
