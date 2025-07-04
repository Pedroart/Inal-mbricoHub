import React, { useEffect, useState } from 'react';
import { MapSensor } from '../components/MapSensor';
import { Unidades } from "../models/Unidades";
import { Estados } from "../models/Estados";
import type { SensorUI } from '../models/SensorUI';
import type { SensorView, SensorValue } from '../models/Sensor';
import { api } from '@app/preload'


//import mapImg from '../assets/FondoTunel.jpeg'

export const getSensorData = async (): Promise<SensorUI[]> => {
  const [baseSensores, sensoresView ] = await Promise.all([
    api.getSensores() as Promise<SensorValue[]>,       // SensorBase[]
    api.getSensoresView() as Promise<SensorView[]>,   // SensorView[]
  ]);

  console.log('Sensores Data: ', baseSensores )

  return sensoresView.map((sensorView, index) => {
    const base = baseSensores.find(b => b.codigoSensor === sensorView.codigoSensor);

    return {
      id: index + 1,
      name: sensorView.nombre,
      value: base?.valor ?? 0,
      unit: sensorView.unidad as Unidades,
      status: base?.estado as Estados,
      x: sensorView.posicion?.x ?? 0,
      y: sensorView.posicion?.y ?? 0,
    };
  });
};



export const VistaMapSensor: React.FC = () => {
  const [sensores, setSensores] = useState<SensorUI[]>([]);
  const [mapImg, setMapImg] = useState<string | null>(null); // 👈 Aquí

  useEffect(() => {
    const fetchAndUpdate = async () => {
      const path = await api.layoud.getImage();
      setMapImg(path);
      console.log(path);

      const data = await getSensorData();
      setSensores(data);
    };

    fetchAndUpdate(); // primera vez

    const interval = setInterval(fetchAndUpdate, 5000); // cada 5 segundos

    return () => clearInterval(interval); // limpieza
  }, []);

  return (
    
      <MapSensor background={mapImg ?? ''} sensores={sensores} />
    
  );
};