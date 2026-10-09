// ─────────────────────────────────────────────────────────────────────────────
// src/composables/useThermalPrinter.ts
// Composable para imprimir tickets ESC/POS desde el navegador usando Web Serial API.
//
// Compatible con: Chrome 89+, Edge 89+, Electron (Chromium).
// NO compatible con: Safari, Firefox, iOS.
//
// Uso:
//   const { connect, printTicket, printComanda, printDivided, isConnected, printerName } = useThermalPrinter()
//   await connect()
//   printTicket(orderData)
// ─────────────────────────────────────────────────────────────────────────────

import { ref, readonly, computed } from 'vue'
import type { PaperSize } from '../utils/escpos'
import {
  buildPaymentTicket,
  buildKitchenComanda,
  buildDividedTickets,
  type TicketData,
  type ComandaData,
  type DividedTicketData,
  type TicketBuildOptions,
} from '../utils/thermalTicketBuilder'

// ── Types ────────────────────────────────────────────────────────────────────

export interface PrinterConfig {
  paperSize: PaperSize
  openDrawer: boolean
  beepOnPrint: boolean
  baudRate: number
}

export type PrinterStatus = 'disconnected' | 'connecting' | 'connected' | 'printing' | 'error'

// ── Constantes ───────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: PrinterConfig = {
  paperSize: '80mm',
  openDrawer: true,
  beepOnPrint: false,
  baudRate: 9600,  // 9600 es el más común, algunos modelos usan 115200
}

const STORAGE_KEY = 'eorder_printer_config'

// ── Estado global singleton ──────────────────────────────────────────────────
// Compartido entre todas las instancias del composable para mantener
// una sola conexión con la impresora en toda la app.

let globalPort: SerialPort | null = null
let globalWriter: WritableStreamDefaultWriter<Uint8Array> | null = null

// ── Composable ───────────────────────────────────────────────────────────────

export function useThermalPrinter() {
  // ── Estado reactivo ──
  const status        = ref<PrinterStatus>(globalPort ? 'connected' : 'disconnected')
  const printerName   = ref<string>(loadConfig().lastPrinterName || '')
  const lastError     = ref<string>('')
  const config        = ref<PrinterConfig>(loadConfig())

  // ── Computed ──
  const isConnected = computed(() => status.value === 'connected')
  const isSupported = computed(() => 'serial' in navigator)
  const isPrinting  = computed(() => status.value === 'printing')

  // ── Persistencia de configuración ──

  function loadConfig(): PrinterConfig & { lastPrinterName?: string } {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
    } catch { /* ignore */ }
    return { ...DEFAULT_CONFIG }
  }

  function saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...config.value,
        lastPrinterName: printerName.value,
      }))
    } catch { /* ignore */ }
  }

  // ── Conexión ───────────────────────────────────────────────────────────

  /**
   * Solicita al usuario seleccionar una impresora USB/Serial y abre la conexión.
   * El navegador muestra un diálogo nativo para seleccionar el dispositivo.
   * Solo necesita llamarse una vez; la conexión persiste entre navegaciones.
   */
  async function connect(): Promise<boolean> {
    if (!isSupported.value) {
      lastError.value = 'Web Serial API no soportada en este navegador. Usa Chrome o Edge.'
      status.value = 'error'
      return false
    }

    // Si ya estamos conectados, verificar si el puerto sigue abierto
    if (globalPort && globalPort.readable) {
      status.value = 'connected'
      return true
    }

    status.value = 'connecting'
    lastError.value = ''

    try {
      // Solicitar puerto serial al usuario
      // Filtros comunes para impresoras térmicas USB
      const port = await navigator.serial.requestPort({
        filters: [
          // Epson
          { usbVendorId: 0x04B8 },
          // Star Micronics
          { usbVendorId: 0x0519 },
          // SNBC / Bixolon
          { usbVendorId: 0x1504 },
          // Citizen
          { usbVendorId: 0x1D90 },
          // POS-X / Custom
          { usbVendorId: 0x0DD4 },
        ],
      }).catch(() => {
        // Si el filtro no encuentra nada, pedir sin filtro
        return navigator.serial.requestPort()
      })

      await port.open({
        baudRate: config.value.baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
      })

      globalPort = port
      globalWriter = port.writable?.getWriter() ?? null

      if (!globalWriter) {
        throw new Error('No se pudo obtener el writer del puerto serial')
      }

      // Intentar leer info del puerto para el nombre
      const info = port.getInfo()
      printerName.value = info.usbVendorId
        ? `Impresora USB (VID:${info.usbVendorId.toString(16).toUpperCase()})`
        : 'Impresora Serial'

      status.value = 'connected'
      saveConfig()

      console.log(`🖨️ Impresora térmica conectada: ${printerName.value}`)
      return true
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        // El usuario canceló el diálogo
        lastError.value = 'No se seleccionó ninguna impresora'
        status.value = 'disconnected'
      } else {
        lastError.value = `Error de conexión: ${err.message}`
        status.value = 'error'
        console.error('🖨️ Error al conectar impresora:', err)
      }
      return false
    }
  }

  /**
   * Desconecta la impresora y libera recursos.
   */
  async function disconnect(): Promise<void> {
    try {
      if (globalWriter) {
        await globalWriter.close().catch(() => {})
        globalWriter = null
      }
      if (globalPort) {
        await globalPort.close().catch(() => {})
        globalPort = null
      }
    } catch (err) {
      console.warn('Error al desconectar:', err)
    }
    status.value = 'disconnected'
    printerName.value = ''
    console.log('🖨️ Impresora desconectada')
  }

  // ── Envío de datos ─────────────────────────────────────────────────────

  /**
   * Envía bytes crudos a la impresora.
   * Maneja reconexión automática si el puerto se cerró inesperadamente.
   */
  async function sendBytes(data: Uint8Array): Promise<boolean> {
    // Verificar conexión
    if (!globalPort || !globalPort.readable || !globalWriter) {
      // Intentar reconectar si teníamos un puerto previamente autorizado
      const ports = await navigator.serial.getPorts()
      if (ports.length > 0) {
        const port = ports[0]
        try {
          if (!port.readable) {
            await port.open({
              baudRate: config.value.baudRate,
              dataBits: 8,
              stopBits: 1,
              parity: 'none',
              flowControl: 'none',
            })
          }
          globalPort = port
          globalWriter = port.writable?.getWriter() ?? null
          if (globalWriter) {
            status.value = 'connected'
          }
        } catch (err) {
          console.error('Error al reconectar:', err)
        }
      }

      if (!globalWriter) {
        lastError.value = 'Impresora no conectada. Presiona el botón de conectar.'
        status.value = 'disconnected'
        return false
      }
    }

    status.value = 'printing'
    lastError.value = ''

    try {
      // Enviar en chunks para evitar saturar el buffer
      const CHUNK_SIZE = 4096
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, Math.min(i + CHUNK_SIZE, data.length))
        await globalWriter.write(chunk)
      }

      status.value = 'connected'
      return true
    } catch (err: any) {
      lastError.value = `Error al imprimir: ${err.message}`
      status.value = 'error'
      console.error('🖨️ Error al enviar bytes:', err)

      // Si el error es de desconexión, limpiar estado
      if (err.name === 'NetworkError' || err.message?.includes('disconnected')) {
        globalWriter = null
        globalPort = null
        status.value = 'disconnected'
      }

      return false
    }
  }

  // ── Funciones de impresión de alto nivel ────────────────────────────────

  /**
   * Imprime un ticket de pago (cobro normal).
   */
  async function printTicket(data: TicketData): Promise<boolean> {
    const opts: TicketBuildOptions = {
      paperSize: config.value.paperSize,
      openDrawer: config.value.openDrawer,
      beep: config.value.beepOnPrint,
    }
    const bytes = buildPaymentTicket(data, opts)
    return sendBytes(bytes)
  }

  /**
   * Imprime una comanda de cocina.
   */
  async function printComanda(data: ComandaData): Promise<boolean> {
    const opts: TicketBuildOptions = {
      paperSize: config.value.paperSize,
      openDrawer: false, // La comanda nunca abre el cajón
      beep: true, // Siempre beep en cocina para alertar
    }
    const bytes = buildKitchenComanda(data, opts)
    return sendBytes(bytes)
  }

  /**
   * Imprime tickets de cuentas divididas.
   */
  async function printDivided(data: DividedTicketData): Promise<boolean> {
    const opts: TicketBuildOptions = {
      paperSize: config.value.paperSize,
      openDrawer: config.value.openDrawer,
      beep: config.value.beepOnPrint,
    }
    const bytes = buildDividedTickets(data, opts)
    return sendBytes(bytes)
  }

  /**
   * Abre el cajón de dinero sin imprimir nada.
   */
  async function openCashDrawer(): Promise<boolean> {
    const { EscPosBuilder } = await import('../utils/escpos')
    const bytes = new EscPosBuilder()
      .initialize()
      .openCashDrawer()
      .build()
    return sendBytes(bytes)
  }

  /**
   * Imprime una prueba rápida para verificar la conexión.
   */
  async function printTest(): Promise<boolean> {
    const { EscPosBuilder } = await import('../utils/escpos')
    const b = new EscPosBuilder()
      .paperSize(config.value.paperSize)
      .initialize()
      .codePage(16)
      .align('center')
      .textSize('double')
      .bold()
      .textLn('EASY ORDER')
      .textSize('normal')
      .bold(false)
      .feed(1)
      .textLn('Prueba de impresion')
      .textLn(new Date().toLocaleString('es-MX'))
      .feed(1)
      .separator('-')
      .textLn('Impresora configurada correctamente')
      .textLn(`Papel: ${config.value.paperSize}`)
      .textLn(`Cajon: ${config.value.openDrawer ? 'SI' : 'NO'}`)
      .separator('-')
      .feed(1)
      .textLn('*** EASY ORDER SYSTEM ***')
      .cut()

    return sendBytes(b.build())
  }

  // ── Actualizar configuración ───────────────────────────────────────────

  function updateConfig(partial: Partial<PrinterConfig>) {
    config.value = { ...config.value, ...partial }
    saveConfig()
  }

  // ── Cleanup ────────────────────────────────────────────────────────────

  // No desconectamos onUnmounted porque el puerto es global y compartido.
  // Solo limpiamos si la página completa se cierra.
  if (typeof window !== 'undefined') {
    const cleanup = () => {
      if (globalWriter) {
        globalWriter.close().catch(() => {})
        globalWriter = null
      }
      if (globalPort) {
        globalPort.close().catch(() => {})
        globalPort = null
      }
    }
    // Registrar solo una vez
    window.removeEventListener('beforeunload', cleanup)
    window.addEventListener('beforeunload', cleanup)
  }

  // ── API pública ────────────────────────────────────────────────────────

  return {
    // Estado
    status:       readonly(status),
    isConnected,
    isSupported,
    isPrinting,
    printerName:  readonly(printerName),
    lastError:    readonly(lastError),
    config,

    // Conexión
    connect,
    disconnect,

    // Impresión
    printTicket,
    printComanda,
    printDivided,
    openCashDrawer,
    printTest,
    sendBytes,

    // Configuración
    updateConfig,
  }
}
