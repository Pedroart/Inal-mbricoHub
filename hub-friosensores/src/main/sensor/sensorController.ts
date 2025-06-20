import { ipcMain } from 'electron';
import { SensorService } from './sensorService';
import { Sensor } from './sensorModel';

export function registerSensorHandlers() {
  ipcMain.handle('sensor:add', (_, sensor: Sensor) => {
    return SensorService.addSensor(sensor);
  });

  ipcMain.handle('sensor:getById', (_, id: number) => {
    return SensorService.getSensorById(id);
  });

  ipcMain.handle('sensor:getByExternalId', (_, externalId: number) => {
    return SensorService.getSensorByExternalId(externalId);
  });

  ipcMain.handle('sensor:getAll', () => {
    return SensorService.getSensores();
  });

  ipcMain.handle('sensor:update', (_, sensor: Sensor) => {
    return SensorService.updateSensor(sensor);
  });
}