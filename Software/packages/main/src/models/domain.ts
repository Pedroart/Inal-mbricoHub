// core/domain.ts
export type SensorType = {
  id: number
  name: string
  index: string
  quantity: number
  simbol: string
}

export type Protocol = 'MODBUS' | 'BLE' | string

export type Entry = {
  id: number
  sensor_type_id: number
  order: number
  protocol: Protocol
  enabled: boolean
  frecuency_s: number
  operation: string
}

export type Measurement = {
  ts: number            // epoch ms (internamente guardamos ms)
  entry_id: number
  value: number
}

export type ModbusServer = {
  id: number
  name: string
  type: "TCP" | "RTU"   // tipo de conexión
  ip?: string          // si es TCP
  port?: number        // si es TCP
  path?: string        // si es RTU (ej: /dev/ttyUSB0, COM3)
  baudRate?: number    // si es RTU
  unitId: number       // Slave ID (1–247)
  timeout?: number     // opcional
}

export type EntryModbus = {
  entry_id: number
  server_id: number
  address: number
}

export type EntryBleType = "TEM" | "BAT"

export type EntryBle = {
  entry_id: number
  device_id: string
  _type: EntryBleType
}

export type DashboardWidget = {
  entry_id: number
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

export type BleDeviceEvent = {
  type: string;         // "event", "devices", "hello"
  event?: string;       // "adv"
  address?: string;
  rssi?: number;
  cid?: string;
  match?: boolean;
  raw?: string;
  temp_c?: number;
  bat_pct?: number;
  ts?: number;
  data?: any;           // snapshot (para type=devices)
};