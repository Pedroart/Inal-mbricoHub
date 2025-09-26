import { IndustrialHeader } from "../components/industrial-header"

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main crece y se vuelve un contenedor flex */}
      <main className="flex-1 w-full flex">
        {/* Este div ahora sí llena todo el espacio disponible */}
        <div className="flex-1 bg-gray-400 flex items-center justify-center">
          <p className="text-lg text-white font-bold">
            Contenido fullscreen (menos el header)
          </p>
        </div>
      </main>

      <IndustrialHeader title="TITULO" />
    </div>
  )
}
