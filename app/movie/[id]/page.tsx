"use client"

import { use } from "react"
import { Navbar } from "@/components/navbar"
import { AddonProvider } from "@/components/addon-provider"
import { ContentDetail } from "@/components/content-detail"

export default function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  return (
    <AddonProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pb-20 pt-14 lg:pb-8 lg:pl-64 lg:pt-0">
          <ContentDetail type="movie" id={id} />
        </main>
      </div>
    </AddonProvider>
  )
}
