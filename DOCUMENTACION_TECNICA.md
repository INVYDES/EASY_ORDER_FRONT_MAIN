# DOCUMENTACIÓN TÉCNICA - EASY ORDER

Sistema de Gestión Restaurantera (RMS) con módulos de POS, Cocina, Barra, Meseros, Menú Digital y Administración.

---

## ÍNDICE

1. [ARQUITECTURA GENERAL](#1-arquitectura-general)
2. [FRONTEND (Vue 3 + TypeScript)](#2-frontend)
   - 2.1 [Estructura del proyecto](#21-estructura-del-proyecto)
   - 2.2 [Rutas y Router](#22-rutas-y-router)
   - 2.3 [Stores (Pinia)](#23-stores-pinia)
   - 2.4 [Vistas](#24-vistas)
   - 2.5 [Componentes](#25-componentes)
   - 2.6 [Composables](#26-composables)
   - 2.7 [Configuración y Plugins](#27-configuración-y-plugins)
   - 2.8 [WebSockets (Laravel Echo + Reverb)](#28-websockets)
   - 2.9 [Estilos (Tailwind CSS)](#29-estilos)
3. [BACKEND (Laravel 12)](#3-backend)
   - 3.1 [Estructura del proyecto](#31-estructura-del-proyecto)
   - 3.2 [Modelos y Base de Datos](#32-modelos-y-base-de-datos)
   - 3.3 [API Routes](#33-api-routes)
   - 3.4 [Controladores](#34-controladores)
   - 3.5 [Autenticación y Autorización](#35-autenticación-y-autorización)
   - 3.6 [Middleware](#36-middleware)
   - 3.7 [Eventos y Broadcasting](#37-eventos-y-broadcasting)
   - 3.8 [Servicios](#38-servicios)
   - 3.9 [Traits y Helpers](#39-traits-y-helpers)
   - 3.10 [Políticas (Policies)](#310-políticas)
4. [DESPLIEGUE](#4-despliegue)
5. [VARIABLES DE ENTORNO](#5-variables-de-entorno)

---

## 1. ARQUITECTURA GENERAL

Easy Order es una aplicación SPA (Single Page Application) con frontend en Vue 3 y backend en Laravel 12, comunicados via API REST JSON y WebSockets (Laravel Reverb).

```
[Cliente Navegador/App]
       ↕ HTTP/JSON + WSS
[Frontend Vue 3 + Vite]
       ↕ API REST
[Backend Laravel 12]
       ↕
[Base de Datos MySQL/MariaDB]
```

### Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Vue 3 | 3.5+ |
| Lenguaje | TypeScript | 5.9 |
| Build | Vite | 7.x |
| Estilos | Tailwind CSS | 4.x |
| Estado | Pinia | 3.x |
| Router | Vue Router | 4.x |
| WebSockets (cliente) | Laravel Echo + Pusher JS | 2.x / 8.x |
| Backend | Laravel | 12.x |
| PHP | PHP | 8.2+ |
| WS Server | Laravel Reverb | * |
| Auth | Laravel Sanctum | 4.x |
| Pagos | Mercado Pago SDK | 3.x |
| Gráficas | ApexCharts, Chart.js | 5.x |

---

## 2. FRONTEND

### 2.1 Estructura del Proyecto

```
EASY_ORDER_FRONT_MAIN/
├── src/
│   ├── assets/              # Recursos estáticos (imágenes, etc.)
│   ├── components/          # Componentes reutilizables
│   │   ├── administraccion/ # Componentes del panel de admin
│   │   ├── bebida/          # Componentes del módulo de barra/bebidas
│   │   ├── caja/            # Componentes del módulo de caja (POS)
│   │   ├── chat/            # Widget de chatbot
│   │   ├── cliente/         # Componentes del menú cliente
│   │   ├── cocina/          # Componentes del módulo de cocina
│   │   ├── ingredientes/    # Componentes de gestión de ingredientes
│   │   ├── layout/          # Layout principal (AppSidebar, AppHeader, PanelLayout)
│   │   ├── menu/            # Componentes del kiosko menú
│   │   ├── mesero/          # Componentes del módulo mesero
│   │   ├── panel/           # Componentes de ventas rápidas
│   │   ├── pickup/          # Componentes del módulo pickup (para llevar)
│   │   ├── postres/         # Componentes del módulo de postres
│   │   ├── productos/       # Componentes de gestión de productos
│   │   └── ui/              # Componentes UI genéricos (tabs, spinners, toasts)
│   ├── composables/         # Composables de Vue (lógica reutilizable)
│   ├── config/              # Configuración (API, headers, constantes)
│   ├── data/                # Datos mock para desarrollo
│   ├── plugins/             # Plugins (Echo, interceptors)
│   ├── router/              # Configuración de Vue Router
│   ├── stores/              # Stores de Pinia (estado global)
│   ├── types/               # Tipos TypeScript
│   └── views/               # Vistas principales
│       ├── Auth/            # Vistas de autenticación
│       └── Legal/           # Vistas legales (términos, privacidad)
├── .env                     # Variables de entorno
├── deploy.bat               # Script de despliegue
├── vite.config.ts           # Configuración de Vite
├── tailwind.config.js       # Configuración de Tailwind CSS
└── tsconfig.json            # Configuración de TypeScript
```

### 2.2 Rutas y Router

**Archivo:** `src/router/index.ts`

El router utiliza `createWebHistory` y lazy loading con `() => import(...)` para todas las rutas.

#### Rutas Públicas

| Path | Nombre | Componente | Descripción |
|------|--------|-----------|-------------|
| `/` | `login` | `Auth/signin.vue` | Login general |
| `/registro/dueno` | `registro-dueno` | `Auth/signup.vue` | Registro de propietario |
| `/registro/cliente` | `registro-cliente` | `Auth/siginupCliente.vue` | Registro de cliente |
| `/recuperar-contrasena` | `forgot-password` | `Auth/Forgotpassword.vue` | Recuperar contraseña |
| `/reset-password` | `reset-password` | `Auth/ResetPassword.vue` | Resetear contraseña |
| `/terminos-y-condiciones` | `Terms` | `Legal/TermsView.vue` | Términos y condiciones |

#### Rutas sin Sidebar

| Path | Nombre | Roles | Componente |
|------|--------|-------|-----------|
| `/menu` | `menu` | MENU, ADMIN, PROPIETARIO | `menuview.vue` |
| `/pickup` | `pickup` | PICKUP, CLIENTE, ADMIN, PROPIETARIO | `pickupview.vue` |

#### Rutas Protegidas (con Sidebar - `/panel`)

| Path | Nombre | Roles | Componente |
|------|--------|-------|-----------|
| `/panel/mesero` | `mesero` | MESERO, ADMIN, PROPIETARIO | `meserosview.vue` |
| `/panel/cliente` | `cliente` | CLIENTE | `clienteview.vue` |
| `/panel/Gestion` | `Gestion` | ADMIN, PROPIETARIO | `administraccionview.vue` |
| `/panel/caja` | `caja` | CAJA, ADMIN, PROPIETARIO | `cajaviews.vue` |
| `/panel/analisis` | `analisis` | ADMIN, PROPIETARIO | `Analisisview.vue` |
| `/panel/cocina` | `cocina` | COCINA, ADMIN, PROPIETARIO | `cocinaview.vue` |
| `/panel/postres` | `postres` | COCINA, ADMIN, PROPIETARIO | `postresview.vue` |
| `/panel/productos` | `productos` | ADMIN, PROPIETARIO | `productosview.vue` |
| `/panel/barra` | `barra` | BARRA, COCINA, ADMIN, PROPIETARIO | `barraview.vue` |
| `/panel/perfil` | `perfil` | Todos los autenticados | `Perfilview.vue` |
| `/panel/licencias` | `licencias` | PROPIETARIO, ADMIN | `LicenciasView.vue` |
| `/panel/nomina` | `nomina` | PROPIETARIO, ADMIN | `NominaView.vue` |
| `/panel/plataforma` | `plataforma` | SUPER_ADMIN | `PlataformaView.vue` |

#### Router Guard (beforeEach)

El guard principal en `src/router/index.ts:210`:
1. Si hay token y va a login (`/`), redirige a su ruta por defecto según rol
2. Si es ruta pública, permite acceso
3. Si no hay token, redirige a login
4. Si la ruta tiene `meta.roles`, verifica que el usuario tenga al menos uno

**Mapa de rutas por defecto según rol:**
```
MESERO → /panel/mesero
COCINA → /panel/cocina
CAJA → /panel/caja
BARRA → /panel/barra
MENU → /menu
PICKUP → /pickup
ADMIN → /panel/Gestion
PROPIETARIO → /panel/Gestion
CLIENTE → /panel/cliente
SUPER_ADMIN → /panel/plataforma
```

### 2.3 Stores (Pinia)

#### `useCajaStore` (`src/stores/caja.ts`)
- **State:** `tickets`, `openingAmount`, `movements`, `closures`, `isOpen`
- **Getters:** `openTickets`, `closedTickets`, `dailySales`, `cashInRegister`, `salesByCard`, `salesByTransfer`
- **Actions:** `addOrderToCaja`, `setOpeningAmount`, `opencaja`, `closeTicket`, `registerPayment`, `closeRegister`
- **Nota:** `isOpen` bloquea todas las operaciones cuando la caja está cerrada

#### `useOrderStore` (`src/stores/orden.ts`)
- **State:** `items` (Product + quantity + note), `table`
- **Getters:** `total`
- **Actions:** `addItem`, `removeItem`, `increaseQuantity`, `decreaseQuantity`, `updateNote`, `sendOrder`
- **Integración:** Usa `useMeseroStore` para enviar órdenes, `useProductsStore` para manejo de stock

#### `useProductsStore` (`src/stores/productos.ts`)
- **State:** `products` (Product[]), `search`
- **Getters:** `filteredProducts`
- **Actions:** `addProduct`, `updateProduct`, `deleteProduct`, `decreaseStock`, `increaseStock`
- **Interface Product:** `{ id, name, description, price, category, stock }`

#### `useMeseroStore` (`src/stores/mesero.ts`)
- **State:** `orders` (WaiterOrder[])
- **Actions:** `addOrder`, `removeOrderItem`, `updateOrderItemNote`, `confirmOrder`
- **Integración:** Al confirmar orden, despacha a cocina (`useKitchenStore`), barra (`useBarraStore`) y caja (`useCajaStore`) según categoría de cada item

#### `useKitchenStore` (`src/stores/cocina.ts`)
- **State:** `orders` (cualquiera)
- **Getters:** `pendingOrders`, `preparingOrders`, `readyOrders`
- **Actions:** `addOrder`, `startPreparing`, `markAsReady`

#### `useBarraStore` (`src/stores/barra.ts`)
- **State:** `orders` (cualquiera)
- **Getters:** `pendingOrders`, `preparingOrders`, `readyOrders`
- **Actions:** `addOrder`, `startPreparing`, `markAsReady`
- **Nota:** Misma estructura que `useKitchenStore`

#### `useThemeStore` (`src/stores/theme.ts`)
- **State:** `isDark`, `systemPrefersDark` (refs)
- **Actions:** `init`, `destroy`, `toggle`
- **Persistencia:** Guarda preferencia en `localStorage('theme')`

### 2.4 Vistas

#### Módulo de Autenticación (`src/views/Auth/`)

| Archivo | Descripción |
|---------|-------------|
| `signin.vue` | Login con email o código de empleado. Redirige según rol |
| `signup.vue` | Registro de propietario con datos personales y primer restaurante |
| `siginupCliente.vue` | Registro de cliente (nombre, email, teléfono, password) |
| `Forgotpassword.vue` | Solicitud de recuperación de contraseña |
| `ResetPassword.vue` | Reset de contraseña con token |

#### Módulo Mesero (`meserosview.vue`)
- Mapa de mesas (componente `TableMap.vue`)
- Gestión de órdenes por mesa
- Despacho a cocina/barra/caja
- Temporizadores por estación

#### Módulo Caja POS (`cajaviews.vue`)
- Header con estado de caja (abierta/cerrada)
- Grid de tickets activos
- Modal de apertura/cierre de caja
- Corte (X report) imprimible
- Modal de pagos (efectivo, tarjeta, transferencia, PayPal, Mercado Pago)
- Historial de cierres
- KPIs de caja

#### Módulo Cocina (`cocinaview.vue`)
- Tablero Kanban con 3 columnas: Pendiente → Preparando → Listo
- Modal de consumo de ingredientes al marcar como preparando
- Órdenes con carta de productos

#### Módulo Barra (`barraview.vue`)
- Tablero Kanban igual que cocina pero para bebidas
- OrdenCard específica para bebidas

#### Módulo Postres (`postresview.vue`)
- Kanban para postres

#### Módulo Administración (`administraccionview.vue`)
- Sistema de tabs:
  1. **Resumen** - Dashboard con KPIs, gráficas de ventas, pedidos, canales, métodos de pago
  2. **Sucursales y Personal** - CRUD de empleados, restaurantes, roles, sesiones
  3. **Meseros** - Gestión de meseros con métricas
  4. **Nóminas** - CRUD de nóminas con cálculo automático
  5. **Gastos** - Registro y filtrado de gastos
  6. **Financiero** - Configuración financiera (inversión inicial, meta de ganancia, costos fijos)

#### Módulo Productos (`productosview.vue`)
- Tabla de productos con CRUD
- Gestión de categorías
- Gestión de paquetes
- Gestión de ingredientes y stock
- Gestión de ofertas
- Importación/exportación de productos

#### Módulo Analíticas (`Analisisview.vue`)
- Dashboard con vistas:
  - **Resumen:** KPIs del día, ventas por hora, tendencia semanal, pedidos por estado, canales de venta, métodos de pago, top productos
  - **Financiero:** ROI, márgenes de ganancia, punto de equilibrio
  - **KPIs Ventas:** Métricas de ventas con selector de periodo
  - **KPIs Productos:** KPIs por producto con exportación PDF/Excel
  - **KPIs Empleados:** Métricas de meseros, cocina y caja

#### Otras Vistas
- `menuview.vue` - Kiosko de menú digital con carrito de compras
- `pickupview.vue` - Pedidos para llevar
- `Perfilview.vue` - Perfil de usuario y configuración
- `LicenciasView.vue` - Gestión de licencias y suscripciones
- `PlataformaView.vue` - Panel SUPER_ADMIN (dueños, estadísticas globales)
- `RoiView.vue` - ROI detallado
- `FinancieroView.vue` - Estado financiero
- `GastoView.vue` - Gestión de gastos
- `IngredientesView.vue` - Inventario de ingredientes
- `anunciosview.vue` - Gestión de anuncios (marquesina)
- `panelincialviews.vue` - Panel de inicio (layout wrapper)
- `Panelinicialview2.vue` - Versión alternativa del panel

### 2.5 Componentes

#### Layout (`src/components/layout/`)

| Componente | Descripción |
|-----------|-------------|
| `AppSidebar.vue` | Barra lateral con navegación, selector de sucursal, perfil de usuario, logout. Colapsable en desktop |
| `AppHeader.vue` | Encabezado superior con migas de pan, búsqueda, notificaciones |
| `PanelLayout.vue` | Layout principal que combina Sidebar + Header + contenido |

#### Caja (`src/components/caja/`)

| Componente | Descripción |
|-----------|-------------|
| `CajaHeader.vue` | Encabezado con estado de caja, totales y acciones |
| `CajaAcciones.vue` | Botones de acción (abrir, cerrar, corte, historial) |
| `cajatiketgrid.vue` | Grid de tickets activos |
| `cajatiketcard.vue` | Card individual de ticket |
| `OpenCajaModal.vue` | Modal para apertura de caja (monto inicial) |
| `CloseCajaModal.vue` | Modal para cierre de caja (conteo final, diferencias) |
| `CorteXModal.vue` | Modal de corte X (reporte parcial) |
| `paymentModal.vue` | Modal de procesamiento de pago |
| `CajaMovimientoModal.vue` | Modal para registrar movimientos manuales |
| `CajaHistorial.vue` | Historial de cierres de caja |
| `CajaPropinas.vue` | Gestión de propinas |
| `Cajakpis.vue` | KPIs de caja |
| `CajaDetalleModal.vue` | Detalle de un ticket |
| `CajaFlowTable.vue` | Tabla de flujo de caja |
| `CajaCorteImprimible.vue` | Versión imprimible del corte |

#### Cocina (`src/components/cocina/`)

| Componente | Descripción |
|-----------|-------------|
| `kanbanColumn.vue` | Columna del tablero Kanban (Pendiente/Preparando/Listo) |
| `kitchencard.vue` | Card de orden en cocina |
| `Ordencardcocina.vue` | Card de orden con detalles para cocina |

#### Bebida/Barra (`src/components/bebida/`)

| Componente | Descripción |
|-----------|-------------|
| `bebidacard.vue` | Card de bebida |
| `columnbebida.vue` | Columna Kanban para bebidas |
| `Ordencardbebida.video` | Card de orden para barra |

#### Cliente (`src/components/cliente/`)

| Componente | Descripción |
|-----------|-------------|
| `productocard.vue` | Card de producto para menú cliente |
| `productogrid.vue` | Grid de productos (comida) |
| `productogridbebida.vue` | Grid de productos (bebida) |
| `sumaorden.vue` | Resumen de orden (carrito) |
| `Clientecheckoutmodal.vue` | Modal de checkout para cliente |

#### Productos (`src/components/productos/`)

| Componente | Descripción |
|-----------|-------------|
| `ProductsHeader.vue` | Encabezado con acciones (crear, importar, exportar) |
| `ProductsTable.vue` | Tabla de productos con filtros |
| `ProductFormModal.vue` | Modal de creación/edición de producto |
| `CategoriaModal.vue` | Modal de gestión de categorías |
| `PaqueteFormModal.vue` | Modal de creación/edición de paquetes |
| `PaquetesTable.vue` | Tabla de paquetes |
| `OfertaModal.vue` | Modal de creación/edición de ofertas |
| `IngredienteModal.vue` | Modal de ingrediente |
| `AjustesStockModal.vue` | Modal de ajuste de stock |

#### Administración (`src/components/administraccion/`)

| Componente | Descripción |
|-----------|-------------|
| `AdminTableroResumen.vue` | Tablero resumen de administración |
| `FormularioRestaurante.vue` | Formulario de creación/edición de restaurante |
| `FormularioTrabajador.vue` | Formulario de empleados |
| `MeserosManager.vue` | Gestión de meseros |
| `PermissionSelector.vue` | Selector de permisos para roles |
| `Dashboardkpis.vue` | Dashboard de KPIs |
| `KpiVentas.vue` | KPIs de ventas |
| `KpiProductos.vue` | KPIs de productos |
| `KpiMeserosModule.vue` | KPIs de meseros |
| `KpiCocinaModule.vue` | KPIs de cocina |
| `KpiCajaModule.vue` | KPIs de caja |
| `MetricasMeseros.vue` | Métricas detalladas de meseros |
| `FinancialMetricsGrid.vue` | Grid de métricas financieras |
| `TopProductosChart.vue` | Top productos más vendidos |
| `TopMarginList.vue` | Productos con mayor margen |
| `VentasSemanaChart.vue` | Ventas de la semana (gráfica) |
| `Ventasxhorachart.vue` | Ventas por hora |
| `PedidosEstadoChart.vue` | Pedidos por estado |
| `CanalVentasChart.vue` | Ventas por canal |
| `MetodopagoChart.vue` | Ventas por método de pago |
| `EmpleadosRolChart.vue` | Distribución de empleados por rol |
| `BundleStrategyCard.vue` | Recomendación de paquete estratégico |

#### Ingredientes (`src/components/ingredientes/`)

| Componente | Descripción |
|-----------|-------------|
| `IngredienteModal.vue` | Modal de ingrediente |
| `AjusteStockModal.vue` | Ajuste de stock de ingrediente |
| `ListaComprasModal.vue` | Lista de compras sugerida |

#### UI Genéricos (`src/components/ui/`)

| Componente | Descripción |
|-----------|-------------|
| `AppTabs.vue` | Componente de tabs reutilizable |
| `EmptyState.vue` | Estado vacío con mensaje |
| `LoadingSpinner.vue` | Spinner de carga |
| `ToastContainer.vue` | Contenedor de notificaciones toast |

#### Widgets

| Componente | Descripción |
|-----------|-------------|
| `AlertasStockWidget.vue` | Alertas de stock bajo |
| `Marquesitawidget.vue` | Widget de marquesina (anuncios) |
| `ChatBotWidget.vue` | Widget de chatbot/soporte |
| `SucursalBadge.vue` | Badge de sucursal activa |
| `Roichart.vue` | Gráfica de ROI |

### 2.6 Composables

#### `useRestauranteChannel` (`src/composables/useRestauranteChannel.ts`)
- **Propósito:** Conectar a canal privado de WebSocket por restaurante
- **Entrada:** `restauranteId` (Ref o valor directo), `callbacks` (`onOrden`, `onCaja`)
- **Retorno:** `{ conectado }` (ref reactiva)
- **Funcionamiento:**
  1. Carga `echo.ts` dinámicamente (lazy)
  2. Se suscribe a canal privado `restaurante.{id}`
  3. Escucha eventos `.orden.actualizada` y `.caja.actualizada`
  4. Se desconecta automáticamente al desmontar el componente o cambiar de restaurante

#### `useToast` (`src/composables/useToast.ts`)
- **Propósito:** Sistema de notificaciones toast
- **Funciones:** `show(message, type, duration)`, `success`, `error`, `warning`, `info`

#### `useDeviceZoom` (`src/composables/useDeviceZoom.ts`)
- **Propósito:** Detectar y ajustar zoom del dispositivo para responsive

### 2.7 Configuración y Plugins

#### API Config (`src/config/api.ts`)
```typescript
API_BASE_URL = cleanBase // Sin /api al final
API_URL = `${cleanBase}/api`
STORAGE_URL = `${base}/storage/`
getHeaders() // Retorna headers con Content-Type, Accept, Authorization Bearer, X-Restaurante-Id
```

#### Plugin Echo (`src/plugins/echo.ts`)
- Inicializa `window.Echo` con Laravel Reverb
- Usa `getToken()` dinámico (lee al momento de cada auth request)
- `authorizer` personalizado con fetch POST a `/broadcasting/auth`
- Configuración desde variables de entorno `VITE_REVERB_*`

#### Fetch Interceptor (`src/plugins/fetchInterceptor.ts`)
- Intercepta llamadas fetch globales
- Manejo de errores y logs

#### API Client (`src/plugins/apiClient.ts`)
- Cliente HTTP unificado con manejo de paginación
- Corrección de zona horaria
- Headers de autenticación

### 2.8 WebSockets

**Arquitectura de tiempo real:**

```
[Frontend Vue]              [Backend Laravel]          [Otros clientes]
     │                            │                        │
     │── subscribe private ──────►│                        │
     │    restaurante.{id}        │                        │
     │                            │                        │
     │◄──── orden.actualizada ────│── broadcast ──────────►│
     │◄──── caja.actualizada ─────│── broadcast ──────────►│
```

**Eventos del frontend:**
- `.orden.actualizada` - Cambios en órdenes (nueva, estado cambiado, pagada)
- `.caja.actualizada` - Cambios en caja (abierta, cerrada, movimiento)

### 2.9 Estilos

- **Framework:** Tailwind CSS 4.x
- **Archivo principal:** `src/index.css` con `@import "tailwindcss"`
- **Modo oscuro:** Soportado via clase `.dark` en `<html>`
- **Tema:** Almacenado en localStorage, sincronizado con preferencia del sistema
- **Íconos:** Font Awesome 7 (free)
- **Fuente:** Inter (configurada en Tailwind)

---

## 3. BACKEND

### 3.1 Estructura del Proyecto

```
EASY_ORDER_BACK_MAIN/
├── app/
│   ├── database/
│   │   ├── factories/       # Factory para tests
│   │   ├── migrations/      # Migraciones de BD
│   │   └── seeders/         # Seeders
│   ├── Events/              # Eventos de broadcasting
│   │   ├── OrdenActualizada.php
│   │   └── CajaActualizada.php
│   ├── Exports/             # Exportadores (reportes)
│   │   └── ReporteExport.php
│   ├── Helpers/             # Funciones auxiliares
│   │   └── StockHelper.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/         # Controladores de API
│   │   │   ├── Controller.php
│   │   │   └── VueController.php
│   │   ├── Middleware/      # Middleware personalizado
│   │   └── Resources/       # API Resources (transformers)
│   ├── Models/              # Modelos Eloquent
│   │   └── Traits/          # Traits de modelos
│   ├── Policies/            # Políticas de autorización
│   ├── Providers/           # Service Providers
│   ├── Scopes/              # Global Scopes (Tenant)
│   ├── Services/            # Servicios externos
│   │   ├── GeminiService.php
│   │   └── WhatsAppService.php
│   └── Traits/              # Traits generales
│       ├── BelongsToTenant.php  # Multi-tenancy
│       └── HandlesApiErrors.php # Manejo de errores API
├── config/                  # Configuración de Laravel
├── routes/
│   ├── api.php              # Rutas de API
│   ├── channels.php         # Canales de broadcasting
│   ├── console.php          # Comandos de consola
│   └── web.php              # Rutas web
├── public/                  # Punto de entrada
└── vendor/                  # Dependencias Composer
```

### 3.2 Modelos y Base de Datos

#### Lista Completa de Modelos

| Modelo | Tabla | Descripción |
|--------|-------|-------------|
| `User` | `users` | Usuarios del sistema (empleados, admins) |
| `Role` | `roles` | Roles del sistema (MESERO, COCINA, CAJA, etc.) |
| `Permission` | `permissions` | Permisos individuales |
| `Propietario` | `propietarios` | Dueños de restaurantes |
| `Restaurante` | `restaurantes` | Restaurantes/sucursales |
| `Cliente` | `clientes` | Clientes del restaurante |
| `Producto` | `productos` | Productos/menu items |
| `Categoria` | `categorias` | Categorías de productos |
| `Orden` | `ordenes` | Órdenes de venta |
| `OrdenDetalle` | `orden_detalles` | Detalle de cada orden |
| `Caja` | `cajas` | Sesiones de caja (apertura/cierre) |
| `CajaMovimientos` | `caja_movimientos` | Movimientos de caja |
| `Ingrediente` | `ingredientes` | Ingredientes/inventario |
| `Gasto` | `gastos` | Gastos operativos |
| `Oferta` | `ofertas` | Ofertas y promociones |
| `Anuncio` | `anuncios` | Anuncios (marquesina, promociones) |
| `Paquete` | `paquetes` | Paquetes/combinaciones |
| `Nomina` | `nominas` | Nóminas generadas |
| `NominaDetalle` | `nomina_detalles` | Detalle de nóminas |
| `Licencia` | `licencias` | Planes de licencia |
| `PropietarioLicencia` | `propietario_licencias` | Licencias asignadas |
| `LicenciaPermiso` | `licencia_permisos` | Permisos por licencia |
| `Log` | `logs` | Auditoría de acciones |
| `Ticket` | `tickets` | Tickets de soporte/chatbot |
| `Estacion` | `estaciones` | Estaciones de producción |
| `Asistencia` | `asistencias` | Asistencias de empleados |
| `SesionEmpleado` | `sesiones_empleados` | Sesiones de entrada/salida |
| `HorarioEmpleado` | `horarios_empleados` | Horarios laborales |
| `MesaMesero` | `mesa_mesero` | Asignación mesas-meseros |
| `ConfiguracionNomina` | `configuracion_nomina` | Configuración de nómina |
| `RoiConfig` | `roi_config` | Configuración de ROI |
| `CocinaConfig` | `cocina_config` | Configuración de cocina |
| `Satisfaccion` | `satisfaccion` | Encuestas de satisfacción |
| `LogsActivity` | (trait) | Log automático de actividad |

#### Modelos Principales - Detalle

**User** (`app/Models/User.php`)
- `HasApiTokens` (Sanctum), `Notifiable`, `SoftDeletes`
- Campos: `propietario_id`, `restaurante_activo`, `name`, `email`, `username`, `password`, `activo`, `telefono`, `tipo_empleado`, `salario_base`, `salario_por_hora`, `comision_por_venta`, `fecha_contratacion`, `en_linea`
- Relaciones: `propietario()`, `roles()`, `restauranteActivo()`, `restaurantes()`, `asistencias()`, `nominas()`, `horarios()`
- Métodos: `hasRole(roleName)`, `hasPermission(permission)`, `logAction(action, table, id, description)`
- Scopes: `activos()`, `inactivos()`

**Orden** (`app/Models/Orden.php`)
- `SoftDeletes`, `BelongsToTenant`
- Campos: `restaurante_id`, `cliente_id`, `usuario_id`, `mesa`, `tipo_orden` (local/pickup/delivery), `direccion_entrega`, `telefono_contacto`, `costo_envio`, `tiempo_estimado_entrega`, `metodo_pago`, `total`, `propina`, `estado`, `paypal_order_id`, `mercadopago_preference_id`, `lista_at`, `comision_pct`, `comision_monto`, `neto_depositar`, `programado_para`
- Estados: `ABIERTA`, `POR_PREPARAR`, `EN_PREPARACION`, `LISTA`, `ENTREGADA`, `CERRADA`, `PAGADA`, `CANCELADA`
- Métodos clave: `verificarYActualizarEstadoGlobal()` (actualiza estado según detalles), `recalcularTotal()`, `puedeCambiarEstado()`
- Accessors: `folio`, `total_formateado`, `estado_texto`, `estado_color`, `tipo_orden_texto`, `cantidad_productos`

**Producto** (`app/Models/Producto.php`)
- `BelongsToTenant`, `SoftDeletes`
- Campos: `restaurante_id`, `categoria_id`, `nombre`, `descripcion`, `precio`, `costo`, `stock`, `stock_minimo`, `minutos_produccion`, `nomina_diaria`, `activo`, `imagen`
- Relaciones: `categoria()`, `ingredientes()`, `ordenDetalles()`
- Accessors: `bajo_stock`, `agotado`, `estado_stock`, `precio_formateado`, `imagen_url`
- Método: `recalcularStockDesdeIngredientes()`
- Boot: Elimina imagen física al borrar/actualizar

**Cliente** (`app/Models/Cliente.php`)
- `BelongsToTenant`, `SoftDeletes`
- Campos: `restaurante_id`, `nombre`, `apellido`, `email`, `telefono`, `direccion`, `fecha_registro`, `total_compras`, `gasto_total`, `notas`, `activo`
- Relaciones: `restaurante()`, `ordenes()`

**Caja** (`app/Models/Caja.php`)
- `BelongsToTenant`
- Campos: `restaurante_id`, `usuario_apertura_id`, `usuario_cierre_id`, `fecha_apertura`, `fecha_cierre`, `monto_inicial`, `monto_final`, `ventas_efectivo`, `ventas_tarjeta`, `ventas_transferencia`, `ventas_paypal`, `ventas_mercadopago`, `total_ordenes`, `diferencia`, `observaciones_cierre`, `estado`
- Métodos: `isAbierta()`, `isCerrada()`, `calcularEfectivoEsperado()`

### 3.3 API Routes

**Archivo:** `routes/api.php` (524 líneas)

#### Estructura de grupos de rutas:

1. **Rutas Públicas** (sin autenticación)
   - `GET /server-time` - Hora del servidor
   - `POST /login` - Login general
   - `POST /register` - Registro
   - `POST /register-cliente` - Registro cliente
   - `POST /empleado/login` - Login con código de empleado
   - `POST /forgot-password` - Recuperar contraseña
   - `POST /reset-password` - Reset contraseña
   - `POST /propietarios` - Crear propietario
   - Webhooks: PayPal, Mercado Pago
   - `GET /anuncios` - Anuncios públicos
   - `GET /productos/disponibles` - Productos públicos
   - `GET /categorias` - Categorías públicas
   - `GET /ofertas/activas` - Ofertas activas
   - `GET /licencias/disponibles` - Planes de licencia
   - `POST /chatbot/chat` - Chatbot

2. **Rutas Protegidas** (middleware `auth:sanctum`)
   - `POST /logout`, `GET /me`, `POST /cambiar-restaurante`
   - `GET/PUT /user/profile` - Perfil de usuario
   - `GET /restaurantes/buscar` - Buscar restaurantes
   - `GET /mi-licencia` - Licencia del usuario
   - `POST /licencias/{id}/comprar` - Comprar licencia
   - `GET /plataforma/*` - SUPER ADMIN

3. **Rutas con Tenant** (middleware `auth:sanctum` + `tenant`)
   - `GET/POST /caja/*` - Gestión de caja
   - CRUD `/restaurantes/*` - Restaurantes
   - CRUD `/propietarios/*` - Propietarios
   - CRUD `/licencias/*` - Licencias
   - CRUD `/roles/*` - Roles y permisos
   - CRUD `/productos/*` - Productos
   - CRUD `/paquetes/*` - Paquetes
   - CRUD `/ingredientes/*` - Ingredientes
   - CRUD `/categorias/*` - Categorías
   - CRUD `/gastos/*` - Gastos
   - CRUD `/admin/anuncios/*` - Anuncios (admin)
   - CRUD `/ordenes/*` - Órdenes
   - CRUD `/ordenes/{id}/detalles/*` - Detalles de orden
   - CRUD `/estaciones/*` - Estaciones
   - CRUD `/clientes/*` - Clientes (incluye `/{id}/historial`)
   - `GET /reportes/*` - Reportes y analíticas
   - CRUD `/users/*` - Usuarios
   - `GET /meseros/*` - Meseros
   - CRUD `/ofertas/*` - Ofertas
   - CRUD `/logs/*` - Logs de auditoría
   - CRUD `/empleados/*` - Empleados
   - `GET /asistencias/*` - Asistencias
   - CRUD `/horarios/*` - Horarios
   - CRUD `/nominas/*` - Nóminas
   - `GET /kpis/*` - KPIs (meseros, cocina, caja, admin, dashboard)

### 3.4 Controladores

#### API Controllers (`app/Http/Controllers/Api/`)

| Controlador | Endpoints principales |
|------------|----------------------|
| `AuthController` | login, register, registerCliente, loginEmpleado, forgotPassword, resetPassword, logout, me, cambiarRestaurante, changePassword, registerEmpleado |
| `CajaController` | estado, abrir, cerrar, movimientos, corte, historial, crearPagoPayPal, capturarPayPal |
| `OrdenController` | index, store, show, update, cerrar, dividirCuenta, procesarPago, updateStationStatus, pendientesConteo, resumen, hoy |
| `OrdenDetalleController` | index, store, show, update, destroy, updateMultiple, actualizarEstadoPorEstacion |
| `ProductoController` | index, store, show, update, destroy, toggleActive, selectList, bajoStock, import, ajustarStock, disponiblesPublic |
| `ClienteController` | index, store, show, update, destroy, selectList, historial |
| `CategoriaController` | index, store, show, update, destroy, selectList, resumen, reordenar, toggleActive |
| `RestauranteController` | index, store, show, update, destroy, selectList, buscarPorNombre, estadisticas |
| `PropietarioController` | index, store, show, update, destroy, dashboard |
| `UserController` | show, update, roles, rolPrincipal, getOwnerRestaurants, updateById, destroy, toggleActivo |
| `RoleController` | index, store, show, update, destroy, selectList, availablePermissions, users, assignPermissions, removePermissions |
| `PermissionController` | index, store, show, update, destroy, grouped, byRole, assignToRoles |
| `EmpleadoController` | index, store, show, update, toggleActivo, destroy, getSesiones, getAsistencias, registrarAsistencia, getNominas, resumenNominas, generarNomina, getKpiMeseros, getKpiCocina, getKpiCaja, etc. |
| `ReporteController` | ventasPorPeriodo, productosMasVendidos, clientesFrecuentes, dashboard, reporteFinanciero, roiCompleto, descargar, exportar, +20 endpoints |
| `MeseroController` | index, misMesas, misOrdenes, configurarTotalMesas, asignarMesas, metricasVentas, metricasDetalladas |
| `LicenciaController` | index, store, show, update, destroy, toggleActive, disponibles, comprarLicencia, comprarLicenciaPayPal, comprarLicenciaMercadoPago, webhookPayPal, webhookMercadoPago |
| `GastoController` | index, store, update, destroy, resumen |
| `IngredienteController` | index, store, update, destroy, deProducto, syncProducto, historial, ajustarStock |
| `OfertaController` | index, store, show, update, destroy, toggleActive, activasPublic |
| `AnuncioController` | index, store, update, destroy, toggleActivo, reordenar, indexPublic, vigentesPublic |
| `PaqueteController` | index, store, show, update, destroy, toggleActive |
| `HorarioController` | index, store, show, update, destroy, copiar, porEmpleado |
| `NominaDetalleController` | index, store, show, update, destroy |
| `EstacionController` | index, store, show, update, destroy |
| `ChatbotController` | chat, index (tickets), update (tickets) |
| `PlataformaController` | index, stats, destroyPropietario, destroyRestaurante |
| `PayPalController` | createOrder, captureOrder, cancelOrder |
| `MercadoPagoController` | crearPreferencia, retornoPago |
| `LogController` | index, show, acciones, tablas, limpiar |

### 3.5 Autenticación y Autorización

#### Sistema de Autenticación
- **Driver:** Laravel Sanctum (token-based)
- **Sanctum Config:** `config/sanctum.php`
  - `stateful` dominios: configurados vía `SANCTUM_STATEFUL_DOMAINS`
  - `expiration`: 1440 minutos (24 horas)
  - `guard`: web

#### Flujo de Login
1. Usuario envía credenciales (email/username + password)
2. `AuthController@login` verifica credenciales
3. Verifica licencia activa del propietario
4. Asegura que tenga `restaurante_activo` y categorías base
5. Elimina tokens anteriores
6. Marca usuario como activo/en línea
7. Registra sesión de empleado (`SesionEmpleado`)
8. Retorna `UserResource` + `token` (plainTextToken)

#### Sistema de Roles y Permisos

**Roles disponibles:**
- `SUPER_ADMIN` - Super administrador global
- `PROPIETARIO` - Dueño del restaurante
- `ADMIN` - Administrador del restaurante
- `CAJA` - Cajero/POS
- `COCINA` - Cocinero
- `BARRA` - Bartender
- `MESERO` - Mesero
- `CLIENTE` - Cliente
- `MENU` - Kiosko de menú
- `PICKUP` - Pedidos para llevar

**Permisos:** ~50+ permisos granulares (VER_PRODUCTOS, CREAR_ORDENES, EDITAR_CAJA, etc.)

**Verificación:** `User@hasPermission()` con carga lazy optimizada (sin N+1):
- Bypass total para PROPIETARIO, DUEÑO, SUPER_ADMIN
- Excepción automática para rol MENU (permisos básicos)
- Búsqueda en colección ya cargada en memoria

#### Middleware de permisos
- Middleware personalizado que verifica `hasPermission()` antes de cada ruta

### 3.6 Middleware

Middleware personalizados (en `app/Http/Middleware/`):
- **CheckTenant:** Establece `restaurante_activo` en el contenedor de la app basado en header `X-Restaurante-Id` o usuario autenticado
- **PermissionMiddleware:** Verifica permisos del usuario antes de acceder a rutas

Middleware registrados en `MiddlewareServiceProvider.php`

### 3.7 Eventos y Broadcasting

#### `OrdenActualizada` (`app/Events/OrdenActualizada.php`)
- Implementa `ShouldBroadcastNow` (broadcast síncrono)
- Canal: público `restaurante.{id}`
- Nombre del evento: `orden.actualizada`
- Datos: `{ accion, orden: { id, folio, total, estado, created_at } }`
- Se dispara en: creación de orden, cambio de estado, pago

#### `CajaActualizada` (`app/Events/CajaActualizada.php`)
- Implementa `ShouldBroadcastNow`
- Canal: `PrivateChannel("restaurante.{id}")`
- Nombre del evento: `caja.actualizada`
- Datos: `{ accion, datos }`
- Se dispara en: apertura, cierre, movimiento, venta

#### Canales (`routes/channels.php`)
- Canal privado `restaurante.{id}`: autoriza usuarios con `restaurante_activo` igual al ID

### 3.8 Servicios

| Servicio | Archivo | Descripción |
|----------|---------|-------------|
| `GeminiService` | `app/Services/GeminiService.php` | Integración con Google Gemini AI para chatbot |
| `WhatsAppService` | `app/Services/WhatsAppService.php` | Integración con API de WhatsApp para notificaciones |

### 3.9 Traits y Helpers

#### Traits

| Trait | Archivo | Descripción |
|-------|---------|-------------|
| `BelongsToTenant` | `app/Traits/BelongsToTenant.php` | Multi-tenancy automático. Aplica `TenantScope` global y asigna `restaurante_id` automáticamente al crear |
| `HandlesApiErrors` | `app/Traits/HandlesApiErrors.php` | Métodos `success()` y `failure()` para respuestas JSON consistentes |
| `LogsActivity` | `app/Models/LogsActivity.php` | Log automático en eventos created/updated/deleted del modelo |

#### Scopes

| Scope | Archivo | Descripción |
|-------|---------|-------------|
| `TenantScope` | `app/Scopes/TenantScope.php` | Filtra queries por `restaurante_id` según el restaurante activo (de middleware o usuario) |

#### Helpers

| Helper | Archivo | Descripción |
|--------|---------|-------------|
| `StockHelper` | `app/Helpers/StockHelper.php` | Funciones auxiliares para cálculos de stock |

### 3.10 Políticas

| Policy | Archivo | Modelo |
|--------|---------|--------|
| `CategoriaPolicy` | `app/Policies/CategoriaPolicy.php` | Categoria |
| `ClientePolicy` | `app/Policies/ClientePolicy.php` | Cliente |
| `LicenciaPolicy` | `app/Policies/LicenciaPolicy.php` | Licencia |
| `LogPolicy` | `app/Policies/LogPolicy.php` | Log |
| `OrdenPolicy` | `app/Policies/OrdenPolicy.php` | Orden |
| `ProductoPolicy` | `app/Policies/ProductoPolicy.php` | Producto |
| `PropietarioLicenciaPolicy` | `app/Policies/PropietarioLicenciaPolicy.php` | PropietarioLicencia |
| `PropietarioPolicy` | `app/Policies/PropietarioPolicy.php` | Propietario |
| `RestaurantePolicy` | `app/Policies/RestaurantePolicy.php` | Restaurante |

### 3.11 Dependencias (composer.json)

**Producción:**
- `laravel/framework: ^12.0`
- `laravel/reverb: *` - WebSocket server
- `laravel/sanctum: ^4.3` - API tokens
- `mercadopago/dx-php: ^3.0` - Pagos Mercado Pago

**Desarrollo:**
- `knuckleswtf/scribe: ^5.9` - Documentación API automática
- `phpunit/phpunit: ^11.5.3` - Testing
- `laravel/pint: ^1.24` - Code style

---

## 4. DESPLIEGUE

### Desarrollo Local

```bash
# Terminal 1 - Backend
cd EASY_ORDER_BACK_MAIN
php artisan serve
php artisan reverb:start

# Terminal 2 - Frontend
cd EASY_ORDER_FRONT_MAIN
npm run dev
```

Acceder en: `http://localhost:5173`

### Producción (Laravel sirve el frontend)

```bash
# Construir frontend y copiar al backend
cd EASY_ORDER_FRONT_MAIN
deploy.bat

# Iniciar backend
cd EASY_ORDER_BACK_MAIN
php artisan serve
```

Acceder en: `http://localhost:8000`

El script `deploy.bat` ejecuta:
1. `npm run build` (genera `dist/`)
2. Copia `dist/` a `../Back-endApi/public/dist` (o ruta configurada)

### Configuración de Túnel (Cloudflare/ngrok/devtunnels)

Ver `DEPLOY.md` para configuración completa de túneles y WebSockets.

---

## 5. VARIABLES DE ENTORNO

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000           # URL del backend Laravel
VITE_REVERB_HOST=localhost                   # Host de WebSocket
VITE_REVERB_PORT=8080                        # Puerto de WebSocket
VITE_REVERB_SCHEME=http                      # Esquema (http/https)
VITE_REVERB_APP_KEY=local                    # App key de Reverb
```

### Backend (.env)

```env
APP_URL=http://localhost:8000                # URL base
DB_CONNECTION=mysql                          # Driver BD
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=easy_order
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,localhost:5173

REVERB_APP_ID=local-app
REVERB_APP_KEY=local
REVERB_APP_SECRET=local-secret

BROADCAST_CONNECTION=reverb

MercadoPago_ACCESS_TOKEN=                    # Token de Mercado Pago
MercadoPago_PUBLIC_KEY=                      # Key pública de Mercado Pago

PAYPAL_CLIENT_ID=                            # Client ID de PayPal
PAYPAL_CLIENT_SECRET=                        # Secret de PayPal
PAYPAL_MODE=sandbox                          # sandbox/live

GEMINI_API_KEY=                              # API key de Google Gemini
```
