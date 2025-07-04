import { SensorWithConfig, SensorView } from "./Sensor"

export interface DispositivoWithConfig{
    nombre: string,
    codigoDispositivo: string,
    habilitador: boolean,
    sensores: SensorWithConfig[],
}

export interface DeviceWithSensores {
  nombre: string;
  codigoDispositivo: string;
  habilitador: boolean;
  sensores: SensorView[];
}
