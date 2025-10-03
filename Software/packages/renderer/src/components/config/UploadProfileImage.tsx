import { useState } from "react"

type UploadProfileImageProps = {
  /** bandera externa que indica si hay una imagen subida */
  uploaded?: boolean
  /** setter externo para notificar cambios */
  setUploaded?: (value: boolean) => void
}

export function UploadProfileImage({ uploaded, setUploaded }: UploadProfileImageProps) {
  const [_, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Mostrar preview rápida
    setPreviewUrl(URL.createObjectURL(file))

    // Leer bytes para enviar al main
    const buffer = new Uint8Array(await file.arrayBuffer())
    setUploading(true)

    try {
      const ok = await window.api.config.profile.saveImageToProfile(buffer)
      console.log("Imagen subida:", ok)

      // 👇 avisar al padre que la imagen se subió
      if (ok && setUploaded) {
        setUploaded(true)
      }
    } catch (err) {
      console.error("Error subiendo imagen:", err)
      if (setUploaded) setUploaded(false)
    } finally {
      setUploading(false)
    }
  }

  return (
    <label
      className="h-8 px-3 flex items-center justify-center cursor-pointer
                 bg-[#1e77e5] hover:bg-[#1b6bd0] text-white rounded-md"
    >
      {uploading
        ? "Subiendo..."
        : uploaded
          ? "Imagen subida"
          : "Seleccionar Imagen"}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        hidden
      />
    </label>
  )
}
