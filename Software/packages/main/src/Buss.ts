import { rejects } from 'node:assert'
import { EventEmitter } from 'node:events'
import { resolve } from 'node:path'

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

  waitFor<K extends keyof E>(ev: K, timeoutMs = 0): Promise<E[K]> {
    return new Promise<E[K]>( (resolve,rejects) => {
      const handler = (payload: E[K]) => {
        cleanup()
        resolve(payload)
      }

      const cleanup = () => {
        this.ee.off(ev as string, handler as any)
        if (timer) clearTimeout(timer)
      }
      this.ee.once(ev as string, handler as any)

      let timer: NodeJS.Timeout | undefined
      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          cleanup()
          rejects(new Error(`Timeout waiting for event "${String(ev)}"`))
        },timeoutMs)
      }
    })
  }

  // Si necesitas métodos “crudos”, puedes exponerlos:
  removeAllListeners(event?: keyof E | string | symbol): this {
    this.ee.removeAllListeners(event as any)
    return this
  }
}
