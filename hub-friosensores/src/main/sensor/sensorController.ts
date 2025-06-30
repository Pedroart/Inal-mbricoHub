import { ipcMain } from 'electron';
import { SensorService } from './sensorService';
import { Sensor } from './sensorModel';
import { SensorPollingService } from './SensorPollingService'

export function registerSensorHandlers() {
  ipcMain.handle('sensor:getSensores', () => {
    return SensorPollingService.getTodas();
  });

}