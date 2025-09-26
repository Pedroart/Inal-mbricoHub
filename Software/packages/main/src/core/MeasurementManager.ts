import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import { ConfigStore } from "./config/ConfigStore.js";
import { Entry, Measurement } from "../models/domain.js";
import { ipcMain } from "electron";

export class MeasurementManager implements AppModule {
  private entries: Entry[] = []
  private latestValues = new Map<number, Measurement>() // entry_id → último valor

  async enable(ctx: ModuleContext): Promise<void> {
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
  }

  private handleBatch(batch: Measurement[]) {
    for (const m of batch) {
      const entry = this.entries.find(e => e.id === m.entry_id)
      if (!entry) continue

      let val = m.value
      try {
        if (entry.operation && entry.operation.trim() !== "") {
          // ⚠️ cuidado con eval, valida antes si es confiable
          val = eval(`${val} ${entry.operation}`)
        }
      } catch (err) {
        console.error(`[ERROR] Eval operación entry_id=${entry.id}:`, err)
      }

      // guardar último valor
      const processed: Measurement = { ts: Date.now(), entry_id: entry.id, value: val }
      this.latestValues.set(entry.id, processed)
    }

    console.log(`[DATA] Procesados ${batch.length} measurements`)
  }
}

export function measurementManager() {
  return new MeasurementManager()
}
