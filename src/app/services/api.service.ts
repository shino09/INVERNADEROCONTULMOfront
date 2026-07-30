import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LoginRequest, LoginResponse, Usuario, Producto, Cliente, Categoria, Proveedor,
  Venta, Pedido, Compra, AsientoContable, LibroMayor
} from '../models/models';

const API = 'http://localhost:5090/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Inicia sesión con credenciales del usuario
  login(dto: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/auth/login`, dto);
  }

  // Obtiene todos los usuarios del sistema
  getUsuarios(): Observable<Usuario[]> { return this.http.get<Usuario[]>(`${API}/usuarios`); }
  // Crea un nuevo usuario
  createUsuario(u: Usuario): Observable<Usuario> { return this.http.post<Usuario>(`${API}/usuarios`, u); }

  // Obtiene todos los productos del inventario
  getProductos(): Observable<Producto[]> { return this.http.get<Producto[]>(`${API}/productos`); }
  // Obtiene un producto por su ID
  getProducto(id: number): Observable<Producto> { return this.http.get<Producto>(`${API}/productos/${id}`); }
  // Crea un nuevo producto
  createProducto(p: Producto): Observable<Producto> { return this.http.post<Producto>(`${API}/productos`, p); }
  // Actualiza un producto existente
  updateProducto(id: number, p: Producto): Observable<Producto> { return this.http.put<Producto>(`${API}/productos/${id}`, p); }
  // Elimina un producto del sistema
  deleteProducto(id: number): Observable<any> { return this.http.delete(`${API}/productos/${id}`); }

  // Obtiene todos los clientes registrados
  getClientes(): Observable<Cliente[]> { return this.http.get<Cliente[]>(`${API}/clientes`); }
  // Obtiene un cliente por su ID
  getCliente(id: number): Observable<Cliente> { return this.http.get<Cliente>(`${API}/clientes/${id}`); }
  // Crea un nuevo cliente
  createCliente(c: Cliente): Observable<Cliente> { return this.http.post<Cliente>(`${API}/clientes`, c); }
  // Actualiza un cliente existente
  updateCliente(id: number, c: Cliente): Observable<Cliente> { return this.http.put<Cliente>(`${API}/clientes/${id}`, c); }
  // Elimina un cliente del sistema
  deleteCliente(id: number): Observable<any> { return this.http.delete(`${API}/clientes/${id}`); }

  // Obtiene todas las ventas realizadas
  getVentas(): Observable<Venta[]> { return this.http.get<Venta[]>(`${API}/ventas`); }
  // Obtiene una venta por su ID
  getVenta(id: number): Observable<Venta> { return this.http.get<Venta>(`${API}/ventas/${id}`); }
  // Registra una nueva venta con sus detalles
  createVenta(dto: any): Observable<Venta> { return this.http.post<Venta>(`${API}/ventas`, dto); }
  // Descarga la factura de una venta en PDF
  getFactura(id: number): Observable<Blob> { return this.http.get(`${API}/ventas/${id}/factura`, { responseType: 'blob' }); }

  // Obtiene todos los pedidos registrados
  getPedidos(): Observable<Pedido[]> { return this.http.get<Pedido[]>(`${API}/pedidos`); }
  // Obtiene un pedido por su ID
  getPedido(id: number): Observable<Pedido> { return this.http.get<Pedido>(`${API}/pedidos/${id}`); }
  // Crea un nuevo pedido
  createPedido(dto: any): Observable<Pedido> { return this.http.post<Pedido>(`${API}/pedidos`, dto); }
  // Actualiza el estado de un pedido
  updatePedidoEstado(id: number, estado: string): Observable<Pedido> { return this.http.put<Pedido>(`${API}/pedidos/${id}/estado`, `"${estado}"`, { headers: { 'Content-Type': 'application/json' } }); }

  // Obtiene todas las compras realizadas
  getCompras(): Observable<Compra[]> { return this.http.get<Compra[]>(`${API}/compras`); }
  // Crea una nueva compra con sus detalles
  createCompra(dto: any): Observable<Compra> { return this.http.post<Compra>(`${API}/compras`, dto); }

  // Obtiene todos los asientos contables
  getAsientos(): Observable<AsientoContable[]> { return this.http.get<AsientoContable[]>(`${API}/contabilidad/asientos`); }
  // Consulta el libro diario con filtros opcionales
  getLibroDiario(desde?: string, hasta?: string, format?: string): Observable<any> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    if (format) params = params.set('format', format);
    const opts: any = { params };
    if (format === 'pdf') opts.responseType = 'blob';
    return this.http.get(`${API}/contabilidad/libro-diario`, opts);
  }
  // Consulta el libro mayor con filtros opcionales
  getLibroMayor(desde?: string, hasta?: string, format?: string): Observable<any> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    if (format) params = params.set('format', format);
    const opts: any = { params };
    if (format === 'pdf') opts.responseType = 'blob';
    return this.http.get(`${API}/contabilidad/libro-mayor`, opts);
  }

  // Obtiene todas las categorías
  getCategorias(): Observable<Categoria[]> { return this.http.get<Categoria[]>(`${API}/categorias`); }
  // Crea una nueva categoría
  createCategoria(c: Categoria): Observable<Categoria> { return this.http.post<Categoria>(`${API}/categorias`, c); }
  // Actualiza una categoría existente
  updateCategoria(id: number, c: Categoria): Observable<Categoria> { return this.http.put<Categoria>(`${API}/categorias/${id}`, c); }
  // Elimina una categoría
  deleteCategoria(id: number): Observable<any> { return this.http.delete(`${API}/categorias/${id}`); }

  // Obtiene todos los proveedores
  getProveedores(): Observable<Proveedor[]> { return this.http.get<Proveedor[]>(`${API}/proveedores`); }
  // Crea un nuevo proveedor
  createProveedor(p: Proveedor): Observable<Proveedor> { return this.http.post<Proveedor>(`${API}/proveedores`, p); }
  // Actualiza un proveedor existente
  updateProveedor(id: number, p: Proveedor): Observable<Proveedor> { return this.http.put<Proveedor>(`${API}/proveedores/${id}`, p); }
  // Elimina un proveedor
  deleteProveedor(id: number): Observable<any> { return this.http.delete(`${API}/proveedores/${id}`); }
}
