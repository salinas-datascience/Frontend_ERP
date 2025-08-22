// Tipos para administración
export interface Usuario {
  id: number;
  username: string;
  email: string;
  nombre_completo: string | null;
  activo: boolean;
  es_admin: boolean;
  rol_id: number | null;
  fecha_creacion: string;
  ultima_conexion: string | null;
  debe_cambiar_password: boolean;
  fecha_cambio_password: string | null;
  intentos_fallidos: number;
  bloqueado_hasta: string | null;
  rol: Rol | null;
  paginas_permitidas: Pagina[];
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fecha_creacion: string;
  permisos: Permiso[];
}

export interface Permiso {
  id: number;
  nombre: string;
  descripcion: string | null;
  recurso: string;
  accion: string;
  activo: boolean;
}

export interface Pagina {
  id: number;
  nombre: string;
  ruta: string;
  titulo: string;
  descripcion: string | null;
  icono: string | null;
  orden: number;
  activa: boolean;
  solo_admin: boolean;
}

export interface CreateUsuarioRequest {
  username: string;
  email: string;
  password: string;
  nombre_completo?: string;
  activo?: boolean;
  es_admin?: boolean;
  rol_id?: number;
  debe_cambiar_password?: boolean;
}

export interface UpdateUsuarioRequest {
  username?: string;
  email?: string;
  nombre_completo?: string;
  activo?: boolean;
  es_admin?: boolean;
  rol_id?: number;
}

export interface AsignarPaginasRequest {
  usuario_id: number;
  paginas_ids: number[];
}

export interface CreateRolRequest {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  permisos_ids?: number[];
}

export interface UpdateRolRequest {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  permisos_ids?: number[];
}

export interface CreatePermisoRequest {
  nombre: string;
  descripcion?: string;
  recurso: string;
  accion: string;
  activo?: boolean;
}

export interface UpdatePermisoRequest {
  nombre?: string;
  descripcion?: string;
  recurso?: string;
  accion?: string;
  activo?: boolean;
}