// Usuario del sistema
export interface Usuario {
  id: number;         // Identificador único
  nombre: string;     // Nombre completo
  email: string;      // Correo electrónico
  rol: string;        // Rol del usuario
  activo: boolean;    // Estado activo/inactivo
  fechaCreacion: Date; // Fecha de registro
}

// Credenciales de inicio de sesión
export interface LoginRequest {
  email: string;
  password: string;
}

// Respuesta del servidor al iniciar sesión
export interface LoginResponse {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  token: string;    // Token JWT de autenticación
}

// Producto del inventario
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precioCompra: number; // Precio de adquisición
  precioVenta: number;  // Precio de venta al público
  stockActual: number;  // Stock disponible
  stockMinimo: number;  // Stock mínimo permitido
  categoria: string;
  activo: boolean;
}

// Cliente registrado en el sistema
export interface Cliente {
  id: number;
  nombre: string;
  documento: string;  // Número de documento
  email: string;
  telefono: string;
  direccion: string;
  activo: boolean;
}

// Venta realizada a un cliente
export interface Venta {
  id: number;
  numeroFactura: string;
  clienteId: number;
  cliente: Cliente;
  subtotal: number;
  impuesto: number;
  total: number;
  metodoPago: string;
  fechaVenta: Date;
  detalles: DetalleVenta[];
}

// Detalle individual de una venta
export interface DetalleVenta {
  id: number;
  productoId: number;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// Pedido realizado por un cliente
export interface Pedido {
  id: number;
  numeroPedido: string;
  clienteId: number;
  cliente: Cliente;
  estado: string;     // Pendiente, Aprobado, Entregado
  total: number;
  fechaPedido: Date;
  detalles: DetallePedido[];
}

// Detalle individual de un pedido
export interface DetallePedido {
  id: number;
  productoId: number;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// Compra realizada a un proveedor
export interface Compra {
  id: number;
  numeroCompra: string;
  proveedor: string;
  total: number;
  fechaCompra: Date;
  detalles: DetalleCompra[];
}

// Detalle individual de una compra
export interface DetalleCompra {
  id: number;
  productoId: number;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// Asiento contable del libro diario
export interface AsientoContable {
  id: number;
  numeroAsiento: string;
  descripcion: string;
  fechaAsiento: Date;
  debe: number;
  haber: number;
  cuentaContable: string;
  tipoAsiento: string;
}

// Proveedor registrado en el sistema
export interface Proveedor {
  id: number;
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  contacto: string;
  activo: boolean;
}

// Categoría de productos
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

// Cuenta del libro mayor con sus movimientos
export interface LibroMayor {
  cuenta: string;
  saldoDebe: number;
  saldoHaber: number;
  saldoFinal: number;
  movimientos: AsientoContable[];
}
