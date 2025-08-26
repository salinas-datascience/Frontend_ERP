import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { DebouncedSearchInput } from '../../components/ui/DebouncedSearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Pagination } from '../../components/ui/Pagination';
import { useRepuestosServerSearch } from '../../hooks/useRepuestosServerSearch';
import { useInvalidateRepuestos } from '../../hooks/useInvalidateRepuestos';
import { repuestosApi } from '../../api';
import { TIPO_LABELS, TIPO_COLORS } from '../../types';
import { Plus, Edit, Trash2, Eye, Filter, X, Server, Monitor, Minus } from 'lucide-react';

const RepuestosListOptimized: React.FC = () => {
  const { invalidateRepuestos } = useInvalidateRepuestos();
  
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
    itemsPerPage,
    startIndex,
    endIndex,
    uniqueProveedores,
    uniqueUbicaciones,
    uniqueTipos,
    isUsingServerSearch,
  } = useRepuestosServerSearch();

  const deleteMutation = useMutation({
    mutationFn: repuestosApi.delete,
    onSuccess: () => {
      invalidateRepuestos();
    },
  });

  const handleDelete = (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el repuesto "${nombre}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span>Cargando repuestos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error al cargar los repuestos</div>
      </div>
    );
  }

  const proveedorOptions = [
    { value: 'all', label: 'Todos los proveedores' },
    { value: 'none', label: 'Sin proveedor' },
    ...uniqueProveedores.map(p => ({ value: p.id.toString(), label: p.nombre }))
  ];

  const ubicacionOptions = [
    { value: 'all', label: 'Todas las ubicaciones' },
    { value: 'none', label: 'Sin ubicación' },
    ...uniqueUbicaciones.map((u: string) => ({ value: u, label: u }))
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-white">Repuestos</h1>
          <div className="flex items-center space-x-1 text-xs">
            {isUsingServerSearch ? (
              <div className="flex items-center px-2 py-1 bg-green-900 text-green-300 rounded-full">
                <Server className="w-3 h-3 mr-1" />
                <span>Búsqueda del servidor</span>
              </div>
            ) : (
              <div className="flex items-center px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full">
                <Monitor className="w-3 h-3 mr-1" />
                <span>Búsqueda local</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/repuestos/descuento">
            <Button variant="outline">
              <Minus className="w-4 h-4 mr-2" />
              Descontar Repuestos
            </Button>
          </Link>
          <Link to="/repuestos/nuevo">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Repuesto
            </Button>
          </Link>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <DebouncedSearchInput
                placeholder="Buscar por código, nombre, detalle, ubicación o proveedor..."
                value={filters.search}
                onDebouncedChange={(value) => updateFilter('search', value)}
                onClear={() => updateFilter('search', '')}
                showClearButton={filters.search.length > 0}
                isLoading={isLoading}
                debounceMs={300}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
              <FilterSelect
                label="Tipo"
                value={filters.tipo}
                onChange={(e) => updateFilter('tipo', e.target.value)}
                options={tipoOptions}
              />
              
              <FilterSelect
                label="Proveedor"
                value={filters.proveedor}
                onChange={(e) => updateFilter('proveedor', e.target.value)}
                options={proveedorOptions}
              />
              
              <FilterSelect
                label="Almacenamiento"
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

          {/* Contador de resultados */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>
                {totalItems} repuesto{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtrado)'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {isUsingServerSearch 
                ? 'Resultados optimizados del servidor'
                : 'Búsqueda local - considera implementar búsqueda del servidor para mejor rendimiento'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de repuestos */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Almacenamiento</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repuestos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    {hasActiveFilters 
                      ? 'No se encontraron repuestos con los filtros aplicados'
                      : 'No hay repuestos registrados'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                repuestos.map((repuesto: any) => (
                  <TableRow key={repuesto.id}>
                    <TableCell className="font-mono">{repuesto.codigo}</TableCell>
                    <TableCell className="font-medium">{repuesto.nombre}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        repuesto.cantidad_minima 
                          ? repuesto.cantidad > repuesto.cantidad_minima
                            ? 'bg-green-900 text-green-300' 
                            : repuesto.cantidad > 0 
                              ? 'bg-yellow-900 text-yellow-300'
                              : 'bg-red-900 text-red-300'
                          : repuesto.cantidad > 10 
                            ? 'bg-green-900 text-green-300' 
                            : repuesto.cantidad > 0 
                              ? 'bg-yellow-900 text-yellow-300'
                              : 'bg-red-900 text-red-300'
                      }`}>
                        {repuesto.cantidad}
                      </span>
                    </TableCell>
                    <TableCell>
                      {repuesto.almacenamiento 
                        ? `${repuesto.almacenamiento.codigo} - ${repuesto.almacenamiento.nombre}`
                        : repuesto.ubicacion || '-'
                      }
                    </TableCell>
                    <TableCell>{repuesto.proveedor?.nombre || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/repuestos/${repuesto.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/repuestos/${repuesto.id}/editar`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(repuesto.id, repuesto.nombre)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="border-t border-gray-700 px-6 py-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RepuestosListOptimized;