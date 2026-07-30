import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Pedido, Producto, Cliente } from '../../models/models';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Pedidos</h1>
    <div class="toolbar">
      <input class="search-box" type="text" [(ngModel)]="searchText" (input)="onSearch()" placeholder="Buscar pedido o cliente...">
      <button class="btn btn-primary" (click)="openForm()">+ Nuevo Pedido</button>
    </div>
    <div class="card" *ngIf="showForm">
      <div class="form-group"><label>Cliente</label>
        <select class="form-control" [(ngModel)]="clienteId">
          <option *ngFor="let c of clientes" [value]="c.id">{{ c.nombre }}</option>
        </select>
      </div>
      <h4>Detalles</h4>
      <div class="grid-2" *ngFor="let d of detalles; let i = index">
        <div class="form-group"><label>Producto</label>
          <select class="form-control" [(ngModel)]="d.productoId">
            <option *ngFor="let p of productos" [value]="p.id">{{ p.nombre }}</option>
          </select>
        </div>
        <div class="form-group"><label>Cantidad</label><input class="form-control" type="number" [(ngModel)]="d.cantidad"></div>
      </div>
      <button class="btn btn-secondary" (click)="addDetalle()">+ Agregar</button>
      <br><br><button class="btn btn-primary" (click)="save()">Guardar</button>
      <button class="btn btn-secondary" (click)="cancelForm()" style="margin-left:10px;">Cancelar</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th (click)="sortBy('numeroPedido')">N° Pedido <span class="sort-arrow">{{ sortIcon('numeroPedido') }}</span></th>
            <th (click)="sortBy('clienteNombre')">Cliente <span class="sort-arrow">{{ sortIcon('clienteNombre') }}</span></th>
            <th (click)="sortBy('estado')">Estado <span class="sort-arrow">{{ sortIcon('estado') }}</span></th>
            <th (click)="sortBy('total')">Total <span class="sort-arrow">{{ sortIcon('total') }}</span></th>
            <th (click)="sortBy('fechaPedido')">Fecha <span class="sort-arrow">{{ sortIcon('fechaPedido') }}</span></th>
            <th>Acciones</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let p of paginatedData">
              <td>{{ p.numeroPedido }}</td><td>{{ p.cliente?.nombre }}</td><td>{{ p.estado }}</td><td>S/ {{ p.total }}</td>
              <td>{{ p.fechaPedido | date:'dd/MM/yyyy' }}</td>
              <td class="actions">
                <button class="btn btn-primary btn-sm" (click)="updateEstado(p.id, 'Aprobado')" *ngIf="p.estado=='Pendiente'">Aprobar</button>
                <button class="btn btn-warning btn-sm" (click)="updateEstado(p.id, 'Entregado')" *ngIf="p.estado=='Aprobado'">Entregar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button [disabled]="currentPage === 1" (click)="goPage(currentPage - 1)">Anterior</button>
        <button *ngFor="let p of pages" [class.active]="p === currentPage" (click)="goPage(p)">{{ p }}</button>
        <button [disabled]="currentPage === totalPages" (click)="goPage(currentPage + 1)">Siguiente</button>
        <span>Mostrando {{ (currentPage-1)*pageSize+1 }}-{{ min(currentPage*pageSize, filteredData.length) }} de {{ filteredData.length }}</span>
      </div>
    </div>
  `
})
export class PedidosComponent implements OnInit {
  allData: any[] = [];         // Todos los pedidos cargados
  productos: Producto[] = [];  // Lista de productos para el formulario
  clientes: Cliente[] = [];    // Lista de clientes para el formulario
  searchText = '';             // Término de búsqueda
  sortColumn = '';             // Columna de ordenamiento actual
  sortDir = 'asc';             // Dirección del ordenamiento
  currentPage = 1;             // Página actual de la paginación
  pageSize = 10;               // Elementos por página
  showForm = false;            // Controla visibilidad del formulario
  clienteId = 0;               // ID del cliente seleccionado
  detalles: any[] = [{ productoId: 0, cantidad: 1 }];  // Detalles del pedido

  constructor(private api: ApiService) {}
  // Inicializa la carga de datos y catálogos
  ngOnInit() { this.load(); this.api.getProductos().subscribe(r => this.productos = r); this.api.getClientes().subscribe(r => this.clientes = r); }

  // Filtra y ordena los datos según búsqueda y columna
  get filteredData() {
    let data = this.allData.map(p => ({ ...p, clienteNombre: p.cliente?.nombre || '' }));
    if (this.searchText) {
      const t = this.searchText.toLowerCase();
      data = data.filter(p => p.numeroPedido?.toLowerCase().includes(t) || p.clienteNombre?.toLowerCase().includes(t));
    }
    if (this.sortColumn) {
      data.sort((a: any, b: any) => {
        const va = a[this.sortColumn] ?? '', vb = b[this.sortColumn] ?? '';
        const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
        return this.sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return data;
  }
  // Calcula el total de páginas disponibles
  get totalPages() { return Math.ceil(this.filteredData.length / this.pageSize) || 1; }
  // Obtiene los datos de la página actual
  get paginatedData() { return this.filteredData.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); }
  // Genera el arreglo de números de página
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  // Carga la lista desde la API
  load() { this.api.getPedidos().subscribe(r => { this.allData = r; this.currentPage = 1; }); }
  // Cambia la columna de ordenamiento
  sortBy(col: string) { if (this.sortColumn === col) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'; else { this.sortColumn = col; this.sortDir = 'asc'; } }
  // Devuelve el icono según la dirección de orden
  sortIcon(col: string) { return this.sortColumn === col ? (this.sortDir === 'asc' ? '▲' : '▼') : ''; }
  // Reinicia la paginación al buscar
  onSearch() { this.currentPage = 1; }
  // Navega a una página específica
  goPage(p: number) { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }
  // Retorna el menor de dos números
  min(a: number, b: number) { return Math.min(a, b); }

  // Abre el formulario para nuevo pedido
  openForm() { this.showForm = true; this.clienteId = 0; this.detalles = [{ productoId: 0, cantidad: 1 }]; }
  // Cierra el formulario sin guardar
  cancelForm() { this.showForm = false; }
  // Agrega una línea de detalle al pedido
  addDetalle() { this.detalles.push({ productoId: 0, cantidad: 1 }); }
  // Guarda el pedido en la base de datos
  save() { this.api.createPedido({ clienteId: this.clienteId, detalles: this.detalles }).subscribe(() => { this.load(); this.cancelForm(); }); }
  // Actualiza el estado de un pedido (Aprobado/Entregado)
  updateEstado(id: number, estado: string) { this.api.updatePedidoEstado(id, estado).subscribe(() => this.load()); }
}
