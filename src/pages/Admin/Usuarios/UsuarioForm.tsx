import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { adminUsersService, adminRolesService } from '../../../api/admin';
import type { 
  CreateUsuarioRequest, 
  UpdateUsuarioRequest,
  Usuario,
  Rol 
} from '../../../types/admin';

export default function UsuarioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<CreateUsuarioRequest | UpdateUsuarioRequest>({
    username: '',
    email: '',
    password: '',
    nombre_completo: '',
    activo: true,
    es_admin: false,
    rol_id: undefined,
    debe_cambiar_password: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordToReset, setPasswordToReset] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Queries
  const { data: usuario, isLoading: loadingUsuario } = useQuery({
    queryKey: ['admin', 'usuarios', id],
    queryFn: () => adminUsersService.getUsuario(Number(id)),
    enabled: isEditing
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => adminRolesService.getRoles(0, 100)
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: adminUsersService.createUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] });
      navigate('/admin/usuarios');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUsuarioRequest }) => 
      adminUsersService.updateUsuario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] });
      navigate('/admin/usuarios');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: number; password: string }) =>
      adminUsersService.resetPassword(userId, password, true),
    onSuccess: () => {
      setShowResetPassword(false);
      setPasswordToReset('');
      alert('Contraseña reseteada exitosamente');
    }
  });

  // Efectos
  useEffect(() => {
    if (usuario && isEditing) {
      setFormData({
        username: usuario.username,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo || '',
        activo: usuario.activo,
        es_admin: usuario.es_admin,
        rol_id: usuario.rol_id || undefined
      });
    }
  }, [usuario, isEditing]);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'rol_id' ? (value ? Number(value) : undefined) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.username?.trim()) {
      alert('El nombre de usuario es requerido');
      return;
    }

    if (!formData.email?.trim()) {
      alert('El email es requerido');
      return;
    }

    if (!isEditing && !(formData as CreateUsuarioRequest).password?.trim()) {
      alert('La contraseña es requerida');
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: Number(id),
          data: formData as UpdateUsuarioRequest
        });
      } else {
        await createMutation.mutateAsync(formData as CreateUsuarioRequest);
      }
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordToReset.trim()) {
      alert('Ingresa una nueva contraseña');
      return;
    }

    if (passwordToReset.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        userId: Number(id),
        password: passwordToReset
      });
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    if (isEditing) {
      setPasswordToReset(password);
    } else {
      setFormData(prev => ({ ...prev, password }));
    }
  };

  if (isEditing && loadingUsuario) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p>Cargando usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h1>
            <p className="text-gray-200 mt-1">
              {isEditing ? 'Modificar información del usuario existente' : 'Crear un nuevo usuario en el sistema'}
            </p>
          </div>
          <Link to="/admin/usuarios">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        {/* Información del usuario existente */}
        {isEditing && usuario && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-100 flex items-center">
                  {usuario.es_admin && <Shield className="w-4 h-4 mr-1" />}
                  {usuario.username}
                </h3>
                <p className="text-xs text-gray-300">
                  Creado: {new Date(usuario.fecha_creacion).toLocaleDateString()}
                  {usuario.ultima_conexion && (
                    <span className="ml-3">
                      Último acceso: {new Date(usuario.ultima_conexion).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <Button
                onClick={() => setShowResetPassword(!showResetPassword)}
                variant="outline"
                size="sm"
              >
                Resetear Contraseña
              </Button>
            </div>

            {usuario.debe_cambiar_password && (
              <div className="mt-2 flex items-center text-yellow-400">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span className="text-xs">Este usuario debe cambiar su contraseña</span>
              </div>
            )}
          </div>
        )}

        {/* Formulario de reseteo de contraseña */}
        {isEditing && showResetPassword && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h3 className="text-sm font-medium text-gray-100 mb-3">
              Resetear Contraseña
            </h3>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nueva contraseña"
                    value={passwordToReset}
                    onChange={(e) => setPasswordToReset(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomPassword}
                >
                  Generar
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? 'Reseteando...' : 'Resetear'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowResetPassword(false);
                    setPasswordToReset('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Formulario principal */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-1">
                Nombre de Usuario *
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                placeholder="usuario.ejemplo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="usuario@empresa.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-200 mb-1">
              Nombre Completo
            </label>
            <Input
              id="nombre_completo"
              name="nombre_completo"
              type="text"
              value={formData.nombre_completo}
              onChange={handleInputChange}
              placeholder="Juan Pérez"
            />
          </div>

          {/* Contraseña (solo para nuevo usuario) */}
          {!isEditing && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                Contraseña *
              </label>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={(formData as CreateUsuarioRequest).password}
                    onChange={handleInputChange}
                    placeholder="Contraseña segura"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomPassword}
                >
                  Generar
                </Button>
              </div>
            </div>
          )}

          {/* Rol */}
          <div>
            <label htmlFor="rol_id" className="block text-sm font-medium text-gray-200 mb-1">
              Rol
            </label>
            <select
              id="rol_id"
              name="rol_id"
              value={formData.rol_id || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm text-gray-100 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sin rol asignado</option>
              {roles.map((rol: Rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Configuraciones */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="activo"
                name="activo"
                type="checkbox"
                checked={formData.activo}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-100">
                Usuario activo
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="es_admin"
                name="es_admin"
                type="checkbox"
                checked={formData.es_admin}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="es_admin" className="ml-2 block text-sm text-gray-100 flex items-center">
                <Shield className="w-4 h-4 mr-1 text-purple-500" />
                Permisos de administrador
              </label>
            </div>

            {!isEditing && (
              <div className="flex items-center">
                <input
                  id="debe_cambiar_password"
                  name="debe_cambiar_password"
                  type="checkbox"
                  checked={(formData as CreateUsuarioRequest).debe_cambiar_password}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label htmlFor="debe_cambiar_password" className="ml-2 block text-sm text-gray-100">
                  Forzar cambio de contraseña en primer login
                </label>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-600">
            <Link to="/admin/usuarios">
              <Button variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {(createMutation.isPending || updateMutation.isPending) 
                ? (isEditing ? 'Actualizando...' : 'Creando...') 
                : (isEditing ? 'Actualizar Usuario' : 'Crear Usuario')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}