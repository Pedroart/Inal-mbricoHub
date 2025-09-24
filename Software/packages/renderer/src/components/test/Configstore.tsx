import React, { useState, useEffect } from "react";
import type { ConfigProfile } from '../../api/models'

const emptyProfile: ConfigProfile = {
  sensor_type: [],
  entry: [],
  modbus_server: [],
  entry_modbus: [],
  entry_ble: [],
  dashboard_widget: []
}

export default function ProfileTests(){

    const [name,    setName] = useState('')
    const [profiles, setProfiles] = useState<string[]>([])
    const [profile, setProfile] = useState<ConfigProfile>(emptyProfile)
    const [lastChanged, setLastChanged] = useState<Date>(new Date())
    const [newProfileName, setNewProfileName] = useState('')
    const [deleteTarget, setDeleteTarget] = useState('')

    useEffect(()=>{
        window.api.config.profile.getName().then(setName)
        window.api.config.profile.list().then(setProfiles)
        window.api.config.profile.get().then(setProfile)

        window.api.config.profile.onChanged(({ profile }) => {
            setName(profile)
            setLastChanged(new Date()) // registra hora actual
        })
    },[])

    const handleSave = async () => {
        await window.api.config.profile.save()
        await window.api.config.profile.list().then(setProfiles)
    }

    const handleSaveAs = async () => {
        if (!newProfileName.trim()) return
        await window.api.config.profile.saveAs(newProfileName.trim(),false)
        await window.api.config.profile.list().then(setProfiles)
    }

    const handleSelect = async ( e: React.ChangeEvent<HTMLSelectElement> ) => {
        const selected = e.target.value

        if ( selected && selected !== name){
            await window.api.config.profile.setActive(selected)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        if (!confirm(`¿Seguro que deseas borrar el perfil "${deleteTarget}"?`)) return
        await window.api.config.profile.remove(deleteTarget)
        setProfiles(await window.api.config.profile.list())
        // si borramos el activo, se cargará default otra vez en backend
        if (deleteTarget === name) {
        const newActive = await window.api.config.profile.getName()
        setName(newActive)
        setProfile(await window.api.config.profile.get())
        }
        setDeleteTarget('')
    }

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white shadow rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800">
                    Perfil activo
                </h2>
                <p className="text-lg text-indigo-600 mt-2">{name}</p>
                <p className="text-lg mt-2">{lastChanged.toLocaleTimeString()}</p>
                <button onClick={handleSave} > Actualizar </button>
            </div>
            <div className="bg-white shadow rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800">
                    Lista de Perfiles
                </h2>
                <ul className="divide-y divide-gray-200">
                    {profiles.map(_profile => {
                        return <li key={_profile}>{_profile}</li>
                    })}
                </ul>
                <select
                    id="profile-select"
                    value={name}
                    onChange={handleSelect}
                    className="border rounded-md px-2 py-1 text-sm"
                >
                    {profiles.map((p) => (
                    <option key={p} value={p}>
                        {p || "(sin nombre)"}
                    </option>
                    ))}
                </select>
            </div>
            <div className="bg-white shadow rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800">
                    Guardar o Clonar
                </h2>
                <input
                    type="text"
                    placeholder="Nuevo nombre"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="border rounded-md px-2 py-1 text-sm flex-1"
                />
                <button
                    onClick={handleSaveAs}
                >
                    Guardar como
                </button>
            </div>
            
            <div className="bg-white shadow rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-semibold text-red-700">Borrar perfil</h2>
                <select
                value={deleteTarget}
                onChange={(e) => setDeleteTarget(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm w-full"
                >
                <option value="">-- Selecciona un perfil --</option>
                {profiles
                    .filter((p) => p !== "default") // opcional: proteger default
                    .map((p) => (
                    <option key={p} value={p}>
                        {p}
                    </option>
                    ))}
                </select>
                <button
                onClick={handleDelete}
                disabled={!deleteTarget}
                className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50"
                >
                Borrar perfil
                </button>
            </div>

            <div className="bg-white shadow rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800">
                    Informacion del Perfil actual
                </h2>
                <pre className="bg-gray-100 rounded p-2 text-sm overflow-x-auto">
                    {JSON.stringify(profile, null, 2)}
                </pre>
            </div>  
        </div>
    )
}