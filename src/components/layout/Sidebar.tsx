import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  Package, 
  Users, 
  Monitor, 
  History,
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Repuestos',
    href: '/repuestos',
    icon: Package,
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
    name: 'Historial',
    href: '/historial',
    icon: History,
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

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
        </ul>
      </nav>
    </aside>
  );
};

export { Sidebar };