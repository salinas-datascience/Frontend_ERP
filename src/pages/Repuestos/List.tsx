import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';
import { useRepuestosSearch } from '../../hooks/useRepuestosSearch';
import { repuestosApi } from '../../api';
import { TIPO_LABELS, TIPO_COLORS } from '../../types';
import { Plus, Edit, Trash2, Eye, Filter, X } from 'lucide-react';

const RepuestosList: React.FC = () => {
  const queryClient = useQueryClient();
  
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
  } = useRepuestosSearch();

  const deleteMutation = useMutation({
    mutationFn: repuestosApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repuestos'] });
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
        <div className="text-gray-400">Cargando repuestos...</div>
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


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Repuestos - TEST EDIT</h1>
        <Link to="/repuestos/nuevo">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Repuesto
          </Button>
        </Link>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-gray-800 rounded-lg p-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
              <div className="bg-red-500 p-2 rounded text-white">
                <label className="block text-sm font-medium mb-2">Tipo (DEBUG)</label>
                <select
                  value={filters.tipo}
                  onChange={(e) => updateFilter('tipo', e.target.value)}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="none">Sin tipo</option>
                  <option value="insumo">Insumo</option>
                  <option value="repuesto">Repuesto</option>
                  <option value="consumible">Consumible</option>
                </select>
              </div>
              
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
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repuestos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    {hasActiveFilters 
                      ? 'No se encontraron repuestos con los filtros aplicados'
                      : 'No hay repuestos registrados'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                repuestos.map((repuesto) => (
                  <TableRow key={repuesto.id}>
                    <TableCell className="font-mono">{repuesto.codigo}</TableCell>
                    <TableCell className="font-medium">{repuesto.nombre}</TableCell>
                    <TableCell>
                      {repuesto.tipo ? (
                        <Badge 
                          className={TIPO_COLORS[repuesto.tipo as keyof typeof TIPO_COLORS] || 'bg-gray-100 text-gray-800'}
                        >
                          {TIPO_LABELS[repuesto.tipo as keyof typeof TIPO_LABELS] || repuesto.tipo}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
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
                    <TableCell>{repuesto.ubicacion || '-'}</TableCell>
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

export default RepuestosList;