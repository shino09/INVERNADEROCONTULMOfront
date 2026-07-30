import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AsientoContable, LibroMayor } from '../../models/models';

@Component({
  selector: 'app-contabilidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Contabilidad</h1>
    <div class="card">
      <h3>Libro Diario</h3>
      <div style="display:flex;gap:10px;margin:10px 0;">
        <input class="form-control" type="date" [(ngModel)]="desde" placeholder="Desde">
        <input class="form-control" type="date" [(ngModel)]="hasta" placeholder="Hasta">
        <button class="btn btn-primary" (click)="loadDiario()">Consultar</button>
        <button class="btn btn-secondary" (click)="downloadDiario()">PDF</button>
      </div>
      <table>
        <thead><tr><th>Fecha</th><th>Asiento</th><th>Cuenta</th><th>Descripción</th><th>Debe</th><th>Haber</th></tr></thead>
        <tbody>
          <tr *ngFor="let a of libroDiario">
            <td>{{ a.fechaAsiento | date:'short' }}</td><td>{{ a.numeroAsiento }}</td><td>{{ a.cuentaContable }}</td>
            <td>{{ a.descripcion }}</td><td>S/ {{ a.debe }}</td><td>S/ {{ a.haber }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="card" style="margin-top:20px;">
      <h3>Libro Mayor</h3>
      <div style="display:flex;gap:10px;margin:10px 0;">
        <input class="form-control" type="date" [(ngModel)]="desdeMayor" placeholder="Desde">
        <input class="form-control" type="date" [(ngModel)]="hastaMayor" placeholder="Hasta">
        <button class="btn btn-primary" (click)="loadMayor()">Consultar</button>
        <button class="btn btn-secondary" (click)="downloadMayor()">PDF</button>
      </div>
      <div *ngFor="let c of libroMayor" style="margin-bottom:15px;">
        <h4 style="background:#e8f5e9;padding:8px;">{{ c.cuenta }}</h4>
        <p>Debe: S/ {{ c.saldoDebe }} | Haber: S/ {{ c.saldoHaber }} | Saldo: S/ {{ c.saldoFinal }}</p>
        <table><thead><tr><th>Fecha</th><th>Asiento</th><th>Descripción</th><th>Debe</th><th>Haber</th></tr></thead>
        <tbody>
          <tr *ngFor="let m of c.movimientos">
            <td>{{ m.fechaAsiento | date:'short' }}</td><td>{{ m.numeroAsiento }}</td><td>{{ m.descripcion }}</td>
            <td>S/ {{ m.debe }}</td><td>S/ {{ m.haber }}</td>
          </tr>
        </tbody></table>
      </div>
    </div>
  `
})
export class ContabilidadComponent implements OnInit {
  libroDiario: AsientoContable[] = [];  // Asientos del libro diario
  libroMayor: LibroMayor[] = [];        // Cuentas del libro mayor
  desde = ''; hasta = '';               // Filtro de fechas para libro diario
  desdeMayor = ''; hastaMayor = '';     // Filtro de fechas para libro mayor
  constructor(private api: ApiService) {}
  // Carga el libro diario al iniciar el componente
  ngOnInit() { this.loadDiario(); }
  // Consulta el libro diario con filtro de fechas
  loadDiario() { this.api.getLibroDiario(this.desde || undefined, this.hasta || undefined).subscribe(r => this.libroDiario = r as AsientoContable[]); }
  // Consulta el libro mayor con filtro de fechas
  loadMayor() { this.api.getLibroMayor(this.desdeMayor || undefined, this.hastaMayor || undefined).subscribe(r => this.libroMayor = r as LibroMayor[]); }
  // Descarga el libro diario en PDF
  downloadDiario() { this.api.getLibroDiario(this.desde || undefined, this.hasta || undefined, 'pdf').subscribe(blob => window.open(window.URL.createObjectURL(blob))); }
  // Descarga el libro mayor en PDF
  downloadMayor() { this.api.getLibroMayor(this.desdeMayor || undefined, this.hastaMayor || undefined, 'pdf').subscribe(blob => window.open(window.URL.createObjectURL(blob))); }
}
