"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Database, BarChart3, Users, Grid3X3, ArrowLeft } from "lucide-react"

interface IndustrialHeaderProps {
  title?: string
  onMenuItemClick?: (item: string) => void
  onBack?: () => void
  showBackButton?: boolean
}

export function IndustrialHeader({
  title = "Industrial Dashboard",
  onMenuItemClick,
  onBack,
  showBackButton = false,
}: IndustrialHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "database", icon: Database, label: "Database" },
    { id: "users", icon: Users, label: "Users" },
    { id: "settings", icon: Settings, label: "Settings" },
  ]

  const handleMenuItemClick = (itemId: string) => {
    onMenuItemClick?.(itemId)
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-center px-6 py-4 relative">
        <div className="relative">
          <button className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={toggleMenu}>
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <Grid3X3 className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight font-mono">{title}</h1>
          </button>

          {showBackButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="absolute left-full top-1/2 transform -translate-y-1/2 ml-4 gap-2 font-mono text-xs tracking-wider bg-transparent"
            >
              <ArrowLeft className="w-3 h-3" />
              BACK
            </Button>
          )}

          {isMenuOpen && (
            <div className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 bg-background border border-border rounded-md shadow-2xl animate-in slide-in-from-bottom-2">
              <div className="grid grid-cols-2 gap-1 p-2 w-64">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-sm hover:bg-muted transition-colors group"
                  >
                    <item.icon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-xs font-mono tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.label.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
