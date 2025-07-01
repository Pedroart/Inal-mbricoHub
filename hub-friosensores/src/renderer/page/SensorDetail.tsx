// SensorDetailView.tsx (componente principal)
import React from 'react';
import SensorHeader from '../components/Sensor/SensorHeader';
import SensorInfoCard from '../components/Sensor/SensorInfoCard';
import SensorTechInfo from '../components/Sensor/SensorTechInfo';
import SensorMapPosition from '../components/Sensor/SensorMapPosition';
import SensorActions from '../components/Sensor/SensorActions';

import { SensorUI } from '../models/SensorUI';
import { SensorView, SensorValue } from '../models/Sensor';
import { DispositivoWithConfig } from '../models/Disposito';


type Props = {
  selectedDevice: any; 
  selectedSensor: any; // idem, reemplaza `any` por Sensor si lo tienes
  handleBackToSensors: () => void;
};


const SensorDetailView: React.FC<Props> = ({
  selectedDevice,
  selectedSensor,
  handleBackToSensors,
}) => {
  return (
    <div className="h-full overflow-y-auto">
      <SensorHeader onBack={handleBackToSensors} />
      <div className="space-y-6">
        <SensorInfoCard device={selectedDevice} sensor={selectedSensor} />
        <SensorTechInfo device={selectedDevice} sensor={selectedSensor} />
        {selectedSensor.posicion && <SensorMapPosition posicion={selectedSensor.posicion} />}
        <SensorActions device={selectedDevice} sensor={selectedSensor} />
        <div className="h-4" />
      </div>
    </div>
  );
};

export default SensorDetailView;
