import { useState, useEffect, useMemo } from "react"
import type { ModbusServer } from "../../api/models"
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

// --- Banner (mismo que EntriesPage) ---
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

export default function ModbusServerPage() {
  const [servers, setServers] = useState<ModbusServer[]>([])

  // crear
  const [newServer, setNewServer] = useState<Partial<ModbusServer>>({
    name: "",
    type: "TCP",
    ip: "",
    port: 502,
    unitId: 1,
    timeout: 2000,
  })

  // editar
  const [editTarget, setEditTarget] = useState<number>(-1)
  const [editServer, setEditServer] = useState<Partial<ModbusServer>>({
    name: "",
    type: "TCP",
    ip: "",
    port: 502,
    unitId: 1,
    timeout: 2000,
  })

  // borrar
  const [deleteTarget, setDeleteTarget] = useState<number>(-1)
  const [askDeleteOne, setAskDeleteOne] = useState(false)

  // ui
  const [banner, setBanner] = useState<{ kind: "info" | "success" | "warning" | "error"; msg: string } | null>(null)

  const reload = async () => setServers(await window.api.config.modbus.servers.list())
  useEffect(() => {
    reload()
  }, [])

  // --- crear ---
  const handleSaveNew = async () => {
    setBanner(null)
    if (!newServer.name || !newServer.unitId) {
      setBanner({ kind: "warning", msg: "Completa los campos obligatorios." })
      return
    }
    try {
      await window.api.config.modbus.servers.upsert(newServer as ModbusServer)
      await reload()
      setNewServer({ name: "", type: "TCP", ip: "", port: 502, unitId: 1, timeout: 2000 })
      setBanner({ kind: "success", msg: "Servidor creado." })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo crear el servidor." })
    }
  }

  // --- editar ---
  const handleSelectEdit = (id: number) => {
    setEditTarget(id)
    const s = servers.find((srv) => srv.id === id)
    if (s) setEditServer({ ...s })
    setTimeout(() => document.getElementById("edit-card")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0)
  }

  const handleSaveEdit = async () => {
    setBanner(null)
    if (editTarget < 0) return
    try {
      await window.api.config.modbus.servers.upsert(editServer as ModbusServer)
      await reload()
      setEditTarget(-1)
      setEditServer({ name: "", type: "TCP", ip: "", port: 502, unitId: 1, timeout: 2000 })
      setBanner({ kind: "success", msg: "Cambios guardados." })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo guardar." })
    }
  }

  // --- borrar ---
  const handleDelete = async () => {
    setAskDeleteOne(false)
    if (deleteTarget < 0) return
    try {
      await window.api.config.modbus.servers.remove(deleteTarget)
      await reload()
      setDeleteTarget(-1)
      if (editTarget === deleteTarget) {
        setEditTarget(-1)
        setEditServer({ name: "", type: "TCP", ip: "", port: 502, unitId: 1, timeout: 2000 })
      }
      setBanner({ kind: "success", msg: "Servidor borrado." })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo borrar." })
    }
  }

  // --- tabla ---
  const tableRows = useMemo(
    () =>
      servers.map((s) => (
        <tr key={s.id} className="border-b border-[#343841] hover:bg-[#20242d]">
          <td className="px-3 py-2 text-gray-400">{s.id}</td>
          <td className="px-3 py-2">{s.name}</td>
          <td className="px-3 py-2">{s.type}</td>
          <td className="px-3 py-2">
            {s.type === "TCP" ? `${s.ip}:${s.port}` : `${s.path} @ ${s.baudRate}bps`}
          </td>
          <td className="px-3 py-2 text-center">{s.unitId}</td>
          <td className="px-3 py-2 text-center">{s.timeout}ms</td>
          <td className="px-3 py-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                className="h-8 w-full bg-[#1e77e5] hover:bg-[#1b6bd0] text-white"
                onClick={() => handleSelectEdit(s.id)}
              >
                Editar
              </Button>
              <Button
                className="h-8 w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  setDeleteTarget(s.id)
                  setAskDeleteOne(true)
                }}
              >
                Borrar
              </Button>
            </div>
          </td>
        </tr>
      )),
    [servers]
  )

  return (
    <div className="p-6 space-y-6">
      {banner && <Banner kind={banner.kind} onClose={() => setBanner(null)}>{banner.msg}</Banner>}

      {/* LISTADO */}
      <IndustrialCard title="Servidores Modbus">
        <div className="rounded-md border border-[#343841] overflow-hidden">
          <table className="w-full text-sm bg-[#1b1d23]">
            <thead className="bg-[#22262f] text-gray-300">
              <tr className="border-b border-[#343841]">
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">ID</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Nombre</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Tipo</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Conexión</th>
                <th className="px-3 py-2 text-center text-xs uppercase tracking-wider">UnitId</th>
                <th className="px-3 py-2 text-center text-xs uppercase tracking-wider">Timeout</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>
      </IndustrialCard>

      {/* AGREGAR */}
      <IndustrialCard title="Agregar servidor">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <Input
            placeholder="Nombre *"
            value={newServer.name}
            onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
            className="bg-[#1b1d23] text-white border-[#343841]"
          />
          <select
            value={newServer.type}
            onChange={(e) => setNewServer({ ...newServer, type: e.target.value as "TCP" | "RTU" })}
            className="rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm"
          >
            <option value="TCP">TCP</option>
            <option value="RTU">RTU</option>
          </select>
          {newServer.type === "TCP" && (
            <>
              <Input
                placeholder="IP *"
                value={newServer.ip}
                onChange={(e) => setNewServer({ ...newServer, ip: e.target.value })}
                className="bg-[#1b1d23] text-white border-[#343841]"
              />
              <Input
                type="number"
                placeholder="Puerto"
                value={newServer.port}
                onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) })}
                className="bg-[#1b1d23] text-white border-[#343841]"
              />
            </>
          )}
          {newServer.type === "RTU" && (
            <>
              <Input
                placeholder="Path (ej: /dev/ttyUSB0)"
                value={newServer.path}
                onChange={(e) => setNewServer({ ...newServer, path: e.target.value })}
                className="bg-[#1b1d23] text-white border-[#343841]"
              />
              <Input
                type="number"
                placeholder="BaudRate"
                value={newServer.baudRate}
                onChange={(e) => setNewServer({ ...newServer, baudRate: parseInt(e.target.value) })}
                className="bg-[#1b1d23] text-white border-[#343841]"
              />
            </>
          )}
          <Input
            type="number"
            placeholder="Unit ID *"
            value={newServer.unitId}
            onChange={(e) => setNewServer({ ...newServer, unitId: parseInt(e.target.value) })}
            className="bg-[#1b1d23] text-white border-[#343841]"
          />
          <Input
            type="number"
            placeholder="Timeout (ms)"
            value={newServer.timeout}
            onChange={(e) => setNewServer({ ...newServer, timeout: parseInt(e.target.value) })}
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
        <IndustrialCard title={`Editar servidor — id ${editTarget}`}>
          <div id="edit-card" className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <Input
              placeholder="Nombre"
              value={editServer.name}
              onChange={(e) => setEditServer({ ...editServer, name: e.target.value })}
              className="bg-[#1b1d23] text-white border-[#343841]"
            />
            <select
              value={editServer.type}
              onChange={(e) => setEditServer({ ...editServer, type: e.target.value as "TCP" | "RTU" })}
              className="rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm"
            >
              <option value="TCP">TCP</option>
              <option value="RTU">RTU</option>
            </select>
            {editServer.type === "TCP" && (
              <>
                <Input
                  placeholder="IP"
                  value={editServer.ip}
                  onChange={(e) => setEditServer({ ...editServer, ip: e.target.value })}
                  className="bg-[#1b1d23] text-white border-[#343841]"
                />
                <Input
                  type="number"
                  placeholder="Puerto"
                  value={editServer.port}
                  onChange={(e) => setEditServer({ ...editServer, port: parseInt(e.target.value) })}
                  className="bg-[#1b1d23] text-white border-[#343841]"
                />
              </>
            )}
            {editServer.type === "RTU" && (
              <>
                <Input
                  placeholder="Path"
                  value={editServer.path}
                  onChange={(e) => setEditServer({ ...editServer, path: e.target.value })}
                  className="bg-[#1b1d23] text-white border-[#343841]"
                />
                <Input
                  type="number"
                  placeholder="BaudRate"
                  value={editServer.baudRate}
                  onChange={(e) => setEditServer({ ...editServer, baudRate: parseInt(e.target.value) })}
                  className="bg-[#1b1d23] text-white border-[#343841]"
                />
              </>
            )}
            <Input
              type="number"
              placeholder="Unit ID"
              value={editServer.unitId}
              onChange={(e) => setEditServer({ ...editServer, unitId: parseInt(e.target.value) })}
              className="bg-[#1b1d23] text-white border-[#343841]"
            />
            <Input
              type="number"
              placeholder="Timeout (ms)"
              value={editServer.timeout}
              onChange={(e) => setEditServer({ ...editServer, timeout: parseInt(e.target.value) })}
              className="bg-[#1b1d23] text-white border-[#343841]"
            />
          </div>
          <div className="flex justify-between mt-3">
            <Button
              onClick={() => {
                setEditTarget(-1)
                setEditServer({ name: "", type: "TCP", ip: "", port: 502, unitId: 1, timeout: 2000 })
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
            <AlertDialogTitle>Borrar servidor</AlertDialogTitle>
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
    </div>
  )
}
