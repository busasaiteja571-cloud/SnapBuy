import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  searchTerm = '';

  constructor(public auth: AuthService, public toast: ToastService, private router: Router) {}

  goToProducts(): void {
    this.router.navigate(['/'], { 
      fragment: 'products',
      // 🔽 ADD THIS LINE BELOW 🔽
      queryParams: { refresh: new Date().getTime() } 
    }).then(() => {
      window.setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    });
  }

  searchProducts(): void {
    this.router.navigate(['/'], {
      fragment: 'products',
      queryParams: this.searchTerm.trim() ? { q: this.searchTerm.trim() } : {}
    }).then(() => {
      window.setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    });
  }

  logout(): void {
    this.auth.logout();
    this.toast.success('Logout successful');
  }
}
