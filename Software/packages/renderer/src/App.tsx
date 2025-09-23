import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

export default function App() {
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const name = await window.api.config.profile.getName()
      if (mounted) setActive(name)
    })()
    return () => { mounted = false }
  }, [])

  return <h1>Perfil activo: {active}</h1>
}