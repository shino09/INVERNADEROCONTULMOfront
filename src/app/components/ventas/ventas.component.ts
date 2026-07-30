import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Venta, Producto, Cliente } from '../../models/models';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Ventas</h1>
    <p class="error" *ngIf="errorMsg" style="color:#c62828;">{{ errorMsg }}</p>
    <div class="toolbar">
      <input class="search-box" type="text" [(ngModel)]="searchText" (input)="onSearch()" placeholder="Buscar factura o cliente...">
      <button class="btn btn-primary" (click)="openForm()">+ Nueva Venta</button>
    </div>
    <div class="card" *ngIf="showForm">
      <div class="grid-2">
        <div class="form-group"><label>Cliente</label>
          <select class="form-control" [(ngModel)]="newVenta.clienteId"><option value="">-- Seleccione --</option>
            <option *ngFor="let c of clientes" [value]="c.id">{{ c.nombre }}</option>
          </select>
          <small *ngIf="showErrors && !newVenta.clienteId" style="color:#c62828;">Seleccione un cliente</small>
        </div>
        <div class="form-group"><label>Método Pago</label>
          <select class="form-control" [(ngModel)]="newVenta.metodoPago">
            <option value="Efectivo">Efectivo</option><option value="Tarjeta">Tarjeta</option><option value="Transferencia">Transferencia</option>
          </select>
        </div>
      </div>
      <h4>Detalles</h4>
      <div class="grid-2" *ngFor="let d of detalles; let i = index" style="align-items:center;">
        <div class="form-group"><label>Producto</label>
          <select class="form-control" [(ngModel)]="d.productoId"><option value="">-- Seleccione --</option>
            <option *ngFor="let p of productos" [value]="p.id">{{ p.nombre }} - S/{{ p.precioVenta }}</option>
          </select>
          <small *ngIf="showErrors && !d.productoId" style="color:#c62828;">Seleccione un producto</small>
        </div>
        <div class="form-group"><label>Cantidad</label><input class="form-control" type="number" min="1" [(ngModel)]="d.cantidad"></div>
      </div>
      <button class="btn btn-secondary" (click)="addDetalle()">+ Agregar</button>
      <br><br><button class="btn btn-primary" (click)="save()">Guardar Venta</button>
      <button class="btn btn-secondary" (click)="cancelForm()" style="margin-left:10px;">Cancelar</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th (click)="sortBy('numeroFactura')">Factura <span class="sort-arrow">{{ sortIcon('numeroFactura') }}</span></th>
            <th (click)="sortBy('clienteNombre')">Cliente <span class="sort-arrow">{{ sortIcon('clienteNombre') }}</span></th>
            <th (click)="sortBy('total')">Total <span class="sort-arrow">{{ sortIcon('total') }}</span></th>
            <th (click)="sortBy('metodoPago')">Método <span class="sort-arrow">{{ sortIcon('metodoPago') }}</span></th>
            <th (click)="sortBy('fechaVenta')">Fecha <span class="sort-arrow">{{ sortIcon('fechaVenta') }}</span></th>
            <th>Acciones</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let v of paginatedData">
              <td>{{ v.numeroFactura }}</td><td>{{ v.cliente?.nombre }}</td><td>S/ {{ v.total }}</td><td>{{ v.metodoPago }}</td>
              <td>{{ v.fechaVenta | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="actions">
                <button class="btn btn-primary btn-sm" (click)="downloadFactura(v.id)">PDF</button>
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
export class VentasComponent implements OnInit {
  allData: any[] = [];              // Todas las ventas cargadas
  productos: Producto[] = [];       // Lista de productos para el formulario
  clientes: Cliente[] = [];         // Lista de clientes para el formulario
  searchText = '';                  // Término de búsqueda
  sortColumn = '';                  // Columna de ordenamiento actual
  sortDir = 'asc';                  // Dirección del ordenamiento
  currentPage = 1;                  // Página actual de la paginación
  pageSize = 10;                    // Elementos por página
  showForm = false;                 // Controla visibilidad del formulario
  showErrors = false;               // Indica si se muestran errores de validación
  errorMsg = '';                    // Mensaje de error global
  newVenta: any = { clienteId: '', metodoPago: 'Efectivo' };  // Datos de nueva venta
  detalles: any[] = [{ productoId: '', cantidad: 1 }];  // Detalles de venta

  constructor(private api: ApiService) {}
  // Inicializa la carga de datos y catálogos
  ngOnInit() { this.load(); this.api.getProductos().subscribe(r => this.productos = r); this.api.getClientes().subscribe(r => this.clientes = r); }

  // Filtra y ordena los datos según búsqueda y columna
  get filteredData() {
    let data = this.allData.map(v => ({ ...v, clienteNombre: v.cliente?.nombre || '' }));
    if (this.searchText) {
      const t = this.searchText.toLowerCase();
      data = data.filter(v => v.numeroFactura?.toLowerCase().includes(t) || v.clienteNombre?.toLowerCase().includes(t));
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
  load() { this.api.getVentas().subscribe(r => { this.allData = r; this.currentPage = 1; }); }
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

  // Abre el formulario para nueva venta
  openForm() { this.showForm = true; this.showErrors = false; this.errorMsg = ''; this.newVenta = { clienteId: '', metodoPago: 'Efectivo' }; this.detalles = [{ productoId: '', cantidad: 1 }]; }
  // Cierra el formulario sin guardar
  cancelForm() { this.showForm = false; this.showErrors = false; this.errorMsg = ''; }
  // Agrega una línea de detalle a la venta
  addDetalle() { this.detalles.push({ productoId: '', cantidad: 1 }); }

  // Valida que todos los campos requeridos estén completos
  isValid(): boolean {
    this.showErrors = true;
    if (!this.newVenta.clienteId) return false;
    for (const d of this.detalles) { if (!d.productoId || d.cantidad < 1) return false; }
    return true;
  }

  // Guarda la venta con sus detalles
  save() {
    if (!this.isValid()) return;
    this.errorMsg = '';
    this.api.createVenta({ clienteId: Number(this.newVenta.clienteId), metodoPago: this.newVenta.metodoPago, detalles: this.detalles.map(d => ({ ...d, productoId: Number(d.productoId), cantidad: Number(d.cantidad) })) }).subscribe({
      next: () => { this.load(); this.cancelForm(); },
      error: (e) => { this.errorMsg = e.error?.message || e.message || 'Error al crear la venta'; }
    });
  }

  // Descarga la factura de una venta en PDF
  downloadFactura(id: number) {
    this.api.getFactura(id).subscribe(blob => window.open(window.URL.createObjectURL(blob)));
  }
}
