import { app, ipcMain } from "electron";
import fs from "fs";
import path from "path";
import { mapaC001 } from "../../assets/layoud/C001/C001"; // ajusta según ruta real
import {MapaWithConfig} from "../../renderer/models/Mapa"

const CACHE_PATH = path.join(app.getPath("userData"), "mapaC001.json");


console.log(CACHE_PATH);
