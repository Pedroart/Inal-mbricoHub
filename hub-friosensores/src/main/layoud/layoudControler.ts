import { ipcMain } from 'electron';
import { layoudManager } from './layoudService'

export function registerLayoudHandlers() {
  

  // GET layouds
  ipcMain.handle('layoud:get-layouds', () => {
    return layoudManager.getMapasDisponibles()
  });

}
