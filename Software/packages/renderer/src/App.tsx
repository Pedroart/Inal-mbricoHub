import { Routes, Route } from "react-router-dom";

import UseApp from './components/Layoud/UseLayout';
import UseConfig from "./components/Layoud/UseConfig";

import { VistaMapSensor } from './page/Tunel'
import { MainView } from './page/DispositivoView'

import { Vista } from '../src/models/vista'
import './assets/main.css';

import { HubOpciones } from "./page/Config/hub"
import { SensorsPage } from "./page/Config/sensores"
import { MapMarker } from "./page/Config/map"
import { ModbusClientePage } from "./page/Config/modbuss"
import { BluetoothPage } from "./page/Config/bluetooth"

import {ConfiguracionGeneral} from "./page/ConfiguracionGeneral"

import "./style.css"
 
export default function App(){
  return (
    <Routes>
      {/* Uso UI */ }
      <Route element={<UseApp/>}>
        <Route path={Vista.inicio} element={<VistaMapSensor />} />
        <Route path={Vista.sensores} element={<MainView/>} />
        <Route path={Vista.status} element={<div>Status</div>} />
      </Route>

      <Route path={Vista.configRoot} element={<UseConfig/>}>
        <Route index element={<HubOpciones/>}/>
        <Route path={Vista.configVista} element={<SensorsPage/>}/>
        <Route path={Vista.configMapa} element={<MapMarker/>}/>
        <Route path={Vista.configModbus} element={<ModbusClientePage/>} />
        <Route path={Vista.configBluetooth} element={<BluetoothPage/>} />
      </Route>

    </Routes>
  )
}