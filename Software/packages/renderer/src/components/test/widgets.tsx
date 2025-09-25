import { useState, useEffect } from "react"
import type { DashboardWidget, Entry, SensorType } from "../../api/models"

export default function WidgetsPage() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [sensorTypes, setSensorTypes] = useState<SensorType[]>([])

  const [newWidget, setNewWidget] = useState<Partial<DashboardWidget>>({
    entry_id: 0,
    x: 0,
    y: 0,
    visible: true,
    title: "",
  })

  const [editTarget, setEditTarget] = useState<number>(-1)
  const [editWidget, setEditWidget] = useState<Partial<DashboardWidget>>({})

  const [deleteTarget, setDeleteTarget] = useState<number>(-1)

  useEffect(() => {
    reload()
    window.api.config.entries.list().then(setEntries)
    window.api.config.sensorTypes.list().then(setSensorTypes)
  }, [])

  const reload = async () => setWidgets(await window.api.config.widgets.list())

  const findSensorName = (entry: Entry) => {
    const st = sensorTypes.find((s) => s.id === entry.sensor_type_id)
    return st ? st.name : `SensorType ${entry.sensor_type_id}`
  }

  // ---- Crear ----
  const handleSaveNew = async () => {
    if (!newWidget.entry_id) return
    await window.api.config.widgets.upsert(newWidget as DashboardWidget)
    await reload()
    setNewWidget({
      entry_id: 0,
      x: 0,
      y: 0,
      visible: true,
      title: "",
    })
  }

  // ---- Editar ----
  const handleSaveEdit = async () => {
    if (editTarget < 0) return
    await window.api.config.widgets.upsert(editWidget as DashboardWidget)
    await reload()
    setEditTarget(-1)
    setEditWidget({})
  }

  const handleSelectEdit = (id: number) => {
    setEditTarget(id)
    const w = widgets.find((x) => x.entry_id === id)
    if (w) setEditWidget({ ...w })
  }

  // ---- Borrar ----
  const handleDelete = async () => {
    if (deleteTarget < 0) return
    if (!confirm("¿Seguro que deseas borrar este widget?")) return
    await window.api.config.widgets.remove(deleteTarget)
    await reload()
    setDeleteTarget(-1)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Listado */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Widgets</h2>
        <ul className="divide-y divide-gray-200">
          {widgets.map((w) => {
            const entry = entries.find((e) => e.id === w.entry_id)
            return (
              <li key={w.entry_id}>
                ID Entrada: {w.entry_id} – {entry ? findSensorName(entry) : "??"} – Pos: ({w.x},{" "}
                {w.y}) – {w.visible ? "✔ Visible" : "✘ Oculto"} – Título: {w.title}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Agregar */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Agregar widget</h2>
        <select
          value={newWidget.entry_id}
          onChange={(e) =>
            setNewWidget({ ...newWidget, entry_id: parseInt(e.target.value) })
          }
          className="border rounded-md px-2 py-1 text-sm mr-2"
        >
          <option value={0}>-- Selecciona una entrada --</option>
          {entries.map((e) => {
            const st = sensorTypes.find((s) => s.id === e.sensor_type_id)
            return (
              <option key={e.id} value={e.id}>
                {e.id} – {st ? st.name : "??"} – Orden {e.order}
              </option>
            )
          })}
        </select>
        <input
          type="number"
          placeholder="X"
          value={newWidget.x}
          onChange={(e) =>
            setNewWidget({ ...newWidget, x: parseInt(e.target.value) })
          }
          className="border rounded-md px-2 py-1 text-sm mr-2 w-20"
        />
        <input
          type="number"
          placeholder="Y"
          value={newWidget.y}
          onChange={(e) =>
            setNewWidget({ ...newWidget, y: parseInt(e.target.value) })
          }
          className="border rounded-md px-2 py-1 text-sm mr-2 w-20"
        />
        <label className="mr-2">
          <input
            type="checkbox"
            checked={newWidget.visible}
            onChange={(e) =>
              setNewWidget({ ...newWidget, visible: e.target.checked })
            }
            className="mr-1"
          />
          Visible
        </label>
        <input
          type="text"
          placeholder="Título"
          value={newWidget.title ?? ""}
          onChange={(e) =>
            setNewWidget({ ...newWidget, title: e.target.value })
          }
          className="border rounded-md px-2 py-1 text-sm mr-2 w-40"
        />
        <button
          onClick={handleSaveNew}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        >
          Guardar nuevo
        </button>
      </div>

      {/* Editar */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-yellow-700">Editar widget</h2>
        <select
          value={editTarget >= 0 ? editTarget : ""}
          onChange={(e) => handleSelectEdit(Number(e.target.value))}
          className="border rounded-md px-2 py-1 text-sm w-full"
        >
          <option value="">-- Selecciona un widget --</option>
          {widgets.map((w) => {
            const entry = entries.find((e) => e.id === w.entry_id)
            return (
              <option key={w.entry_id} value={w.entry_id}>
                {w.entry_id} – {entry ? findSensorName(entry) : "??"}
              </option>
            )
          })}
        </select>

        {editTarget >= 0 && (
          <div className="space-y-2">
            <input
              type="number"
              readOnly
              value={editWidget.entry_id}
              className="border rounded-md px-2 py-1 text-sm bg-gray-100"
            />
            <input
              type="number"
              value={editWidget.x ?? 0}
              onChange={(e) =>
                setEditWidget({ ...editWidget, x: parseInt(e.target.value) })
              }
              className="border rounded-md px-2 py-1 text-sm mr-2 w-20"
            />
            <input
              type="number"
              value={editWidget.y ?? 0}
              onChange={(e) =>
                setEditWidget({ ...editWidget, y: parseInt(e.target.value) })
              }
              className="border rounded-md px-2 py-1 text-sm mr-2 w-20"
            />
            <label className="mr-2">
              <input
                type="checkbox"
                checked={editWidget.visible ?? false}
                onChange={(e) =>
                  setEditWidget({ ...editWidget, visible: e.target.checked })
                }
                className="mr-1"
              />
              Visible
            </label>
            <input
              type="text"
              value={editWidget.title ?? ""}
              onChange={(e) =>
                setEditWidget({ ...editWidget, title: e.target.value })
              }
              className="border rounded-md px-2 py-1 text-sm mr-2"
            />
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md"
            >
              Guardar cambios
            </button>
          </div>
        )}
      </div>

      {/* Borrar */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-red-700">Borrar widget</h2>
        <select
          value={deleteTarget >= 0 ? deleteTarget : ""}
          onChange={(e) => setDeleteTarget(Number(e.target.value))}
          className="border rounded-md px-2 py-1 text-sm w-full"
        >
          <option value="">-- Selecciona un widget --</option>
          {widgets.map((w) => {
            const entry = entries.find((e) => e.id === w.entry_id)
            return (
              <option key={w.entry_id} value={w.entry_id}>
                {w.entry_id} – {entry ? findSensorName(entry) : "??"}
              </option>
            )
          })}
        </select>
        <button
          onClick={handleDelete}
          disabled={deleteTarget < 0}
          className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50"
        >
          Borrar
        </button>
      </div>
    </div>
  )
}
