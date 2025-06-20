import { ipcMain } from 'electron';
import { SensorService } from './sensorService';

export function registerSensorHandlers() {
  ipcMain.handle('sensor:add', (_, sensor) => SensorService.addSensor(sensor));
}
