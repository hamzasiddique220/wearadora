export type ProductType = 'jewelry' | 'slippers';

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
  sku?: string;
  name: string;
  category: ProductCategory | string;
  productType?: ProductType;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
  images?: string[];
  description: string;
  sizes?: number[];
  colors?: string[];
  isNew?: boolean;
  tag?: string;
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: number;
  selectedColor?: string;
  cartLineId: string;
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
  mapLink?: string;
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
