import { ModbusNode } from "./ModbusNode.js";
import { Posicion } from "./Posicion.js"
import { Unidades } from "./Unidades.js";
import { Estados } from "./Estados.js";
// Domain

export interface SensorBase{
    codigoSensor: string,
    nombre: string,
    unidad: Unidades,
    tipo: SensorTipos,
    posicion?: Posicion,
}

export enum SensorTipos{
    Ble = 'Ble',
    Modbus = 'Modbus'
}

// Estencion para Declaracion

export interface SensorWithConfig extends SensorBase {
    config: SensorConfig,
    habilitador: boolean,
}


export interface SensorConfig{
    codigoBle?: string,
    modbusNodeCode?: string,
    address?: number,
    cantidad?: number,
}

export interface SensorInstanciaConfig extends SensorBase {
    codigoBle?: string;
    modbusNodeCode?: string;
    address?: number;
    cantidad?: number;
}


// Extencion para Guardados

export interface SensorValue extends Omit<SensorBase, 'tipo' | 'posicion'>  {
    valor: number,
    estado: Estados,
    timestamp: number    
}

// Extencion para Visualizacion

export interface SensorView extends SensorBase {
    valor?: number;
    estado?: Estados;
    habilitador?: boolean,
}


export interface BeaconPacket {
  codigoBle: number;
  temp: number;
  bateria: number;
  timestamp: number;
}

