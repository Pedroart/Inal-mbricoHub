import { SensorInstanciaConfig } from "../../renderer/models/Sensor";
import { MapaService } from "../mapa/mapaService";
import { SensorTipos, SensorView } from "../../renderer/models/Sensor";
import { Estados } from "../../renderer/models/Estados";
import { DeviceWithSensores } from "../../renderer/models/Disposito";

export class SensorBaseService {
    static getSensoresBle(): SensorInstanciaConfig[] {
        const mapaService = MapaService.getInstance();
        const dispositivos = mapaService.getDispositivos().filter(d => d.habilitador);

        return dispositivos.flatMap(dispositivo =>
            dispositivo.sensores
                .filter(s => s.tipo === SensorTipos.Ble )//&& s.config?.codigoBle)
                .map(sensor => ({
                    codigoSensor: sensor.codigoSensor,
                    codigoBle: sensor.config!.codigoBle,
                    nombre: sensor.nombre, 
                    unidad: sensor.unidad, 
                    tipo: sensor.tipo,
                }))
        );
    }

    static getSensoresModbus(): SensorInstanciaConfig[] {
        const mapaService = MapaService.getInstance();
        const dispositivos = mapaService.getDispositivos().filter(d => d.habilitador);

        return dispositivos.flatMap(dispositivo =>
            dispositivo.sensores
                .filter(s => s.tipo === SensorTipos.Modbus )//&& s.config?.modbusNodeCode)
                .map(sensor => ({
                    codigoSensor: sensor.codigoSensor,
                    modbusNodeCode: sensor.config!.modbusNodeCode,
                    address: sensor.config!.address,
                    cantidad: sensor.config!.cantidad,
                    nombre: sensor.nombre, 
                    unidad: sensor.unidad, 
                    tipo: sensor.tipo,
                }))
        );
    }

    static getTodosSensores(): SensorInstanciaConfig[] {
        return [
            ...SensorBaseService.getSensoresBle(),
            ...SensorBaseService.getSensoresModbus()
        ];
    }

    static getSensorViews(): SensorView[] {
        const mapaService = MapaService.getInstance();
        const dispositivos = mapaService.getDispositivos().filter(d => d.habilitador);
        
        const sensorViews: SensorView[] = [];

        for (const dispositivo of dispositivos) {
            for (const sensor of dispositivo.sensores) {
            if (!sensor.habilitador) continue;

            sensorViews.push({
                codigoSensor: sensor.codigoSensor,
                nombre: sensor.nombre,
                unidad: sensor.unidad,
                tipo: sensor.tipo,
                posicion: sensor.posicion,
            });
            }
        }

        return sensorViews;
    }

}
