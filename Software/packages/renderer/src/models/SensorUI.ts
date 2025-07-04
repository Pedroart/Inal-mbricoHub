import { Unidades } from "./Unidades";
import { Estados } from "./Estados";

export interface SensorUI {
  id: number;
  name: string;
  value: number;
  unit: Unidades;
  status: Estados;
  x: number; // % relativo al ancho
  y: number; // % relativo al alto
}
