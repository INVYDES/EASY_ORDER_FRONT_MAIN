// ─────────────────────────────────────────────────────────────────────────────
// src/utils/escpos.ts
// ESC/POS Command Builder for thermal receipt printers (80mm / 58mm)
// Compatible with: Epson TM-T20/T88, Star TSP, generic Chinese printers
// ─────────────────────────────────────────────────────────────────────────────

/** Ancho estándar en caracteres por tamaño de papel */
export const PAPER_WIDTHS = {
  '80mm': 48,   // Caracteres por línea en fuente normal (Font A)
  '58mm': 32,
} as const

export type PaperSize = keyof typeof PAPER_WIDTHS

/** Alineación de texto */
export type Alignment = 'left' | 'center' | 'right'

/** Tamaño de texto */
export type TextSize = 'normal' | 'double-height' | 'double-width' | 'double'

/**
 * Builder de comandos ESC/POS.
 * Encadena llamadas y al final genera un Uint8Array listo para enviar.
 *
 * @example
 * const bytes = new EscPosBuilder()
 *   .initialize()
 *   .align('center')
 *   .textSize('double')
 *   .text('MI RESTAURANTE')
 *   .textSize('normal')
 *   .feed(1)
 *   .align('left')
 *   .text('Producto          $10.00')
 *   .feed(2)
 *   .cut()
 *   .build()
 */
export class EscPosBuilder {
  private chunks: Uint8Array[] = []
  private encoder = new TextEncoder()
  private _paperSize: PaperSize = '80mm'

  get lineWidth(): number {
    return PAPER_WIDTHS[this._paperSize]
  }

  /** Configura el tamaño de papel (afecta lineWidth para paddings) */
  paperSize(size: PaperSize): this {
    this._paperSize = size
    return this
  }

  // ── Comandos base ──────────────────────────────────────────────────────

  /** Agrega bytes crudos */
  raw(bytes: number[]): this {
    this.chunks.push(new Uint8Array(bytes))
    return this
  }

  /** ESC @ — Inicializa la impresora (reset) */
  initialize(): this {
    return this.raw([0x1B, 0x40])
  }

  // ── Texto ──────────────────────────────────────────────────────────────

  /** Escribe texto (sin salto de línea) */
  text(content: string): this {
    // Codificar como Latin-1/CP437 para máxima compatibilidad con impresoras
    // Usamos TextEncoder (UTF-8) pero la mayoría de impresoras lo aceptan
    this.chunks.push(this.encoder.encode(content))
    return this
  }

  /** Escribe texto + salto de línea */
  textLn(content: string): this {
    return this.text(content + '\n')
  }

  /** LF — Salto de línea (n veces) */
  feed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.raw([0x0A])
    }
    return this
  }

  // ── Formato ────────────────────────────────────────────────────────────

  /** ESC a n — Alineación (0=izq, 1=centro, 2=der) */
  align(alignment: Alignment): this {
    const n = alignment === 'center' ? 1 : alignment === 'right' ? 2 : 0
    return this.raw([0x1B, 0x61, n])
  }

  /** ESC E n — Negrita on/off */
  bold(on: boolean = true): this {
    return this.raw([0x1B, 0x45, on ? 1 : 0])
  }

  /** ESC - n — Subrayado (0=off, 1=1px, 2=2px) */
  underline(mode: 0 | 1 | 2 = 1): this {
    return this.raw([0x1B, 0x2D, mode])
  }

  /** GS ! n — Tamaño de carácter */
  textSize(size: TextSize): this {
    const val = {
      'normal':        0x00,
      'double-height': 0x01,
      'double-width':  0x10,
      'double':        0x11, // doble ancho + doble alto
    }[size]
    return this.raw([0x1D, 0x21, val])
  }

  /** ESC M n — Seleccionar fuente (0=Font A 12×24, 1=Font B 9×17) */
  font(n: 0 | 1 = 0): this {
    return this.raw([0x1B, 0x4D, n])
  }

  /** GS B n — Invertir blanco/negro */
  invert(on: boolean = true): this {
    return this.raw([0x1D, 0x42, on ? 1 : 0])
  }

  // ── Líneas y separadores ───────────────────────────────────────────────

  /** Línea horizontal con un carácter repetido */
  separator(char: string = '-'): this {
    return this.textLn(char.repeat(this.lineWidth))
  }

  /** Separador doble */
  doubleSeparator(): this {
    return this.separator('=')
  }

  /** Separador punteado */
  dottedSeparator(): this {
    return this.separator('.')
  }

  // ── Columnas / Tabla ───────────────────────────────────────────────────

  /**
   * Escribe dos columnas justificadas (izquierda y derecha).
   * Útil para líneas tipo "Producto          $10.00"
   */
  columns(left: string, right: string): this {
    const maxLeft = this.lineWidth - right.length - 1
    const leftTrimmed = left.length > maxLeft ? left.substring(0, maxLeft) : left
    const padding = this.lineWidth - leftTrimmed.length - right.length
    const spaces = padding > 0 ? ' '.repeat(padding) : ' '
    return this.textLn(leftTrimmed + spaces + right)
  }

  /**
   * Escribe tres columnas (cantidad, descripción, importe).
   * Para líneas tipo "2x  Hamburguesa         $200.00"
   */
  threeColumns(col1: string, col2: string, col3: string, widths?: [number, number, number]): this {
    const [w1, w2, w3] = widths || [5, this.lineWidth - 15, 10]
    const c1 = col1.substring(0, w1).padEnd(w1)
    const c3 = col3.substring(0, w3).padStart(w3)
    const remaining = this.lineWidth - w1 - w3
    const c2 = col2.length > remaining ? col2.substring(0, remaining) : col2.padEnd(remaining)
    return this.textLn(c1 + c2 + c3)
  }

  // ── Corte de papel ─────────────────────────────────────────────────────

  /** GS V — Corte de papel (parcial por defecto) */
  cut(full: boolean = false): this {
    // Feed antes del corte para que el texto quede visible
    this.feed(3)
    if (full) {
      return this.raw([0x1D, 0x56, 0x00]) // Corte total
    }
    return this.raw([0x1D, 0x56, 0x01])   // Corte parcial
  }

  // ── Cajón de dinero ────────────────────────────────────────────────────

  /** ESC p — Abrir cajón de dinero (pin 2 por defecto) */
  openCashDrawer(pin: 0 | 1 = 0): this {
    // pin 0 = conector 2 (más común), pin 1 = conector 5
    return this.raw([0x1B, 0x70, pin, 25, 250])
  }

  // ── Beep / Sonido ──────────────────────────────────────────────────────

  /** ESC B — Hacer sonar el buzzer (si la impresora lo soporta) */
  beep(times: number = 1, duration: number = 3): this {
    return this.raw([0x1B, 0x42, times, duration])
  }

  // ── Código de barras / QR (básico) ─────────────────────────────────────

  /** Imprime un código de barras CODE128 */
  barcode(data: string): this {
    // Establecer posición HRI debajo del código
    this.raw([0x1D, 0x48, 0x02])
    // Altura del código de barras (50 dots)
    this.raw([0x1D, 0x68, 50])
    // Ancho del código de barras
    this.raw([0x1D, 0x77, 2])
    // CODE128, longitud, datos
    const bytes = [0x1D, 0x6B, 73, data.length + 2, 0x7B, 0x42]
    for (let i = 0; i < data.length; i++) {
      bytes.push(data.charCodeAt(i))
    }
    return this.raw(bytes)
  }

  // ── Codificación ───────────────────────────────────────────────────────

  /** ESC t n — Seleccionar tabla de códigos
   *  0 = PC437 (USA)
   *  2 = PC850 (Multilingual)
   * 16 = WPC1252 (Windows Latin-1) — el mejor para español
   */
  codePage(page: number = 16): this {
    return this.raw([0x1B, 0x74, page])
  }

  // ── Build ──────────────────────────────────────────────────────────────

  /** Genera el Uint8Array final con todos los comandos acumulados */
  build(): Uint8Array {
    const totalLength = this.chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of this.chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }
    return result
  }
}
