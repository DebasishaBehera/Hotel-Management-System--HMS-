import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.auth.login({ email: this.email, password: this.password, role: 'USER' }).subscribe({
      next: () => {
        this.message = 'Login successful!';
        this.router.navigate(['/home']);
      },
      error: () => {
        this.message = 'Invalid email or password';
      }
    });
  }
}
