import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Settings, Database, BarChart3, Users, Grid3X3, ArrowLeft } from "lucide-react"

interface IndustrialHeaderProps {
  title?: string
  onBack?: () => void
  showBackButton?: boolean
  onMenuClick?: () => void   // 👈 nueva prop
}

export function IndustrialHeader({
  title = "TITULO",
  onBack,
  showBackButton = true,
  onMenuClick,
}: IndustrialHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const menuItems = [
    { id: "analytics", icon: BarChart3, label: "Analytics", path: "/" },
    { id: "database", icon: Database, label: "Machines", path: "/machines" },
    { id: "users", icon: Users, label: "Users", path: "/users" },
    { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
  ]

  const handleMenuItemClick = (path: string) => {
    navigate(path)
    setIsMenuOpen(false)
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="bg-background">
      <div className="flex items-center justify-between px-6 py-4 relative">
        {/* Botón Back */}
        <div className="flex-1">
          {showBackButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack ?? (() => navigate(-1))}
              className="gap-2 font-mono text-xs tracking-wider bg-transparent"
            >
              <ArrowLeft className="w-3 h-3" />
              BACK
            </Button>
          )}
        </div>

        {/* Título */}
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold tracking-tight font-mono">{title}</h1>
        </div>

        {/* Menú */}
        <div className="flex-1 flex justify-end relative">
          <button
            className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center hover:opacity-80 transition-opacity"
            onClick={onMenuClick ?? toggleMenu}  // 👈 usa callback si existe
          >
            <Grid3X3 className="w-4 h-4 text-primary-foreground" />
          </button>

          {isMenuOpen && !onMenuClick && (   // 👈 solo muestra el menú si no hay callback
            <div className="absolute right-0 bottom-full mb-2 bg-background border border-border rounded-md shadow-2xl animate-in slide-in-from-bottom-2">
              <div className="grid grid-cols-2 gap-1 p-2 w-64">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.path)}
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
