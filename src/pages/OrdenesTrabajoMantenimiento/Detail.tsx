import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { ordenesTrabajoApi } from '../../api';
import { ArrowLeft, Calendar, Clock, User, Wrench, MessageSquare, Paperclip, Download, RefreshCw, Upload, X, Send } from 'lucide-react';
import type { OrdenTrabajo, ArchivoComentarioOT } from '../../types';

const OrdenTrabajoDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [newComment, setNewComment] = React.useState('');
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);

  // Obtener datos de la orden de trabajo con refresh automático
  const { data: orden, isLoading, error, refetch } = useQuery({
    queryKey: ['orden-trabajo', id],
    queryFn: () => ordenesTrabajoApi.getById(Number(id)),
    enabled: Boolean(id),
    refetchInterval: autoRefresh ? 30000 : false, // Refresh cada 30 segundos
  });

  // Mutación para agregar comentario
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
      
      queryClient.invalidateQueries({ queryKey: ['orden-trabajo', id] });
      setNewComment('');
      setSelectedFiles([]);
    },
  });

  // Funciones para manejo de archivos
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

  const handleAddComment = () => {
    if (orden && newComment.trim()) {
      addCommentMutation.mutate({
        id: orden.id,
        comentario: newComment.trim()
      });
    }
  };

  const getBadgeColor = (estado: string) => {
    const colors = {
      'pendiente': 'bg-yellow-500',
      'en_proceso': 'bg-blue-500',
      'completada': 'bg-green-500',
      'cancelada': 'bg-red-500'
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-500';
  };

  const getCriticidadColor = (criticidad: string) => {
    const colors = {
      'baja': 'bg-green-600',
      'media': 'bg-yellow-600',
      'alta': 'bg-orange-600',
      'critica': 'bg-red-600'
    };
    return colors[criticidad as keyof typeof colors] || 'bg-gray-600';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error al cargar la orden de trabajo</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/ordenes-trabajo')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-white">
            Orden de Trabajo #{orden.id}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center"
          >
            Auto-refresh {autoRefresh ? "ON" : "OFF"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">{orden.titulo}</h2>
              <div className="flex gap-2">
                <Badge className={`${getBadgeColor(orden.estado)} text-white`}>
                  {orden.estado.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={`${getCriticidadColor(orden.nivel_criticidad)} text-white`}>
                  {orden.nivel_criticidad.toUpperCase()}
                </Badge>
              </div>
            </div>

            {orden.descripcion && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Descripción</h3>
                <p className="text-gray-400">{orden.descripcion}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-300">Programada:</span>
                  <span className="text-white ml-2">
                    {new Date(orden.fecha_programada).toLocaleString('es-ES')}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-300">Creada:</span>
                  <span className="text-white ml-2">
                    {new Date(orden.fecha_creacion).toLocaleString('es-ES')}
                  </span>
                </div>

                {orden.tiempo_estimado_horas && (
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-300">Tiempo estimado:</span>
                    <span className="text-white ml-2">{orden.tiempo_estimado_horas}h</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-300">Asignado a:</span>
                  <span className="text-white ml-2">
                    {orden.usuario_asignado.nombre_completo || orden.usuario_asignado.username}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-300">Creado por:</span>
                  <span className="text-white ml-2">
                    {orden.usuario_creador.nombre_completo || orden.usuario_creador.username}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <Wrench className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-300">Máquina:</span>
                  <span className="text-white ml-2">
                    {orden.maquina.numero_serie}
                    {orden.maquina.alias && ` (${orden.maquina.alias})`}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Archivos adjuntos */}
          {orden.archivos && orden.archivos.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-white mb-4">Archivos Adjuntos</h3>
              <div className="space-y-2">
                {orden.archivos.map((archivo) => (
                  <div key={archivo.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                    <div className="flex items-center space-x-3">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-white">{archivo.nombre_archivo}</p>
                        <p className="text-xs text-gray-400">
                          {formatFileSize(archivo.tamaño_bytes)} • Subido por {archivo.usuario.username}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`http://localhost:8000/api/ordenes-trabajo/archivos/${archivo.id}/download`, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Panel de comentarios */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Comentarios ({orden.comentarios.length})
              </h3>
              {autoRefresh && (
                <div className="flex items-center text-xs text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  En vivo
                </div>
              )}
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {orden.comentarios.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay comentarios aún</p>
              ) : (
                orden.comentarios.map((comentario) => (
                  <div key={comentario.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-blue-400">
                        {comentario.usuario.nombre_completo || comentario.usuario.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(comentario.fecha_creacion).toLocaleString('es-ES')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3">{comentario.comentario}</p>
                    
                    {/* Archivos del comentario */}
                    {comentario.archivos && comentario.archivos.length > 0 && (
                      <div className="space-y-2">
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
                              <Download className="w-3 h-3 mr-1" />
                              Descargar
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {/* Formulario para agregar comentario */}
            <div className="border-t border-gray-600 pt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Agregar comentario:</h4>
              
              <div className="space-y-3">
                <Input
                  placeholder="Escribe tu comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full"
                />
                
                {/* Adjuntar archivos */}
                <div>
                  <div className="flex items-center space-x-4 mb-2">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt"
                      className="hidden"
                      id="detail-comment-file-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('detail-comment-file-input')?.click()}
                      className="flex items-center"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Adjuntar archivo
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
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    className="flex items-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {addCommentMutation.isPending ? 'Enviando...' : 'Enviar comentario'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrdenTrabajoDetail;