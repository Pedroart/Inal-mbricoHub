import { useEffect, useMemo, useRef, useState } from "react"
import type { EntryBle, Entry, SensorType } from "../../api/models"
import { IndustrialCard } from "../industrial-card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import type { BleDevice } from "../../api/models"

// ---------- Banner reutilizable ----------
function Banner({
  kind = "info",
  children,
  onClose,
  timeoutMs = 2500,
}: {
  kind?: "info" | "success" | "warning" | "error"
  children: React.ReactNode
  onClose: () => void
  timeoutMs?: number
}) {
  const palette = {
    info: "bg-[#1b1d23] border-[#2d3340] text-gray-200",
    success: "bg-[#17231b] border-[#1b3b24] text-green-200",
    warning: "bg-[#2a2417] border-[#4d3b18] text-yellow-200",
    error: "bg-[#2b1f1f] border-[#5a1f1f] text-red-200",
  }[kind]

  useEffect(() => {
    if (!timeoutMs) return
    const t = setTimeout(onClose, timeoutMs)
    return () => clearTimeout(t)
  }, [timeoutMs, onClose])

  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${palette}`} role="status" aria-live="polite">
      <div className="flex items-start gap-2">
        <div className="flex-1">{children}</div>
        <button type="button" onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity" aria-label="Cerrar">×</button>
      </div>
    </div>
  )
}

// ---------- helpers ----------
function defaultTitleForEntry(e: Entry, sensorTypes: SensorType[]) {
  const st = sensorTypes.find(s => s.id === e.sensor_type_id)
  const typeName = st?.name ?? `Tipo ${e.sensor_type_id}`
  const idx = (e as any).index ?? `#${(e as any).order ?? e.id}`
  return `${typeName} - ${idx}`
}

export default function BlePage() {
  const [bindings, setBindings] = useState<EntryBle[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [sensorTypes, setSensorTypes] = useState<SensorType[]>([])

  // Form "Agregar/Editar"
  const [newBind, setNewBind] = useState<Partial<EntryBle>>({ entry_id: -1, device_id: "" })
  // Borrado
  const [deleteTarget, setDeleteTarget] = useState<number>(-1)

  // Escaneo BLE
  const [scanning, setScanning] = useState<boolean>(false)
  const [devices, setDevices] = useState<BleDevice[]>([])
  const [filter, setFilter] = useState<string>("")
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // UI
  const [banner, setBanner] = useState<{ kind: "info" | "success" | "warning" | "error"; msg: string } | null>(null)

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

    return () => {
      // cleanup scan
      if (pollRef.current) clearInterval(pollRef.current)
      try { window.api.ble?.scan?.stop?.() } catch {}
    }
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

  // --------- Guardar / Eliminar bindings ----------
  const handleSave = async () => {
    setBanner(null)
    if (!newBind.entry_id || !newBind.device_id) {
      setBanner({ kind: "warning", msg: "Completa Entrada y Device ID." })
      return
    }
    try {
      await window.api.config.ble.bind.set(newBind as EntryBle)
      await refreshBindings()
      setNewBind({ entry_id: -1, device_id: "" })
      setBanner({ kind: "success", msg: "Binding guardado correctamente." })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo guardar el binding." })
    }
  }

  const handleDelete = async () => {
    setBanner(null)
    if (!deleteTarget || deleteTarget < 0) {
      setBanner({ kind: "warning", msg: "Selecciona un binding para borrar." })
      return
    }
    try {
      await window.api.config.ble.bind.remove(deleteTarget)
      await refreshBindings()
      setDeleteTarget(-1)
      setBanner({ kind: "success", msg: "Binding eliminado." })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo eliminar el binding." })
    }
  }

  // --------- Escaneo / Conexión ----------
  const startScan = async () => {
    setBanner(null)
    try {
      await window.api.ble.scan.start()
      setScanning(true)
      // polling cada 1.5s
      pollRef.current = setInterval(async () => {
        try {
          const list = (await window.api.ble.scan.list()) as BleDevice[]
          setDevices(Array.isArray(list) ? list : [])
        } catch {
          // si falla una lectura, no cortamos el bucle
        }
      }, 1500)
    } catch {
      setBanner({ kind: "error", msg: "No se pudo iniciar el escaneo." })
    }
  }

  const stopScan = async () => {
    setBanner(null)
    try {
      await window.api.ble.scan.stop()
    } catch {}
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    setScanning(false)
  }

  const toggleScan = async () => {
    if (scanning) await stopScan()
    else await startScan()
  }

  const tryConnect = async (deviceId: string) => {
    setBanner(null)
    try {
      // endpoint opcional, si no existe simplemente cae en catch
      const ok = await window.api.ble.connect?.try?.(deviceId)
      if (ok) setBanner({ kind: "success", msg: `Conectado a ${deviceId}.` })
      else setBanner({ kind: "warning", msg: `No se pudo conectar a ${deviceId}.` })
    } catch {
      setBanner({ kind: "warning", msg: "Conexión de prueba no disponible en este sistema." })
    }
  }

  // --------- Transformaciones de la lista ----------
  const NOW = Date.now()
  const EMIT_WINDOW_MS = 10_000 // consideramos “emitiendo” si fue visto en los últimos 10s

  const visibleDevices = useMemo(() => {
    const byEmitting = (d: BleDevice) => !d.lastSeen || (NOW - d.lastSeen) <= EMIT_WINDOW_MS
    const filtered = (devices || []).filter(d => {
      if (!byEmitting(d)) return false
      if (!filter.trim()) return true
      const f = filter.toLowerCase()
      return (
        (d.name ?? "").toLowerCase().includes(f) ||
        (d.id ?? "").toLowerCase().includes(f) ||
        (d.serviceUuids || []).some(s => s.toLowerCase().includes(f))
      )
    })

    // Grupo: con nombre / sin nombre, y orden: RSSI desc, luego name/id
    const withName = filtered.filter(d => d.name && d.name.trim().length > 0)
    const noName = filtered.filter(d => !d.name || d.name.trim().length === 0)

    const byRssiThenLabel = (a: BleDevice, b: BleDevice) => {
      const ar = a.rssi ?? -999
      const br = b.rssi ?? -999
      if (ar !== br) return br - ar
      const al = (a.name || a.id || "").toLowerCase()
      const bl = (b.name || b.id || "").toLowerCase()
      return al.localeCompare(bl)
    }

    withName.sort(byRssiThenLabel)
    noName.sort(byRssiThenLabel)

    return { withName, noName }
  }, [devices, filter, NOW])

  // Helpers visuales
  const labelForBinding = (b: EntryBle) => {
    const e = entries.find(x => x.id === b.entry_id)
    const left = e ? `${defaultTitleForEntry(e, sensorTypes)} · id:${e.id}` : `Entrada ${b.entry_id}`
    return `${left} → ${b.device_id}`
  }

  const useDevice = (d: BleDevice) => {
    setNewBind(nb => ({ ...nb, device_id: d.id }))
    setBanner({ kind: "info", msg: `Seleccionaste ${d.id} para el binding.` })
  }

  return (
    <div className="p-6 space-y-6">
      {banner && (
        <Banner kind={banner.kind} onClose={() => setBanner(null)}>
          {banner.msg}
        </Banner>
      )}

      {/* EXPLORAR / ESCANEAR DISPOSITIVOS */}
      <IndustrialCard title="Explorar dispositivos BLE">
        <div className="grid gap-3 sm:grid-cols-[auto,1fr,auto] items-end">
          <div className="flex gap-2">
            <Button
              onClick={toggleScan}
              className={scanning ? "h-9 bg-[#b42318] hover:bg-[#a11f15] text-white" : "h-9 bg-[#1e77e5] hover:bg-[#1b6bd0] text-white"}
            >
              {scanning ? "Detener escaneo" : "Iniciar escaneo"}
            </Button>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Filtrar (nombre / id / servicio)</label>
            <Input
              placeholder="Ej: sensor, AA:BB:CC, 180F..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white"
            />
          </div>

          <div className="justify-self-end text-sm text-gray-300">
            {devices.length} encontrados · {visibleDevices.withName.length + visibleDevices.noName.length} emitiendo
          </div>
        </div>

        {/* Listados */}
        <div className="mt-3 grid gap-4">
          {/* Con nombre */}
          <div>
            <div className="text-xs tracking-wide text-gray-400 mb-1">Con nombre</div>
            <ul className="divide-y divide-[#2d3340] rounded-md border border-[#2d3340] bg-[#0f1116]">
              {visibleDevices.withName.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-400">— vacío —</li>
              )}
              {visibleDevices.withName.map((d) => (
                <li key={d.id} className="px-3 py-2 text-sm text-gray-100 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="truncate">
                      <span className="font-medium">{d.name}</span>
                      <span className="text-gray-400"> · {d.id}</span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      RSSI {d.rssi ?? "?"} dBm
                      {d.serviceUuids?.length ? ` · servicios: ${d.serviceUuids.join(", ")}` : ""}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => useDevice(d)}
                      className="h-8 bg-[#272a32] hover:bg-[#2c313b] text-white border border-[#343841]"
                      title="Usar este device para el binding"
                    >
                      Usar
                    </Button>
                    <Button
                      onClick={() => tryConnect(d.id)}
                      className="h-8 bg-[#1e77e5] hover:bg-[#1b6bd0] text-white"
                      title="Probar conexión"
                    >
                      Conectar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Sin nombre */}
          <div>
            <div className="text-xs tracking-wide text-gray-400 mb-1">Sin nombre</div>
            <ul className="divide-y divide-[#2d3340] rounded-md border border-[#2d3340] bg-[#0f1116]">
              {visibleDevices.noName.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-400">— vacío —</li>
              )}
              {visibleDevices.noName.map((d) => (
                <li key={d.id} className="px-3 py-2 text-sm text-gray-100 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="truncate">
                      <span className="font-medium">{d.id}</span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      RSSI {d.rssi ?? "?"} dBm
                      {d.serviceUuids?.length ? ` · servicios: ${d.serviceUuids.join(", ")}` : ""}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => useDevice(d)}
                      className="h-8 bg-[#272a32] hover:bg-[#2c313b] text-white border border-[#343841]"
                      title="Usar este device para el binding"
                    >
                      Usar
                    </Button>
                    <Button
                      onClick={() => tryConnect(d.id)}
                      className="h-8 bg-[#1e77e5] hover:bg-[#1b6bd0] text-white"
                      title="Probar conexión"
                    >
                      Conectar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </IndustrialCard>

      {/* LISTA DE BINDINGS */}
      <IndustrialCard title="Bindings BLE">
        <div className="space-y-3">
          {bindings.length === 0 ? (
            <div className="text-sm text-gray-300">No hay bindings aún.</div>
          ) : (
            <ul className="divide-y divide-[#2d3340] rounded-md border border-[#2d3340] bg-[#0f1116]">
              {bindings.map((b) => (
                <li key={b.entry_id} className="px-3 py-2 text-sm text-gray-100 flex items-center justify-between">
                  <span className="truncate">{labelForBinding(b)}</span>
                  <Button
                    variant="ghost"
                    className="h-7 px-2 text-red-300 hover:text-red-200 hover:bg-red-900/20"
                    onClick={() => setDeleteTarget(b.entry_id)}
                    title="Seleccionar para borrar"
                  >
                    Borrar…
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </IndustrialCard>

      {/* AGREGAR / EDITAR */}
      <IndustrialCard title="Agregar / Editar binding">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Entrada</label>
            <select
              value={newBind.entry_id && newBind.entry_id > 0 ? String(newBind.entry_id) : ""}
              onChange={(e) => setNewBind({ ...newBind, entry_id: Number(e.target.value) })}
              className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e77e5]"
            >
              <option value="" disabled>— Selecciona una entrada —</option>
              {entriesForSelect.map(e => (
                <option key={e.id} value={e.id}>
                  {defaultTitleForEntry(e, sensorTypes)} · id:{e.id} · orden:{(e as any).order}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Device ID</label>
            <Input
              placeholder="Selecciona desde la lista o escribe manualmente"
              value={newBind.device_id ?? ""}
              onChange={(e) => setNewBind({ ...newBind, device_id: e.target.value })}
              className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white"
            />
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button
            onClick={() => setNewBind({ entry_id: -1, device_id: "" })}
            className="h-9 bg-[#272a32] hover:bg-[#2c313b] text-white border border-[#343841]"
          >
            Limpiar
          </Button>
          <Button
            onClick={handleSave}
            className="h-9 bg-[#1e77e5] hover:bg-[#1b6bd0] text-white"
          >
            Guardar
          </Button>
        </div>
      </IndustrialCard>

      {/* BORRAR */}
      <IndustrialCard title="Borrar binding">
        <div className="grid gap-3 sm:grid-cols-[1fr,auto] items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Selecciona binding</label>
            <select
              value={deleteTarget > 0 ? String(deleteTarget) : ""}
              onChange={(e) => setDeleteTarget(Number(e.target.value))}
              className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#e84a4a]"
            >
              <option value="" disabled>— Selecciona un binding —</option>
              {bindings.map((b) => (
                <option key={b.entry_id} value={b.entry_id}>
                  {labelForBinding(b)}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleDelete}
            disabled={!deleteTarget || deleteTarget < 0}
            className="h-9 bg-[#b42318] hover:bg-[#a11f15] text-white disabled:opacity-50"
          >
            Borrar
          </Button>
        </div>
      </IndustrialCard>
    </div>
  )
}
