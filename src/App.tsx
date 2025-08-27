import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/layout'
import { RequireAuth, RequireAdmin, RequirePageAccess } from './components/auth'
import { Login } from './pages/Auth'

// Importar páginas existentes
import { RepuestosForm, RepuestosDetail, RepuestosDescuento } from './pages/Repuestos'
import RepuestosListOptimized from './pages/Repuestos/ListOptimized'
import { ProveedoresList, ProveedoresForm, ProveedoresDetail } from './pages/Proveedores'
import { MaquinasList, MaquinasForm, MaquinasDetail } from './pages/Maquinas'
import { ModelosMaquinasList, ModelosMaquinasForm, ModelosMaquinasDetail } from './pages/ModelosMaquinas'
import { OrdenesCompraList, OrdenCompraForm, OrdenCompraDetail, ConfirmarLlegada, DocumentUpload } from './pages/OrdenesCompra'
import HistorialPage from './pages/Historial'

// Importar páginas de administración
import { AdminDashboard, UsuariosList, UsuarioForm, UserPageAssignment } from './pages/Admin'
import { RolesList, RoleForm } from './pages/Admin/Roles'
import { PermisosList, PermisosForm } from './pages/Admin/Permisos'

// Importar páginas de autenticación
import { ChangePassword } from './pages/Auth'

// Importar páginas de órdenes de trabajo
import { OrdenesTrabajoList, MisOrdenesTrabajoList, OrdenTrabajoForm, OrdenTrabajoDetail } from './pages/OrdenesTrabajoMantenimiento'

// Importar dashboard de métricas
import { MetricasDashboard } from './pages/Dashboard'

// Importar plan de mantenimiento
import { PlanMantenimiento } from './pages/PlanMantenimiento'

// Importar analytics de IA
import { AnalyticsDashboard } from './pages/Analytics'

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
          <Route path="/repuestos" element={
            <RequirePageAccess pagePath="/repuestos">
              <RepuestosListOptimized />
            </RequirePageAccess>
          } />
          <Route path="/repuestos/nuevo" element={
            <RequirePageAccess pagePath="/repuestos">
              <RepuestosForm />
            </RequirePageAccess>
          } />
          <Route path="/repuestos/descuento" element={
            <RequirePageAccess pagePath="/repuestos">
              <RepuestosDescuento />
            </RequirePageAccess>
          } />
          <Route path="/repuestos/:id" element={
            <RequirePageAccess pagePath="/repuestos">
              <RepuestosDetail />
            </RequirePageAccess>
          } />
          <Route path="/repuestos/:id/editar" element={
            <RequirePageAccess pagePath="/repuestos">
              <RepuestosForm />
            </RequirePageAccess>
          } />
          
          {/* Rutas de proveedores */}
          <Route path="/proveedores" element={
            <RequirePageAccess pagePath="/proveedores">
              <ProveedoresList />
            </RequirePageAccess>
          } />
          <Route path="/proveedores/nuevo" element={
            <RequirePageAccess pagePath="/proveedores">
              <ProveedoresForm />
            </RequirePageAccess>
          } />
          <Route path="/proveedores/:id" element={
            <RequirePageAccess pagePath="/proveedores">
              <ProveedoresDetail />
            </RequirePageAccess>
          } />
          <Route path="/proveedores/:id/editar" element={
            <RequirePageAccess pagePath="/proveedores">
              <ProveedoresForm />
            </RequirePageAccess>
          } />
          
          {/* Rutas de máquinas */}
          <Route path="/maquinas" element={
            <RequirePageAccess pagePath="/maquinas">
              <MaquinasList />
            </RequirePageAccess>
          } />
          <Route path="/maquinas/nuevo" element={
            <RequirePageAccess pagePath="/maquinas">
              <MaquinasForm />
            </RequirePageAccess>
          } />
          <Route path="/maquinas/:id" element={
            <RequirePageAccess pagePath="/maquinas">
              <MaquinasDetail />
            </RequirePageAccess>
          } />
          <Route path="/maquinas/:id/editar" element={
            <RequirePageAccess pagePath="/maquinas">
              <MaquinasForm />
            </RequirePageAccess>
          } />
          
          {/* Rutas de modelos de máquinas */}
          <Route path="/modelos-maquinas" element={
            <RequirePageAccess pagePath="/modelos-maquinas">
              <ModelosMaquinasList />
            </RequirePageAccess>
          } />
          <Route path="/modelos-maquinas/nuevo" element={
            <RequirePageAccess pagePath="/modelos-maquinas">
              <ModelosMaquinasForm />
            </RequirePageAccess>
          } />
          <Route path="/modelos-maquinas/:id" element={
            <RequirePageAccess pagePath="/modelos-maquinas">
              <ModelosMaquinasDetail />
            </RequirePageAccess>
          } />
          <Route path="/modelos-maquinas/:id/editar" element={
            <RequirePageAccess pagePath="/modelos-maquinas">
              <ModelosMaquinasForm />
            </RequirePageAccess>
          } />
          
          {/* Ruta de historial */}
          <Route path="/historial" element={
            <RequirePageAccess pagePath="/historial">
              <HistorialPage />
            </RequirePageAccess>
          } />

          {/* Rutas de órdenes de compra */}
          <Route path="/ordenes-compra" element={
            <RequirePageAccess pagePath="/ordenes-compra">
              <OrdenesCompraList />
            </RequirePageAccess>
          } />
          <Route path="/ordenes-compra/nuevo" element={
            <RequirePageAccess pagePath="/ordenes-compra">
              <OrdenCompraForm />
            </RequirePageAccess>
          } />
          <Route path="/ordenes-compra/:id" element={
            <RequirePageAccess pagePath="/ordenes-compra">
              <OrdenCompraDetail />
            </RequirePageAccess>
          } />
          <Route path="/ordenes-compra/:id/editar" element={
            <RequirePageAccess pagePath="/ordenes-compra">
              <OrdenCompraForm />
            </RequirePageAccess>
          } />
          <Route path="/ordenes-compra/:id/documents" element={
            <RequirePageAccess pagePath="/ordenes-compra">
              <DocumentUpload />
            </RequirePageAccess>
          } />
          <Route path="/ordenes-compra/:id/confirmar-llegada" element={
            <RequirePageAccess pagePath="/ordenes-compra">
              <ConfirmarLlegada />
            </RequirePageAccess>
          } />
          
          {/* Rutas de órdenes de trabajo de mantenimiento */}
          <Route path="/ordenes-trabajo" element={
            <RequirePageAccess pagePath="/ordenes-trabajo">
              <OrdenesTrabajoList />
            </RequirePageAccess>
          } />
          <Route path="/ordenes-trabajo/nuevo" element={
            <RequirePageAccess pagePath="/ordenes-trabajo">
              <OrdenTrabajoForm />
            </RequirePageAccess>
          } />
          <Route path="/ordenes-trabajo/:id" element={
            <RequirePageAccess pagePath="/ordenes-trabajo">
              <OrdenTrabajoDetail />
            </RequirePageAccess>
          } />
          <Route path="/ordenes-trabajo/:id/editar" element={
            <RequirePageAccess pagePath="/ordenes-trabajo">
              <OrdenTrabajoForm />
            </RequirePageAccess>
          } />
          
          {/* Ruta para OTs asignadas */}
          <Route path="/mis-ordenes-trabajo" element={
            <RequirePageAccess pagePath="/mis-ordenes-trabajo">
              <MisOrdenesTrabajoList />
            </RequirePageAccess>
          } />
          
          {/* Ruta para dashboard de métricas */}
          <Route path="/dashboard-metricas" element={
            <RequirePageAccess pagePath="/dashboard-metricas">
              <MetricasDashboard />
            </RequirePageAccess>
          } />
          
          {/* Ruta para plan de mantenimiento */}
          <Route path="/plan-mantenimiento" element={
            <RequirePageAccess pagePath="/plan-mantenimiento">
              <PlanMantenimiento />
            </RequirePageAccess>
          } />
          
          {/* Ruta para analytics de IA */}
          <Route path="/analytics-ia" element={
            <RequirePageAccess pagePath="/analytics-ia">
              <AnalyticsDashboard />
            </RequirePageAccess>
          } />
          
          {/* Rutas de administración (solo para admins) */}
          <Route path="/admin" element={
            <RequireAdmin>
              <RequirePageAccess pagePath="/admin">
                <AdminDashboard />
              </RequirePageAccess>
            </RequireAdmin>
          } />
          <Route path="/admin/usuarios" element={
            <RequireAdmin>
              <RequirePageAccess pagePath="/admin/usuarios">
                <UsuariosList />
              </RequirePageAccess>
            </RequireAdmin>
          } />
          <Route path="/admin/usuarios/nuevo" element={
            <RequireAdmin>
              <RequirePageAccess pagePath="/admin/usuarios">
                <UsuarioForm />
              </RequirePageAccess>
            </RequireAdmin>
          } />
          <Route path="/admin/usuarios/:id" element={
            <RequireAdmin>
              <RequirePageAccess pagePath="/admin/usuarios">
                <UsuarioForm />
              </RequirePageAccess>
            </RequireAdmin>
          } />
          <Route path="/admin/usuarios/:id/paginas" element={
            <RequireAdmin>
              <RequirePageAccess pagePath="/admin/usuarios">
                <UserPageAssignment />
              </RequirePageAccess>
            </RequireAdmin>
          } />
          
          {/* Rutas de roles */}
          <Route path="/admin/roles" element={
            <RequireAdmin>
              <RequirePageAccess pagePath="/admin/roles">
                <RolesList />
              </RequirePageAccess>
            </RequireAdmin>
          } />
          <Route path="/admin/roles/nuevo" element={
            <RequireAdmin>
              <RequirePageAccess pagePath="/admin/roles">
                <RoleForm />
              </RequirePageAccess>
            </RequireAdmin>
          } />
          <Route path="/admin/roles/:id" element={
            <RequireAdmin>
              <RequirePageAccess pagePath="/admin/roles">
                <RoleForm />
              </RequirePageAccess>
            </RequireAdmin>
          } />
          
          {/* Rutas de permisos */}
          <Route path="/admin/permisos" element={
            <RequireAdmin>
              <RequirePageAccess pagePath="/admin/permisos">
                <PermisosList />
              </RequirePageAccess>
            </RequireAdmin>
          } />
          <Route path="/admin/permisos/nuevo" element={
            <RequireAdmin>
              <RequirePageAccess pagePath="/admin/permisos">
                <PermisosForm />
              </RequirePageAccess>
            </RequireAdmin>
          } />
          <Route path="/admin/permisos/:id" element={
            <RequireAdmin>
              <RequirePageAccess pagePath="/admin/permisos">
                <PermisosForm />
              </RequirePageAccess>
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
