import React from 'react';

import { Estados } from "../../models/Estados";
import type { SensorUI } from '../../models/SensorUI';

const backgroundColorByStatus: Record<Estados, string> = {
    [Estados.Operativo]: 'rgba(0,0,0,0.7)',
    [Estados.BateriaBaja]: 'rgba(226, 174, 174, 0.7)',
    [Estados.Desconectado]: 'rgba(207, 45, 153, 0.7)',
};

export const SensorOverlayItem: React.FC<SensorUI> = ({ id, name, value, unit, status, x, y }) => (
    <div
        className="absolute px-2 py-1 rounded-md text-white text-4xl font-medium shadow"
        key={id}
        style={{
            left: x,
            top: y,
            background: backgroundColorByStatus[status],
            transform: 'translate(-50%, -50%)',
        }}
    >
        <div>{name}</div>
        <div>
            {value.toFixed(2)} {unit}
        </div>
    </div>
);

export default SensorOverlayItem;