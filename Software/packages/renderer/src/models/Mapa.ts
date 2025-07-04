import type { DispositivoWithConfig } from "./Disposito";

export interface MapaWithConfig{
    nombre: string,
    dispositivos: DispositivoWithConfig[],
    layoud: string,
}