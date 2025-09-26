// preload/src/index.ts

/* Nota: Si quieres aplicar el cambio correctamente
  1. Cambiar el Handle a nivel de main
  2. Cambiar el invoke a nivel de preload
  3. cambiar la definicion de API a nivel de render
*/

import { contextBridge, ipcRenderer } from 'electron'

export const api = {
  config: {
    profile: {
      list:    () => ipcRenderer.invoke('config.profile.list'), 
      getName: () => ipcRenderer.invoke('config.profile.getName'),
      get:     () => ipcRenderer.invoke('config.profile.get'),
      setActive: (name: string) => ipcRenderer.invoke('config.profile.setActive', name),
      save:      () => ipcRenderer.invoke('config.profile.save'),
      saveAs:    (newName: string, overwrite: boolean) => ipcRenderer.invoke('config.profile.saveAs', newName, overwrite),
      remove:    (name: string) => ipcRenderer.invoke('config.profile.remove',name),
      onChanged(cb: (e: { profile: string }) => void) {
        const h = (_: any, p: any) => cb(p)
        ipcRenderer.on('config:changed', h)
        return () => ipcRenderer.off('config:changed', h)
      },
    },
    entries: {
      list:   () => ipcRenderer.invoke('config.entries.list'),
      upsert: (e: any) => ipcRenderer.invoke('config.entries.upsert', e),
      remove: (id: number) => ipcRenderer.invoke('config.entries.remove', id),
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
        get:    (entryId: number) => ipcRenderer.invoke('config.bind.modbus.get', entryId),
        set:    (b: any) => ipcRenderer.invoke('config.bind.modbus.set', b),
        remove: (entryId: number) => ipcRenderer.invoke('config.bind.modbus.remove', entryId),
      },
    },
    ble: {
      bind: {
        get:    (entryId: number) => ipcRenderer.invoke('config.bind.ble.get', entryId),
        set:    (b: any) => ipcRenderer.invoke('config.bind.ble.set', b),
        remove: (entryId: number) => ipcRenderer.invoke('config.bind.ble.remove', entryId),
      },
    },
    widgets: {
      list:   () => ipcRenderer.invoke('config.widgets.list'),
      upsert: (w: any) => ipcRenderer.invoke('config.widgets.upsert', w),
      remove: (entryId: number) => ipcRenderer.invoke('config.widgets.remove', entryId),
    },
  },
  measures: {
      latest: () => ipcRenderer.invoke('measurements:get-latest'),
      latestByEntry: (entryId: number) => ipcRenderer.invoke('measurements:get-by-entry', entryId),
      historyByEntry: (entryId: number, since: number) => ipcRenderer.invoke('measurements:get-history',entryId,since)
  },
} as const

contextBridge.exposeInMainWorld('api', api)
