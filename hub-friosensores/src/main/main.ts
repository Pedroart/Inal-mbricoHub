import { app, BrowserWindow, ipcMain  } from 'electron';
import { registerRegistroHandlers } from './registro/registroController';
import { registerSensorHandlers } from './sensor/sensorController';
import { StorageManager } from './storage/storage';
import { registerStorageHandlers } from './storage/storageController';
import { layoudManager } from './layoud/layoudService';
import { registerLayoudHandlers } from './layoud/layoudControler';
import { MapaService } from './mapa/mapaService';
import { registerMapaHandlers } from './mapa/mapaController';
import { ModbusNodeService } from './modbusNode/modbusNodeService';
import { registerModbusNodeHandlers } from './modbusNode/modbusNodeController';
import { SensorPollingService } from './sensor/SensorPollingService';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const Storage = StorageManager.getInstance();
//const Layoud = layoudManager.obtenerMapaActivo();
const ModbusNode = ModbusNodeService.getInstance();
const Mapa = MapaService.getInstance();

SensorPollingService.start(); // Se puede detener con SensorPollingService.stop();

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    //width: 600,
    //height: 1024,
    resizable: true,         // Fijar tamaño para Raspberry Pi
    fullscreen: true,        // Puedes cambiar esto a true si deseas sin bordes
    kiosk: false,             // O true si quieres bloquear al usuario fuera del sistema
    autoHideMenuBar: true,    // Oculta menú superior
    webPreferences: {
      nodeIntegration: false,  // Si necesitas usar ipcRenderer directamente
      contextIsolation: true, // Importante si usas preload
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  //mainWindow.webContents.openDevTools(); // Solo en dev
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();

  // ✅ REGISTRA el handler aquí dentro de app.ready
  ipcMain.handle('ping', async () => {
    console.log('🔄 Ping recibido desde el renderer');
    return '¡Hola desde el backend!';
  });

  registerRegistroHandlers();
  registerSensorHandlers();
  registerStorageHandlers();
  registerLayoudHandlers();
  registerMapaHandlers();
  registerModbusNodeHandlers();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
