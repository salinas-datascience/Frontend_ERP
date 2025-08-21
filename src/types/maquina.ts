export interface ModeloMaquina {
  id: number;
  fabricante?: string;
  modelo: string;
  detalle?: string;
}

export type ModeloMaquinaCreate = Omit<ModeloMaquina, "id">;

export interface ModeloMaquinaUpdate {
  fabricante?: string;
  modelo?: string;
  detalle?: string;
}

export interface Maquina {
  id: number;
  numero_serie: string;
  alias?: string;
  ubicacion?: string;
  modelo_id: number;
  modelo?: ModeloMaquina;
}

export type MaquinaCreate = Omit<Maquina, "id" | "modelo">;

export interface MaquinaUpdate {
  numero_serie?: string;
  alias?: string;
  ubicacion?: string;
  modelo_id?: number;
}