import type { Proveedor } from './proveedor';

export interface Repuesto {
  id: number;
  codigo: string;
  nombre: string;
  detalle?: string;
  ubicacion?: string;
  cantidad: number;
  proveedor_id?: number;
  proveedor?: Proveedor;
}

export type RepuestoCreate = Omit<Repuesto, "id" | "proveedor">;

export interface RepuestoUpdate {
  codigo?: string;
  nombre?: string;
  detalle?: string;
  ubicacion?: string;
  cantidad?: number;
  proveedor_id?: number;
}