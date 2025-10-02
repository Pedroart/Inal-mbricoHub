export type {
  SensorType,
  Entry,
  ModbusServer,
  EntryModbus,
  EntryBle,
  DashboardWidget,
  ConfigProfile,
  Protocol,
  Measurement,
  BleDeviceEvent,
  EntryBleType
} from "../../../main/src/models/domain.ts";

export interface BleDevice {
  address: string
  name?: string
  rssi?: number
  ts: number
}