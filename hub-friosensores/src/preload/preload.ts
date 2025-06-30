// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

export const api = {
  ping: () => ipcRenderer.invoke('ping'),

  // ✅ Agrega estos métodos
  getEmpresa: () => ipcRenderer.invoke('storage:get-empresa'),
  setEmpresa: (nuevaEmpresa: string) => ipcRenderer.invoke('storage:set-empresa', nuevaEmpresa),

  // ...otros métodos si los tienes
};

contextBridge.exposeInMainWorld('api', api);
