import { resolve } from 'path';
import {AppModule} from '../../AppModule.js';
import {ModuleContext} from '../../ModuleContext.js';
import {ConfigStore} from '../config/ConfigStore.js';
import { EntryModbus, EntryBle, Entry, ModbusServer } from '../../models/domain.js';
import Module from 'module';

export type ModbusBilding = {
    entry: EntryModbus[],
    server: ModbusServer,
}

export class ModbusRunner implements AppModule {

    private bildings: ModbusBilding[] = []

    async enable(ctx: ModuleContext): Promise<void>{
        await ctx.bus.waitFor('config:loaded')
        const cfg = ctx.services.get('config') as ConfigStore
        
        const EntrysModbus = cfg.listEntryModbus()
        const ServersModbus = cfg.listModbusServers()
        
        this.bildings = ServersModbus.map( (_server) => {
            const entriesForServer = EntrysModbus.filter( _entry => _entry.server_id === _server.id )
            return { server: _server, entry: entriesForServer } as ModbusBilding
        } )
        
        console.log('Bildings for Modbus: ', this.bildings)

    }

}

export function runnerModbus() {
    return new ModbusRunner()
}