import { Routes } from '@angular/router';
import { AuthGuard, AdminGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductosComponent } from './components/productos/productos.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { ComprasComponent } from './components/compras/compras.component';
import { ContabilidadComponent } from './components/contabilidad/contabilidad.component';
import { CategoriasComponent } from './components/categorias/categorias.component';
import { ProveedoresComponent } from './components/proveedores/proveedores.component';

// Configuración de rutas de la aplicación
export const routes: Routes = [
  { path: 'login', component: LoginComponent },                           // Página de inicio de sesión
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },  // Panel principal
  { path: 'productos', component: ProductosComponent, canActivate: [AuthGuard] },  // Gestión de productos
  { path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard] },    // Gestión de clientes
  { path: 'ventas', component: VentasComponent, canActivate: [AuthGuard] },        // Módulo de ventas
  { path: 'pedidos', component: PedidosComponent, canActivate: [AuthGuard] },       // Módulo de pedidos
  { path: 'compras', component: ComprasComponent, canActivate: [AuthGuard] },       // Módulo de compras
  { path: 'categorias', component: CategoriasComponent, canActivate: [AuthGuard] },       // Gestión de categorías
  { path: 'proveedores', component: ProveedoresComponent, canActivate: [AuthGuard] },    // Gestión de proveedores
  { path: 'contabilidad', component: ContabilidadComponent, canActivate: [AuthGuard] }, // Módulo contable
  { path: '', redirectTo: '/login', pathMatch: 'full' },                    // Redirección por defecto
  { path: '**', redirectTo: '/login' }                                      // Ruta comodín para páginas no encontradas
];
