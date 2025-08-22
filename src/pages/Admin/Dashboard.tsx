import { Link } from 'react-router-dom';
import { Users, Shield, Key, Activity, UserPlus, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { adminUsersService, adminRolesService, adminPaginasService } from '../../api/admin';

export default function AdminDashboard() {
  const { authState } = useAuth();

  // Queries para obtener datos reales
  const { data: usuarios = [], isLoading: loadingUsuarios } = useQuery({
    queryKey: ['admin', 'usuarios'],
    queryFn: () => adminUsersService.getUsuarios(0, 100),
  });

  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => adminRolesService.getRoles(0, 100),
  });

  const { data: paginas = [], isLoading: loadingPaginas } = useQuery({
    queryKey: ['admin', 'paginas'],
    queryFn: () => adminPaginasService.getPaginas(0, 100),
  });

  // Calcular estadísticas
  const usuariosActivos = usuarios.filter(u => u.activo).length;
  const usuariosAdmin = usuarios.filter(u => u.es_admin).length;
  const rolesActivos = roles.filter(r => r.activo).length;
  const paginasActivas = paginas.filter(p => p.activa).length;

  const adminCards = [
    {
      title: 'Usuarios',
      description: 'Gestionar usuarios del sistema',
      icon: Users,
      link: '/admin/usuarios',
      bgColor: 'bg-blue-600',
      textColor: 'text-blue-400',
      bgLight: 'bg-gray-700',
      count: usuarios.length || 0,
      countLabel: `${usuariosActivos} activos`,
      loading: loadingUsuarios
    },
    {
      title: 'Roles',
      description: 'Administrar roles del sistema',
      icon: Shield,
      link: '/admin/roles',
      bgColor: 'bg-green-600',
      textColor: 'text-green-400',
      bgLight: 'bg-gray-700',
      count: roles.length || 0,
      countLabel: `${rolesActivos} activos`,
      loading: loadingRoles
    },
    {
      title: 'Permisos',
      description: 'Gestionar permisos granulares',
      icon: Key,
      link: '/admin/permisos',
      bgColor: 'bg-purple-600',
      textColor: 'text-purple-400',
      bgLight: 'bg-gray-700',
      count: paginas.length || 0,
      countLabel: `${paginasActivas} activas`,
      loading: loadingPaginas
    },
    {
      title: 'Administradores',
      description: 'Usuarios con permisos admin',
      icon: Activity,
      link: '/admin/usuarios',
      bgColor: 'bg-orange-600',
      textColor: 'text-orange-400',
      bgLight: 'bg-gray-700',
      count: usuariosAdmin || 0,
      countLabel: 'con permisos admin',
      loading: loadingUsuarios
    }
  ];

  const quickActions = [
    {
      title: 'Crear Usuario',
      description: 'Agregar nuevo usuario al sistema',
      icon: UserPlus,
      link: '/admin/usuarios/nuevo',
      bgColor: 'bg-blue-600',
      textColor: 'text-white',
      hoverColor: 'hover:bg-blue-700'
    },
    {
      title: 'Ver Usuarios',
      description: 'Gestionar usuarios existentes',
      icon: Users,
      link: '/admin/usuarios',
      bgColor: 'bg-green-600',
      textColor: 'text-white',
      hoverColor: 'hover:bg-green-700'
    },
    {
      title: 'Gestionar Roles',
      description: 'Administrar roles del sistema',
      icon: Shield,
      link: '/admin/roles',
      bgColor: 'bg-purple-600',
      textColor: 'text-white',
      hoverColor: 'hover:bg-purple-700'
    },
    {
      title: 'Gestionar Permisos',
      description: 'Configurar permisos granulares',
      icon: Key,
      link: '/admin/permisos',
      bgColor: 'bg-orange-600',
      textColor: 'text-white',
      hoverColor: 'hover:bg-orange-700'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Panel de Administración
        </h1>
        <p className="text-gray-200">
          Bienvenido, {authState.user?.nombre_completo || authState.user?.username}. 
          Gestiona usuarios, roles y permisos del sistema.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {adminCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border-2 border-gray-700 hover:border-gray-600"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bgColor} p-3 rounded-lg shadow-sm`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              {card.loading && (
                <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
              )}
            </div>
            <div className="mb-3">
              <h3 className="text-lg font-bold text-gray-100 mb-1">
                {card.title}
              </h3>
              <p className="text-sm text-gray-400">
                {card.description}
              </p>
            </div>
            <div className={`${card.bgLight} rounded-lg p-3 border border-gray-600`}>
              <div className="flex items-baseline justify-between">
                <div className={`text-2xl font-bold ${card.textColor}`}>
                  {card.loading ? '...' : card.count}
                </div>
                <div className="text-xs text-gray-300 font-bold">
                  {card.countLabel}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl shadow-sm border-2 border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-100 mb-6">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`flex items-center p-4 rounded-xl shadow-sm transition-all duration-200 ${action.bgColor} ${action.textColor} ${action.hoverColor}`}
            >
              <div className="p-2 rounded-lg bg-gray-900 bg-opacity-50 shadow-sm">
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-bold">
                  {action.title}
                </h3>
                <p className="text-xs opacity-90">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl shadow-sm border-2 border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-6">
          Resumen del Sistema
        </h2>
        <div className="space-y-4">
          {[
            { 
              action: 'Sistema Operativo', 
              details: `${usuarios.length} usuarios registrados en total`, 
              time: 'Actualizado ahora',
              color: 'bg-green-500'
            },
            { 
              action: 'Usuarios Activos', 
              details: `${usuariosActivos} usuarios pueden acceder al sistema`, 
              time: 'En tiempo real',
              color: 'bg-blue-500'
            },
            { 
              action: 'Administradores', 
              details: `${usuariosAdmin} usuarios con permisos administrativos`, 
              time: 'Verificado',
              color: 'bg-purple-500'
            },
            { 
              action: 'Configuración', 
              details: `${roles.length} roles y ${paginas.length} páginas configuradas`, 
              time: 'Sistema listo',
              color: 'bg-orange-500'
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-center py-4 px-4 bg-gray-700 rounded-lg border-2 border-gray-600">
              <div className={`w-4 h-4 ${activity.color} rounded-full mr-4 shadow-md`}></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-100">
                  {activity.action}
                </p>
                <p className="text-xs text-gray-300 mt-1 font-medium">
                  {activity.details}
                </p>
              </div>
              <div className="text-xs text-gray-100 bg-gray-600 px-3 py-1 rounded-md border-2 border-gray-500 font-bold">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t-2 border-gray-600">
          <Link 
            to="/admin/usuarios"
            className="inline-flex items-center text-sm text-white font-bold bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg shadow-sm transition-colors"
          >
            Gestionar Usuarios →
          </Link>
        </div>
      </div>
    </div>
  );
}