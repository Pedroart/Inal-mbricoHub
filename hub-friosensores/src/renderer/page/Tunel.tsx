import React, { useEffect, useState } from 'react';
import { MapSensor } from '../components/MapSensor';
import { Unidades } from "../models/Unidades";
import { Estados } from "../models/Estados";
import { SensorUI } from '../models/SensorUI';
import mapImg from '../assets/FondoTunel.jpeg'

const generateRandomSensorData = (id: number): SensorUI => {
// Genera posiciones fijas para cada sensor según su id
const positions = [
    { x: 10, y: 20 },
    { x: 30, y: 40 },
    { x: 50, y: 60 },
    { x: 70, y: 80 },
    { x: 90, y: 20 },
];
const pos = positions[(id - 1) % positions.length];

return {
    id,
    name: `Sensor ${id}`,
    value: parseFloat((Math.random() * 100).toFixed(2)),
    unit: Unidades.celsius,
    status: Math.random() > 0.5 ? Estados.Operativo : Estados.Desconectado,
    x: pos.x,
    y: pos.y,
};
};

export const VistaMapSensor: React.FC = () => {
  const [sensores, setSensores] = useState<SensorUI[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedSensors = Array.from({ length: 5 }, (_, i) => generateRandomSensorData((i + 1)));
      setSensores(updatedSensors);
    }, 2000); // actualiza cada 2 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Vista del Mapa de Sensores</h2>
      <MapSensor background={mapImg} sensores={sensores} />
    </div>
  );
};
