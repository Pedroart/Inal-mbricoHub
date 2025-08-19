import React from "react"
import { NavLink } from "react-router-dom";
import { Button } from "../ui/button"
import {
  Map, Thermometer, CheckCircle,
} from "lucide-react"

import { Vista } from "../../models/vista"

interface MenuProps {
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type MenuItem = {
  id: Vista;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  end?: boolean;
}

const menuItems: MenuItem[] = [
  { id: Vista.Inicio,   label: "MAPA",      icon: Map},
  { id: Vista.Sensores, label: "SENSORES",  icon: Thermometer},
  { id: Vista.Status,   label: "ESTADO",    icon: CheckCircle},
  { id: Vista.Config,   label: "CONFIG",    icon: CheckCircle},
];

export default function Menu({ setMenuOpen }: MenuProps) {
  return (
    <div className="absolute top-[12vh] left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 z-50 p-4">
      <div className="grid grid-cols-2  gap-4">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <NavLink key={id} to={id}>
            {({isActive})=>(
              <Button
                size="lg"
                onClick={() => setMenuOpen(false)}
                className={`h-20 text-3xl font-bold flex items-center ${
                  isActive
                    ? "bg-teal-600 hover:bg-teal-700"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <Icon className="!h-16 !w-16 mr-3"/>
                {label}
              </Button>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
