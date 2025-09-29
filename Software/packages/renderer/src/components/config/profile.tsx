import React, { useState, useEffect, useMemo, useRef } from "react"
import type { ConfigProfile } from "../../api/models"
import { IndustrialCard } from "../industrial-card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"

// ---- Estático / helpers ----
const emptyProfile: ConfigProfile = {
  sensor_type: [],
  entry: [],
  modbus_server: [],
  entry_modbus: [],
  entry_ble: [],
  dashboard_widget: [],
}

function sentenceCase(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function Banner({
  kind = "info",
  children,
  onClose,
  timeoutMs = 3000,
}: {
  kind?: "info" | "success" | "warning" | "error"
  children: React.ReactNode
  onClose: () => void
  timeoutMs?: number
}) {
  const palette = {
    info: "bg-[#1b1d23] border-[#2d3340] text-gray-200",
    success: "bg-[#17231b] border-[#1b3b24] text-green-200",
    warning: "bg-[#2a2417] border-[#4d3b18] text-yellow-200",
    error: "bg-[#2b1f1f] border-[#5a1f1f] text-red-200",
  }[kind]

  React.useEffect(() => {
    if (!timeoutMs) return
    const t = setTimeout(onClose, timeoutMs)
    return () => clearTimeout(t)
  }, [timeoutMs, onClose])

  return (
    <div
      className={`group rounded-md border px-3 py-2 text-sm ${palette} transition-opacity duration-200 hover:opacity-0`}
      onMouseEnter={onClose}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">{children}</div>
        <button
          type="button"
          onClick={onClose}
          className="opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default function ProfileTests() {
  // ---- State principal ----
  const [name, setName] = useState("")
  const [profiles, setProfiles] = useState<string[]>([])
  const [profile, setProfile] = useState<ConfigProfile>(emptyProfile)
  const [lastChanged, setLastChanged] = useState<Date>(new Date())

  // Guardar copia
  const [newProfileName, setNewProfileName] = useState("")
  const [askOverwrite, setAskOverwrite] = useState<{ open: boolean; targetName: string }>({ open: false, targetName: "" })

  // Borrar
  const [deleteTarget, setDeleteTarget] = useState("")
  const [askDelete, setAskDelete] = useState(false)

  // UI
  const [showDetails, setShowDetails] = useState(false)
  const [banner, setBanner] = useState<{ kind: "info" | "success" | "warning" | "error"; msg: string } | null>(null)

  // Import (upload) — solo almacenar meta por ahora
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadedMeta, setUploadedMeta] = useState<{ name: string; size: number } | null>(null)

  // ---- Efectos / API ----
  useEffect(() => {
    window.api.config.profile.getName().then(setName)
    window.api.config.profile.list().then(setProfiles)
    window.api.config.profile.get().then(setProfile)

    window.api.config.profile.onChanged(({ profile }) => {
      setName(profile)
      setLastChanged(new Date())
    })
  }, [])

  // ---- Métricas (resumen) ----
  const stats = useMemo(
    () => [
      { label: "Tipos de sensor", value: profile.sensor_type?.length ?? 0 },
      { label: "Entradas", value: profile.entry?.length ?? 0 },
      { label: "Servidores Modbus", value: profile.modbus_server?.length ?? 0 },
      { label: "Entradas Modbus", value: profile.entry_modbus?.length ?? 0 },
      { label: "Entradas BLE", value: profile.entry_ble?.length ?? 0 },
      { label: "Widgets", value: profile.dashboard_widget?.length ?? 0 },
    ],
    [profile]
  )

  // ---- Acciones existentes ----
  const handleSave = async () => {
    setBanner(null)
    await window.api.config.profile.save()
    await window.api.config.profile.list().then(setProfiles)
    setBanner({ kind: "success", msg: "Cambios guardados en el perfil activo." })
  }

  const handleSaveCopyIntent = () => {
    setBanner(null)
    const target = newProfileName.trim()
    if (!target) {
      setBanner({ kind: "warning", msg: "Ingresa un nombre para la copia." })
      return
    }
    if (profiles.includes(target)) {
      setAskOverwrite({ open: true, targetName: target })
      return
    }
    handleSaveCopy(target, false)
  }

  const handleSaveCopy = async (targetName: string, overwrite: boolean) => {
    setBanner(null)
    await window.api.config.profile.saveAs(targetName, overwrite)
    await window.api.config.profile.list().then(setProfiles)
    setNewProfileName("")
    setAskOverwrite({ open: false, targetName })
    setBanner({
      kind: "success",
      msg: overwrite ? `Copia sobreescrita: “${targetName}”.` : `Copia creada: “${targetName}”.`,
    })
  }

  const handleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBanner(null)
    const selected = e.target.value
    if (selected && selected !== name) {
      await window.api.config.profile.setActive(selected)
      setBanner({ kind: "info", msg: `Perfil activo: “${selected}”.` })
    }
  }

  const handleDeleteIntent = () => {
    setBanner(null)
    if (!deleteTarget) {
      setBanner({ kind: "warning", msg: "Selecciona un perfil para borrar." })
      return
    }
    setAskDelete(true)
  }

  const handleDelete = async () => {
    setBanner(null)
    setAskDelete(false)
    try {
      await window.api.config.profile.remove(deleteTarget)
      setProfiles(await window.api.config.profile.list())
      if (deleteTarget === name) {
        const newActive = await window.api.config.profile.getName()
        setName(newActive)
        setProfile(await window.api.config.profile.get())
      }
      if (deleteTarget === "default") {
        setBanner({ kind: "success", msg: "Configuración por defecto borrada correctamente (según backend)." })
      } else {
        setBanner({ kind: "success", msg: `Perfil “${deleteTarget}” borrado.` })
      }
      setDeleteTarget("")
    } catch (err) {
      if (deleteTarget === "default") {
        setBanner({
          kind: "warning",
          msg:
            "Tu backend no permite borrar “default”. Actívalo y limpia módulos para vaciarlo, luego guarda.",
        })
      } else {
        setBanner({ kind: "error", msg: `No se pudo borrar “${deleteTarget}”.` })
      }
    }
  }

  // ---- NUEVO: Exportar / Importar JSON ----
  const handleDownloadJSON = () => {
    try {
      const data = JSON.stringify(profile, null, 2)
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const safeName = (name || "profile").replace(/[^\w.-]+/g, "_")
      a.href = url
      a.download = `${safeName}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setBanner({ kind: "success", msg: "JSON descargado." })
    } catch {
      setBanner({ kind: "error", msg: "No se pudo descargar el JSON." })
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      //const text = await file.text()
      // Por ahora NO hacemos nada con el contenido. Solo guardamos meta y avisamos.
      setUploadedMeta({ name: file.name, size: file.size })
      setBanner({ kind: "success", msg: `Archivo cargado: ${file.name} (${Math.ceil(file.size / 1024)} KB).` })
      // Limpia el input para permitir volver a elegir el mismo archivo si se desea.
      e.target.value = ""
    } catch {
      setBanner({ kind: "error", msg: "No se pudo leer el archivo." })
    }
  }

  // ---- Render ----
  return (
    <div className="p-6 space-y-6">
      {banner && (
        <Banner kind={banner.kind} onClose={() => setBanner(null)}>
          {banner.msg}
        </Banner>
      )}

      {/* PERFIL */}
      <IndustrialCard title={sentenceCase("perfil")}>
        <div className="flex flex-col gap-4">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Perfil activo:</span>
              <span className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium bg-[#1b1d23] text-white border border-[#343841]">
                {name || "(sin nombre)"}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Última actualización: {lastChanged.toLocaleTimeString()}
            </div>
          </div>

          {/* Selector + Guardar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label htmlFor="profile-select" className="block text-xs text-gray-400 mb-1">
                Cambiar perfil
              </label>
              <select
                id="profile-select"
                value={name}
                onChange={handleSelect}
                className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e77e5]"
              >
                {profiles.map((p) => (
                  <option key={p} value={p}>
                    {p || "(sin nombre)"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSave} className="h-10 px-4 bg-[#1e77e5] hover:bg-[#1b6bd0] text-white rounded-md">
                Guardar cambios
              </Button>
            </div>
          </div>

          {/* Guardar copia del perfil actual */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label htmlFor="copy-name" className="block text-xs text-gray-400 mb-1">
                {sentenceCase("guardar copia del perfil actual")}
              </label>
              <div className="text-xs text-gray-500 mb-2">
                Si el nombre ya existe, podrás elegir sobrescribirlo.
              </div>
              <div className="flex gap-2">
                <Input
                  id="copy-name"
                  type="text"
                  placeholder="Nombre de la copia"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="flex-1 rounded-md border border-[#343841] bg-[#1b1d23] text-white placeholder:text-gray-500"
                />
                <Button onClick={handleSaveCopyIntent} className="h-10 px-4 bg-[#2f8bff] hover:bg-[#277be3] text-white rounded-md">
                  Guardar copia
                </Button>
              </div>
            </div>
          </div>

          {/* Resumen del contenido */}
          <div className="pt-2">
            <div className="text-xs text-gray-400 mb-2">{sentenceCase("resumen del contenido")}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-md border border-[#343841] bg-[#1b1d23] px-3 py-2 flex items-center justify-between"
                >
                  <span className="text-xs text-gray-400">{s.label}</span>
                  <span className="text-sm font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detalles JSON (opcional) */}
          <div className="pt-2">
            <button onClick={() => setShowDetails((v) => !v)} className="text-xs text-[#76a7ff] hover:underline">
              {showDetails ? "Ocultar detalles" : "Ver detalles (JSON)"}
            </button>
            {showDetails && (
              <pre className="mt-2 bg-[#1b1d23] rounded p-3 text-xs overflow-x-auto border border-[#343841]">
                {JSON.stringify(profile, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </IndustrialCard>

      {/* NUEVO: Importar / Exportar */}
      <IndustrialCard title="Importar / Exportar">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <Button
            onClick={handleDownloadJSON}
            className="h-10 px-4 bg-[#0ea5e9] hover:bg-[#0b90cc] text-white rounded-md"
          >
            Descargar JSON actual
          </Button>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              onClick={handleUploadClick}
              className="h-10 px-4 bg-[#22c55e] hover:bg-[#1faf54] text-white rounded-md"
            >
              Subir archivo JSON
            </Button>
            {uploadedMeta && (
              <span className="text-xs text-gray-400">
                Cargado: <span className="text-gray-200">{uploadedMeta.name}</span>{" "}
                ({Math.ceil(uploadedMeta.size / 1024)} KB)
              </span>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          La subida solo almacena el archivo (no se aplica al perfil). Próximamente: validación e importación.
        </p>
      </IndustrialCard>

      {/* ADMINISTRACIÓN */}
      <IndustrialCard title={sentenceCase("administración de perfiles")}>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label htmlFor="delete-select" className="block text-xs text-gray-400 mb-1">
              Selecciona un perfil para borrar
            </label>
            <select
              id="delete-select"
              value={deleteTarget}
              onChange={(e) => setDeleteTarget(e.target.value)}
              className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">-- Selecciona un perfil --</option>
              {profiles.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleDeleteIntent}
              disabled={!deleteTarget}
              className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50"
            >
              Borrar perfil
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Si eliges “default”, se interpretará como borrar la configuración actual (según soporte del backend).
        </p>
      </IndustrialCard>

      {/* Diálogos */}
      <AlertDialog open={askOverwrite.open} onOpenChange={(open) => setAskOverwrite((s) => ({ ...s, open }))}>
        <AlertDialogContent className="bg-[#1b1d23] text-white border border-[#343841]">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Sobrescribir “{askOverwrite.targetName}”?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Ya existe un perfil con ese nombre. Si continúas, se sobrescribirá con el perfil actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#272a32] border border-[#343841] text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSaveCopy(askOverwrite.targetName, true)}
              className="bg-[#1e77e5] hover:bg-[#1b6bd0] text-white"
            >
              Sobrescribir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={askDelete} onOpenChange={setAskDelete}>
        <AlertDialogContent className="bg-[#1b1d23] text-white border border-[#343841]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget === "default" ? "Borrar configuración actual" : `Borrar perfil “${deleteTarget}”`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              {deleteTarget === "default"
                ? "Se intentará borrar la configuración actual (dependiente del backend)."
                : "Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#272a32] border border-[#343841] text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
