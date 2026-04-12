export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  sellerName: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface PagedResponse<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: string[];
}
