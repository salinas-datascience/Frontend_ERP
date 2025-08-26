// Tipos para órdenes de compra - archivo simplificado

export interface OrdenCompraResponse {
  id: number;
  numero_compra?: string;
  proveedor_id: number;
  legajo?: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  observaciones?: string;
  usuario_creador_id: number;
  proveedor?: {
    id: number;
    nombre: string;
    contacto?: string;
    telefono?: string;
    email?: string;
  };
  items: Array<{
    id: number;
    orden_id: number;
    repuesto_id?: number;
    cantidad_pedida: number;
    cantidad_recibida: number;
    descripcion_aduana?: string;
    precio_unitario?: string;
    fecha_creacion: string;
    repuesto?: {
      id: number;
      codigo: string;
      nombre: string;
      detalle?: string;
    };
    es_item_manual?: boolean;
    nombre_manual?: string;
    codigo_manual?: string;
    detalle_manual?: string;
    cantidad_minima_manual?: number;
  }>;
  documentos: Array<{
    id: number;
    orden_id: number;
    nombre_archivo: string;
    ruta_archivo: string;
    tipo_archivo: string;
    tamaño_archivo: number;
    fecha_subida: string;
    usuario_subida_id: number;
  }>;
}

export const EstadosOrden = {
  BORRADOR: 'borrador' as const,
  PENDIENTE_LLEGADA: 'pendiente_llegada' as const,
  COMPLETADA: 'completada' as const,
};

export interface ConfirmarLlegadaRequest {
  items_recibidos: Array<{
    item_id: number;
    cantidad_recibida: number;
  }>;
}