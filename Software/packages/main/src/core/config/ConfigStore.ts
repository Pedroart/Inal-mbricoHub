import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import {
  SensorType, Entry, ModbusServer, EntryModbus, EntryBle, DashboardWidget
} from '../../models/domain.js'
import { AppModule } from 'src/AppModule.js'
import { ModuleContext } from 'src/ModuleContext.js'
import {AppEvents} from '../../Events.js'
import {Bus} from '../../Buss.js'

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
  private readonly defaulName = 'activo'
  private activeName = this.defaulName
  private profile: ConfigProfile | null = null
  private bus?: Bus<AppEvents>;

  constructor(bus: Bus<AppEvents> ,activeName?: string) {
    if (activeName) this.activeName = activeName
    this.bus = bus
  }

  get activeProfileName() { return this.activeName }

  private profilePath(name = this.activeName) {
    return path.join(this.dir, `${name}.json`)
  }

  async load(): Promise<void> {
    await app.whenReady()
    await fs.mkdir(this.dir, { recursive: true })
    const file = this.profilePath()
    let raw: string

    const empty: ConfigProfile = {
      sensor_type: [],
      entry: [],
      modbus_server: [],
      entry_modbus: [],
      entry_ble: [],
      dashboard_widget: []
    }

    try {
      raw = await fs.readFile(file, 'utf8')
      if (!raw.trim()) raw = JSON.stringify(empty)
    } catch {
      // si no existe, crear perfil vacío
      await fs.writeFile(file, JSON.stringify(empty, null, 2), 'utf8')
      raw = JSON.stringify(empty)
    }
    console.log('Config user load: ',this.activeName )
    const json = JSON.parse(raw) as ConfigProfile
    this.profile = json
  }

  async save(): Promise<void> {
    if (!this.profile) throw new Error('No profile loaded')
    await fs.writeFile(this.profilePath(this.defaulName), JSON.stringify(this.profile, null, 2), 'utf8')
    console.log('File saved in: ', this.profilePath())
  }

  async saveAs(newName: string, overwrite: boolean = false): Promise<void> {
    if (!this.profile) throw new Error('No profile loaded')

    const newPath = this.profilePath(newName)

    try {
      // Verificar si existe
      await fs.access(newPath)
      if (!overwrite) {
        throw new Error(`Profile "${newName}" already exists`)
      }
    } catch {
      // si no existe, continúa normal
    }

    await fs.writeFile(newPath, JSON.stringify(this.profile, null, 2), 'utf8')

    // cambiar activo si quieres
    //this.activeName = newName
    console.log(`Profile saved as: ${newPath}`)
  }

  async removeProfile(name: string): Promise<void> {
    const file = this.profilePath(name)
    await fs.rm(file, { force: true })
    // si borras el activo, vuelve a default
    if (this.activeName === name) {
      this.activeName = this.defaulName
      await this.load()
    }
  }

  async switchActive(name: string): Promise<void> {
    this.activeName = name
    this.profile = null
    await this.load()
    await this.bus?.emit('config:changed', {profile: this.activeName})
  }

  getProfile(): ConfigProfile {
    if( !this.profile ) { throw new Error('No profile loaded') }
    return this.profile
  }

  async listProfile(): Promise<string[]> {
    await fs.mkdir(this.dir, {recursive: true})
    const files = await fs.readdir(this.dir)

    const profiles = files
      .filter(_file => _file.endsWith(".json"))
      .map(_file => path.basename(_file,".json"))

    return profiles
  }

  // ----- Entries  ----- 
  listEntries() { return this.getProfile().entry }
  upsertEntry(e: Entry) {
    const p = this.getProfile()
    const i = p.entry.findIndex( x => x.id === e.id )

    if (i >= 0 ) p.entry[i] = e; else p.entry.push(e)
  }
  removeEntry(id: string){
    const p = this.getProfile()
    p.entry = p.entry.filter(x => x.id !== id)

    p.entry_modbus = p.entry_modbus.filter(x => x.entry_id !== id)
    p.entry_ble = p.entry_ble.filter(x => x.entry_id !== id)

    p.dashboard_widget = p.dashboard_widget.filter( x => x.entry_id !== id )
  }

  // ---------- Sensor Types ----------
  listSensorTypes() { return this.getProfile().sensor_type }
  upsertSensorType(s: SensorType) {
    const p = this.getProfile()
    const i = p.sensor_type.findIndex(x => x.id === s.id)
    if (i >= 0) p.sensor_type[i] = s; else p.sensor_type.push(s)
  }
  removeSensorType(id: number) {
    const p = this.getProfile()
    p.sensor_type = p.sensor_type.filter(x => x.id !== id)
  }

  // ---------- Modbus Servers ----------
  listModbusServers() { return this.getProfile().modbus_server }
  upsertModbusServer(s: ModbusServer) {
    const p = this.getProfile()
    const i = p.modbus_server.findIndex(x => x.id === s.id)
    console.log(s)
    if (i >= 0) {
      // actualizar existente
      p.modbus_server[i] = s
    } else {
      // asignar nuevo id autoincremental
      const nextId =
        p.modbus_server.length > 0
          ? Math.max(...p.modbus_server.map(x => x.id)) + 1
          : 1
      s.id = nextId
      p.modbus_server.push(s)
    }
  }
  removeModbusServer(id: number) {
    const p = this.getProfile()
    p.modbus_server = p.modbus_server.filter(x => x.id !== id)
    // (opcional) limpiar entry_modbus que apunten a este server
    p.entry_modbus = p.entry_modbus.filter(x => x.server_id !== id)
  }

  // ---------- Dashboard ----------
  listWidgets() { return this.getProfile().dashboard_widget }
  upsertWidget(w: DashboardWidget) {
    const p = this.getProfile()
    const i = p.dashboard_widget.findIndex(x => x.entry_id === w.entry_id)
    if (i >= 0) p.dashboard_widget[i] = w; else p.dashboard_widget.push(w)
  }
  removeWidget(entry_id: string) {
    const p = this.getProfile()
    p.dashboard_widget = p.dashboard_widget.filter(x => x.entry_id !== entry_id)
  }

  // ---------- Bindings Modbus/BLE ----------
  listEntryModbus() { return this.getProfile().entry_modbus }
  getEntryModbus(entry_id: string) {
    return this.getProfile().entry_modbus.find(x => x.entry_id === entry_id)
  }
  setEntryModbus(b: EntryModbus) {
    const p = this.getProfile()
    const i = p.entry_modbus.findIndex(x => x.entry_id === b.entry_id)
    if (i >= 0) p.entry_modbus[i] = b; else p.entry_modbus.push(b)
  }
  removeEntryModbus(entry_id: string) {
    console.log('Delete entry Modbus: ',entry_id)
    const p = this.getProfile()
    p.entry_modbus = p.entry_modbus.filter(x => x.entry_id !== entry_id)
  }

  listEntryBle() { return this.getProfile().entry_ble }
  getEntryBle(entry_id: string) {
    return this.getProfile().entry_ble.find(x => x.entry_id === entry_id)
  }
  setEntryBle(b: EntryBle) {
    const p = this.getProfile()
    const i = p.entry_ble.findIndex(x => x.entry_id === b.entry_id)
    if (i >= 0) p.entry_ble[i] = b; else p.entry_ble.push(b)
  }
  removeEntryBle(entry_id: string) {
    const p = this.getProfile()
    p.entry_ble = p.entry_ble.filter(x => x.entry_id !== entry_id)
  }
}

export class ConfigModule implements AppModule {

  constructor(private activateName?: string) {}

  async enable(ctx: ModuleContext): Promise<void> {
    await ctx.app.whenReady()

    const cfg = new ConfigStore(ctx.bus,this.activateName)
    await cfg.load()

    ctx.services.set('config',cfg)
    ctx.bus.emit('config:loaded', {profile: cfg.activeProfileName} )

    cfg.save()
  }

}

export function loadConfigModule(){
  return new ConfigModule()
}