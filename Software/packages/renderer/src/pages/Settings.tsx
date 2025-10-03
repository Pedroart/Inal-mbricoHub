import { useState } from "react"
import { IndustrialHeader } from "../components/industrial-header"

import BlePage from "../components/config/BLE"
import MeasuresPage from "../components/config/Measures_v2"
import WidgetsPage from "../components/config/widgets"
import ProfileTests from "../components/config/profile"
import SensorTypesPage from "../components/config/SensorTypes"
import EntriesPage from "../components/config/Entries"
import ModbusServerPage from "../components/config/ModbusServer"
import EntryModbusPage from "../components/config/EntryModbus"

export default function Settings() {
  const tabs = [
    { id: "profile", label: "Config Perfil", component: <ProfileTests /> },
    { id: "sensors", label: "Tipos Sensor", component: <SensorTypesPage /> },
    { id: "entries", label: "Lista Entradas", component: <EntriesPage /> },
    { id: "widget", label: "Mapa", component: <WidgetsPage /> },
    { id: "modbusServer", label: "Server Modbus", component: <ModbusServerPage /> },
    { id: "modbusEntry", label: "Modbus", component: <EntryModbusPage /> },
    { id: "ble", label: "BLE", component: <BlePage /> },
    { id: "measures", label: "Historial", component: <MeasuresPage /> }
  ]

  const [active, setActive] = useState("profile")
  const [showTabs, setShowTabs] = useState(false) // 👈 estado para mostrar/ocultar tabs

  return (
    <div className="flex flex-col h-screen bg-[#20232c] text-white">
      {/* Main */}
      <main className="flex-1 min-h-0 w-full flex overflow-hidden relative">
        {/* Contenido principal */}
        <div className="flex-1 bg-[#1b1d23] p-0 overflow-y-auto min-h-0">
          {tabs.find((tab) => tab.id === active)?.component}
        </div>

        {/* Sidebar controlado por botón */}
        {showTabs && (
          <div
            className="absolute right-0 top-0 bottom-0 h-full
                      w-48 bg-[linear-gradient(200deg,#272a32_10%,#1e77e5)]
                      border-l border-[#343841] shadow-lg flex flex-col justify-end"
          >
            <div className="flex flex-col overflow-y-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`px-4 py-2 text-left whitespace-nowrap transition-colors
                    ${active === tab.id
                      ? "bg-[#192e4a] text-white"
                      : "hover:bg-[#192e4a]"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Header con control del menú */}
      <IndustrialHeader
        title="CONFIG"
        onMenuClick={() => setShowTabs((prev) => !prev)} // 👈 alterna visibilidad
      />
    </div>
  )
}
