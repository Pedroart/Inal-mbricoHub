import { Routes, Route, HashRouter } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Machines from "./pages/Machines"
import Settings from "./pages/Settings"

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/machines" element={<Machines />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  )
}
