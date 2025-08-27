import { useMemo, useState } from 'react';
import type { Maquina } from '../../../types';
import type { SortField, SortOrder } from '../components/MachineFilters';

interface UseMachineFiltersProps {
  machines: Maquina[];
}

export const useMachineFilters = ({ machines }: UseMachineFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('numero_serie');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [activeFilter, setActiveFilter] = useState('all');
  const [ubicacionFilter, setUbicacionFilter] = useState('all');

  // Obtener ubicaciones únicas
  const availableUbicaciones = useMemo(() => {
    const ubicaciones = new Set<string>();
    machines.forEach(machine => {
      if (machine.ubicacion) {
        ubicaciones.add(machine.ubicacion);
      }
    });
    return Array.from(ubicaciones).sort();
  }, [machines]);

  // Filtrar y ordenar máquinas
  const filteredAndSortedMachines = useMemo(() => {
    let filtered = machines;

    // Filtro por búsqueda de texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(machine => 
        machine.numero_serie.toLowerCase().includes(term) ||
        machine.alias?.toLowerCase().includes(term) ||
        machine.modelo?.modelo?.toLowerCase().includes(term) ||
        machine.modelo?.fabricante?.toLowerCase().includes(term) ||
        machine.ubicacion?.toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    if (activeFilter !== 'all') {
      filtered = filtered.filter(machine => {
        if (activeFilter === 'activa') return machine.activa;
        if (activeFilter === 'inactiva') return !machine.activa;
        return true;
      });
    }

    // Filtro por ubicación
    if (ubicacionFilter !== 'all') {
      filtered = filtered.filter(machine => machine.ubicacion === ubicacionFilter);
    }

    // Ordenamiento
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'numero_serie':
          aValue = a.numero_serie;
          bValue = b.numero_serie;
          break;
        case 'alias':
          aValue = a.alias || '';
          bValue = b.alias || '';
          break;
        case 'modelo':
          aValue = a.modelo ? `${a.modelo.fabricante} ${a.modelo.modelo}` : '';
          bValue = b.modelo ? `${b.modelo.fabricante} ${b.modelo.modelo}` : '';
          break;
        case 'ubicacion':
          aValue = a.ubicacion || '';
          bValue = b.ubicacion || '';
          break;
        case 'estado':
          aValue = a.activa ? 'activa' : 'inactiva';
          bValue = b.activa ? 'activa' : 'inactiva';
          break;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [machines, searchTerm, sortField, sortOrder, activeFilter, ubicacionFilter]);

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveFilter('all');
    setUbicacionFilter('all');
    setSortField('numero_serie');
    setSortOrder('asc');
  };

  return {
    filteredMachines: filteredAndSortedMachines,
    searchTerm,
    setSearchTerm,
    sortField,
    sortOrder,
    handleSortChange,
    activeFilter,
    setActiveFilter,
    ubicacionFilter,
    setUbicacionFilter,
    availableUbicaciones,
    clearFilters,
    totalMachines: machines.length,
    filteredCount: filteredAndSortedMachines.length
  };
};