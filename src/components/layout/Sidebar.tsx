import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { 
  Package, 
  Users, 
  Monitor, 
  History,
  Settings,
  Minus,
  Shield,
  Key,
  Cpu,
  Home,
  Wrench,
  ClipboardList,
  Warehouse,
  ShoppingCart,
  BarChart3,
  Calendar,
  Brain,
  type LucideIcon
} from 'lucide-react';

// Mapeo de iconos por nombre de página
const iconMap: Record<string, LucideIcon> = {
  'Package': Package,
  'Users': Users,
  'Settings': Settings,
  'Monitor': Monitor,
  'Cpu': Cpu,
  'History': History,
  'Shield': Shield,
  'Key': Key,
  'Home': Home,
  'Wrench': Wrench,
  'ClipboardList': ClipboardList,
  'Warehouse': Warehouse,
  'ShoppingCart': ShoppingCart,
  'BarChart3': BarChart3,
  'Calendar': Calendar,
  'Brain': Brain,
  'Minus': Minus,
};

// Función para obtener el icono por nombre
const getIcon = (iconName: string | null): LucideIcon => {
  if (!iconName || !iconMap[iconName]) {
    return Settings; // Icono por defecto
  }
  return iconMap[iconName];
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { authState } = useAuth();
  const { getSystemPages, getAdminPages, canAccessPage } = usePermissions();

  // Obtener páginas permitidas
  const systemPages = getSystemPages();
  const adminPages = getAdminPages();

  // Categorizar páginas del sistema
  const categorizePages = (pages: any[]) => {
    const categories = {
      inventario: {
        title: 'Inventario & Stock',
        icon: Package,
        pages: pages.filter(p => ['repuestos', 'proveedores', 'ordenes_compra'].includes(p.nombre))
      },
      mantenimiento: {
        title: 'Equipos & Mantenimiento',
        icon: Settings,
        pages: pages.filter(p => ['maquinas', 'modelos_maquinas', 'plan_mantenimiento', 'ordenes_trabajo', 'mis_ordenes_trabajo'].includes(p.nombre))
      },
      analytics: {
        title: 'Análisis & Reportes',
        icon: BarChart3,
        pages: pages.filter(p => ['analytics_ia', 'dashboard_metricas', 'historial'].includes(p.nombre))
      }
    };

    // Filtrar categorías vacías
    return Object.entries(categories).filter(([_, category]) => category.pages.length > 0);
  };

  const categorizedPages = categorizePages(systemPages);

  return (
    <aside className="bg-gray-800 w-64 min-h-screen border-r border-gray-700">
      <nav className="p-4">
        <ul className="space-y-4">
          {/* Páginas categorizadas del sistema */}
          {categorizedPages.map(([categoryKey, category], index) => (
            <li key={categoryKey} className="space-y-2">
              {/* Separador entre categorías (excepto la primera) */}
              {index > 0 && <div className="border-t border-gray-700 pt-4"></div>}
              
              {/* Header de categoría */}
              <div className="px-3 py-2">
                <div className="flex items-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.title}
                </div>
              </div>
              
              {/* Páginas de la categoría */}
              <ul className="space-y-1">
                {category.pages.map((page) => {
                  const Icon = getIcon(page.icono);
                  const isActive = location.pathname.startsWith(page.ruta);
                  
                  // Verificar acceso antes de mostrar
                  if (!canAccessPage(page.ruta)) {
                    return null;
                  }
                  
                  return (
                    <li key={page.id}>
                      <Link
                        to={page.ruta}
                        className={cn(
                          'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ml-2',
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        )}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {page.titulo}
                      </Link>
                      
                      {/* Subpágina de descuento para repuestos */}
                      {page.ruta === '/repuestos' && canAccessPage('/repuestos') && (
                        <ul className="ml-8 mt-1 space-y-1">
                          <li>
                            <Link
                              to="/repuestos/descuento"
                              className={cn(
                                'flex items-center px-3 py-1.5 rounded-md text-sm transition-colors',
                                location.pathname === '/repuestos/descuento'
                                  ? 'bg-blue-500 text-white'
                                  : 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                              )}
                            >
                              <Minus className="w-3 h-3 mr-2" />
                              Descuento
                            </Link>
                          </li>
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}

          {/* Separador y sección de administración */}
          {adminPages.length > 0 && (
            <>
              <li className="pt-4 mt-4 border-t border-gray-700">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2">
                  Administración
                </div>
              </li>
              
              {adminPages.map((page) => {
                const Icon = getIcon(page.icono);
                const isActive = location.pathname.startsWith(page.ruta);
                
                return (
                  <li key={page.id}>
                    <Link
                      to={page.ruta}
                      className={cn(
                        'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      )}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {page.titulo}
                    </Link>
                  </li>
                );
              })}
            </>
          )}

          {/* Fallback para navegación básica si no hay páginas cargadas */}
          {systemPages.length === 0 && !authState.user?.paginas_permitidas && (
            <li>
              <div className="px-3 py-2 text-sm text-gray-400">
                Cargando navegación...
              </div>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export { Sidebar };