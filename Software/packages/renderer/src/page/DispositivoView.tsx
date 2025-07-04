import React, { useState } from "react";
import type { DeviceWithSensores } from "../models/Disposito";
import type { SensorView } from "../models/Sensor";
import { DashboardSensores } from "./DispositivoLists";
import SensorDetailView from "./SensorDetail";

export const MainView: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithSensores | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<SensorView | null>(null);

  const handleSensorClick = (device: DeviceWithSensores, sensor: SensorView) => {
    setSelectedDevice(device);
    setSelectedSensor(sensor);
  };

  const handleBack = () => {
    setSelectedDevice(null);
    setSelectedSensor(null);
  };

  return (
    <>
      {selectedDevice && selectedSensor ? (
        <SensorDetailView
          selectedDevice={selectedDevice}
          selectedSensor={selectedSensor}
          handleBackToSensors={handleBack}
        />
      ) : (
        <DashboardSensores onSensorClick={handleSensorClick} />
      )}
    </>
  );
};


