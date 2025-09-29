import type {AppInitConfig} from './AppInitConfig.js';
import {createModuleRunner} from './ModuleRunner.js';
import {disallowMultipleAppInstance} from './modules/SingleInstanceApp.js';
import {createWindowManagerModule} from './modules/WindowManager.js';
import {terminateAppOnLastWindowClose} from './modules/ApplicationTerminatorOnLastWindowClose.js';
import {hardwareAccelerationMode} from './modules/HardwareAccelerationModule.js';
import {autoUpdater} from './modules/AutoUpdater.js';
import {allowInternalOrigins} from './modules/BlockNotAllowdOrigins.js';
import {allowExternalUrls} from './modules/ExternalUrls.js';
//import { createIngestModule, createLoggerModule } from './modules/TestBuss.js'
import {loadConfigModule} from './core/config/ConfigStore.js';
import {createConfigIpcModule} from './core/config/ConfigIpcModule.js'
import {runnerModbus} from './core/entries/ModbusRunner.js'
import {measurementManager} from './core/MeasurementManager.js'

export async function initApp(initConfig: AppInitConfig) {
  const moduleRunner = createModuleRunner()
    .init(createWindowManagerModule({initConfig, openDevTools: true}))//import.meta.env.DEV}))
    .init(disallowMultipleAppInstance())
    .init(terminateAppOnLastWindowClose())
    .init(hardwareAccelerationMode({enable: false}))
    .init(autoUpdater())
    //.init(createIngestModule())
    //.init(createLoggerModule())

    .init(loadConfigModule())
    .init(createConfigIpcModule())
    .init(measurementManager())

    .init(runnerModbus())
    // Install DevTools extension if needed
    // .init(chromeDevToolsExtension({extension: 'VUEJS3_DEVTOOLS'}))

    // Security
    .init(allowInternalOrigins(
      new Set(initConfig.renderer instanceof URL ? [initConfig.renderer.origin] : []),
    ))
    .init(allowExternalUrls(
      new Set(
        initConfig.renderer instanceof URL
          ? [
            'https://vite.dev',
            'https://developer.mozilla.org',
            'https://solidjs.com',
            'https://qwik.dev',
            'https://lit.dev',
            'https://react.dev',
            'https://preactjs.com',
            'https://www.typescriptlang.org',
            'https://vuejs.org',
          ]
          : [],
      )),
    );

  await moduleRunner;
}

