import React from 'react';
import { Card, CardContent } from '@/renderer/components/ui/card';
import { Button } from '@/renderer/components/ui/button';
import { Activity, Map, Settings } from 'lucide-react';

const SensorActions = ({ device, sensor }: { device: any; sensor: any }) => (
  <Card className="bg-slate-800/50 border-slate-700">
    <CardContent className="p-6">
      <h3 className="text-lg sm:text-xl font-bold text-teal-400 mb-4">CONFIGURACIÓN</h3>
      <div className="space-y-4">
        <Button size="lg" className="w-full h-16 text-lg bg-teal-600 hover:bg-teal-700">
          <Settings className="h-6 w-6 mr-3" />
          CONFIGURAR SENSOR
        </Button>

        <Button size="lg" className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700">
          <Activity className="h-6 w-6 mr-3" />
          VER HISTÓRICO
        </Button>

        <Button size="lg" className="w-full h-16 text-lg bg-purple-600 hover:bg-purple-700">
          <Map className="h-6 w-6 mr-3" />
          UBICAR EN MAPA
        </Button>

        <Button
          size="lg"
          className={`w-full h-16 text-lg ${
            sensor.habilitador ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {sensor.habilitador ? 'DESACTIVAR SENSOR' : 'ACTIVAR SENSOR'}
        </Button>

        <Button
          size="lg"
          className={`w-full h-16 text-lg ${
            device.habilitador ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {device.habilitador ? 'DESACTIVAR DISPOSITIVO' : 'ACTIVAR DISPOSITIVO'}
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default SensorActions;
