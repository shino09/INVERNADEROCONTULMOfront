import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Proveedor } from '../../models/models';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Proveedores</h1>
    <p class="error" *ngIf="errorMsg" style="color:#c62828;">{{ errorMsg }}</p>
    <div class="toolbar">
      <input class="search-box" type="text" [(ngModel)]="searchText" (input)="onSearch()" placeholder="Buscar proveedor...">
      <button class="btn btn-primary" (click)="openForm()">+ Nuevo Proveedor</button>
    </div>
    <div class="card" *ngIf="showForm">
      <div class="grid-2">
        <div class="form-group"><label>Nombre</label><input class="form-control" [(ngModel)]="editItem.nombre" required>
          <small *ngIf="showErrors && !editItem.nombre" style="color:#c62828;">Requerido</small></div>
        <div class="form-group"><label>RUT</label><input class="form-control" [(ngModel)]="editItem.rut" placeholder="XX.XXX.XXX-X"></div>
        <div class="form-group"><label>Email</label><input class="form-control" type="email" [(ngModel)]="editItem.email" placeholder="ejemplo@correo.cl">
          <small *ngIf="showErrors && editItem.email && !isValidEmail(editItem.email)" style="color:#c62828;">Email inválido</small></div>
        <div class="form-group"><label>Teléfono</label><input class="form-control" type="tel" [(ngModel)]="editItem.telefono" placeholder="+56 9 XXXX XXXX">
          <small *ngIf="showErrors && editItem.telefono && !isValidPhone(editItem.telefono)" style="color:#c62828;">Teléfono inválido</small></div>
        <div class="form-group"><label>Dirección</label><input class="form-control" [(ngModel)]="editItem.direccion"></div>
        <div class="form-group"><label>Contacto</label><input class="form-control" [(ngModel)]="editItem.contacto"></div>
      </div>
      <button class="btn btn-primary" (click)="save()">{{ isEditing ? 'Actualizar' : 'Guardar' }}</button>
      <button class="btn btn-secondary" (click)="cancelForm()" style="margin-left:10px;">Cancelar</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th (click)="sortBy('nombre')">Nombre <span class="sort-arrow">{{ sortIcon('nombre') }}</span></th>
            <th (click)="sortBy('rut')">RUT <span class="sort-arrow">{{ sortIcon('rut') }}</span></th>
            <th (click)="sortBy('email')">Email <span class="sort-arrow">{{ sortIcon('email') }}</span></th>
            <th (click)="sortBy('telefono')">Teléfono <span class="sort-arrow">{{ sortIcon('telefono') }}</span></th>
            <th (click)="sortBy('contacto')">Contacto <span class="sort-arrow">{{ sortIcon('contacto') }}</span></th>
            <th>Acciones</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let p of paginatedData">
              <td>{{ p.nombre }}</td><td>{{ p.rut }}</td><td>{{ p.email }}</td><td>{{ p.telefono }}</td><td>{{ p.contacto }}</td>
              <td class="actions">
                <button class="btn btn-warning btn-sm" (click)="edit(p)">Editar</button>
                <button class="btn btn-danger btn-sm" (click)="delete(p.id)">Eliminar</button>
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
export class ProveedoresComponent implements OnInit {
  allData: Proveedor[] = [];    // Todos los proveedores cargados
  searchText = '';               // Término de búsqueda
  sortColumn = '';               // Columna de ordenamiento actual
  sortDir = 'asc';               // Dirección del ordenamiento
  currentPage = 1;               // Página actual de la paginación
  pageSize = 10;                 // Elementos por página
  showForm = false;              // Controla visibilidad del formulario
  showErrors = false;            // Indica si se muestran errores de validación
  errorMsg = '';                 // Mensaje de error global
  isEditing = false;             // Indica si se está editando
  editItem: Proveedor = {} as Proveedor;  // Proveedor en edición

  constructor(private api: ApiService) {}
  // Inicializa la carga de datos
  ngOnInit() { this.load(); }

  // Valida formato de email
  isValidEmail(email: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  // Valida formato de teléfono chileno
  isValidPhone(phone: string): boolean { return /^(\+56\s?)?9\s?\d{4}\s?\d{4}$/.test(phone.trim()) || phone === ''; }

  // Filtra y ordena los datos según búsqueda y columna
  get filteredData() {
    let data = this.allData;
    if (this.searchText) {
      const t = this.searchText.toLowerCase();
      data = data.filter(p => p.nombre?.toLowerCase().includes(t) || p.rut?.toLowerCase().includes(t) || p.email?.toLowerCase().includes(t));
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
  load() { this.api.getProveedores().subscribe(r => { this.allData = r; this.currentPage = 1; }); }
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

  // Abre el formulario para nuevo registro
  openForm() { this.showForm = true; this.showErrors = false; this.errorMsg = ''; this.isEditing = false; this.editItem = {} as Proveedor; }
  // Cierra el formulario sin guardar
  cancelForm() { this.showForm = false; this.showErrors = false; this.errorMsg = ''; this.isEditing = false; this.editItem = {} as Proveedor; }
  // Carga un registro en el formulario para editar
  edit(p: Proveedor) { this.editItem = { ...p }; this.showForm = true; this.isEditing = true; this.showErrors = false; }

  // Valida campos requeridos y formatos
  isValid(): boolean {
    this.showErrors = true;
    if (!this.editItem.nombre) return false;
    if (this.editItem.email && !this.isValidEmail(this.editItem.email)) return false;
    if (this.editItem.telefono && !this.isValidPhone(this.editItem.telefono)) return false;
    return true;
  }

  // Guarda o actualiza un proveedor
  save() {
    if (!this.isValid()) return;
    this.errorMsg = '';
    const req = this.isEditing ? this.api.updateProveedor(this.editItem.id, this.editItem) : this.api.createProveedor(this.editItem);
    req.subscribe({ next: () => { this.load(); this.cancelForm(); }, error: (e) => { this.errorMsg = e.error?.message || e.message || 'Error al guardar'; } });
  }

  // Elimina un proveedor tras confirmación
  delete(id: number) { if (confirm('¿Eliminar proveedor?')) this.api.deleteProveedor(id).subscribe(() => this.load()); }
}
