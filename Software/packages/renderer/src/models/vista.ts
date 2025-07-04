// src/models/vista.ts
export const Vista = {
  Inicio: "inicio",
  Sensores: "sensores",
  Control: "control",
  Status : "status",
  Config : "configuracion",
} as const;

export type Vista = typeof Vista[keyof typeof Vista];
