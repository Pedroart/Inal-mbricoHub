"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Plus, MapPin, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

interface Marker {
  id: string
  name: string
  x: number // 0-100%
  y: number // 0-100%
}

export const MapMarker: React.FC = () => {
  const [markers, setMarkers] = useState<Marker[]>([
    { id: "1", name: "Punto Central", x: 50, y: 50 },
    { id: "2", name: "Esquina Superior", x: 20, y: 20 },
  ])
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>("1")
  const [newMarkerName, setNewMarkerName] = useState("")

  const selectedMarker = markers.find((m) => m.id === selectedMarkerId)

  const updateMarkerPosition = (x: number, y: number) => {
    const clampedX = Math.max(0, Math.min(100, x))
    const clampedY = Math.max(0, Math.min(100, y))
    setMarkers((prev) =>
      prev.map((marker) => (marker.id === selectedMarkerId ? { ...marker, x: clampedX, y: clampedY } : marker)),
    )
  }

  const moveMarker = (direction: "up" | "down" | "left" | "right") => {
    if (!selectedMarker) return
    const step = 5

    switch (direction) {
      case "up":
        updateMarkerPosition(selectedMarker.x, selectedMarker.y - step)
        break
      case "down":
        updateMarkerPosition(selectedMarker.x, selectedMarker.y + step)
        break
      case "left":
        updateMarkerPosition(selectedMarker.x - step, selectedMarker.y)
        break
      case "right":
        updateMarkerPosition(selectedMarker.x + step, selectedMarker.y)
        break
    }
  }

  const addMarker = () => {
    if (!newMarkerName.trim()) return

    const newMarker: Marker = {
      id: Date.now().toString(),
      name: newMarkerName.trim(),
      x: 50,
      y: 50,
    }

    setMarkers((prev) => [...prev, newMarker])
    setSelectedMarkerId(newMarker.id)
    setNewMarkerName("")
  }

  const removeMarker = (id: string) => {
    if (markers.length <= 1) return
    setMarkers((prev) => prev.filter((m) => m.id !== id))
    if (selectedMarkerId === id) {
      setSelectedMarkerId(markers.find((m) => m.id !== id)?.id || "")
    }
  }

  const gridLines = []
  for (let i = 0; i <= 10; i++) {
    const position = i * 10
    gridLines.push(
      <div
        key={`v-${i}`}
        className="absolute border-l border-gray-300/50"
        style={{ left: `${position}%`, height: "100%" }}
      />,
      <div
        key={`h-${i}`}
        className="absolute border-t border-gray-300/50"
        style={{ top: `${position}%`, width: "100%" }}
      />,
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Sistema de Marcadores</h1>
          <p className="text-muted-foreground">Posiciona marcadores sobre la imagen usando coordenadas del 0 al 100%</p>
        </div>

        <div className="space-y-4">
          {/* Sección superior: Selector de marcadores + Mapa */}
          <div className="grid grid-cols-[280px_1fr] gap-4 h-[60vh]">
            {/* Sidebar izquierdo - Gestión de marcadores - Más compacto */}
            <Card className="h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Marcadores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Selector de marcador - más compacto */}
                <div>
                  <Label htmlFor="marker-select" className="text-xs text-muted-foreground">
                    Seleccionar
                  </Label>
                  <Select value={selectedMarkerId} onValueChange={setSelectedMarkerId}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {markers.map((marker) => (
                        <SelectItem key={marker.id} value={marker.id}>
                          {marker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Agregar nuevo marcador - más compacto */}
                <div>
                  <Label htmlFor="new-marker" className="text-xs text-muted-foreground">
                    Nuevo marcador
                  </Label>
                  <div className="flex gap-1">
                    <Input
                      id="new-marker"
                      placeholder="Nombre"
                      value={newMarkerName}
                      onChange={(e) => setNewMarkerName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addMarker()}
                      className="h-8 text-sm"
                    />
                    <Button onClick={addMarker} size="sm" className="h-8 px-2">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Eliminar marcador - más compacto */}
                {markers.length > 1 && selectedMarker && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeMarker(selectedMarker.id)}
                    className="w-full h-8 text-xs"
                  >
                    Eliminar "{selectedMarker.name}"
                  </Button>
                )}

                {/* Info del marcador seleccionado - más compacto */}
                {selectedMarker && (
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <h3 className="font-medium text-xs mb-1">"{selectedMarker.name}"</h3>
                    <div className="text-xs font-mono bg-background px-2 py-1 rounded text-center">
                      X: {selectedMarker.x}% | Y: {selectedMarker.y}%
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mapa */}
            <div className="relative min-w-0">
              <div className="relative w-full h-full bg-gray-100 border-2 border-border rounded-lg overflow-hidden">
                <img
                  src="/mountain-trees-landscape.png"
                  alt="Imagen de referencia"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 pointer-events-none">{gridLines}</div>

                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground pointer-events-none">
                  {Array.from({ length: 11 }, (_, i) => (
                    <span key={i} className="w-4 text-center">
                      {i * 10}
                    </span>
                  ))}
                </div>

                <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground pointer-events-none">
                  {Array.from({ length: 11 }, (_, i) => (
                    <span key={i} className="h-4 flex items-center">
                      {i * 10}
                    </span>
                  ))}
                </div>

                {markers.map((marker) => (
                  <div
                    key={marker.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                      marker.id === selectedMarkerId ? "scale-125 z-10" : "hover:scale-110 z-0"
                    }`}
                    style={{
                      left: `${marker.x}%`,
                      top: `${marker.y}%`,
                    }}
                    onClick={() => setSelectedMarkerId(marker.id)}
                  >
                    <div className={`relative ${marker.id === selectedMarkerId ? "text-blue-600" : "text-red-600"}`}>
                      <MapPin className="w-6 h-6 drop-shadow-lg" fill="currentColor" />
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {marker.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedMarker && (
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  {/* Inputs de coordenadas */}
                  <div className="flex gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">X (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={selectedMarker.x}
                        onChange={(e) => updateMarkerPosition(Number.parseInt(e.target.value) || 0, selectedMarker.y)}
                        className="h-8 w-16 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Y (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={selectedMarker.y}
                        onChange={(e) => updateMarkerPosition(selectedMarker.x, Number.parseInt(e.target.value) || 0)}
                        className="h-8 w-16 text-sm"
                      />
                    </div>
                  </div>

                  {/* Cruceta de navegación */}
                  <div className="flex flex-col items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => moveMarker("up")} className="h-8 w-8 p-0">
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => moveMarker("left")} className="h-8 w-8 p-0">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateMarkerPosition(50, 50)}
                        className="h-8 w-8 p-0 text-xs"
                      >
                        C
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => moveMarker("right")} className="h-8 w-8 p-0">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => moveMarker("down")} className="h-8 w-8 p-0">
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Botones de posición rápida */}
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMarkerPosition(0, 0)}
                      className="text-xs py-1 h-7"
                    >
                      Sup. Izq.
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMarkerPosition(100, 0)}
                      className="text-xs py-1 h-7"
                    >
                      Sup. Der.
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMarkerPosition(0, 100)}
                      className="text-xs py-1 h-7"
                    >
                      Inf. Izq.
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMarkerPosition(100, 100)}
                      className="text-xs py-1 h-7"
                    >
                      Inf. Der.
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
