import { Routes, Route, Navigate } from "react-router-dom";

import UseLayout from './components/Layoud/UseLayout';

import { VistaMapSensor } from './page/Tunel'
import { MainView } from './page/DispositivoView'

import { Vista } from '../src/models/vista'
import './assets/main.css';


export default function App(){
  return (
    <Routes>
      {/* Uso UI */ }
      <Route element={<UseLayout />}>
        <Route index element={<VistaMapSensor />} />
        <Route path={Vista.Inicio} index element={<VistaMapSensor />} />
        <Route path={Vista.Sensores} element={<MainView/>} />
        <Route path={Vista.Status} element={<div>Status</div>} />
      </Route>
    </Routes>
  )
}