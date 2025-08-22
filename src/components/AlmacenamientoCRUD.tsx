import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { almacenamientosApi } from '../api';
import type { Almacenamiento, AlmacenamientoCreate, AlmacenamientoUpdate } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { SearchInput } from './ui/SearchInput';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface AlmacenamientoCRUDProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (almacenamiento: Almacenamiento) => void;
}

const AlmacenamientoCRUD: React.FC<AlmacenamientoCRUDProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<Almacenamiento | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<AlmacenamientoCreate>({
    codigo: '',
    nombre: '',
    descripcion: '',
    ubicacion_fisica: '',
    activo: 1,
  });

  const queryClient = useQueryClient();

  const { data: almacenamientos, isLoading } = useQuery({
    queryKey: ['almacenamientos', searchTerm],
    queryFn: () => almacenamientosApi.search(searchTerm),
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: almacenamientosApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['almacenamientos'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AlmacenamientoUpdate }) =>
      almacenamientosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['almacenamientos'] });
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: almacenamientosApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['almacenamientos'] });
    },
  });

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      ubicacion_fisica: '',
      activo: 1,
    });
    setIsCreating(false);
    setEditingItem(null);
  };

  const handleCreate = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      ubicacion_fisica: '',
      activo: 1,
    });
    setEditingItem(null);
    setIsCreating(true);
  };

  const handleEdit = (almacenamiento: Almacenamiento) => {
    setEditingItem(almacenamiento);
    setFormData({
      codigo: almacenamiento.codigo,
      nombre: almacenamiento.nombre,
      descripcion: almacenamiento.descripcion || '',
      ubicacion_fisica: almacenamiento.ubicacion_fisica || '',
      activo: almacenamiento.activo,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCreating) {
      createMutation.mutate(formData);
    } else if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este almacenamiento?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSelect = (almacenamiento: Almacenamiento) => {
    if (onSelect) {
      onSelect(almacenamiento);
      onClose();
    }
  };

  const showingForm = isCreating || editingItem;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Administrar Almacenamiento" size="lg">
      <div className="space-y-4">
        {!showingForm ? (
          <>
            {/* Búsqueda y crear */}
            <div className="flex gap-4">
              <div className="flex-1">
                <SearchInput
                  placeholder="Buscar almacenamiento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm('')}
                  showClearButton={searchTerm.length > 0}
                />
              </div>
              <Button onClick={handleCreate} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo
              </Button>
            </div>

            {/* Tabla */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">Cargando...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Ubicación Física</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {almacenamientos?.map((almacenamiento) => (
                      <TableRow 
                        key={almacenamiento.id}
                        className={onSelect ? 'cursor-pointer hover:bg-gray-700' : ''}
                        onClick={() => onSelect && handleSelect(almacenamiento)}
                      >
                        <TableCell className="font-mono">{almacenamiento.codigo}</TableCell>
                        <TableCell className="font-medium">{almacenamiento.nombre}</TableCell>
                        <TableCell>{almacenamiento.ubicacion_fisica || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(almacenamiento);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(almacenamiento.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </>
        ) : (
          /* Formulario */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Código *
                </label>
                <Input
                  value={formData.codigo}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                  required
                  placeholder="Ej: A1-E1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre *
                </label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  required
                  placeholder="Ej: Estante A1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ubicación Física
                </label>
                <Input
                  value={formData.ubicacion_fisica}
                  onChange={(e) => setFormData(prev => ({ ...prev, ubicacion_fisica: e.target.value }))}
                  placeholder="Ej: Planta 1 - Zona A - Estante 1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  rows={3}
                  className="flex w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción del almacenamiento"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {isCreating ? 'Crear' : 'Actualizar'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export { AlmacenamientoCRUD };