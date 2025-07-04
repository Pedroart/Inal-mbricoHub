import { ipcMain } from 'electron';
import type { AppModule } from '../../AppModule.js';
import type { ModuleContext } from '../../ModuleContext.js';
import { SensorPollingService } from './SensorPollingService.js';
import { SensorBaseService } from './SensorBaseService.js';

export class SensorModule implements AppModule {
  enable(_ctx: ModuleContext): void {
    SensorPollingService.start(); // Se puede detener con SensorPollingService.stop();

    ipcMain.handle('sensor:getSensores', () => {
      return SensorPollingService.getTodas();
    });

    ipcMain.handle('sensor:getSensoresView', () => {
      return SensorBaseService.getSensorViews();
    });

    ipcMain.handle('dispositivo:getDeviceViews', () => {
      return SensorPollingService.getDeviceViews();
    });

    ipcMain.handle('sensor:getDeviceValue', (event, codigoSensor: string) => {
      return SensorPollingService.getLecturaPorCodigoSensor(codigoSensor);
    });

  }
}

// 👇 Para instanciarlo
export function createSensorModule(): AppModule {
  return new SensorModule();
}
