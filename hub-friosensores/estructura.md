# 🧠 Estructura del Proyecto Electron + React + TypeScript

Este proyecto está estructurado para separar correctamente la lógica del backend (tareas rutinarias, BLE, base de datos) y el frontend (UI React) usando Electron y TypeScript.

---

## 📁 Archivos clave

### `src/main/main.ts`
Responsable de:
- Crear la ventana principal
- Registrar tareas y handlers con `ipcMain`

```ts
import { app, BrowserWindow, ipcMain } from 'electron';
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('ping', async () => 'Hola desde el backend');
  ipcMain.on('start-task', () => {
    console.log('🔁 Ejecutando tarea rutinaria...');
  });
});
```

---

### `src/preload/preload.ts`
Expone funciones del backend al frontend de forma segura:

```ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.invoke('ping'),
  startTask: () => ipcRenderer.send('start-task')
});
```

---

### `src/types/global.d.ts`
Agrega tipos globales para `window.api`:

```ts
export {};

declare global {
  interface Window {
    api: {
      ping: () => Promise<string>;
      startTask: () => void;
    };
  }
}
```

---

### `src/renderer/App.tsx`
Interfaz React que usa `window.api`:

```tsx
import React from 'react';

export default function App() {
  const handlePing = async () => {
    const result = await window.api.ping();
    alert(result);
  };

  const handleStart = () => {
    window.api.startTask();
    alert('Tarea enviada');
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Hub Inalámbrico</h1>
      <button onClick={handlePing}>Ping</button>
      <button onClick={handleStart}>Iniciar tarea</button>
    </div>
  );
}
```

---

## ✅ Flujo de funcionamiento
1. `main.ts` define los handlers con `ipcMain`
2. `preload.ts` los expone en `window.api`
3. `types/global.d.ts` hace que TypeScript reconozca `window.api`
4. `App.tsx` usa esa API para comunicarse con el backend

---

Puedes extender esta estructura con otras funciones como `getSensorData`, `onUpdate(callback)`, `scanBLE`, etc.
