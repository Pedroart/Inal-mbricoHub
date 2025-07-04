import React from 'react';
import { Card, CardContent } from '../ui/card';

const InfoBox = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="p-4 bg-slate-900/50 rounded-lg">
    <div className="text-sm text-slate-400">{label}</div>
    <div className="text-lg font-mono text-white">{value}</div>
  </div>
);

const SensorTechInfo = ({ device, sensor }: { device: any; sensor: any }) => (
  <Card className="bg-slate-800/50 border-slate-700">
    <CardContent className="p-6">
      <h3 className="text-lg sm:text-xl font-bold text-teal-400 mb-4">INFORMACIÓN TÉCNICA</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoBox label="Código Dispositivo" value={device.codigoDispositivo} />
        <InfoBox label="Código Sensor" value={sensor.codigoSensor} />
        <InfoBox label="Tipo" value={sensor.tipo} />
        <InfoBox label="Unidad" value={sensor.unidad} />
        <InfoBox
          label="Estado Dispositivo"
          value={
            <span className={`font-bold ${device.habilitador ? 'text-green-400' : 'text-red-400'}`}>
              {device.habilitador ? 'ACTIVO' : 'INACTIVO'}
            </span>
          }
        />
        <InfoBox
          label="Estado Sensor"
          value={
            <span className={`font-bold ${sensor.habilitador ? 'text-green-400' : 'text-red-400'}`}>
              {sensor.habilitador ? 'ACTIVO' : 'INACTIVO'}
            </span>
          }
        />
      </div>
    </CardContent>
  </Card>
);

export default SensorTechInfo;
