import { apiClient } from './client';
import type {
  Usuario,
  Rol,
  Permiso,
  Pagina,
  CreateUsuarioRequest,
  UpdateUsuarioRequest,
  AsignarPaginasRequest
} from '../types/admin';

// Re-exportar tipos para compatibilidad
export type {
  Usuario,
  Rol,
  Permiso,
  Pagina,
  CreateUsuarioRequest,
  UpdateUsuarioRequest,
  AsignarPaginasRequest
} from '../types/admin';

// Servicios de gestión de usuarios
export const adminUsersService = {
  // Listar usuarios
  async getUsuarios(skip = 0, limit = 100): Promise<Usuario[]> {
    const response = await apiClient.get<Usuario[]>(`/usuarios?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Obtener usuario por ID
  async getUsuario(id: number): Promise<Usuario> {
    const response = await apiClient.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  },

  // Crear usuario
  async createUsuario(data: CreateUsuarioRequest): Promise<Usuario> {
    const response = await apiClient.post<Usuario>('/usuarios', data);
    return response.data;
  },

  // Actualizar usuario
  async updateUsuario(id: number, data: UpdateUsuarioRequest): Promise<Usuario> {
    const response = await apiClient.put<Usuario>(`/usuarios/${id}`, data);
    return response.data;
  },

  // Desactivar usuario
  async deleteUsuario(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/usuarios/${id}`);
    return response.data;
  },

  // Reactivar usuario
  async activateUsuario(id: number): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/usuarios/${id}/activate`);
    return response.data;
  },

  // Desbloquear usuario
  async unlockUsuario(id: number): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/usuarios/${id}/unlock`);
    return response.data;
  },

  // Asignar páginas a usuario
  async asignarPaginas(data: AsignarPaginasRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/usuarios/${data.usuario_id}/asignar-paginas`, data);
    return response.data;
  },

  // Obtener páginas de usuario
  async getPaginasUsuario(id: number): Promise<Pagina[]> {
    const response = await apiClient.get<Pagina[]>(`/usuarios/${id}/paginas`);
    return response.data;
  },

  // Resetear contraseña
  async resetPassword(userId: number, newPassword: string, forceChange = true): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
      usuario_id: userId,
      password_nueva: newPassword,
      forzar_cambio: forceChange
    });
    return response.data;
  }
};

// Servicios de gestión de roles
export const adminRolesService = {
  // Listar roles
  async getRoles(skip = 0, limit = 100): Promise<Rol[]> {
    const response = await apiClient.get<Rol[]>(`/admin/roles?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Obtener rol por ID
  async getRol(id: number): Promise<Rol> {
    const response = await apiClient.get<Rol>(`/admin/roles/${id}`);
    return response.data;
  },

  // Crear rol
  async createRol(data: any): Promise<Rol> {
    const response = await apiClient.post<Rol>('/admin/roles', data);
    return response.data;
  },

  // Actualizar rol
  async updateRol(id: number, data: any): Promise<Rol> {
    const response = await apiClient.put<Rol>(`/admin/roles/${id}`, data);
    return response.data;
  },

  // Eliminar rol
  async deleteRol(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/admin/roles/${id}`);
    return response.data;
  }
};

// Servicios de gestión de permisos
export const adminPermisosService = {
  // Listar permisos
  async getPermisos(skip = 0, limit = 100): Promise<Permiso[]> {
    const response = await apiClient.get<Permiso[]>(`/admin/permisos?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Obtener permiso por ID
  async getPermiso(id: number): Promise<Permiso> {
    const response = await apiClient.get<Permiso>(`/admin/permisos/${id}`);
    return response.data;
  },

  // Crear permiso
  async createPermiso(data: any): Promise<Permiso> {
    const response = await apiClient.post<Permiso>('/admin/permisos', data);
    return response.data;
  },

  // Actualizar permiso
  async updatePermiso(id: number, data: any): Promise<Permiso> {
    const response = await apiClient.put<Permiso>(`/admin/permisos/${id}`, data);
    return response.data;
  },

  // Eliminar permiso
  async deletePermiso(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/admin/permisos/${id}`);
    return response.data;
  }
};

// Servicios de gestión de páginas
export const adminPaginasService = {
  // Listar páginas
  async getPaginas(skip = 0, limit = 100): Promise<Pagina[]> {
    const response = await apiClient.get<Pagina[]>(`/admin/paginas?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Obtener página por ID
  async getPagina(id: number): Promise<Pagina> {
    const response = await apiClient.get<Pagina>(`/admin/paginas/${id}`);
    return response.data;
  },

  // Crear página
  async createPagina(data: any): Promise<Pagina> {
    const response = await apiClient.post<Pagina>('/admin/paginas', data);
    return response.data;
  },

  // Actualizar página
  async updatePagina(id: number, data: any): Promise<Pagina> {
    const response = await apiClient.put<Pagina>(`/admin/paginas/${id}`, data);
    return response.data;
  },

  // Eliminar página
  async deletePagina(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/admin/paginas/${id}`);
    return response.data;
  }
};