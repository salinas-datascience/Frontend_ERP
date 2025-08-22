import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  Key,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Unlock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { adminUsersService } from '../../../api/admin';
import type { Usuario } from '../../../types/admin';

export default function UsuariosList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const queryClient = useQueryClient();

  // Query para obtener usuarios
  const { data: usuarios = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'usuarios'],
    queryFn: () => adminUsersService.getUsuarios(0, 100),
  });

  // Mutaciones
  const activateMutation = useMutation({
    mutationFn: adminUsersService.activateUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: adminUsersService.deleteUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] });
    },
  });

  const unlockMutation = useMutation({
    mutationFn: adminUsersService.unlockUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] });
    },
  });

  // Filtrar usuarios
  const filteredUsuarios = usuarios.filter((usuario: Usuario) => {
    const matchesSearch = 
      usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usuario.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && usuario.activo) ||
      (filterStatus === 'inactive' && !usuario.activo);

    return matchesSearch && matchesFilter;
  });

  const handleActivate = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres reactivar este usuario?')) {
      try {
        await activateMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error al reactivar usuario:', error);
      }
    }
  };

  const handleDeactivate = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este usuario?')) {
      try {
        await deactivateMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error al desactivar usuario:', error);
      }
    }
  };

  const handleUnlock = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres desbloquear este usuario?')) {
      try {
        await unlockMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error al desbloquear usuario:', error);
      }
    }
  };

  const getStatusIcon = (usuario: Usuario) => {
    if (!usuario.activo) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusText = (usuario: Usuario) => {
    if (!usuario.activo) return 'Inactivo';
    if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
      return 'Bloqueado';
    }
    return 'Activo';
  };

  const isUserBlocked = (usuario: Usuario) => {
    return usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date();
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">Error al cargar usuarios: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-2">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-200 mt-1">
              Administrar usuarios del sistema y sus permisos
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="flex items-center"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Link to="/admin/usuarios/nuevo">
              <Button variant="primary" className="flex items-center">
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar por usuario, email o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-600 rounded-md text-sm text-gray-100 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Solo activos</option>
              <option value="inactive">Solo inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { 
            label: 'Total Usuarios', 
            value: usuarios.length, 
            color: 'text-blue-600 bg-blue-100' 
          },
          { 
            label: 'Usuarios Activos', 
            value: usuarios.filter(u => u.activo).length, 
            color: 'text-green-600 bg-green-100' 
          },
          { 
            label: 'Administradores', 
            value: usuarios.filter(u => u.es_admin).length, 
            color: 'text-purple-600 bg-purple-100' 
          },
          { 
            label: 'Bloqueados', 
            value: usuarios.filter(u => isUserBlocked(u)).length, 
            color: 'text-red-600 bg-red-100' 
          }
        ].map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-gray-300">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Último Acceso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredUsuarios.map((usuario: Usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {usuario.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-100">
                            {usuario.username}
                            {usuario.es_admin && (
                              <Shield className="w-4 h-4 text-purple-500 inline ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-400">{usuario.email}</div>
                          {usuario.nombre_completo && (
                            <div className="text-xs text-gray-400">{usuario.nombre_completo}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(usuario)}
                        <span className="ml-2 text-sm text-gray-100">
                          {getStatusText(usuario)}
                        </span>
                      </div>
                      {usuario.debe_cambiar_password && (
                        <div className="text-xs text-yellow-400 mt-1">
                          Debe cambiar contraseña
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                      {usuario.rol?.nombre || 'Sin rol'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {usuario.ultima_conexion 
                        ? new Date(usuario.ultima_conexion).toLocaleDateString()
                        : 'Nunca'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        to={`/admin/usuarios/${usuario.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </Link>
                      
                      <Link
                        to={`/admin/usuarios/${usuario.id}/paginas`}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Key className="w-4 h-4 inline" />
                      </Link>

                      {isUserBlocked(usuario) && (
                        <button
                          onClick={() => handleUnlock(usuario.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Desbloquear usuario"
                        >
                          <Unlock className="w-4 h-4 inline" />
                        </button>
                      )}

                      {usuario.activo ? (
                        <button
                          onClick={() => handleDeactivate(usuario.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Desactivar usuario"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(usuario.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Reactivar usuario"
                        >
                          <CheckCircle className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsuarios.length === 0 && (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios disponibles'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}