import { DispositivoWithConfig } from "./Disposito.js";

export interface MapaWithConfig{
    nombre: string,
    dispositivos: DispositivoWithConfig[],
    layoud: string,
}