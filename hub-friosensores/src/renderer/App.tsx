import React, { useState } from 'react';
import { TopBar } from './components/TopBar/index';
import { Vista } from '../types/views'
import { VistaMapSensor } from '../renderer/page/Tunel'

export default function App() {
  const handleClick = async () => {
    const result = await window.api.ping();
    alert(result);
  };

  const [vistas, setVista] = useState<Vista>(Vista.Inicio);

  const renderVista = () => {
    switch (vistas) {
      case Vista.Tunel: return <div>Tunel</div>;
      case Vista.Config: return <div>Configuración</div>;
      default: return <VistaMapSensor />;
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar onNavigate={setVista} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderVista()}
      </div>
    </div>
  );
}
