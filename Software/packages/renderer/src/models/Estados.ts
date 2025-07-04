export const Estados = {
  Operativo: "Operativo",
  BateriaBaja: "Batería Baja",
  Desconectado: "Desconectado"
} as const;

export type Estados = typeof Estados[keyof typeof Estados];
