import api from './api';

export interface BackendProduct {
  product_id: number;
  category_id: number;
  category_name: string;
  sku: string;
  product_name: string;
  description: string;
  price: string | number;
  stock_quantity: number;
  is_active: boolean;
  primary_image: string;
  images: Array<{
    image_id: number;
    image_url: string;
    is_primary: boolean;
  }>;
}

export interface BackendCategory {
  category_id: number;
  category_name: string;
  description?: string;
  product_count?: number;
  is_active: boolean;
}

export const productService = {
  // Lấy danh sách sản phẩm với bộ lọc
  getAll: async (params: {
    category_id?: number;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort?: string;
    limit?: number;
  } = {}): Promise<BackendProduct[]> => {
    const res: any = await api.get('/products', { params });
    return res.data || [];
  },

  // Lấy chi tiết một sản phẩm
  getById: async (id: number | string): Promise<BackendProduct> => {
    const res: any = await api.get(`/products/${id}`);
    return res.data;
  },

  // Lấy danh sách danh mục
  getCategories: async (): Promise<BackendCategory[]> => {
    const res: any = await api.get('/categories');
    return res.data || [];
  },
};

export default productService;
