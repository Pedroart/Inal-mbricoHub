import React, { useMemo, useEffect, useState } from 'react';
import { MapCard } from "./MapCard";
import type { DashboardWidget, Entry, SensorType } from "../api/models"

type WidgetData = {
  entry_id: number
  simbol: string
  frecuency_s: number
  x: number
  y: number
  title: string
}

export function Mapsensor() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [sensorTypes, setSensorTypes] = useState<SensorType[]>([])
  const [minFrecuency, setMinFrecuency] = useState<number>(0)

  useEffect(() => {
    window.api.config.widgets.list().then(setWidgets)
    window.api.config.entries.list().then(setEntries)
    window.api.config.sensorTypes.list().then(setSensorTypes)
  }, [])

  const filteredData = useMemo(() => {
    // 1. Filtrar widgets visibles
    const visibleWidgets = widgets.filter(w => w.visible)

    // 2. Mapear cada widget a su Entry y SensorType
    const data: WidgetData[] = visibleWidgets.map(w => {
      const entry = entries.find(e => e.id === w.entry_id)
      if (!entry) return null

      const sensorType = sensorTypes.find(st => st.id === entry.sensor_type_id)

      return {
        entry_id: entry.id,
        simbol: sensorType?.simbol ?? "",
        frecuency_s: entry.frecuency_s,
        x: w.x,
        y: w.y,
        title: w.title,
      }
    }).filter(Boolean) as WidgetData[]

    // 3. Calcular frecuencia mínima
    const min = data.length > 0 ? Math.min(...data.map(d => d.frecuency_s)) : 0
    setMinFrecuency(min)

    return data
  }, [widgets, entries, sensorTypes])

  return (
    <div 
      className="relative h-full w-full"
      style={{
        backgroundImage: "url('/tunelTest.png')",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Cards flotando dinámicas */}
      {filteredData.map((d) => (
        <MapCard
          key={d.entry_id}
          x={d.x}
          y={d.y}
          nombre={d.title}
          valor={"--"} // aquí luego pones la lectura real
          unidad={d.simbol}
          color="bg-green-200"
        />
      ))}
    </div>
  )
}
