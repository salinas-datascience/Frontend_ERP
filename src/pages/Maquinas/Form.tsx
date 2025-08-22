import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { maquinasApi, modelosMaquinasApi } from '../../api';
import type { MaquinaCreate, MaquinaUpdate } from '../../types';
import { ArrowLeft, Save } from 'lucide-react';

const MaquinasForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = React.useState({
    numero_serie: '',
    alias: '',
    ubicacion: '',
    modelo_id: '',
  });

  const { data: maquina, isLoading: isLoadingMaquina } = useQuery({
    queryKey: ['maquina', id],
    queryFn: () => maquinasApi.getById(Number(id)),
    enabled: isEditing,
  });

  const { data: modelos = [], isLoading: isLoadingModelos } = useQuery({
    queryKey: ['modelos-maquinas'],
    queryFn: modelosMaquinasApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: maquinasApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maquinas'] });
      navigate('/maquinas');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MaquinaUpdate }) =>
      maquinasApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maquinas'] });
      queryClient.invalidateQueries({ queryKey: ['maquina', id] });
      navigate('/maquinas');
    },
  });

  React.useEffect(() => {
    if (maquina) {
      setFormData({
        numero_serie: maquina.numero_serie,
        alias: maquina.alias || '',
        ubicacion: maquina.ubicacion || '',
        modelo_id: maquina.modelo_id.toString(),
      });
    }
  }, [maquina]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.numero_serie.trim()) {
      alert('El número de serie es obligatorio');
      return;
    }

    const submitData = {
      numero_serie: formData.numero_serie.trim(),
      alias: formData.alias.trim() || undefined,
      ubicacion: formData.ubicacion.trim() || undefined,
      modelo_id: formData.modelo_id ? Number(formData.modelo_id) : undefined,
    };

    if (isEditing) {
      updateMutation.mutate({ id: Number(id), data: submitData });
    } else {
      if (!submitData.modelo_id) {
        alert('El modelo es obligatorio');
        return;
      }
      createMutation.mutate(submitData as MaquinaCreate);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isEditing && isLoadingMaquina) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando máquina...</div>
      </div>
    );
  }

  const isLoading = createMutation.isPending || updateMutation.isPending || isLoadingModelos;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/maquinas')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? 'Editar Máquina' : 'Nueva Máquina'}
        </h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número de Serie *
              </label>
              <Input
                value={formData.numero_serie}
                onChange={(e) => handleChange('numero_serie', e.target.value)}
                placeholder="Ingrese el número de serie"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Alias
              </label>
              <Input
                value={formData.alias}
                onChange={(e) => handleChange('alias', e.target.value)}
                placeholder="Ingrese un alias (opcional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Modelo {!isEditing && '*'}
              </label>
              <select
                value={formData.modelo_id}
                onChange={(e) => handleChange('modelo_id', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={!isEditing}
              >
                <option value="">Seleccione un modelo</option>
                {modelos.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.fabricante ? `${modelo.fabricante} - ` : ''}{modelo.modelo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ubicación
              </label>
              <Input
                value={formData.ubicacion}
                onChange={(e) => handleChange('ubicacion', e.target.value)}
                placeholder="Ingrese la ubicación (opcional)"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/maquinas')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
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

export default MaquinasForm;