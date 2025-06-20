import { db } from '../database/db';
import { Sensor } from './sensorModel';

export class SensorService {
    static addSensor(sensor: Sensor): boolean {
        try {
            const stmt = db.prepare(`
                INSERT OR REPLACE INTO sensores (externalId, nickname, fullName)
                VALUES (@externalId, @nickname, @fullName)
            `);
            stmt.run(sensor);
            return true;
        } catch (error) {
            return false;
        }
    }

    static getSensorById(id: number): Sensor | null {
        try {
            const stmt = db.prepare(`SELECT * FROM sensores WHERE id = ?`);
            const sensor = stmt.get(id);
            return sensor || null;
        } catch (error) {
            return null;
        }
    }

    static getSensorByExternalId(externalId: number): Sensor | null {
        try{
            const stmt = db.prepare(`SELECT * FROM sensores WHERE externalId = ?`);
            const sensor = stmt.get(externalId);
            return sensor || null;
        }catch (error){
            return null;
        }
    }

    static getSensores(): Sensor[] {
        try{
            const stmt = db.prepare(`SELECT * FROM sensores`);
            return stmt.all() as Sensor[];
        } catch (error){
            return []
        }

    }

    static updateSensor(sensor: Sensor): boolean {
        try {
            const stmt = db.prepare(`
                UPDATE sensores
                SET externalId = @externalId, nickname = @nickname, fullName = @fullName
                WHERE id = @id
            `);
            const result = stmt.run(sensor);
            return result.changes > 0;
        } catch (error) {
            return false;
        }
    }
}
