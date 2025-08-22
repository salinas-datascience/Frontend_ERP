import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Shield, Key, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { adminRolesService, adminPermisosService } from '../../../api/admin';
import type { Permiso, CreateRolRequest, UpdateRolRequest } from '../../../types/admin';

export default function RoleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<CreateRolRequest | UpdateRolRequest>({
    nombre: '',
    descripcion: '',
    activo: true,
    permisos_ids: []
  });

  const [selectedPermisos, setSelectedPermisos] = useState<number[]>([]);

  // Queries
  const { data: rol, isLoading: loadingRol } = useQuery({
    queryKey: ['admin', 'roles', id],
    queryFn: () => adminRolesService.getRol(Number(id)),
    enabled: isEditing
  });

  const { data: permisos = [] } = useQuery({
    queryKey: ['admin', 'permisos'],
    queryFn: () => adminPermisosService.getPermisos(0, 100)
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: adminRolesService.createRol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      navigate('/admin/roles');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRolRequest }) => 
      adminRolesService.updateRol(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      navigate('/admin/roles');
    }
  });

  // Effects
  useEffect(() => {
    if (rol && isEditing) {
      setFormData({
        nombre: rol.nombre,
        descripcion: rol.descripcion || '',
        activo: rol.activo,
        permisos_ids: rol.permisos?.map(p => p.id) || []
      });
      setSelectedPermisos(rol.permisos?.map(p => p.id) || []);
    }
  }, [rol, isEditing]);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePermisoToggle = (permisoId: number) => {
    const newSelectedPermisos = selectedPermisos.includes(permisoId)
      ? selectedPermisos.filter(id => id !== permisoId)
      : [...selectedPermisos, permisoId];
    
    setSelectedPermisos(newSelectedPermisos);
    setFormData(prev => ({
      ...prev,
      permisos_ids: newSelectedPermisos
    }));
  };

  const handleSelectAllPermisos = () => {
    const allPermisosIds = permisos.map(p => p.id);
    setSelectedPermisos(allPermisosIds);
    setFormData(prev => ({
      ...prev,
      permisos_ids: allPermisosIds
    }));
  };

  const handleSelectNoPermisos = () => {
    setSelectedPermisos([]);
    setFormData(prev => ({
      ...prev,
      permisos_ids: []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre?.trim()) {
      alert('El nombre del rol es requerido');
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: Number(id),
          data: formData as UpdateRolRequest
        });
      } else {
        await createMutation.mutateAsync(formData as CreateRolRequest);
      }
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Agrupar permisos por recurso
  const permisosPorRecurso = permisos.reduce((acc: Record<string, Permiso[]>, permiso) => {
    if (!acc[permiso.recurso]) {
      acc[permiso.recurso] = [];
    }
    acc[permiso.recurso].push(permiso);
    return acc;
  }, {});

  if (isEditing && loadingRol) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-gray-100">Cargando rol...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Editar Rol' : 'Nuevo Rol'}
            </h1>
            <p className="text-gray-200 mt-1">
              {isEditing ? 'Modificar información del rol existente' : 'Crear un nuevo rol en el sistema'}
            </p>
          </div>
          <Link to="/admin/roles">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        {/* Información del rol existente */}
        {isEditing && rol && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-100 flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  {rol.nombre}
                </h3>
                <p className="text-xs text-gray-300">
                  Creado: {new Date(rol.fecha_creacion).toLocaleDateString()}
                  <span className="ml-3">
                    {rol.permisos?.length || 0} permisos asignados
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario principal */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-200 mb-1">
                Nombre del Rol *
              </label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Operador, Supervisor, etc."
              />
            </div>

            <div className="flex items-center pt-6">
              <input
                id="activo"
                name="activo"
                type="checkbox"
                checked={formData.activo}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-100">
                Rol activo
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-200 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={3}
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción del rol y sus responsabilidades"
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm text-gray-100 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Asignación de permisos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-100 flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Permisos del Rol
              </h3>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllPermisos}
                >
                  Seleccionar Todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectNoPermisos}
                >
                  Quitar Todos
                </Button>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
              <p className="text-sm text-gray-300 mb-4">
                Selecciona los permisos que tendrá este rol. Los permisos están organizados por recurso.
              </p>

              {Object.keys(permisosPorRecurso).length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  No hay permisos disponibles. Crea permisos primero.
                </p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(permisosPorRecurso).map(([recurso, permisosRecurso]) => (
                    <div key={recurso} className="border border-gray-600 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-100 mb-3 capitalize">
                        {recurso}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {permisosRecurso.map((permiso) => (
                          <div
                            key={permiso.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedPermisos.includes(permiso.id)
                                ? 'border-blue-500 bg-gray-600'
                                : 'border-gray-600 hover:border-gray-500'
                            }`}
                            onClick={() => handlePermisoToggle(permiso.id)}
                          >
                            <div className="flex items-start">
                              <input
                                type="checkbox"
                                checked={selectedPermisos.includes(permiso.id)}
                                onChange={() => handlePermisoToggle(permiso.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3 mt-0.5"
                              />
                              <div>
                                <h5 className="text-sm font-medium text-gray-100">
                                  {permiso.nombre}
                                </h5>
                                <p className="text-xs text-gray-400 mt-1">
                                  {permiso.accion}
                                </p>
                                {permiso.descripcion && (
                                  <p className="text-xs text-gray-300 mt-1">
                                    {permiso.descripcion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 text-sm text-gray-400">
              {selectedPermisos.length} de {permisos.length} permisos seleccionados
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-600">
            <Link to="/admin/roles">
              <Button variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {(createMutation.isPending || updateMutation.isPending) 
                ? (isEditing ? 'Actualizando...' : 'Creando...') 
                : (isEditing ? 'Actualizar Rol' : 'Crear Rol')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}