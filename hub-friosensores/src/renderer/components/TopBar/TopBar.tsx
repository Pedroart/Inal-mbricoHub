// src/components/TopBar/TopBar.tsx
import React, { useState } from 'react';
import style from './TopBar.module.css';
import { Vista } from '../../../types/views'

interface Props {
  onNavigate: (view: Vista) => void;
}

export const TopBar: React.FC<Props> = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={style.container}>
      <div className={style.topbar}>
        <button className={style.menuButton} onClick={() => setOpen((prev) => !prev)}>x</button>
        <div className={style.title}>Layout</div>
        <div />
      </div>

      {open && (
        <div className={style.menu}>
          <button className={style.navButton} onClick={() => onNavigate(Vista.Inicio)}>Inicio</button>
          <button className={style.navButton} onClick={() => onNavigate(Vista.Tunel)}>Túneles</button>
          <button className={style.navButton} onClick={() => onNavigate(Vista.Config)}>Configuración</button>
        </div>
      )}
    </div>
  );
};
