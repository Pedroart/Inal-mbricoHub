import { useState, useEffect } from "react"
import type { Entry, Measurement } from "../../api/models"

export default function MeasuresPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [latest, setLatest] = useState<Measurement[]>([])

  const [selectedEntryForValue, setSelectedEntryForValue] = useState<number>(0)
  const [valueByEntry, setValueByEntry] = useState<Measurement | null>(null)

  const [selectedEntryForHistory, setSelectedEntryForHistory] = useState<number>(0)
  const [history, setHistory] = useState<Measurement[]>([])

  // cargar entries y últimos valores al inicio
  useEffect(() => {
    window.api.config.entries.list().then(setEntries)
    refreshLatest()
    const intv = setInterval(refreshLatest, 5000) // refrescar cada 5s
    return () => clearInterval(intv)
  }, [])

  const refreshLatest = async () => {
    const data = await window.api.measures.latest()
    setLatest(data)
  }

  const handleSelectEntryValue = async (id: number) => {
    setSelectedEntryForValue(id)
    if (id > 0) {
      const val = await window.api.measures.latestByEntry(id)
      console.log(id)
      setValueByEntry(val)
    } else {
      setValueByEntry(null)
    }
  }

  const handleSelectEntryHistory = async (id: number) => {
    setSelectedEntryForHistory(id)
    if (id > 0) {
      const since = Date.now() - 24 * 60 * 60 * 1000 // 24 horas atrás
      const vals = await window.api.measures.historyByEntry(id, since)
      setHistory(vals)
    } else {
      setHistory([])
    }
  }

  const findLabel = (id: number) => {
    const e = entries.find((x) => x.id === id)
    return e ? `Entry ${e.id} – Orden ${e.order}` : `Entry ${id}`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Lista de últimos valores */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Últimos valores</h2>
        <ul className="divide-y divide-gray-200">
          {latest.map((m) => (
            <li key={m.entry_id} className="py-1">
              {findLabel(m.entry_id)} → {m.value?.toFixed(2) ?? "NaN"}
            </li>
          ))}
        </ul>
      </div>

      {/* Valor puntual por entry */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Valor puntual de un Entry</h2>
        <select
          value={selectedEntryForValue}
          onChange={(e) => handleSelectEntryValue(parseInt(e.target.value))}
          className="border rounded-md px-2 py-1 text-sm"
        >
          <option value={0}>-- Selecciona un entry --</option>
          {entries.map((e) => (
            <option key={e.id} value={e.id}>
              {findLabel(e.id)}
            </option>
          ))}
        </select>

        {valueByEntry && (
          <div className="text-gray-700">
            Último valor: <span className="font-semibold">{valueByEntry.value}</span> @{" "}
            {new Date(valueByEntry.ts).toLocaleString()}
          </div>
        )}
      </div>

      {/* Histórico de 24h por entry */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Histórico (últimas 24h)</h2>
        <select
          value={selectedEntryForHistory}
          onChange={(e) => handleSelectEntryHistory(parseInt(e.target.value))}
          className="border rounded-md px-2 py-1 text-sm"
        >
          <option value={0}>-- Selecciona un entry --</option>
          {entries.map((e) => (
            <option key={e.id} value={e.id}>
              {findLabel(e.id)}
            </option>
          ))}
        </select>

        {history.length > 0 ? (
          <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
            {history.map((m) => (
              <li key={m.ts} className="py-1">
                {new Date(m.ts).toLocaleTimeString()} → {m.value}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Sin datos para mostrar.</p>
        )}
      </div>
    </div>
  )
}
