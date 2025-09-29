import { useEffect, useMemo, useState } from "react"
import type { Entry, Protocol, SensorType } from "../../api/models"
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

function sentenceCase(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

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

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [sensorTypes, setSensorTypes] = useState<SensorType[]>([])

  // Crear
  const [newEntry, setNewEntry] = useState<Partial<Entry>>({
    sensor_type_id: 0,
    order: 0, // índice inicial
    protocol: "MODBUS",
    enabled: true,
    frecuency_s: 1,
    operation: "",
  })
  const [bulkCount, setBulkCount] = useState(1)

  // Editar
  const [editTarget, setEditTarget] = useState<number>(-1)
  const [editEntry, setEditEntry] = useState<Partial<Entry>>({ order: 0 })
  const [applyBulkType, setApplyBulkType] = useState(false)

  // Borrar
  const [deleteTarget, setDeleteTarget] = useState<number>(-1)
  const [askDeleteOne, setAskDeleteOne] = useState(false)
  const [deleteBulkTarget, setDeleteBulkTarget] = useState<number>(0)
  const [askDeleteBulk, setAskDeleteBulk] = useState(false)

  // UI
  const [banner, setBanner] = useState<{ kind: "info" | "success" | "warning" | "error"; msg: string } | null>(null)

  useEffect(() => {
    reload()
    window.api.config.sensorTypes.list().then(setSensorTypes)
  }, [])

  const reload = async () => setEntries(await window.api.config.entries.list())

  // ---- Crear (con bloque y validación UX) ----
  const handleSaveNew = async () => {
    setBanner(null)
    const st = sensorTypes.find((s) => s.id === newEntry.sensor_type_id)
    if (!newEntry.sensor_type_id || !st) {
      setBanner({ kind: "warning", msg: "Selecciona un tipo de sensor." })
      return
    }
    const startIndex = Number.isFinite(newEntry.order) ? (newEntry.order as number) : 0
    if (startIndex <= 0) {
      setBanner({ kind: "warning", msg: "Define un índice inicial válido (> 0)." })
      return
    }
    if (bulkCount <= 0) {
      setBanner({ kind: "warning", msg: "La cantidad de duplicados debe ser mayor a 0." })
      return
    }

    // índices ya ocupados por este tipo
    const existingOrders = entries.filter(e => e.sensor_type_id === st.id).map(e => e.order)

    const toCreate: Entry[] = []
    let created = 0
    let index = startIndex

    // El índice final lo decide tu backend/lógica, aquí avanzamos suggestivamente
    while (created < bulkCount && index <= st.quantity) {
      if (!existingOrders.includes(index)) {
        toCreate.push({ ...(newEntry as Entry), order: index })
        created++
      }
      index++
    }

    if (toCreate.length === 0) {
      setBanner({ kind: "warning", msg: "No hay índices disponibles dentro del rango permitido." })
      return
    }

    try {
      for (const e of toCreate) {
        await window.api.config.entries.upsert(e)
      }
      await reload()
      setNewEntry({
        sensor_type_id: 0,
        order: 0,
        protocol: "MODBUS",
        enabled: true,
        frecuency_s: 1,
        operation: "",
      })
      setBulkCount(1)
      setBanner({ kind: "success", msg: `Se crearon ${toCreate.length} entrada(s).` })
    } catch {
      setBanner({ kind: "error", msg: "No se pudieron crear las entradas." })
    }
  }

  // ---- Editar individual / en bloque ----
  const handleSelectEdit = (id: number) => {
    setApplyBulkType(false)
    setEditTarget(id)
    const e = entries.find((x) => x.id === id)
    if (e) setEditEntry({ ...e })
    setTimeout(() => document.getElementById("edit-card")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0)
  }

  const handleSaveEdit = async () => {
    setBanner(null)
    if (editTarget < 0) return
    try {
      await window.api.config.entries.upsert(editEntry as Entry)
      await reload()
      setBanner({ kind: "success", msg: "Cambios guardados." })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo guardar los cambios." })
    }
  }

  const handleSaveEditBulk = async () => {
    setBanner(null)
    if (!editEntry.sensor_type_id) {
      setBanner({ kind: "warning", msg: "Selecciona un tipo para aplicar en bloque." })
      return
    }
    const toEdit = entries.filter((e) => e.sensor_type_id === editEntry.sensor_type_id)
    try {
      for (const e of toEdit) {
        await window.api.config.entries.upsert({
          ...e,
          protocol: editEntry.protocol ?? e.protocol,
          enabled: editEntry.enabled ?? e.enabled,
          frecuency_s: editEntry.frecuency_s ?? e.frecuency_s,
          operation: editEntry.operation ?? e.operation,
        })
      }
      await reload()
      setBanner({ kind: "success", msg: `Cambios aplicados a ${toEdit.length} entradas.` })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo aplicar el cambio en bloque." })
    }
  }

  // ---- Borrar ----
  const handleDelete = async () => {
    setAskDeleteOne(false)
    if (deleteTarget < 0) return
    try {
      await window.api.config.entries.remove(deleteTarget)
      await reload()
      if (editTarget === deleteTarget) {
        setEditTarget(-1)
        setEditEntry({ order: 0 })
      }
      setDeleteTarget(-1)
      setBanner({ kind: "success", msg: "Entrada borrada." })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo borrar la entrada." })
    }
  }

  const handleDeleteBulk = async () => {
    setAskDeleteBulk(false)
    if (!deleteBulkTarget) return
    const toDelete = entries.filter((e) => e.sensor_type_id === deleteBulkTarget)
    try {
      for (const e of toDelete) {
        await window.api.config.entries.remove(e.id)
      }
      await reload()
      setDeleteBulkTarget(0)
      setBanner({ kind: "success", msg: `Se borraron ${toDelete.length} entradas.` })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo borrar en bloque." })
    }
  }

  // ---- Helpers UI ----
  const stName = (id: number) => sensorTypes.find(s => s.id === id)?.name ?? `SensorType ${id}`

  const tableRows = useMemo(
    () =>
      entries.map((e) => (
        <tr key={e.id} className="border-b border-[#343841] hover:bg-[#20242d]">
          <td className="px-3 py-2 text-xs text-gray-400">{e.id}</td>
          <td className="px-3 py-2">{stName(e.sensor_type_id)}</td>
          <td className="px-3 py-2">{e.protocol}</td>
          <td className="px-3 py-2 text-center">{e.enabled ? "Activo" : "Inactivo"}</td>
          <td className="px-3 py-2 text-center">{e.frecuency_s}s</td>
          <td className="px-3 py-2 text-center">{e.order}</td>
          <td className="px-3 py-2">{e.operation ?? ""}</td>
          <td className="px-3 py-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                className="h-8 w-full bg-[#1e77e5] hover:bg-[#1b6bd0] text-white"
                onClick={() => handleSelectEdit(e.id)}
              >
                Editar
              </Button>
              <Button
                className="h-8 w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  setDeleteTarget(e.id)
                  setAskDeleteOne(true)
                }}
              >
                Borrar
              </Button>
            </div>
          </td>
        </tr>
      )),
    [entries, sensorTypes]
  )

  return (
    <div className="p-6 space-y-6">
      {banner && <Banner kind={banner.kind} onClose={() => setBanner(null)}>{banner.msg}</Banner>}

      {/* LISTADO */}
      <IndustrialCard title={sentenceCase("entradas")}>
        <div className="rounded-md border border-[#343841] overflow-hidden">
          <table className="w-full text-sm bg-[#1b1d23]">
            <thead className="bg-[#22262f] text-gray-300">
              <tr className="border-b border-[#343841]">
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">ID</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Tipo</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Protocolo</th>
                <th className="px-3 py-2 text-center text-xs uppercase tracking-wider">Estado</th>
                <th className="px-3 py-2 text-center text-xs uppercase tracking-wider">Frecuencia</th>
                <th className="px-3 py-2 text-center text-xs uppercase tracking-wider">Índice</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Operación</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>
      </IndustrialCard>

      {/* AGREGAR (card propia) */}
      <IndustrialCard title={sentenceCase("agregar entrada")}>
        <div className="grid gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tipo de sensor *</label>
            <select
              value={newEntry.sensor_type_id}
              onChange={(e) => setNewEntry({ ...newEntry, sensor_type_id: parseInt(e.target.value) })}
              className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e77e5]"
            >
              <option value={0}>-- Selecciona un tipo de sensor --</option>
              {sensorTypes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.index})
                </option>
              ))}
            </select>
          </div>

          {/* Fila compacta: índice inicial, cantidad de duplicados, protocolo, estado, frecuencia, operación */}
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Índice inicial *</label>
              <Input
                type="number"
                placeholder="1"
                value={newEntry.order ?? 0}
                onChange={(e) => setNewEntry({ ...newEntry, order: parseInt(e.target.value) || 0 })}
                className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Se asignará automáticamente y aumentará en cada duplicado.
              </p>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Cantidad de duplicados</label>
              <Input
                type="number"
                placeholder="1"
                value={bulkCount}
                onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Cuántas veces crear la misma entrada.
              </p>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Protocolo</label>
              <select
                value={newEntry.protocol}
                onChange={(e) => setNewEntry({ ...newEntry, protocol: e.target.value as Protocol })}
                className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e77e5]"
              >
                <option value="MODBUS">MODBUS</option>
                <option value="BLE">BLE</option>
                <option value="MQTT">MQTT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Estado</label>
              <select
                value={newEntry.enabled ? "true" : "false"}
                onChange={(e) => setNewEntry({ ...newEntry, enabled: e.target.value === "true" })}
                className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e77e5]"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Frecuencia (s)</label>
              <Input
                type="number"
                placeholder="1"
                value={newEntry.frecuency_s ?? 1}
                onChange={(e) => setNewEntry({ ...newEntry, frecuency_s: parseInt(e.target.value) || 1 })}
                className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Operación</label>
              <Input
                placeholder="Ej. x*0.1"
                value={newEntry.operation ?? ""}
                onChange={(e) => setNewEntry({ ...newEntry, operation: e.target.value })}
                className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveNew}
              className="h-10 w-full sm:w-56 bg-[#2f8bff] hover:bg-[#277be3] text-white rounded-md"
            >
              Guardar nuevo(s)
            </Button>
          </div>
        </div>
      </IndustrialCard>

      {/* EDITAR (card propia, aparece cuando eliges editar) */}
      {editTarget >= 0 && (
        <IndustrialCard title={sentenceCase(`editar entrada — id ${editTarget}`)}>
          <div id="edit-card" className="grid gap-3">
            {/* fila 1: tipo de sensor e índice (orden) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tipo de sensor *</label>
                <select
                  value={editEntry.sensor_type_id ?? 0}
                  onChange={(e) => setEditEntry({ ...editEntry, sensor_type_id: parseInt(e.target.value) })}
                  className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e77e5]"
                >
                  <option value={0}>-- Selecciona un tipo de sensor --</option>
                  {sensorTypes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.index})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Índice (orden)</label>
                <Input
                  type="number"
                  value={editEntry.order ?? 0}
                  onChange={(e) => setEditEntry({ ...editEntry, order: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  El índice es la posición del sensor dentro del tipo.
                </p>
              </div>
            </div>

            {/* fila 2: protocolo, estado, frecuencia, operación */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Protocolo</label>
                <select
                  value={editEntry.protocol ?? "MODBUS"}
                  onChange={(e) => setEditEntry({ ...editEntry, protocol: e.target.value as Protocol })}
                  className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e77e5]"
                >
                  <option value="MODBUS">MODBUS</option>
                  <option value="BLE">BLE</option>
                  <option value="MQTT">MQTT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Estado</label>
                <select
                  value={(editEntry.enabled ?? false) ? "true" : "false"}
                  onChange={(e) => setEditEntry({ ...editEntry, enabled: e.target.value === "true" })}
                  className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e77e5]"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Frecuencia (s)</label>
                <Input
                  type="number"
                  value={editEntry.frecuency_s ?? 1}
                  onChange={(e) => setEditEntry({ ...editEntry, frecuency_s: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Operación</label>
                <Input
                  value={editEntry.operation ?? ""}
                  onChange={(e) => setEditEntry({ ...editEntry, operation: e.target.value })}
                  className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white"
                />
              </div>
            </div>

            {/* aplicar en bloque */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={applyBulkType}
                  onChange={(e) => setApplyBulkType(e.target.checked)}
                  className="size-4 accent-[#1e77e5]"
                />
                Aplicar cambios a todas las entradas del mismo tipo
              </label>
            </div>

            {/* botones a los extremos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  setEditTarget(-1)
                  setEditEntry({ order: 0 })
                  setApplyBulkType(false)
                }}
                className="h-10 w-full sm:w-56 bg-[#272a32] hover:bg-[#2c313b] text-white rounded-md border border-[#343841] sm:justify-self-start"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => (applyBulkType ? handleSaveEditBulk() : handleSaveEdit())}
                className="h-10 w-full sm:w-56 bg-[#1e77e5] hover:bg-[#1b6bd0] text-white rounded-md sm:justify-self-end"
              >
                {applyBulkType ? "Guardar en bloque" : "Guardar cambios"}
              </Button>

            </div>
          </div>
        </IndustrialCard>
      )}

      {/* ADMIN: borrar en bloque */}
      <IndustrialCard title={sentenceCase("borrar entradas en bloque")}>
        <div className="grid gap-2 sm:grid-cols-[1fr,12rem]">
          <select
            value={deleteBulkTarget}
            onChange={(e) => setDeleteBulkTarget(Number(e.target.value))}
            className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value={0}>-- Selecciona un tipo de sensor --</option>
            {sensorTypes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.index})
              </option>
            ))}
          </select>
          <div className="sm:self-end">
            <Button
              onClick={() => setAskDeleteBulk(true)}
              disabled={!deleteBulkTarget}
              className="h-10 w-full bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50"
            >
              Borrar en bloque
            </Button>
          </div>
        </div>
      </IndustrialCard>

      {/* Diálogos */}
      <AlertDialog open={askDeleteOne} onOpenChange={setAskDeleteOne}>
        <AlertDialogContent className="bg-[#1b1d23] text-white border border-[#343841]">
          <AlertDialogHeader>
            <AlertDialogTitle>Borrar entrada</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="group">
            <AlertDialogCancel className="bg-[#272a32] border border-[#343841] text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={askDeleteBulk} onOpenChange={setAskDeleteBulk}>
        <AlertDialogContent className="bg-[#1b1d23] text-white border border-[#343841]">
          <AlertDialogHeader>
            <AlertDialogTitle>Borrar entradas en bloque</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Se eliminarán todas las entradas del tipo seleccionado. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="group">
            <AlertDialogCancel className="bg-[#272a32] border border-[#343841] text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBulk} className="bg-red-600 hover:bg-red-700 text-white">
              Borrar todo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
