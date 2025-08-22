import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface RequirePageAccessProps {
  children: ReactNode;
  pagePath: string;
  fallbackPath?: string;
}

export function RequirePageAccess({ 
  children, 
  pagePath, 
  fallbackPath = '/unauthorized' 
}: RequirePageAccessProps) {
  const { canAccessPage } = usePermissions();
  const location = useLocation();

  const hasAccess = canAccessPage(pagePath);

  if (!hasAccess) {
    // Si hay un fallback específico, redirigir allí
    if (fallbackPath !== '/unauthorized') {
      return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }

    // Mostrar página de acceso denegado
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
}

function UnauthorizedPage() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Contenedor principal */}
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8 text-center">
          {/* Icono de advertencia */}
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-white mb-4">
            Acceso Denegado
          </h1>

          {/* Mensaje */}
          <p className="text-gray-300 mb-6">
            No tienes permisos para acceder a esta página. 
            Si crees que esto es un error, contacta con tu administrador.
          </p>

          {/* Información de la ruta */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-1">Página solicitada:</p>
            <p className="text-sm font-mono text-gray-200">
              {location.pathname}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Button
              onClick={() => window.history.back()}
              variant="primary"
              className="w-full flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver atrás
            </Button>
            
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full"
            >
              Ir al inicio
            </Button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-gray-600">
            <p className="text-xs text-gray-500">
              Si necesitas acceso a esta página, solicítalo a tu administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequirePageAccess;