// core/domain.ts
export type SensorType = {
  id: number
  name: string
  index: string
  quantity: number
  operation: string
}

export type Entry = {
  id: string            // uuid
  sensor_type_id: number
  order: number
  protocol: 'MODBUS' | 'BLE' | string
  enabled: boolean
  frecuency_s: number
  operation: string
}

export type Measurement = {
  ts: number            // epoch ms (internamente guardamos ms)
  entry_id: string
  value: number
}

export type ModbusServer = {
  id: number
  name: string
  ip: string
  port: number
}

export type EntryModbus = {
  entry_id: string
  server_id: number
  address: number
}

export type EntryBle = {
  entry_id: string
  device_id: string
}

export type DashboardWidget = {
  entry_id: string
  x: number
  y: number
  visible: boolean
  title: string
}
