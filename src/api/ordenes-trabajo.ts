import { apiClient } from './client';
import type {
  OrdenTrabajo,
  OrdenTrabajoListItem,
  OrdenTrabajoCreate,
  OrdenTrabajoUpdate,
  ComentarioOT,
  ComentarioOTCreate,
  EstadisticasOT,
  OrdenTrabajoFilters,
  ArchivoOT,
  ArchivoComentarioOT
} from '../types';

export const ordenesTrabajoApi = {
  // Obtener estadísticas
  getStats: (): Promise<EstadisticasOT> => {
    return apiClient.get('/api/ordenes-trabajo/stats').then(res => res.data);
  },

  // Obtener todas las órdenes de trabajo con filtros
  getAll: (params: OrdenTrabajoFilters & {
    skip?: number;
    limit?: number;
  } = {}): Promise<OrdenTrabajo[]> => {
    return apiClient.get('/api/ordenes-trabajo/', { params }).then(res => res.data);
  },

  // Obtener órdenes de trabajo asignadas al usuario actual
  getMisOrdenes: (params: {
    skip?: number;
    limit?: number;
    estado?: string;
  } = {}): Promise<OrdenTrabajo[]> => {
    return apiClient.get('/api/ordenes-trabajo/mis-ordenes', { params }).then(res => res.data);
  },

  // Obtener una orden de trabajo por ID
  getById: (id: number): Promise<OrdenTrabajo> => {
    return apiClient.get(`/api/ordenes-trabajo/${id}`).then(res => res.data);
  },

  // Crear nueva orden de trabajo
  create: (data: OrdenTrabajoCreate): Promise<OrdenTrabajo> => {
    return apiClient.post('/api/ordenes-trabajo/', data).then(res => res.data);
  },

  // Actualizar orden de trabajo
  update: (id: number, data: OrdenTrabajoUpdate): Promise<OrdenTrabajo> => {
    return apiClient.put(`/api/ordenes-trabajo/${id}`, data).then(res => res.data);
  },

  // Eliminar orden de trabajo
  delete: (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`/api/ordenes-trabajo/${id}`).then(res => res.data);
  },

  // Cambiar solo el estado de una orden de trabajo
  changeState: (id: number, estado: string): Promise<{
    message: string;
    orden: OrdenTrabajo;
  }> => {
    return apiClient.patch(`/api/ordenes-trabajo/${id}/estado?estado=${estado}`).then(res => res.data);
  },

  // === COMENTARIOS ===

  // Agregar comentario a una orden de trabajo
  addComment: (id: number, comentario: Omit<ComentarioOTCreate, 'orden_trabajo_id'>): Promise<ComentarioOT> => {
    return apiClient.post(`/api/ordenes-trabajo/${id}/comentarios`, {
      ...comentario,
      orden_trabajo_id: id
    }).then(res => res.data);
  },

  // Obtener comentarios de una orden de trabajo
  getComments: (id: number): Promise<ComentarioOT[]> => {
    return apiClient.get(`/api/ordenes-trabajo/${id}/comentarios`).then(res => res.data);
  },

  // === ARCHIVOS DE ORDENES DE TRABAJO ===

  // Subir archivo a una orden de trabajo
  uploadFile: (id: number, file: File): Promise<ArchivoOT> => {
    const formData = new FormData();
    formData.append('archivo', file);
    
    return apiClient.post(`/api/ordenes-trabajo/${id}/archivos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  // Obtener archivos de una orden de trabajo
  getFiles: (id: number): Promise<ArchivoOT[]> => {
    return apiClient.get(`/api/ordenes-trabajo/${id}/archivos`).then(res => res.data);
  },

  // Descargar archivo de orden de trabajo
  downloadFile: (archivoId: number): Promise<Blob> => {
    return apiClient.get(`/api/ordenes-trabajo/archivos/${archivoId}/download`, {
      responseType: 'blob',
    }).then(res => res.data);
  },

  // Eliminar archivo de orden de trabajo
  deleteFile: (archivoId: number): Promise<{ message: string }> => {
    return apiClient.delete(`/api/ordenes-trabajo/archivos/${archivoId}`).then(res => res.data);
  },

  // === ARCHIVOS DE COMENTARIOS ===

  // Subir archivo a un comentario
  uploadCommentFile: (comentarioId: number, file: File): Promise<ArchivoComentarioOT> => {
    const formData = new FormData();
    formData.append('archivo', file);
    
    return apiClient.post(`/api/ordenes-trabajo/comentarios/${comentarioId}/archivos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  // Obtener archivos de un comentario
  getCommentFiles: (comentarioId: number): Promise<ArchivoComentarioOT[]> => {
    return apiClient.get(`/api/ordenes-trabajo/comentarios/${comentarioId}/archivos`).then(res => res.data);
  },

  // Descargar archivo de comentario
  downloadCommentFile: (archivoId: number): Promise<Blob> => {
    return apiClient.get(`/api/ordenes-trabajo/comentarios/archivos/${archivoId}/download`, {
      responseType: 'blob',
    }).then(res => res.data);
  },

  // Eliminar archivo de comentario
  deleteCommentFile: (archivoId: number): Promise<{ message: string }> => {
    return apiClient.delete(`/api/ordenes-trabajo/comentarios/archivos/${archivoId}`).then(res => res.data);
  }
};

// Helper para formatear fechas para la API
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString();
};

// Helper para parsear fechas de la API
export const parseDateFromAPI = (dateString: string): Date => {
  return new Date(dateString);
};

// Helper para obtener el color de un estado
export const getEstadoColor = (estado: string): string => {
  const colores = {
    'pendiente': 'bg-yellow-500',
    'en_proceso': 'bg-blue-500',
    'completada': 'bg-green-500',
    'cancelada': 'bg-red-500'
  };
  return colores[estado as keyof typeof colores] || 'bg-gray-500';
};

// Helper para obtener el color de criticidad
export const getCriticidadColor = (criticidad: string): string => {
  const colores = {
    'baja': 'bg-gray-500',
    'media': 'bg-yellow-500', 
    'alta': 'bg-orange-500',
    'critica': 'bg-red-500'
  };
  return colores[criticidad as keyof typeof colores] || 'bg-gray-500';
};

// Helper para obtener el texto de un estado
export const getEstadoLabel = (estado: string): string => {
  const labels = {
    'pendiente': 'Pendiente',
    'en_proceso': 'En Proceso',
    'completada': 'Completada', 
    'cancelada': 'Cancelada'
  };
  return labels[estado as keyof typeof labels] || estado;
};

// Helper para obtener el texto de criticidad
export const getCriticidadLabel = (criticidad: string): string => {
  const labels = {
    'baja': 'Baja',
    'media': 'Media',
    'alta': 'Alta',
    'critica': 'Crítica'
  };
  return labels[criticidad as keyof typeof labels] || criticidad;
};