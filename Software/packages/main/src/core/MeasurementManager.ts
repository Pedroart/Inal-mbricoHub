import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import { ConfigStore } from "./config/ConfigStore.js";
import { Entry, Measurement } from "../models/domain.js";
import { app, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import initSqlJs, { Database } from "sql.js";
import { evaluate } from "mathjs";

export class MeasurementManager implements AppModule {
  private entries: Entry[] = [];
  private latestValues = new Map<number, Measurement>(); // entry_id → último valor
  private db!: Database;
  private dbPath: string;
  private SQL: any;

  constructor() {
    this.dbPath = path.join(app.getPath("userData"), "data.db");
  }

  async initDb() {
    this.SQL = await initSqlJs({
      locateFile: (file) => path.join("node_modules/sql.js/dist", file),
    });

    if (fs.existsSync(this.dbPath)) {
      const fileBuffer = fs.readFileSync(this.dbPath);
      this.db = new this.SQL.Database(fileBuffer);
    } else {
      this.db = new this.SQL.Database();
    }

    this.db.run(`
      CREATE TABLE IF NOT EXISTS measurement (
        ts INTEGER NOT NULL,
        entry_id INTEGER NOT NULL,
        value REAL NOT NULL
      );
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_measurement_entry_ts 
        ON measurement(entry_id, ts);
    `);

    this.saveDb();
  }

  private saveDb() {
    const data = this.db.export();
    fs.writeFileSync(this.dbPath, Buffer.from(data));
  }

  async enable(ctx: ModuleContext): Promise<void> {
    await this.initDb();
    await ctx.bus.waitFor("config:loaded");
    const cfg = ctx.services.get("config") as ConfigStore;

    // 1. cargar entries iniciales
    this.entries = cfg.listEntries();

    // 2. actualiza entries
    ctx.bus.on("config:changed", () => {
      this.entries = cfg.listEntries();
      console.log("[INFO] MeasurementManager: entries actualizados");

      const validIds = new Set(this.entries.map((e) => e.id));
      for (const key of this.latestValues.keys()) {
        if (!validIds.has(key)) {
          this.latestValues.delete(key);
          console.log(`[INFO] MeasurementManager: eliminado valor de entry_id=${key}`);
        }
      }

      for (const e of this.entries) {
        if (!this.latestValues.has(e.id)) {
          this.latestValues.set(e.id, {
            ts: Date.now(),
            entry_id: e.id,
            value: NaN,
          });
        }
      }
    });

    // 3. escuchar bloque de mediciones nuevas
    ctx.bus.on("measurement:new", ({ batch }) => {
      this.handleBatch(batch);
    });

    // 4. exponer vía ipcMain
    ipcMain.handle("measurements:get-latest", () => {
      return Array.from(this.latestValues.values());
    });

    ipcMain.handle("measurements:get-by-entry", (_ev, entryId: number) => {
      return this.latestValues.get(entryId);
    });

    ipcMain.handle("measurements:get-history", (_ev, entryId: number, since: number) => {
      const stmt = this.db.prepare(`
        SELECT ts, entry_id, value
        FROM measurement
        WHERE entry_id = ? AND ts >= ?
        ORDER BY ts ASC
      `);
      const rows: Measurement[] = [];
      stmt.bind([entryId, since]);
      while (stmt.step()) {
        const row = stmt.getAsObject() as any;
        rows.push({
          ts: row.ts,
          entry_id: row.entry_id,
          value: row.value,
        });
      }
      stmt.free();
      return rows;
    });
  }

  private handleBatch(batch: Measurement[]) {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 días atrás

    this.db.run("BEGIN TRANSACTION");
    for (const m of batch) {
      const entry = this.entries.find((e) => e.id === m.entry_id);
      if (!entry) continue;

      let val = m.value;
      try {
        if (entry.operation && entry.operation.trim() !== "") {
          val = evaluate(`${val} ${entry.operation}`);
        }
      } catch (err) {
        console.error(`[ERROR] Eval operación entry_id=${entry.id}:`, err);
      }

      const processed: Measurement = { ts: Date.now(), entry_id: entry.id, value: val };
      this.latestValues.set(entry.id, processed);

      this.db.run("INSERT INTO measurement (ts, entry_id, value) VALUES (?, ?, ?)", [
        processed.ts,
        processed.entry_id,
        processed.value,
      ]);
    }

    // limpieza de datos viejos
    this.db.run("DELETE FROM measurement WHERE ts < ?", [cutoff]);
    this.db.run("COMMIT");

    this.saveDb();
    console.log(`[DATA] Procesados ${batch.length} measurements`);
  }
}

export function measurementManager() {
  return new MeasurementManager();
}
