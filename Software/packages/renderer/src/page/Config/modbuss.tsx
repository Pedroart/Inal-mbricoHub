import React, { useState } from "react"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Switch } from "../../components/ui/switch"
import { ArrowLeft, Plus, Edit, Trash2, Server } from "lucide-react"

interface ModbusServer {
  id: string
  name: string
  host: string
  port: number
  unitId: number
  timeout: number
  reconnectDelay: number
  enabled: boolean
}

const initialServers: ModbusServer[] = [
  {
    id: "1",
    name: "Modbus Server 1",
    host: "192.168.0.50",
    port: 502,
    unitId: 1,
    timeout: 1500,
    reconnectDelay: 3000,
    enabled: true,
  },
]

export const ModbusClientePage: React.FC = () => {
  const [servers, setServers] = useState<ModbusServer[]>(initialServers)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedServer, setSelectedServer] = useState<ModbusServer | null>(null)
  const [newServerName, setNewServerName] = useState("")

  const [formData, setFormData] = useState({
    host: "",
    port: 502,
    unitId: 1,
    timeout: 1500,
    reconnectDelay: 3000,
  })

  const handleAddServer = () => {
    if (!newServerName) return

    const newServer: ModbusServer = {
      id: Date.now().toString(),
      name: newServerName,
      host: formData.host,
      port: formData.port,
      unitId: formData.unitId,
      timeout: formData.timeout,
      reconnectDelay: formData.reconnectDelay,
      enabled: true,
    }

    setServers([...servers, newServer])
    setIsAddDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setNewServerName("")
    setFormData({
      host: "",
      port: 502,
      unitId: 1,
      timeout: 1500,
      reconnectDelay: 3000,
    })
  }

  const handleEditServer = (server: ModbusServer) => {
    setSelectedServer(server)
    setFormData({
      host: server.host,
      port: server.port,
      unitId: server.unitId,
      timeout: server.timeout,
      reconnectDelay: server.reconnectDelay,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveServer = () => {
    if (!selectedServer) return

    const updatedServer: ModbusServer = {
      ...selectedServer,
      host: formData.host,
      port: formData.port,
      unitId: formData.unitId,
      timeout: formData.timeout,
      reconnectDelay: formData.reconnectDelay,
    }

    setServers(servers.map((s) => (s.id === selectedServer.id ? updatedServer : s)))
    setIsEditDialogOpen(false)
    setSelectedServer(null)
  }

  const handleDeleteServer = () => {
    if (selectedServer) {
      setServers(servers.filter((s) => s.id !== selectedServer.id))
      setIsEditDialogOpen(false)
      setSelectedServer(null)
    }
  }

  const toggleServerStatus = (id: string) => {
    setServers(servers.map((server) => (server.id === id ? { ...server, enabled: !server.enabled } : server)))
  }

  return (
    <div>
        {/* Header */}

        {/* Servers Table */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Lista de Modbus Servers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Nombre</TableHead>
                  <TableHead className="text-slate-300">Host</TableHead>
                  <TableHead className="text-slate-300">Puerto</TableHead>
                  <TableHead className="text-slate-300">Unit ID</TableHead>
                  <TableHead className="text-slate-300">Estado</TableHead>
                  <TableHead className="text-slate-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servers.map((server) => (
                  <TableRow key={server.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">{server.name}</TableCell>
                    <TableCell className="text-slate-300">{server.host}</TableCell>
                    <TableCell className="text-slate-300">{server.port}</TableCell>
                    <TableCell className="text-slate-300">{server.unitId}</TableCell>
                    <TableCell>
                      <Switch checked={server.enabled} onCheckedChange={() => toggleServerStatus(server.id)} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditServer(server)}
                        className="text-slate-300 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Modbus Server</DialogTitle>
              <DialogDescription className="text-slate-300">{selectedServer?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-4 p-4 bg-slate-700/30 rounded-lg">
                <h3 className="text-lg font-semibold text-green-400">Configuración Modbus TCP</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-host">Host (IP del esclavo)</Label>
                    <Input
                      id="edit-host"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-port">Port</Label>
                    <Select
                      value={formData.port.toString()}
                      onValueChange={(value) => setFormData({ ...formData, port: Number.parseInt(value) })}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="502">502 (estándar)</SelectItem>
                        <SelectItem value="1502">1502 (alternativo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-unit-id">Unit-Id (Slave ID)</Label>
                    <Input
                      id="edit-unit-id"
                      type="number"
                      min="1"
                      max="255"
                      value={formData.unitId}
                      onChange={(e) => setFormData({ ...formData, unitId: Number.parseInt(e.target.value) || 1 })}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-timeout">Timeout (ms)</Label>
                    <Input
                      id="edit-timeout"
                      type="number"
                      min="1000"
                      max="5000"
                      value={formData.timeout}
                      onChange={(e) => setFormData({ ...formData, timeout: Number.parseInt(e.target.value) || 1500 })}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="edit-reconnect-delay">Reconnect Delay (ms)</Label>
                    <Input
                      id="edit-reconnect-delay"
                      type="number"
                      min="2000"
                      max="10000"
                      value={formData.reconnectDelay}
                      onChange={(e) =>
                        setFormData({ ...formData, reconnectDelay: Number.parseInt(e.target.value) || 3000 })
                      }
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveServer} className="flex-1 bg-green-600 hover:bg-green-700">
                  Guardar Configuración
                </Button>
                <Button onClick={handleDeleteServer} variant="destructive" className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>
    
  )
}
