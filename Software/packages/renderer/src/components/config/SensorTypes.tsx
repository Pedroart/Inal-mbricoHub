import { useEffect, useMemo, useState } from "react"
import type { SensorType } from "../../api/models"
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

export default function SensorTypesPage() {
  const [types, setTypes] = useState<SensorType[]>([])

  // Crear
  const [newType, setNewType] = useState<Partial<SensorType>>({
    name: "",
    index: "",
    quantity: 1,
    simbol: "°C",
  })
  const [askOverwriteNew, setAskOverwriteNew] = useState(false)

  // Editar
  const [editTarget, setEditTarget] = useState<number | null>(null)
  const [editType, setEditType] = useState<Partial<SensorType>>({})

  // Borrar
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [askDelete, setAskDelete] = useState(false)

  // UI
  const [banner, setBanner] = useState<{ kind: "info" | "success" | "warning" | "error"; msg: string } | null>(null)

  useEffect(() => {
    window.api.config.sensorTypes.list().then(setTypes)
  }, [])

  const reload = async () => setTypes(await window.api.config.sensorTypes.list())

  // --- Tabla (con acciones por fila) ---
  const tableRows = useMemo(
    () =>
      types.map((t) => (
        <tr key={t.id} className="border-b border-[#343841] hover:bg-[#20242d]">
          <td className="px-3 py-2">{t.name}</td>
          <td className="px-3 py-2 text-center">{t.index}</td>
          <td className="px-3 py-2 text-center">{t.quantity}</td>
          <td className="px-3 py-2">{t.simbol}</td>
          <td className="px-3 py-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                className="h-8 w-full bg-[#1e77e5] hover:bg-[#1b6bd0] text-white"
                onClick={() => {
                  setEditTarget(t.id)
                  setEditType({ ...t })
                  setTimeout(() => document.getElementById("edit-card")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0)
                }}
              >
                Editar
              </Button>
              <Button
                className="h-8 w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  setDeleteTarget(t.id)
                  setAskDelete(true)
                }}
              >
                Borrar
              </Button>
            </div>
          </td>
        </tr>
      )),
    [types]
  )

  // --- Crear (validación + posible overwrite) ---
  const handleSaveNewIntent = () => {
    setBanner(null)
    if (!newType.name?.trim() || !newType.index?.trim()) {
      setBanner({ kind: "warning", msg: "Completa los campos requeridos: Nombre e Índice." })
      return
    }
    const nameExists = types.some((t) => t.name.toLowerCase() === newType.name!.trim().toLowerCase())
    const indexExists = types.some((t) => t.index.toLowerCase() === newType.index!.trim().toLowerCase())
    if (nameExists || indexExists) {
      setAskOverwriteNew(true)
      return
    }
    handleSaveNew(false)
  }

  const handleSaveNew = async (overwrite: boolean) => {
    try {
      await window.api.config.sensorTypes.upsert(newType as SensorType)
      await reload()
      setNewType({ name: "", index: "", quantity: 1, simbol: "°C" })
      setAskOverwriteNew(false)
      setBanner({ kind: "success", msg: overwrite ? "Tipo sobrescrito correctamente." : "Tipo creado correctamente." })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo guardar el tipo." })
    }
  }

  // --- Editar ---
  const handleSaveEdit = async () => {
    setBanner(null)
    if (!editTarget) return
    if (!editType.name?.trim() || !editType.index?.trim()) {
      setBanner({ kind: "warning", msg: "Completa los campos requeridos en edición: Nombre e Índice." })
      return
    }
    try {
      await window.api.config.sensorTypes.upsert(editType as SensorType)
      await reload()
      setBanner({ kind: "success", msg: "Cambios guardados." })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo guardar los cambios." })
    }
  }

  // --- Borrar ---
  const handleDelete = async () => {
    setAskDelete(false)
    if (!deleteTarget) return
    try {
      await window.api.config.sensorTypes.remove(deleteTarget)
      await reload()
      if (editTarget === deleteTarget) {
        setEditTarget(null)
        setEditType({})
      }
      setDeleteTarget(null)
      setBanner({ kind: "success", msg: "Tipo borrado." })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo borrar el tipo." })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {banner && (
        <Banner kind={banner.kind} onClose={() => setBanner(null)}>
          {banner.msg}
        </Banner>
      )}

      {/* LISTADO */}
      <IndustrialCard title={sentenceCase("tipos de sensor")}>
        <div className="rounded-md border border-[#343841] overflow-hidden">
          <table className="w-full text-sm bg-[#1b1d23]">
            <thead className="bg-[#22262f] text-gray-300">
              <tr className="border-b border-[#343841]">
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Nombre</th>
                <th className="px-3 py-2 text-center text-xs uppercase tracking-wider">ID</th>
                <th className="px-3 py-2 text-center text-xs uppercase tracking-wider">#</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">SIMB</th>
                <th className="px-3 py-2 text-center text-xs uppercase tracking-wider w-[10%]">Acciones</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>
      </IndustrialCard>

      {/* AGREGAR (card propia): Nombre grande + fila de 3 inputs pequeños */}
      <IndustrialCard title={sentenceCase("agregar tipo de sensor")}>
        <div className="grid gap-3">
          {/* Nombre grande */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
            <Input
              placeholder="Ej. Temperatura ambiente"
              value={newType.name ?? ""}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
              className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white placeholder:text-gray-500 h-11"
            />
          </div>

          {/* Fila compacta: Índice, Cantidad, Símbolo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Índice *</label>
              <Input
                placeholder="Ej. TEMP"
                value={newType.index ?? ""}
                onChange={(e) => setNewType({ ...newType, index: e.target.value })}
                className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Cantidad</label>
              <Input
                type="number"
                placeholder="1"
                value={newType.quantity ?? 1}
                onChange={(e) =>
                  setNewType({
                    ...newType,
                    quantity: Number.isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value),
                  })
                }
                className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Símbolo</label>
              <Input
                placeholder="Ej. °C"
                value={newType.simbol ?? ""}
                onChange={(e) => setNewType({ ...newType, simbol: e.target.value })}
                className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveNewIntent}
              className="h-10 w-full sm:w-56 bg-[#2f8bff] hover:bg-[#277be3] text-white rounded-md"
            >
              Guardar nuevo
            </Button>
          </div>
        </div>
      </IndustrialCard>

      {/* EDITAR (card propia); aparece solo al elegir editar */}
      {editTarget && (
        <IndustrialCard title={sentenceCase(`editar tipo — id ${editTarget}`)}>
          <div id="edit-card" className="grid gap-3">
            {/* Nombre grande */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
              <Input
                placeholder="Ej. Temperatura ambiente"
                value={editType.name ?? ""}
                onChange={(e) => setEditType({ ...editType, name: e.target.value })}
                className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white placeholder:text-gray-500 h-11"
              />
            </div>

            {/* Fila compacta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Índice *</label>
                <Input
                  placeholder="Ej. TEMP"
                  value={editType.index ?? ""}
                  onChange={(e) => setEditType({ ...editType, index: e.target.value })}
                  className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Cantidad</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={editType.quantity ?? 1}
                  onChange={(e) =>
                    setEditType({
                      ...editType,
                      quantity: Number.isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value),
                    })
                  }
                  className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Símbolo</label>
                <Input
                  placeholder="Ej. °C"
                  value={editType.simbol ?? ""}
                  onChange={(e) => setEditType({ ...editType, simbol: e.target.value })}
                  className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  setEditTarget(null)
                  setEditType({})
                }}
                className="px-4 py-2 h-10 w-full sm:w-56 bg-[#272a32] hover:bg-[#2c313b] text-white rounded-md border border-[#343841]
                            sm:justify-self-start"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="px-4 py-2 h-10 w-full sm:w-56 bg-[#1e77e5] hover:bg-[#1b6bd0] text-white rounded-md
                            sm:justify-self-end"
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        </IndustrialCard>
      )}

      {/* Diálogo: sobrescribir al crear si nombre/índice ya existen */}
      <AlertDialog open={askOverwriteNew} onOpenChange={setAskOverwriteNew}>
        <AlertDialogContent className="bg-[#1b1d23] text-white border border-[#343841]">
          <AlertDialogHeader>
            <AlertDialogTitle>Posible duplicado</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Ya existe un tipo con el mismo nombre o índice. ¿Deseas sobrescribirlo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#272a32] border border-[#343841] text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSaveNew(true)} className="bg-[#2f8bff] hover:bg-[#277be3] text-white">
              Sobrescribir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo: borrar */}
      <AlertDialog open={askDelete} onOpenChange={setAskDelete}>
        <AlertDialogContent className="bg-[#1b1d23] text-white border border-[#343841]">
          <AlertDialogHeader>
            <AlertDialogTitle>Borrar tipo</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#272a32] border border-[#343841] text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
