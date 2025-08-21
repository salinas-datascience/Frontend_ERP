import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { repuestosApi } from '../api';
import type { Repuesto } from '../types';

export interface RepuestosFilters {
  search: string;
  proveedor: string;
  ubicacion: string;
  stockStatus: 'all' | 'available' | 'low' | 'empty';
}

const initialFilters: RepuestosFilters = {
  search: '',
  proveedor: '',
  ubicacion: '',
  stockStatus: 'all',
};

export const useRepuestosSearch = () => {
  const [filters, setFilters] = useState<RepuestosFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const { data: allRepuestos, isLoading, error } = useQuery({
    queryKey: ['repuestos'],
    queryFn: repuestosApi.getAll,
  });

  const filteredRepuestos = useMemo(() => {
    if (!allRepuestos) return [];

    return allRepuestos.filter((repuesto: Repuesto) => {
      // Búsqueda de texto
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          repuesto.codigo.toLowerCase().includes(searchTerm) ||
          repuesto.nombre.toLowerCase().includes(searchTerm) ||
          (repuesto.detalle && repuesto.detalle.toLowerCase().includes(searchTerm)) ||
          (repuesto.ubicacion && repuesto.ubicacion.toLowerCase().includes(searchTerm)) ||
          (repuesto.proveedor?.nombre && repuesto.proveedor.nombre.toLowerCase().includes(searchTerm));
        
        if (!matchesSearch) return false;
      }

      // Filtro por proveedor
      if (filters.proveedor && filters.proveedor !== 'all') {
        if (filters.proveedor === 'none') {
          if (repuesto.proveedor_id) return false;
        } else {
          if (!repuesto.proveedor_id || repuesto.proveedor_id.toString() !== filters.proveedor) {
            return false;
          }
        }
      }

      // Filtro por ubicación
      if (filters.ubicacion && filters.ubicacion !== 'all') {
        if (filters.ubicacion === 'none') {
          if (repuesto.ubicacion) return false;
        } else {
          if (!repuesto.ubicacion || !repuesto.ubicacion.toLowerCase().includes(filters.ubicacion.toLowerCase())) {
            return false;
          }
        }
      }

      // Filtro por estado del stock
      if (filters.stockStatus !== 'all') {
        switch (filters.stockStatus) {
          case 'available':
            if (repuesto.cantidad <= 10) return false;
            break;
          case 'low':
            if (repuesto.cantidad <= 0 || repuesto.cantidad > 10) return false;
            break;
          case 'empty':
            if (repuesto.cantidad > 0) return false;
            break;
        }
      }

      return true;
    });
  }, [allRepuestos, filters]);

  // Paginación
  const totalItems = filteredRepuestos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRepuestos = filteredRepuestos.slice(startIndex, endIndex);

  const updateFilter = (key: keyof RepuestosFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all');

  // Obtener opciones únicas para filtros
  const uniqueProveedores = useMemo(() => {
    if (!allRepuestos) return [];
    const proveedores = allRepuestos
      .filter((r: Repuesto) => r.proveedor)
      .map((r: Repuesto) => r.proveedor!)
      .filter((proveedor, index, self) => 
        index === self.findIndex(p => p.id === proveedor.id)
      );
    return proveedores;
  }, [allRepuestos]);

  const uniqueUbicaciones = useMemo(() => {
    if (!allRepuestos) return [];
    const ubicaciones = allRepuestos
      .filter((r: Repuesto) => r.ubicacion)
      .map((r: Repuesto) => r.ubicacion!)
      .filter((ubicacion, index, self) => self.indexOf(ubicacion) === index);
    return ubicaciones;
  }, [allRepuestos]);

  return {
    repuestos: paginatedRepuestos,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    isLoading,
    error,
    // Paginación
    page,
    setPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    // Opciones para filtros
    uniqueProveedores,
    uniqueUbicaciones,
  };
};