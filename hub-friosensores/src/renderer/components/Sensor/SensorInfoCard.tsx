import React from 'react';
import { Card, CardContent } from '@/renderer/components/ui/card';

const SensorInfoCard = ({ device, sensor }: { device: any; sensor: any }) => (
  <Card className="bg-slate-800/50 border-slate-700">
    <CardContent className="p-6 text-center">
      <h2 className="text-xl sm:text-2xl font-bold text-teal-400 mb-4">{device.nombre}</h2>
      <div className="p-6 bg-slate-900/50 rounded-xl">
        <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-400 mb-2">
          {sensor.temperatura ?? 0}
          {sensor.unidad}
        </div>
        <div className="text-lg text-slate-300">{sensor.nombre}</div>
        <div className="text-sm text-slate-400 font-mono mt-2">{sensor.codigoSensor}</div>
      </div>
    </CardContent>
  </Card>
);

export default SensorInfoCard;
