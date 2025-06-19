import { api } from '../preload/preload';
declare global {
  interface Window {
    api: typeof api;
  }
}
export {};
