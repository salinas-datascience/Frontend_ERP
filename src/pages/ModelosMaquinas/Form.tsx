import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { modelosMaquinasApi } from '../../api';
import type { ModeloMaquinaCreate, ModeloMaquinaUpdate } from '../../types';
import { ArrowLeft, Save } from 'lucide-react';

const ModelosMaquinasForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = React.useState({
    modelo: '',
    fabricante: '',
    detalle: '',
  });

  const { data: modelo, isLoading: isLoadingModelo } = useQuery({
    queryKey: ['modelo-maquina', id],
    queryFn: () => modelosMaquinasApi.getById(Number(id)),
    enabled: isEditing,
  });

  const createMutation = useMutation({
    mutationFn: modelosMaquinasApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos-maquinas'] });
      navigate('/modelos-maquinas');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ModeloMaquinaUpdate }) =>
      modelosMaquinasApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos-maquinas'] });
      queryClient.invalidateQueries({ queryKey: ['modelo-maquina', id] });
      navigate('/modelos-maquinas');
    },
  });

  React.useEffect(() => {
    if (modelo) {
      setFormData({
        modelo: modelo.modelo,
        fabricante: modelo.fabricante || '',
        detalle: modelo.detalle || '',
      });
    }
  }, [modelo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.modelo.trim()) {
      alert('El nombre del modelo es obligatorio');
      return;
    }

    const submitData = {
      modelo: formData.modelo.trim(),
      fabricante: formData.fabricante.trim() || undefined,
      detalle: formData.detalle.trim() || undefined,
    };

    if (isEditing) {
      updateMutation.mutate({ id: Number(id), data: submitData });
    } else {
      createMutation.mutate(submitData as ModeloMaquinaCreate);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isEditing && isLoadingModelo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando modelo...</div>
      </div>
    );
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/modelos-maquinas')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? 'Editar Modelo' : 'Nuevo Modelo de Máquina'}
        </h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Modelo *
              </label>
              <Input
                value={formData.modelo}
                onChange={(e) => handleChange('modelo', e.target.value)}
                placeholder="Ingrese el nombre del modelo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fabricante
              </label>
              <Input
                value={formData.fabricante}
                onChange={(e) => handleChange('fabricante', e.target.value)}
                placeholder="Ingrese el fabricante (opcional)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Detalle
              </label>
              <textarea
                value={formData.detalle}
                onChange={(e) => handleChange('detalle', e.target.value)}
                placeholder="Ingrese detalles adicionales del modelo (opcional)"
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/modelos-maquinas')}
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

export default ModelosMaquinasForm;