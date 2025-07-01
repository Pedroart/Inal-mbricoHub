import React from "react"
import { Button } from "@/renderer/components/ui/button"
import {
  Map, Thermometer, Activity, CheckCircle,
} from "lucide-react"

const menuItems = [
  { id: "map", label: "MAPA", icon: Map },
  { id: "sensors", label: "SENSORES", icon: Thermometer },
  { id: "control", label: "CONTROL", icon: Activity },
  { id: "status", label: "ESTADO", icon: CheckCircle },
]

export default function Menu({ activeView, setActiveView, setMenuOpen }) {
  return (
    <div className="absolute top-[20vh] left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 z-50 p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            onClick={() => {
              setActiveView(id)
              setMenuOpen(false)
            }}
            size="lg"
            className={`h-20 text-lg font-bold ${
              activeView === id ? "bg-teal-600 hover:bg-teal-700" : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            <Icon className="h-6 w-6 mr-3" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
