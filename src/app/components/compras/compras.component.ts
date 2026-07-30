import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Compra, Producto, Proveedor } from '../../models/models';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Compras</h1>
    <p class="error" *ngIf="errorMsg" style="color:#c62828;">{{ errorMsg }}</p>
    <div class="toolbar">
      <input class="search-box" type="text" [(ngModel)]="searchText" (input)="onSearch()" placeholder="Buscar compra o proveedor...">
      <button class="btn btn-primary" (click)="openForm()">+ Nueva Compra</button>
    </div>
    <div class="card" *ngIf="showForm">
      <div class="form-group"><label>Proveedor</label>
        <select class="form-control" [(ngModel)]="proveedorId"><option value="">-- Seleccione --</option>
          <option *ngFor="let p of proveedores" [value]="p.id">{{ p.nombre }} - {{ p.rut }}</option>
        </select>
        <small *ngIf="showErrors && !proveedorId" style="color:#c62828;">Seleccione un proveedor</small>
      </div>
      <h4>Detalles</h4>
      <div class="grid-3" *ngFor="let d of detalles; let i = index">
        <div class="form-group"><label>Producto</label>
          <select class="form-control" [(ngModel)]="d.productoId"><option value="">-- Seleccione --</option>
            <option *ngFor="let p of productos" [value]="p.id">{{ p.nombre }}</option>
          </select>
          <small *ngIf="showErrors && !d.productoId" style="color:#c62828;">Seleccione un producto</small>
        </div>
        <div class="form-group"><label>Cantidad</label><input class="form-control" type="number" min="1" [(ngModel)]="d.cantidad"></div>
        <div class="form-group"><label>P.Unitario</label><input class="form-control" type="number" min="0.01" step="0.01" [(ngModel)]="d.precioUnitario"></div>
      </div>
      <button class="btn btn-secondary" (click)="addDetalle()">+ Agregar</button>
      <br><br><button class="btn btn-primary" (click)="save()">Guardar</button>
      <button class="btn btn-secondary" (click)="cancelForm()" style="margin-left:10px;">Cancelar</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th (click)="sortBy('numeroCompra')">N° Compra <span class="sort-arrow">{{ sortIcon('numeroCompra') }}</span></th>
            <th (click)="sortBy('proveedor')">Proveedor <span class="sort-arrow">{{ sortIcon('proveedor') }}</span></th>
            <th (click)="sortBy('total')">Total <span class="sort-arrow">{{ sortIcon('total') }}</span></th>
            <th (click)="sortBy('fechaCompra')">Fecha <span class="sort-arrow">{{ sortIcon('fechaCompra') }}</span></th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let c of paginatedData">
              <td>{{ c.numeroCompra }}</td><td>{{ c.proveedor }}</td><td>S/ {{ c.total }}</td><td>{{ c.fechaCompra | date:'dd/MM/yyyy' }}</td>
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
export class ComprasComponent implements OnInit {
  allData: Compra[] = [];           // Todas las compras cargadas
  productos: Producto[] = [];       // Lista de productos para el formulario
  proveedores: Proveedor[] = [];    // Lista de proveedores para el formulario
  searchText = '';                  // Término de búsqueda
  sortColumn = '';                  // Columna de ordenamiento actual
  sortDir = 'asc';                  // Dirección del ordenamiento
  currentPage = 1;                  // Página actual de la paginación
  pageSize = 10;                    // Elementos por página
  showForm = false;                 // Controla visibilidad del formulario
  showErrors = false;               // Indica si se muestran errores de validación
  errorMsg = '';                    // Mensaje de error global
  proveedorId = '';                 // ID del proveedor seleccionado
  detalles: any[] = [{ productoId: '', cantidad: 1, precioUnitario: 0 }];  // Detalles de compra

  constructor(private api: ApiService) {}
  // Inicializa la carga de datos, productos y proveedores
  ngOnInit() { this.load(); this.api.getProductos().subscribe(r => this.productos = r); this.api.getProveedores().subscribe(r => this.proveedores = r); }

  // Filtra y ordena los datos según búsqueda y columna
  get filteredData() {
    let data = this.allData;
    if (this.searchText) {
      const t = this.searchText.toLowerCase();
      data = data.filter(c => c.numeroCompra?.toLowerCase().includes(t) || c.proveedor?.toLowerCase().includes(t));
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
  load() { this.api.getCompras().subscribe(r => { this.allData = r; this.currentPage = 1; }); }
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

  // Abre el formulario para nueva compra
  openForm() { this.showForm = true; this.showErrors = false; this.errorMsg = ''; this.proveedorId = ''; this.detalles = [{ productoId: '', cantidad: 1, precioUnitario: 0 }]; }
  // Cierra el formulario sin guardar
  cancelForm() { this.showForm = false; this.showErrors = false; this.errorMsg = ''; }
  // Agrega una línea de detalle a la compra
  addDetalle() { this.detalles.push({ productoId: '', cantidad: 1, precioUnitario: 0 }); }

  // Valida que todos los campos requeridos estén completos
  isValid(): boolean {
    this.showErrors = true;
    if (!this.proveedorId) return false;
    for (const d of this.detalles) { if (!d.productoId || d.cantidad < 1 || d.precioUnitario <= 0) return false; }
    return true;
  }

  // Guarda la compra con sus detalles
  save() {
    if (!this.isValid()) return;
    this.errorMsg = '';
    const prov = this.proveedores.find(p => p.id === Number(this.proveedorId));
    this.api.createCompra({ proveedor: prov?.nombre || '', detalles: this.detalles.map(d => ({ ...d, productoId: Number(d.productoId), cantidad: Number(d.cantidad), precioUnitario: Number(d.precioUnitario) })) }).subscribe({
      next: () => { this.load(); this.cancelForm(); },
      error: (e) => { this.errorMsg = e.error?.message || e.message || 'Error al crear la compra'; }
    });
  }
}
