import React from "react"
import { Button } from "../ui/button"
import {
  Map, Thermometer, CheckCircle,
} from "lucide-react"

import { Vista } from "../../models/vista"

interface MenuProps {
  activeView: Vista;
  setActiveView: React.Dispatch<React.SetStateAction<Vista>>;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const menuItems = [
  { id: Vista.Inicio, label: "MAPA", icon: Map },
  { id: Vista.Sensores, label: "SENSORES", icon: Thermometer },
  //{ id: Vista.Control, label: "CONTROL", icon: Activity },
  { id: Vista.Status, label: "ESTADO", icon: CheckCircle },
  { id: Vista.Config, label: "CONFIG", icon: CheckCircle },
]

export default function Menu({ activeView, setActiveView, setMenuOpen }: MenuProps) {
  return (
    <div className="absolute top-[12vh] left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 z-50 p-4">
      <div className="grid grid-cols-2  gap-4">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            onClick={() => {
              setActiveView(id)
              setMenuOpen(false)
            }}
            size="lg"
            className={`h-20 text-3xl font-bold ${
              activeView === id ? "bg-teal-600 hover:bg-teal-700" : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            <Icon className="!h-16 !w-16 mr-3" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
