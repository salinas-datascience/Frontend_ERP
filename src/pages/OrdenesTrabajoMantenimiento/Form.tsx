import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { ordenesTrabajoApi, maquinasApi } from '../../api';
import { adminApi } from '../../api/admin';
import { Save, ArrowLeft, Upload, X, Paperclip } from 'lucide-react';
import type { OrdenTrabajoCreate, OrdenTrabajoUpdate, ArchivoOT } from '../../types';

interface FormData {
  titulo: string;
  descripcion: string;
  maquina_id: number;
  usuario_asignado_id: number;
  nivel_criticidad: 'baja' | 'media' | 'alta' | 'critica';
  fecha_programada: string;
  tiempo_estimado_horas: number | null;
}

interface FormErrors {
  titulo?: string;
  maquina_id?: string;
  usuario_asignado_id?: string;
  fecha_programada?: string;
  tiempo_estimado_horas?: string;
}

const OrdenTrabajoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [formData, setFormData] = React.useState<FormData>({
    titulo: '',
    descripcion: '',
    maquina_id: 0,
    usuario_asignado_id: 0,
    nivel_criticidad: 'media',
    fecha_programada: new Date().toISOString().split('T')[0],
    tiempo_estimado_horas: null
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [existingFiles, setExistingFiles] = React.useState<ArchivoOT[]>([]);

  // Cargar datos existentes si es edición
  const { data: ordenExistente } = useQuery({
    queryKey: ['orden-trabajo', id],
    queryFn: () => ordenesTrabajoApi.getById(Number(id)),
    enabled: isEdit,
  });

  React.useEffect(() => {
    if (ordenExistente && isEdit) {
      setFormData({
        titulo: ordenExistente.titulo,
        descripcion: ordenExistente.descripcion || '',
        maquina_id: ordenExistente.maquina_id,
        usuario_asignado_id: ordenExistente.usuario_asignado_id,
        nivel_criticidad: ordenExistente.nivel_criticidad,
        fecha_programada: ordenExistente.fecha_programada.split('T')[0],
        tiempo_estimado_horas: ordenExistente.tiempo_estimado_horas
      });
      setExistingFiles(ordenExistente.archivos || []);
    }
  }, [ordenExistente, isEdit]);

  // Cargar máquinas
  const { data: maquinas = [] } = useQuery({
    queryKey: ['maquinas'],
    queryFn: maquinasApi.getAll,
  });

  // Cargar usuarios
  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => adminApi.getUsuarios(),
  });

  const createMutation = useMutation({
    mutationFn: ordenesTrabajoApi.create,
    onSuccess: async (data) => {
      // Subir archivos si los hay
      if (selectedFiles.length > 0) {
        try {
          await uploadFilesMutation.mutateAsync({ ordenId: data.id, files: selectedFiles });
        } catch (error) {
          // Los archivos no se pudieron subir, pero la orden se creó
          console.error('Error subiendo archivos:', error);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo'] });
      navigate('/ordenes-trabajo');
    },
    onError: (error) => {
      setIsSubmitting(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrdenTrabajoUpdate }) =>
      ordenesTrabajoApi.update(id, data),
    onSuccess: async (data) => {
      // Subir archivos nuevos si los hay
      if (selectedFiles.length > 0) {
        try {
          await uploadFilesMutation.mutateAsync({ ordenId: data.id, files: selectedFiles });
        } catch (error) {
          console.error('Error subiendo archivos:', error);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo'] });
      queryClient.invalidateQueries({ queryKey: ['orden-trabajo', id] });
      navigate('/ordenes-trabajo');
    },
    onError: (error) => {
      setIsSubmitting(false);
    }
  });

  const uploadFilesMutation = useMutation({
    mutationFn: ({ ordenId, files }: { ordenId: number; files: File[] }) => {
      const promises = files.map(file => ordenesTrabajoApi.uploadFile(ordenId, file));
      return Promise.all(promises);
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (archivoId: number) => ordenesTrabajoApi.deleteFile(archivoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orden-trabajo', id] });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Verificar tipos de archivo permitidos
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`Archivo "${file.name}" no es de un tipo permitido.`);
        return false;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB
        alert(`Archivo "${file.name}" es demasiado grande. Máximo 50MB.`);
        return false;
      }
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    event.target.value = ''; // Limpiar input
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = async (archivoId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      deleteFileMutation.mutate(archivoId);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    } else if (formData.titulo.length < 3) {
      newErrors.titulo = 'El título debe tener al menos 3 caracteres';
    }

    if (!formData.maquina_id) {
      newErrors.maquina_id = 'Selecciona una máquina';
    }

    if (!formData.usuario_asignado_id) {
      newErrors.usuario_asignado_id = 'Selecciona un técnico';
    }

    if (!formData.fecha_programada) {
      newErrors.fecha_programada = 'La fecha programada es obligatoria';
    }

    if (formData.tiempo_estimado_horas !== null && 
        (formData.tiempo_estimado_horas < 0.5 || formData.tiempo_estimado_horas > 48)) {
      newErrors.tiempo_estimado_horas = 'Debe estar entre 0.5 y 48 horas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);

    try {
      const formattedData = {
        ...formData,
        maquina_id: Number(formData.maquina_id),
        usuario_asignado_id: Number(formData.usuario_asignado_id),
        fecha_programada: new Date(formData.fecha_programada).toISOString(),
        tiempo_estimado_horas: formData.tiempo_estimado_horas || undefined
      };

      if (isEdit) {
        updateMutation.mutate({
          id: Number(id),
          data: formattedData as OrdenTrabajoUpdate
        });
      } else {
        createMutation.mutate(formattedData as OrdenTrabajoCreate);
      }
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const maquinaOptions = [
    { value: '', label: 'Selecciona una máquina' },
    ...maquinas.map(m => ({
      value: m.id.toString(),
      label: `${m.numero_serie}${m.alias ? ` (${m.alias})` : ''} - ${m.modelo?.fabricante || ''} ${m.modelo?.modelo || ''}`
    }))
  ];

  const usuarioOptions = [
    { value: '', label: 'Selecciona un técnico' },
    ...usuarios
      .filter(u => u.activo)
      .map(u => ({
        value: u.id.toString(),
        label: u.nombre_completo || u.username
      }))
  ];

  const criticidadOptions = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' }
  ];

  const selectedMaquina = maquinas.find(m => m.id === Number(formData.maquina_id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/ordenes-trabajo')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-white">
          {isEdit ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
        </h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título *
                </label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  placeholder="Ej: Mantenimiento preventivo bomba de vacío"
                />
                {errors.titulo && (
                  <p className="text-red-400 text-sm mt-1">{errors.titulo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe detalladamente las tareas a realizar..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nivel de Criticidad *
                </label>
                <FilterSelect
                  value={formData.nivel_criticidad}
                  onChange={(e) => handleInputChange('nivel_criticidad', e.target.value)}
                  options={criticidadOptions}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Máquina *
                </label>
                <FilterSelect
                  value={formData.maquina_id.toString()}
                  onChange={(e) => handleInputChange('maquina_id', Number(e.target.value))}
                  options={maquinaOptions}
                />
                {errors.maquina_id && (
                  <p className="text-red-400 text-sm mt-1">{errors.maquina_id}</p>
                )}
                
                {selectedMaquina && (
                  <div className="mt-2 p-3 bg-gray-700 rounded-md">
                    <p className="text-sm text-gray-300">
                      <span className="font-medium">Máquina seleccionada:</span> {selectedMaquina.numero_serie}
                    </p>
                    {selectedMaquina.alias && (
                      <p className="text-sm text-gray-400">Alias: {selectedMaquina.alias}</p>
                    )}
                    {selectedMaquina.ubicacion && (
                      <p className="text-sm text-gray-400">Ubicación: {selectedMaquina.ubicacion}</p>
                    )}
                    {selectedMaquina.modelo && (
                      <p className="text-sm text-gray-400">
                        Modelo: {selectedMaquina.modelo.fabricante} {selectedMaquina.modelo.modelo}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Técnico Asignado *
                </label>
                <FilterSelect
                  value={formData.usuario_asignado_id.toString()}
                  onChange={(e) => handleInputChange('usuario_asignado_id', Number(e.target.value))}
                  options={usuarioOptions}
                />
                {errors.usuario_asignado_id && (
                  <p className="text-red-400 text-sm mt-1">{errors.usuario_asignado_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha Programada *
                </label>
                <Input
                  type="date"
                  value={formData.fecha_programada}
                  onChange={(e) => handleInputChange('fecha_programada', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.fecha_programada && (
                  <p className="text-red-400 text-sm mt-1">{errors.fecha_programada}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tiempo Estimado (horas)
                </label>
                <Input
                  type="number"
                  value={formData.tiempo_estimado_horas || ''}
                  onChange={(e) => handleInputChange('tiempo_estimado_horas', e.target.value ? Number(e.target.value) : null)}
                  placeholder="Ej: 2.5"
                  step="0.5"
                />
                {errors.tiempo_estimado_horas && (
                  <p className="text-red-400 text-sm mt-1">{errors.tiempo_estimado_horas}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sección de archivos adjuntos */}
          <div className="space-y-4 pt-6 border-t border-gray-600">
            <h3 className="text-lg font-medium text-white">Archivos Adjuntos</h3>
            
            {/* Input para seleccionar archivos */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adjuntar archivos (máx. 50MB c/u)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  id="file-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Seleccionar Archivos
                </Button>
                <span className="text-sm text-gray-400">
                  Permitidos: JPG, PNG, PDF, TXT, DOC, XLS
                </span>
              </div>
            </div>

            {/* Archivos seleccionados (nuevos) */}
            {selectedFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Archivos para subir:</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                      <div className="flex items-center space-x-3">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-white">{file.name}</p>
                          <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSelectedFile(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Archivos existentes (solo en edición) */}
            {isEdit && existingFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Archivos existentes:</h4>
                <div className="space-y-2">
                  {existingFiles.map((archivo) => (
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
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/api/ordenes-trabajo/archivos/${archivo.id}/download`, '_blank')}
                        >
                          Descargar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeExistingFile(archivo.id)}
                          className="text-red-400 hover:text-red-300"
                          disabled={deleteFileMutation.isPending}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-600">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/ordenes-trabajo')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {isEdit ? 'Actualizar' : 'Crear'} Orden de Trabajo
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default OrdenTrabajoForm;