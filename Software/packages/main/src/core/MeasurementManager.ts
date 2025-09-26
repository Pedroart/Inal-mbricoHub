import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import { ConfigStore } from "./config/ConfigStore.js";
import { Entry, Measurement } from "../models/domain.js";
import { app, ipcMain } from "electron";
import path from "path";
import Database from "better-sqlite3";
import { evaluate } from "mathjs"

export class MeasurementManager implements AppModule {
    private entries: Entry[] = []
    private latestValues = new Map<number, Measurement>() // entry_id → último valor
    private db: Database.Database;

    constructor() {
        const dbPath = path.join(app.getPath("userData"), "data.db");
        this.db = new Database(dbPath);
        
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS measurement (
                ts INTEGER NOT NULL,
                entry_id INTEGER NOT NULL,
                value REAL NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_measurement_entry_ts 
                ON measurement(entry_id, ts);
        `);
    }

    async enable(ctx: ModuleContext): Promise<void> {
        await ctx.bus.waitFor("config:loaded")
        const cfg = ctx.services.get("config") as ConfigStore

        // 1. cargar entries iniciales
        this.entries = cfg.listEntries()

        // 2. actualiza entries
        ctx.bus.on("config:changed", () => {
            this.entries = cfg.listEntries()
            console.log("[INFO] MeasurementManager: entries actualizados")

            // 🔹 limpiar latestValues de entradas que ya no existen
            const validIds = new Set(this.entries.map(e => e.id))
            for (const key of this.latestValues.keys()) {
                if (!validIds.has(key)) {
                this.latestValues.delete(key)
                console.log(`[INFO] MeasurementManager: eliminado valor de entry_id=${key} porque ya no existe en config`)
                }
            }

            // 🔹 opcional: inicializar entradas nuevas con valor "vacío"
            for (const e of this.entries) {
                if (!this.latestValues.has(e.id)) {
                this.latestValues.set(e.id, {
                    ts: Date.now(),
                    entry_id: e.id,
                    value: NaN   // o 0, según prefieras
                })
                }
            }
        })


        // 3. escuchar bloque de mediciones nuevas
        ctx.bus.on("measurement:new", ({ batch }) => {
            this.handleBatch(batch)
        })

        // 4. exponer vía ipcMain
        ipcMain.handle("measurements:get-latest", () => {
        return Array.from(this.latestValues.values())
        })

        ipcMain.handle("measurements:get-by-entry", (_ev, entry_id: number) => {
        return this.latestValues.get(entry_id)
        })

        ipcMain.handle("measurements:get-history", (_ev, entry_id: number, since: number) => {
        const stmt = this.db.prepare(`
            SELECT ts, entry_id, value
            FROM measurement
            WHERE entry_id = ? AND ts >= ?
            ORDER BY ts ASC
        `);

        // usamos "as Row[]" para decirle a TS la forma de cada fila
        const rows = stmt.all(entry_id, since) as Measurement[];

        return rows.map(row => ({
            ts: row.ts,
            entry_id: row.entry_id,
            value: row.value
        })) as Measurement[];
        });


    }

    private handleBatch(batch: Measurement[]) {
        const insertStmt = this.db.prepare(`
            INSERT INTO measurement (ts, entry_id, value) VALUES (?, ?, ?)
        `);

        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 días atrás

        const deleteOldStmt = this.db.prepare(`
            DELETE FROM measurement WHERE ts < ?
        `);

        const transaction = this.db.transaction((batch: Measurement[]) => {
        for (const m of batch) {
            const entry = this.entries.find(e => e.id === m.entry_id);
            if (!entry) continue;

            let val = m.value;
            try {
            if (entry.operation && entry.operation.trim() !== "") {
                val = evaluate(`${val} ${entry.operation}`)
            }
            } catch (err) {
            console.error(`[ERROR] Eval operación entry_id=${entry.id}:`, err);
            }

            const processed: Measurement = { ts: Date.now(), entry_id: entry.id, value: val };
            this.latestValues.set(entry.id, processed);

            insertStmt.run(processed.ts, processed.entry_id, processed.value);
        }

        // limpieza de datos viejos
        deleteOldStmt.run(cutoff);
        });

        transaction(batch);
        console.log(`[DATA] Procesados ${batch.length} measurements`);
    }
}

export function measurementManager() {
  return new MeasurementManager()
}
