"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { AddonProvider } from "@/components/addon-provider"
import { useAddonStore } from "@/lib/stremio/store"
import { COMMUNITY_ADDONS } from "@/lib/stremio/client"
import { Plus, Trash2, ExternalLink, Package, Download } from "lucide-react"
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
      
      <main className="pb-20 pt-14 lg:pb-8 lg:pl-64 lg:pt-0">
        {/* Header */}
        <div className="border-b border-border bg-card/50 px-4 py-6 lg:px-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="p-4 lg:p-6">
          {/* Installed Addons */}
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Package className="h-5 w-5 text-primary" />
              Installed Addons
            </h2>
            <div className="space-y-3">
              {addons.map((addon) => (
                <div
                  key={addon.manifest.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
                >
                  {addon.manifest.logo ? (
                    <Image
                      src={addon.manifest.logo}
                      alt={addon.manifest.name}
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-primary">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {addon.manifest.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {addon.manifest.description || `v${addon.manifest.version}`}
                    </p>
                  </div>
                  <button
                    onClick={() => uninstallAddon(addon.manifest.id)}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Uninstall"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              
              {addons.length === 0 && (
                <p className="text-muted-foreground">No addons installed</p>
              )}
            </div>
          </section>

          {/* Add Custom Addon */}
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Plus className="h-5 w-5 text-primary" />
              Add Custom Addon
            </h2>
            <div className="flex gap-3">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Enter addon manifest URL..."
                className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={() => handleInstall(customUrl)}
                disabled={!customUrl || isInstalling}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isInstalling ? "Installing..." : "Install"}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-destructive">{error}</p>
            )}
          </section>

          {/* Community Addons */}
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Download className="h-5 w-5 text-primary" />
              Community Addons
            </h2>
            <div className="space-y-3">
              {COMMUNITY_ADDONS.map((addon) => {
                const isInstalled = installedAddonUrls.some((url) =>
                  url.includes(new URL(addon.url).hostname)
                )
                return (
                  <div
                    key={addon.url}
                    className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-primary">
                      <Package className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{addon.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {addon.description}
                      </p>
                    </div>
                    {isInstalled ? (
                      <span className="flex-shrink-0 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                        Installed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleInstall(addon.url)}
                        disabled={isInstalling}
                        className="flex-shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                      >
                        Install
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* About */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">About</h2>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <span className="text-xl font-bold text-primary">K</span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Stremio Kai Mobile</h3>
                  <p className="text-sm text-muted-foreground">Version 1.0.0</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
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
