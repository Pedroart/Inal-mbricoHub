import fs from "fs";
import path from "path";
import { app, ipcMain } from "electron";
import { readFileSync } from 'fs';
import {MapaWithConfig} from "../../renderer/models/Mapa"
import { layoudItem, layoud } from "./layoudModel";

const CACHE_PATH = path.join(app.getPath("userData"), "confMap.json");

console.log(CACHE_PATH);

const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd
  ? path.join(process.resourcesPath, 'layoud')
  : path.join(__dirname, 'layoud');

export class layoudManager {
  private static readonly CACHE_PATH = path.join(app.getPath("userData"), "confMap.json");

  private static readonly basePaths = [
    basePath,
    path.join(app.getPath("userData"), "layouds"),
  ];

  // 🔍 Devuelve todos los mapas disponibles
  static getMapasDisponibles(): layoudItem[] {
    const lista: layoudItem[] = [];

    for (const basePath of this.basePaths) {
      if (!fs.existsSync(basePath)) continue;

      const carpetas = fs.readdirSync(basePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());

      for (const carpeta of carpetas) {
        const nombre = carpeta.name;
        const rutaJson = path.join(basePath, nombre, "index.json");

        if (fs.existsSync(rutaJson)) {
          lista.push({ nombre, path: rutaJson } as layoudItem);
        }
      }
    }

    return lista;
  }

  // 📥 Carga un mapa desde una ruta
  static cargarMapaJson(ruta: string): MapaWithConfig {
    const raw = fs.readFileSync(ruta, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed as MapaWithConfig;
  }

  // 💾 Guarda en caché el mapa seleccionado
  // 💾 Guarda el mapa completo en caché
  static guardarMapaSeleccionado(data: MapaWithConfig): void {
    fs.writeFileSync(this.CACHE_PATH, JSON.stringify(data, null, 2));
  }


  // 📤 Carga el mapa activo desde caché o el primero disponible
  static obtenerMapaActivo(): layoud | undefined {
    try {
      if (fs.existsSync(this.CACHE_PATH)) {
        const mapa = this.cargarMapaJson(this.CACHE_PATH);
        return mapa;
      } else {
        const disponibles = this.getMapasDisponibles();
        if (disponibles.length === 0) return undefined;

        const { nombre, path } = disponibles[0];
        const mapa = this.cargarMapaJson(path);
        this.guardarMapaSeleccionado(mapa); // guardar como predeterminado
        return mapa;
      }
    } catch (err) {
      console.error("❌ Error al cargar el mapa activo:", err);
      return undefined;
    }
  }
}