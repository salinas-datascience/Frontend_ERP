import { apiClient } from './client';
import type { HistorialRepuesto, HistorialRepuestoCreate, HistorialRepuestoUpdate } from '../types';

export const historialApi = {
  getAll: async (): Promise<HistorialRepuesto[]> => {
    const response = await apiClient.get('/historial/');
    return response.data;
  },

  getById: async (id: number): Promise<HistorialRepuesto> => {
    const response = await apiClient.get(`/historial/${id}`);
    return response.data;
  },

  create: async (historial: HistorialRepuestoCreate): Promise<HistorialRepuesto> => {
    const response = await apiClient.post('/historial/', historial);
    return response.data;
  },

  update: async (id: number, historial: HistorialRepuestoUpdate): Promise<HistorialRepuesto> => {
    const response = await apiClient.put(`/historial/${id}`, historial);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/historial/${id}`);
  },
};