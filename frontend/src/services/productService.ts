import type { PagedResponse, Product } from '../utils/types';
import apiClient from './apiClient';

export async function getAll(params?: { page?: number; size?: number }): Promise<PagedResponse<Product>> {
  const response = await apiClient.get<PagedResponse<Product>>('/products', { params });
  return response.data;
}
