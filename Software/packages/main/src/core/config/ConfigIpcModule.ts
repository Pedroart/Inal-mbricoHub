// modules/ConfigIpcModule.ts
import { BrowserWindow, ipcMain } from 'electron'
import type { AppModule } from '../../AppModule.js'
import type { ModuleContext } from '../../ModuleContext.js'
import { ConfigStore } from './ConfigStore.js'
import type {
  Entry, SensorType, ModbusServer, EntryModbus, EntryBle, DashboardWidget, ConfigProfile
} from '../../models/domain.js'

export class ConfigIpcModule implements AppModule {
  enable(ctx: ModuleContext): void {
    const cfg = () => {
      const i = ctx.services.get('config')
      if (!i) throw new Error('ConfigStore not ready')
      return i as ConfigStore
    }

    const notify = () => {
      const profile = cfg().activeProfileName
      for (const w of BrowserWindow.getAllWindows()) {
        w.webContents.send('config:changed', { profile })
        ctx.bus.emit('config:changed', { profile })
      }
    }

    // Perfil
    ipcMain.handle('config.profile.list', () => cfg().listProfile() )
    ipcMain.handle('config.profile.getName', () => cfg().activeProfileName)
    ipcMain.handle('config.profile.get', () => structuredClone(cfg().getProfile()))
    ipcMain.handle('config.profile.setActive', async (_e, name: string) => {
      await cfg().switchActive(name)
      notify()
      return true
    })
    ipcMain.handle('config.profile.save', async () => { await cfg().save(); notify(); return true })
    ipcMain.handle('config.profile.saveAs', async (_e, newName: string, overwrite) => { await cfg().saveAs(newName,overwrite); notify(); return true })
    ipcMain.handle('config.profile.remove', async (_e, name: string) => { await cfg().removeProfile(name); notify(); return } )

    ipcMain.handle('config.profile.saveProfileToFile', async (_e, profile: ConfigProfile ,fileName: string = "profile.json") => { await cfg().saveProfileToFile(profile, fileName); notify(); return true } )
    ipcMain.handle('config.profile.saveImageToProfile', async (_e, image: Uint8Array) => { cfg().saveImageToProfile(image); return true})
    ipcMain.handle("config.profile.getImagen", async () => { const img = cfg().getImagen(); return img ? Buffer.from(img) : null})

    // Entries
    ipcMain.handle('config.entries.list', () => cfg().listEntries())
    ipcMain.handle('config.entries.upsert', async (_e, e: Entry) => { cfg().upsertEntry(e); await cfg().save(); notify(); return true })
    ipcMain.handle('config.entries.remove', async (_e, id: number) => { cfg().removeEntry(id); await cfg().save(); notify(); return true })

    // Sensor types
    ipcMain.handle('config.sensorTypes.list', () => cfg().listSensorTypes())
    ipcMain.handle('config.sensorTypes.upsert', async (_e, s: SensorType) => { cfg().upsertSensorType(s); await cfg().save(); notify(); return true })
    ipcMain.handle('config.sensorTypes.remove', async (_e, id: number) => { cfg().removeSensorType(id); await cfg().save(); notify(); return true })

    // Modbus servers
    ipcMain.handle('config.modbus.servers.list', () => cfg().listModbusServers())
    ipcMain.handle('config.modbus.servers.upsert', async (_e, s: ModbusServer) => { cfg().upsertModbusServer(s); await cfg().save(); notify(); return true })
    ipcMain.handle('config.modbus.servers.remove', async (_e, id: number) => { cfg().removeModbusServer(id); await cfg().save(); notify(); return true })

    // Bindings
    ipcMain.handle('config.bind.modbus.get', (_e, entryId: number) => cfg().getEntryModbus(entryId))
    ipcMain.handle('config.bind.modbus.set',  async (_e, b: EntryModbus) => { cfg().setEntryModbus(b); await cfg().save(); notify(); return true })
    ipcMain.handle('config.bind.modbus.remove', async (_e, entryId: number) => { cfg().removeEntryModbus(entryId); await cfg().save(); notify(); return true })

    ipcMain.handle('config.bind.ble.get', (_e, entryId: number) => cfg().getEntryBle(entryId))
    ipcMain.handle('config.bind.ble.set',  async (_e, b: EntryBle) => { cfg().setEntryBle(b); await cfg().save(); notify(); return true })
    ipcMain.handle('config.bind.ble.remove', async (_e, entryId: number) => { cfg().removeEntryBle(entryId); await cfg().save(); notify(); return true })

    // Dashboard
    ipcMain.handle('config.widgets.list', () => cfg().listWidgets())
    ipcMain.handle('config.widgets.upsert', async (_e, w: DashboardWidget) => { cfg().upsertWidget(w); await cfg().save(); notify(); return true })
    ipcMain.handle('config.widgets.remove', async (_e, entryId: number) => { cfg().removeWidget(entryId); await cfg().save(); notify(); return true })


  }
}

export const createConfigIpcModule = () => new ConfigIpcModule()
