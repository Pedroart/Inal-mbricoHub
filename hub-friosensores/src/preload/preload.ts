// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

export const api = {
  ping: () => ipcRenderer.invoke('ping'),

  // ✅ Agrega estos métodos
  getSensoresView: () => ipcRenderer.invoke('sensor:getSensoresView'),
  getSensores: () => ipcRenderer.invoke('sensor:getSensores'),
  getEmpresa: () => ipcRenderer.invoke('storage:get-empresa'),
  setEmpresa: (nuevaEmpresa: string) => ipcRenderer.invoke('storage:set-empresa', nuevaEmpresa),

  layoud:{
    getllista: () => ipcRenderer.invoke('layoud:get-layouds'),
    getActivo: () => ipcRenderer.invoke('layoud:get-activo'),
    setActivo: (nuevoMapa: any) => ipcRenderer.invoke('layoud:set-activo', nuevoMapa),
  },

  mapa: {
    getDispositivos: () => ipcRenderer.invoke('mapa:get-dispositivos'),
    getSensores: (codigoDispositivo: string) => ipcRenderer.invoke('mapa:get-sensores', codigoDispositivo),
    setNombreDispositivo: (codigo: string, nombre: string) => ipcRenderer.invoke('mapa:set-nombre-dispositivo', codigo, nombre),
    setEstadoDispositivo: (codigo: string, habilitado: boolean) => ipcRenderer.invoke('mapa:set-estado-dispositivo', codigo, habilitado),
    setNombreSensor: (codigo: string, nombre: string) => ipcRenderer.invoke('mapa:set-nombre-sensor', codigo, nombre),
    setEstadoSensor: (codigo: string, habilitado: boolean) => ipcRenderer.invoke('mapa:set-estado-sensor', codigo, habilitado),
    setConfigBle: (codigoSensor: string, codigoBle: string) => ipcRenderer.invoke('mapa:set-config-ble', codigoSensor, codigoBle),
    setConfigModbus: (codigoSensor: string, modbusNodeCode?: string, address?: number, cantidad?: number) =>
      ipcRenderer.invoke('mapa:set-config-modbus', codigoSensor, modbusNodeCode, address, cantidad),
    getConfigSensor: (codigoSensor: string) => ipcRenderer.invoke('mapa:get-config-sensor', codigoSensor),
    guardar: () => ipcRenderer.invoke('mapa:guardar'),
  },

  modbusNode: {
    getAll: () => ipcRenderer.invoke('modbus:get-all'),
    getById: (id: string) => ipcRenderer.invoke('modbus:get-by-id', id),
    create: (nodo: any) => ipcRenderer.invoke('modbus:create', nodo),
    edit: (id: string, datos: Partial<any>) => ipcRenderer.invoke('modbus:edit', id, datos),
    delete: (id: string) => ipcRenderer.invoke('modbus:delete', id),
  }
};

contextBridge.exposeInMainWorld('api', api);
