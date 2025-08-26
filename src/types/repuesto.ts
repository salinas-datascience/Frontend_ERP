import type { Proveedor } from './proveedor';
import type { Almacenamiento } from './almacenamiento';

export interface Repuesto {
  id: number;
  codigo: string;
  nombre: string;
  detalle?: string;
  ubicacion?: string; // Campo legacy para compatibilidad
  almacenamiento_id?: number;
  cantidad: number;
  cantidad_minima?: number; // Cantidad mínima personalizada para alertas
  proveedor_id?: number;
  tipo?: string; // insumo, repuesto, consumible (opcional)
  descripcion_aduana?: string; // Descripción para aduana (opcional)
  proveedor?: Proveedor;
  almacenamiento?: Almacenamiento;
}

export type RepuestoCreate = Omit<Repuesto, "id" | "proveedor" | "almacenamiento">;

export interface RepuestoUpdate {
  codigo?: string;
  nombre?: string;
  detalle?: string;
  ubicacion?: string;
  almacenamiento_id?: number;
  cantidad?: number;
  cantidad_minima?: number;
  proveedor_id?: number;
  tipo?: string;
  descripcion_aduana?: string;
}

// Tipos de repuesto disponibles
export const TIPOS_REPUESTO = {
  INSUMO: 'insumo',
  REPUESTO: 'repuesto', 
  CONSUMIBLE: 'consumible'
} as const;

export const TIPO_LABELS = {
  [TIPOS_REPUESTO.INSUMO]: 'Insumo',
  [TIPOS_REPUESTO.REPUESTO]: 'Repuesto',
  [TIPOS_REPUESTO.CONSUMIBLE]: 'Consumible'
} as const;

export const TIPO_COLORS = {
  [TIPOS_REPUESTO.INSUMO]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [TIPOS_REPUESTO.REPUESTO]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [TIPOS_REPUESTO.CONSUMIBLE]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
} as const;

export type TipoRepuesto = typeof TIPOS_REPUESTO[keyof typeof TIPOS_REPUESTO];