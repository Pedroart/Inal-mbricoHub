//getDispisitivos
import React from "react";
import { useEffect, useState } from "react";
import { DeviceWithSensores } from "../models/Disposito"; 
import { SensorView } from "../models/Sensor"; 
import { Estados } from "../models/Estados"; 
import { Card,CardContent } from "@/renderer/components/ui/card"

type DashboardSensoresProps = {
  onSensorClick: (device: DeviceWithSensores, sensor: SensorView) => void;
};

export const DashboardSensores: React.FC<DashboardSensoresProps> = ({ onSensorClick }) => {
  const [dispositivosData, setDispositivosData] = useState<DeviceWithSensores[]>([]);

  // Obtener datos cada 5 segundos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await window.api.getDispositivos() as DeviceWithSensores[];
        setDispositivosData(data);
      } catch (error) {
        console.error("Error al obtener dispositivos:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);



  const handleSensorClick = (dispositivo: DeviceWithSensores, sensor: SensorView) => {
    console.log("Click en sensor:", sensor.codigoSensor, "de", dispositivo.nombre);
    onSensorClick(dispositivo, sensor);
  };

  const getStatusColor = (estado: Estados, habilitado: boolean): string => {
    if (!habilitado) return "border-gray-500";
    switch (estado) {
      case Estados.Operativo:
        return "border-green-500";
      case Estados.BateriaBaja:
        return "border-yellow-500";
      case Estados.Desconectado:
      default:
        return "border-red-500";
    }
  };

  const getSensorIcon = (sensor: SensorView) => {
    // Puedes personalizar íconos según tipo
    return (
      <div className="w-4 h-4 bg-slate-500 rounded-full" />
    );
  };

  return (
    <div className="h-full scrollbar-hidden overflow-y-auto">
      <div className="space-y-6">
        {dispositivosData.map((dispositivo) => (
          <Card key={dispositivo.codigoDispositivo} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 sm:p-6">
              {/* Header del dispositivo */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-600">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${
                      dispositivo.habilitador ? "bg-green-500" : "bg-gray-500"
                    }`}
                  />
                  <div>
                    <h3 className="text-4xl font-bold text-white">{dispositivo.nombre}</h3>
                    <p className="text-3xl text-slate-300 font-mono">
                      {dispositivo.codigoDispositivo}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl text-slate-400">Estado</div>
                  <div
                    className={`text-3xl font-bold ${
                      dispositivo.habilitador ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {dispositivo.habilitador ? "ACTIVO" : "INACTIVO"}
                  </div>
                </div>
              </div>

              {/* Sensores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dispositivo.sensores.map((sensor) => (
                  <div
                    key={sensor.codigoSensor}
                    className={`cursor-pointer p-4 rounded-lg border-2 ${getStatusColor(sensor.estado ?? Estados.Desconectado, sensor.habilitador ?? false)}`}
                    onClick={() => handleSensorClick(dispositivo, sensor)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getSensorIcon(sensor)}
                        <span className="text-2xl font-semibold text-white">{sensor.nombre}</span>
                      </div>
                      <div
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                          sensor.habilitador ? "bg-green-500" : "bg-gray-500"
                        }`}
                      />
                    </div>

                    <div className="text-center">
                      <div className="text-4xl text-slate-400 font-mono">{sensor.codigoSensor}</div>
                      <div className="text-4xl text-slate-500">{sensor.tipo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};