import { db } from '../database/db.js';
import { RegistroRaw, RegistroProcesada, Estado, Unidad } from './registroModel.js';

export class RegistroService {

  static addRegistro(registro: RegistroRaw): boolean {
    try {
      const stmt = db.prepare(`
        INSERT INTO registros (sensor_id, valor, unidad, nivel_bateria, timestamp)
        VALUES (@sensor_id, @valor, @unidad, @nivel_bateria, @timestamp)
      `);
      stmt.run(registro);
      return true;
    } catch (error) {
      return false;
    }
  }

  static getRegistrosBySensorId(sensor_id: number): RegistroRaw[] {
    try {
      const stmt = db.prepare(`SELECT * FROM registros WHERE sensor_id = ? ORDER BY timestamp DESC`);
      return stmt.all(sensor_id) as RegistroRaw[];
    } catch (error) {
      return [];
    }
  }

  static getUltimoRegistroProcesado(sensor_id: number): RegistroProcesada | null {
    try {
      const stmt = db.prepare(`
        SELECT * FROM registros WHERE sensor_id = ? ORDER BY timestamp DESC LIMIT 1
      `);
      const raw = stmt.get(sensor_id) as RegistroRaw;
      if (!raw) return null;

      return this.procesarRegistro(raw);
    } catch (error) {
      return null;
    }
  }

  static procesarRegistro(registro: RegistroRaw): RegistroProcesada {
    let estado: Estado;

    if (!registro.nivel_bateria || registro.nivel_bateria < 20) {
      estado = Estado.BateriaBaja;
    } else if (Date.now() - new Date(registro.timestamp).getTime() > 5 * 60 * 1000) {
      estado = Estado.Desconectado;
    } else {
      estado = Estado.Operativo;
    }

    return {
      sensor_id: registro.sensor_id,
      valor: registro.valor,
      unidad: registro.unidad,
      estado,
      timestamp: new Date(registro.timestamp)
    };
  }
}
