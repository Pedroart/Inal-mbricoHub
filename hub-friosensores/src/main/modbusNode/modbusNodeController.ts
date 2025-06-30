import { ipcMain } from 'electron';
import { ModbusNodeService } from './modbusNodeService';
import { ModbusNode } from '../../renderer/models/ModbusNode';

export function registerModbusNodeHandlers() {
  const service = ModbusNodeService.getInstance();

  // Obtener todos los nodos
  ipcMain.handle('modbus:get-all', () => {
    return service.getAll();
  });

  // Obtener nodo por ID
  ipcMain.handle('modbus:get-by-id', (_event, id: string) => {
    return service.getById(id);
  });

  // Crear nuevo nodo
  ipcMain.handle('modbus:create', (_event, nodo: ModbusNode) => {
    return service.crear(nodo);
  });

  // Editar nodo
  ipcMain.handle('modbus:edit', (_event, id: string, datos: Partial<ModbusNode>) => {
    return service.editar(id, datos);
  });

  // Eliminar nodo
  ipcMain.handle('modbus:delete', (_event, id: string) => {
    return service.eliminar(id);
  });
}
