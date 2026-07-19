# MANUAL DE USUARIO - EASY ORDER

Sistema de Gestión Restaurantera - Módulos: POS, Cocina, Barra, Meseros, Menú Digital y Administración.

---

## ÍNDICE

1. [INTRODUCCIÓN](#1-introducción)
2. [PRIMEROS PASOS](#2-primeros-pasos)
   - 2.1 [Registro de Propietario](#21-registro-de-propietario)
   - 2.2 [Inicio de Sesión](#22-inicio-de-sesión)
   - 2.3 [Recuperación de Contraseña](#23-recuperación-de-contraseña)
   - 2.4 [Selector de Sucursal](#24-selector-de-sucursal)
3. [ROL MESERO](#3-rol-mesero)
   - 3.1 [Mapa de Mesas](#31-mapa-de-mesas)
   - 3.2 [Tomar Orden](#32-tomar-orden)
   - 3.3 [Confirmar y Despachar Orden](#33-confirmar-y-despachar-orden)
   - 3.4 [Estado de la Orden](#34-estado-de-la-orden)
4. [ROL COCINA](#4-rol-cocina)
   - 4.1 [Tablero Kanban](#41-tablero-kanban)
   - 4.2 [Preparar Platillo](#42-preparar-platillo)
   - 4.3 [Marcar como Listo](#43-marcar-como-listo)
5. [ROL BARRA](#5-rol-barra)
   - 5.1 [Tablero de Bebidas](#51-tablero-de-bebidas)
   - 5.2 [Preparar y Servir Bebidas](#52-preparar-y-servir-bebidas)
6. [ROL CAJA (POS)](#6-rol-caja-pos)
   - 6.1 [Apertura de Caja](#61-apertura-de-caja)
   - 6.2 [Gestión de Tickets](#62-gestión-de-tickets)
   - 6.3 [Procesar Pago](#63-procesar-pago)
   - 6.4 [Corte de Caja (X Report)](#64-corte-de-caja)
   - 6.5 [Cierre de Caja](#65-cierre-de-caja)
   - 6.6 [Historial de Cierres](#66-historial-de-cierres)
7. [ROL ADMIN / PROPIETARIO](#7-rol-admin--propietario)
   - 7.1 [Panel de Administración](#71-panel-de-administración)
   - 7.2 [Gestión de Sucursales y Personal](#72-gestión-de-sucursales-y-personal)
   - 7.3 [Gestión de Meseros](#73-gestión-de-meseros)
   - 7.4 [Gestión de Productos](#74-gestión-de-productos)
   - 7.5 [Gestión de Categorías](#75-gestión-de-categorías)
   - 7.6 [Gestión de Ingredientes](#76-gestión-de-ingredientes)
   - 7.7 [Gestión de Paquetes](#77-gestión-de-paquetes)
   - 7.8 [Gestión de Ofertas](#78-gestión-de-ofertas)
   - 7.9 [Gestión de Anuncios](#79-gestión-de-anuncios)
   - 7.10 [Gestión de Gastos](#710-gestión-de-gastos)
   - 7.11 [Nóminas](#711-nóminas)
   - 7.12 [Configuración Financiera](#712-configuración-financiera)
   - 7.13 [Licencias](#713-licencias)
8. [ROL CLIENTE](#8-rol-cliente)
   - 8.1 [Menú Digital](#81-menú-digital)
   - 8.2 [Realizar Pedido](#82-realizar-pedido)
   - 8.3 [Pago en Línea](#83-pago-en-línea)
   - 8.4 [Pedido para Llevar (Pickup)](#84-pedido-para-llevar-pickup)
9. [ANALÍTICAS Y REPORTES](#9-analíticas-y-reportes)
   - 9.1 [Dashboard Resumen](#91-dashboard-resumen)
   - 9.2 [Reporte Financiero](#92-reporte-financiero)
   - 9.3 [KPIs de Ventas](#93-kpis-de-ventas)
   - 9.4 [KPIs de Productos](#94-kpis-de-productos)
   - 9.5 [KPIs de Empleados](#95-kpis-de-empleados)
   - 9.6 [Exportar Reportes](#96-exportar-reportes)
10. [PERFIL DE USUARIO](#10-perfil-de-usuario)
11. [PREGUNTAS FRECUENTES](#11-preguntas-frecuentes)

---

## 1. INTRODUCCIÓN

**Easy Order** es un sistema integral de gestión restaurantera que permite administrar todas las operaciones de uno o varios restaurantes desde una sola plataforma. Está diseñado para:

- **Meseros:** Tomar órdenes desde dispositivos móviles y enviarlas a cocina/barra
- **Cocina:** Visualizar órdenes entrantes, gestionar tiempos de preparación
- **Barra:** Gestionar preparación de bebidas
- **Caja (POS):** Procesar pagos, abrir/cerrar caja, generar cortes
- **Administración:** Gestionar empleados, productos, inventario, nóminas, reportes
- **Clientes:** Ordenar desde menú digital, pagar en línea

---

## 2. PRIMEROS PASOS

### 2.1 Registro de Propietario

1. Abre la aplicación en tu navegador
2. En la pantalla de login, haz clic en **"Registrarse"**
3. Completa el formulario con:
   - **Nombre completo** del propietario
   - **Correo electrónico**
   - **Teléfono**
   - **Contraseña** (mínimo 8 caracteres)
4. En la sección **"Datos del Restaurante"**:
   - **Nombre del restaurante**
   - **Teléfono**
   - **Dirección** (calle, ciudad, estado)
5. Acepta los **Términos y Condiciones**
6. Haz clic en **"Crear Cuenta"**

Al registrarte, se te asigna automáticamente una **licencia de prueba gratuita** y se crea tu primer restaurante.

### 2.2 Inicio de Sesión

**Para propietarios y administradores:**
1. Ingresa tu **correo electrónico** o **nombre de usuario**
2. Escribe tu **contraseña**
3. Haz clic en **"Iniciar Sesión"**

**Para empleados (meseros, cocina, barra, caja):**
1. Ingresa tu **código de empleado** (formato: `ID-PropietarioID-RestauranteID`)
2. Escribe tu **contraseña**
3. Haz clic en **"Iniciar Sesión"**

El sistema te redirigirá automáticamente al módulo correspondiente según tu rol.

### 2.3 Recuperación de Contraseña

1. En la pantalla de login, haz clic en **"¿Olvidaste tu contraseña?"**
2. Ingresa tu **correo electrónico**
3. Recibirás un enlace para restablecer tu contraseña
4. Sigue las instrucciones del correo

### 2.4 Selector de Sucursal

Si tu cuenta tiene acceso a múltiples restaurantes/sucursales, puedes cambiar entre ellos desde la **barra lateral izquierda**:

1. Localiza el **selector de sucursal** en la parte superior de la barra lateral
2. Haz clic en el nombre de la sucursal actual
3. Selecciona la sucursal a la que deseas cambiar
4. El sistema cargará los datos de la nueva sucursal

---

## 3. ROL MESERO

### 3.1 Mapa de Mesas

Al ingresar como mesero, verás un **mapa interactivo** con la distribución de mesas del restaurante.

- **Mesas verdes:** Disponibles
- **Mesas amarillas:** Ocupadas con orden en proceso
- **Mesas rojas:** Orden lista para servir
- **Mesas grises:** Cerradas o fuera de servicio

Haz clic en una mesa para:
- Crear una **nueva orden** (si está disponible)
- Ver los **detalles de la orden** (si está ocupada)

### 3.2 Tomar Orden

1. Haz clic en una **mesa disponible**
2. Se abrirá el panel de productos organizados por **categorías**
3. Para agregar un producto:
   - Haz clic en el producto deseado
   - Se agregará automáticamente con cantidad 1
   - Puedes **aumentar/disminuir** la cantidad con los botones `+` y `-`
4. Para agregar una **nota** al producto (ej. "sin cebolla"), haz clic en el ícono de nota
5. El **total parcial** se actualiza en tiempo real
6. Puedes **eliminar** productos deslizando o usando el botón de eliminar

### 3.3 Confirmar y Despachar Orden

1. Una vez que todos los productos están en la orden, haz clic en **"Enviar a Cocina"**
2. El sistema automáticamente:
   - Envía los **platillos** a la cocina
   - Envía las **bebidas** a la barra
   - Registra la orden en **caja**
3. La mesa se marca como **ocupada**

### 3.4 Estado de la Orden

Puedes dar seguimiento al estado de cada orden desde el mapa de mesas:

| Indicador | Significado |
|-----------|-------------|
| Pendiente | Orden enviada, en espera de preparación |
| Preparando | La cocina/barra está preparando |
| Listo | Platillos/bebidas listos para servir |
| Servido | Productos entregados al cliente |
| Pagado | Cuenta liquidada |

---

## 4. ROL COCINA

### 4.1 Tablero Kanban

El módulo de cocina presenta un **tablero Kanban** con 3 columnas:

| Columna | Descripción |
|---------|-------------|
| **Pendientes** | Órdenes nuevas que esperan ser preparadas |
| **En Preparación** | Órdenes en las que ya se está trabajando |
| **Listas** | Órdenes terminadas listas para servir |

Cada orden muestra:
- **Número de mesa**
- **Nombre del producto**
- **Cantidad**
- **Notas especiales** (alergias, modificaciones)
- **Tiempo transcurrido** desde que llegó la orden

### 4.2 Preparar Platillo

1. Localiza la orden en la columna **"Pendientes"**
2. Haz clic en **"Tomar"** o arrastra la tarjeta a la columna **"En Preparación"**
3. Opcionalmente, se abrirá un modal para **registrar consumo de ingredientes**
4. Confirma los ingredientes consumidos (opcional, depende de configuración)
5. La orden se mueve a "En Preparación" y comienza el temporizador

### 4.3 Marcar como Listo

1. Cuando el platillo esté terminado, haz clic en **"Listo"**
2. La orden se mueve a la columna **"Listas"**
3. El mesero recibe una **notificación en tiempo real**
4. El color de la mesa cambia en el mapa del mesero

---

## 5. ROL BARRA

### 5.1 Tablero de Bebidas

Funciona igual que el módulo de cocina, pero exclusivamente para bebidas.

Columnas disponibles:
- **Pendientes** - Bebidas por preparar
- **En Preparación** - Bebidas en proceso
- **Listas** - Bebidas terminadas

### 5.2 Preparar y Servir Bebidas

1. Toma una orden de la columna **"Pendientes"**
2. Prepárala y haz clic en **"Preparando"**
3. Cuando esté lista, haz clic en **"Listo"**
4. El mesero será notificado

---

## 6. ROL CAJA (POS)

### 6.1 Apertura de Caja

1. En el panel de caja, haz clic en **"Abrir Caja"**
2. Ingresa el **monto inicial** en efectivo
3. Confirma la apertura
4. La caja queda operativa y se habilita el registro de ventas

### 6.2 Gestión de Tickets

El panel de caja muestra una cuadrícula con todos los **tickets activos** (órdenes no pagadas).

Cada ticket muestra:
- **Número de mesa**
- **Total**
- **Tiempo transcurrido**
- **Items** (platillos consumidos)

Acciones disponibles por ticket:
- **Ver detalle:** Muestra todos los productos de la orden
- **Pagar:** Procesa el pago de la cuenta

### 6.3 Procesar Pago

1. Selecciona el ticket que deseas cobrar
2. Se abre el modal de pago con las siguientes opciones:

| Método de Pago | Descripción |
|----------------|-------------|
| **Efectivo** | Ingresa el monto con que paga el cliente; el sistema calcula el cambio |
| **Tarjeta** | Registra pago con tarjeta (débito/crédito) |
| **Transferencia** | Pago por transferencia bancaria |
| **PayPal** | Genera link de pago PayPal |
| **Mercado Pago** | Genera link de pago con Mercado Pago |
| **Mixto** | Divide el pago entre varios métodos |

3. Para pagos en **efectivo**:
   - Ingresa el **monto recibido**
   - El sistema muestra el **cambio** a devolver
   - Confirma el pago

4. Para pagos con **tarjeta/transferencia**:
   - Ingresa el **folio de referencia** (opcional)
   - Confirma el pago

5. Una vez confirmado, el ticket se marca como **pagado**
6. Se genera un **comprobante** que puedes imprimir

### 6.4 Corte de Caja (X Report)

El corte parcial permite ver el estado actual de la caja sin cerrarla:

1. Haz clic en **"Corte X"**
2. Se muestra un reporte con:
   - **Monto inicial**
   - **Ventas totales** (desglosado por método de pago)
   - **Movimientos** (ingresos/egresos)
   - **Efectivo esperado**
   - **Propinas**
3. Puedes **imprimir** o **exportar** el reporte

### 6.5 Cierre de Caja

1. Haz clic en **"Cerrar Caja"**
2. Ingresa el **efectivo real** contado físicamente
3. El sistema calcula automáticamente la **diferencia** contra el efectivo esperado
4. Agrega **observaciones** (opcional)
5. Confirma el cierre
6. La caja queda **bloqueada** y no se pueden registrar más operaciones hasta una nueva apertura

### 6.6 Historial de Cierres

Desde el botón **"Historial"** puedes consultar todos los cierres anteriores:
- Fecha y hora de apertura/cierre
- Usuario que realizó el cierre
- Montos y diferencias
- Detalle de ventas por período

---

## 7. ROL ADMIN / PROPIETARIO

### 7.1 Panel de Administración

El panel de administración es el centro de control del restaurante. Está organizado en **pestañas** (tabs):

1. **Resumen** - Dashboard con indicadores clave
2. **Sucursales y Personal** - Gestión de empleados y restaurantes
3. **Meseros** - Administración específica de meseros
4. **Nóminas** - Gestión de nóminas
5. **Gastos** - Registro de gastos
6. **Financiero** - Configuración financiera

### 7.2 Gestión de Sucursales y Personal

#### Restaurantes/Sucursales
- **Crear:** Haz clic en **"Agregar Sucursal"**, completa nombre, teléfono y dirección
- **Editar:** Haz clic en el ícono de lápiz en la sucursal
- **Eliminar:** Haz clic en el ícono de papelera (se elimina lógicamente)

#### Empleados
- **Registrar empleado:**
  1. Haz clic en **"Agregar Empleado"**
  2. Completa: nombre, email, teléfono, rol, salario
  3. Asigna las **sucursales** a las que tendrá acceso
  4. El sistema genera un **código de empleado** único
  5. El empleado recibirá sus credenciales
- **Editar:** Modifica datos, rol o sucursales asignadas
- **Activar/Desactivar:** Habilita o deshabilita el acceso al sistema
- **Sesiones:** Consulta el historial de entrada/salida de cada empleado

#### Roles y Permisos
- Cada rol (MESERO, COCINA, CAJA, etc.) tiene permisos predefinidos
- Los administradores pueden **personalizar permisos** por rol
- Para modificar: ve a la sección Roles, selecciona el rol y asigna/revoca permisos

### 7.3 Gestión de Meseros

- **Asignar Mesas:** Configura cuántas mesas atiende cada mesero
- **Métricas de Ventas:** Consulta el desempeño de cada mesero:
  - Total de ventas
  - Número de órdenes
  - Propinas recibidas
  - Producto más vendido
  - Satisfacción del cliente

### 7.4 Gestión de Productos

**Agregar producto:**
1. Haz clic en **"Nuevo Producto"**
2. Completa:
   - **Nombre**
   - **Descripción**
   - **Categoría** (asignada previamente)
   - **Precio de venta**
   - **Costo** (para calcular márgenes)
   - **Stock** (inventario físico)
   - **Stock mínimo** (alerta cuando esté cerca)
   - **Minutos de producción** (tiempo estimado de preparación)
   - **Imagen** (opcional, para menú digital)
   - **Estación** (cocina, barra, postres)
3. Guarda el producto

**Editar/Desactivar:**
- Edita cualquier campo del producto
- Desactiva productos sin eliminarlos (no aparecerán en menú)

**Importar/Exportar:**
- **Importar:** Carga productos desde archivo Excel/CSV
- **Exportar:** Descarga el catálogo en Excel

**Ajuste de Stock:**
- Usa el modal de ajuste para corregir inventario manualmente
- Ingresa la razón del ajuste (merma, inventario físico, etc.)

### 7.5 Gestión de Categorías

- **Crear:** Nombre, descripción y color (para identificar visualmente)
- **Reordenar:** Arrastra las categorías para cambiar su orden en el menú
- **Activar/Desactivar:** Las categorías inactivas ocultan sus productos

### 7.6 Gestión de Ingredientes

**Agregar ingrediente:**
1. Haz clic en **"Nuevo Ingrediente"**
2. Completa: nombre, unidad de medida, costo unitario, stock actual, stock mínimo, proveedor

**Asignar a productos:**
1. Ve al producto deseado
2. En la sección **"Ingredientes"**, agrega los ingredientes y cantidades necesarias
3. El stock del producto se calcula automáticamente basado en el ingrediente más limitante

**Movimientos:**
- Consulta el historial de movimientos de cada ingrediente
- Filtra por tipo (entrada, salida, ajuste)

**Alertas de Stock:**
- El sistema muestra alertas cuando un ingrediente está por debajo de su stock mínimo
- Puedes generar una **lista de compras** automática con los ingredientes bajos

### 7.7 Gestión de Paquetes

Los paquetes son **combinaciones de productos** a un precio especial:

1. Haz clic en **"Nuevo Paquete"**
2. Asigna un **nombre** y **precio**
3. Selecciona los **productos** que incluye
4. Opcional: agrega **descripción**

### 7.8 Gestión de Ofertas

1. Haz clic en **"Nueva Oferta"**
2. Completa:
   - **Título** (ej. "2x1 en Tacos")
   - **Descripción**
   - **Tipo:** Porcentaje de descuento o precio especial
   - **Productos** incluidos en la oferta
   - **Días de vigencia** (ej. solo fines de semana)
3. Las ofertas activas se muestran en el menú digital

### 7.9 Gestión de Anuncios

Los anuncios se muestran en una **marquesina** en las pantallas del restaurante y/o en el menú digital del cliente.

1. Haz clic en **"Nuevo Anuncio"**
2. Completa:
   - **Título**
   - **Contenido**
   - **Tipo:** Promoción, informativo, evento
   - **Emoji/Icono**
   - **Color de fondo**
   - **Visibilidad:** Cliente, interno o ambos
   - **Vigencia:** Fecha de inicio y fin
3. Los anuncios se ordenan y muestran automáticamente

### 7.10 Gestión de Gastos

1. Haz clic en **"Nuevo Gasto"**
2. Completa:
   - **Concepto** (ej. "Compra de verduras", "Pago de luz")
   - **Categoría** (insumos, servicios, etc.)
   - **Monto**
   - **Fecha**
   - **Notas** (opcional)
3. Puedes **filtrar** por fecha, categoría y rango de montos
4. El **resumen** muestra totales por categoría y periodo

### 7.11 Nóminas

**Configuración previa:**
1. Ve a **Financiero > Configuración de Nómina**
2. Configura: día de pago, periodicidad, esquema de comisiones

**Generar nómina:**
1. Ve a la pestaña **"Nóminas"**
2. Selecciona el **periodo** (semana, quincena, mes)
3. El sistema calcula automáticamente:
   - **Salario base** (según configuración del empleado)
   - **Horas trabajadas** (basado en horarios registrados)
   - **Comisiones** (porcentaje de ventas)
   - **Bonos y descuentos** (ajustables manualmente)
4. Revisa y ajusta si es necesario
5. Haz clic en **"Generar"**

**Gestión:**
- **Pendientes:** Nóminas generadas sin pagar
- **Pagadas:** Nóminas liquidadas (registran gasto automático)
- **Anular:** Si una nómina fue generada por error

### 7.12 Configuración Financiera

En la pestaña **"Financiero"** puedes configurar:
- **Inversión inicial** (para calcular ROI)
- **Meta de ganancia mensual**
- **Costos fijos** (renta, servicios, sueldos base)
- **Punto de equilibrio automático**

### 7.13 Licencias

Gestiona el plan de suscripción del restaurante:

1. Ve a **"Licencias"** en la barra lateral
2. Puedes **ver** el plan actual y su vigencia
3. **Cambiar de plan:** Selecciona un nuevo plan y realiza el pago
4. **Cancelar:** Da de baja la suscripción actual

Planes disponibles:
- **Gratuito (Prueba):** Funcionalidades básicas por tiempo limitado
- **Mensual:** Pago mensual con todas las funciones
- **Anual:** Pago anual con descuento
- **Empresa:** Plan personalizado para cadenas

---

## 8. ROL CLIENTE

### 8.1 Menú Digital

1. El restaurante te proporciona un **código QR** o **enlace** para acceder al menú
2. Se abre el menú digital con:
   - **Categorías** de productos
   - **Ofertas activas** destacadas
   - **Anuncios** del restaurante
3. Navega por las categorías para ver los productos disponibles
4. Cada producto muestra: nombre, descripción, precio, imagen

### 8.2 Realizar Pedido

1. Haz clic en el producto que deseas ordenar
2. Ajusta la **cantidad**
3. Agrega **notas** (ej. "sin lactosa")
4. Haz clic en **"Agregar al Carrito"**
5. Repite hasta completar tu orden
6. Revisa el **resumen del carrito** (icono de bolsa)
7. Confirma tu pedido

### 8.3 Pago en Línea

1. En el checkout, selecciona tu **método de pago**:
   - **PayPal** - Serás redirigido a PayPal para pagar
   - **Mercado Pago** - Pago con tarjeta o dinero en cuenta
   - **Efectivo** - Pagarás en el restaurante
2. Confirma el pedido
3. Recibirás una **confirmación** con el número de orden

### 8.4 Pedido para Llevar (Pickup)

1. Selecciona la opción **"Para Llevar"**
2. Navega el menú y agrega productos
3. En el checkout:
   - Ingresa tu **nombre** y **teléfono**
   - Selecciona el **horario de recogida**
   - Elige método de pago
4. Recibirás una confirmación con la hora estimada

---

## 9. ANALÍTICAS Y REPORTES

### 9.1 Dashboard Resumen

El dashboard principal (accesible por ADMIN/PROPIETARIO) muestra:

| Indicador | Descripción |
|-----------|-------------|
| **Órdenes hoy** | Total de órdenes del día |
| **Ventas hoy** | Ingresos totales del día |
| **Ganancia estimada** | Utilidad aproximada |
| **Clientes atendidos** | Número de comensales |
| **Ventas por hora** | Gráfica de ingresos por hora del día |
| **Tendencia semanal** | Comparativa de ventas vs semana anterior |
| **Pedidos por estado** | Distribución de órdenes activas |
| **Canales de venta** | Local vs Pickup vs Delivery |
| **Métodos de pago** | Distribución por tipo de pago |
| **Top productos** | Productos más vendidos del día |

### 9.2 Reporte Financiero

- **Inversión vs Utilidad:** Seguimiento de retorno de inversión
- **Márgenes de ganancia:** Por producto y global
- **Punto de equilibrio:** Ventas necesarias para cubrir costos
- **ROI:** Retorno sobre inversión calculado automáticamente
- **Gastos operativos:** Desglose por categoría

### 9.3 KPIs de Ventas

- **Selector de período:** Hoy, esta semana, este mes, personalizado
- **Total de ventas**
- **Número de órdenes**
- **Ticket promedio**
- **Productos por orden**
- **Comparativas vs períodos anteriores**
- **Exportación a PDF/Excel**

### 9.4 KPIs de Productos

- **Ranking de productos más vendidos**
- **Margen de contribución por producto**
- **Productos con mayor rentabilidad**
- **Productos con bajo rendimiento**
- **Exportación a PDF/Excel**

### 9.5 KPIs de Empleados

**Meseros:**
- Órdenes tomadas
- Total vendido
- Propinas recibidas
- Tiempo promedio de servicio

**Cocina:**
- Órdenes preparadas
- Tiempo promedio de preparación
- Órdenes con retraso
- Reprocesos (platillos devueltos)

**Caja:**
- Transacciones procesadas
- Monto total manejado
- Diferencias en cierres

### 9.6 Exportar Reportes

Los reportes se pueden exportar en:
- **PDF** - Para impresión o archivo
- **Excel** - Para análisis en hojas de cálculo

Selecciona el formato deseado en la esquina superior derecha de cada reporte.

---

## 10. PERFIL DE USUARIO

Desde el menú de perfil (esquina superior izquierda > "Mi Perfil / Config"):

- **Ver información personal:** Nombre, email, rol, sucursal activa
- **Cambiar contraseña:** Ingresa contraseña actual y nueva
- **Actualizar datos personales:** Teléfono, foto de perfil
- **Tema:** Alternar entre modo claro y oscuro
- **Cerrar sesión**

---

## 11. PREGUNTAS FRECUENTES

**¿Cómo recupero mi contraseña?**
En la pantalla de login, haz clic en "¿Olvidaste tu contraseña?" y sigue las instrucciones.

**¿Puedo tener varias sucursales?**
Sí, los planes de pago permiten múltiples sucursales. Ve a "Licencias" para ver los límites de tu plan.

**¿Cómo agrego un nuevo empleado?**
Ve a Administración > Sucursales y Personal > Agregar Empleado. Completa sus datos y asígnale un rol.

**¿Cómo configuro los métodos de pago?**
PayPal y Mercado Pago se configuran desde el archivo `.env` del backend. Contacta al administrador del sistema.

**¿Los datos se actualizan en tiempo real?**
Sí, todas las operaciones (nuevas órdenes, cambios de estado, pagos) se reflejan instantáneamente vía WebSockets.

**¿Puedo usar Easy Order en mi celular?**
Sí, la aplicación es responsive y funciona en navegadores móviles. También está disponible como app Android (APK).

**¿Qué hago si un platillo se devuelve?**
En cocina, puedes marcar un platillo como "reprocesado" e ingresar el motivo de la devolución. El sistema registra esto para análisis de calidad.

**¿Cómo calcula el sistema las comisiones de los meseros?**
Las comisiones se basan en el porcentaje configurado en el perfil del empleado, aplicado al total de sus ventas en el período de nómina.
