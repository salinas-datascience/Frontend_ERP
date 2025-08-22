import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { repuestosApi, proveedoresApi, almacenamientosApi } from '../../api';
import type { RepuestoCreate, RepuestoUpdate } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AlmacenamientoCRUD } from '../../components/AlmacenamientoCRUD';
import { ArrowLeft, Save, Settings } from 'lucide-react';

const RepuestosForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<RepuestoCreate>({
    codigo: '',
    nombre: '',
    detalle: '',
    ubicacion: '',
    almacenamiento_id: undefined,
    cantidad: 0,
    proveedor_id: undefined,
  });

  const [showAlmacenamientoModal, setShowAlmacenamientoModal] = useState(false);

  const { data: repuesto, isLoading: isLoadingRepuesto } = useQuery({
    queryKey: ['repuesto', id],
    queryFn: () => repuestosApi.getById(Number(id)),
    enabled: isEditing,
  });

  const { data: proveedores } = useQuery({
    queryKey: ['proveedores'],
    queryFn: proveedoresApi.getAll,
  });

  const { data: almacenamientos } = useQuery({
    queryKey: ['almacenamientos'],
    queryFn: almacenamientosApi.getAll,
  });

  useEffect(() => {
    if (repuesto && isEditing) {
      setFormData({
        codigo: repuesto.codigo,
        nombre: repuesto.nombre,
        detalle: repuesto.detalle || '',
        ubicacion: repuesto.ubicacion || '',
        almacenamiento_id: repuesto.almacenamiento_id,
        cantidad: repuesto.cantidad,
        proveedor_id: repuesto.proveedor_id,
      });
    }
  }, [repuesto, isEditing]);

  const createMutation = useMutation({
    mutationFn: repuestosApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repuestos'] });
      navigate('/repuestos');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RepuestoUpdate }) =>
      repuestosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repuestos'] });
      queryClient.invalidateQueries({ queryKey: ['repuesto', id] });
      navigate('/repuestos');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && id) {
      updateMutation.mutate({ id: Number(id), data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidad' || name === 'proveedor_id' || name === 'almacenamiento_id'
        ? value === '' ? undefined : Number(value)
        : value
    }));
  };

  const handleAlmacenamientoSelect = (almacenamiento: any) => {
    setFormData(prev => ({
      ...prev,
      almacenamiento_id: almacenamiento.id
    }));
    // Refrescar la lista de almacenamientos
    queryClient.invalidateQueries({ queryKey: ['almacenamientos'] });
  };

  if (isEditing && isLoadingRepuesto) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando repuesto...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/repuestos')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? 'Editar Repuesto' : 'Nuevo Repuesto'}
        </h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Código *
              </label>
              <Input
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                required
                placeholder="Ej: REP001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre *
              </label>
              <Input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Nombre del repuesto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad *
              </label>
              <Input
                name="cantidad"
                type="number"
                min="0"
                value={formData.cantidad}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Almacenamiento
              </label>
              <div className="flex gap-2">
                <select
                  name="almacenamiento_id"
                  value={formData.almacenamiento_id || ''}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar almacenamiento</option>
                  {almacenamientos?.map((almacenamiento) => (
                    <option key={almacenamiento.id} value={almacenamiento.id}>
                      {almacenamiento.codigo} - {almacenamiento.nombre}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAlmacenamientoModal(true)}
                  className="whitespace-nowrap"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Proveedor
              </label>
              <select
                name="proveedor_id"
                value={formData.proveedor_id || ''}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores?.map((proveedor) => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Detalle
              </label>
              <textarea
                name="detalle"
                value={formData.detalle}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción detallada del repuesto"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/repuestos')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>

      {/* Modal de gestión de almacenamiento */}
      <AlmacenamientoCRUD
        isOpen={showAlmacenamientoModal}
        onClose={() => setShowAlmacenamientoModal(false)}
        onSelect={handleAlmacenamientoSelect}
      />
    </div>
  );
};

export default RepuestosForm;