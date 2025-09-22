import { EventEmitter } from 'node:events'

export class Bus<E extends Record<string, unknown>> {
  private readonly ee = new EventEmitter()

  on<K extends keyof E>(ev: K, cb: (p: E[K]) => void): this {
    this.ee.on(ev as string, cb as any)
    return this
  }
  once<K extends keyof E>(ev: K, cb: (p: E[K]) => void): this {
    this.ee.once(ev as string, cb as any)
    return this
  }
  off<K extends keyof E>(ev: K, cb: (p: E[K]) => void): this {
    this.ee.off(ev as string, cb as any)
    return this
  }
  emit<K extends keyof E>(ev: K, payload: E[K]): boolean {
    return this.ee.emit(ev as string, payload as any)
  }

  // Si necesitas métodos “crudos”, puedes exponerlos:
  removeAllListeners(event?: keyof E | string | symbol): this {
    this.ee.removeAllListeners(event as any)
    return this
  }
}
