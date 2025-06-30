import {
  MapaWithConfig,
  DispositivoWithConfig,
  SensorWithConfig,
  Unidades,
  SensorTipos,
} from "../layoud";

const TermometroInalambricos = [
  { id: "01", x: 20, y: 20,},
  { id: "02", x: 30, y: 20,},
  { id: "03", x: 40, y: 20,},
  { id: "04", x: 50, y: 20,},
  { id: "05", x: 60, y: 20,},
  { id: "06", x: 70, y: 20,},
  { id: "07", x: 80, y: 20,},
  { id: "08", x: 90, y: 20,},
  { id: "09", x: 100, y: 20,},
  { id: "10", x: 110, y: 20,},
  { id: "11", x: 120, y: 20,},
  { id: "12", x: 130, y: 20,},
  { id: "13", x: 140, y: 20,},
  { id: "14", x: 150, y: 20,},
  { id: "15", x: 160, y: 20,},
  { id: "16", x: 170, y: 20,},
];

const TermometroFijos = [
    { id: "AMB", x: 160, y: 20,},
    { id: "RET", x: 170, y: 20,},
];

const TermometroBle: DispositivoWithConfig[] = TermometroInalambricos.map(({ id, x, y }) => ({
  nombre: `Termómetro ${id}`,
  codigoDispositivo: `TM${id}`,
  habilitador: true,
  sensores: [
    {
      nombre: `S${id}`,
      codigoSensor: `TM${id}_TEMP`,
      config: {},
      habilitador: true,
      unidad: Unidades.celsius,
      tipo: SensorTipos.Ble,
      posicion: { x, y },
    },
    {
      nombre: `S${id}_BAT`,
      codigoSensor: `TM${id}_BAT`,
      config: {},
      habilitador: true,
      unidad: Unidades.porcentaje,
      tipo: SensorTipos.Ble,
    },
  ],
}));


const TermometroModbus: DispositivoWithConfig[] = TermometroFijos.map(({ id, x, y }) => ({
  nombre: `Termómetro ${id}`,
  codigoDispositivo: `TM${id}`,
  habilitador: true,
  sensores: [
    {
      nombre: `TM_${id}`,
      codigoSensor: `TM${id}_TEMP`,
      config: {},
      habilitador: true,
      unidad: Unidades.celsius,
      tipo: SensorTipos.Modbus,
      posicion: { x, y },
    },
  ],
}));


export const mapaC001: MapaWithConfig = {
  nombre: "Túnel Californiano de 3 Vent",
  layoud: "TunelCaliforniano3Vent.png",
  dispositivos: [ ...TermometroBle, ...TermometroModbus ],
};

export default mapaC001;