import { resolve } from 'path';
import {AppModule} from '../../AppModule.js';
import {ModuleContext} from '../../ModuleContext.js';
import {ConfigStore} from '../config/ConfigStore.js'

export class ModbusRunner implements AppModule {

    async enable(ctx: ModuleContext): Promise<void>{
        await ctx.bus.waitFor('config:loaded',100)
        const cfg = ctx.services.get('config') as ConfigStore
        
        cfg.listEntryModbus
    }

}