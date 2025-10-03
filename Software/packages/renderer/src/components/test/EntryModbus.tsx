import { useState, useEffect } from "react"
import type { EntryModbus, Entry, ModbusServer, SensorType } from "../../api/models"

export default function EntryModbusPage() {
  const [binds, setBinds] = useState<EntryModbus[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [servers, setServers] = useState<ModbusServer[]>([])
  const [sensorTypes, setSensorTypes] = useState<SensorType[]>([])

  const [newBind, setNewBind] = useState<Partial<EntryModbus>>({
    entry_id: 0,
    server_id: 0,
    address: 0,
  })

  const [editTarget, setEditTarget] = useState<number>(-1)
  const [editBind, setEditBind] = useState<Partial<EntryModbus>>({})

  const [deleteTarget, setDeleteTarget] = useState<number>(-1)

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
    if (!newBind.entry_id || !newBind.server_id) return
    await window.api.config.modbus.bind.set(newBind as EntryModbus)
    await reload()
    setNewBind({ entry_id: 0, server_id: 0, address: 0 })
  }

  // ---- Editar ----
  const handleSaveEdit = async () => {
    if (editTarget < 0) return
    await window.api.config.modbus.bind.set(editBind as EntryModbus)
    await reload()
    setEditTarget(-1)
    setEditBind({})
  }

  const handleSelectEdit = (id: number) => {
    setEditTarget(id)
    const b = binds.find((x) => x.entry_id === id)
    if (b) setEditBind({ ...b })
  }

  // ---- Borrar ----
  const handleDelete = async () => {
    if (deleteTarget < 0) return
    if (!confirm("¿Seguro que deseas borrar este bind?")) return
    await window.api.config.modbus.bind.remove(deleteTarget)
    await reload()
    setDeleteTarget(-1)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Listado */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Binds Modbus</h2>
        <ul className="divide-y divide-gray-200">
          {binds.map((b) => (
            <li key={b.entry_id}>
              {findEntryLabel(b.entry_id)} → {findServerLabel(b.server_id)} @ Dirección {b.address}
            </li>
          ))}
        </ul>
      </div>

      {/* Agregar */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Agregar bind</h2>
        <select
          value={newBind.entry_id}
          onChange={(e) => setNewBind({ ...newBind, entry_id: parseInt(e.target.value) })}
          className="border rounded-md px-2 py-1 text-sm mr-2"
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
          className="border rounded-md px-2 py-1 text-sm mr-2"
        >
          <option value={0}>-- Selecciona un server --</option>
          {servers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.ip}:{s.port})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Dirección"
          value={newBind.address}
          onChange={(e) => setNewBind({ ...newBind, address: parseInt(e.target.value) })}
          className="border rounded-md px-2 py-1 text-sm mr-2 w-28"
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
        <h2 className="text-xl font-semibold text-yellow-700">Editar bind</h2>
        <select
          value={editTarget >= 0 ? editTarget : ""}
          onChange={(e) => handleSelectEdit(Number(e.target.value))}
          className="border rounded-md px-2 py-1 text-sm w-full"
        >
          <option value="">-- Selecciona un bind --</option>
          {binds.map((b) => (
            <option key={b.entry_id} value={b.entry_id}>
              {findEntryLabel(b.entry_id)}
            </option>
          ))}
        </select>

        {editTarget >= 0 && (
          <div className="space-y-2">
            <input
              type="number"
              readOnly
              value={editBind.entry_id}
              className="border rounded-md px-2 py-1 text-sm bg-gray-100"
            />

            <select
              value={editBind.server_id ?? 0}
              onChange={(e) => setEditBind({ ...editBind, server_id: parseInt(e.target.value) })}
              className="border rounded-md px-2 py-1 text-sm mr-2"
            >
              <option value={0}>-- Selecciona un server --</option>
              {servers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.ip}:{s.port})
                </option>
              ))}
            </select>

            <input
              type="number"
              value={editBind.address ?? 0}
              onChange={(e) => setEditBind({ ...editBind, address: parseInt(e.target.value) })}
              className="border rounded-md px-2 py-1 text-sm mr-2 w-28"
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
        <h2 className="text-xl font-semibold text-red-700">Borrar bind</h2>
        <select
          value={deleteTarget >= 0 ? deleteTarget : ""}
          onChange={(e) => setDeleteTarget(Number(e.target.value))}
          className="border rounded-md px-2 py-1 text-sm w-full"
        >
          <option value="">-- Selecciona un bind --</option>
          {binds.map((b) => (
            <option key={b.entry_id} value={b.entry_id}>
              {findEntryLabel(b.entry_id)}
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
