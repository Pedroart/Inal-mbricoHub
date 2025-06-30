import { ipcMain } from 'electron';
import { MapaService } from './mapaService';
import { layoudManager } from '../layoud/layoudService';

let mapaCtrl: MapaService | null = null;

export function registerMapaHandlers() {
  const activo = layoudManager.obtenerMapaActivo();
  if (!activo) {
    console.warn('⚠️ No se encontró mapa activo');
    return;
  }

  mapaCtrl = MapaService.getInstance();

  // Obtener todos los dispositivos
  ipcMain.handle('mapa:get-dispositivos', () => {
    return mapaCtrl?.getDispositivos();
  });

  // Obtener sensores de un dispositivo
  ipcMain.handle('mapa:get-sensores', (_e, codigoDispositivo: string) => {
    return mapaCtrl?.getSensoresDeDispositivo(codigoDispositivo);
  });

  // Cambiar nombre de dispositivo
  ipcMain.handle('mapa:set-nombre-dispositivo', (_e, codigo: string, nombre: string) => {
    return mapaCtrl?.setNombreDispositivo(codigo, nombre);
  });

  // Cambiar estado habilitador de dispositivo
  ipcMain.handle('mapa:set-estado-dispositivo', (_e, codigo: string, habilitado: boolean) => {
    return mapaCtrl?.setEstadoDispositivo(codigo, habilitado);
  });

  // Cambiar nombre de sensor
  ipcMain.handle('mapa:set-nombre-sensor', (_e, codigo: string, nombre: string) => {
    return mapaCtrl?.setNombreSensor(codigo, nombre);
  });

  // Cambiar estado de sensor
  ipcMain.handle('mapa:set-estado-sensor', (_e, codigo: string, habilitado: boolean) => {
    return mapaCtrl?.setEstadoSensor(codigo, habilitado);
  });

  // Setear configuración BLE
  ipcMain.handle('mapa:set-config-ble', (_e, codigoSensor: string, codigoBle: string) => {
    return mapaCtrl?.setConfigBle(codigoSensor, codigoBle);
  });

  // Setear configuración Modbus
  ipcMain.handle('mapa:set-config-modbus', (_e, codigoSensor: string, modbusNodeCode?: string, address?: number, cantidad?: number) => {
    return mapaCtrl?.setConfigModbus(codigoSensor, modbusNodeCode, address, cantidad);
  });

  // Obtener configuración de un sensor
  ipcMain.handle('mapa:get-config-sensor', (_e, codigoSensor: string) => {
    return mapaCtrl?.getConfig(codigoSensor);
  });

  // Guardar mapa
  ipcMain.handle('mapa:guardar', () => {
    return mapaCtrl?.actualizarMapa();
  });
}
