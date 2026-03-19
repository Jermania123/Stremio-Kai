"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { AddonProvider } from "@/components/addon-provider"
import { useAddonStore } from "@/lib/stremio/store"
import { COMMUNITY_ADDONS } from "@/lib/stremio/client"
import { Plus, Trash2, ExternalLink, Package, Download, Check } from "lucide-react"
import Image from "next/image"

function SettingsPage() {
  const { addons, installAddon, uninstallAddon, installedAddonUrls } = useAddonStore()
  const [customUrl, setCustomUrl] = useState("")
  const [isInstalling, setIsInstalling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInstall = async (url: string) => {
    setIsInstalling(true)
    setError(null)
    
    const success = await installAddon(url)
    if (!success) {
      setError("Failed to install addon. Check the URL and try again.")
    }
    
    setIsInstalling(false)
    setCustomUrl("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pb-20 pt-20 lg:pb-8 lg:pt-24">
        {/* Header */}
        <div className="px-6 py-8 lg:px-16">
          <h1 className="text-3xl font-bold text-foreground lg:text-4xl">Settings</h1>
        </div>

        <div className="px-6 lg:px-16">
          {/* Add Custom Addon */}
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
              <Plus className="h-5 w-5 text-primary" />
              Add Custom Addon
            </h2>
            <div className="flex gap-3 max-w-2xl">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Enter addon manifest URL..."
                className="flex-1 rounded-full border border-border bg-foreground/5 px-6 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-foreground/10 focus:outline-none transition-all"
              />
              <button
                onClick={() => handleInstall(customUrl)}
                disabled={!customUrl || isInstalling}
                className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {isInstalling ? "Installing..." : "Install"}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-sm text-destructive">{error}</p>
            )}
          </section>

          {/* Installed Addons */}
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
              <Package className="h-5 w-5 text-primary" />
              Installed Addons ({addons.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {addons.map((addon) => (
                <div
                  key={addon.manifest.id}
                  className="flex items-start gap-4 rounded-xl border border-border bg-foreground/5 p-5 transition-all hover:bg-foreground/10"
                >
                  {addon.manifest.logo ? (
                    <Image
                      src={addon.manifest.logo}
                      alt={addon.manifest.name}
                      width={48}
                      height={48}
                      className="rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {addon.manifest.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {addon.manifest.description || `v${addon.manifest.version}`}
                    </p>
                    <button
                      onClick={() => uninstallAddon(addon.manifest.id)}
                      className="mt-3 flex items-center gap-1.5 text-sm text-foreground/60 transition-colors hover:text-destructive"
                      title="Uninstall"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              {addons.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                  <Package className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">No addons installed yet</p>
                </div>
              )}
            </div>
          </section>

          {/* Community Addons */}
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
              <Download className="h-5 w-5 text-primary" />
              Community Addons
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {COMMUNITY_ADDONS.map((addon) => {
                const isInstalled = installedAddonUrls.some((url) =>
                  url.includes(new URL(addon.url).hostname)
                )
                return (
                  <div
                    key={addon.url}
                    className="flex items-start gap-4 rounded-xl border border-border bg-foreground/5 p-5 transition-all hover:bg-foreground/10"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                      <Package className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{addon.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {addon.description}
                      </p>
                      {isInstalled ? (
                        <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary">
                          <Check className="h-4 w-4" />
                          Installed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleInstall(addon.url)}
                          disabled={isInstalling}
                          className="mt-3 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                        >
                          Install
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* About */}
          <section className="pb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">About</h2>
            <div className="rounded-xl border border-border bg-foreground/5 p-6 max-w-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                  <span className="text-2xl font-bold text-primary-foreground">K</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Stremio Kai</h3>
                  <p className="text-sm text-muted-foreground">Version 1.0.0</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                A web-based streaming app inspired by Stremio Kai for Windows.
                Browse and stream content using Stremio addons.
              </p>
              <a
                href="https://github.com/allecsc/Stremio-Kai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default function Settings() {
  return (
    <AddonProvider>
      <SettingsPage />
    </AddonProvider>
  )
}
