export const Unidades = {
  celsius: "°C",
  porcentaje: "%",
} as const;

export type Unidades = typeof Unidades[keyof typeof Unidades];
