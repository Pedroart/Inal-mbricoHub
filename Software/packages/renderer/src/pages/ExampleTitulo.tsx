import { useState } from "react"
import { IndustrialHeader } from "../components/industrial-header"



export default function Dashboard() {

  return (
    <div className="min-h-screen bg-background">
      <main className="px-6 py-6 pb-20">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Dashboard Overview</h2>
            <p className="text-muted-foreground font-mono text-sm tracking-wide">
              SYSTEM STATUS: OPERATIONAL
            </p>
          </div>

        </div>

        {/* Content Grid */}
        <div
          className={`grid gap-6 ${
            true
              ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          }`}
        >

        </div>
      </main>

      <IndustrialHeader title="TITULO" />
    </div>
  )
}
