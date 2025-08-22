import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Key
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { adminRolesService } from '../../../api/admin';
import type { Rol } from '../../../types/admin';

export default function RolesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => adminRolesService.getRoles(0, 100),
  });

  const deleteMutation = useMutation({
    mutationFn: adminRolesService.deleteRol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
  });

  const filteredRoles = roles.filter((rol: Rol) => {
    const matchesSearch = 
      rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rol.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && rol.activo) ||
      (filterStatus === 'inactive' && !rol.activo);

    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el rol "${nombre}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error al eliminar rol:', error);
      }
    }
  };

  const getStatusIcon = (rol: Rol) => {
    return rol.activo 
      ? <CheckCircle className="w-5 h-5 text-green-500" />
      : <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = (rol: Rol) => {
    return rol.activo ? 'Activo' : 'Inactivo';
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">Error al cargar roles: {error.message}</p>
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
              <Shield className="w-6 h-6 mr-2" />
              Gestión de Roles
            </h1>
            <p className="text-gray-200 mt-1">
              Administrar roles del sistema y sus permisos
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
            <Link to="/admin/roles/nuevo">
              <Button variant="primary" className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Rol
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
                placeholder="Buscar por nombre o descripción..."
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { 
            label: 'Total Roles', 
            value: roles.length, 
            color: 'text-blue-600 bg-blue-100' 
          },
          { 
            label: 'Roles Activos', 
            value: roles.filter(r => r.activo).length, 
            color: 'text-green-600 bg-green-100' 
          },
          { 
            label: 'Roles Inactivos', 
            value: roles.filter(r => !r.activo).length, 
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
                <Shield className="w-4 h-4" />
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
            <p className="text-gray-300">Cargando roles...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Permisos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredRoles.map((rol: Rol) => (
                  <tr key={rol.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-100">
                            {rol.nombre}
                          </div>
                          {rol.descripcion && (
                            <div className="text-sm text-gray-400">{rol.descripcion}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(rol)}
                        <span className="ml-2 text-sm text-gray-100">
                          {getStatusText(rol)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-100">
                        <Key className="w-4 h-4 mr-1" />
                        {rol.permisos?.length || 0} permisos
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(rol.fecha_creacion).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        to={`/admin/roles/${rol.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(rol.id, rol.nombre)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar rol"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRoles.length === 0 && (
              <div className="p-8 text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? 'No se encontraron roles que coincidan con la búsqueda' : 'No hay roles disponibles'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}