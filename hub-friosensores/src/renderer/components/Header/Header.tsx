import React from "react"
import { Snowflake, Menu, X } from "lucide-react"
import { Button } from "../ui/button"

export default function Header({ currentTime, menuOpen, setMenuOpen }) {
  return (
    <div className="h-[12vh] bg-gradient-to-r from-teal-600 to-blue-600 shadow-lg flex items-center">
      <div className="w-full px-4 lg:px-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Snowflake className="h-16 w-16 lg:h-12 lg:w-12 text-white" />
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold">TÚNEL DE REFRIGERACIÓN</h1>
            <p className="text-3xl lg:text-xl opacity-90">Sistema de Termometría - TÚNEL #3</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-4xl font-mono font-bold">
              {currentTime.toLocaleTimeString("es-ES", { hour12: false })}
            </div>
            <div className="text-3xl opacity-75">{currentTime.toLocaleDateString("es-ES")}</div>
          </div>
          <Button
            onClick={() => setMenuOpen(!menuOpen)}
            size="lg"
            className="bg-white/20 hover:bg-white/30 border-white/30 h-24 w-24"
          >
            {menuOpen ? <X className="!h-12 !w-12" /> : <Menu className="!h-12 !w-12" />}
          </Button>
          

        </div>
      </div>
    </div>
  )
}
