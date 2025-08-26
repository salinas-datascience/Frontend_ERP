export interface UsuarioBasico {
  id: number;
  username: string;
  nombre_completo?: string;
}

export interface MaquinaBasica {
  id: number;
  numero_serie: string;
  alias?: string;
  ubicacion?: string;
  modelo?: {
    id: number;
    fabricante?: string;
    modelo: string;
    detalle?: string;
  };
}

export interface ArchivoOT {
  id: number;
  orden_trabajo_id: number;
  nombre_archivo: string;
  nombre_archivo_sistema: string;
  ruta_archivo: string;
  tipo_mime: string;
  tamaño_bytes: number;
  fecha_creacion: string;
  usuario: UsuarioBasico;
}

export interface ArchivoComentarioOT {
  id: number;
  comentario_id: number;
  nombre_archivo: string;
  nombre_archivo_sistema: string;
  ruta_archivo: string;
  tipo_mime: string;
  tamaño_bytes: number;
  fecha_creacion: string;
  usuario: UsuarioBasico;
}

export interface ComentarioOT {
  id: number;
  orden_trabajo_id: number;
  comentario: string;
  fecha_creacion: string;
  usuario: UsuarioBasico;
  archivos: ArchivoComentarioOT[];
}

export interface OrdenTrabajo {
  id: number;
  titulo: string;
  descripcion?: string;
  maquina_id: number;
  usuario_asignado_id: number;
  nivel_criticidad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
  fecha_programada: string;
  fecha_creacion: string;
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  tiempo_estimado_horas?: number;
  
  // Relaciones
  maquina: MaquinaBasica;
  usuario_asignado: UsuarioBasico;
  usuario_creador: UsuarioBasico;
  comentarios: ComentarioOT[];
  archivos: ArchivoOT[];
}

export interface OrdenTrabajoListItem {
  id: number;
  titulo: string;
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
  nivel_criticidad: 'baja' | 'media' | 'alta' | 'critica';
  fecha_programada: string;
  fecha_creacion: string;
  maquina_numero_serie: string;
  maquina_alias?: string;
  usuario_asignado_nombre: string;
  usuario_creador_nombre: string;
}

export interface OrdenTrabajoCreate {
  titulo: string;
  descripcion?: string;
  maquina_id: number;
  usuario_asignado_id: number;
  nivel_criticidad: 'baja' | 'media' | 'alta' | 'critica';
  fecha_programada: string;
  tiempo_estimado_horas?: number;
}

export interface OrdenTrabajoUpdate {
  titulo?: string;
  descripcion?: string;
  maquina_id?: number;
  usuario_asignado_id?: number;
  nivel_criticidad?: 'baja' | 'media' | 'alta' | 'critica';
  fecha_programada?: string;
  tiempo_estimado_horas?: number;
  estado?: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
}

export interface ComentarioOTCreate {
  orden_trabajo_id: number;
  comentario: string;
}

export interface EstadisticasOT {
  total_pendiente: number;
  total_en_proceso: number;
  total_completada: number;
  total_cancelada: number;
  total_baja: number;
  total_media: number;
  total_alta: number;
  total_critica: number;
  total_general: number;
  total_vencidas: number;
}

export interface OrdenTrabajoFilters {
  search?: string;
  estado?: string;
  nivel_criticidad?: string;
  usuario_asignado_id?: number;
  maquina_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

// Constantes para opciones
export const ESTADOS_ORDEN_TRABAJO = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-500' },
  { value: 'en_proceso', label: 'En Proceso', color: 'bg-blue-500' },
  { value: 'completada', label: 'Completada', color: 'bg-green-500' },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-red-500' }
] as const;

export const NIVELES_CRITICIDAD = [
  { value: 'baja', label: 'Baja', color: 'bg-gray-500' },
  { value: 'media', label: 'Media', color: 'bg-yellow-500' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-500' },
  { value: 'critica', label: 'Crítica', color: 'bg-red-500' }
] as const;