import { apiClient } from './client';
import type {
  OrdenCompra,
  OrdenCompraCreate,
  OrdenCompraUpdate,
  OrdenCompraListItem,
  ItemOrden,
  ItemOrdenCreate,
  ItemOrdenUpdate,
  DocumentoOrden,
  EstadisticasOrdenes,
  ConfirmarLlegadaRequest,
  EstadoOrden
} from '../types';

export interface OrdenesCompraSearchParams {
  skip?: number;
  limit?: number;
  estado?: EstadoOrden;
}

export const ordenesCompraApi = {
  // === ÓRDENES DE COMPRA ===
  
  getAll: async (params?: OrdenesCompraSearchParams): Promise<OrdenCompra[]> => {
    const searchParams = new URLSearchParams();
    if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params?.estado) searchParams.append('estado', params.estado);
    
    const url = `/ordenes-compra/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (id: number): Promise<OrdenCompra> => {
    const response = await apiClient.get(`/ordenes-compra/${id}`);
    return response.data;
  },

  getByNumeroRequisicion: async (numeroRequisicion: string): Promise<OrdenCompra> => {
    const response = await apiClient.get(`/ordenes-compra/numero-requisicion/${numeroRequisicion}`);
    return response.data;
  },

  create: async (orden: OrdenCompraCreate): Promise<OrdenCompra> => {
    const response = await apiClient.post('/ordenes-compra/', orden);
    return response.data;
  },

  update: async (id: number, orden: OrdenCompraUpdate): Promise<OrdenCompra> => {
    const response = await apiClient.put(`/ordenes-compra/${id}`, orden);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/ordenes-compra/${id}`);
  },

  getEstadisticas: async (): Promise<EstadisticasOrdenes> => {
    const response = await apiClient.get('/ordenes-compra/estadisticas');
    return response.data;
  },

  confirmarLlegada: async (id: number, llegada: ConfirmarLlegadaRequest): Promise<OrdenCompra> => {
    const response = await apiClient.post(`/ordenes-compra/${id}/confirmar-llegada`, llegada);
    return response.data;
  },

  // === ITEMS DE ORDEN ===

  getItems: async (ordenId: number): Promise<ItemOrden[]> => {
    const response = await apiClient.get(`/ordenes-compra/${ordenId}/items`);
    return response.data;
  },

  addItem: async (ordenId: number, item: ItemOrdenCreate): Promise<ItemOrden> => {
    const response = await apiClient.post(`/ordenes-compra/${ordenId}/items`, item);
    return response.data;
  },

  updateItem: async (itemId: number, item: ItemOrdenUpdate): Promise<ItemOrden> => {
    const response = await apiClient.put(`/ordenes-compra/items/${itemId}`, item);
    return response.data;
  },

  deleteItem: async (itemId: number): Promise<void> => {
    await apiClient.delete(`/ordenes-compra/items/${itemId}`);
  },

  // === DOCUMENTOS DE ORDEN ===

  uploadDocumento: async (ordenId: number, file: File): Promise<DocumentoOrden> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/ordenes-compra/${ordenId}/documentos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteDocumento: async (documentoId: number): Promise<void> => {
    await apiClient.delete(`/ordenes-compra/documentos/${documentoId}`);
  },
};

export default ordenesCompraApi;