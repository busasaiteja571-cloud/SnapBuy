import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem, Category, Order, Product, User, WishlistItem } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private api = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  products(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/products`);
  }

  product(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.api}/products/${id}`);
  }

  deals(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/products/deals`);
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/products/search?q=${encodeURIComponent(query)}`);
  }

  categories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.api}/categories`);
  }

  cart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.api}/cart`);
  }

  addToCart(productId: number, quantity = 1): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.api}/cart`, { productId, quantity });
  }

  updateCart(id: number, quantity: number): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.api}/cart/${id}?quantity=${quantity}`, {});
  }

  removeCart(id: number): Observable<any> {
    return this.http.delete(`${this.api}/cart/${id}`);
  }

  wishlist(): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(`${this.api}/wishlist`);
  }

  addWishlist(productId: number): Observable<WishlistItem> {
    return this.http.post<WishlistItem>(`${this.api}/wishlist/${productId}`, {});
  }

  removeWishlist(productId: number): Observable<any> {
    return this.http.delete(`${this.api}/wishlist/${productId}`);
  }

  checkout(payload: any): Observable<Order> {
    return this.http.post<Order>(`${this.api}/orders/checkout`, payload);
  }

  orders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.api}/orders/history`);
  }

  profile(): Observable<User> {
    return this.http.get<User>(`${this.api}/user/profile`);
  }

  updateProfile(payload: any): Observable<User> {
    return this.http.put<User>(`${this.api}/user/profile`, payload);
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.api}/user/profile`);
  }

  adminUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/admin/users`);
  }

  adminOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.api}/admin/orders`);
  }

  saveProduct(product: any): Observable<Product> {
    return product.id
      ? this.http.put<Product>(`${this.api}/products/${product.id}`, product)
      : this.http.post<Product>(`${this.api}/products`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.api}/products/${id}`);
  }

  saveCategory(category: any): Observable<Category> {
    return category.id
      ? this.http.put<Category>(`${this.api}/categories/${category.id}`, category)
      : this.http.post<Category>(`${this.api}/categories`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.api}/categories/${id}`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.api}/admin/users/${id}`);
  }

  updateDeliveryStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.api}/admin/orders/${id}/delivery-status`, { status });
  }

  updatePaymentStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.api}/admin/orders/${id}/payment-status`, { status });
  }

  markStock(productId: number, inStock: boolean): Observable<Product> {
    return this.http.put<Product>(`${this.api}/products/${productId}/stock?inStock=${inStock}`, {});
  }
}
