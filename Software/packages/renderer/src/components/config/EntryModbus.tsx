import { useState, useEffect, useMemo } from "react"
import type { EntryModbus, Entry, ModbusServer, SensorType } from "../../api/models"
import { IndustrialCard } from "../industrial-card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"

// --- Banner (idéntico a EntriesPage) ---
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
        <button type="button" onClick={onClose} className="opacity-70 hover:opacity-100" aria-label="Cerrar">
          ×
        </button>
      </div>
    </div>
  )
}

export default function EntryModbusPage() {
  const [binds, setBinds] = useState<EntryModbus[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [servers, setServers] = useState<ModbusServer[]>([])
  const [sensorTypes, setSensorTypes] = useState<SensorType[]>([])

  // Crear
  const [newBind, setNewBind] = useState<Partial<EntryModbus>>({ entry_id: 0, server_id: 0, address: 0 })

  // Editar
  const [editTarget, setEditTarget] = useState<number>(-1)
  const [editBind, setEditBind] = useState<Partial<EntryModbus>>({})

  // Borrar
  const [deleteTarget, setDeleteTarget] = useState<number>(-1)
  const [askDeleteOne, setAskDeleteOne] = useState(false)

  // Feedback
  const [banner, setBanner] = useState<{ kind: "info" | "success" | "warning" | "error"; msg: string } | null>(null)

  useEffect(() => {
    reload()
    window.api.config.entries.list().then(setEntries)
    window.api.config.modbus.servers.list().then(setServers)
    window.api.config.sensorTypes.list().then(setSensorTypes)
  }, [])

  const reload = async () => {
    const result: EntryModbus[] = []
    const list = await window.api.config.entries.list()
    for (const e of list.filter((x) => x.protocol === "MODBUS")) {
      const b = await window.api.config.modbus.bind.get(e.id)
      if (b) result.push(b)
    }
    setBinds(result)
  }

  const findEntryLabel = (id: number) => {
    const e = entries.find((x) => x.id === id)
    if (!e) return `Entry ${id}`
    const st = sensorTypes.find((s) => s.id === e.sensor_type_id)
    return `${e.id} – ${st ? st.name : "??"} – Orden ${e.order}`
  }

  const findServerLabel = (id: number) => {
    const s = servers.find((x) => x.id === id)
    return s ? `${s.name} (${s.ip}:${s.port})` : `Server ${id}`
  }

  // ---- Crear ----
  const handleSaveNew = async () => {
    setBanner(null)
    if (!newBind.entry_id || !newBind.server_id) {
      setBanner({ kind: "warning", msg: "Selecciona entry y servidor." })
      return
    }
    try {
      await window.api.config.modbus.bind.set(newBind as EntryModbus)
      await reload()
      setNewBind({ entry_id: 0, server_id: 0, address: 0 })
      setBanner({ kind: "success", msg: "Bind creado." })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo crear el bind." })
    }
  }

  // ---- Editar ----
  const handleSaveEdit = async () => {
    setBanner(null)
    if (editTarget < 0) return
    try {
      await window.api.config.modbus.bind.set(editBind as EntryModbus)
      await reload()
      setEditTarget(-1)
      setEditBind({})
      setBanner({ kind: "success", msg: "Cambios guardados." })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo guardar." })
    }
  }

  const handleSelectEdit = (id: number) => {
    setEditTarget(id)
    const b = binds.find((x) => x.entry_id === id)
    if (b) setEditBind({ ...b })
    setTimeout(() => document.getElementById("edit-card")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0)
  }

  // ---- Borrar ----
  const handleDelete = async () => {
    setAskDeleteOne(false)
    if (deleteTarget < 0) return
    try {
      await window.api.config.modbus.bind.remove(deleteTarget)
      await reload()
      setDeleteTarget(-1)
      if (editTarget === deleteTarget) {
        setEditTarget(-1)
        setEditBind({})
      }
      setBanner({ kind: "success", msg: "Bind borrado." })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo borrar." })
    }
  }

  // ---- Tabla ----
  const tableRows = useMemo(
    () =>
      binds.map((b) => (
        <tr key={b.entry_id} className="border-b border-[#343841] hover:bg-[#20242d]">
          <td className="px-3 py-2 text-gray-400">{b.entry_id}</td>
          <td className="px-3 py-2">{findEntryLabel(b.entry_id)}</td>
          <td className="px-3 py-2">{findServerLabel(b.server_id)}</td>
          <td className="px-3 py-2 text-center">{b.address}</td>
          <td className="px-3 py-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                className="h-8 w-full bg-[#1e77e5] hover:bg-[#1b6bd0] text-white"
                onClick={() => handleSelectEdit(b.entry_id)}
              >
                Editar
              </Button>
              <Button
                className="h-8 w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  setDeleteTarget(b.entry_id)
                  setAskDeleteOne(true)
                }}
              >
                Borrar
              </Button>
            </div>
          </td>
        </tr>
      )),
    [binds, entries, servers, sensorTypes]
  )

  return (
    <div className="p-6 space-y-6">
      {banner && <Banner kind={banner.kind} onClose={() => setBanner(null)}>{banner.msg}</Banner>}

      {/* LISTADO */}
      <IndustrialCard title="Binds Modbus">
        <div className="rounded-md border border-[#343841] overflow-hidden">
          <table className="w-full text-sm bg-[#1b1d23]">
            <thead className="bg-[#22262f] text-gray-300">
              <tr className="border-b border-[#343841]">
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Entry</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Sensor</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Servidor</th>
                <th className="px-3 py-2 text-center text-xs uppercase tracking-wider">Dirección</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>
      </IndustrialCard>

      {/* AGREGAR */}
      <IndustrialCard title="Agregar bind">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <select
            value={newBind.entry_id}
            onChange={(e) => setNewBind({ ...newBind, entry_id: parseInt(e.target.value) })}
            className="rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm"
          >
            <option value={0}>-- Selecciona un entry MODBUS --</option>
            {entries
              .filter((e) => e.protocol === "MODBUS")
              .map((e) => {
                const st = sensorTypes.find((s) => s.id === e.sensor_type_id)
                return (
                  <option key={e.id} value={e.id}>
                    {e.id} – {st ? st.name : "??"} – Orden {e.order}
                  </option>
                )
              })}
          </select>

          <select
            value={newBind.server_id}
            onChange={(e) => setNewBind({ ...newBind, server_id: parseInt(e.target.value) })}
            className="rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm"
          >
            <option value={0}>-- Selecciona un server --</option>
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.ip}:{s.port})
              </option>
            ))}
          </select>

          <Input
            type="number"
            placeholder="Dirección"
            value={newBind.address}
            onChange={(e) => setNewBind({ ...newBind, address: parseInt(e.target.value) })}
            className="bg-[#1b1d23] text-white border-[#343841]"
          />
        </div>
        <div className="flex justify-end mt-3">
          <Button onClick={handleSaveNew} className="bg-[#1e77e5] hover:bg-[#1b6bd0] text-white">
            Guardar nuevo
          </Button>
        </div>
      </IndustrialCard>

      {/* EDITAR */}
      {editTarget >= 0 && (
        <IndustrialCard title={`Editar bind — entry ${editTarget}`}>
          <div id="edit-card" className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <Input
              type="number"
              readOnly
              value={editBind.entry_id}
              className="bg-[#272a32] text-gray-300 border-[#343841]"
            />
            <select
              value={editBind.server_id ?? 0}
              onChange={(e) => setEditBind({ ...editBind, server_id: parseInt(e.target.value) })}
              className="rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm"
            >
              <option value={0}>-- Selecciona un server --</option>
              {servers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.ip}:{s.port})
                </option>
              ))}
            </select>
            <Input
              type="number"
              value={editBind.address ?? 0}
              onChange={(e) => setEditBind({ ...editBind, address: parseInt(e.target.value) })}
              className="bg-[#1b1d23] text-white border-[#343841]"
            />
          </div>
          <div className="flex justify-between mt-3">
            <Button
              onClick={() => {
                setEditTarget(-1)
                setEditBind({})
              }}
              className="bg-[#272a32] hover:bg-[#2c313b] text-white border border-[#343841]"
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="bg-[#1e77e5] hover:bg-[#1b6bd0] text-white">
              Guardar cambios
            </Button>
          </div>
        </IndustrialCard>
      )}

      {/* DIALOGO BORRAR */}
      <AlertDialog open={askDeleteOne} onOpenChange={setAskDeleteOne}>
        <AlertDialogContent className="bg-[#1b1d23] text-white border border-[#343841]">
          <AlertDialogHeader>
            <AlertDialogTitle>Borrar bind</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="group">
            <AlertDialogCancel className="bg-[#272a32] border border-[#343841] text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
