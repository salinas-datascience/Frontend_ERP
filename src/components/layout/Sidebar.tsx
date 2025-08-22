import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Package, 
  Users, 
  Monitor, 
  History,
  Settings,
  Minus,
  Shield,
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Repuestos',
    href: '/repuestos',
    icon: Package,
  },
  {
    name: 'Descuento Repuestos',
    href: '/repuestos/descuento',
    icon: Minus,
  },
  {
    name: 'Proveedores',
    href: '/proveedores',
    icon: Users,
  },
  {
    name: 'Máquinas',
    href: '/maquinas',
    icon: Monitor,
  },
  {
    name: 'Modelos de Máquinas',
    href: '/modelos-maquinas',
    icon: Settings,
  },
  {
    name: 'Historial',
    href: '/historial',
    icon: History,
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { authState } = useAuth();

  return (
    <aside className="bg-gray-800 w-64 min-h-screen border-r border-gray-700">
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}

          {/* Separador y sección de administración */}
          {authState.user?.es_admin && (
            <>
              <li className="pt-4 mt-4 border-t border-gray-700">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2">
                  Administración
                </div>
              </li>
              <li>
                <Link
                  to="/admin"
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    location.pathname.startsWith('/admin')
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                >
                  <Shield className="w-5 h-5 mr-3" />
                  Panel de Admin
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export { Sidebar };