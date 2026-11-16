import api from './api';

export interface CreateOrderPayload {
  customer_id?: number | null;
  buyer_name: string;
  buyer_phone: string;
  buyer_email?: string;
  shipping_address: string;
  payment_method?: string;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price?: number;
  }>;
  admin_notes?: string;
}

export interface BackendOrder {
  order_id: number;
  customer_id?: number | null;
  buyer_name: string;
  buyer_phone: string;
  buyer_email?: string;
  shipping_address: string;
  total_amount: string | number;
  status: 'Pending' | 'Confirmed' | 'Shipping' | 'Completed' | 'Cancelled';
  order_date: string;
  payment_method: string;
  items: Array<{
    order_item_id: number;
    product_id: number;
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: string | number;
    subtotal: string | number;
    image: string;
  }>;
}

export const orderService = {
  // Đặt hàng mới
  create: async (payload: CreateOrderPayload): Promise<BackendOrder> => {
    const res: any = await api.post('/orders', payload);
    return res.data;
  },

  // Lấy danh sách đơn hàng của người dùng hiện tại
  getMyOrders: async (): Promise<BackendOrder[]> => {
    const res: any = await api.get('/orders');
    return res.data || [];
  },

  // Lấy chi tiết đơn hàng theo ID
  getById: async (id: number | string): Promise<BackendOrder> => {
    const res: any = await api.get(`/orders/${id}`);
    return res.data;
  },

  // Tra cứu đơn hàng theo Mã đơn và Số điện thoại (Khách vãng lai & Thành viên)
  lookup: async (code: string | number, phone: string): Promise<BackendOrder> => {
    const res: any = await api.get('/orders/lookup', {
      params: { code, phone },
    });
    return res.data;
  },

  // Cập nhật trạng thái đơn hàng (Admin/Staff)
  updateStatus: async (
    id: number | string,
    status: string,
    adminNotes?: string
  ): Promise<BackendOrder> => {
    const res: any = await api.put(`/orders/${id}/status`, {
      status,
      admin_notes: adminNotes,
    });
    return res.data;
  },
};

export default orderService;
