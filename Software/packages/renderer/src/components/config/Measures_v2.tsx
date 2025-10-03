import { useState, useEffect } from "react"
import type { Entry, Measurement } from "../../api/models"
import { IndustrialCard } from "../industrial-card"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

function sentenceCase(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export default function MeasuresPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [latest, setLatest] = useState<Measurement[]>([])

  const [openEntry, setOpenEntry] = useState<Entry | null>(null)
  const [history, setHistory] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(false)

  // cargar entries y últimos valores
  useEffect(() => {
    window.api.config.entries.list().then(setEntries)
    refreshLatest()
    const intv = setInterval(refreshLatest, 5000)
    return () => clearInterval(intv)
  }, [])

  const refreshLatest = async () => {
    const data = await window.api.measures.latest()
    setLatest(data)
  }

  const openHistory = async (entry: Entry) => {
    setOpenEntry(entry)
    setLoading(true)
    const since = Date.now() - 24 * 60 * 60 * 1000
    const vals = await window.api.measures.historyByEntry(entry.id, since)
    setHistory(vals)
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <IndustrialCard title={sentenceCase("lecturas en tiempo real")}>
        {latest.length ? (
          <div className="grid grid-cols-1 grid-cols-2 lg:grid-cols-3 gap-4">
            {latest.map((m) => {
              const entry = entries.find((e) => e.id === m.entry_id)
              const val =
                typeof m.value === "number" && Number.isFinite(m.value)
                  ? m.value.toFixed(2)
                  : "—"

              return (
                <div
                  key={m.entry_id}
                  onClick={() => entry && openHistory(entry)}
                  className="rounded-xl border border-[#343841] bg-[#1b1d23] p-4 cursor-pointer hover:bg-[#23272f] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">
                        #{m.entry_id} · idx {entry?.order ?? "—"}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {new Date(m.ts).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">{val}</div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-400">Sin lecturas aún.</div>
        )}
      </IndustrialCard>

      {/* POPUP HISTÓRICO */}
      <Dialog open={!!openEntry} onOpenChange={() => setOpenEntry(null)}>
        <DialogContent className="max-w-3xl bg-[#1b1d23] text-white border border-[#343841]">
          <DialogHeader>
            <DialogTitle>
              Histórico 24h · #{openEntry?.id} (idx {openEntry?.order})
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Visualización de las últimas 24 horas
            </DialogDescription>
          </DialogHeader>

          <div className="h-72 mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Cargando datos...
              </div>
            ) : history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={history.map((h) => ({
                    ts: h.ts,
                    value: h.value,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d35" />
                  <XAxis dataKey="ts" hide />
                  <YAxis />
                  <XAxis
                    dataKey="ts"
                    tickFormatter={(ts) => {
                      console.log(ts)
                      const d = new Date(ts)
                      return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`
                    }}
                  />

                  <ReTooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2f8bff"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-400">Sin datos para mostrar.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
