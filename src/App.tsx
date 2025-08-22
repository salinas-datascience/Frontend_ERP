import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/layout'
import { RequireAuth, RequireAdmin } from './components/auth'
import { Login } from './pages/Auth'

// Importar páginas existentes
import { RepuestosForm, RepuestosDetail, RepuestosDescuento } from './pages/Repuestos'
import RepuestosListOptimized from './pages/Repuestos/ListOptimized'
import { ProveedoresList, ProveedoresForm, ProveedoresDetail } from './pages/Proveedores'
import { MaquinasList, MaquinasForm, MaquinasDetail } from './pages/Maquinas'
import { ModelosMaquinasList, ModelosMaquinasForm, ModelosMaquinasDetail } from './pages/ModelosMaquinas'
import HistorialPage from './pages/Historial'

// Importar páginas de administración
import { AdminDashboard, UsuariosList, UsuarioForm, UserPageAssignment } from './pages/Admin'

// Importar páginas de autenticación
import { ChangePassword } from './pages/Auth'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Ruta de login */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta de cambio de contraseña */}
        <Route path="/change-password" element={
          <RequireAuth>
            <ChangePassword />
          </RequireAuth>
        } />
        
        {/* Rutas protegidas */}
        <Route path="/" element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }>
          <Route index element={<Navigate to="/repuestos" replace />} />
          
          {/* Rutas de repuestos */}
          <Route path="/repuestos" element={<RepuestosListOptimized />} />
          <Route path="/repuestos/nuevo" element={<RepuestosForm />} />
          <Route path="/repuestos/descuento" element={<RepuestosDescuento />} />
          <Route path="/repuestos/:id" element={<RepuestosDetail />} />
          <Route path="/repuestos/:id/editar" element={<RepuestosForm />} />
          
          {/* Rutas de proveedores */}
          <Route path="/proveedores" element={<ProveedoresList />} />
          <Route path="/proveedores/nuevo" element={<ProveedoresForm />} />
          <Route path="/proveedores/:id" element={<ProveedoresDetail />} />
          <Route path="/proveedores/:id/editar" element={<ProveedoresForm />} />
          
          {/* Rutas de máquinas */}
          <Route path="/maquinas" element={<MaquinasList />} />
          <Route path="/maquinas/nuevo" element={<MaquinasForm />} />
          <Route path="/maquinas/:id" element={<MaquinasDetail />} />
          <Route path="/maquinas/:id/editar" element={<MaquinasForm />} />
          
          {/* Rutas de modelos de máquinas */}
          <Route path="/modelos-maquinas" element={<ModelosMaquinasList />} />
          <Route path="/modelos-maquinas/nuevo" element={<ModelosMaquinasForm />} />
          <Route path="/modelos-maquinas/:id" element={<ModelosMaquinasDetail />} />
          <Route path="/modelos-maquinas/:id/editar" element={<ModelosMaquinasForm />} />
          
          {/* Ruta de historial */}
          <Route path="/historial" element={<HistorialPage />} />
          
          {/* Rutas de administración (solo para admins) */}
          <Route path="/admin" element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          } />
          <Route path="/admin/usuarios" element={
            <RequireAdmin>
              <UsuariosList />
            </RequireAdmin>
          } />
          <Route path="/admin/usuarios/nuevo" element={
            <RequireAdmin>
              <UsuarioForm />
            </RequireAdmin>
          } />
          <Route path="/admin/usuarios/:id" element={
            <RequireAdmin>
              <UsuarioForm />
            </RequireAdmin>
          } />
          <Route path="/admin/usuarios/:id/paginas" element={
            <RequireAdmin>
              <UserPageAssignment />
            </RequireAdmin>
          } />
        </Route>

        {/* Ruta por defecto - redirigir a login si no está autenticado */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
