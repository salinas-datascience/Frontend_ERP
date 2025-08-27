import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { FilterSelect } from '../../../components/ui/FilterSelect';
import { ordenesTrabajoApi } from '../../../api';
import { Save, X } from 'lucide-react';
import { TIPOS_MANTENIMIENTO, NIVELES_CRITICIDAD } from '../../../types/orden-trabajo';
import type { Maquina } from '../../../types';

interface NuevaOTModalProps {
  isOpen: boolean;
  onClose: () => void;
  maquina?: Maquina;
  fechaSugerida?: Date;
  usuarios: Array<{ id: number; username: string; nombre_completo?: string; activo: boolean }>;
  onOTCreated?: (fechaCreada: Date) => void;
}

interface FormData {
  titulo: string;
  descripcion: string;
  maquina_id: number;
  usuario_asignado_id: number;
  tipo_mantenimiento: 'preventivo' | 'predictivo' | 'correctivo';
  nivel_criticidad: 'baja' | 'media' | 'alta' | 'critica';
  fecha_programada: string;
  tiempo_estimado_horas: number | null;
}

interface FormErrors {
  titulo?: string;
  maquina_id?: string;
  usuario_asignado_id?: string;
  fecha_programada?: string;
}

const NuevaOTModal: React.FC<NuevaOTModalProps> = ({
  isOpen,
  onClose,
  maquina,
  fechaSugerida,
  usuarios,
  onOTCreated
}) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = React.useState<FormData>({
    titulo: '',
    descripcion: '',
    maquina_id: maquina?.id || 0,
    usuario_asignado_id: 0,
    tipo_mantenimiento: 'preventivo',
    nivel_criticidad: 'media',
    fecha_programada: fechaSugerida?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    tiempo_estimado_horas: null
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Actualizar datos cuando cambie la máquina o fecha sugerida
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      maquina_id: maquina?.id || 0,
      fecha_programada: fechaSugerida?.toISOString().split('T')[0] || prev.fecha_programada
    }));
  }, [maquina, fechaSugerida]);

  const createMutation = useMutation({
    mutationFn: ordenesTrabajoApi.create,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo'] });
      
      // Notificar al componente padre sobre la fecha de la OT creada
      if (onOTCreated && formData.fecha_programada) {
        onOTCreated(new Date(formData.fecha_programada));
      }
      
      handleClose();
    },
    onError: (error) => {
      console.error('Error creando OT:', error);
    }
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo si existe
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }

    if (!formData.maquina_id) {
      newErrors.maquina_id = 'Debe seleccionar una máquina';
    }

    if (!formData.usuario_asignado_id) {
      newErrors.usuario_asignado_id = 'Debe asignar un técnico';
    }

    if (!formData.fecha_programada) {
      newErrors.fecha_programada = 'La fecha programada es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const otData = {
        ...formData,
        tiempo_estimado_horas: formData.tiempo_estimado_horas || undefined
      };
      
      await createMutation.mutateAsync(otData);
    } catch (error) {
      console.error('Error al crear OT:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      maquina_id: 0,
      usuario_asignado_id: 0,
      tipo_mantenimiento: 'preventivo',
      nivel_criticidad: 'media',
      fecha_programada: new Date().toISOString().split('T')[0],
      tiempo_estimado_horas: null
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const usuarioOptions = [
    { value: '', label: 'Selecciona un técnico' },
    ...usuarios
      .filter(u => u.activo)
      .map(u => ({
        value: u.id.toString(),
        label: u.nombre_completo || u.username
      }))
  ];

  const tipoMantenimientoOptions = TIPOS_MANTENIMIENTO.map(tipo => ({
    value: tipo.value,
    label: tipo.label
  }));

  const criticidadOptions = NIVELES_CRITICIDAD.map(nivel => ({
    value: nivel.value,
    label: nivel.label
  }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Nueva Orden de Trabajo
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título *
              </label>
              <Input
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                placeholder="Ej: Mantenimiento preventivo motor principal"
              />
              {errors.titulo && (
                <p className="text-red-400 text-sm mt-1">{errors.titulo}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe las tareas específicas a realizar..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Máquina *
              </label>
              <div className="p-3 bg-gray-700 rounded-md">
                <div className="font-mono text-sm text-white">
                  {maquina?.numero_serie || 'No seleccionada'}
                </div>
                {maquina?.alias && (
                  <div className="text-xs text-gray-400">({maquina.alias})</div>
                )}
              </div>
              {errors.maquina_id && (
                <p className="text-red-400 text-sm mt-1">{errors.maquina_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Técnico Asignado *
              </label>
              <FilterSelect
                value={formData.usuario_asignado_id.toString()}
                onChange={(e) => handleInputChange('usuario_asignado_id', Number(e.target.value))}
                options={usuarioOptions}
              />
              {errors.usuario_asignado_id && (
                <p className="text-red-400 text-sm mt-1">{errors.usuario_asignado_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Mantenimiento *
              </label>
              <FilterSelect
                value={formData.tipo_mantenimiento}
                onChange={(e) => handleInputChange('tipo_mantenimiento', e.target.value)}
                options={tipoMantenimientoOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nivel de Criticidad *
              </label>
              <FilterSelect
                value={formData.nivel_criticidad}
                onChange={(e) => handleInputChange('nivel_criticidad', e.target.value)}
                options={criticidadOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha Programada *
              </label>
              <Input
                type="date"
                value={formData.fecha_programada}
                onChange={(e) => handleInputChange('fecha_programada', e.target.value)}
              />
              {errors.fecha_programada && (
                <p className="text-red-400 text-sm mt-1">{errors.fecha_programada}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tiempo Estimado (horas)
              </label>
              <Input
                type="number"
                value={formData.tiempo_estimado_horas || ''}
                onChange={(e) => handleInputChange('tiempo_estimado_horas', e.target.value ? Number(e.target.value) : null)}
                placeholder="Ej: 2"
                min="0.5"
                step="0.5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Creando...' : 'Crear Orden de Trabajo'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export { NuevaOTModal };