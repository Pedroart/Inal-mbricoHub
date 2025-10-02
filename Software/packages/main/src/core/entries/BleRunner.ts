import WebSocket from "ws";
import { AppModule } from "../../AppModule.js";
import { ModuleContext } from "../../ModuleContext.js";
import { ConfigStore } from "../config/ConfigStore.js";
import { BleDeviceEvent, EntryBle, EntryBleType, Measurement } from "../../models/domain.js";

type ActiveTask = {
  stop: () => void;
};

export class BleRunner implements AppModule {
  private bildings: EntryBle[] = [];
  private ws: WebSocket | null = null;
  private stopped = false;
  private tasks: ActiveTask[] = [];

  async enable(ctx: ModuleContext): Promise<void> {
    await ctx.bus.waitFor("config:loaded");
    const cfg = ctx.services.get("config") as ConfigStore;

    this.buildBildings(cfg);
    this.startTask(ctx);

    // rearmar en cada cambio
    ctx.bus.on("config:changed", () => {
      this.buildBildings(cfg);
    });
  }

  /** Construye los bildings (mapa MAC -> entry_id) */
  private buildBildings(cfg: ConfigStore) {
    const entriesBle: EntryBle[] = cfg.listEntryBle();
    this.bildings = entriesBle.map((e) => ({
      entry_id: e.entry_id,
      device_id: e.device_id.toUpperCase(), // MAC normalizada
      _type: e._type
    }));
    console.log("[INFO] Bildings BLE:", this.bildings);
  }

  /** Arranca la tarea de conexión al WS BLE */
  private startTask(ctx: ModuleContext) {
    const url = "ws://127.0.0.1:8765"; // ⚠️ Ajustar a tu bus BLE real
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      console.log(`[INFO] Conectado a BLE WS en ${url}`);
      this.ws?.send(JSON.stringify({ type: "get_devices" }));
    });

    this.ws.on("message", (raw) => {
      try {
        const msg: BleDeviceEvent = JSON.parse(raw.toString());
        console.log(msg)
        if (msg.type === "event" && msg.event === "adv" && msg.address) {
            

            const entryBAT = this.findEntryForDevice(msg.address,"BAT");
            const entryTEM = this.findEntryForDevice(msg.address,"TEM");

            if (!entryBAT && !entryTEM) return; // no está mapeado en config
            
            const batch: Measurement[] = [];

            if (entryTEM) {
                batch.push({
                ts: msg.ts ?? Date.now(),
                entry_id: entryTEM.entry_id,
                value: msg.temp_c ?? 0,
                });
            }

            if (entryBAT) {
                batch.push({
                ts: msg.ts ?? Date.now(),
                entry_id: entryBAT.entry_id,
                value: msg.bat_pct ?? 0,
                });
            }

            ctx.bus.emit("measurement:new", { batch });
        }

        if (msg.type === "devices") {
          console.log("[BLE] Snapshot recibido:", Object.keys(msg.data || {}).length, "dispositivos");
        }
      } catch (e) {
        console.error("[BLE] Mensaje inválido:", e);
      }
    });

    this.ws.on("close", () => {
      console.warn("[WARN] BLE WS desconectado");
      if (!this.stopped) {
        setTimeout(() => this.startTask(ctx), 5000); // reconectar
      }
    });

    this.ws.on("error", (err) => {
      console.error("[ERROR] BLE WS →", err);
    });

    this.tasks.push({
      stop: () => {
        this.stopped = true;
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }
        console.log("[INFO] Task BLE detenido");
      },
    });
  }

  /** Busca un entry_id a partir de la MAC */
  private findEntryForDevice(mac: string, _type: EntryBleType ): EntryBle | undefined {
    const normalized = mac.toUpperCase();
    return this.bildings.find((b) => b.device_id === normalized && b._type === _type);
  }
}

// Factory
export function runnerBle() {
  return new BleRunner();
}
