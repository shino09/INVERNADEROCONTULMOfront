import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
// Guardia que protege rutas para usuarios autenticados
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}
  // Verifica si el usuario tiene un token válido
  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (token) return true;
    this.router.navigate(['/login']);
    return false;
  }
}

@Injectable({ providedIn: 'root' })
// Guardia que restringe acceso solo a administradores
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}
  // Verifica si el rol del usuario es Admin
  canActivate(): boolean {
    const rol = localStorage.getItem('rol');
    if (rol === 'Admin') return true;
    this.router.navigate(['/dashboard']);
    return false;
  }
}
