import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Search,
  Package,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';
import { useRepuestosSearch } from '../../hooks/useRepuestosSearch';

import { ordenesCompraApi, proveedoresApi, repuestosApi } from '../../api';
import type { 
  OrdenCompraCreate, 
  OrdenCompraUpdate, 
  ItemOrdenCreate,
  OrdenCompra,
  Repuesto,
  Proveedor
} from '../../types';
import { TIPO_LABELS, TIPO_COLORS } from '../../types';

// Tipo extendido para items que pueden ser manuales
interface ItemOrdenExtendido extends ItemOrdenCreate {
  esManual?: boolean;
  nombre_manual?: string;
  codigo_manual?: string;
  // Información del repuesto para edición
  repuesto?: {
    id: number;
    codigo: string;
    nombre: string;
    cantidad: number;
  };
}

// Componente para seleccionar repuestos
interface RepuestoSelectorProps {
  onSelect: (repuesto: Repuesto) => void;
  selectedIds: number[];
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}

const RepuestoSelector: React.FC<RepuestoSelectorProps> = ({ 
  onSelect, 
  selectedIds, 
  placeholder = "Buscar repuesto por nombre o código...",
  autoFocus = false,
  onCancel
}) => {
  const [search, setSearch] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: repuestos = [] } = useQuery({
    queryKey: ['repuestos'],
    queryFn: repuestosApi.getAll,
  });

  const filteredRepuestos = repuestos.filter(r => {
    const searchTerm = String(search || '').toLowerCase();
    return !selectedIds.includes(r.id) &&
      (r.nombre.toLowerCase().includes(searchTerm) ||
       r.codigo.toLowerCase().includes(searchTerm));
  });

  const handleSelect = (repuesto: Repuesto) => {
    onSelect(repuesto);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <SearchInput
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(String(e.target.value || ''))}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Cerrar después de un pequeño delay para permitir clicks
            setTimeout(() => {
              setIsOpen(false);
              if (onCancel && !search) {
                onCancel();
              }
            }, 200);
          }}
          autoFocus={autoFocus}
        />
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            Cancelar
          </Button>
        )}
      </div>
      
      {isOpen && search && (
        <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredRepuestos.slice(0, 5).map((repuesto) => (
            <button
              key={repuesto.id}
              onClick={() => handleSelect(repuesto)}
              className="w-full px-4 py-3 text-left hover:bg-gray-600 flex items-center justify-between"
            >
              <div>
                <div className="text-white font-medium">{repuesto.nombre}</div>
                <div className="text-gray-400 text-sm">Código: {repuesto.codigo}</div>
              </div>
              <div className="text-gray-300 text-sm">
                Stock: {repuesto.cantidad}
              </div>
            </button>
          ))}
          {filteredRepuestos.length === 0 && (
            <div className="px-4 py-3 text-gray-400">No se encontraron repuestos</div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente de buscador completo de repuestos
interface RepuestoBrowserProps {
  onSelect: (repuesto: Repuesto) => void;
  selectedIds: number[];
}

const RepuestoBrowser: React.FC<RepuestoBrowserProps> = ({ onSelect, selectedIds }) => {
  const {
    repuestos,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    isLoading,
    error,
    page,
    setPage,
    totalPages,
    totalItems,
    uniqueProveedores,
    uniqueUbicaciones,
    uniqueTipos,
  } = useRepuestosSearch();

  // Filtrar repuestos que ya están seleccionados
  const availableRepuestos = repuestos.filter(r => !selectedIds.includes(r.id));

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

  const tipoOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'none', label: 'Sin tipo' },
    ...uniqueTipos.map(t => ({ 
      value: t, 
      label: TIPO_LABELS[t as keyof typeof TIPO_LABELS] || t 
    }))
  ];

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-center text-gray-400">Cargando repuestos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-center text-red-400">Error al cargar repuestos</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Buscar Repuestos</h3>
        
        {/* Búsqueda y filtros */}
        <div className="space-y-4">
          <SearchInput
            placeholder="Buscar por código, nombre, detalle, ubicación o proveedor..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            onClear={() => updateFilter('search', '')}
            showClearButton={filters.search.length > 0}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              label="Tipo"
              value={filters.tipo}
              onChange={(e) => updateFilter('tipo', e.target.value)}
              options={tipoOptions}
            />
            
            <FilterSelect
              label="Estado del Stock"
              value={filters.stockStatus}
              onChange={(e) => updateFilter('stockStatus', e.target.value)}
              options={stockOptions}
            />
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={clearFilters} size="sm">
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Resultados - solo mostrar cuando hay filtros activos */}
        {hasActiveFilters && (
          <div className="space-y-4">
            {availableRepuestos.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No se encontraron repuestos con los filtros aplicados
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  {availableRepuestos.map((repuesto) => (
                    <div
                      key={repuesto.id}
                      className="border border-gray-600 rounded-lg p-3 hover:border-gray-500 cursor-pointer transition-colors"
                      onClick={() => onSelect(repuesto)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{repuesto.nombre}</span>
                            {repuesto.tipo && (
                              <Badge className={TIPO_COLORS[repuesto.tipo as keyof typeof TIPO_COLORS] || 'bg-gray-100 text-gray-800'}>
                                {TIPO_LABELS[repuesto.tipo as keyof typeof TIPO_LABELS] || repuesto.tipo}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            Código: {repuesto.codigo}
                            {repuesto.proveedor && ` • Proveedor: ${repuesto.proveedor.nombre}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            repuesto.cantidad_minima 
                              ? repuesto.cantidad > repuesto.cantidad_minima
                                ? 'text-green-400' 
                                : repuesto.cantidad > 0 
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                              : repuesto.cantidad > 10 
                                ? 'text-green-400' 
                                : repuesto.cantidad > 0 
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                          }`}>
                            Stock: {repuesto.cantidad}
                          </div>
                          <Button size="sm" className="mt-1">
                            <Plus className="w-4 h-4 mr-1" />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}

                <div className="text-sm text-gray-400 text-center">
                  Mostrando {availableRepuestos.length} de {totalItems} repuestos disponibles
                </div>
              </>
            )}
          </div>
        )}

        {!hasActiveFilters && (
          <div className="text-center py-6 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2" />
            <p>Usa los filtros arriba para buscar y agregar repuestos</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de filtros para items agregados
interface ItemsFilterProps {
  formData: any;
  setFormData: any;
}

const ItemsFilter: React.FC<ItemsFilterProps> = ({ formData, setFormData }) => {
  const [filters, setFilters] = useState({
    search: '',
    tipo: 'all',
    esManual: 'all'
  });

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      tipo: 'all', 
      esManual: 'all'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all');

  // Aplicar filtros a los items (esto se hará en el componente principal más tarde)
  const filteredItems = formData.items.filter((item: any) => {
    // Filtro por búsqueda de texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const itemName = item.esManual ? item.nombre_manual : item.repuesto?.nombre || '';
      const itemCode = item.esManual ? item.codigo_manual : item.repuesto?.codigo || '';
      
      const matchesSearch = 
        itemName.toLowerCase().includes(searchTerm) ||
        itemCode.toLowerCase().includes(searchTerm);
      
      if (!matchesSearch) return false;
    }

    // Filtro por tipo (solo para items no manuales)
    if (filters.tipo !== 'all' && !item.esManual) {
      if (filters.tipo === 'none') {
        if (item.repuesto?.tipo) return false;
      } else {
        if (item.repuesto?.tipo !== filters.tipo) return false;
      }
    }

    // Filtro por manual/no manual
    if (filters.esManual !== 'all') {
      if (filters.esManual === 'manual' && !item.esManual) return false;
      if (filters.esManual === 'normal' && item.esManual) return false;
    }

    return true;
  });

  // Obtener tipos únicos de los items agregados
  const tiposDisponibles = Array.from(new Set(
    formData.items
      .filter((item: any) => !item.esManual && item.repuesto?.tipo)
      .map((item: any) => item.repuesto.tipo)
  )).sort();

  const tipoOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'none', label: 'Sin tipo' },
    ...tiposDisponibles.map(t => ({ 
      value: t, 
      label: TIPO_LABELS[t as keyof typeof TIPO_LABELS] || t 
    }))
  ];

  // Actualizar los items mostrados en el componente principal
  React.useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      _filteredItems: filteredItems
    }));
  }, [filters, formData.items]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-medium text-white">Items Agregados ({formData.items.length})</h3>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} size="sm">
            Limpiar filtros
          </Button>
        )}
      </div>
      
      <div className="flex items-end gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <SearchInput
            placeholder="Buscar en items agregados..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            onClear={() => updateFilter('search', '')}
            showClearButton={filters.search.length > 0}
          />
        </div>
        
        <div className="min-w-[150px]">
          <FilterSelect
            label="Tipo"
            value={filters.tipo}
            onChange={(e) => updateFilter('tipo', e.target.value)}
            options={tipoOptions}
          />
        </div>
        
        <div className="min-w-[150px]">
          <FilterSelect
            label="Origen"
            value={filters.esManual}
            onChange={(e) => updateFilter('esManual', e.target.value)}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'normal', label: 'Del inventario' },
              { value: 'manual', label: 'Items manuales' }
            ]}
          />
        </div>
        
        {hasActiveFilters && (
          <div className="text-sm text-gray-400 whitespace-nowrap">
            Mostrando {filteredItems.length} de {formData.items.length} items
          </div>
        )}
      </div>
    </div>
  );
};

const OrdenCompraForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  // Estados del formulario
  const [formData, setFormData] = useState<{
    proveedor_id: number;
    observaciones: string;
    items: ItemOrdenExtendido[];
  }>({
    proveedor_id: 0,
    observaciones: '',
    items: [],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Consultas
  const { data: orden, isLoading: isLoadingOrden } = useQuery({
    queryKey: ['orden-compra', id],
    queryFn: () => ordenesCompraApi.getById(Number(id)),
    enabled: isEditing,
  });

  const { data: proveedores = [] } = useQuery({
    queryKey: ['proveedores'],
    queryFn: proveedoresApi.getAll,
  });

  const { data: repuestos = [] } = useQuery({
    queryKey: ['repuestos'],
    queryFn: repuestosApi.getAll,
  });

  // Cargar datos si estamos editando
  useEffect(() => {
    if (orden && isEditing) {
      setFormData({
        proveedor_id: orden.proveedor_id,
        observaciones: orden.observaciones || '',
        items: orden.items.map(item => ({
          repuesto_id: item.repuesto_id,
          cantidad_pedida: item.cantidad_pedida,
          descripcion_aduana: item.descripcion_aduana,
          precio_unitario: item.precio_unitario,
          // Preservar información del repuesto si existe
          repuesto: item.repuesto ? {
            id: item.repuesto.id,
            codigo: item.repuesto.codigo,
            nombre: item.repuesto.nombre,
            cantidad: item.repuesto.cantidad,
          } : undefined,
          // Campos manuales
          esManual: item.es_item_manual || false,
          nombre_manual: item.nombre_manual,
          codigo_manual: item.codigo_manual,
          detalle_manual: item.detalle_manual,
          cantidad_minima_manual: item.cantidad_minima_manual,
        })),
      });
    }
  }, [orden, isEditing]);

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: ordenesCompraApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] });
      navigate('/ordenes-compra');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrdenCompraUpdate }) =>
      ordenesCompraApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] });
      queryClient.invalidateQueries({ queryKey: ['orden-compra', id] });
      navigate('/ordenes-compra');
    },
  });

  // Validaciones
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.proveedor_id || formData.proveedor_id === 0) {
        newErrors.proveedor_id = 'Debe seleccionar un proveedor';
      }
    }

    if (step === 2) {
      if (formData.items.length === 0) {
        newErrors.items = 'Debe agregar al menos un item';
      }
      
      formData.items.forEach((item, index) => {
        if (item.cantidad_pedida <= 0) {
          newErrors[`item_${index}_cantidad`] = 'La cantidad debe ser mayor a 0';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleProveedorChange = (proveedorId: string) => {
    setFormData(prev => ({ ...prev, proveedor_id: Number(proveedorId) }));
  };

  const handleAddItem = (repuesto: Repuesto) => {
    const newItem: ItemOrdenExtendido = {
      repuesto_id: repuesto.id,
      cantidad_pedida: 1,
      descripcion_aduana: repuesto.descripcion_aduana || '', // Auto-completar con descripción del repuesto
      precio_unitario: '',
      esManual: false,
      repuesto: {
        id: repuesto.id,
        codigo: repuesto.codigo,
        nombre: repuesto.nombre,
        cantidad: repuesto.cantidad,
      },
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleChangeRepuesto = (index: number, repuesto: Repuesto) => {
    if (isEditing) {
      // Si estamos editando una orden existente, necesitamos enviar la actualización al backend
      const item = formData.items[index];
      if (!item) return;
      
      // Usamos la API para actualizar el item si es una orden existente
      const currentOrder = orden; // Acceder a la orden actual
      const itemId = currentOrder?.items[index]?.id;
      
      if (itemId) {
        // Actualizar en el backend
        ordenesCompraApi.updateItem(itemId, { repuesto_id: repuesto.id })
          .then(() => {
            // Invalidar la query para refrescar los datos
            queryClient.invalidateQueries({ queryKey: ['orden-compra', id] });
          })
          .catch((error) => {
            console.error('Error al actualizar item:', error);
            // Aquí podrías mostrar un mensaje de error al usuario
          });
      }
    }

    // Actualizar el estado local independientemente
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? {
          ...item,
          repuesto_id: repuesto.id,
          descripcion_aduana: repuesto.descripcion_aduana || item.descripcion_aduana || '', // Mantener descripción existente si el nuevo repuesto no tiene
          repuesto: {
            id: repuesto.id,
            codigo: repuesto.codigo,
            nombre: repuesto.nombre,
            cantidad: repuesto.cantidad,
          },
        } : item
      )
    }));
    setEditingItemIndex(null);
  };

  const handleAddManualItem = () => {
    const nombreInput = document.getElementById('nuevo-item-nombre') as HTMLInputElement;
    const codigoInput = document.getElementById('nuevo-item-codigo') as HTMLInputElement;
    const detalleInput = document.getElementById('nuevo-item-detalle') as HTMLInputElement;
    const cantidadMinimaInput = document.getElementById('nuevo-item-cantidad-minima') as HTMLInputElement;
    
    const nombre = nombreInput?.value.trim();
    const codigo = codigoInput?.value.trim();
    const detalle = detalleInput?.value.trim();
    const cantidadMinima = cantidadMinimaInput?.value ? Number(cantidadMinimaInput.value) : undefined;
    
    // Validaciones
    const newErrors: Record<string, string> = {};
    
    if (!nombre) {
      newErrors.manual_item = 'El nombre es requerido';
    }
    
    if (!codigo) {
      newErrors.manual_item = 'El código es requerido';
    }
    
    // Verificar que no exista el mismo código
    const codigoExistente = formData.items.find(item => 
      item.esManual && item.codigo_manual === codigo
    );
    
    if (codigoExistente) {
      newErrors.manual_item = 'Ya existe un item con ese código en la orden';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }
    
    const newItem: ItemOrdenExtendido = {
      repuesto_id: null, // Será null para items manuales
      cantidad_pedida: 1,
      descripcion_aduana: '',
      precio_unitario: '',
      esManual: true,
      nombre_manual: nombre,
      codigo_manual: codigo,
      detalle_manual: detalle || undefined,
      cantidad_minima_manual: cantidadMinima,
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    // Limpiar campos
    if (nombreInput) nombreInput.value = '';
    if (codigoInput) codigoInput.value = '';
    if (detalleInput) detalleInput.value = '';
    if (cantidadMinimaInput) cantidadMinimaInput.value = '';
    
    // Limpiar errores
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.manual_item;
      return newErrors;
    });
  };

  const handleUpdateItem = (index: number, field: keyof ItemOrdenCreate, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    if (isEditing) {
      try {
        // Actualizar información básica de la orden
        await updateMutation.mutateAsync({
          id: Number(id),
          data: {
            proveedor_id: formData.proveedor_id,
            observaciones: formData.observaciones,
          }
        });
        
        // Actualizar items existentes individualmente
        if (orden?.items) {
          const updatePromises = formData.items.map((item, index) => {
            const originalItem = orden.items[index];
            if (originalItem) {
              // Actualizar item existente
              return ordenesCompraApi.updateItem(originalItem.id, {
                cantidad_pedida: item.cantidad_pedida,
                descripcion_aduana: item.descripcion_aduana,
                precio_unitario: item.precio_unitario,
              });
            }
            return Promise.resolve();
          });
          
          await Promise.all(updatePromises.filter(Boolean));
        }
        
        // Invalidar queries para refrescar datos
        queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] });
        queryClient.invalidateQueries({ queryKey: ['orden-compra', id] });
        navigate('/ordenes-compra');
      } catch (error) {
        console.error('Error al actualizar orden:', error);
      }
    } else {
      // Convertir todos los items para envío (incluidos manuales)
      const itemsParaEnvio = formData.items.map(item => ({
        repuesto_id: item.esManual ? null : item.repuesto_id,
        cantidad_pedida: item.cantidad_pedida,
        descripcion_aduana: item.descripcion_aduana,
        precio_unitario: item.precio_unitario,
        es_item_manual: item.esManual,
        nombre_manual: item.nombre_manual,
        codigo_manual: item.codigo_manual,
        detalle_manual: item.detalle_manual,
        cantidad_minima_manual: item.cantidad_minima_manual,
      }));
      
      const ordenParaEnvio = {
        proveedor_id: formData.proveedor_id,
        observaciones: formData.observaciones,
        items: itemsParaEnvio,
      };
      
      createMutation.mutate(ordenParaEnvio as any);
    }
  };

  if (isEditing && isLoadingOrden) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <span>Cargando orden...</span>
        </div>
      </div>
    );
  }

  const selectedRepuestoIds = formData.items.map(item => item.repuesto_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/ordenes-compra')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-white">
              {isEditing ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
            </h1>
            <p className="text-sm text-gray-400">
              {isEditing ? 'Modifica los datos de la orden' : 'Crea una nueva orden de compra de repuestos'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-600'}`}>
              {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
            </div>
            <span>Datos Generales</span>
          </div>
          
          <div className="flex-1 h-0.5 mx-4 bg-gray-600">
            <div className={`h-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-600'}`} style={{ width: currentStep >= 2 ? '100%' : '0%' }} />
          </div>
          
          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-600'}`}>
              {currentStep > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
            </div>
            <span>Items</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white mb-4">Información General</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Proveedor *
                </label>
                <FilterSelect
                  label="Proveedor"
                  value={formData.proveedor_id === 0 ? '0' : formData.proveedor_id.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, proveedor_id: Number(e.target.value) }))}
                  options={[
                    { value: '0', label: 'Seleccionar proveedor' },
                    ...proveedores.map(p => ({
                      value: p.id.toString(),
                      label: p.nombre
                    }))
                  ]}
                />
                {errors.proveedor_id && (
                  <p className="mt-1 text-sm text-red-400">{errors.proveedor_id}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observaciones adicionales sobre la orden..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button onClick={handleNext} disabled={!formData.proveedor_id || formData.proveedor_id === 0}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Items de la Orden</h2>
              <span className="text-sm text-gray-400">{formData.items.length} item(s)</span>
            </div>

            {/* Buscador completo de repuestos */}
            <RepuestoBrowser onSelect={handleAddItem} selectedIds={selectedRepuestoIds} />

            {/* Selector simple de respaldo */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Buscador simplificado
                </label>
                <RepuestoSelector 
                  onSelect={handleAddItem} 
                  selectedIds={selectedRepuestoIds}
                />
              </div>

              {/* Separador */}
              <div className="flex items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="px-3 text-gray-400 text-sm">O</span>
                <div className="flex-grow border-t border-gray-600"></div>
              </div>

              {/* Agregar repuesto manual */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Agregar Item Manual
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      type="text"
                      placeholder="Nombre del repuesto/item *"
                      id="nuevo-item-nombre"
                    />
                    <Input
                      type="text"
                      placeholder="Código *"
                      id="nuevo-item-codigo"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      type="text"
                      placeholder="Detalle (opcional)"
                      id="nuevo-item-detalle"
                    />
                    <Input
                      type="number"
                      placeholder="Cantidad mínima"
                      min="0"
                      id="nuevo-item-cantidad-minima"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleAddManualItem}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Item Manual
                    </Button>
                  </div>
                </div>
                {errors.manual_item && (
                  <p className="mt-1 text-sm text-red-400">{errors.manual_item}</p>
                )}
              </div>
            </div>

            {/* Filtros para items agregados */}
            {formData.items.length > 0 && <ItemsFilter formData={formData} setFormData={setFormData} />}

            {/* Lista de items */}
            {formData.items.length > 0 ? (
              <div className="border border-gray-600 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Repuesto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unit.</TableHead>
                      <TableHead>Descripción Aduana</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(formData._filteredItems || formData.items).map((item: any, filteredIndex: number) => {
                      // Encontrar el índice real en formData.items
                      const realIndex = formData.items.findIndex((originalItem: any) => 
                        originalItem === item || 
                        (originalItem.repuesto_id === item.repuesto_id && originalItem.esManual === item.esManual)
                      );
                      
                      // Para items manuales, usar información manual
                      // Para items existentes, usar primero información del item preservada, luego buscar en repuestos
                      const repuesto = item.esManual ? null : 
                        item.repuesto || repuestos.find(r => r.id === item.repuesto_id);
                      
                      return (
                        <TableRow key={`${realIndex}-${filteredIndex}`}>
                          <TableCell>
                            {item.esManual ? (
                              <div>
                                <div className="text-gray-300 font-medium">{item.nombre_manual}</div>
                                <div className="text-gray-500 text-sm">Código: {item.codigo_manual}</div>
                                {item.detalle_manual && (
                                  <div className="text-gray-500 text-sm">Detalle: {item.detalle_manual}</div>
                                )}
                                {item.cantidad_minima_manual && (
                                  <div className="text-gray-500 text-sm">Mín: {item.cantidad_minima_manual}</div>
                                )}
                                <div className="text-blue-400 text-sm font-medium">Item manual</div>
                              </div>
                            ) : editingItemIndex === realIndex ? (
                              <RepuestoSelector
                                onSelect={(rep) => handleChangeRepuesto(realIndex, rep)}
                                selectedIds={formData.items
                                  .map((it, idx) => idx !== realIndex ? it.repuesto_id : null)
                                  .filter(Boolean)}
                                placeholder="Buscar nuevo repuesto..."
                                autoFocus={true}
                                onCancel={() => setEditingItemIndex(null)}
                              />
                            ) : repuesto ? (
                              <div 
                                className="cursor-pointer hover:bg-gray-600 p-2 rounded transition-colors"
                                onClick={() => setEditingItemIndex(realIndex)}
                                title="Clic para cambiar repuesto"
                              >
                                <div className="text-gray-300 font-medium">{repuesto.nombre}</div>
                                <div className="text-gray-500 text-sm">Código: {repuesto.codigo}</div>
                                <div className="text-gray-500 text-sm">Stock: {repuesto.cantidad}</div>
                                <div className="text-blue-400 text-xs mt-1">Clic para cambiar</div>
                              </div>
                            ) : (
                              <div 
                                className="text-gray-400 cursor-pointer hover:text-gray-300"
                                onClick={() => setEditingItemIndex(realIndex)}
                                title="Clic para seleccionar repuesto"
                              >
                                {item.repuesto_id ? `Repuesto ID: ${item.repuesto_id} - Clic para cambiar` : 'Clic para seleccionar repuesto'}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.cantidad_pedida}
                              onChange={(e) => handleUpdateItem(realIndex, 'cantidad_pedida', Number(e.target.value))}
                              className="w-20"
                            />
                            {errors[`item_${realIndex}_cantidad`] && (
                              <p className="text-xs text-red-400 mt-1">{errors[`item_${realIndex}_cantidad`]}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              value={item.precio_unitario || ''}
                              onChange={(e) => handleUpdateItem(realIndex, 'precio_unitario', e.target.value)}
                              placeholder="Opcional"
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              value={item.descripcion_aduana || ''}
                              onChange={(e) => handleUpdateItem(realIndex, 'descripcion_aduana', e.target.value)}
                              placeholder="Opcional"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(realIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <p>No hay items en la orden</p>
                <p className="text-sm">Usa el buscador arriba para agregar repuestos</p>
              </div>
            )}

            {errors.items && (
              <p className="text-sm text-red-400">{errors.items}</p>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Anterior
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending || formData.items.length === 0}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Actualizar Orden' : 'Crear Orden'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdenCompraForm;