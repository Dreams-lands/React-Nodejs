import api from './api';

export interface CartResponse {
  cart_id: number;
  items: Array<{
    cart_item_id: number;
    cart_id: number;
    product_id: number;
    quantity: number;
    product_name: string;
    sku: string;
    price: string | number;
    stock_quantity: number;
    image: string;
  }>;
  total_items: number;
  total_amount: number;
}

export const cartService = {
  // Lấy giỏ hàng từ server
  getCart: async (): Promise<CartResponse> => {
    const res: any = await api.get('/cart');
    return res.data;
  },

  // Thêm vào giỏ
  addItem: async (productId: number, quantity = 1): Promise<CartResponse> => {
    const res: any = await api.post('/cart/items', {
      product_id: productId,
      quantity,
    });
    return res.data;
  },

  // Sửa số lượng
  updateQuantity: async (cartItemId: number, quantity: number): Promise<CartResponse> => {
    const res: any = await api.put(`/cart/items/${cartItemId}`, { quantity });
    return res.data;
  },

  // Xóa món hàng
  removeItem: async (cartItemId: number): Promise<CartResponse> => {
    const res: any = await api.delete(`/cart/items/${cartItemId}`);
    return res.data;
  },

  // Làm trống giỏ hàng
  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },
};

export default cartService;
