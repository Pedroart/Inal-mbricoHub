import { ipcMain } from 'electron';
import { RegistroService } from './registroService.js';
import { RegistroRaw } from './registroModel.js';

export function registerRegistroHandlers() {
  ipcMain.handle('registro:add', (_, registro: RegistroRaw) => {
    return RegistroService.addRegistro(registro);
  });

  ipcMain.handle('registro:getBySensorId', (_, sensorId: number) => {
    return RegistroService.getRegistrosBySensorId(sensorId);
  });

  ipcMain.handle('registro:getUltimoProcesado', (_, sensorId: number) => {
    return RegistroService.getUltimoRegistroProcesado(sensorId);
  });
}
