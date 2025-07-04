import {sha256sum} from './nodeCrypto.js';
import {versions} from './versions.js';
import {ipcRenderer} from 'electron';

export const api = {
  ping: () => ipcRenderer.invoke('ping'),

  // ✅ Agrega estos métodos
  getSensoresView: () => ipcRenderer.invoke('sensor:getSensoresView'),
  getSensores: () => ipcRenderer.invoke('sensor:getSensores'),
  getDispositivos: () => ipcRenderer.invoke('dispositivo:getDeviceViews'),
  getEmpresa: () => ipcRenderer.invoke('storage:get-empresa'),
  setEmpresa: (nuevaEmpresa: string) => ipcRenderer.invoke('storage:set-empresa', nuevaEmpresa),


  layoud:{
    getllista: () => ipcRenderer.invoke('layoud:get-layouds'),
    getActivo: () => ipcRenderer.invoke('layoud:get-activo'),
    setActivo: (nuevoMapa: any) => ipcRenderer.invoke('layoud:set-activo', nuevoMapa),
    getPathImage: () => ipcRenderer.invoke('layoud:get-imagen-path'),
    getImage: () => ipcRenderer.invoke('layoud:get-imagen'),
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

function send(channel: string, message: string) {
  return ipcRenderer.invoke(channel, message);
}

export {sha256sum, versions, send};
