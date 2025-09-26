import { useState } from "react"
import { IndustrialHeader } from "../components/industrial-header"

import ProfileTests from "../components/test/Configstore"
import ModbusServerPage from "../components/test/ModbusServer"
import BlePage from "../components/test/BLE"
import EntriesPage from "../components/test/Entries"
import SensorTypesPage from "../components/test/SensorTypes"
import WidgetsPage from "../components/test/widgets"
import EntryModbusPage from "../components/test/EntryModbus"
import MeasuresPage from "../components/test/Measures"

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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main ocupa todo el espacio disponible */}
      <main className="flex-1 w-full flex">
        <div className="flex-1 flex">
          {/* Barra lateral izquierda con tabs */}
          <div className="w-56 bg-gray-200 border-r flex flex-col">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`px-4 py-2 text-left ${
                  active === tab.id
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-300 text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido principal */}
          <div className="flex-1 bg-white p-4 overflow-y-auto">
            {tabs.find((tab) => tab.id === active)?.component}
          </div>
        </div>
      </main>

      {/* Header siempre abajo */}
      <IndustrialHeader title="TITULO" />
    </div>
  )
}
