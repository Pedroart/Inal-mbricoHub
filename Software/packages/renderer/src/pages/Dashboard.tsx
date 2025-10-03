import { IndustrialHeader } from "../components/industrial-header"
import { Mapsensor } from "../components/mapsSensor"

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-[#20232c] text-white">
      {/* Main crece y se vuelve un contenedor flex */}
      <main className="flex-1 w-full flex">
        {/* Este div ahora sí llena todo el espacio disponible */}
        <div className="flex-1 bg-[#1b1d23] flex items-center justify-center">
          <Mapsensor/>
        </div>
      </main>

      <IndustrialHeader title="Friomamut" showBackButton={false} />
    </div>
  )
}
