import React from "react"
import { useState, useEffect } from "react"
import Header from "./components/Header/Header"
import Menu from "./components/Menu/Menu"
import { Vista } from "../types/views" // Enum de vistas
import { VistaMapSensor } from '../renderer/page/Tunel'


export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [vistaActual, setVistaActual] = useState<Vista>(Vista.Inicio)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const renderVista = () => {
    switch (vistaActual) {
      case Vista.Tunel:
        return  <div>Tunel</div>;
      case Vista.Config:
        return <div>Configuración</div>;
      case Vista.Inicio:
      default:
        return <VistaMapSensor />;
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
      <Header
        currentTime={currentTime}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {menuOpen && (
        <Menu
          activeView={vistaActual}
          setActiveView={setVistaActual}
          setMenuOpen={setMenuOpen}
        />
      )}

      <div className="h-[80vh] p-3 sm:p-4 lg:p-6 overflow-hidden">
        {renderVista()}
      </div>
    </div>
  )
}
