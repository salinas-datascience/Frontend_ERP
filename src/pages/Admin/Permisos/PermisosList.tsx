import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Key, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Lock,
  Unlock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { adminPermisosService } from '../../../api/admin';
import type { Permiso } from '../../../types/admin';

export default function PermisosList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterRecurso, setFilterRecurso] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: permisos = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'permisos'],
    queryFn: () => adminPermisosService.getPermisos(0, 100),
  });

  const deleteMutation = useMutation({
    mutationFn: adminPermisosService.deletePermiso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'permisos'] });
    },
  });

  // Obtener recursos únicos para el filtro
  const recursos = Array.from(new Set(permisos.map((p: Permiso) => p.recurso))).sort();

  const filteredPermisos = permisos.filter((permiso: Permiso) => {
    const matchesSearch = 
      permiso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permiso.recurso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permiso.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (permiso.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && permiso.activo) ||
      (filterStatus === 'inactive' && !permiso.activo);

    const matchesRecurso = 
      filterRecurso === 'all' || permiso.recurso === filterRecurso;

    return matchesSearch && matchesFilter && matchesRecurso;
  });

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el permiso "${nombre}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error al eliminar permiso:', error);
      }
    }
  };

  const getStatusIcon = (permiso: Permiso) => {
    return permiso.activo 
      ? <CheckCircle className="w-5 h-5 text-green-500" />
      : <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = (permiso: Permiso) => {
    return permiso.activo ? 'Activo' : 'Inactivo';
  };

  const getAccionIcon = (accion: string) => {
    if (accion.includes('read') || accion.includes('view') || accion.includes('get')) {
      return <Unlock className="w-4 h-4 text-blue-500" />;
    }
    return <Lock className="w-4 h-4 text-orange-500" />;
  };


  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">Error al cargar permisos: {error.message}</p>
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
              <Key className="w-6 h-6 mr-2" />
              Gestión de Permisos
            </h1>
            <p className="text-gray-200 mt-1">
              Administrar permisos granulares del sistema
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
            <Link to="/admin/permisos/nuevo">
              <Button variant="primary" className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Permiso
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
                placeholder="Buscar por nombre, recurso, acción o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filterRecurso}
              onChange={(e) => setFilterRecurso(e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-md text-sm text-gray-100 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los recursos</option>
              {recursos.map((recurso) => (
                <option key={recurso} value={recurso}>
                  {recurso}
                </option>
              ))}
            </select>
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
            label: 'Total Permisos', 
            value: permisos.length, 
            color: 'text-blue-600 bg-blue-100' 
          },
          { 
            label: 'Permisos Activos', 
            value: permisos.filter(p => p.activo).length, 
            color: 'text-green-600 bg-green-100' 
          },
          { 
            label: 'Recursos', 
            value: recursos.length, 
            color: 'text-purple-600 bg-purple-100' 
          },
          { 
            label: 'Permisos Inactivos', 
            value: permisos.filter(p => !p.activo).length, 
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
                <Key className="w-4 h-4" />
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
            <p className="text-gray-300">Cargando permisos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Permiso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Recurso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredPermisos.map((permiso: Permiso) => (
                  <tr key={permiso.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                          <Key className="w-4 h-4 text-white" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-100">
                            {permiso.nombre}
                          </div>
                          {permiso.descripcion && (
                            <div className="text-sm text-gray-400">{permiso.descripcion}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-gray-100 capitalize">
                        {permiso.recurso}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-100">
                        {getAccionIcon(permiso.accion)}
                        <span className="ml-2">{permiso.accion}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(permiso)}
                        <span className="ml-2 text-sm text-gray-100">
                          {getStatusText(permiso)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        to={`/admin/permisos/${permiso.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(permiso.id, permiso.nombre)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar permiso"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPermisos.length === 0 && (
              <div className="p-8 text-center">
                <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? 'No se encontraron permisos que coincidan con la búsqueda' : 'No hay permisos disponibles'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}