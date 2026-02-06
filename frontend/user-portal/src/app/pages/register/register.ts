import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  name = '';
  email = '';
  password = '';
  success = '';
  error = '';

  constructor(private authService: AuthService) { }

  register() {
    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password,
    }).subscribe({
      next: () => {
        this.success = 'Registration successful';
        this.name = '';
        this.email = '';
        this.password = '';
      },
      error: () => {
        this.error = 'Registration failed';
      }
    });
  }
}
