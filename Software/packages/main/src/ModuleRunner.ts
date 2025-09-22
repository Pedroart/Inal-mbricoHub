// ModuleRunner.ts
import { app } from 'electron'
import type { AppModule } from './AppModule.js'
import type { ModuleContext } from './ModuleContext.js'
import { Bus } from './Buss.js'          // <-- ojo: 'Bus', no 'Buss'
import { AppEvents } from './Events.js'  // asumiendo que exportas un tipo o interfaz

class ModuleRunner implements PromiseLike<void> {
  #promise: Promise<void> = Promise.resolve()

  // 👇 Un único contexto compartido por TODOS los módulos
  #ctx: ModuleContext

  constructor() {
    this.#ctx = {
      app,
      bus: new Bus<AppEvents>(),  // un solo bus para todos
      services: new Map(),
    }
  }

  then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.#promise.then(onfulfilled, onrejected)
  }

  init(module: AppModule) {
    // 👉 Todos los módulos reciben el MISMO ctx
    const p = module.enable(this.#ctx)

    if (p instanceof Promise) {
      this.#promise = this.#promise.then(() => p)
    }

    return this
  }
}

export function createModuleRunner() {
  return new ModuleRunner()
}
