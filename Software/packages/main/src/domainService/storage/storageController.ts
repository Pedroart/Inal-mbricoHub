import { ipcMain } from 'electron';
import { StorageManager } from './storage.js';
import type { AppModule } from '../../AppModule.js';
import type { ModuleContext } from '../../ModuleContext.js';

export class StorageModule implements AppModule {
  enable(_ctx: ModuleContext): void {
    const storage = StorageManager.getInstance();

    ipcMain.handle('storage:get-empresa', () => {
      return storage.get('empresa');
    });

    ipcMain.handle('storage:set-empresa', (_event, nuevaEmpresa: string) => {
      storage.set('empresa', nuevaEmpresa);
    });
  }
}