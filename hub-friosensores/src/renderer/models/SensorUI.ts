
export enum Units {
  celsius = "°C"
}

export enum Status {
    Operativo = "Operativo",
    BateriaBaja = "Batería Baja",
    Desconectado = "Desconectado"
}

export interface SensorUI {
  id: number;
  name: string;
  value: number;
  unit: Units;
  status: Status;
  x: number; // % relativo al ancho
  y: number; // % relativo al alto
}
