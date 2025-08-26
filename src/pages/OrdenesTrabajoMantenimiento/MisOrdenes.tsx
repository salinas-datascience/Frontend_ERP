import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ordenesTrabajoApi } from '../../api';
import { Clock, CheckCircle, Play, MessageSquare, Filter, AlertCircle, Upload, X, Paperclip, EyeOff } from 'lucide-react';
import type { OrdenTrabajo, ComentarioOT, ArchivoComentarioOT } from '../../types';

const MisOrdenesTrabajoList: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [estadoFilter, setEstadoFilter] = React.useState('all');
  const [selectedOrden, setSelectedOrden] = React.useState<OrdenTrabajo | null>(null);
  const [showCommentModal, setShowCommentModal] = React.useState(false);
  const [newComment, setNewComment] = React.useState('');
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [hiddenOrders, setHiddenOrders] = React.useState<Set<number>>(new Set());

  const { data: misOrdenes = [], isLoading, error } = useQuery({
    queryKey: ['mis-ordenes-trabajo'],
    queryFn: () => ordenesTrabajoApi.getMisOrdenes(),
  });

  const changeStateMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) => 
      ordenesTrabajoApi.changeState(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-ordenes-trabajo'] });
      queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo'] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ id, comentario }: { id: number; comentario: string }) =>
      ordenesTrabajoApi.addComment(id, { comentario }),
    onSuccess: async (newCommentData) => {
      // Subir archivos si los hay
      if (selectedFiles.length > 0) {
        try {
          const uploadPromises = selectedFiles.map(file => 
            ordenesTrabajoApi.uploadCommentFile(newCommentData.id, file)
          );
          await Promise.all(uploadPromises);
        } catch (error) {
          console.error('Error subiendo archivos:', error);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['mis-ordenes-trabajo'] });
      setNewComment('');
      setSelectedFiles([]);
      setShowCommentModal(false);
    },
  });

  // Función para ocultar una orden manualmente
  const handleHideOrder = (ordenId: number) => {
    setHiddenOrders(prev => new Set([...prev, ordenId]));
  };

  // Función para mostrar todas las órdenes ocultas
  const handleShowHiddenOrders = () => {
    setHiddenOrders(new Set());
  };

  const filteredOrdenes = React.useMemo(() => {
    return misOrdenes.filter((orden) => {
      // No mostrar órdenes que están ocultas manualmente
      if (hiddenOrders.has(orden.id)) {
        return false;
      }

      const searchLower = search.toLowerCase();
      const matchesSearch = 
        orden.titulo.toLowerCase().includes(searchLower) ||
        (orden.descripcion?.toLowerCase().includes(searchLower)) ||
        orden.maquina.numero_serie.toLowerCase().includes(searchLower) ||
        (orden.maquina.alias?.toLowerCase().includes(searchLower));

      const matchesEstado = estadoFilter === 'all' || orden.estado === estadoFilter;

      return matchesSearch && matchesEstado;
    });
  }, [misOrdenes, search, estadoFilter, hiddenOrders]);

  // Separar órdenes por estado para mostrar las más importantes primero
  const ordenesPendientes = filteredOrdenes.filter(o => o.estado === 'pendiente');
  const ordenesEnProceso = filteredOrdenes.filter(o => o.estado === 'en_proceso');
  const ordenesCompletadas = filteredOrdenes.filter(o => o.estado === 'completada');

  const handleChangeState = (id: number, estado: string) => {
    changeStateMutation.mutate({ id, estado });
  };

  const handleOpenCommentModal = (orden: OrdenTrabajo) => {
    setSelectedOrden(orden);
    setShowCommentModal(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain'
    ];
    
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`Archivo "${file.name}" no es de un tipo permitido.`);
        return false;
      }
      if (file.size > 20 * 1024 * 1024) { // 20MB
        alert(`Archivo "${file.name}" es demasiado grande. Máximo 20MB.`);
        return false;
      }
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    event.target.value = '';
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAddComment = () => {
    if (selectedOrden && newComment.trim()) {
      addCommentMutation.mutate({
        id: selectedOrden.id,
        comentario: newComment.trim()
      });
    }
  };

  const getEstadoBadge = (estado: string) => {
    const colors = {
      'pendiente': 'bg-yellow-500',
      'en_proceso': 'bg-blue-500',
      'completada': 'bg-green-500',
      'cancelada': 'bg-red-500'
    };
    
    const labels = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };

    return (
      <Badge className={`${colors[estado as keyof typeof colors]} text-white`}>
        {labels[estado as keyof typeof labels]}
      </Badge>
    );
  };

  const getCriticidadBadge = (criticidad: string) => {
    const colors = {
      'baja': 'bg-gray-500',
      'media': 'bg-yellow-500',
      'alta': 'bg-orange-500',
      'critica': 'bg-red-500'
    };
    
    const labels = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'critica': 'Crítica'
    };

    return (
      <Badge className={`${colors[criticidad as keyof typeof colors]} text-white`}>
        {labels[criticidad as keyof typeof labels]}
      </Badge>
    );
  };

  const getPriorityIcon = (criticidad: string, fechaProgramada: string) => {
    const isVencida = new Date(fechaProgramada) < new Date();
    if (isVencida && (criticidad === 'alta' || criticidad === 'critica')) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando mis órdenes de trabajo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error al cargar las órdenes de trabajo</div>
      </div>
    );
  }

  const estadoOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'completada', label: 'Completada' }
  ];


  const OrdenCard = ({ orden }: { orden: OrdenTrabajo }) => {
    const isVencida = new Date(orden.fecha_programada) < new Date() && orden.estado !== 'completada';
    
    return (
      <div className={`bg-gray-800 rounded-lg p-4 border-l-4 transition-all duration-500 ${
        orden.nivel_criticidad === 'critica' ? 'border-red-500' :
        orden.nivel_criticidad === 'alta' ? 'border-orange-500' :
        orden.nivel_criticidad === 'media' ? 'border-yellow-500' :
        'border-gray-500'
      } ${isVencida ? 'ring-2 ring-red-500 ring-opacity-50' : ''}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-white">{orden.titulo}</h3>
              {getPriorityIcon(orden.nivel_criticidad, orden.fecha_programada)}
            </div>
            {orden.descripcion && (
              <p className="text-gray-400 text-sm mb-2">{orden.descripcion}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {getEstadoBadge(orden.estado)}
              {getCriticidadBadge(orden.nivel_criticidad)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-400">Máquina:</p>
            <p className="font-mono text-sm">
              {orden.maquina.numero_serie}
              {orden.maquina.alias && ` (${orden.maquina.alias})`}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Fecha programada:</p>
            <p className={`text-sm ${isVencida ? 'text-red-400 font-semibold' : 'text-white'}`}>
              {new Date(orden.fecha_programada).toLocaleDateString('es-ES')}
              {isVencida && ' (Vencida)'}
            </p>
          </div>
        </div>

        {orden.tiempo_estimado_horas && (
          <div className="mb-4">
            <p className="text-sm text-gray-400">Tiempo estimado:</p>
            <p className="text-sm text-white">{orden.tiempo_estimado_horas} horas</p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-2">
          {orden.estado === 'pendiente' && (
            <Button
              size="sm"
              onClick={() => handleChangeState(orden.id, 'en_proceso')}
              disabled={changeStateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-1" />
              Iniciar
            </Button>
          )}
          
          {orden.estado === 'en_proceso' && (
            <Button
              size="sm"
              onClick={() => handleChangeState(orden.id, 'completada')}
              disabled={changeStateMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Completar
            </Button>
          )}

          {orden.estado === 'completada' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleHideOrder(orden.id)}
              className="text-gray-400 hover:text-red-400 border-gray-600 hover:border-red-400"
              title="Ocultar orden completada"
            >
              <EyeOff className="w-4 h-4 mr-1" />
              Ocultar
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenCommentModal(orden)}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Comentar ({orden.comentarios.length})
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">OTs Asignadas</h1>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-500">{ordenesPendientes.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">En Proceso</p>
              <p className="text-2xl font-bold text-blue-500">{ordenesEnProceso.length}</p>
            </div>
            <Play className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Completadas</p>
              <p className="text-2xl font-bold text-green-500">{ordenesCompletadas.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Buscar por título, descripción o máquina..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              showClearButton={search.length > 0}
            />
          </div>
          <div className="w-full lg:w-64">
            <FilterSelect
              label="Estado"
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              options={estadoOptions}
            />
          </div>
        </div>
      </div>

      {/* Botón para mostrar órdenes ocultas */}
      {hiddenOrders.size > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShowHiddenOrders}
            className="text-gray-400 hover:text-blue-400 border-gray-600 hover:border-blue-400"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Mostrar {hiddenOrders.size} orden{hiddenOrders.size !== 1 ? 'es' : ''} oculta{hiddenOrders.size !== 1 ? 's' : ''}
          </Button>
        </div>
      )}

      {/* Lista de órdenes en formato de cards */}
      <div className="space-y-4">
        {filteredOrdenes.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No tienes órdenes de trabajo asignadas</p>
          </div>
        ) : (
          filteredOrdenes
            .sort((a, b) => {
              // Ordenar por criticidad y fecha
              const criticidadOrder = { 'critica': 4, 'alta': 3, 'media': 2, 'baja': 1 };
              const criticidadA = criticidadOrder[a.nivel_criticidad as keyof typeof criticidadOrder];
              const criticidadB = criticidadOrder[b.nivel_criticidad as keyof typeof criticidadOrder];
              
              if (criticidadA !== criticidadB) {
                return criticidadB - criticidadA;
              }
              
              return new Date(a.fecha_programada).getTime() - new Date(b.fecha_programada).getTime();
            })
            .map((orden) => (
              <OrdenCard key={orden.id} orden={orden} />
            ))
        )}
      </div>

      {/* Modal para comentarios */}
      <Modal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setSelectedOrden(null);
          setNewComment('');
          setSelectedFiles([]);
        }}
        title={`Comentarios - ${selectedOrden?.titulo}`}
      >
        <div className="space-y-4">
          {/* Archivos adjuntos de la OT */}
          {selectedOrden?.archivos && selectedOrden.archivos.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Archivos adjuntos de la orden:</h4>
              <div className="space-y-1 bg-gray-800 p-3 rounded-md">
                {selectedOrden.archivos.map((archivo) => (
                  <div key={archivo.id} className="flex items-center justify-between bg-gray-700 p-2 rounded text-xs">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-200">{archivo.nombre_archivo}</span>
                      <span className="text-gray-400">({formatFileSize(archivo.tamaño_bytes)})</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`http://localhost:8000/api/ordenes-trabajo/archivos/${archivo.id}/download`, '_blank')}
                      className="text-xs py-1 px-2 h-auto"
                    >
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comentarios existentes */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {selectedOrden?.comentarios.map((comentario) => (
              <div key={comentario.id} className="bg-gray-700 rounded p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">
                    {comentario.usuario.nombre_completo || comentario.usuario.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(comentario.fecha_creacion).toLocaleString('es-ES')}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{comentario.comentario}</p>
                
                {/* Archivos adjuntos del comentario */}
                {comentario.archivos && comentario.archivos.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {comentario.archivos.map((archivo) => (
                      <div key={archivo.id} className="flex items-center justify-between bg-gray-600 p-2 rounded text-xs">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-200">{archivo.nombre_archivo}</span>
                          <span className="text-gray-400">({formatFileSize(archivo.tamaño_bytes)})</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`http://localhost:8000/api/ordenes-trabajo/comentarios/archivos/${archivo.id}/download`, '_blank')}
                          className="text-xs py-1 px-2 h-auto"
                        >
                          Descargar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {selectedOrden?.comentarios.length === 0 && (
              <p className="text-gray-400 text-center py-4">No hay comentarios aún</p>
            )}
          </div>

          {/* Agregar nuevo comentario */}
          <div className="border-t border-gray-600 pt-4">
            <Input
              placeholder="Escribe tu comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-3"
            />
            
            {/* Adjuntar archivos */}
            <div className="mb-3">
              <div className="flex items-center space-x-4 mb-2">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt"
                  className="hidden"
                  id="comment-file-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('comment-file-input')?.click()}
                  className="flex items-center"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Adjuntar
                </Button>
                <span className="text-xs text-gray-400">
                  JPG, PNG, PDF, TXT (máx. 20MB)
                </span>
              </div>
              
              {/* Archivos seleccionados */}
              {selectedFiles.length > 0 && (
                <div className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded text-xs">
                      <div className="flex items-center space-x-2">
                        <Paperclip className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-200">{file.name}</span>
                        <span className="text-gray-400">({formatFileSize(file.size)})</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeSelectedFile(index)}
                        className="text-red-400 hover:text-red-300 text-xs py-1 px-2 h-auto"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCommentModal(false);
                  setNewComment('');
                  setSelectedFiles([]);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || addCommentMutation.isPending}
              >
                Agregar Comentario
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MisOrdenesTrabajoList;