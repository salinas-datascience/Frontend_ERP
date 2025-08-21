import { apiClient } from './client';
import type { Proveedor, ProveedorCreate, ProveedorUpdate } from '../types';

export const proveedoresApi = {
  getAll: async (): Promise<Proveedor[]> => {
    const response = await apiClient.get('/proveedores/');
    return response.data;
  },

  getById: async (id: number): Promise<Proveedor> => {
    const response = await apiClient.get(`/proveedores/${id}`);
    return response.data;
  },

  create: async (proveedor: ProveedorCreate): Promise<Proveedor> => {
    const response = await apiClient.post('/proveedores/', proveedor);
    return response.data;
  },

  update: async (id: number, proveedor: ProveedorUpdate): Promise<Proveedor> => {
    const response = await apiClient.put(`/proveedores/${id}`, proveedor);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/proveedores/${id}`);
  },
};