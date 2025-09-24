import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ProfileTests from './components/test/Configstore'
import ModbusServerPage from './components/test/ModbusServer'
import BlePage from './components/test/BLE'

export default function App() {

  return <div>
    <ProfileTests/>
    <ModbusServerPage/>
    
  </div>
}