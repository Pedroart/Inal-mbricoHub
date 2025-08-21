import { Outlet, useNavigate } from "react-router-dom";
import { Background } from "../Layoud/elementos/background"
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

export default function UseConfig(){
    const navigate = useNavigate();
    return (
        <Background>
          <div className="flex items-center gap-4 p-3">
            
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white"
              onClick={()=>navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Regresar
            </Button>
            
          </div>
          <div className="h-[88vh] p-3">
            <Outlet/>
          </div>
        </Background>
    )
}