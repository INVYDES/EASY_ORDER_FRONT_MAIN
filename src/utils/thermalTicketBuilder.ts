// ─────────────────────────────────────────────────────────────────────────────
// src/utils/thermalTicketBuilder.ts
// Converts Easy Order ticket data into ESC/POS byte arrays ready to print
// ─────────────────────────────────────────────────────────────────────────────

import { EscPosBuilder, type PaperSize } from './escpos'

// ── Types ────────────────────────────────────────────────────────────────────

export interface TicketItem {
  id?: number
  cantidad: number
  nombre: string
  subtotal: number
  notas?: string
  cancelado?: boolean
  motivo_cancelacion?: string
  nom_comensal?: string
  comensal?: string
  nombre_comensal?: string
}

export interface TicketSucursal {
  nombre: string
  direccion?: string
  telefono?: string
}

export interface TicketData {
  folio: string
  mesa?: string | number | null
  atendio?: string
  metodo_pago?: string
  referencia?: string
  propina?: number
  total: number
  items: TicketItem[]
  sucursal: TicketSucursal
  uniqueIdentifier?: string
  fecha?: string
  montoRecibido?: number
  cambio?: number
}

export interface ComandaData {
  folio: string
  mesa?: string | number | null
  tipo_orden?: string
  items: Array<{
    cantidad: number
    nombre: string
    notas?: string
    nom_comensal?: string
    comensal?: string
    tamano_nombre?: string
  }>
}

export interface DividedTicketData {
  sucursal: TicketSucursal
  mesa?: string | number | null
  atendio?: string
  fecha?: string
  cuentas: Array<{
    index: number
    totalCuentas: number
    folio: string
    nombres_comensales?: string
    monto: number
    pago_metodo?: string
    pago_referencia?: string
    pago_recibido?: number
    pago_propina?: number
    pago_cambio?: number
    detalles?: Array<{
      cantidad: number
      producto_nombre: string
      subtotal: number
    }>
  }>
}

export interface TicketBuildOptions {
  paperSize?: PaperSize
  openDrawer?: boolean
  beep?: boolean
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Elimina acentos para máxima compatibilidad con tablas de códigos limitadas */
function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/** Agrupa items por comensal */
function groupByComensal(items: TicketItem[]): Record<string, TicketItem[]> {
  const groups: Record<string, TicketItem[]> = {}
  for (const item of items) {
    const key = item.nom_comensal || item.comensal || item.nombre_comensal || 'General'
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  }
  return groups
}

// ── Ticket de Pago ───────────────────────────────────────────────────────────

/**
 * Genera los bytes ESC/POS de un ticket de pago (cobro normal, sin dividir).
 */
export function buildPaymentTicket(data: TicketData, options: TicketBuildOptions = {}): Uint8Array {
  const { paperSize = '80mm', openDrawer = false, beep = false } = options
  const b = new EscPosBuilder().paperSize(paperSize)

  b.initialize()
   .codePage(16) // WPC1252 para acentos en español

  // ── Cajón de dinero ──
  if (openDrawer && data.metodo_pago?.toLowerCase() === 'efectivo') {
    b.openCashDrawer()
  }

  // ── Encabezado sucursal ──
  b.align('center')
   .textSize('double')
   .bold()
   .textLn(stripAccents(data.sucursal.nombre.toUpperCase()))
   .textSize('normal')
   .bold(false)

  if (data.sucursal.direccion && data.sucursal.direccion.trim().length > 2) {
    b.textLn(stripAccents(data.sucursal.direccion))
  }
  if (data.sucursal.telefono) {
    b.textLn(`TEL: ${data.sucursal.telefono}`)
  }

  b.separator('-')
   .bold()
   .textLn('COMPROBANTE DE PAGO')
   .bold(false)
   .textLn(data.fecha || new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' }))
   .feed(1)

  // ── Datos de la orden ──
  b.align('left')
   .columns('Mesa: ' + (data.mesa || 'N/A'), 'Folio: ' + (data.uniqueIdentifier || data.folio))

  if (data.atendio) {
    b.textLn(`Atendio: ${stripAccents(data.atendio)}`)
  }

  b.textLn(`Pago: ${(data.metodo_pago || 'EFECTIVO').toUpperCase()}`)

  if (data.referencia && data.referencia.trim()) {
    b.textLn(`Referencia: ${data.referencia.toUpperCase()}`)
  }

  // ── Tabla de productos ──
  b.separator('-')
   .bold()
   .threeColumns('CANT', 'DESCRIPCION', 'IMPORTE')
   .bold(false)
   .separator('-')

  const grouped = groupByComensal(data.items)
  const multipleGroups = Object.keys(grouped).length > 1

  for (const [comensal, items] of Object.entries(grouped)) {
    if (multipleGroups) {
      b.bold()
       .textLn(comensal === 'General' ? '--- General ---' : `--- ${stripAccents(comensal)} ---`)
       .bold(false)
    }

    for (const item of items) {
      const nombre = stripAccents(item.nombre).toUpperCase()
      const subtotal = `$${Number(item.subtotal).toFixed(2)}`
      const cant = `${item.cantidad}x`

      if (item.cancelado) {
        // Producto cancelado: tachado simulado
        b.threeColumns(cant, `[X] ${nombre}`, subtotal)
        if (item.motivo_cancelacion) {
          b.textLn(`  Motivo: ${stripAccents(item.motivo_cancelacion)}`)
        }
      } else {
        b.threeColumns(cant, nombre, subtotal)
        if (item.notas) {
          b.textLn(`  * ${stripAccents(item.notas)}`)
        }
      }
    }
  }

  // ── Totales ──
  b.separator('-')
   .align('right')
   .columns('SUBTOTAL:', `$${Number(data.total).toFixed(2)}`)

  if (data.propina && data.propina > 0) {
    b.columns('PROPINA:', `$${Number(data.propina).toFixed(2)}`)
  }

  b.doubleSeparator()
   .bold()
   .textSize('double-height')

  const totalFinal = Number(data.total) + Number(data.propina || 0)
  b.columns('TOTAL:', `$${totalFinal.toFixed(2)}`)
   .textSize('normal')
   .bold(false)

  // Cambio para efectivo
  if (data.metodo_pago?.toLowerCase() === 'efectivo' && data.montoRecibido && data.montoRecibido > 0) {
    b.columns('RECIBIDO:', `$${Number(data.montoRecibido).toFixed(2)}`)
    if (data.cambio && data.cambio > 0) {
      b.bold()
       .columns('CAMBIO:', `$${Number(data.cambio).toFixed(2)}`)
       .bold(false)
    }
  }

  // ── Pie de ticket ──
  b.feed(1)
   .separator('-')
   .align('center')
   .bold()
   .textLn('ESTE NO ES UN COMPROBANTE FISCAL')
   .textLn('PROPINA NO INCLUIDA EN EL TOTAL')
   .bold(false)
   .feed(1)

  if (data.uniqueIdentifier) {
    b.textLn('Codigo de Rastreo:')
     .bold()
     .textLn(`* ${data.uniqueIdentifier} *`)
     .bold(false)
  }

  b.feed(1)
   .textLn('Gracias por su visita!')
   .textLn('*** EASY ORDER SYSTEM ***')
   .feed(1)

  // ── Beep y corte ──
  if (beep) b.beep()
  b.cut()

  return b.build()
}

// ── Comanda de Cocina ────────────────────────────────────────────────────────

/**
 * Genera los bytes ESC/POS de una comanda de cocina.
 */
export function buildKitchenComanda(data: ComandaData, options: TicketBuildOptions = {}): Uint8Array {
  const { paperSize = '80mm', beep = true } = options
  const b = new EscPosBuilder().paperSize(paperSize)

  b.initialize()
   .codePage(16)

  const dateStr = new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' })
  const mesa = data.mesa
    ? `MESA: ${data.mesa}`
    : (data.tipo_orden ? data.tipo_orden.toUpperCase() : 'SERVICIO RAPIDO')

  // ── Encabezado ──
  b.align('center')
   .textSize('double')
   .bold()
   .invert()
   .textLn(' *** COMANDA COCINA *** ')
   .invert(false)
   .feed(1)
   .textLn(stripAccents(mesa))
   .textSize('normal')
   .bold(false)
   .textLn(`${data.folio} | ${dateStr}`)
   .doubleSeparator()

  // ── Productos ──
  b.align('left')
   .bold()

  for (const item of data.items) {
    const nombre = stripAccents(item.nombre).toUpperCase()
    const tamano = (item.tamano_nombre && !nombre.includes(`(${item.tamano_nombre.toUpperCase()})`))
      ? ` (${stripAccents(item.tamano_nombre).toUpperCase()})`
      : ''
    const comensal = item.nom_comensal || item.comensal

    b.textSize('double-height')
     .textLn(`${item.cantidad}x ${nombre}${tamano}`)
     .textSize('normal')

    if (comensal) {
      b.textLn(`   [${stripAccents(comensal)}]`)
    }
    if (item.notas) {
      b.textLn(`   * NOTAS: ${stripAccents(item.notas).toUpperCase()}`)
    }
    b.separator('.')
  }

  b.bold(false)
   .feed(1)
   .doubleSeparator()
   .align('center')
   .bold()
   .textSize('double-height')
   .textLn('SERVICIO RAPIDO')
   .textSize('normal')
   .bold(false)

  if (beep) b.beep(2, 5) // Doble beep para cocina
  b.cut()

  return b.build()
}

// ── Tickets Divididos ────────────────────────────────────────────────────────

/**
 * Genera los bytes ESC/POS de múltiples tickets de cuenta dividida.
 * Cada sub-cuenta genera un ticket independiente con corte.
 */
export function buildDividedTickets(data: DividedTicketData, options: TicketBuildOptions = {}): Uint8Array {
  const { paperSize = '80mm', openDrawer = false, beep = false } = options
  const allChunks: Uint8Array[] = []

  data.cuentas.forEach((cuenta, idx) => {
    const b = new EscPosBuilder().paperSize(paperSize)
    b.initialize().codePage(16)

    // Solo abrir cajón en el primer ticket
    if (idx === 0 && openDrawer) {
      b.openCashDrawer()
    }

    // ── Encabezado sucursal ──
    b.align('center')
     .textSize('double')
     .bold()
     .textLn(stripAccents(data.sucursal.nombre.toUpperCase()))
     .textSize('normal')
     .bold(false)

    if (data.sucursal.direccion && data.sucursal.direccion.trim().length > 2) {
      b.textLn(stripAccents(data.sucursal.direccion))
    }
    if (data.sucursal.telefono) {
      b.textLn(`TEL: ${data.sucursal.telefono}`)
    }

    b.separator('-')
     .bold()
     .textLn('COMPROBANTE DE PAGO (DIVIDIDO)')
     .bold(false)
     .textLn(data.fecha || new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' }))
     .feed(1)

    // ── Datos de la sub-cuenta ──
    b.align('left')
     .columns(`Mesa: ${data.mesa || 'N/A'}`, `Sub-cuenta: ${cuenta.index} de ${cuenta.totalCuentas}`)

    if (data.atendio) {
      b.textLn(`Atendio: ${stripAccents(data.atendio)}`)
    }
    b.textLn(`Folio: ${cuenta.folio}`)

    if (cuenta.nombres_comensales) {
      b.textLn(`Comensal(es): ${stripAccents(cuenta.nombres_comensales)}`)
    }

    // ── Desglose de pago ──
    b.separator('-')
     .columns('Consumo:', `$${Number(cuenta.monto).toFixed(2)}`)

    if (cuenta.pago_propina && cuenta.pago_propina > 0) {
      b.columns('Propina:', `$${Number(cuenta.pago_propina).toFixed(2)}`)
    }

    b.bold()
     .columns('PAGADO CON:', (cuenta.pago_metodo || 'EFECTIVO').toUpperCase())
     .bold(false)

    if (cuenta.pago_referencia) {
      b.textLn(`REF: ${cuenta.pago_referencia}`)
    }
    if (cuenta.pago_recibido) {
      b.textLn(`RECIBIDO: $${Number(cuenta.pago_recibido).toFixed(2)}`)
    }
    if (cuenta.pago_cambio && cuenta.pago_cambio > 0) {
      b.bold()
       .textLn(`CAMBIO: $${Number(cuenta.pago_cambio).toFixed(2)}`)
       .bold(false)
    }

    // ── Tabla de productos (si es por comensal) ──
    if (cuenta.detalles && cuenta.detalles.length > 0) {
      b.separator('-')
       .bold()
       .threeColumns('CANT', 'DESC', 'IMP')
       .bold(false)
       .separator('-')

      for (const det of cuenta.detalles) {
        b.threeColumns(
          `${det.cantidad}`,
          stripAccents(det.producto_nombre).toUpperCase(),
          `$${Number(det.subtotal).toFixed(2)}`
        )
      }
    } else {
      b.feed(1)
       .align('center')
       .textLn('Division en partes iguales')
       .align('left')
    }

    // ── Total ──
    b.doubleSeparator()
     .bold()
     .textSize('double-height')
     .align('right')
     .columns('TOTAL:', `$${Number(cuenta.monto).toFixed(2)}`)
     .textSize('normal')
     .bold(false)

    // ── Pie ──
    b.feed(1)
     .separator('-')
     .align('center')
     .bold()
     .textLn('ESTE NO ES UN COMPROBANTE FISCAL')
     .bold(false)
     .textLn('*** EASY ORDER SYSTEM ***')
     .feed(1)

    if (beep) b.beep()
    b.cut()

    allChunks.push(b.build())
  })

  // Combinar todos los tickets en un solo Uint8Array
  const totalLen = allChunks.reduce((sum, c) => sum + c.length, 0)
  const result = new Uint8Array(totalLen)
  let offset = 0
  for (const chunk of allChunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}
