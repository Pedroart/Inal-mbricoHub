import fs from "fs";
import path from "path";
import { app, ipcMain } from "electron";
import { readFileSync } from 'fs';
import {MapaWithConfig} from "../../renderer/models/Mapa"

const CACHE_PATH = path.join(app.getPath("userData"), "confMap.json");

console.log('NODE_ENV =', process.env.NODE_ENV);

const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd
  ? path.join(process.resourcesPath, 'layoud')
  : path.join(__dirname, 'layoud');

const raw = readFileSync(path.join(basePath, 'C001/index.json'), 'utf-8');
const mapa = JSON.parse(raw);

console.log(mapa);