import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, User, LogOut, Settings, Key } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { authState, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error durante logout:', error);
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 h-16 flex items-center px-6">
      <div className="flex items-center flex-1">
        <h1 className="text-xl font-semibold text-blue-400">
          Sistema ERP de Mantenimiento
        </h1>
      </div>

      {/* Información del usuario */}
      {authState.user && (
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium">
                {authState.user.nombre_completo || authState.user.username}
              </div>
              <div className="text-xs text-gray-400">
                {authState.user.es_admin ? 'Administrador' : 'Usuario'}
              </div>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Menú desplegable */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
              <div className="px-4 py-2 text-sm text-gray-100 border-b border-gray-700">
                <div className="font-medium">{authState.user.username}</div>
                <div className="text-xs text-gray-400">{authState.user.email}</div>
              </div>
              
              {authState.user.debe_cambiar_password && (
                <div className="px-4 py-2 text-xs text-yellow-400 bg-yellow-900 border-b border-gray-700">
                  ⚠️ Debes cambiar tu contraseña
                </div>
              )}

              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-100 hover:bg-gray-700">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </button>

              <Link 
                to="/change-password"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-100 hover:bg-gray-700"
              >
                <Key className="w-4 h-4 mr-2" />
                Cambiar Contraseña
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-100 hover:bg-gray-700 border-t border-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          )}

          {/* Overlay para cerrar el menú */}
          {userMenuOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setUserMenuOpen(false)}
            />
          )}
        </div>
      )}
    </header>
  );
};

export { Navbar };