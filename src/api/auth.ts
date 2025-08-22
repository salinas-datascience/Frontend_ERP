import { apiClient } from './client';

// Definir tipos directamente aquí para evitar problemas de imports
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: any;
  expires_in: number;
}

export interface ChangePasswordRequest {
  password_actual: string;
  password_nueva: string;
  confirmar_password: string;
}

// Servicios de autenticación
export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  // Obtener información del usuario actual
  async getCurrentUser(): Promise<any> {
    const response = await apiClient.get<any>('/auth/me');
    return response.data;
  },

  // Obtener páginas permitidas para el usuario actual
  async getCurrentUserPages(): Promise<{ paginas: any[] }> {
    const response = await apiClient.get<{ paginas: any[] }>('/auth/me/paginas');
    return response.data;
  },

  // Cambiar contraseña
  async changePassword(passwords: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', passwords);
    return response.data;
  },

  // Verificar token
  async checkToken(): Promise<{ valid: boolean; username: string; debe_cambiar_password: boolean }> {
    const response = await apiClient.get<{ 
      valid: boolean; 
      username: string; 
      debe_cambiar_password: boolean 
    }>('/auth/check-token');
    return response.data;
  },

  // Logout
  async logout(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  // Reset contraseña (solo admin)
  async resetPassword(resetData: any): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', resetData);
    return response.data;
  }
};

// Utilidades para manejo de tokens
export const tokenService = {
  // Guardar token en localStorage
  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  // Obtener token de localStorage
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Eliminar token de localStorage
  removeToken(): void {
    localStorage.removeItem('auth_token');
  },

  // Verificar si hay token
  hasToken(): boolean {
    return !!this.getToken();
  },

  // Obtener header de autorización
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};