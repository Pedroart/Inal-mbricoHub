import { resolve } from 'path';
import {AppModule} from '../../AppModule.js';
import {ModuleContext} from '../../ModuleContext.js';
import {ConfigStore} from '../config/ConfigStore.js';
import { EntryModbus, EntryBle, Entry, ModbusServer, Measurement } from '../../models/domain.js';
import Module from 'module';
import SerialPort from "serialport"

import net from "net"
import Modbus from "jsmodbus"

export type ModbusBilding = {
  server: ModbusServer
  groups: {
    frecuency_s: number
    entries: EntryModbus[]
  }[]
}

type ActiveTask = {
  stop: () => void
}

export class ModbusRunner implements AppModule {
  private bildings: ModbusBilding[] = []
  private tasks: ActiveTask[] = []

  async enable(ctx: ModuleContext): Promise<void> {
    await ctx.bus.waitFor("config:loaded")
    const cfg = ctx.services.get("config") as ConfigStore

    // primera construcción + arranque
    this.buildBildings(cfg)
    this.startTasks(ctx)

    // rearmar todo en cada cambio
    ctx.bus.on("config:changed", () => {
      this.buildBildings(cfg)
      this.startTasks(ctx)
    })
  }

  /** Construye los bildings a partir de la config */
  private buildBildings(cfg: ConfigStore) {
    const entryData = cfg.listEntries()
    const entriesModbus = cfg.listEntryModbus()
    const serversModbus = cfg.listModbusServers()

    this.bildings = serversModbus.map((server) => {
      const entriesForServer = entriesModbus
        .filter((em) => em.server_id === server.id)
        .map((em) => {
          const entry = entryData.find((e: Entry) => e.id === em.entry_id)
          return {
            ...em,
            frecuency_s: entry?.frecuency_s ?? 1,
          }
        })

      // agrupar por frecuencia
      const groupsMap = new Map<number, EntryModbus[]>()
      for (const e of entriesForServer) {
        const freq = e.frecuency_s
        if (!groupsMap.has(freq)) groupsMap.set(freq, [])
        groupsMap.get(freq)!.push(e)
      }

      const groups = Array.from(groupsMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([frecuency_s, entries]) => ({ frecuency_s, entries }))

      return { server, groups }
    })

    console.log(
      "Bildings for Modbus:",
      JSON.stringify(this.bildings, null, 2)
    )
  }

  /** Arranca las tareas de polling para cada building */
  private startTasks(ctx: ModuleContext) {
    // detener tareas previas
    this.tasks.forEach((t) => t.stop())
    this.tasks = []

    for (const b of this.bildings) {
      if (b.groups.length === 0) continue

      if (b.server.type === "TCP") {
        this.tasks.push(this.startTcpServerTask(ctx, b))
      } else if (b.server.type === "RTU") {
        this.tasks.push(this.startRtuServerTask(ctx, b))
      } else {
        console.warn("Tipo de server desconocido:", b.server.type)
      }
    }
  }

  private startTcpServerTask(ctx: ModuleContext, b: ModbusBilding): ActiveTask {
    const socket = new net.Socket()
    const client = new Modbus.client.TCP(socket, b.server.unitId ?? 1)

    let intervals: NodeJS.Timeout[] = []
    let reconnectTimer: NodeJS.Timeout | null = null
    let stopped = false

    const cleanup = () => {
      for (const intv of intervals) clearInterval(intv)
      intervals = []
      socket.destroy()
    }

    const scheduleReconnect = () => {
      if (stopped) return
      if (reconnectTimer) return // ya hay un timer programado

      console.warn(`[WARN] Reintentando conexión a ${b.server.ip}:${b.server.port} en 5s...`)
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        if (!stopped) {
          this.startTcpServerTask(ctx, b) // 🔄 vuelve a lanzar la tarea
        }
      }, 5000)
    }

    // Validar host/port
    if (!b.server.ip || !b.server.port || b.server.ip === "0.0.0.0") {
      console.warn(`[WARN] Servidor Modbus inválido: ip=${b.server.ip}, port=${b.server.port}`)
      return { stop: () => socket.destroy() }
    }

    // Manejo de errores/conexión
    socket.on("error", (err) => {
      console.error(`[ERROR] Socket Modbus ${b.server.ip}:${b.server.port} → ${err.message}`)
      cleanup()
      scheduleReconnect()
    })
    socket.on("close", () => {
      console.warn(`[WARN] Conexión cerrada: ${b.server.ip}:${b.server.port}`)
      cleanup()
      scheduleReconnect()
    })
    socket.on("timeout", () => {
      console.warn(`[WARN] Timeout de conexión: ${b.server.ip}:${b.server.port}`)
      cleanup()
      scheduleReconnect()
    })

    try {
      socket.connect({ host: b.server.ip, port: b.server.port }, () => {
        console.log(`[INFO] Conectado a Modbus ${b.server.ip}:${b.server.port}`)

        // Solo arrancar polling cuando conecte
        for (const group of b.groups) {
          const addresses = group.entries.map(e => e.address)
          if (!addresses.length) continue

          const minAddr = Math.min(...addresses)
          const maxAddr = Math.max(...addresses)
          const count = maxAddr - minAddr + 1

          const intv = setInterval(async () => {
            try {
              const resp = await client.readHoldingRegisters(minAddr, count)
              const values = resp.response.body.valuesAsArray

              const measurements: Measurement[] = group.entries.map(e => {
                const index = e.address - minAddr
                return {
                  ts: Date.now(),
                  entry_id: e.entry_id,
                  value: values[index],
                }
              })

              console.log(`[DATA] ${b.server.ip}:${b.server.port} →`, measurements)
              ctx.bus.emit("measurement:new", { batch: measurements })
            } catch (err) {
              console.error(`[ERROR] Lectura Modbus ${b.server.ip}:${b.server.port} → ${(err as Error).message}`)
            }
          }, group.frecuency_s * 1000)

          intervals.push(intv)
        }
      })
    } catch (e) {
      console.error(`[ERROR] Falló connect() → ${(e as Error).message}`)
      scheduleReconnect()
    }

    // Retornar task activo con cleanup y stop
    return {
      stop: () => {
        stopped = true
        if (reconnectTimer) clearTimeout(reconnectTimer)
        cleanup()
        console.log(`[INFO] Task Modbus detenido para ${b.server.ip}:${b.server.port}`)
      }
    }
  }

  
  private startRtuServerTask(ctx: ModuleContext, b: ModbusBilding): ActiveTask {
    // TODO: implementar lectura agrupada RTU
    return { stop: () => {} }
  }
}

export function runnerModbus() {
    return new ModbusRunner()
}