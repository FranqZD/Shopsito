import type { ApiResponse } from '../utils/types';
import apiClient from './apiClient';

export async function checkHealth(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
  const response = await apiClient.get<ApiResponse<{ status: string; timestamp: string }>>('/health');
  return response.data;
}
