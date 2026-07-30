import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="card" style="max-width:400px;margin:100px auto;">
        <h2 style="text-align:center;color:#2e7d32;margin-bottom:20px;">INVERNADEROCONTULMO</h2>
        <h3 style="text-align:center;margin-bottom:20px;">Iniciar Sesión</h3>
        <div class="form-group">
          <label>Email</label>
          <input class="form-control" type="email" [(ngModel)]="email" placeholder="admin@invernadero.com">
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input class="form-control" type="password" [(ngModel)]="password" placeholder="admin123">
        </div>
        <p class="error" *ngIf="error">{{ error }}</p>
        <button class="btn btn-primary" style="width:100%;" (click)="login()">Ingresar</button>
      </div>
    </div>
  `,
  styles: ['.error { color: #c62828; margin: 10px 0; text-align: center; }']
})
export class LoginComponent {
  email = '';       // Email ingresado por el usuario
  password = '';    // Contraseña ingresada por el usuario
  error = '';       // Mensaje de error en caso de fallo
  constructor(private api: ApiService, private router: Router) {}
  // Ejecuta la autenticación del usuario
  login() {
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('rol', res.rol);
        localStorage.setItem('nombre', res.nombre);
        this.router.navigate(['/dashboard']);
      },
      error: () => this.error = 'Credenciales inválidas'
    });
  }
}
