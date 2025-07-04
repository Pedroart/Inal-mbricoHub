import { ipcMain } from 'electron';
import { layoudManager } from './layoudService.js';
import { MapaWithConfig } from '../../renderer/models/Mapa';

export function registerLayoudHandlers() {
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
