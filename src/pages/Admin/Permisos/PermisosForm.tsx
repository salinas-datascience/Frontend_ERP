import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Key, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { adminPermisosService } from '../../../api/admin';
import type { CreatePermisoRequest, UpdatePermisoRequest } from '../../../types/admin';

export default function PermisosForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<CreatePermisoRequest | UpdatePermisoRequest>({
    nombre: '',
    descripcion: '',
    recurso: '',
    accion: '',
    activo: true
  });

  // Query para obtener el permiso si estamos editando
  const { data: permiso, isLoading: loadingPermiso } = useQuery({
    queryKey: ['admin', 'permisos', id],
    queryFn: () => adminPermisosService.getPermiso(Number(id)),
    enabled: isEditing
  });

  // Query para obtener permisos existentes (para sugerir recursos y acciones)
  const { data: permisosExistentes = [] } = useQuery({
    queryKey: ['admin', 'permisos'],
    queryFn: () => adminPermisosService.getPermisos(0, 100)
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: adminPermisosService.createPermiso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'permisos'] });
      navigate('/admin/permisos');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePermisoRequest }) => 
      adminPermisosService.updatePermiso(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'permisos'] });
      navigate('/admin/permisos');
    }
  });

  // Effects
  useEffect(() => {
    if (permiso && isEditing) {
      setFormData({
        nombre: permiso.nombre,
        descripcion: permiso.descripcion || '',
        recurso: permiso.recurso,
        accion: permiso.accion,
        activo: permiso.activo
      });
    }
  }, [permiso, isEditing]);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre?.trim()) {
      alert('El nombre del permiso es requerido');
      return;
    }

    if (!formData.recurso?.trim()) {
      alert('El recurso es requerido');
      return;
    }

    if (!formData.accion?.trim()) {
      alert('La acción es requerida');
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: Number(id),
          data: formData as UpdatePermisoRequest
        });
      } else {
        await createMutation.mutateAsync(formData as CreatePermisoRequest);
      }
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Obtener listas únicas de recursos y acciones existentes para sugerencias
  const recursosExistentes = Array.from(new Set(permisosExistentes.map(p => p.recurso))).sort();
  const accionesExistentes = Array.from(new Set(permisosExistentes.map(p => p.accion))).sort();

  // Sugerencias de acciones comunes
  const accionesComunes = [
    'create', 'read', 'update', 'delete',
    'list', 'view', 'edit', 'remove',
    'manage', 'admin', 'access'
  ];

  if (isEditing && loadingPermiso) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-gray-100">Cargando permiso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Editar Permiso' : 'Nuevo Permiso'}
            </h1>
            <p className="text-gray-200 mt-1">
              {isEditing ? 'Modificar información del permiso existente' : 'Crear un nuevo permiso en el sistema'}
            </p>
          </div>
          <Link to="/admin/permisos">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        {/* Información del permiso existente */}
        {isEditing && permiso && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-100 flex items-center">
                  <Key className="w-4 h-4 mr-1" />
                  {permiso.nombre}
                </h3>
                <p className="text-xs text-gray-300">
                  Recurso: {permiso.recurso} • Acción: {permiso.accion}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario principal */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-200 mb-1">
              Nombre del Permiso *
            </label>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ej: Crear Usuario, Ver Reportes, etc."
            />
            <p className="text-xs text-gray-400 mt-1">
              Nombre descriptivo del permiso que aparecerá en la interfaz
            </p>
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
              placeholder="Descripción detallada de lo que permite este permiso"
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm text-gray-100 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Recurso y Acción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="recurso" className="block text-sm font-medium text-gray-200 mb-1">
                Recurso *
              </label>
              <Input
                id="recurso"
                name="recurso"
                type="text"
                required
                value={formData.recurso}
                onChange={handleInputChange}
                placeholder="Ej: usuarios, productos, reportes"
                list="recursos-existentes"
              />
              <datalist id="recursos-existentes">
                {recursosExistentes.map((recurso) => (
                  <option key={recurso} value={recurso} />
                ))}
              </datalist>
              <p className="text-xs text-gray-400 mt-1">
                El recurso o entidad sobre la que se aplica el permiso
              </p>
            </div>

            <div>
              <label htmlFor="accion" className="block text-sm font-medium text-gray-200 mb-1">
                Acción *
              </label>
              <Input
                id="accion"
                name="accion"
                type="text"
                required
                value={formData.accion}
                onChange={handleInputChange}
                placeholder="Ej: create, read, update, delete"
                list="acciones-sugeridas"
              />
              <datalist id="acciones-sugeridas">
                {accionesComunes.map((accion) => (
                  <option key={accion} value={accion} />
                ))}
                {accionesExistentes.map((accion) => (
                  <option key={accion} value={accion} />
                ))}
              </datalist>
              <p className="text-xs text-gray-400 mt-1">
                La acción específica que permite realizar
              </p>
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center">
            <input
              id="activo"
              name="activo"
              type="checkbox"
              checked={formData.activo}
              onChange={handleInputChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-100">
              Permiso activo
            </label>
          </div>

          {/* Ejemplos de permisos */}
          {!isEditing && (
            <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
              <h4 className="text-sm font-medium text-gray-100 mb-3">
                Ejemplos de Permisos Comunes:
              </h4>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="grid grid-cols-3 gap-2 font-medium text-gray-200">
                  <span>Nombre</span>
                  <span>Recurso</span>
                  <span>Acción</span>
                </div>
                {[
                  { nombre: 'Ver Usuarios', recurso: 'usuarios', accion: 'read' },
                  { nombre: 'Crear Productos', recurso: 'productos', accion: 'create' },
                  { nombre: 'Editar Facturas', recurso: 'facturas', accion: 'update' },
                  { nombre: 'Eliminar Clientes', recurso: 'clientes', accion: 'delete' }
                ].map((ejemplo, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 py-1 border-t border-gray-600">
                    <span>{ejemplo.nombre}</span>
                    <span>{ejemplo.recurso}</span>
                    <span>{ejemplo.accion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-600">
            <Link to="/admin/permisos">
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
                : (isEditing ? 'Actualizar Permiso' : 'Crear Permiso')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}