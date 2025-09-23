// preload/src/index.ts
import { contextBridge, ipcRenderer } from 'electron'

export const api = {
  config: {
    profile: {
      getName: () => ipcRenderer.invoke('config.profile.getName'),
      get:     () => ipcRenderer.invoke('config.profile.get'),
      setActive: (name: string) => ipcRenderer.invoke('config.profile.setActive', name),
      save:      () => ipcRenderer.invoke('config.profile.save'),
      onChanged(cb: (e: { profile: string }) => void) {
        const h = (_: any, p: any) => cb(p)
        ipcRenderer.on('config:changed', h)
        return () => ipcRenderer.off('config:changed', h)
      },
    },
    entries: {
      list:   () => ipcRenderer.invoke('config.entries.list'),
      upsert: (e: any) => ipcRenderer.invoke('config.entries.upsert', e),
      remove: (id: string) => ipcRenderer.invoke('config.entries.remove', id),
    },
    sensorTypes: {
      list:   () => ipcRenderer.invoke('config.sensorTypes.list'),
      upsert: (s: any) => ipcRenderer.invoke('config.sensorTypes.upsert', s),
      remove: (id: number) => ipcRenderer.invoke('config.sensorTypes.remove', id),
    },
    modbus: {
      servers: {
        list:   () => ipcRenderer.invoke('config.modbus.servers.list'),
        upsert: (s: any) => ipcRenderer.invoke('config.modbus.servers.upsert', s),
        remove: (id: number) => ipcRenderer.invoke('config.modbus.servers.remove', id),
      },
      bind: {
        get:    (entryId: string) => ipcRenderer.invoke('config.bind.modbus.get', entryId),
        set:    (b: any) => ipcRenderer.invoke('config.bind.modbus.set', b),
        remove: (entryId: string) => ipcRenderer.invoke('config.bind.modbus.remove', entryId),
      },
    },
    ble: {
      bind: {
        get:    (entryId: string) => ipcRenderer.invoke('config.bind.ble.get', entryId),
        set:    (b: any) => ipcRenderer.invoke('config.bind.ble.set', b),
        remove: (entryId: string) => ipcRenderer.invoke('config.bind.ble.remove', entryId),
      },
    },
    widgets: {
      list:   () => ipcRenderer.invoke('config.widgets.list'),
      upsert: (w: any) => ipcRenderer.invoke('config.widgets.upsert', w),
      remove: (entryId: string) => ipcRenderer.invoke('config.widgets.remove', entryId),
    },
  },
} as const

contextBridge.exposeInMainWorld('api', api)
