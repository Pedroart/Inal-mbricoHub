import { useState } from "react"
import "./App.css"

import ProfileTests from "./components/test/Configstore"
import ModbusServerPage from "./components/test/ModbusServer"
import BlePage from "./components/test/BLE"
import EntriesPage from "./components/test/Entries"
import SensorTypesPage from "./components/test/SensorTypes"
import WidgetsPage from "./components/test/widgets"
import EntryModbusPage from "./components/test/EntryModbus"

export default function App() {
  const tabs = [
    { id: "profile", label: "Perfiles", component: <ProfileTests /> },
    { id: "sensors", label: "Tipos de Sensor", component: <SensorTypesPage /> },
    { id: "entries", label: "Entradas", component: <EntriesPage /> },
    { id: "widget", label: "Widget", component: <WidgetsPage/> },
    { id: "modbusServer", label: "Servidores Modbus", component: <ModbusServerPage /> },
    { id: "modbusEntry", label: "Entradas Modbus", component: <EntryModbusPage/>  },
    { id: "ble", label: "BLE", component: <BlePage /> },
  ]

  const [active, setActive] = useState("profile")

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex space-x-2 border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-2 rounded-t-md ${
              active === tab.id
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="bg-white shadow rounded-xl p-4">
        {tabs.find((tab) => tab.id === active)?.component}
      </div>
    </div>
  )
}
