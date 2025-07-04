import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { ModbusNode } from '../../models/ModbusNode.js';

const STORAGE_PATH = path.join(app.getPath('userData'), 'modbusNodes.json');

export class ModbusNodeService {
  private static instance: ModbusNodeService;
  private nodos: ModbusNode[] = [];

  private constructor() {
    this.cargarDesdeDisco();
  }

  static getInstance(): ModbusNodeService {
    if (!this.instance) {
      this.instance = new ModbusNodeService();
    }
    return this.instance;
  }

  private cargarDesdeDisco() {
    if (fs.existsSync(STORAGE_PATH)) {
      try {
        const raw = fs.readFileSync(STORAGE_PATH, 'utf-8');
        this.nodos = JSON.parse(raw) as ModbusNode[];
        console.log(this.nodos);
      } catch (err) {
        console.error("❌ Error cargando nodos Modbus:", err);
      }
    }
  }

  private guardarEnDisco() {
    try {
      fs.writeFileSync(STORAGE_PATH, JSON.stringify(this.nodos, null, 2));
    } catch (err) {
      console.error("❌ Error guardando nodos Modbus:", err);
    }
  }

  getAll(): ModbusNode[] {
    return this.nodos;
  }

  getById(id: string): ModbusNode | undefined {
    return this.nodos.find(n => n.id === id);
  }

  crear(nodo: ModbusNode): boolean {
    if (this.getById(nodo.id)) return false;
    this.nodos.push(nodo);
    this.guardarEnDisco();
    return true;
  }

  editar(id: string, datosParciales: Partial<ModbusNode>): boolean {
    const nodo = this.getById(id);
    if (!nodo) return false;

    Object.assign(nodo, datosParciales);
    this.guardarEnDisco();
    return true;
  }

  eliminar(id: string): boolean {
    const index = this.nodos.findIndex(n => n.id === id);
    if (index === -1) return false;

    this.nodos.splice(index, 1);
    this.guardarEnDisco();
    return true;
  }
}
