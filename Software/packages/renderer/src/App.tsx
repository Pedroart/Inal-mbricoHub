import { Routes, Route } from "react-router-dom";

import UseLayout from './components/Layoud/UseLayout';
import UseConfig from "./components/Layoud/UseConfig";

import { VistaMapSensor } from './page/Tunel'
import { MainView } from './page/DispositivoView'

import { Vista } from '../src/models/vista'
import './assets/main.css';
import { ConfiguracionGeneral } from "./page/ConfiguracionGeneral";
import { HubOpciones } from "./page/Config/hub"

export default function App(){
  return (
    <Routes>
      {/* Uso UI */ }
      <Route element={<UseLayout />}>
        <Route path={Vista.inicio} element={<VistaMapSensor />} />
        <Route path={Vista.sensores} element={<MainView/>} />
        <Route path={Vista.status} element={<div>Status</div>} />
      </Route>

      <Route path={Vista.configRoot} element={<UseConfig/>}>
        <Route index element={<HubOpciones/>}/>
      </Route>

    </Routes>
  )
}