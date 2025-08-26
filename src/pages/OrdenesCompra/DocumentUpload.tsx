import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Upload, 
  File, 
  X, 
  AlertCircle,
  CheckCircle,
  FileText,
  Download,
  Trash2
} from 'lucide-react';
import { ordenesCompraApi } from '../../api/ordenes-compra';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../lib/utils';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadStatus {
  file: File;
  progress: number;
  error?: string;
  success?: boolean;
}

const DocumentUpload: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadStatus[]>([]);
  const dropRef = useRef<HTMLDivElement>(null);

  const { data: orden, isLoading } = useQuery({
    queryKey: ['orden-compra', id],
    queryFn: () => ordenesCompraApi.getById(Number(id!)),
    enabled: !!id,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      // Update progress to show upload started
      setUploadQueue(prev => 
        prev.map(item => 
          item.file === file ? { ...item, progress: 50 } : item
        )
      );
      
      const result = await ordenesCompraApi.uploadDocumento(Number(id), file);
      
      // Update progress to complete
      setUploadQueue(prev => 
        prev.map(item => 
          item.file === file ? { ...item, progress: 100, success: true } : item
        )
      );
      
      return result;
    },
    onError: (error: any, { file }) => {
      setUploadQueue(prev => 
        prev.map(item => 
          item.file === file ? { 
            ...item, 
            error: error?.response?.data?.detail || error.message || 'Error al subir archivo' 
          } : item
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orden-compra', id] });
      // Clear successful uploads after a delay
      setTimeout(() => {
        setUploadQueue(prev => prev.filter(item => !item.success));
      }, 2000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentoId: number) => 
      ordenesCompraApi.deleteDocumento(documentoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orden-compra', id] });
    },
  });

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `Tipo de archivo no permitido: ${file.type}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(1)}MB (máximo 10MB)`;
    }
    return null;
  };

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        setUploadQueue(prev => [...prev, { file, progress: 0, error }]);
        return;
      }

      // Add to queue
      setUploadQueue(prev => [...prev, { file, progress: 0 }]);
      
      // Start upload
      uploadMutation.mutate({ file });
    });
  };

  // Prevenir drag & drop en toda la página
  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragLeave = (e: DragEvent) => {
      if (!dropRef.current?.contains(e.relatedTarget as Node)) {
        setDragActive(false);
      }
    };

    // Prevenir comportamiento por defecto en toda la página
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.addEventListener(eventName, preventDefaults, false);
    });

    document.addEventListener('dragleave', handleDragLeave, false);

    return () => {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.removeEventListener(eventName, preventDefaults, false);
      });
      document.removeEventListener('dragleave', handleDragLeave, false);
    };
  }, []);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Solo desactivar si realmente salimos del área
    if (!dropRef.current?.contains(e.relatedTarget as Element)) {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFromQueue = (file: File) => {
    setUploadQueue(prev => prev.filter(item => item.file !== file));
  };

  if (isLoading) return <LoadingSpinner />;
  if (!orden) {
    return (
      <div className="p-6">
        <div className="text-red-600 dark:text-red-400">
          Error al cargar la orden de compra
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/ordenes-compra/${id}`)}
            className="text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Documentos de Orden
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Orden {orden.numero_requisicion || `#${orden.id}`} - {orden.proveedor?.nombre}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Subir Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Drag & Drop Area */}
              <div
                ref={dropRef}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors relative ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PDF, imágenes, documentos Word/Excel (máximo 10MB)
                  </p>
                </div>
                
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Upload Queue */}
              {uploadQueue.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    Subiendo archivos
                  </h4>
                  {uploadQueue.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <File className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.file.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {(item.file.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.error ? (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-xs text-red-500">{item.error}</span>
                          </div>
                        ) : item.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{item.progress}%</span>
                          </div>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromQueue(item.file)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Existing Documents */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Documentos Existentes ({orden.documentos?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!orden.documentos || orden.documentos.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay documentos adjuntos
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orden.documentos.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {doc.nombre_archivo}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(doc.fecha_subida)} • {(doc.tamaño_archivo / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteMutation.mutate(doc.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Tipos de Archivo Permitidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div>• PDF (.pdf)</div>
                <div>• Imágenes (.jpg, .jpeg, .png, .gif)</div>
                <div>• Word (.doc, .docx)</div>
                <div>• Excel (.xls, .xlsx)</div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="font-medium">Límites:</div>
                  <div>• Tamaño máximo: 10 MB por archivo</div>
                  <div>• Cantidad: Sin límite</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;