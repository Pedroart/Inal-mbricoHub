import React from "react"
import { Snowflake, Menu, X } from "lucide-react"
import { Button } from "../ui/button"

export default function Header({ currentTime, menuOpen, setMenuOpen }) {
  return (
    <div className="h-[20vh] bg-gradient-to-r from-teal-600 to-blue-600 shadow-lg flex items-center">
      <div className="w-full px-4 lg:px-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Snowflake className="h-8 w-8 lg:h-12 lg:w-12 text-white" />
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold">TÚNEL DE REFRIGERACIÓN</h1>
            <p className="text-base lg:text-xl opacity-90">Sistema de Termometría - TÚNEL #3</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-mono font-bold">
              {currentTime.toLocaleTimeString("es-ES", { hour12: false })}
            </div>
            <div className="text-lg opacity-75">{currentTime.toLocaleDateString("es-ES")}</div>
          </div>
          <Button
            onClick={() => setMenuOpen(!menuOpen)}
            size="lg"
            className="bg-white/20 hover:bg-white/30 border-white/30 h-16 w-16"
          >
            {menuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
