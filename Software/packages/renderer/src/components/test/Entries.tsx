import React, { useState, useEffect } from "react"
import type { Entry, Protocol } from "../../api/models"

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [newEntry, setNewEntry] = useState<Partial<Entry>>({
    sensor_type_id: 0,
    order: 0,
    protocol: "MODBUS",
    enabled: true,
    frecuency_s: 1,
    operation: "",
  })
  const [editTarget, setEditTarget] = useState<number>(-1)
  const [editEntry, setEditEntry] = useState<Partial<Entry>>({})
  const [deleteTarget, setDeleteTarget] = useState<number>(-1)

  useEffect(() => {
    window.api.config.entries.list().then(setEntries)
  }, [])

  const reload = async () => setEntries(await window.api.config.entries.list())

  const handleSaveNew = async () => {
    if (!newEntry.sensor_type_id) return
    await window.api.config.entries.upsert(newEntry as Entry)
    await reload()
    setNewEntry({
      sensor_type_id: 0,
      order: 0,
      protocol: "MODBUS",
      enabled: true,
      frecuency_s: 1,
      operation: "",
    })
  }

  const handleSaveEdit = async () => {
    if (editTarget < 0) return
    await window.api.config.entries.upsert(editEntry as Entry)
    await reload()
    setEditTarget(-1)
    setEditEntry({})
  }

  const handleDelete = async () => {
    if (deleteTarget < 0) return
    if (!confirm("¿Seguro que deseas borrar esta entrada?")) return
    await window.api.config.entries.remove(deleteTarget)
    await reload()
    setDeleteTarget(-1)
  }

  const handleSelectEdit = (id: number) => {
    setEditTarget(id)
    const e = entries.find((x) => x.id === id)
    if (e) setEditEntry({ ...e })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Listado */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Entradas</h2>
        <ul className="divide-y divide-gray-200">
          {entries.map((e) => (
            <li key={e.id}>
              {e.id} – SensorType {e.sensor_type_id} – {e.protocol} –{" "}
              {e.enabled ? "✔" : "✘"} – Freq: {e.frecuency_s}s – Orden: {e.order} – Op:{" "}
              {e.operation}
            </li>
          ))}
        </ul>
      </div>

      {/* Agregar */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Agregar entrada</h2>
        <input
          type="number"
          placeholder="SensorType ID"
          value={newEntry.sensor_type_id}
          onChange={(e) =>
            setNewEntry({ ...newEntry, sensor_type_id: parseInt(e.target.value) })
          }
          className="border rounded-md px-2 py-1 text-sm mr-2 w-32"
        />
        <input
          type="number"
          placeholder="Orden"
          value={newEntry.order}
          onChange={(e) => setNewEntry({ ...newEntry, order: parseInt(e.target.value) })}
          className="border rounded-md px-2 py-1 text-sm mr-2 w-20"
        />
        <select
          value={newEntry.protocol}
          onChange={(e) => setNewEntry({ ...newEntry, protocol: e.target.value as Protocol })}
          className="border rounded-md px-2 py-1 text-sm mr-2"
        >
          <option value="MODBUS">MODBUS</option>
          <option value="BLE">BLE</option>
          <option value="MQTT">MQTT</option>
        </select>
        <input
          type="checkbox"
          checked={newEntry.enabled}
          onChange={(e) => setNewEntry({ ...newEntry, enabled: e.target.checked })}
          className="mr-2"
        />
        Activo
        <input
          type="number"
          placeholder="Frecuencia (s)"
          value={newEntry.frecuency_s}
          onChange={(e) =>
            setNewEntry({ ...newEntry, frecuency_s: parseInt(e.target.value) })
          }
          className="border rounded-md px-2 py-1 text-sm mr-2 w-32"
        />
        <input
          type="text"
          placeholder="Operación"
          value={newEntry.operation}
          onChange={(e) => setNewEntry({ ...newEntry, operation: e.target.value })}
          className="border rounded-md px-2 py-1 text-sm mr-2"
        />
        <button onClick={handleSaveNew} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
          Guardar nuevo
        </button>
      </div>

      {/* Editar */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-yellow-700">Editar entrada</h2>
        <select
          value={editTarget >= 0 ? editTarget : ""}
          onChange={(e) => handleSelectEdit(Number(e.target.value))}
          className="border rounded-md px-2 py-1 text-sm w-full"
        >
          <option value="">-- Selecciona una entrada --</option>
          {entries.map((e) => (
            <option key={e.id} value={e.id}>
              {e.id} ({e.protocol})
            </option>
          ))}
        </select>

        {editTarget >= 0 && (
          <div className="space-y-2">
            <input
              type="number"
              readOnly
              value={editEntry.id}
              className="border rounded-md px-2 py-1 text-sm mr-2 bg-gray-100"
            />
            <input
              type="number"
              value={editEntry.sensor_type_id ?? 0}
              onChange={(e) =>
                setEditEntry({ ...editEntry, sensor_type_id: parseInt(e.target.value) })
              }
              className="border rounded-md px-2 py-1 text-sm mr-2 w-32"
            />
            <input
              type="number"
              value={editEntry.order ?? 0}
              onChange={(e) =>
                setEditEntry({ ...editEntry, order: parseInt(e.target.value) })
              }
              className="border rounded-md px-2 py-1 text-sm mr-2 w-20"
            />
            <select
              value={editEntry.protocol}
              onChange={(e) =>
                setEditEntry({ ...editEntry, protocol: e.target.value as Protocol })
              }
              className="border rounded-md px-2 py-1 text-sm mr-2"
            >
              <option value="MODBUS">MODBUS</option>
              <option value="BLE">BLE</option>
              <option value="MQTT">MQTT</option>
            </select>
            <label className="mr-2">
              <input
                type="checkbox"
                checked={editEntry.enabled ?? false}
                onChange={(e) => setEditEntry({ ...editEntry, enabled: e.target.checked })}
                className="mr-1"
              />
              Activo
            </label>
            <input
              type="number"
              value={editEntry.frecuency_s ?? 1}
              onChange={(e) =>
                setEditEntry({ ...editEntry, frecuency_s: parseInt(e.target.value) })
              }
              className="border rounded-md px-2 py-1 text-sm mr-2 w-32"
            />
            <input
              type="text"
              value={editEntry.operation ?? ""}
              onChange={(e) => setEditEntry({ ...editEntry, operation: e.target.value })}
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
        <h2 className="text-xl font-semibold text-red-700">Borrar entrada</h2>
        <select
          value={deleteTarget >= 0 ? deleteTarget : ""}
          onChange={(e) => setDeleteTarget(Number(e.target.value))}
          className="border rounded-md px-2 py-1 text-sm w-full"
        >
          <option value="">-- Selecciona una entrada --</option>
          {entries.map((e) => (
            <option key={e.id} value={e.id}>
              {e.id}
            </option>
          ))}
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
