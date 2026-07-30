import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Categoria } from '../../models/models';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Categorías</h1>
    <div class="toolbar">
      <input class="search-box" type="text" [(ngModel)]="searchText" (input)="onSearch()" placeholder="Buscar categoría...">
      <button class="btn btn-primary" (click)="openForm()">+ Nueva Categoría</button>
    </div>
    <div class="card" *ngIf="showForm">
      <div class="form-group"><label>Nombre</label><input class="form-control" [(ngModel)]="editItem.nombre"></div>
      <div class="form-group"><label>Descripción</label><input class="form-control" [(ngModel)]="editItem.descripcion"></div>
      <button class="btn btn-primary" (click)="save()">{{ isEditing ? 'Actualizar' : 'Guardar' }}</button>
      <button class="btn btn-secondary" (click)="cancelForm()" style="margin-left:10px;">Cancelar</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th (click)="sortBy('nombre')">Nombre <span class="sort-arrow">{{ sortIcon('nombre') }}</span></th>
            <th (click)="sortBy('descripcion')">Descripción <span class="sort-arrow">{{ sortIcon('descripcion') }}</span></th>
            <th>Acciones</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let c of paginatedData">
              <td>{{ c.nombre }}</td><td>{{ c.descripcion }}</td>
              <td class="actions">
                <button class="btn btn-warning btn-sm" (click)="edit(c)">Editar</button>
                <button class="btn btn-danger btn-sm" (click)="delete(c.id)">Eliminar</button>
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
export class CategoriasComponent implements OnInit {
  allData: Categoria[] = [];     // Todas las categorías cargadas
  searchText = '';               // Término de búsqueda
  sortColumn = '';               // Columna de ordenamiento actual
  sortDir = 'asc';               // Dirección del ordenamiento
  currentPage = 1;               // Página actual de la paginación
  pageSize = 10;                 // Elementos por página
  showForm = false;              // Controla visibilidad del formulario
  isEditing = false;             // Indica si se está editando
  editItem: Categoria = {} as Categoria;  // Categoría en edición

  constructor(private api: ApiService) {}
  // Inicializa la carga de datos
  ngOnInit() { this.load(); }

  // Filtra y ordena los datos según búsqueda y columna
  get filteredData() {
    let data = this.allData;
    if (this.searchText) {
      const t = this.searchText.toLowerCase();
      data = data.filter(c => c.nombre?.toLowerCase().includes(t) || c.descripcion?.toLowerCase().includes(t));
    }
    if (this.sortColumn) {
      data.sort((a: any, b: any) => {
        const va = a[this.sortColumn] ?? '', vb = b[this.sortColumn] ?? '';
        return String(va).localeCompare(String(vb));
      });
      if (this.sortDir === 'desc') data.reverse();
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
  load() { this.api.getCategorias().subscribe(r => { this.allData = r; this.currentPage = 1; }); }
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
  openForm() { this.showForm = true; this.isEditing = false; this.editItem = {} as Categoria; }
  // Cierra el formulario sin guardar
  cancelForm() { this.showForm = false; this.isEditing = false; this.editItem = {} as Categoria; }
  // Carga un registro en el formulario para editar
  edit(c: Categoria) { this.editItem = { ...c }; this.showForm = true; this.isEditing = true; }

  // Guarda o actualiza una categoría
  save() {
    if (this.isEditing) {
      this.api.updateCategoria(this.editItem.id, this.editItem).subscribe(() => { this.load(); this.cancelForm(); });
    } else {
      this.api.createCategoria(this.editItem).subscribe(() => { this.load(); this.cancelForm(); });
    }
  }

  // Elimina una categoría tras confirmación
  delete(id: number) { if (confirm('¿Eliminar categoría?')) this.api.deleteCategoria(id).subscribe(() => this.load()); }
}
