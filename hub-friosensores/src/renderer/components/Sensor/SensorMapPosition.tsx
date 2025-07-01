import React from 'react';
import { Card, CardContent } from '@/renderer/components/ui/card';

const SensorMapPosition = ({ posicion }: { posicion: { x: number; y: number } }) => (
  <Card className="bg-slate-800/50 border-slate-700">
    <CardContent className="p-6">
      <h3 className="text-lg sm:text-xl font-bold text-teal-400 mb-4">POSICIÓN EN MAPA</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-900/50 rounded-lg text-center">
          <div className="text-sm text-slate-400">Coordenada X</div>
          <div className="text-2xl font-bold text-white">{posicion.x}%</div>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-lg text-center">
          <div className="text-sm text-slate-400">Coordenada Y</div>
          <div className="text-2xl font-bold text-white">{posicion.y}%</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default SensorMapPosition;
