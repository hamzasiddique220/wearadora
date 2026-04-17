export type ProductCategory =
  | 'Necklace'
  | 'Ring'
  | 'Earring'
  | 'Bracelet'
  | 'Bangle'
  | 'Anklet'
  | 'Sandal'
  | 'Khussa';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory | string;
  price: number;
  stock: number;
  image: string;
  description: string;
  isNew?: boolean;
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderId: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  dateDisplay: string;
}

export interface ToastMessage {
  message: string;
  type?: 'success' | 'error';
}
