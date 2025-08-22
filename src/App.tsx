import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout'
import { RepuestosForm, RepuestosDetail, RepuestosDescuento } from './pages/Repuestos'
import RepuestosListOptimized from './pages/Repuestos/ListOptimized'
import { ProveedoresList, ProveedoresForm, ProveedoresDetail } from './pages/Proveedores'
import { MaquinasList, MaquinasForm, MaquinasDetail } from './pages/Maquinas'
import { ModelosMaquinasList, ModelosMaquinasForm, ModelosMaquinasDetail } from './pages/ModelosMaquinas'
import HistorialPage from './pages/Historial'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/repuestos" replace />} />
        
        <Route path="/repuestos" element={<RepuestosListOptimized />} />
        <Route path="/repuestos/nuevo" element={<RepuestosForm />} />
        <Route path="/repuestos/descuento" element={<RepuestosDescuento />} />
        <Route path="/repuestos/:id" element={<RepuestosDetail />} />
        <Route path="/repuestos/:id/editar" element={<RepuestosForm />} />
        
        <Route path="/proveedores" element={<ProveedoresList />} />
        <Route path="/proveedores/nuevo" element={<ProveedoresForm />} />
        <Route path="/proveedores/:id" element={<ProveedoresDetail />} />
        <Route path="/proveedores/:id/editar" element={<ProveedoresForm />} />
        <Route path="/maquinas" element={<MaquinasList />} />
        <Route path="/maquinas/nuevo" element={<MaquinasForm />} />
        <Route path="/maquinas/:id" element={<MaquinasDetail />} />
        <Route path="/maquinas/:id/editar" element={<MaquinasForm />} />
        <Route path="/modelos-maquinas" element={<ModelosMaquinasList />} />
        <Route path="/modelos-maquinas/nuevo" element={<ModelosMaquinasForm />} />
        <Route path="/modelos-maquinas/:id" element={<ModelosMaquinasDetail />} />
        <Route path="/modelos-maquinas/:id/editar" element={<ModelosMaquinasForm />} />
        
        <Route path="/historial" element={<HistorialPage />} />
      </Route>
    </Routes>
  )
}

export default App
