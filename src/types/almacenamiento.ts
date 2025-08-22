export interface Almacenamiento {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  ubicacion_fisica?: string;
  activo: number;
}

export type AlmacenamientoCreate = Omit<Almacenamiento, "id">;

export interface AlmacenamientoUpdate {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  ubicacion_fisica?: string;
  activo?: number;
}