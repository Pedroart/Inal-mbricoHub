class Ring<T> {
  private buf: T[] = []
  constructor(public max = 2000) {}
  pushMany(x: T[]) { this.buf.push(...x); const over = this.buf.length - this.max; if (over > 0) this.buf.splice(0, over) }
  push(x: T) { this.pushMany([x]) }
  latest(n = 100) { return n >= this.buf.length ? [...this.buf] : this.buf.slice(-n) }
  size() { return this.buf.length }
}

export class SeriesStore<K extends string | number, T> {
  private map = new Map<K, Ring<T>>()
  constructor(private maxPerKey = 2000) {}
  private ring(k: K) { let r = this.map.get(k); if (!r) { r = new Ring<T>(this.maxPerKey); this.map.set(k, r) } return r }
  push(k: K, item: T) { this.ring(k).push(item) }
  pushBatch(k: K, items: T[]) { this.ring(k).pushMany(items) }
  latest(k: K, n = 100) { return this.ring(k).latest(n) }
  stats() { let total = 0; for (const r of this.map.values()) total += r.size(); return { keys: this.map.size, points: total } }
}


/* Example USED


// core/EventStore.ts (eventos)
export type EventRow = { ts: number; kind: 'ALARM' | 'INFO' | 'WARN'; msg: string; entry_id?: string }
export class EventStore extends SeriesStore<'global' | string, EventRow> {
  constructor() { super(2000) }
}

// core/StateStore.ts (estado actual)
export type DeviceState = { ts: number; status: 'up' | 'down'; lastValue?: number; meta?: any }
export class StateStore {
  private map = new Map<string, DeviceState>()
  set(id: string, state: DeviceState) { this.map.set(id, state) }
  get(id: string) { return this.map.get(id) }
  all() { return [...this.map.entries()] }
}

*/