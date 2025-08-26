import type { Proveedor } from './proveedor';
import type { Repuesto } from './repuesto';

export interface ItemOrden {
  id: number;
  orden_id: number;
  repuesto_id?: number; // Opcional para items manuales
  cantidad_pedida: number;
  cantidad_recibida: number;
  descripcion_aduana?: string;
  precio_unitario?: string;
  fecha_creacion: string;
  repuesto?: Repuesto;
  // Campos para items manuales
  es_item_manual?: boolean;
  nombre_manual?: string;
  codigo_manual?: string;
  detalle_manual?: string;
  cantidad_minima_manual?: number;
}

export interface DocumentoOrden {
  id: number;
  orden_id: number;
  nombre_archivo: string;
  ruta_archivo: string;
  tipo_archivo: string;
  tamaño_archivo: number;
  fecha_subida: string;
  usuario_subida_id: number;
}

export interface OrdenCompra {
  id: number;
  numero_requisicion?: string;
  proveedor_id: number;
  legajo?: string;
  estado: EstadoOrden;
  fecha_creacion: string;
  fecha_actualizacion: string;
  observaciones?: string;
  usuario_creador_id: number;
  proveedor?: Proveedor;
  items: ItemOrden[];
  documentos: DocumentoOrden[];
}

export interface OrdenCompraListItem {
  id: number;
  numero_requisicion?: string;
  proveedor_nombre: string;
  estado: EstadoOrden;
  fecha_creacion: string;
  total_items: number;
}

export interface EstadisticasOrdenes {
  total: number;
  borradores: number;
  cotizados: number;
  confirmados: number;
  completados: number;
}

// Estados de las órdenes
export type EstadoOrden = 'borrador' | 'cotizado' | 'confirmado' | 'completado';

export const ESTADOS_ORDEN = {
  BORRADOR: 'borrador' as const,
  COTIZADO: 'cotizado' as const,
  CONFIRMADO: 'confirmado' as const,
  COMPLETADO: 'completado' as const,
} as const;

export const ESTADO_LABELS = {
  [ESTADOS_ORDEN.BORRADOR]: 'Borrador',
  [ESTADOS_ORDEN.COTIZADO]: 'Cotizado',
  [ESTADOS_ORDEN.CONFIRMADO]: 'Confirmado',
  [ESTADOS_ORDEN.COMPLETADO]: 'Completado',
} as const;

export const ESTADO_COLORS = {
  [ESTADOS_ORDEN.BORRADOR]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  [ESTADOS_ORDEN.COTIZADO]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [ESTADOS_ORDEN.CONFIRMADO]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [ESTADOS_ORDEN.COMPLETADO]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
} as const;

// DTOs para creación y actualización
export interface ItemOrdenCreate {
  repuesto_id?: number; // Opcional para items manuales
  cantidad_pedida: number;
  descripcion_aduana?: string;
  precio_unitario?: string;
  // Campos para items manuales
  es_item_manual?: boolean;
  nombre_manual?: string;
  codigo_manual?: string;
  detalle_manual?: string;
  cantidad_minima_manual?: number;
}

export interface ItemOrdenUpdate {
  cantidad_pedida?: number;
  descripcion_aduana?: string;
  precio_unitario?: string;
  cantidad_recibida?: number;
}

export interface OrdenCompraCreate {
  proveedor_id: number;
  observaciones?: string;
  items: ItemOrdenCreate[];
}

export interface OrdenCompraUpdate {
  proveedor_id?: number;
  numero_requisicion?: string;
  legajo?: string;
  estado?: EstadoOrden;
  observaciones?: string;
}

export interface ConfirmarLlegadaRequest {
  items_recibidos: Array<{
    item_id: number;
    cantidad_recibida: number;
  }>;
}

// Tipos para filtros
export interface FiltrosOrdenesCompra {
  search?: string;
  estado?: EstadoOrden | '';
  proveedor_id?: number | '';
  fecha_desde?: string;
  fecha_hasta?: string;
}

// Tipo explícito para las respuestas (compatibilidad)
export interface OrdenCompraResponse {
  id: number;
  numero_requisicion?: string;
  proveedor_id: number;
  legajo?: string;
  estado: EstadoOrden;
  fecha_creacion: string;
  fecha_actualizacion: string;
  observaciones?: string;
  usuario_creador_id: number;
  proveedor?: Proveedor;
  items: ItemOrden[];
  documentos: DocumentoOrden[];
}

export const EstadosOrden = {
  BORRADOR: 'borrador' as const,
  COTIZADO: 'cotizado' as const,
  CONFIRMADO: 'confirmado' as const,
  COMPLETADO: 'completado' as const,
};