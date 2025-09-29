import type {
  ConfigProfile,
  Entry,
  SensorType,
  ModbusServer,
  EntryModbus,
  EntryBle,
  DashboardWidget,
  Measurement,
  BleDevice
} from './models'

export type Api = {
  config: {
    profile: {
      list: () => Promise<string[]>
      getName: () => Promise<string>
      get: () => Promise<ConfigProfile>
      setActive: (name: string) => Promise<boolean>
      save: () => Promise<void>
      saveAs: (newName: string, overwrite: boolean) => Promise<void>
      remove: (name: string) => Promise<void>
      onChanged: (cb: (e: { profile: string }) => void) => () => void
    }
    entries: {
      list: () => Promise<Entry[]>
      upsert: (e: Entry) => Promise<boolean>
      remove: (id: number) => Promise<boolean>
    }
    sensorTypes: {
      list: () => Promise<SensorType[]>
      upsert: (s: SensorType) => Promise<boolean>
      remove: (id: number) => Promise<boolean>
    }
    modbus: {
      servers: {
        list: () => Promise<ModbusServer[]>
        upsert: (s: ModbusServer) => Promise<boolean>
        remove: (id: number) => Promise<boolean>
      }
      bind: {
        get: (entryId: number) => Promise<EntryModbus | undefined>
        set: (b: EntryModbus) => Promise<boolean>
        remove: (entryId: number) => Promise<boolean>
      }
    }
    ble: {
      bind: {
        get: (entryId: number) => Promise<EntryBle | undefined>
        set: (b: EntryBle) => Promise<boolean>
        remove: (entryId: number) => Promise<boolean>
      }
    }
    widgets: {
      list: () => Promise<DashboardWidget[]>
      upsert: (w: DashboardWidget) => Promise<boolean>
      remove: (entryId: number) => Promise<boolean>
    }
  }
  measures: {
    latest: () => Promise<Measurement[]>
    latestByEntry: (entryId: number) => Promise<Measurement>
    historyByEntry: (entryId: number, since: number) => Promise<Measurement[]>
  }
  ble: {
    scan: {
      start: () => Promise<void> 
      stop: () => Promise<void>
      list: () => Promise<BleDevice[]>
    }
    connect: {
      try: (entryId: string) => Promise<boolean>
    } 
  }
}
