import { MapaWithConfig } from "../../models/Mapa.js";
import { DispositivoWithConfig } from "../../models/Disposito.js";
import { SensorWithConfig, SensorTipos, SensorConfig } from "../../models/Sensor.js";
import { layoudManager } from '../layoud/layoudService.js';

export class MapaService {
    private static instance: MapaService;
    private mapa: MapaWithConfig;

    constructor() {
        const mapaActivo = layoudManager.obtenerMapaActivo();
        if (!mapaActivo) {
        throw new Error("❌ No hay mapa activo disponible");
        }
        this.mapa = mapaActivo;
        console.log(this.mapa.nombre);
    }

    static getInstance(): MapaService {
        if (!this.instance) {
            this.instance = new MapaService();
        }
        return this.instance;
    }


    getDispositivos(): DispositivoWithConfig[] {
        return this.mapa.dispositivos;
    }

    getDispositivo(codigoDispositivo: string): DispositivoWithConfig | undefined {
        return this.mapa.dispositivos.find(d => d.codigoDispositivo === codigoDispositivo);
    }

    setNombreDispositivo(codigoDispositivo: string, nuevoNombre: string): boolean {
        const dispositivo = this.getDispositivo(codigoDispositivo);
        if (!dispositivo) return false;
        dispositivo.nombre = nuevoNombre;
        return true;
    }

    setEstadoDispositivo(codigoDispositivo: string, habilitado: boolean): boolean {
        const dispositivo = this.getDispositivo(codigoDispositivo);
        if (!dispositivo) return false;
        dispositivo.habilitador = habilitado;
        return true;
    }

    getSensoresDeDispositivo(codigoDispositivo: string): SensorWithConfig[] {
        const dispositivo = this.getDispositivo(codigoDispositivo);
        return dispositivo?.sensores ?? [];
    }

    getSensor(codigoSensor: string): SensorWithConfig | undefined {
        for (const disp of this.mapa.dispositivos) {
        const sensor = disp.sensores.find(s => s.codigoSensor === codigoSensor);
        if (sensor) return sensor;
        }
        return undefined;
    }

    setNombreSensor(codigoSensor: string, nuevoNombre: string): boolean {
        const sensor = this.getSensor(codigoSensor);
        if (!sensor) return false;
        sensor.nombre = nuevoNombre;
        return true;
    }

    setEstadoSensor(codigoSensor: string, habilitado: boolean): boolean {
        const sensor = this.getSensor(codigoSensor);
        if (!sensor) return false;
        sensor.habilitador = habilitado;
        return true;
    }

    setConfigBle(sensorCodigo: string, codigoBle: string): boolean {
        const sensor = this.getSensor(sensorCodigo);
        if (!sensor) return false;

        sensor.tipo = SensorTipos.Ble;
        sensor.config = {
        ...sensor.config,
        codigoBle
        };
        return true;
    }

    setConfigModbus(sensorCodigo: string, modbusNodeCode?: string, address?: number, cantidad?: number): boolean {
        const sensor = this.getSensor(sensorCodigo);
        if (!sensor) return false;

        sensor.tipo = SensorTipos.Modbus;

        if (!sensor.config) sensor.config = {};
        if (modbusNodeCode !== undefined) sensor.config.modbusNodeCode = modbusNodeCode;
        if (address !== undefined) sensor.config.address = address;
        if (cantidad !== undefined) sensor.config.cantidad = cantidad;

        return true;
    }

    getConfig(sensorCodigo: string): SensorConfig | undefined {
        const sensor = this.getSensor(sensorCodigo);
        return sensor?.config;
    }

    getMapaActualizado(): MapaWithConfig {
        return this.mapa;
    }

    actualizarMapa(): boolean {
        layoudManager.guardarMapaSeleccionado(this.mapa);
        return true;
    }
}
