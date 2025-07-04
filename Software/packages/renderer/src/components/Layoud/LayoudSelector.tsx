import React from 'react';

type LayoudItem = {
  nombre: string;
  path: string;
};

type Props = {
  layouds: LayoudItem[];
  activo: string | null;
  imagen: string | null;
  onChange: (nombre: string) => void;
};

export const LayoudSelector: React.FC<Props> = ({ layouds, activo, imagen, onChange }) => {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">🗺️ Cambiar Layoud</h2>
      <select
        className="w-full p-2 border rounded"
        value={activo ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {layouds.map((m) => (
          <option key={m.nombre} value={m.nombre}>
            {m.nombre}
          </option>
        ))}
      </select>

      {imagen && (
        <img
          src={imagen}
          alt="Mapa activo"
          className="w-full border rounded shadow-md"
        />
      )}
    </div>
  );
};
