import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Dashboard</h1>
    <p>Bienvenido, {{ nombre }}</p>
    <div class="grid-3" style="margin-top:20px;">
      <div class="card"><h3>Productos</h3><p style="font-size:2em;color:#2e7d32;">{{ productos.length }}</p></div>
      <div class="card"><h3>Clientes</h3><p style="font-size:2em;color:#2e7d32;">{{ clientes.length }}</p></div>
      <div class="card"><h3>Ventas</h3><p style="font-size:2em;color:#2e7d32;">{{ ventas.length }}</p></div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  nombre = localStorage.getItem('nombre') || '';  // Nombre del usuario logueado
  productos: any[] = [];   // Contador de productos
  clientes: any[] = [];    // Contador de clientes
  ventas: any[] = [];      // Contador de ventas
  constructor(private api: ApiService) {}
  // Carga los indicadores del dashboard al iniciar
  ngOnInit() {
    this.api.getProductos().subscribe(r => this.productos = r);
    this.api.getClientes().subscribe(r => this.clientes = r);
    this.api.getVentas().subscribe(r => this.ventas = r);
  }
}
