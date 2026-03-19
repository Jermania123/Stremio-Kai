// Stremio addon protocol types

export interface Addon {
  transportUrl: string
  manifest: AddonManifest
}

export interface AddonManifest {
  id: string
  version: string
  name: string
  description?: string
  logo?: string
  background?: string
  types: string[]
  catalogs: AddonCatalog[]
  resources: (string | AddonResource)[]
  idPrefixes?: string[]
  behaviorHints?: {
    adult?: boolean
    p2p?: boolean
    configurable?: boolean
    configurationRequired?: boolean
  }
}

export interface AddonResource {
  name: string
  types: string[]
  idPrefixes?: string[]
}

export interface AddonCatalog {
  type: string
  id: string
  name?: string
  extra?: AddonCatalogExtra[]
  extraRequired?: string[]
  extraSupported?: string[]
}

export interface AddonCatalogExtra {
  name: string
  isRequired?: boolean
  options?: string[]
  optionsLimit?: number
}

export interface Meta {
  id: string
  type: string
  name: string
  poster?: string
  posterShape?: "square" | "poster" | "landscape"
  background?: string
  logo?: string
  description?: string
  releaseInfo?: string
  imdbRating?: string
  runtime?: string
  genres?: string[]
  director?: string[]
  cast?: string[]
  writer?: string[]
  videos?: Video[]
  links?: MetaLink[]
  trailers?: { source: string; type: string }[]
  behaviorHints?: {
    defaultVideoId?: string
    hasScheduledVideos?: boolean
  }
}

export interface Video {
  id: string
  title: string
  released?: string
  thumbnail?: string
  streams?: Stream[]
  season?: number
  episode?: number
  overview?: string
}

export interface MetaLink {
  name: string
  category: string
  url: string
}

export interface Stream {
  name?: string
  title?: string
  url?: string
  ytId?: string
  infoHash?: string
  fileIdx?: number
  externalUrl?: string
  behaviorHints?: {
    notWebReady?: boolean
    bingeGroup?: string
    countryWhitelist?: string[]
    proxyHeaders?: {
      request?: Record<string, string>
      response?: Record<string, string>
    }
  }
}

export interface CatalogResponse {
  metas: Meta[]
}

export interface MetaResponse {
  meta: Meta
}

export interface StreamResponse {
  streams: Stream[]
}
