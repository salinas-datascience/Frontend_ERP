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
}