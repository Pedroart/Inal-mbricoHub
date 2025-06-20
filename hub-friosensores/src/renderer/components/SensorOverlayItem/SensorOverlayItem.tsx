import React, { useRef, useEffect, useState } from 'react';
import { Status, Units, SensorUI } from '../../models/SensorUI';

const backgroundColorByStatus: Record<Status, string> = {
    [Status.Operativo]: 'rgba(0,0,0,0.7)',
    [Status.BateriaBaja]: 'rgba(226, 174, 174, 0.7)',
    [Status.Desconectado]: 'rgba(207, 45, 153, 0.7)',
};

export const SensorOverlayItem: React.FC<SensorUI> = ({ id, name, value, unit, status, x, y }) => (
    <div
        key={id}
        style={{
            position: 'absolute',
            left: x,
            top: y,
            background: backgroundColorByStatus[status],
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: '12px',
            transform: 'translate(-50%, -50%)',
        }}
    >
        <div>{name}</div>
        <div>
            {value} {unit}
        </div>
    </div>
);

export default SensorOverlayItem;