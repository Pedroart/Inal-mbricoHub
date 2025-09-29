import { useState } from "react"
import { IndustrialHeader } from "../components/industrial-header"

import BlePage from "../components/config/BLE"

import MeasuresPage from "../components/config/Measures"
import WidgetsPage from "../components/config/widgets"
import ProfileTests from "../components/config/profile"
import SensorTypesPage from "../components/config/SensorTypes"
import EntriesPage from "../components/config/Entries"
import ModbusServerPage from "../components/config/ModbusServer"
import EntryModbusPage from "../components/config/EntryModbus"

export default function Settings() {
  const tabs = [
    { id: "profile", label: "Perfiles", component: <ProfileTests /> },
    { id: "sensors", label: "Tipos de Sensor", component: <SensorTypesPage /> },
    { id: "entries", label: "Entradas", component: <EntriesPage /> },
    { id: "widget", label: "Widget", component: <WidgetsPage /> },
    { id: "modbusServer", label: "Servidores Modbus", component: <ModbusServerPage /> },
    { id: "modbusEntry", label: "Entradas Modbus", component: <EntryModbusPage /> },
    { id: "ble", label: "BLE", component: <BlePage /> },
    { id: "measures", label: "Measures", component: <MeasuresPage /> }
  ]

  const [active, setActive] = useState("profile")

  return (
    <div className="flex flex-col h-screen bg-[#20232c] text-white">
      {/* Main ocupa todo el espacio disponible */}
      <main className="flex-1 min-h-0 w-full flex overflow-hidden">
        {/* Contenedor con sidebar + contenido */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Barra lateral izquierda con tabs */}
          <div
            className="w-56 flex flex-col justify-end overflow-y-auto text-white bg-[linear-gradient(200deg,#272a32_10%,#1e77e5)]"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`px-4 py-2 text-left ${
                  active === tab.id
                    ? "bg-[#192e4a] text-white"
                    : "hover:bg-[#192e4a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>


          {/* Contenido principal scrolleable */}
          <div className="flex-1 bg-[#1b1d23] p-4 overflow-y-auto min-h-0">
            {tabs.find((tab) => tab.id === active)?.component}
          </div>
        </div>
      </main>

      {/* Header fijo abajo */}
      <IndustrialHeader title="CONFIG" />
    </div>
  )


}
