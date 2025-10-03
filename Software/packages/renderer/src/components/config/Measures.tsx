import { useState, useEffect, useMemo } from "react"
import type { Entry, Measurement } from "../../api/models"
import { IndustrialCard } from "../industrial-card"
import { Button } from "../../components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"

function sentenceCase(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

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
      setValueByEntry(val)
    } else {
      setValueByEntry(null)
    }
  }

  const handleSelectEntryHistory = async (id: number) => {
    setSelectedEntryForHistory(id)
    if (id > 0) {
      const since = Date.now() - 24 * 60 * 60 * 1000 // 24 horas
      const vals = await window.api.measures.historyByEntry(id, since)
      setHistory(vals)
    } else {
      setHistory([])
    }
  }

  const labelForEntry = (id: number) => {
    const e = entries.find((x) => x.id === id)
    return e ? { id: e.id, order: e.order } : { id, order: "—" }
  }

  // map rápido id -> {id, order}
  const entryIndexMap = useMemo(() => {
    const m = new Map<number, { id: number; order: number }>()
    entries.forEach((e) => m.set(e.id, { id: e.id, order: e.order }))
    return m
  }, [entries])

  return (
    <TooltipProvider delayDuration={120}>
      <div className="p-6 space-y-6">
        {/* ÚLTIMOS VALORES */}
        <IndustrialCard title={sentenceCase("últimos valores")}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-400">Lecturas recientes</div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] rounded-full px-2 py-0.5 bg-[#1b1d23] border border-[#343841] text-gray-300">
                ⟳ 5s
              </span>
              <Button
                onClick={refreshLatest}
                className="h-8 px-3 bg-[#2f8bff] hover:bg-[#277be3] text-white rounded-md"
              >
                Refrescar
              </Button>
            </div>
          </div>

          {latest.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {latest.map((m) => {
                const meta = entryIndexMap.get(m.entry_id)
                const val =
                  typeof m.value === "number" && Number.isFinite(m.value)
                    ? m.value.toFixed(2)
                    : "—"
                return (
                  <div
                    key={m.entry_id}
                    className="rounded-lg border border-[#343841] bg-[#1b1d23] p-3 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md border border-[#343841] px-2 py-0.5">
                          #{meta?.id ?? m.entry_id}
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center rounded-md border border-[#343841] px-2 py-0.5">
                              idx {meta?.order ?? "—"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Índice (orden) del sensor</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {new Date(m.ts).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">{val}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-400">Sin lecturas aún.</div>
          )}
        </IndustrialCard>

        {/* VALOR PUNTUAL */}
        <IndustrialCard title={sentenceCase("valor puntual")}>
          <div className="grid gap-3">
            <div className="grid gap-2 sm:grid-cols-[1fr,12rem]">
              <div>
                <label className="sr-only">Entry</label>
                <select
                  value={selectedEntryForValue}
                  onChange={(e) => handleSelectEntryValue(parseInt(e.target.value))}
                  className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e77e5]"
                >
                  <option value={0}>— Selecciona un entry —</option>
                  {entries.map((e) => (
                    <option key={e.id} value={e.id}>
                      #{e.id} · idx {e.order}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:self-end">
                <Button
                  onClick={() => selectedEntryForValue && handleSelectEntryValue(selectedEntryForValue)}
                  className="h-10 w-full bg-[#1e77e5] hover:bg-[#1b6bd0] text-white rounded-md"
                >
                  Consultar
                </Button>
              </div>
            </div>

            {valueByEntry ? (
              <div className="rounded-lg border border-[#343841] bg-[#1b1d23] p-4 flex items-center justify-between">
                <div className="text-sm text-gray-300">
                  <span className="inline-flex items-center rounded-md border border-[#343841] px-2 py-0.5 mr-2">
                    #{valueByEntry.entry_id}
                  </span>
                  <span className="inline-flex items-center rounded-md border border-[#343841] px-2 py-0.5">
                    idx {labelForEntry(valueByEntry.entry_id).order}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-semibold tabular-nums">
                    {typeof valueByEntry.value === "number" ? valueByEntry.value : "—"}
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <span>🕒</span>
                    {new Date(valueByEntry.ts).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400">Selecciona un entry para ver su último valor.</div>
            )}
          </div>
        </IndustrialCard>

        {/* HISTÓRICO 24H */}
        <IndustrialCard title={sentenceCase("histórico 24h")}>
          <div className="grid gap-3">
            <div className="grid gap-2 sm:grid-cols-[1fr,12rem]">
              <div>
                <label className="sr-only">Entry</label>
                <select
                  value={selectedEntryForHistory}
                  onChange={(e) => handleSelectEntryHistory(parseInt(e.target.value))}
                  className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e77e5]"
                >
                  <option value={0}>— Selecciona un entry —</option>
                  {entries.map((e) => (
                    <option key={e.id} value={e.id}>
                      #{e.id} · idx {e.order}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:self-end">
                <Button
                  onClick={() => selectedEntryForHistory && handleSelectEntryHistory(selectedEntryForHistory)}
                  className="h-10 w-full bg-[#2f8bff] hover:bg-[#277be3] text-white rounded-md"
                >
                  Cargar histórico
                </Button>
              </div>
            </div>

            {history.length > 0 ? (
              <div className="rounded-lg border border-[#343841] bg-[#1b1d23] max-h-64 overflow-y-auto">
                <ul className="divide-y divide-[#343841]">
                  {history.map((m) => (
                    <li key={m.ts} className="px-3 py-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{new Date(m.ts).toLocaleTimeString()}</span>
                      <span className="text-sm tabular-nums">{m.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-sm text-gray-400">Sin datos para mostrar.</div>
            )}
          </div>
        </IndustrialCard>
      </div>
    </TooltipProvider>
  )
}
