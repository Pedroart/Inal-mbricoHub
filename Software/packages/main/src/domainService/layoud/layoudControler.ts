import { ipcMain } from 'electron';
import type { AppModule } from '../../AppModule.js';
import type { ModuleContext } from '../../ModuleContext.js';
import { layoudManager } from './layoudService.js';
import { layoudItem, layoud } from "./layoudModel.js";


export class LayoudModule implements AppModule {
  enable(_ctx: ModuleContext): void {
    // Obtener todos los mapas disponibles
    ipcMain.handle('layoud:get-layouds', () => {
      return layoudManager.getMapasDisponibles();
    });

    // Obtener el mapa activo desde la caché o cargar el primero disponible
    ipcMain.handle('layoud:get-activo', () => {
      return layoudManager.obtenerMapaActivo();
    });

    // Guardar un nuevo mapa como activo en la caché
    ipcMain.handle('layoud:set-activo', (_event, mapa: layoudItem) => {
      layoudManager.seleccionarMapaDesdeLayoudItem(mapa);
      return { success: true };
    });

    ipcMain.handle('layoud:get-imagen-path', () => {
      return layoudManager.getLayoudImagePath();
    });

    ipcMain.handle('layoud:get-imagen', () => {
      return layoudManager.getLayoudImageDataUrl();
    });
  }
}

// 👇 Esta función te permite instanciarlo al estilo de los otros módulos
export function createLayoudModule(): AppModule {
  return new LayoudModule();
}
