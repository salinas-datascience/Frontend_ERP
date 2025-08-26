import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Save, ArrowLeft, Shield, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';

interface ChangePasswordForm {
  password_actual: string;
  password_nueva: string;
  confirmar_password: string;
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const { authState, refreshUser, updateUser } = useAuth();
  
  const [formData, setFormData] = useState<ChangePasswordForm>({
    password_actual: '',
    password_nueva: '',
    confirmar_password: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  // Mutation para cambiar contraseña
  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: async () => {
      setSuccess(true);
      setErrors([]);
      setFormData({
        password_actual: '',
        password_nueva: '',
        confirmar_password: ''
      });
      
      // Actualizar la información del usuario para quitar el flag debe_cambiar_password
      try {
        // Primero actualizar localmente
        if (authState.user) {
          updateUser({
            ...authState.user,
            debe_cambiar_password: false
          });
        }
        
        // Luego refrescar desde el servidor
        await refreshUser();
      } catch (error) {
        console.error('Error al actualizar información del usuario:', error);
        // Si falla el refresh, al menos tenemos la actualización local
      }
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    },
    onError: (error: any) => {
      setSuccess(false);
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          setErrors(error.response.data.detail);
        } else {
          setErrors([error.response.data.detail]);
        }
      } else {
        setErrors(['Error al cambiar la contraseña. Inténtalo de nuevo.']);
      }
    }
  });

  // Validación de contraseña
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    
    return errors;
  };

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores al cambiar input
    if (errors.length > 0) {
      setErrors([]);
    }
    if (success) {
      setSuccess(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors: string[] = [];
    
    // Validar campos requeridos
    if (!formData.password_actual.trim()) {
      validationErrors.push('La contraseña actual es requerida');
    }
    
    if (!formData.password_nueva.trim()) {
      validationErrors.push('La nueva contraseña es requerida');
    }
    
    if (!formData.confirmar_password.trim()) {
      validationErrors.push('Confirmar la nueva contraseña es requerido');
    }
    
    // Validar nueva contraseña
    if (formData.password_nueva) {
      const passwordErrors = validatePassword(formData.password_nueva);
      validationErrors.push(...passwordErrors);
    }
    
    // Validar que las contraseñas coincidan
    if (formData.password_nueva !== formData.confirmar_password) {
      validationErrors.push('Las nuevas contraseñas no coinciden');
    }
    
    // Validar que la nueva contraseña sea diferente a la actual
    if (formData.password_actual === formData.password_nueva) {
      validationErrors.push('La nueva contraseña debe ser diferente a la actual');
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Enviar solicitud
    changePasswordMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Cambiar Contraseña
          </h1>
          <p className="text-gray-400 mt-2">
            {authState.user?.debe_cambiar_password 
              ? 'Debes cambiar tu contraseña para continuar' 
              : 'Actualiza tu contraseña por seguridad'
            }
          </p>
        </div>

        {/* Mensaje de contraseña obligatoria */}
        {authState.user?.debe_cambiar_password && (
          <div className="mb-6 p-4 bg-yellow-900 border border-yellow-700 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
              <p className="text-yellow-200 text-sm">
                Tu administrador requiere que cambies tu contraseña
              </p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
          {/* Mensaje de éxito */}
          {success && (
            <div className="mb-6 p-4 bg-green-900 border border-green-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <p className="text-green-200 text-sm">
                    Contraseña cambiada exitosamente. Redirigiendo al inicio en 3 segundos...
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/', { replace: true })}
                  className="ml-4 bg-green-800 border-green-600 text-green-200 hover:bg-green-700"
                >
                  Ir al Inicio
                </Button>
              </div>
            </div>
          )}

          {/* Errores */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-200 text-sm font-medium mb-1">
                    Error al cambiar contraseña:
                  </p>
                  <ul className="text-red-300 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contraseña actual */}
            <div>
              <label htmlFor="password_actual" className="block text-sm font-medium text-gray-200 mb-2">
                Contraseña Actual *
              </label>
              <div className="relative">
                <Input
                  id="password_actual"
                  name="password_actual"
                  type={showPasswords.current ? 'text' : 'password'}
                  required
                  value={formData.password_actual}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu contraseña actual"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nueva contraseña */}
            <div>
              <label htmlFor="password_nueva" className="block text-sm font-medium text-gray-200 mb-2">
                Nueva Contraseña *
              </label>
              <div className="relative">
                <Input
                  id="password_nueva"
                  name="password_nueva"
                  type={showPasswords.new ? 'text' : 'password'}
                  required
                  value={formData.password_nueva}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu nueva contraseña"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Indicador de fortaleza de contraseña */}
              {formData.password_nueva && (
                <div className="mt-2">
                  <div className="text-xs text-gray-400 mb-1">Requisitos de contraseña:</div>
                  <div className="space-y-1">
                    {[
                      { test: formData.password_nueva.length >= 6, text: 'Al menos 6 caracteres' },
                      { test: /(?=.*[a-z])/.test(formData.password_nueva), text: 'Una letra minúscula' },
                      { test: /(?=.*[A-Z])/.test(formData.password_nueva), text: 'Una letra mayúscula' },
                      { test: /(?=.*\d)/.test(formData.password_nueva), text: 'Un número' }
                    ].map((req, index) => (
                      <div key={index} className="flex items-center text-xs">
                        {req.test ? (
                          <CheckCircle className="w-3 h-3 text-green-400 mr-1" />
                        ) : (
                          <div className="w-3 h-3 border border-gray-500 rounded-full mr-1" />
                        )}
                        <span className={req.test ? 'text-green-400' : 'text-gray-500'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar nueva contraseña */}
            <div>
              <label htmlFor="confirmar_password" className="block text-sm font-medium text-gray-200 mb-2">
                Confirmar Nueva Contraseña *
              </label>
              <div className="relative">
                <Input
                  id="confirmar_password"
                  name="confirmar_password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  required
                  value={formData.confirmar_password}
                  onChange={handleInputChange}
                  placeholder="Confirma tu nueva contraseña"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Indicador de coincidencia */}
              {formData.confirmar_password && (
                <div className="mt-1 flex items-center text-xs">
                  {formData.password_nueva === formData.confirmar_password ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-400 mr-1" />
                      <span className="text-green-400">Las contraseñas coinciden</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 text-red-400 mr-1" />
                      <span className="text-red-400">Las contraseñas no coinciden</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-between pt-6">
              {!authState.user?.debe_cambiar_password && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              )}
              
              <Button
                type="submit"
                variant="primary"
                disabled={changePasswordMutation.isPending}
                className={`flex items-center ${authState.user?.debe_cambiar_password ? 'w-full justify-center' : ''}`}
              >
                <Save className="w-4 h-4 mr-2" />
                {changePasswordMutation.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>
            </div>
          </form>
        </div>

        {/* Información de seguridad */}
        <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-gray-200 mb-1">
                Consejos de seguridad:
              </h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Usa una contraseña única que no uses en otros sitios</li>
                <li>• Combina letras, números y símbolos</li>
                <li>• No compartas tu contraseña con nadie</li>
                <li>• Cambia tu contraseña regularmente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}