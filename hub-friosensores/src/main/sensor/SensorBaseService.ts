import { SensorInstanciaConfig } from "../../renderer/models/Sensor";
import { MapaService } from "../mapa/mapaService";
import { SensorTipos } from "../../renderer/models/Sensor";

export class SensorBaseService {
    static getSensoresBle(): SensorInstanciaConfig[] {
        const mapaService = MapaService.getInstance();
        const dispositivos = mapaService.getDispositivos().filter(d => d.habilitador);

        return dispositivos.flatMap(dispositivo =>
            dispositivo.sensores
                .filter(s => s.habilitador && s.tipo === SensorTipos.Ble )//&& s.config?.codigoBle)
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
                .filter(s => s.habilitador && s.tipo === SensorTipos.Modbus )//&& s.config?.modbusNodeCode)
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
}
