import {
  MapaWithConfig,
  DispositivoWithConfig,
  SensorWithConfig,
  Unidades,
  SensorTipos,
} from "../layoud.js";

const TermometroInalambricos = Array.from({ length: 8 }, (_, index) => {
  const col = Math.floor(index / 4); // columnas de izquierda a derecha
  const row = index % 4;             // filas de arriba hacia abajo

  return {
    id: (index + 1).toString().padStart(2, "0"),
    x: 20 + col * 20, // separación horizontal de 40 px entre columnas
    y: 30 + row * 15, // separación vertical de 20 px entre filas
  };
});


const TermometroFijos = [
    { id: "RET", x: 50, y: 10,},
    { id: "AMB", x: 50, y: 55,},
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
      habilitador: false,
      unidad: Unidades.porcentaje,
      tipo: SensorTipos.Ble,
    },
  ],
}));


const TermometroModbus: DispositivoWithConfig[] = TermometroFijos.map(({ id, x, y }) => ({
  nombre: `Termómetro ${id}`,
  codigoDispositivo: `TM${id}`,
  habilitador: false,
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


const mapaC002: MapaWithConfig = {
  nombre: "C002",
  layoud: "C002/TunelCaliforniano3Vent.png",
  dispositivos: [ ...TermometroBle, ...TermometroModbus ],
};

export default mapaC002;