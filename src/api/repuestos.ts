import { apiClient } from './client';
import type { Repuesto, RepuestoCreate, RepuestoUpdate } from '../types';

export interface RepuestosSearchParams {
  search?: string;
  proveedor_id?: number | string;
  ubicacion?: string;
  stock_status?: 'available' | 'low' | 'empty';
  page?: number;
  limit?: number;
}

export interface RepuestosSearchResponse {
  items: Repuesto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const repuestosApi = {
  getAll: async (): Promise<Repuesto[]> => {
    const response = await apiClient.get('/repuestos/');
    return response.data;
  },

  search: async (params: RepuestosSearchParams): Promise<RepuestosSearchResponse> => {
    // Usar el endpoint básico de repuestos ya que el backend no tiene /search
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.page) {
      const skip = ((params.page - 1) * (params.limit || 20));
      searchParams.append('skip', skip.toString());
    }

    const response = await apiClient.get(`/repuestos/?${searchParams.toString()}`);
    const items = response.data;
    
    // Simular paginación y filtros en el frontend hasta que se implemente en el backend
    let filteredItems = items;
    
    // Filtrar por búsqueda
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredItems = filteredItems.filter((item: any) => 
        item.codigo?.toLowerCase().includes(searchLower) ||
        item.nombre?.toLowerCase().includes(searchLower) ||
        item.detalle?.toLowerCase().includes(searchLower) ||
        item.ubicacion?.toLowerCase().includes(searchLower) ||
        item.proveedor?.nombre?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrar por proveedor
    if (params.proveedor_id && params.proveedor_id !== 'all') {
      if (params.proveedor_id === 'none') {
        filteredItems = filteredItems.filter((item: any) => !item.proveedor_id);
      } else {
        filteredItems = filteredItems.filter((item: any) => 
          item.proveedor_id?.toString() === params.proveedor_id?.toString()
        );
      }
    }
    
    // Filtrar por ubicación
    if (params.ubicacion && params.ubicacion !== 'all') {
      if (params.ubicacion === 'none') {
        filteredItems = filteredItems.filter((item: any) => !item.ubicacion);
      } else {
        filteredItems = filteredItems.filter((item: any) => item.ubicacion === params.ubicacion);
      }
    }
    
    // Filtrar por stock
    if (params.stock_status) {
      filteredItems = filteredItems.filter((item: any) => {
        const cantidad = item.cantidad || 0;
        const minima = item.cantidad_minima || 10;
        
        switch (params.stock_status) {
          case 'available':
            return cantidad > minima;
          case 'low':
            return cantidad > 0 && cantidad <= minima;
          case 'empty':
            return cantidad === 0;
          default:
            return true;
        }
      });
    }

    // Simular paginación
    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filteredItems.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedItems = filteredItems.slice(start, start + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      pages
    };
  },

  getById: async (id: number): Promise<Repuesto> => {
    const response = await apiClient.get(`/repuestos/${id}`);
    return response.data;
  },

  create: async (repuesto: RepuestoCreate): Promise<Repuesto> => {
    const response = await apiClient.post('/repuestos/', repuesto);
    return response.data;
  },

  update: async (id: number, repuesto: RepuestoUpdate): Promise<Repuesto> => {
    const response = await apiClient.put(`/repuestos/${id}`, repuesto);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/repuestos/${id}`);
  },
};