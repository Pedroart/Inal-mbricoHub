import { DispositivoWithConfig } from "./Disposito";

export interface MapaWithConfig{
    nombre: string,
    dispositivos: DispositivoWithConfig[],
    layoud: string,
}