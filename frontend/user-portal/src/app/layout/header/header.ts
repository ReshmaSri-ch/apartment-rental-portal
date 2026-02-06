import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html'
})
export class HeaderComponent {

  isLoggedIn = false;
  role: string | null = null;
  isAdminRoute = false;

  constructor(public router: Router) {
    // Update auth state whenever navigation happens
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.syncAuth();
      this.checkAdminRoute();
    });
  }

  ngOnInit() {
    this.syncAuth();
    this.checkAdminRoute();
  }

  syncAuth() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.role = localStorage.getItem('role');
    console.log('Auth synced:', { isLoggedIn: this.isLoggedIn, role: this.role }); // Debug log
  }

  checkAdminRoute() {
    this.isAdminRoute = this.router.url.startsWith('/admin');
    console.log('Admin route:', this.isAdminRoute, 'URL:', this.router.url); // Debug log
  }

  logout() {
    localStorage.clear();
    this.syncAuth();
    this.router.navigate(['/login']);
  }
}
