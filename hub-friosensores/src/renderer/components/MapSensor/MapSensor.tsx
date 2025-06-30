import React, { useRef, useEffect, useState } from 'react';
import { Unidades } from "../../models/Unidades";
import { Estados } from "../../models/Estados";

import { SensorUI } from '../../models/SensorUI';

import { SensorOverlayItem } from '../SensorOverlayItem/index';

interface Props {
  background: string; // base64 o URL
  sensores: SensorUI[];
}

export const MapSensor: React.FC<Props> = ({ background, sensores }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const updateSize = () => {
      setDimensions({ width: img.clientWidth, height: img.clientHeight });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
        <img
            src={background}
            alt="Fondo"
            ref={imgRef}
            style={{ width: '100%', height: 'auto', display: 'block' }}
        />
        {dimensions.width > 0 &&
            sensores.map((s) => {
                const pxX = (s.x / 100) * dimensions.width;
                const pxY = (s.y / 100) * dimensions.height;

                return (
                <SensorOverlayItem
                    key={s.id}
                    {...s}
                    x={pxX}
                    y={pxY}
                />
            );
        })}
    </div>
  );
};
