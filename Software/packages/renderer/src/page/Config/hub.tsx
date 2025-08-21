import { type RoutePath, Vista } from "../../models/vista"
// añade estos íconos (ajusta si prefieres otros)
import { Settings, LayoutTemplate, Map, Bluetooth, Server, Database, FileSpreadsheet } from "lucide-react"
import { NavLink } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
type MenuItem = {
  id: RoutePath;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  end?: boolean;
}

const menuItems: MenuItem[] = [

  { 
    id: Vista.configVista,      
    label: "VISTA",          
    icon: LayoutTemplate,
    description: "Configurar y monitorear sensores del sistema" 
  },
  { 
    id: Vista.configMapa,       
    label: "MAPA",           
    icon: Map,
    description: "Configurar mapas y ubicaciones" 
  },
  { 
    id: Vista.configBluetooth,  
    label: "BLUETOOTH",      
    icon: Bluetooth,
    description: "Gestión de dispositivos Bluetooth" 
  },
  { 
    id: Vista.configModbus,     
    label: "MODBUS SERVER",  
    icon: Server,
    description: "Configuración del servidor Modbus" 
  },
  { 
    id: Vista.configS7,         
    label: "S7 SERVER",      
    icon: Server,
    description: "Lista y configuración de servidores S7" 
  },
  { 
    id: Vista.configBaseDatos,  
    label: "BASE DE DATOS",  
    icon: Database,
    description: "Configuración de base de datos" 
  },
  { 
    id: Vista.configPlantilla,  
    label: "PLANTILLA",      
    icon: FileSpreadsheet,
    description: "Gestión de copias de seguridad" 
  },
]

export const HubOpciones: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {menuItems.map(({ id, label, icon: Icon, description }) => (
          <NavLink key={id} to={id}>
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-all duration-200 hover:scale-105 cursor-pointer backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-slate-700/50`}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-white text-lg">{label}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-slate-300">{description}</CardDescription>
                    </CardContent>
                </Card>
          </NavLink>
    ))}
    </div>
  )
}

