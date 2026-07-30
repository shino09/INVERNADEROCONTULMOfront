import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <nav class="navbar" *ngIf="isLoggedIn()">
      <div class="logo">🌿 INVERNADEROCONTULMO</div>
      <div>
        <a routerLink="/dashboard">Dashboard</a>
        <a routerLink="/productos">Productos</a>
        <a routerLink="/categorias">Categorías</a>
        <a routerLink="/proveedores">Proveedores</a>
        <a routerLink="/clientes">Clientes</a>
        <a routerLink="/ventas">Ventas</a>
        <a routerLink="/pedidos">Pedidos</a>
        <a routerLink="/compras">Compras</a>
        <a routerLink="/contabilidad">Contabilidad</a>
        <a href="#" (click)="$event.preventDefault(); logout()">Cerrar Sesión</a>
      </div>
    </nav>
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  constructor(private router: Router) {}
  // Verifica si el usuario tiene una sesión activa
  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
  // Cierra la sesión y redirige al login
  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }
}
