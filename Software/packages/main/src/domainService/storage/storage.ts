import Store from 'electron-store';
import path from 'path';
import { app } from 'electron';

type StorageSchema = {
  idioma: string;
  empresa: string;
};

export class StorageManager {
  private static instance: StorageManager;
  private store: Store<StorageSchema>;

  private constructor() {
    this.store = new Store<StorageSchema>({
      schema: {
        idioma      : { type: 'string', default: 'es' },
        empresa     : { type: 'string', default: 'Friopacking'}, 
      },
      cwd: path.join(app.getPath('userData')), // ruta persistente
    });
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  public get<T extends keyof StorageSchema>(key: T): StorageSchema[T] {
    return this.store.get(key);
  }

  public set<T extends keyof StorageSchema>(key: T, value: StorageSchema[T]): void {
    this.store.set(key, value);
  }

  public clear(): void {
    this.store.clear();
  }

  public get path(): string {
    return this.store.path;
  }
}
