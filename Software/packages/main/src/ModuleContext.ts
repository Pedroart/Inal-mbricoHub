import { AppEvents} from './Events.js'
import { Bus } from './Buss.js';

export type ModuleContext = {
  readonly app: Electron.App;
  readonly bus: Bus<AppEvents>
  readonly services: Map<string, unknown> // se encarga de poder compartir variables globales
}
