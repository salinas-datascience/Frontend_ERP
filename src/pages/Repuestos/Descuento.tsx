import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { repuestosApi, maquinasApi, historialApi } from '../../api';
import { useRepuestosSearch } from '../../hooks/useRepuestosSearch';
import { useInvalidateRepuestos } from '../../hooks/useInvalidateRepuestos';
import { Minus, Search, AlertCircle, CheckCircle, Filter, X, Clock } from 'lucide-react';
import type { Repuesto, Maquina, HistorialRepuestoCreate } from '../../types';

interface FormData {
  repuesto_id: number;
  maquina_id: number;
  cantidad_usada: number;
  observaciones: string;
  maquina_alias: string;
}

const DescuentoRepuestos: React.FC = () => {
  const queryClient = useQueryClient();
  const { invalidateRepuestos } = useInvalidateRepuestos();
  
  const [formData, setFormData] = useState<FormData>({
    repuesto_id: 0,
    maquina_id: 0,
    cantidad_usada: 1,
    observaciones: '',
    maquina_alias: '',
  });

  const [selectedRepuesto, setSelectedRepuesto] = useState<Repuesto | null>(null);
  const [selectedMaquina, setSelectedMaquina] = useState<Maquina | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    repuestos,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    isLoading: repuestosLoading,
    error: repuestosError,
    uniqueProveedores,
    uniqueUbicaciones,
  } = useRepuestosSearch();

  const { data: maquinas = [], isLoading: maquinasLoading } = useQuery({
    queryKey: ['maquinas'],
    queryFn: maquinasApi.getAll,
  });

  const { data: historial = [], isLoading: historialLoading, error: historialError } = useQuery({
    queryKey: ['historial'],
    queryFn: historialApi.getAll,
    retry: 1,
    retryDelay: 1000,
  });

  const descuentoMutation = useMutation({
    mutationFn: historialApi.create,
    onSuccess: () => {
      // Invalidate historial and repuestos queries (since stock changes)
      queryClient.invalidateQueries({ queryKey: ['historial'] });
      invalidateRepuestos();
      setShowSuccess(true);
      resetForm();
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error: any) => {
      console.error('Error al crear descuento:', error);
      // Mostrar error específico si es un problema de backend
      if (error?.response?.status === 500) {
        alert('Error en el servidor: No se pudo guardar el descuento. Verifica que la base de datos esté configurada correctamente.');
      } else {
        alert('Error al registrar el descuento. Inténtalo de nuevo.');
      }
    },
  });

  const resetForm = () => {
    setFormData({
      repuesto_id: 0,
      maquina_id: 0,
      cantidad_usada: 1,
      observaciones: '',
      maquina_alias: '',
    });
    setSelectedRepuesto(null);
    setSelectedMaquina(null);
    setErrors({});
  };

  const handleMaquinaAliasChange = (alias: string) => {
    setFormData(prev => ({ ...prev, maquina_alias: alias }));
    
    if (alias.trim()) {
      const maquina = maquinas.find(m => 
        m.alias?.toLowerCase().includes(alias.toLowerCase())
      );
      
      if (maquina) {
        setSelectedMaquina(maquina);
        setFormData(prev => ({ ...prev, maquina_id: maquina.id }));
      } else {
        setSelectedMaquina(null);
        setFormData(prev => ({ ...prev, maquina_id: 0 }));
      }
    } else {
      setSelectedMaquina(null);
      setFormData(prev => ({ ...prev, maquina_id: 0 }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedRepuesto) {
      newErrors.repuesto = 'Debe seleccionar un repuesto';
    }

    if (!selectedMaquina) {
      newErrors.maquina = 'Debe seleccionar una máquina válida';
    }

    if (formData.cantidad_usada <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (selectedRepuesto && formData.cantidad_usada > selectedRepuesto.cantidad) {
      newErrors.cantidad = `Stock insuficiente. Disponible: ${selectedRepuesto.cantidad}`;
    }

    if (!formData.observaciones.trim()) {
      newErrors.observaciones = 'Debe especificar el motivo del descuento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const historialData: HistorialRepuestoCreate = {
      repuesto_id: formData.repuesto_id,
      maquina_id: formData.maquina_id,
      cantidad_usada: formData.cantidad_usada,
      observaciones: formData.observaciones,
    };

    descuentoMutation.mutate(historialData);
  };

  const proveedorOptions = [
    { value: 'all', label: 'Todos los proveedores' },
    { value: 'none', label: 'Sin proveedor' },
    ...uniqueProveedores.map(p => ({ value: p.id.toString(), label: p.nombre }))
  ];

  const ubicacionOptions = [
    { value: 'all', label: 'Todas las ubicaciones' },
    { value: 'none', label: 'Sin ubicación' },
    ...uniqueUbicaciones.map(u => ({ value: u, label: u }))
  ];

  const stockOptions = [
    { value: 'all', label: 'Todos los stocks' },
    { value: 'available', label: 'Stock disponible (>10)' },
    { value: 'low', label: 'Stock bajo (1-10)' },
    { value: 'empty', label: 'Sin stock (0)' },
  ];

  const historialReciente = historial.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Descuento de Repuestos</h1>
      </div>

      {showSuccess && (
        <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
          <span className="text-green-300">Descuento registrado exitosamente</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de descuento */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Registrar Descuento</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información de máquina */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Información de Máquina</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Alias de Máquina *
                  </label>
                  <Input
                    type="text"
                    placeholder="Buscar máquina por alias..."
                    value={formData.maquina_alias}
                    onChange={(e) => handleMaquinaAliasChange(e.target.value)}
                    error={!!errors.maquina}
                  />
                  {errors.maquina && (
                    <p className="text-red-400 text-sm mt-1">{errors.maquina}</p>
                  )}
                </div>

                {selectedMaquina && (
                  <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">Datos de validación:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Nro. Serie:</span>
                        <div className="text-white font-mono">{selectedMaquina.numero_serie}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Modelo:</span>
                        <div className="text-white">{selectedMaquina.modelo?.modelo || '-'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Fabricante:</span>
                        <div className="text-white">{selectedMaquina.modelo?.fabricante || '-'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Selección de repuesto */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Selección de Repuesto</h3>
                
                {/* Buscador de repuestos (mismo que la página principal) */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <SearchInput
                          placeholder="Buscar por código, nombre, detalle, ubicación o proveedor..."
                          value={filters.search}
                          onChange={(e) => updateFilter('search', e.target.value)}
                          onClear={() => updateFilter('search', '')}
                          showClearButton={filters.search.length > 0}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                        <FilterSelect
                          label="Proveedor"
                          value={filters.proveedor}
                          onChange={(e) => updateFilter('proveedor', e.target.value)}
                          options={proveedorOptions}
                        />
                        
                        <FilterSelect
                          label="Ubicación"
                          value={filters.ubicacion}
                          onChange={(e) => updateFilter('ubicacion', e.target.value)}
                          options={ubicacionOptions}
                        />
                        
                        <FilterSelect
                          label="Estado del Stock"
                          value={filters.stockStatus}
                          onChange={(e) => updateFilter('stockStatus', e.target.value)}
                          options={stockOptions}
                        />
                      </div>

                      {hasActiveFilters && (
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={clearFilters}
                            className="whitespace-nowrap"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Limpiar filtros
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedRepuesto && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-300 mb-2">Repuesto seleccionado:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Código:</span>
                        <div className="text-white font-mono">{selectedRepuesto.codigo}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Nombre:</span>
                        <div className="text-white">{selectedRepuesto.nombre}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Stock:</span>
                        <div className="text-white">{selectedRepuesto.cantidad}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Ubicación:</span>
                        <div className="text-white">
                          {selectedRepuesto.almacenamiento 
                            ? `${selectedRepuesto.almacenamiento.codigo} - ${selectedRepuesto.almacenamiento.nombre}`
                            : selectedRepuesto.ubicacion || '-'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {errors.repuesto && (
                  <p className="text-red-400 text-sm">{errors.repuesto}</p>
                )}
              </div>

              {/* Cantidad y observaciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cantidad a descontar *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.cantidad_usada}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      cantidad_usada: parseInt(e.target.value) || 0 
                    }))}
                    error={!!errors.cantidad}
                  />
                  {errors.cantidad && (
                    <p className="text-red-400 text-sm mt-1">{errors.cantidad}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Motivo del descuento *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ej: Mantenimiento, Reparación, etc."
                    value={formData.observaciones}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      observaciones: e.target.value 
                    }))}
                    error={!!errors.observaciones}
                  />
                  {errors.observaciones && (
                    <p className="text-red-400 text-sm mt-1">{errors.observaciones}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={descuentoMutation.isPending}
                  className="flex-1"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  {descuentoMutation.isPending ? 'Procesando...' : 'Registrar Descuento'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={descuentoMutation.isPending}
                >
                  Limpiar
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Lista de repuestos disponibles */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Repuestos Disponibles</h3>
            
            {repuestosLoading ? (
              <div className="text-gray-400 text-center py-4">Cargando...</div>
            ) : repuestosError ? (
              <div className="text-red-400 text-center py-4">Error al cargar repuestos</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {repuestos.slice(0, 20).map((repuesto) => (
                  <div
                    key={repuesto.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRepuesto?.id === repuesto.id
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      setSelectedRepuesto(repuesto);
                      setFormData(prev => ({ ...prev, repuesto_id: repuesto.id }));
                    }}
                  >
                    <div className="text-sm">
                      <div className="font-mono text-gray-300">{repuesto.codigo}</div>
                      <div className="text-white font-medium">{repuesto.nombre}</div>
                      <div className="text-gray-400">Stock: {repuesto.cantidad}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        {repuesto.almacenamiento 
                          ? `${repuesto.almacenamiento.codigo} - ${repuesto.almacenamiento.nombre}`
                          : repuesto.ubicacion || 'Sin ubicación'
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historial reciente */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Historial Reciente</h2>
          <Link to="/historial">
            <Button variant="outline" size="sm">
              <Clock className="w-4 h-4 mr-2" />
              Ver Historial Completo
            </Button>
          </Link>
        </div>
        
        {historialLoading ? (
          <div className="text-gray-400 text-center py-4">Cargando historial...</div>
        ) : historialError ? (
          <div className="text-center py-8">
            <div className="text-yellow-400 text-sm mb-2">
              ⚠️ No se pudo cargar el historial
            </div>
            <div className="text-gray-500 text-xs">
              El servicio de historial no está disponible
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Repuesto</TableHead>
                  <TableHead>Máquina</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historialReciente.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                      No hay registros de descuentos
                    </TableCell>
                  </TableRow>
                ) : (
                  historialReciente.map((registro) => (
                    <TableRow key={registro.id}>
                      <TableCell className="text-gray-300">
                        {new Date(registro.fecha).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-mono text-sm text-gray-300">
                            {registro.repuesto?.codigo}
                          </div>
                          <div className="text-white">{registro.repuesto?.nombre}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-white">{registro.maquina?.alias || '-'}</div>
                          <div className="font-mono text-sm text-gray-300">
                            {registro.maquina?.numero_serie}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="bg-red-900 text-red-300 px-2 py-1 rounded-full text-xs">
                          -{registro.cantidad_usada}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {registro.observaciones}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DescuentoRepuestos;