
import { Snowflake, Menu, X } from "lucide-react"
import { Button } from "../ui/button"
import Menuclass from "../Menu/Menu";

interface HeaderProps {
  currentTime: Date;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({ currentTime, menuOpen, setMenuOpen }: HeaderProps) {
  return (
    <div className="flex h-full w-full items-center justify-between bg-gradient-to-r from-teal-600 to-blue-600 px-4">
      {/* Lado Derecho */}
      <div className="flex items-center gap-2">
        <h1 className="font-bold">TÚNEL #3</h1>
      </div>
      { /* Centro */ }
      <div className="flex items-center gap-2">
        <Snowflake className="text-white" />
      </div>

      {/* Lado Derecho */}
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="font-mono font-bold">
            {currentTime.toLocaleTimeString("es-ES", { hour12: false })}
          </div>
          <div className="opacity-75">{currentTime.toLocaleDateString("es-ES")}</div>
        </div>
        <Button
            onClick={() => setMenuOpen(!menuOpen)}
            //size="lg"
            className="bg-white/20 hover:bg-white/30 border-white/30"
            //!h-12 !w-12
          >
            {menuOpen ? <X className="" /> : <Menu className="" />}
        </Button>
      </div>
      {menuOpen && (
                  <Menuclass
                    setMenuOpen={setMenuOpen}
                  />
      )}
    </div>   
    
  )
}
