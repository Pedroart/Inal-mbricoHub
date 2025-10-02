import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import { ConfigStore } from "./config/ConfigStore.js";
import { Entry, Measurement } from "../models/domain.js";
import { app, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import Loki from 'lokijs';
import type { Collection } from 'lokijs';
import { evaluate } from "mathjs";

export class MeasurementManager implements AppModule {
  private entries: Entry[] = [];
  private latestValues = new Map<number, Measurement>(); // entry_id → último valor
  private db!: Loki;
  private coll!: Collection<Measurement>;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(app.getPath("userData"), "measurements.db.json");
  }

  private async initDb() {
    // Asegura carpeta de userData
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Loki en Node: soporte de autosave/autoload
    this.db = new Loki(this.dbPath, {
      autoload: true,
      autoloadCallback: () => {
        // Obtener o crear la colección con índices
        this.coll = this.db.getCollection<Measurement>("measurement")
          || this.db.addCollection<Measurement>("measurement", {
               indices: ["entry_id", "ts"], // índices por campo (rápido para nuestros filtros)
             });
      },
      autosave: true,
      autosaveInterval: 20_000, // 20s; ajusta si quieres
    });

    // Si no usas autoloadCallback, puedes llamar db.loadDatabase y luego crear la colección.
  }

  async enable(ctx: ModuleContext): Promise<void> {
    await this.initDb();

    await ctx.bus.waitFor("config:loaded");
    const cfg = ctx.services.get("config") as ConfigStore;

    // 1) cargar entries iniciales
    this.entries = cfg.listEntries();

    // 2) mantener latestValues consistente con entries
    const rehydrateLatest = () => {
      const validIds = new Set(this.entries.map((e) => e.id));

      // eliminar latestValues de entries inexistentes
      for (const key of this.latestValues.keys()) {
        if (!validIds.has(key)) this.latestValues.delete(key);
      }
      // asegurar placeholder para nuevas entries
      for (const e of this.entries) {
        if (!this.latestValues.has(e.id)) {
          this.latestValues.set(e.id, {
            ts: Date.now(),
            entry_id: e.id,
            value: Number.NaN,
          });
        }
      }
    };
    rehydrateLatest();

    ctx.bus.on("config:changed", () => {
      this.entries = cfg.listEntries();
      rehydrateLatest();
      console.log("[INFO] MeasurementManager: entries actualizados");
    });

    // 3) escuchar bloque de mediciones nuevas
    ctx.bus.on("measurement:new", ({ batch }) => {
      this.handleBatch(batch);
    });

    // 4) exponer vía ipcMain
    ipcMain.handle("measurements:get-latest", () => {
      return Array.from(this.latestValues.values());
    });

    ipcMain.handle("measurements:get-by-entry", (_ev, entryId: number) => {
      return this.latestValues.get(entryId);
    });

    ipcMain.handle("measurements:get-history", (_ev, entryId: number, since: number) => {
      // Query tipo “mongo-like” + sort por ts
      const rows = this.coll
        .chain()
        .find({ entry_id: entryId, ts: { $gte: since } })
        .simplesort("ts")
        .data();
      return rows;
    });
  }

  private handleBatch(batch: Measurement[]) {
    // Ventana de retención de 24h
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    // Inserción rápida in-memory; Loki guardará en disco por autosave
    for (const m of batch) {
      const entry = this.entries.find((e) => e.id === m.entry_id);
      if (!entry) continue;

      let val = m.value;
      try {
        if (entry.operation && entry.operation.trim() !== "") {
          // misma semántica que antes (mathjs)
          val = evaluate(`${val} ${entry.operation}`);
        }
      } catch (err) {
        console.error(`[ERROR] Eval operación entry_id=${entry?.id}:`, err);
      }

      const processed: Measurement = {
        ts: Date.now(),
        entry_id: entry.id,
        value: val,
      };

      // Actualiza último valor
      this.latestValues.set(entry.id, processed);

      // Inserta en Loki
      this.coll.insert(processed);
    }

    // Limpieza (retención 24h): elimina docs con ts < cutoff
    // Preferible usar findAndRemove para consulta estilo mongo
    this.coll.findAndRemove({ ts: { $lt: cutoff } }); // limpia ventana móvil
    this.db.saveDatabase(); // no estrictamente necesario si autosave está activo, pero asegura flush inmediato

    console.log(`[DATA] Procesados ${batch.length} measurements`);
  }
}

export function measurementManager() {
  return new MeasurementManager();
}
