import React from 'react';

export const ModbusConfig: React.FC = () => {
  const configurarModbus = () => {
    // Aquí podrías abrir un modal o redirigir a otra vista
    alert('Aquí iría la configuración Modbus.');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">🛠️ Configuración Modbus</h2>

      <button
        onClick={configurarModbus}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Configurar Modbus
      </button>

      <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        Guardar configuración
      </button>
    </div>
  );
};
