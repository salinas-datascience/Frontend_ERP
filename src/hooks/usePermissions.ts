import { useAuth } from '../contexts/AuthContext';
import type { Pagina } from '../types/admin';

export interface UserPermissions {
  canAccessPage: (route: string) => boolean;
  canAccessAdminPages: () => boolean;
  getAllowedPages: () => Pagina[];
  getSystemPages: () => Pagina[];
  getAdminPages: () => Pagina[];
  isAdmin: () => boolean;
}

export function usePermissions(): UserPermissions {
  const { authState } = useAuth();

  const canAccessPage = (route: string): boolean => {
    // Si no hay usuario autenticado, no puede acceder
    if (!authState.user) {
      return false;
    }

    // Verificar si tiene la página asignada
    const userPages = authState.user.paginas_permitidas || [];
    const hasPageAccess = userPages.some((page: Pagina) => {
      // Comparar rutas exactas o rutas que empiecen con la ruta de la página
      return route === page.ruta || route.startsWith(page.ruta + '/');
    });

    // Si es admin y no tiene páginas asignadas, permitir acceso (fallback)
    // Esto es un respaldo en caso de que el admin no tenga páginas configuradas
    if (authState.user.es_admin && userPages.length === 0) {
      return true;
    }

    return hasPageAccess;
  };

  const canAccessAdminPages = (): boolean => {
    return authState.user?.es_admin || false;
  };

  const getAllowedPages = (): Pagina[] => {
    if (!authState.user) {
      return [];
    }

    // Si es admin, devolver todas las páginas (esto debería venir del servidor)
    if (authState.user.es_admin) {
      return authState.user.paginas_permitidas || [];
    }

    // Devolver solo páginas asignadas
    return authState.user.paginas_permitidas || [];
  };

  const getSystemPages = (): Pagina[] => {
    const allowedPages = getAllowedPages();
    return allowedPages.filter(page => !page.solo_admin);
  };

  const getAdminPages = (): Pagina[] => {
    const allowedPages = getAllowedPages();
    return allowedPages.filter(page => page.solo_admin);
  };

  const isAdmin = (): boolean => {
    return authState.user?.es_admin || false;
  };

  return {
    canAccessPage,
    canAccessAdminPages,
    getAllowedPages,
    getSystemPages,
    getAdminPages,
    isAdmin
  };
}