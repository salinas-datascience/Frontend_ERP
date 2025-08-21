import type { Repuesto } from './repuesto';
import type { Maquina } from './maquina';

export interface HistorialRepuesto {
  id: number;
  repuesto_id: number;
  maquina_id: number;
  cantidad_usada: number;
  observaciones?: string;
  fecha: string;
  repuesto?: Repuesto;
  maquina?: Maquina;
}

export type HistorialRepuestoCreate = Omit<HistorialRepuesto, "id" | "fecha" | "repuesto" | "maquina">;

export interface HistorialRepuestoUpdate {
  repuesto_id?: number;
  maquina_id?: number;
  cantidad_usada?: number;
  observaciones?: string;
}