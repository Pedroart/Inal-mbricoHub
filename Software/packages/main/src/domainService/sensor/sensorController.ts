import { ipcMain } from 'electron';
import { SensorService } from './sensorService.js';
import { Sensor } from './sensorModel.js';
import { SensorPollingService } from './SensorPollingService.js'
import { SensorBaseService } from './SensorBaseService.js';

export function registerSensorHandlers() {
  ipcMain.handle('sensor:getSensores', () => {
    return SensorPollingService.getTodas();
  });
  ipcMain.handle('sensor:getSensoresView', () => {
    return SensorBaseService.getSensorViews();
  });

  ipcMain.handle('dispositivo:getDeviceViews',() => {
    return SensorPollingService.getDeviceViews();
  });
}