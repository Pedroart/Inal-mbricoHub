import React, { useState, useEffect } from "react"
import type { ModbusServer } from "../../api/models"

export default function ModbusServerPage() {
  const [servers, setServers] = useState<ModbusServer[]>([])
  const [newServer, setNewServer] = useState<Partial<ModbusServer>>({ name: "", ip: "", port: 502 })
  const [editTarget, setEditTarget] = useState<string>("")
  const [editServer, setEditServer] = useState<Partial<ModbusServer>>({ name: "", ip: "", port: 502 })
  const [deleteTarget, setDeleteTarget] = useState<string>("")

  useEffect(() => {
    window.api.config.modbus.servers.list().then(setServers)
  }, [])

  const handleSaveNew = async () => {
    if (!newServer.name || !newServer.ip || !newServer.port) return
    await window.api.config.modbus.servers.upsert(newServer as ModbusServer)
    setServers(await window.api.config.modbus.servers.list())
    setNewServer({ name: "", ip: "", port: 502 })
  }

  const handleSaveEdit = async () => {
    if (!editTarget) return
    if (!editServer.name || !editServer.ip || !editServer.port) return
    await window.api.config.modbus.servers.upsert(editServer as ModbusServer)
    setServers(await window.api.config.modbus.servers.list())
    setEditTarget("")
    setEditServer({ name: "", ip: "", port: 502 })
  }

  const handleDelete = async () => {
    if (!deleteTarget || deleteTarget === "-1") return
    if (!confirm("¿Seguro que deseas borrar este servidor Modbus?")) return
    await window.api.config.modbus.servers.remove(Number(deleteTarget))
    setServers(await window.api.config.modbus.servers.list())
    setDeleteTarget("")
  }

  const handleSelectEdit = (id: string) => {
    setEditTarget(id)
    const srv = servers.find((s) => s.id === Number(id))
    if (srv) {
      setEditServer({ ...srv })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Listado */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Servidores Modbus</h2>
        <ul className="divide-y divide-gray-200">
          {servers.map((s) => (
            <li key={s.id}>
              {s.id} – {s.name} ({s.ip}:{s.port})
            </li>
          ))}
        </ul>
      </div>

      {/* Agregar */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Agregar servidor</h2>
        <input
          type="text"
          placeholder="Nombre"
          value={newServer.name}
          onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
          className="border rounded-md px-2 py-1 text-sm mr-2"
        />
        <input
          type="text"
          placeholder="IP"
          value={newServer.ip}
          onChange={(e) => setNewServer({ ...newServer, ip: e.target.value })}
          className="border rounded-md px-2 py-1 text-sm mr-2"
        />
        <input
          type="number"
          placeholder="Puerto"
          value={newServer.port}
          onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) })}
          className="border rounded-md px-2 py-1 text-sm mr-2 w-24"
        />
        <button onClick={handleSaveNew} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
          Guardar nuevo
        </button>
      </div>

      {/* Editar */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-yellow-700">Editar servidor</h2>
        <select
          value={editTarget}
          onChange={(e) => handleSelectEdit(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm w-full"
        >
          <option key="default" value="">
            -- Selecciona un servidor --
          </option>
          {servers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.ip}:{s.port})
            </option>
          ))}
        </select>

        {editTarget && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nombre"
              value={editServer.name}
              onChange={(e) => setEditServer({ ...editServer, name: e.target.value })}
              className="border rounded-md px-2 py-1 text-sm mr-2"
            />
            <input
              type="text"
              placeholder="IP"
              value={editServer.ip}
              onChange={(e) => setEditServer({ ...editServer, ip: e.target.value })}
              className="border rounded-md px-2 py-1 text-sm mr-2"
            />
            <input
              type="number"
              placeholder="Puerto"
              value={editServer.port}
              onChange={(e) =>
                setEditServer({ ...editServer, port: parseInt(e.target.value) })
              }
              className="border rounded-md px-2 py-1 text-sm mr-2 w-24"
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
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-red-700">Borrar servidor</h2>
        <select
          value={deleteTarget}
          onChange={(e) => setDeleteTarget(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm w-full"
        >
          <option key="default" value="">
            -- Selecciona un servidor --
          </option>
          {servers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.ip}:{s.port})
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
