import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout'
import { RepuestosForm, RepuestosDetail } from './pages/Repuestos'
import RepuestosListOptimized from './pages/Repuestos/ListOptimized'
import ProveedoresPage from './pages/Proveedores'
import MaquinasPage from './pages/Maquinas'
import HistorialPage from './pages/Historial'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/repuestos" replace />} />
        
        <Route path="/repuestos" element={<RepuestosListOptimized />} />
        <Route path="/repuestos/nuevo" element={<RepuestosForm />} />
        <Route path="/repuestos/:id" element={<RepuestosDetail />} />
        <Route path="/repuestos/:id/editar" element={<RepuestosForm />} />
        
        <Route path="/proveedores" element={<ProveedoresPage />} />
        <Route path="/maquinas" element={<MaquinasPage />} />
        <Route path="/historial" element={<HistorialPage />} />
      </Route>
    </Routes>
  )
}

export default App
