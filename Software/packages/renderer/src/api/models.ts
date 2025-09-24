export type SensorType = {
  id: number
  name: string
  index: string
  quantity: number
  operation: string
}

export type Protocol = 'MODBUS' | 'BLE' | string

export type Entry = {
  id: string            // uuid
  sensor_type_id: number
  order: number
  protocol: Protocol
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

export type ConfigProfile = {
  sensor_type: SensorType[]
  entry: Entry[]
  modbus_server: ModbusServer[]
  entry_modbus: EntryModbus[]
  entry_ble: EntryBle[]
  dashboard_widget: DashboardWidget[]
}
