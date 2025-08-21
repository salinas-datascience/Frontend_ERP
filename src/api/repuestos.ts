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
    const searchParams = new URLSearchParams();
    
    if (params.search) searchParams.append('search', params.search);
    if (params.proveedor_id && params.proveedor_id !== 'all') {
      if (params.proveedor_id === 'none') {
        searchParams.append('no_proveedor', 'true');
      } else {
        searchParams.append('proveedor_id', params.proveedor_id.toString());
      }
    }
    if (params.ubicacion && params.ubicacion !== 'all') {
      if (params.ubicacion === 'none') {
        searchParams.append('no_ubicacion', 'true');
      } else {
        searchParams.append('ubicacion', params.ubicacion);
      }
    }
    if (params.stock_status) searchParams.append('stock_status', params.stock_status);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/repuestos/search?${searchParams.toString()}`);
    return response.data;
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