import { Routes, Route } from "react-router-dom";

import UseLayout from './components/Layoud/UseLayout';
import UseConfig from "./components/Layoud/UseConfig";

import { VistaMapSensor } from './page/Tunel'
import { MainView } from './page/DispositivoView'

import { Vista } from '../src/models/vista'
import './assets/main.css';
import { ConfiguracionGeneral } from "./page/ConfiguracionGeneral";


export default function App(){
  return (
    <Routes>
      {/* Uso UI */ }
      <Route element={<UseLayout />}>
        <Route path={Vista.Inicio} element={<VistaMapSensor />} />
        <Route path={Vista.Sensores} element={<MainView/>} />
        <Route path={Vista.Status} element={<div>Status</div>} />
      </Route>

      <Route path={Vista.Config} element={<UseConfig/>}>
        <Route index element={<ConfiguracionGeneral/>}/>
      </Route>

    </Routes>
  )
}