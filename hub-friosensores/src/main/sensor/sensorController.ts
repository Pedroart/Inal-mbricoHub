import { ipcMain } from 'electron';
import { SensorService } from './sensorService';
import { Sensor } from './sensorModel';
import { SensorPollingService } from './SensorPollingService'
import { SensorBaseService } from './SensorBaseService';

export function registerSensorHandlers() {
  ipcMain.handle('sensor:getSensores', () => {
    return SensorPollingService.getTodas();
  });
  ipcMain.handle('sensor:getSensoresView', () => {
    return SensorBaseService.getSensorViews();
  });
}