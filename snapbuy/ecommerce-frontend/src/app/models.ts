export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  deal: boolean;
  rating: number;
  category: Category;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  id: number;
  product: Product;
}

export interface Order {
  id: number;
  orderDate: string;
  status: string;
  totalPrice: number;
  shippingAddress: string;
  phoneNumber: string;
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber: string;
  orderItems: Array<{ product: Product; quantity: number; price: number }>;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  addresses: string;
  roles: Array<{ name: string }> | string[];
}
