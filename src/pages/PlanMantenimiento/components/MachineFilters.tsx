import React from 'react';
import { Input } from '../../../components/ui/Input';
import { FilterSelect } from '../../../components/ui/FilterSelect';
import { Button } from '../../../components/ui/Button';
import { Search, Filter, SortAsc, SortDesc, X } from 'lucide-react';

export type SortField = 'numero_serie' | 'alias' | 'modelo' | 'ubicacion' | 'estado';
export type SortOrder = 'asc' | 'desc';

interface MachineFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  activeFilter?: string;
  onActiveFilterChange?: (filter: string) => void;
  ubicacionFilter?: string;
  onUbicacionFilterChange?: (ubicacion: string) => void;
  availableUbicaciones: string[];
  onClearFilters: () => void;
}

const sortOptions = [
  { value: 'numero_serie', label: 'Número de serie' },
  { value: 'alias', label: 'Alias' },
  { value: 'modelo', label: 'Modelo' },
  { value: 'ubicacion', label: 'Ubicación' },
  { value: 'estado', label: 'Estado' }
];

const estadoOptions = [
  { value: 'all', label: 'Todas las máquinas' },
  { value: 'activa', label: 'Solo activas' },
  { value: 'inactiva', label: 'Solo inactivas' }
];

export const MachineFilters: React.FC<MachineFiltersProps> = ({
  searchTerm,
  onSearchChange,
  sortField,
  sortOrder,
  onSortChange,
  activeFilter = 'all',
  onActiveFilterChange,
  ubicacionFilter = 'all',
  onUbicacionFilterChange,
  availableUbicaciones,
  onClearFilters
}) => {
  const ubicacionOptions = [
    { value: 'all', label: 'Todas las ubicaciones' },
    ...availableUbicaciones.map(ubicacion => ({
      value: ubicacion,
      label: ubicacion || 'Sin ubicación'
    }))
  ];

  const hasActiveFilters = searchTerm || activeFilter !== 'all' || ubicacionFilter !== 'all';

  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar máquinas por número de serie, alias o modelo..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtros y ordenamiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro por estado */}
        {onActiveFilterChange && (
          <FilterSelect
            label="Estado"
            value={activeFilter}
            onChange={(e) => onActiveFilterChange(e.target.value)}
            options={estadoOptions}
          />
        )}

        {/* Filtro por ubicación */}
        {onUbicacionFilterChange && (
          <FilterSelect
            label="Ubicación"
            value={ubicacionFilter}
            onChange={(e) => onUbicacionFilterChange(e.target.value)}
            options={ubicacionOptions}
          />
        )}

        {/* Campo de ordenamiento */}
        <FilterSelect
          label="Ordenar por"
          value={sortField}
          onChange={(e) => onSortChange(e.target.value as SortField, sortOrder)}
          options={sortOptions}
        />

        {/* Dirección de ordenamiento */}
        <div className="flex items-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSortChange(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
            className="w-full"
          >
            {sortOrder === 'asc' ? (
              <>
                <SortAsc className="w-4 h-4 mr-2" />
                Ascendente
              </>
            ) : (
              <>
                <SortDesc className="w-4 h-4 mr-2" />
                Descendente
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Botón para limpiar filtros */}
      {hasActiveFilters && (
        <div className="flex justify-between items-center pt-2 border-t border-gray-700">
          <span className="text-sm text-gray-400">
            Filtros activos aplicados
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
};