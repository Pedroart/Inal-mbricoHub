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

export type BleDevice = {
  id: string               // MAC / UUID / dirección
  name?: string            // nombre publicitado
  rssi?: number            // potencia señal (dBm)
  lastSeen?: number        // epoch ms del último anuncio recibido
  serviceUuids?: string[]  // opcional: servicios anunciados
}
