export enum Unidad {
    Celsius = "ºc",
}

export interface RegistroRaw {
    id?: number;
    sensor_id: number;
    valor: number;
    unidad: Unidad;
    nivel_bateria: number;
    timestamp: string;
}

export interface RegistroSensorInalambricoRaw extends RegistroRaw {
    unidad: Unidad.Celsius;
}

export enum Estado {
    Operativo = "Operativo",
    BateriaBaja = "Batería Baja",
    Desconectado = "Desconectado"
}

export interface RegistroProcesada {
    sensor_id: number;
    valor: number;
    unidad: string;
    estado: Estado;
    timestamp: Date;
}