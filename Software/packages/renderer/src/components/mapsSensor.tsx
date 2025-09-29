import React, { useMemo, useEffect, useState } from "react"
import { MapCard } from "./MapCard"
import type { DashboardWidget, Entry, SensorType, Measurement } from "../api/models"

type WidgetData = {
  entry_id: number
  simbol: string
  frecuency_s: number
  x: number
  y: number
  title: string
  value?: number | string
}

export function Mapsensor() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [sensorTypes, setSensorTypes] = useState<SensorType[]>([])
  const [minFrecuency, setMinFrecuency] = useState<number>(0)

  // Mapa rápido: entry_id -> última medición
  const [latestMap, setLatestMap] = useState<Map<number, Measurement>>(new Map())

  useEffect(() => {
    // Cargar configuración base
    window.api.config.widgets.list().then(setWidgets)
    window.api.config.entries.list().then(setEntries)
    window.api.config.sensorTypes.list().then(setSensorTypes)
    // Una lectura inicial
    refreshLatest()
  }, [])

  const refreshLatest = async () => {
    const data: Measurement[] = await window.api.measures.latest()
    setLatestMap(new Map(data.map((m) => [m.entry_id, m])))
  }

  // Recalcular datos (incluye valor en vivo)
  const filteredData = useMemo(() => {
    const visibleWidgets = widgets.filter((w) => w.visible)

    const shaped: WidgetData[] = visibleWidgets
      .map((w) => {
        const entry = entries.find((e) => e.id === w.entry_id)
        if (!entry) return null
        const sensorType = sensorTypes.find((st) => st.id === entry.sensor_type_id)

        const latest = latestMap.get(entry.id)
        const value =
          latest?.value != null && Number.isFinite(Number(latest.value))
            ? Number(latest.value)
            : undefined

        return {
          entry_id: entry.id,
          simbol: sensorType?.simbol ?? "", // respeta tu campo "simbol"
          frecuency_s: entry.frecuency_s,
          x: w.x,
          y: w.y,
          title: w.title,
          value,
        }
      })
      .filter(Boolean) as WidgetData[]

    // frecuencia mínima para el pooling
    const min = shaped.length > 0 ? Math.min(...shaped.map((d) => d.frecuency_s || 0)) : 0
    setMinFrecuency(min)

    return shaped
  }, [widgets, entries, sensorTypes, latestMap])

  // Pooling según la frecuencia mínima (fallback 5s)
  useEffect(() => {
    const intervalMs = Math.max((minFrecuency || 5) * 1000, 1000) // nunca menos de 1s
    const id = setInterval(refreshLatest, intervalMs)
    return () => clearInterval(id)
  }, [minFrecuency])

  // Helper de formato para mostrar en la card
  const fmt = (v?: number | string) => {
    if (v == null || v === "") return "—"
    const n = Number(v)
    if (!Number.isFinite(n)) return String(v)
    return n.toFixed(2)
  }

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
      {/* Cards flotando con valor en vivo */}
      {filteredData.map((d) => (
        <MapCard
          key={d.entry_id}
          x={d.x}
          y={d.y}
          nombre={d.title}
          valor={fmt(d.value)}
          unidad={d.simbol}
          color="bg-green-200"
        />
      ))}
    </div>
  )
}
