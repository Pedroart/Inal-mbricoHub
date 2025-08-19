import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../Header/Header";
import Menu from "../Menu/Menu";

export default function UseLayout(){
    const [currentTime, setCurrentTime] = useState(new Date());
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white ">
          <Header
            currentTime={currentTime}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
          />
    
          {menuOpen && (
            <Menu
              setMenuOpen={setMenuOpen}
            />
          )}
    
          <div className="h-[88vh] p-3">
                  
            <Outlet/>
    
          </div>
        </div>
    )
}