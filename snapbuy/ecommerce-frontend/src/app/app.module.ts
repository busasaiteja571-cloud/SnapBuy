import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { AdminGuard, UserGuard } from './auth.guard';
import { AuthInterceptor } from './auth.interceptor';
import {
  AdminComponent,
  CartComponent,
  CheckoutComponent,
  HomeComponent,
  LoginComponent,
  OrdersComponent,
  ProductDetailComponent,
  ProfileComponent,
  RegisterComponent,
  StaticPageComponent,
  WishlistComponent
} from './pages';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cart', component: CartComponent, canActivate: [UserGuard] },
  { path: 'wishlist', component: WishlistComponent, canActivate: [UserGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [UserGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [UserGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [UserGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: 'privacy', component: StaticPageComponent, data: { page: 'privacy' } },
  { path: 'terms', component: StaticPageComponent, data: { page: 'terms' } },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProductDetailComponent,
    LoginComponent,
    RegisterComponent,
    CartComponent,
    WishlistComponent,
    CheckoutComponent,
    OrdersComponent,
    ProfileComponent,
    AdminComponent,
    StaticPageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
