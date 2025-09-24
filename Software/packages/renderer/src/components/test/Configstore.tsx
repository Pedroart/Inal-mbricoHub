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
    }

    const handleSelect = async ( e: React.ChangeEvent<HTMLSelectElement> ) => {
        const selected = e.target.value

        if ( selected && selected !== name){
            await window.api.config.profile.setActive(selected)
        }
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
                    Informacion del Perfil actual
                </h2>
                <pre className="bg-gray-100 rounded p-2 text-sm overflow-x-auto">
                    {JSON.stringify(profile, null, 2)}
                </pre>
            </div>  
        </div>
    )
}