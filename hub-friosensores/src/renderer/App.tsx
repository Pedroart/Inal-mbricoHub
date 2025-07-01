import React from "react"
import { useState, useEffect } from "react"
import Header from "./components/Header/Header"
import Menu from "./components/Menu/Menu"
import { Vista } from "../types/views" // Enum de vistas
import { VistaMapSensor } from '../renderer/page/Tunel'
import { MainView } from '../renderer/page/DispositivoView'


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
      case Vista.Status:
        return  <div>Status</div>;
      case Vista.Sensores:
        return <MainView />;
      case Vista.Control:
        return <div>Control</div>;
      default:
        return <VistaMapSensor />;
    }
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white ">
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

      <div className="h-[88vh] p-3">
              
        {renderVista()}

      </div>
    </div>
  )
}
