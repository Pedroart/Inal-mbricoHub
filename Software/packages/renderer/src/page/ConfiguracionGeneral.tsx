import React, { useEffect, useState } from 'react';
import { api } from '@app/preload';
import { LayoudSelector } from '../components/Layoud/LayoudSelector';
import { ModbusConfig } from '../components/Modbus/ModbusConfig';

type LayoudItem = {
  nombre: string;
  path: string;
};

export const ConfiguracionGeneral: React.FC = () => {
  const [layouds, setLayouds] = useState<LayoudItem[]>([]);
  const [activo, setActivo] = useState<string | null>(null);
  const [imagen, setImagen] = useState<string | null>(null);

  const cargarDatos = async () => {
    const lista = await api.layoud.getllista();
    const actual = await api.layoud.getActivo();
    const img = await api.layoud.getImage();

    setLayouds(lista);
    setActivo(actual?.nombre ?? null);
    setImagen(img);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cambiarLayoud = async (nombre: string) => {
    const encontrado = layouds.find(m => m.nombre === nombre);
    if (!encontrado) return;
    await api.layoud.setActivo(encontrado);
    await cargarDatos();
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">⚙️ Configuración General</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LayoudSelector
          layouds={layouds}
          activo={activo}
          imagen={imagen}
          onChange={cambiarLayoud}
        />
        <ModbusConfig />
      </div>
    </div>
  );
};
