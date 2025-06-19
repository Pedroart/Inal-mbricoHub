
export interface Sensor {
    id: number;
    externalId: number;
    nickname: string;
    fullName: string;
}

export enum Unidad {
    Celsius = "ºc",
    PPM = "ppm",
    Lux = "lux"
}

export interface LecturaRaw {
    id: number;
    sensor_id: number;
    valor: number;
    unidad: Unidad;
    nivel_bateria: number;
    timestamp: string;
}

export interface LecturaSensorInalambricoRaw extends LecturaRaw {
    unidad: Unidad.Celsius;
}

export enum Estado {
    Operativo = "Operativo",
    BateriaBaja = "Batería Baja",
    Desconectado = "Desconectado"
}

export interface LecturaProcesada {
    id: number;
    sensor: Sensor;
    valor: number;
    unidad: string;
    estado: Estado;
    timestamp: Date;
}