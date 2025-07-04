import { ipcMain } from 'electron';
import type { AppModule } from '../../AppModule.js';
import type { ModuleContext } from '../../ModuleContext.js';
import { layoudManager } from './layoudService.js';
import type { MapaWithConfig } from '../../models/Mapa.js';

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
    ipcMain.handle('layoud:set-activo', (_event, mapa: MapaWithConfig) => {
      layoudManager.guardarMapaSeleccionado(mapa);
      return { success: true };
    });
  }
}

// 👇 Esta función te permite instanciarlo al estilo de los otros módulos
export function createLayoudModule(): AppModule {
  return new LayoudModule();
}
