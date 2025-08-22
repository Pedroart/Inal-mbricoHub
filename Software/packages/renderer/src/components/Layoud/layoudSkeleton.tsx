import { useState, useEffect } from "react";
import { AppShell } from "./elementos/skeleton";
import { NavLink } from "react-router-dom";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../Header/Header";


export default function UseApp() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  

  return (
    <AppShell
      header={
  
      <Header
                      currentTime={currentTime}
                      menuOpen={menuOpen}
                      setMenuOpen={setMenuOpen}
      />
      }
      sidebar={<div></div>}
      headerHeight={"8rem"}        // px
      stickyHeader={false}
      
      sidebarWidth={"0rem"}   // rem/px/string
      mainClassName="p-6"
    >
      {/* Tu contenido (Routes, etc.) */}
      <Outlet/>
    </AppShell>
  );
}
