import React, { useState, useEffect } from "react"
import type { EntryBle } from "../../api/models"

export default function BlePage() {
  const [bindings, setBindings] = useState<EntryBle[]>([])
  const [newBind, setNewBind] = useState<Partial<EntryBle>>({ entry_id: "", device_id: "" })
  const [deleteTarget, setDeleteTarget] = useState<string>("")

  useEffect(() => {
    // No hay un list BLE global → asumimos que viene de profile completo
    window.api.config.profile.get().then((p) => setBindings(p.entry_ble))
  }, [])

  const handleSave = async () => {
    if (!newBind.entry_id || !newBind.device_id) return
    await window.api.config.ble.bind.set(newBind as EntryBle)
    const p = await window.api.config.profile.get()
    setBindings(p.entry_ble)
    setNewBind({ entry_id: "", device_id: "" })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    if (!confirm("¿Seguro que deseas borrar este binding BLE?")) return
    await window.api.config.ble.bind.remove(deleteTarget)
    const p = await window.api.config.profile.get()
    setBindings(p.entry_ble)
    setDeleteTarget("")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Bindings BLE</h2>
        <ul className="divide-y divide-gray-200">
          {bindings.map((b) => (
            <li key={b.entry_id}>
              entry: {b.entry_id} → device: {b.device_id}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Agregar / Editar</h2>
        <input
          type="text"
          placeholder="Entry ID"
          value={newBind.entry_id}
          onChange={(e) => setNewBind({ ...newBind, entry_id: e.target.value })}
          className="border rounded-md px-2 py-1 text-sm mr-2"
        />
        <input
          type="text"
          placeholder="Device ID"
          value={newBind.device_id}
          onChange={(e) => setNewBind({ ...newBind, device_id: e.target.value })}
          className="border rounded-md px-2 py-1 text-sm mr-2"
        />
        <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
          Guardar
        </button>
      </div>

      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-red-700">Borrar binding</h2>
        <select
          value={deleteTarget}
          onChange={(e) => setDeleteTarget(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm w-full"
        >
          <option value="">-- Selecciona un binding --</option>
          {bindings.map((b) => (
            <option key={b.entry_id} value={b.entry_id}>
              {b.entry_id} → {b.device_id}
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
