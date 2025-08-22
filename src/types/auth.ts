// Tipos para el sistema de autenticación

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

// Requests
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
  expires_in: number;
}

export interface ChangePasswordRequest {
  password_actual: string;
  password_nueva: string;
  confirmar_password: string;
}

export interface ResetPasswordRequest {
  usuario_id: number;
  password_nueva: string;
  forzar_cambio: boolean;
}

export interface UsuarioCreate {
  username: string;
  email: string;
  password: string;
  nombre_completo?: string;
  activo?: boolean;
  es_admin?: boolean;
  rol_id?: number;
  debe_cambiar_password?: boolean;
}

export interface UsuarioUpdate {
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

// Estado de autenticación
export interface AuthState {
  isAuthenticated: boolean;
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Contexto de autenticación
export interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  changePassword: (passwords: ChangePasswordRequest) => Promise<void>;
  updateUser: (user: Usuario) => void;
  clearError: () => void;
}