// src/models/vista.ts
export const Vista = {
  inicio: "",                     // index route
  sensores: "sensores",
  control: "control",
  status: "status",

  configRoot: "configuracion",    // /configuracion
  configVista: "configuracion/vista",
  configMapa: "configuracion/mapa",
  configBluetooth: "configuracion/bluetooth",
  configModbus: "configuracion/modbus-server",
  configS7: "configuracion/s7-server",
  configBaseDatos: "configuracion/base-datos",
  configPlantilla: "configuracion/plantilla",
} as const;

export type RoutePath = typeof Vista[keyof typeof Vista];
