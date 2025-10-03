import { useEffect, useMemo, useState } from "react"
import type { EntryBle, Entry, SensorType } from "../../api/models"
import { IndustrialCard } from "../industrial-card"
import { Button } from "../../components/ui/button"

function sentenceCase(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export default function BlePage() {
  const [bindings, setBindings] = useState<EntryBle[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [sensorTypes, setSensorTypes] = useState<SensorType[]>([])

  const [newBind, setNewBind] = useState<Partial<EntryBle>>({ entry_id: -1, device_id: "", _type: "TEM" })
  const [editTarget, setEditTarget] = useState<number | null>(null) // entry_id en edición
  const [scanDevices, setScanDevices] = useState<{ address: string; name?: string; rssi?: number }[]>([])


  const refreshScan = async () => {
    try {
      const devices = await window.api.ble.scan.list()
      setScanDevices(devices)
    } catch (err) {
      console.error("Error al escanear BLE:", err)
    }
  }

  useEffect(() => {
    refreshScan()
  }, [])

  useEffect(() => {
    ;(async () => {
      const [profile, e, st] = await Promise.all([
        window.api.config.profile.get(),
        window.api.config.entries.list(),
        window.api.config.sensorTypes.list(),
      ])
      setBindings(profile.entry_ble || [])
      setEntries(e)
      setSensorTypes(st)
    })()
  }, [])

  const refreshBindings = async () => {
    const p = await window.api.config.profile.get()
    setBindings(p.entry_ble || [])
  }

  const entriesForSelect = useMemo(() => {
    return [...entries].sort((a, b) => {
      const ao = (a as any).order ?? 0
      const bo = (b as any).order ?? 0
      if (ao !== bo) return ao - bo
      return a.id - b.id
    })
  }, [entries])

  const handleSave = async () => {
    if (!newBind.entry_id || !newBind.device_id) return
    await window.api.config.ble.bind.set(newBind as EntryBle)
    await refreshBindings()
    setNewBind({ entry_id: -1, device_id: "", _type: "TEM" })
    setEditTarget(null)
  }

  const handleDelete = async (entryId: number) => {
    await window.api.config.ble.bind.remove(entryId)
    await refreshBindings()
    if (editTarget === entryId) {
      setEditTarget(null)
      setNewBind({ entry_id: -1, device_id: "", _type: "TEM" })
    }
  }

  const startEdit = (b: EntryBle) => {
    setEditTarget(b.entry_id)
    setNewBind({ ...b })
  }

  const cancelEdit = () => {
    setEditTarget(null)
    setNewBind({ entry_id: -1, device_id: "", _type: "TEM" })
  }

  const defaultTitleForEntry = (e: Entry) => {
    const st = sensorTypes.find(s => s.id === e.sensor_type_id)
    const typeName = st?.name ?? `Tipo ${e.sensor_type_id}`
    const idx = (e as any).index ?? `#${(e as any).order ?? e.id}`
    return `${typeName} - ${idx}`
  }

  return (
    <div className="p-6 space-y-6">
      {/* LISTA DE BINDINGS */}
      <IndustrialCard title={sentenceCase("bindings BLE")}>
        {bindings.length === 0 ? (
          <div className="text-sm text-gray-300">No hay bindings aún.</div>
        ) : (
          <ul className="divide-y divide-[#2d3340] rounded-md border border-[#2d3340] bg-[#0f1116]">
            {bindings.map((b) => (
              <li key={`${b.entry_id}-${b._type}`} className="px-3 py-2 text-sm text-gray-100 flex items-center justify-between">
                <span className="truncate">
                  Entrada {b.entry_id} → {b.device_id} ({b._type})
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="h-7 px-3 text-blue-300 hover:text-blue-200 hover:bg-blue-900/20"
                    onClick={() => startEdit(b)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-7 px-3 text-red-300 hover:text-red-200 hover:bg-red-900/20"
                    onClick={() => handleDelete(b.entry_id)}
                  >
                    Borrar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </IndustrialCard>

      {/* FORMULARIO AGREGAR / EDITAR */}
      <IndustrialCard title={editTarget ? sentenceCase("editar binding") : sentenceCase("agregar binding")}>
        <div className="grid gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Entrada</label>
            <select
              value={newBind.entry_id && newBind.entry_id > 0 ? String(newBind.entry_id) : ""}
              onChange={(e) => setNewBind({ ...newBind, entry_id: Number(e.target.value) })}
              className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e77e5]"
            >
              <option value="" disabled>— Selecciona una entrada —</option>
              {entriesForSelect.map(e => (
                <option key={e.id} value={e.id}>
                  {defaultTitleForEntry(e)} · id:{e.id} · orden:{(e as any).order}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Device ID (MAC)</label>
              <div className="flex gap-2">
                <select
                  value={newBind.device_id ?? ""}
                  onChange={(e) => setNewBind({ ...newBind, device_id: e.target.value })}
                  className="flex-1 rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm"
                >
                  <option value="">— Selecciona un dispositivo —</option>
                  {scanDevices.map((d) => (
                    <option key={d.address} value={d.address}>
                      {d.name ?? "Sin nombre"} · {d.address} · RSSI:{d.rssi}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={refreshScan}
                  className="px-3 py-2 bg-[#2f8bff] hover:bg-[#277be3] text-white rounded-md text-sm"
                >
                  🔄
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Tipo</label>
              <select
                value={newBind._type ?? "TEM"}
                onChange={(e) => setNewBind({ ...newBind, _type: e.target.value as "TEM" | "BAT" })}
                className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm"
              >
                <option value="TEM">Temperatura</option>
                <option value="BAT">Batería</option>
              </select>
            </div>
          </div>


          <div className="flex justify-end gap-2">
            {editTarget && (
              <Button
                onClick={cancelEdit}
                className="h-10 w-full sm:w-40 bg-[#444] hover:bg-[#333] text-white rounded-md"
              >
                Cancelar
              </Button>
            )}
            <Button
              onClick={handleSave}
              className="h-10 w-full sm:w-56 bg-[#2f8bff] hover:bg-[#277be3] text-white rounded-md"
            >
              {editTarget ? "Guardar cambios" : "Guardar nuevo"}
            </Button>
          </div>
        </div>
      </IndustrialCard>
    </div>
  )
}
