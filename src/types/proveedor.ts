export interface Proveedor {
  id: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
}

export type ProveedorCreate = Omit<Proveedor, "id">;

export interface ProveedorUpdate {
  nombre?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
}