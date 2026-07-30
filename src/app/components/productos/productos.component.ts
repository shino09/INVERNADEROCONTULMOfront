import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Producto, Categoria } from '../../models/models';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Productos</h1>
    <p class="error" *ngIf="errorMsg" style="color:#c62828;">{{ errorMsg }}</p>
    <div class="toolbar">
      <input class="search-box" type="text" [(ngModel)]="searchText" (input)="onSearch()" placeholder="Buscar producto...">
      <button class="btn btn-primary" (click)="openForm()">+ Nuevo Producto</button>
    </div>
    <div class="card" *ngIf="showForm">
      <div class="grid-2">
        <div class="form-group"><label>Nombre</label><input class="form-control" [(ngModel)]="editItem.nombre"></div>
        <div class="form-group"><label>Categoría</label>
          <select class="form-control" [(ngModel)]="editItem.categoria"><option value="">-- Seleccione --</option>
            <option *ngFor="let c of categorias" [value]="c.nombre">{{ c.nombre }}</option>
          </select>
          <small *ngIf="showErrors && !editItem.categoria" style="color:#c62828;">Seleccione una categoría</small>
        </div>
        <div class="form-group"><label>Precio Compra</label><input class="form-control" type="number" min="0" step="0.01" [(ngModel)]="editItem.precioCompra"></div>
        <div class="form-group"><label>Precio Venta</label><input class="form-control" type="number" min="0" step="0.01" [(ngModel)]="editItem.precioVenta"></div>
        <div class="form-group"><label>Stock</label><input class="form-control" type="number" min="0" [(ngModel)]="editItem.stockActual"></div>
        <div class="form-group"><label>Stock Mínimo</label><input class="form-control" type="number" min="0" [(ngModel)]="editItem.stockMinimo"></div>
      </div>
      <div class="form-group"><label>Descripción</label><input class="form-control" [(ngModel)]="editItem.descripcion"></div>
      <small *ngIf="showErrors && (!editItem.nombre || !editItem.precioCompra || !editItem.precioVenta)" style="color:#c62828;">Complete los campos requeridos</small>
      <br><button class="btn btn-primary" (click)="save()">{{ isEditing ? 'Actualizar' : 'Guardar' }}</button>
      <button class="btn btn-secondary" (click)="cancelForm()" style="margin-left:10px;">Cancelar</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th (click)="sortBy('nombre')">Nombre <span class="sort-arrow">{{ sortIcon('nombre') }}</span></th>
            <th (click)="sortBy('categoria')">Categoría <span class="sort-arrow">{{ sortIcon('categoria') }}</span></th>
            <th (click)="sortBy('precioCompra')">P.Compra <span class="sort-arrow">{{ sortIcon('precioCompra') }}</span></th>
            <th (click)="sortBy('precioVenta')">P.Venta <span class="sort-arrow">{{ sortIcon('precioVenta') }}</span></th>
            <th (click)="sortBy('stockActual')">Stock <span class="sort-arrow">{{ sortIcon('stockActual') }}</span></th>
            <th (click)="sortBy('stockMinimo')">Stock Min <span class="sort-arrow">{{ sortIcon('stockMinimo') }}</span></th>
            <th>Acciones</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let p of paginatedData">
              <td>{{ p.nombre }}</td><td>{{ p.categoria }}</td><td>S/ {{ p.precioCompra }}</td><td>S/ {{ p.precioVenta }}</td>
              <td>{{ p.stockActual }}</td><td>{{ p.stockMinimo }}</td>
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
export class ProductosComponent implements OnInit {
  allData: Producto[] = [];     // Todos los productos cargados
  categorias: Categoria[] = []; // Lista de categorías para el formulario
  searchText = '';              // Término de búsqueda
  sortColumn = '';              // Columna de ordenamiento actual
  sortDir = 'asc';              // Dirección del ordenamiento
  currentPage = 1;              // Página actual de la paginación
  pageSize = 10;                // Elementos por página
  showForm = false;             // Controla visibilidad del formulario
  showErrors = false;           // Indica si se muestran errores de validación
  errorMsg = '';                // Mensaje de error global
  isEditing = false;            // Indica si se está editando
  editItem: Producto = {} as Producto;  // Producto en edición

  constructor(private api: ApiService) {}
  // Inicializa la carga de datos y categorías
  ngOnInit() { this.load(); this.api.getCategorias().subscribe(r => this.categorias = r); }

  // Filtra y ordena los datos según búsqueda y columna
  get filteredData() {
    let data = this.allData;
    if (this.searchText) {
      const t = this.searchText.toLowerCase();
      data = data.filter(p => p.nombre?.toLowerCase().includes(t) || p.categoria?.toLowerCase().includes(t));
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
  load() { this.api.getProductos().subscribe(r => { this.allData = r; this.currentPage = 1; }); }
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
  openForm() { this.showForm = true; this.showErrors = false; this.isEditing = false; this.editItem = {} as Producto; }
  // Cierra el formulario sin guardar
  cancelForm() { this.showForm = false; this.showErrors = false; this.isEditing = false; this.editItem = {} as Producto; }

  // Carga un registro en el formulario para editar
  edit(p: Producto) { this.editItem = { ...p }; this.showForm = true; this.isEditing = true; this.showErrors = false; }

  // Valida que los campos requeridos estén completos
  isValid(): boolean {
    this.showErrors = true;
    return !!(this.editItem.nombre && this.editItem.categoria && this.editItem.precioCompra > 0 && this.editItem.precioVenta > 0);
  }

  // Guarda o actualiza un producto
  save() {
    if (!this.isValid()) return;
    this.errorMsg = '';
    const req = this.isEditing ? this.api.updateProducto(this.editItem.id, this.editItem) : this.api.createProducto(this.editItem);
    req.subscribe({ next: () => { this.load(); this.cancelForm(); }, error: (e) => { this.errorMsg = e.error?.message || e.message || 'Error al guardar'; } });
  }

  // Elimina un producto tras confirmación
  delete(id: number) { if (confirm('¿Eliminar producto?')) this.api.deleteProducto(id).subscribe(() => this.load()); }
}
