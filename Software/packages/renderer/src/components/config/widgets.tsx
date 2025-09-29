import { useEffect, useMemo, useState } from "react"
import type { DashboardWidget, Entry, SensorType } from "../../api/models"
import { IndustrialCard } from "../industrial-card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { MapCard } from "../MapCard"

// ---------- helpers ----------
function sentenceCase(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function Banner({
  kind = "info",
  children,
  onClose,
  timeoutMs = 3000,
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
    <div
      className={`group rounded-md border px-3 py-2 text-sm ${palette} transition-opacity duration-200 hover:opacity-0`}
      onMouseEnter={onClose}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">{children}</div>
        <button
          type="button"
          onClick={onClose}
          className="opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// Título por defecto: SensorType.name - Entry.index (con fallbacks sanos)
function defaultTitleForEntry(e: Entry, allSensorTypes: SensorType[]) {
  const st = allSensorTypes.find(s => s.id === e.sensor_type_id)
  const typeName = st?.name ?? `Tipo ${e.sensor_type_id}`
  const idx = (e as any).index ?? `${e.order ?? e.id}`
  return `${typeName} - ${idx}`
}

// ---------- página ----------
export default function WidgetsPage() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [sensorTypes, setSensorTypes] = useState<SensorType[]>([])

  // selección/edición
  const [editTarget, setEditTarget] = useState<number>(-1) // entry_id seleccionado
  const [editWidget, setEditWidget] = useState<Partial<DashboardWidget>>({})

  // UI
  const [banner, setBanner] = useState<{ kind: "info" | "success" | "warning" | "error"; msg: string } | null>(null)

  useEffect(() => {
    ;(async () => {
      const [e, st] = await Promise.all([
        window.api.config.entries.list(),
        window.api.config.sensorTypes.list(),
      ])
      setEntries(e)
      setSensorTypes(st)
      await reload()
      await ensureAllWidgetsExist(e, st) // crea faltantes con "Tipo - índice"
      await reload()
    })()
  }, [])

  const reload = async () => setWidgets(await window.api.config.widgets.list())

  // Crea widgets para cada Entry que aún no tenga
  const ensureAllWidgetsExist = async (allEntries: Entry[], allSensorTypes: SensorType[]) => {
    const current = await window.api.config.widgets.list()
    const have = new Set(current.map(w => w.entry_id))
    const toCreate: DashboardWidget[] = []

    for (const e of allEntries) {
      if (have.has(e.id)) continue
      const title = defaultTitleForEntry(e, allSensorTypes)
      // posición inicial basada en order para separar un poco
      const x = ((e.order ?? 0) * 18) % 100 || 50
      const y = 20 + (((e.order ?? 0) * 22) % 60)

      toCreate.push({
        entry_id: e.id,
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
        visible: true,
        title,
      } as DashboardWidget)
    }

    for (const w of toCreate) {
      try { await window.api.config.widgets.upsert(w) } catch {/* continuar aun si falla uno */}
    }
  }

  const clamp = (v: number) => Math.max(0, Math.min(100, v))
  const entryById = (id?: number) => entries.find((e) => e.id === id)
  const sensorSymbolByEntryId = (id?: number) => {
    const e = entryById(id)
    if (!e) return ""
    const st = sensorTypes.find((s) => s.id === e.sensor_type_id)
    return (st as any)?.simbol ?? ""
  }
  const stName = (entry?: Entry) => {
    if (!entry) return "??"
    const st = sensorTypes.find((s) => s.id === entry.sensor_type_id)
    return st ? st.name : `SensorType ${entry.sensor_type_id}`
  }

  // guardar cambios (upsert)
  const handleSave = async () => {
    setBanner(null)
    if (!editWidget.entry_id) {
      setBanner({ kind: "warning", msg: "Selecciona un widget desde el canvas o el selector." })
      return
    }
    try {
      await window.api.config.widgets.upsert(editWidget as DashboardWidget)
      await reload()
      setBanner({ kind: "success", msg: "Cambios guardados." })
      setEditTarget(editWidget.entry_id!)
    } catch {
      setBanner({ kind: "error", msg: "No se pudo guardar." })
    }
  }

  // cargar en editor (desde click o selector)
  const loadIntoEditor = (entry_id: number) => {
    const w = widgets.find((x) => x.entry_id === entry_id)
    if (w) {
      const e = entryById(entry_id)
      const fallbackTitle = e ? defaultTitleForEntry(e, sensorTypes) : (w.title || `Widget ${entry_id}`)
      setEditWidget({ ...w, title: w.title || fallbackTitle })
      setEditTarget(entry_id)
    } else {
      const e = entryById(entry_id)
      setEditWidget({ entry_id, x: 50, y: 50, visible: true, title: e ? defaultTitleForEntry(e, sensorTypes) : "" })
      setEditTarget(entry_id)
    }
  }

  // mover con flechas (no drag por click)
  const nudge = (dx: number, dy: number) => {
    if (!editWidget.entry_id) return
    setEditWidget((prev) => {
      const x = clamp((prev.x ?? 0) + dx)
      const y = clamp((prev.y ?? 0) + dy)
      return { ...(prev as DashboardWidget), x, y }
    })
  }
  const center = () => {
    if (!editWidget.entry_id) return
    setEditWidget((prev) => ({ ...(prev as DashboardWidget), x: 50, y: 50 }))
  }

  // vista previa del editado
  const canvasWidgets = useMemo(() => {
    return widgets.map((w) =>
      w.entry_id === editWidget.entry_id
        ? {
            ...w,
            x: editWidget.x ?? w.x,
            y: editWidget.y ?? w.y,
            title: (editWidget.title ?? w.title) || w.title,
            visible: editWidget.visible ?? w.visible,
          }
        : w
    )
  }, [widgets, editWidget])

  // ordenar entradas en el selector por order (si existe), luego id
  const entriesForSelect = useMemo(() => {
    return [...entries].sort((a, b) => {
      const ao = (a as any).order ?? 0
      const bo = (b as any).order ?? 0
      if (ao !== bo) return ao - bo
      return a.id - b.id
    })
  }, [entries])

  return (
    <div className="p-6 space-y-6">
      {banner && (
        <Banner kind={banner.kind} onClose={() => setBanner(null)}>
          {banner.msg}
        </Banner>
      )}

      {/* ÚNICA CARD: Editor + Canvas */}
      <IndustrialCard title={sentenceCase("editor de posición y propiedades")}>
        <div className="grid gap-3">

          {/* Cruceta ARRIBA + acciones */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Button onClick={() => nudge(0, -2)} disabled={!editWidget.entry_id}
                className="h-8 w-16 bg-[#272a32] hover:bg-[#2c313b] text-white border border-[#343841] disabled:opacity-50">↑</Button>
              <Button onClick={() => nudge(-2, 0)} disabled={!editWidget.entry_id}
                className="h-8 w-16 bg-[#272a32] hover:bg-[#2c313b] text-white border border-[#343841] disabled:opacity-50">←</Button>
              <Button onClick={center} disabled={!editWidget.entry_id}
                className="h-8 w-16 bg-[#272a32] hover:bg-[#2c313b] text-white border border-[#343841] disabled:opacity-50">C</Button>
              <Button onClick={() => nudge(2, 0)} disabled={!editWidget.entry_id}
                className="h-8 w-16 bg-[#272a32] hover:bg-[#2c313b] text-white border border-[#343841] disabled:opacity-50">→</Button>
              <Button onClick={() => nudge(0, 2)} disabled={!editWidget.entry_id}
                className="h-8 w-16 bg-[#272a32] hover:bg-[#2c313b] text-white border border-[#343841] disabled:opacity-50">↓</Button>
            </div>

            <div className="text-[11px] text-gray-400">
              X: {Math.round(editWidget.x ?? 50)}% · Y: {Math.round(editWidget.y ?? 50)}%
            </div>

            <div className="ml-auto flex gap-2">
              <Button
                onClick={() => { setEditTarget(-1); setEditWidget({}) }}
                className="h-8 bg-[#272a32] hover:bg-[#2c313b] text-white rounded-md border border-[#343841]">
                Limpiar selección
              </Button>
              <Button onClick={handleSave} className="h-8 bg-[#1e77e5] hover:bg-[#1b6bd0] text-white rounded-md">
                Guardar cambios
              </Button>
            </div>
          </div>

          {/* controles de edición */}
          <div className="grid sm:grid-cols-3 gap-3">
            {/* Entrada seleccionada -> SELECT */}
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Entrada seleccionada</label>
              <select
                value={editTarget > 0 ? String(editTarget) : ""}
                onChange={(e) => {
                  const id = Number(e.target.value)
                  if (!isNaN(id)) loadIntoEditor(id)
                }}
                className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e77e5]"
              >
                <option value="" disabled>— Selecciona una entrada —</option>
                {entriesForSelect.map(e => (
                  <option key={e.id} value={e.id}>
                    {defaultTitleForEntry(e, sensorTypes)} · id:{e.id} · orden:{(e as any).order}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-gray-400">
                {editTarget >= 0 ? `Editando: #${editTarget}` : "Sin selección"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Visible</label>
                <select
                  value={(editWidget.visible ?? true) ? "true" : "false"}
                  onChange={(e) =>
                    setEditWidget({ ...(editWidget as DashboardWidget), visible: e.target.value === "true" })
                  }
                  className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e77e5]"
                  disabled={!editWidget.entry_id}
                >
                  <option value="true">Visible</option>
                  <option value="false">Oculto</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Título</label>
                <Input
                  value={editWidget.title ?? ""}
                  onChange={(e) => setEditWidget({ ...(editWidget as DashboardWidget), title: e.target.value })}
                  className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white"
                  disabled={!editWidget.entry_id}
                />
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div
            className="relative w-full rounded border border-[#343841] bg-[#0f1116] overflow-hidden"
            style={{
              // Altura máxima del main (ajusta el 260px al alto de tu header/controles para evitar desbordes)
              height: "calc(100dvh - 260px)",
              backgroundImage: "url('/tunelTest.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
            aria-label="Canvas de widgets"
          >
            {canvasWidgets.map((w) => {
              const isSelected = w.entry_id === editTarget
              const color = isSelected ? "bg-amber-200" : w.visible ? "bg-emerald-200" : "bg-zinc-700/60"

              const e = entryById(w.entry_id)
              const displayTitle = w.title || (e ? defaultTitleForEntry(e, sensorTypes) : "Widget")

              return (
                <div
                  key={w.entry_id}
                  onClick={(ev) => { ev.stopPropagation(); loadIntoEditor(w.entry_id) }}
                  className={isSelected ? "ring-2 ring-amber-400 rounded-2xl" : ""}
                  style={{
                    position: "absolute",
                    left: `${w.x}%`,
                    top: `${w.y}%`,
                    transform: "translate(-50%, -50%)",
                    cursor: "pointer",
                  }}
                  title={`Editar widget #${w.entry_id}`}
                >
                  <MapCard
                    x={0}
                    y={0}
                    nombre={displayTitle}
                    valor={"--"}
                    unidad={sensorSymbolByEntryId(w.entry_id)}
                    color={color}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </IndustrialCard>
    </div>
  )
}
