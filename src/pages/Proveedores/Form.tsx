import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { proveedoresApi } from '../../api';
import type { ProveedorCreate, ProveedorUpdate } from '../../types';
import { ArrowLeft, Save } from 'lucide-react';

const ProveedoresForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = React.useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
  });

  const { data: proveedor, isLoading: isLoadingProveedor } = useQuery({
    queryKey: ['proveedor', id],
    queryFn: () => proveedoresApi.getById(Number(id)),
    enabled: isEditing,
  });

  const createMutation = useMutation({
    mutationFn: proveedoresApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      navigate('/proveedores');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProveedorUpdate }) =>
      proveedoresApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      queryClient.invalidateQueries({ queryKey: ['proveedor', id] });
      navigate('/proveedores');
    },
  });

  React.useEffect(() => {
    if (proveedor) {
      setFormData({
        nombre: proveedor.nombre,
        contacto: proveedor.contacto || '',
        telefono: proveedor.telefono || '',
        email: proveedor.email || '',
      });
    }
  }, [proveedor]);

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email es opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre del proveedor es obligatorio');
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      alert('El formato del email no es válido');
      return;
    }

    const submitData = {
      nombre: formData.nombre.trim(),
      contacto: formData.contacto.trim() || undefined,
      telefono: formData.telefono.trim() || undefined,
      email: formData.email.trim() || undefined,
    };

    if (isEditing) {
      updateMutation.mutate({ id: Number(id), data: submitData });
    } else {
      createMutation.mutate(submitData as ProveedorCreate);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isEditing && isLoadingProveedor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando proveedor...</div>
      </div>
    );
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/proveedores')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre *
              </label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ingrese el nombre del proveedor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contacto
              </label>
              <Input
                value={formData.contacto}
                onChange={(e) => handleChange('contacto', e.target.value)}
                placeholder="Nombre de la persona de contacto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono
              </label>
              <Input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="Número de teléfono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Correo electrónico"
              />
              {formData.email && !validateEmail(formData.email) && (
                <p className="text-red-400 text-sm mt-1">
                  El formato del email no es válido
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/proveedores')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || (formData.email && !validateEmail(formData.email))}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProveedoresForm;