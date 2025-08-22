import React, { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { ArrowLeft, Bluetooth, Plus, Edit, Trash2, Wifi, WifiOff } from "lucide-react"

interface BluetoothDevice {
  id: string
  name: string
  macAddress: string
  deviceType: string
  status: "connected" | "disconnected" | "paired"
  lastSeen: string
}

export const BluetoothPage: React.FC =() => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([
    {
      id: "1",
      name: "Sensor Temperatura BLE-001",
      macAddress: "AA:BB:CC:DD:EE:01",
      deviceType: "Sensor de Temperatura",
      status: "connected",
      lastSeen: "2024-01-15 10:30:00",
    },
    {
      id: "2",
      name: "Sensor Humedad BLE-002",
      macAddress: "AA:BB:CC:DD:EE:02",
      deviceType: "Sensor de Humedad",
      status: "paired",
      lastSeen: "2024-01-15 09:45:00",
    },
    {
      id: "3",
      name: "Actuador BLE-003",
      macAddress: "AA:BB:CC:DD:EE:03",
      deviceType: "Actuador",
      status: "disconnected",
      lastSeen: "2024-01-14 16:20:00",
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<BluetoothDevice | null>(null)
  const [newDevice, setNewDevice] = useState({
    name: "",
    macAddress: "",
    deviceType: "",
  })

  const deviceTypes = [
    "Sensor de Temperatura",
    "Sensor de Humedad",
    "Sensor de Presión",
    "Actuador",
    "Controlador",
    "Gateway",
    "Otro",
  ]

  const handleAddDevice = () => {
    if (newDevice.name && newDevice.macAddress && newDevice.deviceType) {
      const device: BluetoothDevice = {
        id: Date.now().toString(),
        name: newDevice.name,
        macAddress: newDevice.macAddress.toUpperCase(),
        deviceType: newDevice.deviceType,
        status: "paired",
        lastSeen: new Date().toLocaleString(),
      }
      setDevices([...devices, device])
      setNewDevice({ name: "", macAddress: "", deviceType: "" })
      setIsAddDialogOpen(false)
    }
  }

  const handleEditDevice = (device: BluetoothDevice) => {
    setEditingDevice(device)
    setIsEditDialogOpen(true)
  }

  const handleDeleteDevice = (deviceId: string) => {
    setDevices(devices.filter((d) => d.id !== deviceId))
    setIsEditDialogOpen(false)
    setEditingDevice(null)
  }

  const handleUpdateDevice = () => {
    if (editingDevice) {
      setDevices(devices.map((d) => (d.id === editingDevice.id ? editingDevice : d)))
      setIsEditDialogOpen(false)
      setEditingDevice(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Conectado</Badge>
      case "paired":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Emparejado</Badge>
      case "disconnected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Desconectado</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Desconocido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    return status === "connected" ? (
      <Wifi className="h-4 w-4 text-green-400" />
    ) : (
      <WifiOff className="h-4 w-4 text-red-400" />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="container mx-auto p-6">

        {/* Devices Table */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bluetooth className="h-5 w-5 text-cyan-400" />
              Dispositivos Enlazados ({devices.length})
            </CardTitle>
            <CardDescription className="text-slate-300">
              Lista de todos los dispositivos Bluetooth configurados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Estado</TableHead>
                  <TableHead className="text-slate-300">Dispositivo</TableHead>
                  <TableHead className="text-slate-300">Dirección MAC</TableHead>
                  <TableHead className="text-slate-300">Tipo</TableHead>
                  <TableHead className="text-slate-300">Última Conexión</TableHead>
                  <TableHead className="text-slate-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id} className="border-slate-700 hover:bg-slate-700/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(device.status)}
                        {getStatusBadge(device.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-medium">{device.name}</TableCell>
                    <TableCell className="text-slate-300 font-mono text-sm">{device.macAddress}</TableCell>
                    <TableCell className="text-slate-300">{device.deviceType}</TableCell>
                    <TableCell className="text-slate-300 text-sm">{device.lastSeen}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDevice(device)}
                        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
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

        {/* Edit Device Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-cyan-400">Editar Dispositivo Bluetooth</DialogTitle>
              <DialogDescription className="text-slate-300">
                Modificar configuración del dispositivo: {editingDevice?.name}
              </DialogDescription>
            </DialogHeader>

            {editingDevice && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nombre del Dispositivo</Label>
                  <Input
                    id="edit-name"
                    value={editingDevice.name}
                    onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-mac">Dirección MAC</Label>
                  <Input
                    id="edit-mac"
                    value={editingDevice.macAddress}
                    onChange={(e) => setEditingDevice({ ...editingDevice, macAddress: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Tipo de Dispositivo</Label>
                  <Select
                    value={editingDevice.deviceType}
                    onValueChange={(value) => setEditingDevice({ ...editingDevice, deviceType: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {deviceTypes.map((type) => (
                        <SelectItem key={type} value={type} className="text-white hover:bg-slate-600">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select
                    value={editingDevice.status}
                    onValueChange={(value: "connected" | "disconnected" | "paired") =>
                      setEditingDevice({ ...editingDevice, status: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="connected" className="text-white hover:bg-slate-600">
                        Conectado
                      </SelectItem>
                      <SelectItem value="paired" className="text-white hover:bg-slate-600">
                        Emparejado
                      </SelectItem>
                      <SelectItem value="disconnected" className="text-white hover:bg-slate-600">
                        Desconectado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="destructive"
                onClick={() => editingDevice && handleDeleteDevice(editingDevice.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdateDevice} className="bg-cyan-600 hover:bg-cyan-700">
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
