import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Pagination } from '../../components/ui/Pagination';
import { historialApi, maquinasApi } from '../../api';
import { Calendar, Search, Filter, X, Clock, User, Wrench } from 'lucide-react';
import type { HistorialRepuesto } from '../../types';

interface HistorialFilters {
  search: string;
  maquina: string;
  fechaDesde: string;
  fechaHasta: string;
}

const initialFilters: HistorialFilters = {
  search: '',
  maquina: 'all',
  fechaDesde: '',
  fechaHasta: '',
};

const HistorialPage: React.FC = () => {
  const [filters, setFilters] = useState<HistorialFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const { data: historial = [], isLoading: historialLoading, error: historialError } = useQuery({
    queryKey: ['historial'],
    queryFn: historialApi.getAll,
    retry: 1, // Solo reintenta una vez
    retryDelay: 1000,
  });

  const { data: maquinas = [] } = useQuery({
    queryKey: ['maquinas'],
    queryFn: maquinasApi.getAll,
  });

  const filteredHistorial = useMemo(() => {
    if (!historial) return [];

    return historial.filter((registro: HistorialRepuesto) => {
      // Búsqueda de texto
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          registro.repuesto?.codigo?.toLowerCase().includes(searchTerm) ||
          registro.repuesto?.nombre?.toLowerCase().includes(searchTerm) ||
          registro.maquina?.alias?.toLowerCase().includes(searchTerm) ||
          registro.maquina?.numero_serie?.toLowerCase().includes(searchTerm) ||
          registro.observaciones?.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }

      // Filtro por máquina
      if (filters.maquina && filters.maquina !== 'all') {
        if (!registro.maquina_id || registro.maquina_id.toString() !== filters.maquina) {
          return false;
        }
      }

      // Filtro por fecha desde
      if (filters.fechaDesde) {
        const fechaRegistro = new Date(registro.fecha).toISOString().split('T')[0];
        if (fechaRegistro < filters.fechaDesde) return false;
      }

      // Filtro por fecha hasta
      if (filters.fechaHasta) {
        const fechaRegistro = new Date(registro.fecha).toISOString().split('T')[0];
        if (fechaRegistro > filters.fechaHasta) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); // Más recientes primero
  }, [historial, filters]);

  // Paginación
  const totalItems = filteredHistorial.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHistorial = filteredHistorial.slice(startIndex, endIndex);

  const updateFilter = (key: keyof HistorialFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all');

  const maquinaOptions = [
    { value: 'all', label: 'Todas las máquinas' },
    ...maquinas.map(m => ({ 
      value: m.id.toString(), 
      label: `${m.alias} (${m.numero_serie})` 
    }))
  ];

  if (historialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span>Cargando historial...</span>
        </div>
      </div>
    );
  }

  if (historialError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Historial de Repuestos</h1>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-400 text-lg mb-4">
                ⚠️ El servicio de historial no está disponible
              </div>
              <div className="text-gray-400 text-sm mb-4">
                Es posible que la tabla de historial no exista en la base de datos.
              </div>
              <div className="text-gray-500 text-xs">
                Contacta al administrador del sistema para configurar la base de datos.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-white">Historial de Repuestos</h1>
          <div className="flex items-center px-2 py-1 bg-blue-900 text-blue-300 rounded-full text-xs">
            <Clock className="w-3 h-3 mr-1" />
            <span>Total: {totalItems} registros</span>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar por repuesto, máquina, serie, motivo..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <FilterSelect
                label="Máquina"
                value={filters.maquina}
                onChange={(e) => updateFilter('maquina', e.target.value)}
                options={maquinaOptions}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha Desde
                </label>
                <Input
                  type="date"
                  value={filters.fechaDesde}
                  onChange={(e) => updateFilter('fechaDesde', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha Hasta
                </label>
                <Input
                  type="date"
                  value={filters.fechaHasta}
                  onChange={(e) => updateFilter('fechaHasta', e.target.value)}
                />
              </div>
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
                {totalItems} registro{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtrado)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de historial */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-6">
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
              {paginatedHistorial.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                    {hasActiveFilters 
                      ? 'No se encontraron registros con los filtros aplicados'
                      : 'No hay registros de historial'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                paginatedHistorial.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-white">
                            {new Date(registro.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(registro.fecha).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-mono text-sm text-gray-300">
                          {registro.repuesto?.codigo || '-'}
                        </div>
                        <div className="text-white font-medium">
                          {registro.repuesto?.nombre || 'Repuesto no encontrado'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {registro.repuesto?.almacenamiento 
                            ? `${registro.repuesto.almacenamiento.codigo} - ${registro.repuesto.almacenamiento.nombre}`
                            : registro.repuesto?.ubicacion || 'Sin ubicación'
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Wrench className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-white font-medium">
                            {registro.maquina?.alias || 'Máquina no encontrada'}
                          </div>
                          <div className="font-mono text-sm text-gray-300">
                            {registro.maquina?.numero_serie || '-'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {registro.maquina?.modelo?.fabricante} {registro.maquina?.modelo?.modelo}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                        -{registro.cantidad_usada}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-gray-300 truncate" title={registro.observaciones}>
                        {registro.observaciones || '-'}
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
              startIndex={startIndex + 1}
              endIndex={endIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialPage;