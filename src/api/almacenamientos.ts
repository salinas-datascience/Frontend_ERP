import { apiClient } from './client';
import type { Almacenamiento, AlmacenamientoCreate, AlmacenamientoUpdate } from '../types';

export const almacenamientosApi = {
  getAll: async (): Promise<Almacenamiento[]> => {
    const response = await apiClient.get('/almacenamientos/');
    return response.data;
  },

  search: async (search: string = ''): Promise<Almacenamiento[]> => {
    const response = await apiClient.get(`/almacenamientos/?search=${encodeURIComponent(search)}`);
    return response.data;
  },

  getById: async (id: number): Promise<Almacenamiento> => {
    const response = await apiClient.get(`/almacenamientos/${id}`);
    return response.data;
  },

  create: async (almacenamiento: AlmacenamientoCreate): Promise<Almacenamiento> => {
    const response = await apiClient.post('/almacenamientos/', almacenamiento);
    return response.data;
  },

  update: async (id: number, almacenamiento: AlmacenamientoUpdate): Promise<Almacenamiento> => {
    const response = await apiClient.put(`/almacenamientos/${id}`, almacenamiento);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/almacenamientos/${id}`);
  },
};