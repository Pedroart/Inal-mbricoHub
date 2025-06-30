import { SensorWithConfig } from "./Sensor"

export interface DispositivoWithConfig{
    nombre: string,
    codigoDispositivo: string,
    habilitador: boolean,
    sensores: SensorWithConfig[],
}