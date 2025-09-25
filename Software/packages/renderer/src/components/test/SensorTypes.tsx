import { useState, useEffect } from "react"
import type { SensorType } from "../../api/models"

export default function SensorTypesPage() {
  const [types, setTypes] = useState<SensorType[]>([])
  const [newType, setNewType] = useState<Partial<SensorType>>({
    name: "",
    index: "",
    quantity: 1,
    simbol: "c°",
  })
  const [editTarget, setEditTarget] = useState<number | null>(null)
  const [editType, setEditType] = useState<Partial<SensorType>>({})
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  useEffect(() => {
    window.api.config.sensorTypes.list().then(setTypes)
  }, [])

  const reload = async () => setTypes(await window.api.config.sensorTypes.list())

  const handleSaveNew = async () => {
    if (!newType.name || !newType.index) return
    await window.api.config.sensorTypes.upsert(newType as SensorType)
    await reload()
    setNewType({ name: "", index: "", quantity: 1, simbol: "" })
  }

  const handleSaveEdit = async () => {
    if (!editTarget) return
    await window.api.config.sensorTypes.upsert(editType as SensorType)
    await reload()
    setEditTarget(null)
    setEditType({})
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    if (!confirm("¿Seguro que deseas borrar este tipo de sensor?")) return
    await window.api.config.sensorTypes.remove(deleteTarget)
    await reload()
    setDeleteTarget(null)
  }

  const handleSelectEdit = (id: number) => {
    setEditTarget(id)
    const t = types.find((x) => x.id === id)
    if (t) setEditType({ ...t })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Listado */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Tipos de Sensor</h2>
        <ul className="divide-y divide-gray-200">
          {types.map((t) => (
            <li key={t.id}>
              {t.id} – {t.name} ({t.index}) – Cantidad: {t.quantity} – Op: {t.simbol}
            </li>
          ))}
        </ul>
      </div>

      {/* Agregar */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Agregar tipo de sensor</h2>
        <input
          type="text"
          placeholder="Nombre"
          value={newType.name}
          onChange={(e) => setNewType({ ...newType, name: e.target.value })}
          className="border rounded-md px-2 py-1 text-sm mr-2"
        />
        <input
          type="text"
          placeholder="Índice"
          value={newType.index}
          onChange={(e) => setNewType({ ...newType, index: e.target.value })}
          className="border rounded-md px-2 py-1 text-sm mr-2"
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={newType.quantity}
          onChange={(e) => setNewType({ ...newType, quantity: parseInt(e.target.value) })}
          className="border rounded-md px-2 py-1 text-sm mr-2 w-24"
        />
        <input
          type="text"
          placeholder="Operación"
          value={newType.simbol}
          onChange={(e) => setNewType({ ...newType, simbol: e.target.value })}
          className="border rounded-md px-2 py-1 text-sm mr-2"
        />
        <button onClick={handleSaveNew} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
          Guardar nuevo
        </button>
      </div>

      {/* Editar */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-yellow-700">Editar tipo de sensor</h2>
        <select
          value={editTarget ?? ""}
          onChange={(e) => handleSelectEdit(Number(e.target.value))}
          className="border rounded-md px-2 py-1 text-sm w-full"
        >
          <option value="">-- Selecciona un tipo --</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.index})
            </option>
          ))}
        </select>

        {editTarget && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nombre"
              value={editType.name ?? ""}
              onChange={(e) => setEditType({ ...editType, name: e.target.value })}
              className="border rounded-md px-2 py-1 text-sm mr-2"
            />
            <input
              type="text"
              placeholder="Índice"
              value={editType.index ?? ""}
              onChange={(e) => setEditType({ ...editType, index: e.target.value })}
              className="border rounded-md px-2 py-1 text-sm mr-2"
            />
            <input
              type="number"
              placeholder="Cantidad"
              value={editType.quantity ?? 1}
              onChange={(e) => setEditType({ ...editType, quantity: parseInt(e.target.value) })}
              className="border rounded-md px-2 py-1 text-sm mr-2 w-24"
            />
            <input
              type="text"
              placeholder="Operación"
              value={editType.simbol ?? ""}
              onChange={(e) => setEditType({ ...editType, simbol: e.target.value })}
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
        <h2 className="text-xl font-semibold text-red-700">Borrar tipo de sensor</h2>
        <select
          value={deleteTarget ?? ""}
          onChange={(e) => setDeleteTarget(Number(e.target.value))}
          className="border rounded-md px-2 py-1 text-sm w-full"
        >
          <option value="">-- Selecciona un tipo --</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleDelete}
          disabled={!deleteTarget}
          className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50"
        >
          Borrar
        </button>
      </div>
    </div>
  )
}
