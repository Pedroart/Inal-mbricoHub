import { SensorInstanciaConfig } from "../../models/Sensor.js";
import { MapaService } from "../mapa/mapaService.js";
import { SensorTipos, SensorView } from "../../models/Sensor.js";
import { Estados } from "../../models/Estados.js";
import { DeviceWithSensores } from "../../models/Disposito.js";

export class SensorBaseService {
  static getSensoresBle(): SensorInstanciaConfig[] {
    const mapaService = MapaService.getInstance();
    const dispositivos = mapaService.getDispositivos();

    console.log("🔌 BLE → Dispositivos cargados:", dispositivos);

    const habilitados = dispositivos.filter(d => d.habilitador);
    console.log("🔌 BLE → Dispositivos habilitados:", habilitados.length);

    const sensores = habilitados.flatMap(dispositivo => {
      console.log(`🔍 BLE → Procesando dispositivo: ${dispositivo.nombre}`);
      return dispositivo.sensores
        .filter(s => s.tipo === SensorTipos.Ble)
        .map(sensor => {
          console.log("✅ BLE → Sensor encontrado:", {
            codigo: sensor.codigoSensor,
            nombre: sensor.nombre,
            tipo: sensor.tipo,
            config: sensor.config
          });

          return {
            codigoSensor: sensor.codigoSensor,
            codigoBle: sensor.config?.codigoBle,
            nombre: sensor.nombre,
            unidad: sensor.unidad,
            tipo: sensor.tipo,
          };
        });
    });

    console.log("📦 BLE → Sensores encontrados:", sensores.length);
    return sensores;
  }

  static getSensoresModbus(): SensorInstanciaConfig[] {
    const mapaService = MapaService.getInstance();
    const dispositivos = mapaService.getDispositivos();

    console.log("🔌 MODBUS → Dispositivos cargados:", dispositivos);

    const habilitados = dispositivos.filter(d => d.habilitador);
    console.log("🔌 MODBUS → Dispositivos habilitados:", habilitados.length);

    const sensores = habilitados.flatMap(dispositivo => {
      console.log(`🔍 MODBUS → Procesando dispositivo: ${dispositivo.nombre}`);
      return dispositivo.sensores
        .filter(s => s.tipo === SensorTipos.Modbus)
        .map(sensor => {
          console.log("✅ MODBUS → Sensor encontrado:", {
            codigo: sensor.codigoSensor,
            nombre: sensor.nombre,
            tipo: sensor.tipo,
            config: sensor.config
          });

          return {
            codigoSensor: sensor.codigoSensor,
            modbusNodeCode: sensor.config?.modbusNodeCode,
            address: sensor.config?.address,
            cantidad: sensor.config?.cantidad,
            nombre: sensor.nombre,
            unidad: sensor.unidad,
            tipo: sensor.tipo,
          };
        });
    });

    //console.log("📦 MODBUS → Sensores encontrados:", sensores.length);
    return sensores;
  }

  static getTodosSensores(): SensorInstanciaConfig[] {
    //console.log("📊 Obteniendo todos los sensores...");
    const ble = SensorBaseService.getSensoresBle();
    const modbus = SensorBaseService.getSensoresModbus();
    console.log("📊 Total sensores:", ble.length + modbus.length);
    return [...ble, ...modbus];
  }

  static getSensorViews(): SensorView[] {
    const mapaService = MapaService.getInstance();
    const dispositivos = mapaService.getDispositivos();

    //console.log("🧭 SensorView → Dispositivos:", dispositivos);

    const habilitados = dispositivos.filter(d => d.habilitador);
    console.log("🧭 SensorView → Dispositivos habilitados:", habilitados.length);

    const sensorViews: SensorView[] = [];

    for (const dispositivo of habilitados) {
      for (const sensor of dispositivo.sensores) {
        if (!sensor.habilitador) continue;

        const view: SensorView = {
          codigoSensor: sensor.codigoSensor,
          nombre: sensor.nombre,
          unidad: sensor.unidad,
          tipo: sensor.tipo,
          posicion: sensor.posicion,
        };

        //console.log("👁️ SensorView → Agregando sensor:", view);
        sensorViews.push(view);
      }
    }

    console.log("📦 SensorView → Total:", sensorViews.length);
    return sensorViews;
  }
}

