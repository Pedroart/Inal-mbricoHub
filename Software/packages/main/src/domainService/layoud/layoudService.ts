import fs from "fs";
import path from "path";
import { app } from "electron";
import { MapaWithConfig } from "../../models/Mapa.js";
import { layoudItem, layoud } from "./layoudModel.js";

export class layoudManager {
  private static readonly CACHE_PATH = path.join(app.getPath("userData"), "confMap.json");

  private static readonly basePaths = [
    path.join(app.getPath('userData'), 'layouds'),
    path.join(app.isPackaged
      ? path.join(process.resourcesPath, 'mapas')
      : path.join(process.cwd(), 'buildResources', 'mapas')
    )
  ];

  static getMapasDisponibles(): layoudItem[] {
    const lista: layoudItem[] = [];

    console.log("🔍 Buscando mapas disponibles en:", this.basePaths);

    for (const basePath of this.basePaths) {
      if (!fs.existsSync(basePath)) {
        console.warn("📁 Ruta base no existe:", basePath);
        continue;
      }

      const carpetas = fs.readdirSync(basePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());

      for (const carpeta of carpetas) {
        const nombre = carpeta.name;
        const rutaJson = path.join(basePath, nombre, "index.json");

        console.log("🧩 Posible mapa:", rutaJson);

        if (fs.existsSync(rutaJson)) {
          lista.push({ nombre, path: rutaJson });
        } else {
          console.warn("⚠️ No se encontró index.json en:", rutaJson);
        }
      }
    }

    console.log("✅ Mapas encontrados:", lista.map(m => m.nombre));
    return lista;
  }

  static cargarMapaJson(ruta: string): MapaWithConfig {
    console.log("📥 Cargando JSON del mapa:", ruta);
    const raw = fs.readFileSync(ruta, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed as MapaWithConfig;
  }

  static seleccionarMapaDesdeLayoudItem(item: layoudItem): void {
    console.log("📌 Seleccionando mapa desde layoudItem:", item);

    if (!fs.existsSync(item.path)) {
      console.error("❌ No existe la ruta del JSON:", item.path);
      return;
    }

    const mapa = this.cargarMapaJson(item.path);
    this.guardarMapaSeleccionado(mapa);
  }


  static guardarMapaSeleccionado(data: MapaWithConfig): void {
    console.log("💾 Guardando mapa seleccionado en caché:", this.CACHE_PATH);
    console.log("💾 Guardando mapa seleccionado en caché:", data);
    fs.writeFileSync(this.CACHE_PATH, JSON.stringify(data, null, 2));
  }

  static obtenerMapaActivo(): layoud | undefined {
    try {
      console.log("📤 Obteniendo mapa activo...");

      if (fs.existsSync(this.CACHE_PATH)) {
        console.log("✅ Caché encontrada:", this.CACHE_PATH);
        const mapa = this.cargarMapaJson(this.CACHE_PATH);
        return mapa;
      } else {
        console.warn("⚠️ Caché no encontrada, buscando primer mapa disponible...");
        const disponibles = this.getMapasDisponibles();
        if (disponibles.length === 0) {
          console.error("❌ No hay mapas disponibles");
          return undefined;
        }

        const { nombre, path: ruta } = disponibles[0];
        console.log("📌 Usando primer mapa disponible:", nombre);
        const mapa = this.cargarMapaJson(ruta);
        this.guardarMapaSeleccionado(mapa);
        return mapa;
      }
    } catch (err) {
      console.error("❌ Error al cargar el mapa activo:", err);
      return undefined;
    }
  }

  static getLayoudImagePath(): string | undefined {
    console.log("🖼️ Buscando imagen del layoud...");
    const mapa = this.obtenerMapaActivo();
    if (!mapa || !mapa.layoud) {
      console.warn("⚠️ Mapa activo no definido o sin campo 'layoud'");
      return undefined;
    }

    for (const basePath of this.basePaths) {
      const posibleRuta = path.join(basePath, mapa.layoud);
      console.log("🔎 Verificando existencia de:", posibleRuta);

      if (fs.existsSync(posibleRuta)) {
        console.log("✅ Imagen encontrada en:", posibleRuta);
        return posibleRuta;
      }
    }

    console.warn("⚠️ Imagen del layoud no encontrada en ningún path");
    return undefined;
  }

  static getLayoudImageDataUrl(): string | undefined {
    console.log("📸 Generando dataURL de la imagen...");
    const mapa = this.obtenerMapaActivo();
    if (!mapa || !mapa.layoud) {
      console.warn("⚠️ Mapa activo no definido o sin imagen");
      return undefined;
    }

    for (const basePath of this.basePaths) {
      const posibleRuta = path.join(basePath, mapa.layoud);
      console.log("🔎 Verificando:", posibleRuta);

      if (fs.existsSync(posibleRuta)) {
        console.log("✅ Leyendo imagen para base64:", posibleRuta);
        const ext = path.extname(posibleRuta).toLowerCase().slice(1);
        const mime = ext === 'jpg' ? 'jpeg' : ext;
        const buffer = fs.readFileSync(posibleRuta);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:image/${mime};base64,${base64}`;
        return dataUrl;
      }
    }

    console.warn("⚠️ Imagen no encontrada en rutas configuradas");
    return undefined;
  }
}
