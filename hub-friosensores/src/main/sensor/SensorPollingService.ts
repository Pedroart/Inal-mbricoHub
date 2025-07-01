import { SensorBaseService } from './SensorBaseService';
import { SensorValue } from "../../renderer/models/Sensor";
import { Estados } from "../../renderer/models/Estados";
import { SensorInstanciaConfig } from "../../renderer/models/Sensor";
import { SensorTipos, SensorView } from "../../renderer/models/Sensor";
import { DeviceWithSensores } from "../../renderer/models/Disposito";
import { MapaService } from "../mapa/mapaService";

export class SensorPollingService {
    private static bleIntervalId: NodeJS.Timeout;
    private static modbusIntervalId: NodeJS.Timeout;

    static ultimasLecturasBLE: SensorValue[] = [];
    static ultimasLecturasModbus: SensorValue[] = [];

    static start(): void {
        this.bleIntervalId = setInterval(async () => {
            const bleSensores = SensorBaseService.getSensoresBle();
            
            const results = await this.simularLecturas(bleSensores, "BLE");
            this.ultimasLecturasBLE = results;
            console.log("Lecturas BLE", results);
        }, 5000);

        this.modbusIntervalId = setInterval(async () => {
            const modbusSensores = SensorBaseService.getSensoresModbus();
            
            const results = await this.simularLecturas(modbusSensores, "Modbus");
            this.ultimasLecturasModbus = results;
            console.log("Lecturas Modbus", results);
        }, 13000);
    }

    static stop(): void {
        clearInterval(this.bleIntervalId);
        clearInterval(this.modbusIntervalId);
    }

    private static async simularLecturas(sensores: SensorInstanciaConfig[], tipo: string): Promise<SensorValue[]> {
        // Simulación (reemplaza por tu lógica real de lectura)
        return sensores.map(s => ({
            codigoSensor: s.codigoSensor,
            nombre: s.nombre,
            unidad: s.unidad,
            valor: Math.random() * 100, // valor simulado
            estado: Estados.Operativo,         // puedes poner lógica real aquí
            timestamp: Date.now()
        }));
    }

    // ✅ Métodos de acceso
    static getLecturasBLE(): SensorValue[] {
        return this.ultimasLecturasBLE;
    }

    static getLecturasModbus(): SensorValue[] {
        return this.ultimasLecturasModbus;
    }

    static getTodas(): SensorValue[] {
        return [...this.ultimasLecturasBLE, ...this.ultimasLecturasModbus];
    }

    static getDeviceViews(): DeviceWithSensores[] {
        const mapaService = MapaService.getInstance();
        const dispositivos = mapaService.getDispositivos().filter(d => d.habilitador);

        const lecturas: SensorValue[] = SensorPollingService.getTodas();

        const result: DeviceWithSensores[] = [];


        for (const dispositivo of dispositivos) {
            const sensores: SensorView[] = dispositivo.sensores.map(sensor => {
                const lectura = lecturas.find(l => l.codigoSensor === sensor.codigoSensor);

                return {
                codigoSensor: sensor.codigoSensor,
                nombre: sensor.nombre,
                unidad: sensor.unidad,
                tipo: sensor.tipo,
                posicion: sensor.posicion,
                habilitador: sensor.habilitador,
                valor: lectura?.valor,
                estado: lectura?.estado,
                };
            });

            result.push({
                nombre: dispositivo.nombre,
                codigoDispositivo: dispositivo.codigoDispositivo,
                habilitador: dispositivo.habilitador,
                sensores,
            });
        }

        return result;
    }
}
