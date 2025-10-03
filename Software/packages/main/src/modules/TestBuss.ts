// modules/IngestModule.ts
import type { AppModule } from "../AppModule.js"
import type { ModuleContext } from "../ModuleContext.js"

export class IngestModule implements AppModule {
  enable(ctx: ModuleContext): void {
    setInterval(() => {
      const value = Math.random() * 100
      ctx.bus.emit("store:updated", { devId: value.toString() })
    }, 10)
  }
}



export class LoggerModule implements AppModule {
  enable(ctx: ModuleContext): void {
    ctx.bus.on("store:updated", ({ devId }) => {
      console.log(`[Logger] ${devId}`)
    })
  }
}

export function createIngestModule(
  ...args: ConstructorParameters<typeof IngestModule>
) {
  return new IngestModule(...args)
}

export function createLoggerModule(
  ...args: ConstructorParameters<typeof LoggerModule>
) {
  return new LoggerModule(...args)
}
