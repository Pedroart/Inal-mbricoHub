import React, { useRef, useEffect, useState } from 'react';
import { SensorUI } from '../../models/SensorUI';

interface Props {
  background: string; // base64 o URL
  sensores: SensorUI[];
}

export const SensorOverlay: React.FC<Props> = ({ background, sensores }) => {
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
          const left = (s.x / 100) * dimensions.width;
          const top = (s.y / 100) * dimensions.height;

          return (
            <div
              key={s.id}
              style={{
                position: 'absolute',
                top,
                left,
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: '12px',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div>{s.name}</div>
              <div>
                {s.value} {s.unit}
              </div>
            </div>
          );
        })}
    </div>
  );
};
