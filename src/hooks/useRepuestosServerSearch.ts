import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { repuestosApi, proveedoresApi } from '../api';
import type { RepuestosSearchParams } from '../api/repuestos';
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

export const useRepuestosServerSearch = () => {
  const [filters, setFilters] = useState<RepuestosFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const itemsPerPage = 20;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Build search parameters
  const searchParams: RepuestosSearchParams = {
    search: debouncedSearch || undefined,
    proveedor_id: filters.proveedor && filters.proveedor !== 'all' ? filters.proveedor : undefined,
    ubicacion: filters.ubicacion && filters.ubicacion !== 'all' ? filters.ubicacion : undefined,
    stock_status: filters.stockStatus !== 'all' ? filters.stockStatus : undefined,
    page,
    limit: itemsPerPage,
  };

  // Server-side search query (disabled when using ubicacion filter)
  const { data: searchResponse, isLoading: isSearchLoading, error: searchError } = useQuery({
    queryKey: ['repuestos-search', searchParams],
    queryFn: () => repuestosApi.search(searchParams),
    enabled: !filters.ubicacion || filters.ubicacion === 'all', // Disable server search when ubicacion filter is active
  });

  // Always fetch all repuestos to generate filter options (regardless of server search status)
  const { data: allRepuestos, isLoading: isAllLoading, error: allError } = useQuery({
    queryKey: ['repuestos'],
    queryFn: repuestosApi.getAll,
    enabled: true, // Always fetch for filter options
  });

  // Get providers for filter options
  const { data: proveedores } = useQuery({
    queryKey: ['proveedores'],
    queryFn: proveedoresApi.getAll,
  });

  const updateFilter = (key: keyof RepuestosFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key !== 'search') {
      setPage(1); // Reset to first page when filters change
    }
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all');

  // Determine if we're using server-side search or fallback (force client-side when ubicacion filter is active)
  const isUsingServerSearch = !!searchResponse && !searchError && (!filters.ubicacion || filters.ubicacion === 'all');
  const isLoading = isUsingServerSearch ? isSearchLoading : isAllLoading;
  const error = isUsingServerSearch ? searchError : allError;

  let repuestos: Repuesto[] = [];
  let totalItems: number;
  let totalPages: number;
  let startIndex: number;
  let endIndex: number;

  if (isUsingServerSearch && searchResponse) {
    // Server-side search results (ubicacion filter disabled here)
    repuestos = searchResponse.items;
    totalItems = searchResponse.total;
    totalPages = searchResponse.pages;
    startIndex = (searchResponse.page - 1) * searchResponse.limit;
    endIndex = Math.min(startIndex + searchResponse.limit, totalItems);
  } else if (allRepuestos) {
    // Client-side fallback
    const filtered = allRepuestos.filter((repuesto: Repuesto) => {
      // Apply filters client-side as fallback
      if (debouncedSearch) {
        const searchTerm = debouncedSearch.toLowerCase();
        const matchesSearch = 
          repuesto.codigo.toLowerCase().includes(searchTerm) ||
          repuesto.nombre.toLowerCase().includes(searchTerm) ||
          (repuesto.detalle && repuesto.detalle.toLowerCase().includes(searchTerm)) ||
          (repuesto.ubicacion && repuesto.ubicacion.toLowerCase().includes(searchTerm)) ||
          (repuesto.almacenamiento?.nombre && repuesto.almacenamiento.nombre.toLowerCase().includes(searchTerm)) ||
          (repuesto.almacenamiento?.codigo && repuesto.almacenamiento.codigo.toLowerCase().includes(searchTerm)) ||
          (repuesto.proveedor?.nombre && repuesto.proveedor.nombre.toLowerCase().includes(searchTerm));
        
        if (!matchesSearch) return false;
      }

      if (filters.proveedor && filters.proveedor !== 'all') {
        if (filters.proveedor === 'none') {
          if (repuesto.proveedor_id) return false;
        } else {
          if (!repuesto.proveedor_id || repuesto.proveedor_id.toString() !== filters.proveedor) {
            return false;
          }
        }
      }

      if (filters.ubicacion && filters.ubicacion !== 'all') {
        if (filters.ubicacion === 'none') {
          if (repuesto.ubicacion || repuesto.almacenamiento) return false;
        } else {
          // Verificar ubicación legacy
          const ubicacionMatch = repuesto.ubicacion === filters.ubicacion;
          
          // Verificar almacenamiento (formato "codigo - nombre")
          const almacenamientoString = repuesto.almacenamiento 
            ? `${repuesto.almacenamiento.codigo} - ${repuesto.almacenamiento.nombre}`
            : null;
          const almacenamientoMatch = almacenamientoString === filters.ubicacion;
          
          
          if (!ubicacionMatch && !almacenamientoMatch) {
            return false;
          }
        }
      }

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

    totalItems = filtered.length;
    totalPages = Math.ceil(totalItems / itemsPerPage);
    startIndex = (page - 1) * itemsPerPage;
    endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    repuestos = filtered.slice(startIndex, endIndex);
  } else {
    repuestos = [];
    totalItems = 0;
    totalPages = 0;
    startIndex = 0;
    endIndex = 0;
  }

  // Get unique options for filters (always from allRepuestos to ensure we have all options)
  const uniqueProveedores = proveedores?.filter(p => p.id && p.nombre) || [];
  const uniqueUbicaciones = allRepuestos && allRepuestos.length > 0
    ? (() => {
        const ubicaciones = new Set<string>();
        allRepuestos.forEach((r: Repuesto) => {
          // Agregar ubicaciones legacy
          if (r.ubicacion) {
            ubicaciones.add(r.ubicacion);
          }
          // Agregar almacenamientos
          if (r.almacenamiento && r.almacenamiento.codigo && r.almacenamiento.nombre) {
            ubicaciones.add(`${r.almacenamiento.codigo} - ${r.almacenamiento.nombre}`);
          }
        });
        
        return Array.from(ubicaciones).sort();
      })()
    : [];

  return {
    repuestos,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    isLoading,
    error,
    // Pagination
    page,
    setPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    // Filter options
    uniqueProveedores,
    uniqueUbicaciones,
    // Meta info
    isUsingServerSearch,
  };
};