import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/signin`, { username, password }).pipe(
      tap((response: any) => {
        localStorage.setItem('snapbuy_token', response.token || response.accessToken);
        localStorage.setItem('snapbuy_user', JSON.stringify(response));
        this.currentUserSubject.next(response);
      })
    );
  }

  signup(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, payload);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  logout(): void {
    localStorage.removeItem('snapbuy_token');
    localStorage.removeItem('snapbuy_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  token(): string | null {
    return localStorage.getItem('snapbuy_token');
  }

  user(): any {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }

  isAdmin(): boolean {
    const roles = this.user()?.roles || [];
    return roles.includes('ROLE_ADMIN');
  }

  isCustomer(): boolean {
    return this.isLoggedIn() && !this.isAdmin();
  }

  private getStoredUser(): any {
    const user = localStorage.getItem('snapbuy_user');
    return user ? JSON.parse(user) : null;
  }
}
