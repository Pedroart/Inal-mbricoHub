import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import {
  SensorType, Entry, ModbusServer, EntryModbus, EntryBle, DashboardWidget
} from '../models/domain.js'

export type ConfigProfile = {
  sensor_type: SensorType[]
  entry: Entry[]
  modbus_server: ModbusServer[]
  entry_modbus: EntryModbus[]
  entry_ble: EntryBle[]
  dashboard_widget: DashboardWidget[]
}

export class ConfigStore {
  private dir = path.join(app.getPath('userData'), 'configs')
  private activeName = 'default'
  private profile: ConfigProfile | null = null

  constructor(activeName?: string) {
    if (activeName) this.activeName = activeName
  }

  get activeProfileName() { return this.activeName }

  private profilePath(name = this.activeName) {
    return path.join(this.dir, `${name}.json`)
  }

  async load(): Promise<void> {
    await fs.mkdir(this.dir, { recursive: true })
    const file = this.profilePath()
    let raw: string
    try {
      raw = await fs.readFile(file, 'utf8')
    } catch {
      // si no existe, crear perfil vacío
      const empty: ConfigProfile = {
        sensor_type: [],
        entry: [],
        modbus_server: [],
        entry_modbus: [],
        entry_ble: [],
        dashboard_widget: []
      }
      await fs.writeFile(file, JSON.stringify(empty, null, 2), 'utf8')
      raw = JSON.stringify(empty)
    }
    const json = JSON.parse(raw) as ConfigProfile
    this.profile = json
  }

  async save(): Promise<void> {
    if (!this.profile) throw new Error('No profile loaded')
    await fs.writeFile(this.profilePath(), JSON.stringify(this.profile, null, 2), 'utf8')
  }

  async switchActive(name: string): Promise<void> {
    this.activeName = name
    this.profile = null
    await this.load()
  }

}
