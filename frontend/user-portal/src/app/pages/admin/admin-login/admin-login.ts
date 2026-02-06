import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {

  email = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  login() {
    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        if (res.role !== 'admin') {
          this.error = 'Access denied. Admins only.';
          return;
        }

        localStorage.setItem('token', res.access_token);
        localStorage.setItem('role', res.role);

        this.router.navigate(['/admin/dashboard']);
      },
      error: () => {
        this.error = 'Invalid admin credentials';
      }
    });
  }
}
