import { ipcMain } from 'electron';
import { StorageManager } from './storage.js';

export function registerStorageHandlers() {
  const storage = StorageManager.getInstance();

  // GET empresa
  ipcMain.handle('storage:get-empresa', () => {
    return storage.get('empresa');
  });

  // SET empresa
  ipcMain.handle('storage:set-empresa', (_event, nuevaEmpresa: string) => {
    storage.set('empresa', nuevaEmpresa);
  });
}
