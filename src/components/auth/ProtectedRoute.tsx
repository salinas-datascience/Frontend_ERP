import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { authState } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-sm text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si el usuario debe cambiar contraseña y no está en la página de cambio
  if (authState.user?.debe_cambiar_password && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // Si requiere admin y el usuario no es admin
  if (requireAdmin && !authState.user?.es_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acceso denegado</h3>
          <p className="mt-1 text-sm text-gray-500">
            No tienes permisos de administrador para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
}

// Componente para rutas que requieren autenticación
export function RequireAuth({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

// Componente para rutas que requieren permisos de admin
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAdmin>{children}</ProtectedRoute>;
}