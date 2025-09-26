import React from "react";

type MapCardProps = {
  x: number; // coordenada horizontal relativa (0–1)
  y: number; // coordenada vertical relativa (0–1)
  nombre: string;
  valor: number | string;
  unidad: string;
  color?: string; // tailwind o hex
};

export function MapCard({ x, y, nombre, valor, unidad, color = "bg-white" }: MapCardProps) {
  return (
    <div
      className={`absolute shadow-lg p-3 rounded text-sm ${color}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)", // centrar la card en el punto
      }}
    >
      <div className="font-bold">{nombre}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-mono">{valor}</span>
        <span className="text-xs">{unidad}</span>
      </div>
    </div>
  );
}
