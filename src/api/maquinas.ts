import { apiClient } from './client';
import type { Maquina, MaquinaCreate, MaquinaUpdate, ModeloMaquina, ModeloMaquinaCreate, ModeloMaquinaUpdate } from '../types';

export const maquinasApi = {
  getAll: async (): Promise<Maquina[]> => {
    const response = await apiClient.get('/maquinas/');
    return response.data;
  },

  getById: async (id: number): Promise<Maquina> => {
    const response = await apiClient.get(`/maquinas/${id}`);
    return response.data;
  },

  create: async (maquina: MaquinaCreate): Promise<Maquina> => {
    const response = await apiClient.post('/maquinas/', maquina);
    return response.data;
  },

  update: async (id: number, maquina: MaquinaUpdate): Promise<Maquina> => {
    const response = await apiClient.put(`/maquinas/${id}`, maquina);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/maquinas/${id}`);
  },
};

export const modelosMaquinasApi = {
  getAll: async (): Promise<ModeloMaquina[]> => {
    const response = await apiClient.get('/modelos-maquinas/');
    return response.data;
  },

  getById: async (id: number): Promise<ModeloMaquina> => {
    const response = await apiClient.get(`/modelos-maquinas/${id}`);
    return response.data;
  },

  create: async (modelo: ModeloMaquinaCreate): Promise<ModeloMaquina> => {
    const response = await apiClient.post('/modelos-maquinas/', modelo);
    return response.data;
  },

  update: async (id: number, modelo: ModeloMaquinaUpdate): Promise<ModeloMaquina> => {
    const response = await apiClient.put(`/modelos-maquinas/${id}`, modelo);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/modelos-maquinas/${id}`);
  },
};