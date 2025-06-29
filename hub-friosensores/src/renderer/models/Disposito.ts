import { SensorWithConfig } from "./Sensor"

export interface DispositivoWithConfig{
    codigoDispositivo: string,
    habilitador: boolean,
    sensores: SensorWithConfig,
}