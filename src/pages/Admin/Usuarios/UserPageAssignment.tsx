import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Settings, Eye, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '../../../components/ui/Button';
import { adminUsersService, adminPaginasService } from '../../../api/admin';
import type {
  Usuario,
  Pagina,
  AsignarPaginasRequest 
} from '../../../types/admin';

export default function UserPageAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = Number(id);

  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  // Queries
  const { data: usuario, isLoading: loadingUsuario } = useQuery({
    queryKey: ['admin', 'usuarios', userId],
    queryFn: () => adminUsersService.getUsuario(userId),
    enabled: Boolean(userId)
  });

  const { data: todasLasPaginas = [], isLoading: loadingPaginas } = useQuery({
    queryKey: ['admin', 'paginas'],
    queryFn: () => adminPaginasService.getPaginas(0, 100)
  });

  const { data: paginasUsuario = [] } = useQuery({
    queryKey: ['admin', 'usuarios', userId, 'paginas'],
    queryFn: () => adminUsersService.getPaginasUsuario(userId),
    enabled: Boolean(userId)
  });

  // Mutation
  const assignPagesMutation = useMutation({
    mutationFn: (data: AsignarPaginasRequest) => adminUsersService.asignarPaginas(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios', userId, 'paginas'] });
      navigate('/admin/usuarios');
    }
  });

  // Effects
  useEffect(() => {
    if (paginasUsuario.length > 0) {
      setSelectedPages(paginasUsuario.map(p => p.id));
    }
  }, [paginasUsuario]);

  // Handlers
  const handlePageToggle = (pageId: number) => {
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleSelectAll = () => {
    const availablePages = todasLasPaginas.filter(p => !p.solo_admin || usuario?.es_admin);
    setSelectedPages(availablePages.map(p => p.id));
  };

  const handleSelectNone = () => {
    setSelectedPages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await assignPagesMutation.mutateAsync({
        usuario_id: userId,
        paginas_ids: selectedPages
      });
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  if (loadingUsuario || loadingPaginas) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <p>Usuario no encontrado</p>
          <Link to="/admin/usuarios">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a usuarios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Separar páginas por categorías
  const paginasRegulares = todasLasPaginas.filter(p => !p.solo_admin);
  const paginasAdmin = todasLasPaginas.filter(p => p.solo_admin);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Asignar Páginas a Usuario
            </h1>
            <p className="text-gray-200 mt-1">
              Controla qué páginas puede ver {usuario.username}
            </p>
          </div>
          <Link to="/admin/usuarios">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="bg-gray-700 rounded-lg border border-gray-600 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-100">
              {usuario.username} - {usuario.nombre_completo || 'Sin nombre completo'}
            </h3>
            <p className="text-xs text-gray-300">
              {usuario.email} • {usuario.es_admin ? 'Administrador' : 'Usuario regular'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">
              {selectedPages.length} de {todasLasPaginas.length} páginas seleccionadas
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <form onSubmit={handleSubmit}>
          {/* Controles de selección */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                Seleccionar Todo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectNone}
              >
                Quitar Todo
              </Button>
            </div>
          </div>

          {/* Páginas Regulares */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-100 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Páginas del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginasRegulares.map((pagina) => (
                <div
                  key={pagina.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedPages.includes(pagina.id)
                      ? 'border-blue-500 bg-gray-600'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => handlePageToggle(pagina.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedPages.includes(pagina.id)}
                          onChange={() => handlePageToggle(pagina.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                        />
                        <div>
                          <h4 className="text-sm font-medium text-gray-100">
                            {pagina.titulo}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {pagina.ruta}
                          </p>
                          {pagina.descripcion && (
                            <p className="text-xs text-gray-300 mt-1">
                              {pagina.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Páginas de Administración (solo si el usuario es admin) */}
          {usuario.es_admin && paginasAdmin.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-100 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Páginas de Administración
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginasAdmin.map((pagina) => (
                  <div
                    key={pagina.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPages.includes(pagina.id)
                        ? 'border-purple-500 bg-gray-600'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => handlePageToggle(pagina.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedPages.includes(pagina.id)}
                            onChange={() => handlePageToggle(pagina.id)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-3"
                          />
                          <div>
                            <h4 className="text-sm font-medium text-gray-100">
                              {pagina.titulo}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              {pagina.ruta}
                            </p>
                            {pagina.descripcion && (
                              <p className="text-xs text-gray-300 mt-1">
                                {pagina.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje si no es admin */}
          {!usuario.es_admin && paginasAdmin.length > 0 && (
            <div className="mb-8 p-4 bg-gray-700 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-300">
                <Settings className="w-4 h-4 inline mr-1" />
                Las páginas de administración solo están disponibles para usuarios administradores.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Link to="/admin/usuarios">
              <Button variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              disabled={assignPagesMutation.isPending}
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {assignPagesMutation.isPending ? 'Guardando...' : 'Guardar Asignación'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}