import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService, tokenService } from '../api/auth';

// Definir tipos directamente aquí
interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface ChangePasswordRequest {
  password_actual: string;
  password_nueva: string;
  confirmar_password: string;
}

interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  changePassword: (passwords: ChangePasswordRequest) => Promise<void>;
  updateUser: (user: any) => void;
  clearError: () => void;
}

// Estado inicial
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

// Tipos de acciones del reducer
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: any; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CHANGE_PASSWORD_SUCCESS' };

// Reducer para manejar el estado de autenticación
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'CHANGE_PASSWORD_SUCCESS':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          debe_cambiar_password: false
        } : null,
      };

    default:
      return state;
  }
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

// Provider del contexto
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, dispatch] = useReducer(authReducer, initialAuthState);

  // Verificar si hay token guardado al cargar la app
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = tokenService.getToken();
        
        if (token) {
          // Por ahora, simplificar la verificación
          try {
            const user = await authService.getCurrentUser();
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token }
            });
          } catch (error) {
            console.error('Token inválido, limpiando:', error);
            tokenService.removeToken();
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        tokenService.removeToken();
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Función de login
  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const loginResponse = await authService.login(credentials);
      
      // Guardar token
      tokenService.saveToken(loginResponse.access_token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: loginResponse.usuario,
          token: loginResponse.access_token
        }
      });

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Error al iniciar sesión';
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });

      throw error;
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      // Intentar hacer logout en el servidor
      await authService.logout();
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      // Limpiar token y estado local
      tokenService.removeToken();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (passwords: ChangePasswordRequest) => {
    try {
      await authService.changePassword(passwords);
      dispatch({ type: 'CHANGE_PASSWORD_SUCCESS' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Error al cambiar contraseña';
      throw new Error(errorMessage);
    }
  };

  // Función para actualizar datos del usuario
  const updateUser = useCallback((user: any) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const contextValue: AuthContextType = {
    authState,
    login,
    logout,
    changePassword,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };