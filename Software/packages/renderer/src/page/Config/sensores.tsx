"use client"

import { useState } from "react"

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
import { ArrowLeft, Plus, Edit, Trash2, Cpu } from "lucide-react"

interface Sensor {
  id: string
  name: string
  type: "BLE" | "Modbus" | "S7"
  enabled: boolean
  visible: boolean
  bleDevice?: string
  modbusServer?: string
  modbusRegister?: number
  s7Config?: string
}

const initialSensors: Sensor[] = [
  { id: "1", name: "Pulpa 1", type: "BLE", enabled: true, visible: true },
  { id: "2", name: "Pulpa 2", type: "Modbus", enabled: true, visible: false },
  { id: "3", name: "Ambiente 1", type: "S7", enabled: false, visible: true },
  { id: "4", name: "Retorno 1", type: "BLE", enabled: true, visible: true },
]

export const SensorsPage: React.FC = () =>{
  const [sensors, setSensors] = useState<Sensor[]>(initialSensors)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)
  const [newSensorType, setNewSensorType] = useState<string>("")
  const [newSensorCategory, setNewSensorCategory] = useState<string>("")
  const [newSensorQuantity, setNewSensorQuantity] = useState<number>(1)
  const [editBleDevice, setEditBleDevice] = useState<string>("")
  const [editModbusServer, setEditModbusServer] = useState<string>("")
  const [editModbusRegister, setEditModbusRegister] = useState<number>(0)

  const bleDevices = ["Dispositivo BLE 1", "Dispositivo BLE 2", "Dispositivo BLE 3", "Dispositivo BLE 4"]
  const modbusServers = ["Server Modbus 1", "Server Modbus 2", "Server Modbus 3"]

  const handleAddSensors = () => {
    if (!newSensorType || !newSensorCategory) return

    const newSensors: Sensor[] = []
    for (let i = 1; i <= newSensorQuantity; i++) {
      const sensorName = `${newSensorCategory} ${i}`
      newSensors.push({
        id: Date.now().toString() + i,
        name: sensorName,
        type: newSensorType as "BLE" | "Modbus" | "S7",
        enabled: true,
        visible: true,
      })
    }

    setSensors([...sensors, ...newSensors])
    setIsAddDialogOpen(false)
    setNewSensorType("")
    setNewSensorCategory("")
    setNewSensorQuantity(1)
  }

  const handleEditSensor = (sensor: Sensor) => {
    setSelectedSensor(sensor)
    setEditBleDevice(sensor.bleDevice || "")
    setEditModbusServer(sensor.modbusServer || "")
    setEditModbusRegister(sensor.modbusRegister || 0)
    setIsEditDialogOpen(true)
  }

  const handleDeleteSensor = () => {
    if (selectedSensor) {
      setSensors(sensors.filter((s) => s.id !== selectedSensor.id))
      setIsEditDialogOpen(false)
      setSelectedSensor(null)
    }
  }

  const toggleSensorVisibility = (id: string) => {
    setSensors(sensors.map((sensor) => (sensor.id === id ? { ...sensor, visible: !sensor.visible } : sensor)))
  }

  const getMaxQuantity = (category: string) => {
    switch (category) {
      case "Pulpa °C":
      case "Pulpa V":
        return 16
      case "Ambiente":
        return 2
      default:
        return 10
    }
  }

  const handleSaveSensorConfig = () => {
    if (selectedSensor) {
      setSensors(
        sensors.map((sensor) =>
          sensor.id === selectedSensor.id
            ? {
                ...sensor,
                bleDevice: selectedSensor.type === "BLE" ? editBleDevice : undefined,
                modbusServer: selectedSensor.type === "Modbus" ? editModbusServer : undefined,
                modbusRegister: selectedSensor.type === "Modbus" ? editModbusRegister : undefined,
              }
            : sensor,
        ),
      )
      setIsEditDialogOpen(false)
      setSelectedSensor(null)
    }
  }

  return (
    
      <div>
        {/* Sensors Table */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader  className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Lista de Sensores</CardTitle>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Sensores
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevos Sensores</DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Selecciona el tipo y categoría de sensores a crear
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sensor-type">Tipo de Sensor</Label>
                    <Select value={newSensorType} onValueChange={setNewSensorType}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="BLE">BLE</SelectItem>
                        <SelectItem value="Modbus">Modbus</SelectItem>
                        <SelectItem value="S7">S7</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sensor-category">Categoría</Label>
                    <Select value={newSensorCategory} onValueChange={setNewSensorCategory}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="Pulpa °C">Pulpa °C</SelectItem>
                        <SelectItem value="Pulpa V">Pulpa V</SelectItem>
                        <SelectItem value="Ambiente">Ambiente</SelectItem>
                        <SelectItem value="Retorno">Retorno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={getMaxQuantity(newSensorCategory)}
                      value={newSensorQuantity}
                      onChange={(e) => setNewSensorQuantity(Number.parseInt(e.target.value) || 1)}
                      className="bg-slate-700 border-slate-600"
                    />
                    {newSensorCategory && (
                      <p className="text-sm text-slate-400 mt-1">
                        Máximo: {getMaxQuantity(newSensorCategory)} sensores
                      </p>
                    )}
                  </div>
                  <Button onClick={handleAddSensors} className="w-full bg-blue-600 hover:bg-blue-700">
                    Crear Sensores
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Sensor</TableHead>
                  <TableHead className="text-slate-300">Tipo de Sensor</TableHead>
                  <TableHead className="text-slate-300">Nombre Visible</TableHead>
                  <TableHead className="text-slate-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sensors.map((sensor) => (
                  <TableRow key={sensor.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">{sensor.name}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          sensor.type === "BLE"
                            ? "bg-blue-600 text-blue-100"
                            : sensor.type === "Modbus"
                              ? "bg-green-600 text-green-100"
                              : "bg-orange-600 text-orange-100"
                        }`}
                      >
                        {sensor.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch className="bg-white" checked={sensor.visible} onCheckedChange={() => toggleSensorVisibility(sensor.id)} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSensor(sensor)}
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
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Sensor</DialogTitle>
              <DialogDescription className="text-slate-300">
                {selectedSensor?.name} - {selectedSensor?.type}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedSensor?.type === "BLE" && (
                <div>
                  <Label htmlFor="ble-device">Dispositivo BLE</Label>
                  <Select value={editBleDevice} onValueChange={setEditBleDevice}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Seleccionar dispositivo" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {bleDevices.map((device) => (
                        <SelectItem key={device} value={device}>
                          {device}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedSensor?.type === "Modbus" && (
                <>
                  <div>
                    <Label htmlFor="modbus-server">Server Modbus</Label>
                    <Select value={editModbusServer} onValueChange={setEditModbusServer}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Seleccionar server" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {modbusServers.map((server) => (
                          <SelectItem key={server} value={server}>
                            {server}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="modbus-register">Número de Registro</Label>
                    <Input
                      id="modbus-register"
                      type="number"
                      min="0"
                      value={editModbusRegister}
                      onChange={(e) => setEditModbusRegister(Number.parseInt(e.target.value) || 0)}
                      className="bg-slate-700 border-slate-600"
                      placeholder="Ej: 40001"
                    />
                  </div>
                </>
              )}

              {selectedSensor?.type === "S7" && (
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-300">Configuración S7 estará disponible próximamente</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSaveSensorConfig} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Guardar Configuración
                </Button>
                <Button onClick={handleDeleteSensor} variant="destructive" className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  )
}
