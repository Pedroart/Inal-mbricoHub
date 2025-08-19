import { Outlet } from "react-router-dom";

export default function UseConfig(){

    return (
        <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white ">
          
          <div className="h-[88vh] p-3">
                  
            <Outlet/>
    
          </div>
        </div>
    )
}