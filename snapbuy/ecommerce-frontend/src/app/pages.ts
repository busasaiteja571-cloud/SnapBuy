import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { CartItem, Category, Order, Product, User, WishlistItem } from './models';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-home',
  template: `
    <section class="hero">
      <div>
        <p class="eyebrow">SnapBuy deals</p>
        <h1>Everything you need, at great prices.</h1>
        <p>Discover everyday essentials and more, all in one place with great value on every order.</p>
        <button class="primary" (click)="loadDeals()">View deals</button>
      </div>
      <img src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80" alt="Shopping display">
    </section>

    <section id="products" class="toolbar">
      <select [(ngModel)]="categoryId" (change)="applyFilters()">
        <option value="">All categories</option>
        <option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</option>
      </select>
      <select [(ngModel)]="sort" (change)="applyFilters()">
        <option value="name">Sort by name</option>
        <option value="low">Price low to high</option>
        <option value="high">Price high to low</option>
      </select>
    </section>

    <section class="grid">
      <article class="product-card" *ngFor="let product of filtered">
        <a [routerLink]="['/products', product.id]"><img [src]="product.imageUrl" [alt]="product.name"></a>
        <div class="product-body">
          <span class="tag">{{ product.category.name }}</span>
          <h3>{{ product.name }}</h3>
          <p>{{ product.description }}</p>
          <div class="row-line">
            <strong>{{ product.price | currency:'INR' }}</strong>
            <span [class.danger]="product.stockQuantity === 0">{{ product.stockQuantity > 0 ? product.stockQuantity + ' in stock' : 'Out of stock' }}</span>
          </div>
          <div class="actions" *ngIf="auth.isCustomer()">
            <button (click)="addToCart(product)" [disabled]="product.stockQuantity === 0"><i class="bi bi-cart2"></i></button>
            <button class="ghost" (click)="wishlist(product)"><i class="bi bi-heart"></i></button>
          </div>
            <a class="primary link-button" [routerLink]="['/admin']" [queryParams]="{ editId: product.id }" *ngIf="auth.isAdmin()">Manage in admin</a>        </div>
      </article>
    </section>
  `,
  // 🔽 ADD THIS STYLES ARRAY JUST BELOW YOUR TEMPLATE 🔽
  styles: [`
    /* 1. Ensure all cards in a row match the height of the tallest card */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      align-items: stretch; 
    }

    /* 2. Turn the card into a flex column container */
    .product-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    /* 3. Force the body section to fill up all available vertical space */
    .product-body {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      padding: 16px;
    }

    /* 4. Target the description: Set a uniform height and clamp long text */
    .product-body p {
      margin: 8px 0 16px 0;
      flex-grow: 1; 

      /* CSS Line Clamping: Limits text to exactly 2 lines and adds "..." */
      display: -webkit-box;
      -webkit-line-clamp: 2; 
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      
      /* Fallback minimum height so short descriptions take up equal space */
      min-height: 2.8rem; 
    }

    /* 5. Keep the price and stock row pinned uniformly above actions */
    .product-body .row-line {
      margin-top: auto;
      margin-bottom: 12px;
    }

    /* 6. Action buttons are now permanently anchored at the absolute bottom */
    .product-body .actions,
    .product-body .link-button {
      margin-top: auto; 
    }
  `]
})
export class HomeComponent implements OnInit {
  // Keeps the active list for the UI grid to loop over
  products: Product[] = [];
  filtered: Product[] = [];
  categories: Category[] = [];
  
  // 1. Master storage array to remember ALL products permanently
  private masterProductCatalog: Product[] = [];

  private _categoryId = '';
  private _sort = 'name';
  query = '';

  // 2. Use a getter and setter for categoryId so it resets deals automatically when clicked
  get categoryId(): string {
    return this._categoryId;
  }
  set categoryId(value: string) {
    this._categoryId = value;
    // If a user chooses a category, automatically restore full catalog if we were viewing limited deals
    if (this.products.length !== this.masterProductCatalog.length && this.masterProductCatalog.length > 0) {
      this.products = [...this.masterProductCatalog];
    }
    this.applyFilters();
  }

  // 3. Use a getter and setter for sort filter to do the same
  get sort(): string {
    return this._sort;
  }
  set sort(value: string) {
    this._sort = value;
    if (this.products.length !== this.masterProductCatalog.length && this.masterProductCatalog.length > 0) {
      this.products = [...this.masterProductCatalog];
    }
    this.applyFilters();
  }

  constructor(private api: ApiService, public auth: AuthService, private router: Router, private route: ActivatedRoute, private toast: ToastService) {}

  ngOnInit(): void {
    this.api.categories().subscribe((categories) => this.categories = categories);
    
    // This stream fires EVERY TIME goToProducts() is clicked because 'refresh' is always a new number!
    this.route.queryParamMap.subscribe((params) => {
      this.query = params.get('q') || '';
      
      // Fetch the full product listing from your backend server safely
      this.api.products().subscribe((products) => {
        this.products = products;
        
        // Clear category dropdown values if it's a pure navbar reset click
        if (!this.query) {
          this.categoryId = '';
          this.sort = 'name';
        }
        
        this.applyFilters();
      });
    });

    this.route.fragment.subscribe((fragment) => {
      if (fragment === 'products') {
        window.setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }
    });
  }

  // 5. Explicit Helper to restore the full catalog from our backup layout state
  private resetToFullCatalog(): void {
    if (this.masterProductCatalog.length > 0) {
      this.products = [...this.masterProductCatalog];
      this._categoryId = '';
      this._sort = 'name';
      this.query = '';
      this.applyFilters();
    }
  }

  readRouteSearch(): void {
    this.query = this.route.snapshot.queryParamMap.get('q') || '';
    // If a user types a new search query, ensure they are searching the whole catalog, not just deals
    if (this.query && this.products.length !== this.masterProductCatalog.length) {
      this.products = [...this.masterProductCatalog];
    }
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.query.toLowerCase().trim();
    this.filtered = this.products
      .filter((product) => !term || product.name.toLowerCase().includes(term) || product.description.toLowerCase().includes(term))
      .filter((product) => !this.categoryId || product.category.id === Number(this.categoryId))
      .sort((a, b) => this.sort === 'low' ? a.price - b.price : this.sort === 'high' ? b.price - a.price : a.name.localeCompare(b.name));
  }

  loadDeals(): void {
    this.api.deals().subscribe((products) => {
      this.products = products;
      // Temporarily clear inputs so deal results are shown transparently
      this._categoryId = ''; 
      this.query = '';
      this.applyFilters();
      window.setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    });
  }

  addToCart(product: Product): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.api.addToCart(product.id).subscribe({
      next: () => this.toast.success('Product added to cart'),
      error: (err) => this.toast.error(err.error?.message || 'Could not add item')
    });
  }

  wishlist(product: Product): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.api.addWishlist(product.id).subscribe(() => this.toast.success('Added to wishlist'));
  }
}

@Component({
  selector: 'app-product-detail',
  template: `
    <section class="detail" *ngIf="product">
      <img [src]="product.imageUrl" [alt]="product.name">
      <div>
        <span class="tag">{{ product.category.name }}</span>
        <h1>{{ product.name }}</h1>
        <p>{{ product.description }}</p>
        <h2>{{ product.price | currency:'INR' }}</h2>
        <p>{{ product.stockQuantity > 0 ? product.stockQuantity + ' available' : 'Out of stock' }} | Rating {{ product.rating }}</p>
        <div class="actions detail-actions" *ngIf="auth.isCustomer()">
          <button class="primary" (click)="add()" [disabled]="product.stockQuantity === 0">Add to cart</button>
          <button class="ghost" (click)="wish()">Add to wishlist</button>
        </div>
        <a class="primary link-button" routerLink="/admin" *ngIf="auth.isAdmin()">Manage in admin</a>
      </div>
    </section>
  `
})
export class ProductDetailComponent implements OnInit {
  product?: Product;
  constructor(private route: ActivatedRoute, private api: ApiService, public auth: AuthService, private router: Router, private toast: ToastService) {}
  ngOnInit(): void {
    this.api.product(Number(this.route.snapshot.paramMap.get('id'))).subscribe((product) => this.product = product);
  }
  add(): void {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    if (this.product) this.api.addToCart(this.product.id).subscribe(() => {
      this.toast.success('Product added to cart');
      this.router.navigate(['/cart']);
    });
  }
  wish(): void {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    if (this.product) this.api.addWishlist(this.product.id).subscribe(() => {
      this.toast.success('Added to wishlist');
      this.router.navigate(['/wishlist']);
    });
  }
}

@Component({
  selector: 'app-login',
  template: `
    <form class="form-card" (ngSubmit)="login()">
      <h1>Login</h1>
      <p class="message" *ngIf="message">{{ message }}</p>
      <input [(ngModel)]="username" name="username" placeholder="Username" required>
      <input [(ngModel)]="password" name="password" type="password" placeholder="Password" required>
      <button class="primary">Login</button>
      <button type="button" class="ghost" (click)="forgot()">Forgot password</button>
      <a routerLink="/register">Create account</a>
    </form>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  message = '';
  constructor(private auth: AuthService, private router: Router, private toast: ToastService) {}
  login(): void {
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.toast.success('Login successful');
        this.router.navigate([this.auth.isAdmin() ? '/admin' : '/']);
      },
      error: () => this.message = 'Invalid username or password'
    });
  }
  forgot(): void {
    const email = prompt('Enter your account email');
    if (email) this.auth.forgotPassword(email).subscribe(() => this.message = 'Reset token sent if email is configured.');
  }
}

@Component({
  selector: 'app-register',
  template: `
    <form class="form-card" (ngSubmit)="register()">
      <h1>Create account</h1>
      <p class="message" *ngIf="message">{{ message }}</p>
      <input [(ngModel)]="form.firstName" name="firstName" placeholder="First name">
      <input [(ngModel)]="form.lastName" name="lastName" placeholder="Last name">
      <input [(ngModel)]="form.username" name="username" placeholder="Username" required>
      <input [(ngModel)]="form.email" name="email" type="email" placeholder="Email" required>
      <input [(ngModel)]="form.password" name="password" type="password" placeholder="Password" required>
      <button class="primary">Sign up</button>
    </form>
  `
})
export class RegisterComponent {
  form: any = {};
  message = '';
  constructor(private auth: AuthService, private router: Router) {}
  register(): void {
    this.auth.signup(this.form).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => this.message = err.error?.message || 'Signup failed'
    });
  }
}

@Component({
  selector: 'app-cart',
  template: `
    <section class="panel">
      <h1>Cart</h1>
      <p *ngIf="!items.length">Your cart is empty.</p>
      <div class="list-row" *ngFor="let item of items">
        <img [src]="item.product.imageUrl" [alt]="item.product.name">
        <div><strong>{{ item.product.name }}</strong><p>{{ item.product.price | currency:'INR' }}</p></div>
        <button (click)="setQty(item, item.quantity - 1)">-</button>
        <span>{{ item.quantity }}</span>
        <button (click)="setQty(item, item.quantity + 1)">+</button>
        <button class="ghost" (click)="remove(item)">Remove</button>
      </div>
      <h2>Total: {{ total() | currency:'INR' }}</h2>
      <a class="primary link-button" routerLink="/checkout" *ngIf="items.length">Checkout</a>
    </section>
  `
  ,
  // 🔽 ADD THIS STYLES ARRAY HERE 🔽
  styles: [`
    .panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .list-row {
      display: flex;
      align-items: center;       
      justify-content: space-between; 
      gap: 20px;                 
      padding: 16px 0;
      border-bottom: 1px solid #e3e8ef;
    }
    .list-row img {
      width: 70px;
      height: 70px;
      object-fit: cover;
      border-radius: 8px;
      flex-shrink: 0;           
    }
    .list-row div:first-of-type {
      flex: 2;                  
      min-width: 180px;         
    }
    .list-row div:first-of-type strong {
      display: block;
      font-size: 1.05rem;
      color: #172033;
      margin-bottom: 4px;
    }
    .list-row div:first-of-type p {
      margin: 0;
      color: #64748b;
    }
    .list-row button:not(.ghost) {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      border: 1px solid #172033;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      flex-shrink: 0;
      padding: 0;
    }
    .list-row span {
      display: inline-block;
      width: 40px;              
      text-align: center;
      font-weight: 600;
      font-size: 1.05rem;
    }
    /* Inside CartComponent styles block in pages.ts */
/* Replace your old .list-row button.ghost block with this: */

.panel .list-row button.ghost,
.list-row button.ghost {
  background-color: #fef2f2 !important; /* Forces the light-red background */
  border: 1px solid #fca5a5 !important;   /* Forces the soft red border line */
  color: #b91c1c !important;            /* Forces the deep red text color */
  border-radius: 6px;
  padding: 6px 14px;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;        
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.panel .list-row button.ghost:hover,
.list-row button.ghost:hover {
  background-color: #fee2e2 !important; /* Darker red shade on hover */
  border-color: #f87171 !important;
}
`]
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  constructor(private api: ApiService, private toast: ToastService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.api.cart().subscribe((items) => this.items = items); }
  total(): number { return this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0); }
  setQty(item: CartItem, quantity: number): void {
    if (quantity < 1) { this.remove(item); return; }
    this.api.updateCart(item.id, quantity).subscribe(() => this.load());
  }
  remove(item: CartItem): void {
    this.api.removeCart(item.id).subscribe(() => {
      this.toast.success('Removed from cart');
      this.load();
    });
  }
}

@Component({
  selector: 'app-wishlist',
  template: `
    <section class="panel">
      <h1>Wishlist</h1>
      <p *ngIf="!items.length">No wishlist items yet.</p>
      <div class="list-row" *ngFor="let item of items">
        <img [src]="item.product.imageUrl" [alt]="item.product.name">
        <div><strong>{{ item.product.name }}</strong><p>{{ item.product.price | currency:'INR' }}</p></div>
        <button (click)="addToCart(item)">Add to cart</button>
        <button class="ghost" (click)="remove(item)">Remove</button>
      </div>
    </section>
  `
  ,
  // 🔽 ADD THIS STYLES ARRAY HERE 🔽
  styles: [`
    .panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .list-row {
      display: flex;
      align-items: center;       /* Vertically aligns everything on the same baseline */
      justify-content: space-between; 
      gap: 20px;                 
      padding: 16px 0;
      border-bottom: 1px solid #e3e8ef;
    }
    .list-row img {
      width: 70px;
      height: 70px;
      object-fit: cover;
      border-radius: 8px;
      flex-shrink: 0;           
    }
    /* Fixes the text section width so short vs long item names don't misalign buttons */
    .list-row div:first-of-type {
      flex: 2;                  
      min-width: 220px;         /* Ensures plenty of uniform space for the title */
    }
    .list-row div:first-of-type strong {
      display: block;
      font-size: 1.05rem;
      color: #172033;
      margin-bottom: 4px;
    }
    .list-row div:first-of-type p {
      margin: 0;
      color: #64748b;
    }
    /* Style and align the 'Add to cart' button uniformly */
    .list-row button:not(.ghost) {
      min-width: 110px;         /* Forces all 'Add to cart' boxes to be identical in width */
      height: 38px;
      background: #ffffff;
      border: 1px solid #172033;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      flex-shrink: 0;
    }
    /* Anchors the 'Remove' button flush to the right edge */
    /* Inside WishlistComponent styles block in pages.ts */
    /* Replace your old .list-row button.ghost block with this: */

    .panel .list-row button.ghost,
    .list-row button.ghost {
    background-color: #fef2f2 !important; 
    border: 1px solid #fca5a5 !important;   
    color: #b91c1c !important;            
    border-radius: 6px;
    padding: 6px 14px;
    font-weight: 600;
    cursor: pointer;
    margin-left: auto;        
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

    .panel .list-row button.ghost:hover,
    .list-row button.ghost:hover {
    background-color: #fee2e2 !important; 
    border-color: #f87171 !important;
  }
`]
})
export class WishlistComponent implements OnInit {
  items: WishlistItem[] = [];
  constructor(public api: ApiService, private toast: ToastService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.api.wishlist().subscribe((items) => this.items = items); }
  addToCart(item: WishlistItem): void {
    this.api.addToCart(item.product.id).subscribe(() => this.toast.success('Product added to cart'));
  }
  remove(item: WishlistItem): void {
    this.api.removeWishlist(item.product.id).subscribe(() => {
      this.toast.success('Removed from wishlist');
      this.load();
    });
  }
}

@Component({
  selector: 'app-checkout',
  template: `
    <form class="form-card" (ngSubmit)="placeOrder()">
      <h1>Checkout</h1>
      <p class="message" *ngIf="message">{{ message }}</p>
      <textarea [(ngModel)]="form.shippingAddress" name="shippingAddress" placeholder="Delivery address" required></textarea>
      <input [(ngModel)]="form.phoneNumber" name="phoneNumber" placeholder="Phone number" required>
      <select [(ngModel)]="form.paymentMethod" name="paymentMethod">
        <option value="COD">Cash on delivery</option>
        <option value="CARD">Card payment simulation</option>
      </select>
      <input *ngIf="form.paymentMethod === 'CARD'" [(ngModel)]="form.cardNumber" name="cardNumber" placeholder="Card number">
      <button class="primary">Place order</button>
    </form>
  `
})
export class CheckoutComponent {
  form: any = { paymentMethod: 'COD' };
  message = '';
  constructor(private api: ApiService, private router: Router, private toast: ToastService) {}
  placeOrder(): void {
    this.api.checkout(this.form).subscribe({
      next: () => {
        this.toast.success('Order placed successfully');
        this.router.navigate(['/orders']);
      },
      error: (err) => this.message = err.error?.message || 'Checkout failed'
    });
  }
}

@Component({
  selector: 'app-orders',
  template: `
    <section class="panel">
      <h1>Order history</h1>
      <article class="order-card" *ngFor="let order of orders">
        <div class="row-line"><strong>Order #{{ order.id }}</strong><span>{{ order.status }} | {{ order.paymentStatus }}</span></div>
        <p>Tracking: {{ order.trackingNumber }}</p>
        <p>{{ order.shippingAddress }}</p>
        <p>Total: {{ order.totalPrice | currency:'INR' }}</p>
      </article>
    </section>
  `
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  constructor(private api: ApiService) {}
  ngOnInit(): void { this.api.orders().subscribe((orders) => this.orders = orders); }
}

@Component({
  selector: 'app-profile',
  template: `
    <form class="form-card" (ngSubmit)="save()" *ngIf="form">
      <h1>Profile</h1>
      <p class="message" *ngIf="message">{{ message }}</p>
      <input [(ngModel)]="form.firstName" name="firstName" placeholder="First name">
      <input [(ngModel)]="form.lastName" name="lastName" placeholder="Last name">
      <input [(ngModel)]="form.email" name="email" type="email" placeholder="Email">
      <input [(ngModel)]="form.phone" name="phone" placeholder="Phone">
      <textarea [(ngModel)]="form.addresses" name="addresses" placeholder="Addresses"></textarea>
      <input [(ngModel)]="form.password" name="password" type="password" placeholder="New password">
      <button class="primary">Save profile</button>
      <button type="button" class="danger-btn" (click)="deleteAccount()">Delete account</button>
    </form>
  `
})
export class ProfileComponent implements OnInit {
  form: any;
  message = '';
  constructor(private api: ApiService, private auth: AuthService) {}
  ngOnInit(): void { this.api.profile().subscribe((user) => this.form = user); }
  save(): void { this.api.updateProfile(this.form).subscribe(() => this.message = 'Profile updated'); }
  deleteAccount(): void {
    if (confirm('Delete your SnapBuy account?')) this.api.deleteAccount().subscribe(() => this.auth.logout());
  }
}

@Component({
  selector: 'app-admin',
  template: `
    <section class="panel">
      <h1>Admin Panel</h1>
      
      <nav class="admin-tabs">
        <button [class.active]="currentTab === 'management'" (click)="currentTab = 'management'">
          <i class="bi bi-plus-circle"></i> Management Forms
        </button>
        <button [class.active]="currentTab === 'products'" (click)="currentTab = 'products'">
          <i class="bi bi-box-seam"></i> Products ({{products.length}})
        </button>
        <button [class.active]="currentTab === 'users'" (click)="currentTab = 'users'">
          <i class="bi bi-people"></i> Users ({{users.length}})
        </button>
        <button [class.active]="currentTab === 'orders'" (click)="currentTab = 'orders'">
          <i class="bi bi-receipt"></i> Orders ({{orders.length}})
        </button>
      </nav>

      <hr class="tab-divider">

      <div class="admin-grid" *ngIf="currentTab === 'management'">
        <form (ngSubmit)="saveProduct()">
          <h2>Product management</h2>
          <input [(ngModel)]="product.name" name="pname" placeholder="Name" required>
          <textarea [(ngModel)]="product.description" name="pdesc" placeholder="Description" required></textarea>
          <input [(ngModel)]="product.price" name="price" type="number" placeholder="Price" required>
          <input [(ngModel)]="product.imageUrl" name="image" placeholder="Image URL">
          <input [(ngModel)]="product.stockQuantity" name="stock" type="number" placeholder="Stock" required>
          <select [(ngModel)]="product.categoryId" name="cat" required>
            <option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</option>
          </select>
          <label><input [(ngModel)]="product.deal" name="deal" type="checkbox"> Deal</label>
          <button class="primary">Save product</button>
        </form>
        
        <form (ngSubmit)="saveCategory()">
          <h2>Category management</h2>
          <input [(ngModel)]="category.name" name="cname" placeholder="Name" required>
          <input [(ngModel)]="category.description" name="cdesc" placeholder="Description">
          <button class="primary">Save category</button>
        </form>
      </div>

      <div class="tab-content" *ngIf="currentTab === 'products'">
        <h2>Products Directory</h2>
        <div class="list-row" *ngFor="let p of products">
          <div><strong>{{ p.name }}</strong><p>{{ p.category.name }} | Stock {{ p.stockQuantity }}</p></div>
          <button (click)="editProduct(p)">Edit</button>
          <button (click)="toggleStock(p)">{{ p.stockQuantity === 0 ? 'Mark in-stock' : 'Mark out-of-stock' }}</button>
          <button class="danger-btn" (click)="deleteProduct(p)">Delete</button>
        </div>
      </div>

      <div class="tab-content" *ngIf="currentTab === 'users'">
        <h2>Registered Users</h2>
        <div class="list-row" *ngFor="let u of users">
          <div><strong>{{ u.username }}</strong><p>{{ u.email }}</p></div>
          <button class="danger-btn" (click)="deleteUser(u)">Delete</button>
        </div>
      </div>

      <div class="tab-content" *ngIf="currentTab === 'orders'">
        <h2>Customer Orders</h2>
        <div class="order-card" *ngFor="let order of orders">
          <div class="row-line"><strong>#{{ order.id }}</strong><span>{{ order.totalPrice | currency:'INR' }}</span></div>
          <select [ngModel]="order.status" (ngModelChange)="delivery(order, $event)">
            <option>PENDING</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option>
          </select>
          <select [ngModel]="order.paymentStatus" (ngModelChange)="payment(order, $event)">
            <option>PENDING</option><option>PAID</option><option>FAILED</option><option>REFUNDED</option>
          </select>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* --- NEW NAVIGATION TABS CSS --- */
    .admin-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 10px;
    }

    .admin-tabs button {
      background: #f1f5f9;
      border: 1px solid #dfe6ef;
      color: #475569;
      font-size: 0.95rem;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .admin-tabs button:hover {
      background: #e2e8f0;
      color: #1e293b;
    }

    /* Active tab style highlight */
    .admin-tabs button.active {
      background: #0f766e;
      color: #ffffff;
      border-color: #0f766e;
      box-shadow: 0 4px 12px rgba(15, 118, 110, 0.2);
    }

    .tab-divider {
      border: 0;
      height: 1px;
      background: #e3e8ef;
      margin: 10px 0 20px 0;
    }

    .tab-content h2 {
      font-size: 1.4rem;
      color: #172033;
      margin-bottom: 20px;
    }

    /* --- ALL YOUR EXISTING BEAUTIFUL LAYOUT RULES STAYS BELOW --- */
    .panel {
      display: flex;
      flex-direction: column;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .admin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 40px;
      align-items: start;
    }
    .admin-grid form {
      background: #ffffff;
      border: 1px solid #e3e8ef;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .admin-grid h2 {
      font-size: 1.3rem;
      color: #172033;
      margin: 0 0 8px 0;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 10px;
    }
    .admin-grid input:not([type="checkbox"]),
    .admin-grid textarea,
    .admin-grid select {
      width: 100%;
      box-sizing: border-box; 
      height: 42px;
      padding: 0 14px;
      background: #ffffff;
      border: 1px solid #dfe6ef;
      border-radius: 6px;
      font-size: 0.95rem;
      color: #172033;
      outline: none;
    }
    .admin-grid textarea {
      height: auto;
      min-height: 90px;
      padding: 10px 14px;
      resize: vertical;
    }
    .admin-grid input:focus,
    .admin-grid textarea:focus,
    .admin-grid select:focus {
      border-color: #0f766e;
      box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
    }
    .admin-grid label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #344055;
      cursor: pointer;
    }
    .admin-grid input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #0f766e;
    }
    .admin-grid button.primary {
      width: 100%;
      height: 42px;
      background: #0f766e;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
    }
    .list-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 0;
      border-bottom: 1px solid #e3e8ef;
    }
    .list-row div:first-of-type {
      flex: 3;
      min-width: 250px;
    }
    .list-row div:first-of-type strong {
      display: block;
      font-size: 1.05rem;
      color: #172033;
      margin-bottom: 4px;
    }
    .list-row div:first-of-type p {
      margin: 0;
      color: #64748b;
      font-size: 0.9rem;
    }
    .list-row button {
      height: 36px;
      background: #ffffff;
      border: 1px solid #172033;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      flex-shrink: 0;
    }
    .list-row button:nth-of-type(2) {
      min-width: 160px;
    }
    .list-row .danger-btn {
      background: #fef2f2;
      border: 1px solid #fca5a5;
      color: #b91c1c;
      margin-left: auto;
    }
    .order-card {
      display: flex;
      align-items: center;
      gap: 24px;
      background: #ffffff;
      border: 1px solid #e3e8ef;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 12px;
    }
    .order-card .row-line {
      margin: 0;
      flex: 1;
      min-width: 80px;
    }
    .order-card .row-line strong {
      font-size: 1.1rem;
      color: #172033;
    }
    .order-card select {
      height: 38px;
      min-width: 150px;
      padding: 0 12px;
      background-color: #ffffff;
      border: 1px solid #dfe6ef;
      border-radius: 6px;
      color: #344055;
      font-weight: 600;
      font-size: 0.95rem;
    }
    .order-card span {
      font-size: 1.1rem;
      font-weight: 700;
      color: #172033;
      margin-left: auto;
      text-align: right;
      min-width: 100px;
    }
  `]
})
export class AdminComponent implements OnInit {
  currentTab = 'management'; 

  products: Product[] = [];
  categories: Category[] = [];
  users: User[] = [];
  orders: Order[] = [];
  product: any = { stockQuantity: 10, deal: false, rating: 4.5 };
  category: any = {};
  
  // 1. Inject ActivatedRoute here 
  constructor(public api: ApiService, private route: ActivatedRoute) {}
  
  ngOnInit(): void { 
    this.load(); 
  }
  
  load(): void {
    this.api.categories().subscribe((categories) => this.categories = categories);
    this.api.adminUsers().subscribe((users) => this.users = users);
    this.api.adminOrders().subscribe((orders) => this.orders = orders);
    
    // 2. Fetch products first, then immediately check the URL query parameters
    this.api.products().subscribe((products) => {
      this.products = products;
      
      // Listen for the editId parameter from the URL
      this.route.queryParamMap.subscribe((params) => {
        const editId = params.get('editId');
        if (editId) {
          // Find the matching product from your database array
          const targetProduct = this.products.find(p => p.id === Number(editId));
          if (targetProduct) {
            // Automatically push data into the form fields
            this.editProduct(targetProduct);
          }
        }
      });
    });
  }
  
  saveProduct(): void { 
    this.api.saveProduct(this.product).subscribe(() => { 
      this.product = { stockQuantity: 10, deal: false, rating: 4.5 }; 
      this.load(); 
    }); 
  }
  
  editProduct(product: Product): void { 
    this.product = { ...product, categoryId: product.category.id };
    this.currentTab = 'management'; 
  }
  saveCategory(): void { this.api.saveCategory(this.category).subscribe(() => { this.category = {}; this.load(); }); }
  toggleStock(product: Product): void { this.api.markStock(product.id, product.stockQuantity === 0).subscribe(() => this.load()); }
  deleteProduct(product: Product): void { this.api.deleteProduct(product.id).subscribe(() => this.load()); }
  deleteUser(user: User): void { this.api.deleteUser(user.id).subscribe(() => this.load()); }
  delivery(order: Order, status: string): void { this.api.updateDeliveryStatus(order.id, status).subscribe(() => this.load()); }
  payment(order: Order, status: string): void { this.api.updatePaymentStatus(order.id, status).subscribe(() => this.load()); }
}

@Component({
  selector: 'app-static-page',
  template: `
    <section class="panel">
      <h1>{{ title }}</h1>
      <p>{{ text }}</p>
    </section>
  `
})
export class StaticPageComponent implements OnInit {
  title = '';
  text = '';
  constructor(private route: ActivatedRoute) {}
  ngOnInit(): void {
    const page = this.route.snapshot.data['page'];
    this.title = page === 'privacy' ? 'Privacy Policy' : 'Terms and Conditions';
    this.text = page === 'privacy'
      ? 'SnapBuy respects your privacy and is committed to protecting your personal information. When you use our platform, we may collect basic details such as your name, email address, contact information, order history, and usage data to improve your shopping experience. This information is used to process orders, provide customer support, enhance website performance, and ensure account security. We do not sell or share your personal data with unauthorized third parties. However, limited information may be shared with trusted partners such as payment gateways for secure transactions and delivery services for order fulfillment. We also use cookies to improve user experience and maintain session data. By using SnapBuy, you agree to the collection and use of your information as described. For any privacy-related concerns, you can contact us to our email.'
      : 'By using SnapBuy, you agree to follow our terms and conditions. You are responsible for maintaining the confidentiality of your account and activities under it. While we aim to provide accurate product information, slight variations in descriptions or images may occur. Orders are confirmed only after successful payment, and SnapBuy reserves the right to cancel orders in cases of fraud, technical issues, or stock unavailability. Delivery times may vary depending on location and courier services. Returns and refunds are accepted only under valid conditions such as damaged or incorrect products, and refunds will be processed through the original payment method. Users must not misuse the platform, attempt unauthorized access, or engage in fraudulent activities. SnapBuy may update these terms at any time without prior notice.';
  }
}
