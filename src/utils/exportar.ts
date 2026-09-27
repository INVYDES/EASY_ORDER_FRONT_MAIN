// src/utils/exportar.ts
import { API_URL, getHeaders } from '@/config/api'

export type FormatoExport = 'xlsx' | 'csv'

const TIPOS_MIME: Record<FormatoExport, string> = {
    csv: 'text/csv;charset=utf-8;',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

/** Dispara la descarga de un blob ya generado. */
export const descargarBlob = (blob: Blob, nombre: string): void => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nombre
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * Descarga una exportación generada por el backend.
 *
 * Los endpoints `.../export` devuelven CSV (con BOM UTF-8, para que Excel
 * muestre bien acentos y ñ). El .xlsx se arma aquí con SheetJS —ya incluido
 * para la importación— para entregar un Excel real sin añadir dependencias
 * ni depender de la extensión zip de PHP del servidor.
 */
export async function exportarDesdeBackend(opciones: {
    endpoint: string
    nombreBase: string
    hoja: string
    formato?: FormatoExport
    params?: Record<string, unknown>
}): Promise<void> {
    const { endpoint, nombreBase, hoja, formato = 'xlsx', params = {} } = opciones

    const query = new URLSearchParams()
    Object.entries(params).forEach(([clave, valor]) => {
        if (valor !== null && valor !== undefined && valor !== '') {
            query.append(clave, String(valor))
        }
    })

    // Se pide el formato al backend: si el endpoint sabe generar .xlsx lo hace
    // en el servidor (mejor para catálogos grandes); si no, devolverá CSV.
    query.append('formato', formato)

    const res = await fetch(`${API_URL}${endpoint}?${query.toString()}`, {
        headers: getHeaders()
    })

    if (!res.ok) throw new Error(`Error ${res.status}`)

    // Se lee como Blob (bytes) en vez de `res.text()`: así el CSV no se duplica
    // como string completo en memoria, clave cuando el catálogo es grande.
    const blob = await res.blob()
    const fecha = new Date().toISOString().slice(0, 10)

    if (formato === 'csv') {
        descargarBlob(blob, `${nombreBase}_${fecha}.csv`)
        return
    }

    // Si el backend ya generó el .xlsx, se descarga tal cual: el navegador no
    // parsea nada (la ventaja real para catálogos grandes). Content-Type es una
    // cabecera safelisted de CORS, así que se puede leer sin exponer nada más.
    if ((res.headers.get('Content-Type') || '').toLowerCase().includes('spreadsheetml')) {
        descargarBlob(blob, `${nombreBase}_${fecha}.xlsx`)
        return
    }

    // Fallback para endpoints que solo devuelven CSV: se arma el .xlsx con
    // SheetJS. Como necesita el texto completo, para catálogos muy grandes
    // conviene elegir CSV.
    const XLSX = await import('xlsx')
    const libro = XLSX.read(await textoCSVSinBom(blob), { type: 'string' })

    const original = libro.SheetNames[0]
    libro.Sheets = { [hoja]: libro.Sheets[original] }
    libro.SheetNames = [hoja]

    const datos = XLSX.write(libro, { bookType: 'xlsx', type: 'array' })
    descargarBlob(new Blob([datos], { type: TIPOS_MIME.xlsx }), `${nombreBase}_${fecha}.xlsx`)
}

/**
 * Devuelve el texto del blob quitando el BOM UTF-8 (que rompería el primer
 * encabezado al reimportar) sin recortar el archivo entero: se comprueban solo
 * los 3 primeros bytes.
 */
async function textoCSVSinBom(blob: Blob): Promise<string> {
    if (blob.size >= 3) {
        const head = new Uint8Array(await blob.slice(0, 3).arrayBuffer())
        const tieneBom = head[0] === 0xEF && head[1] === 0xBB && head[2] === 0xBF
        if (tieneBom) return blob.slice(3).text()
    }
    return blob.text()
}

/** Una hoja de cálculo: nombre visible + filas como objetos (columna → valor). */
export interface HojaExport {
    nombre: string
    filas: Record<string, unknown>[]
}

/**
 * Genera y descarga un libro de Excel (varias hojas) o un CSV a partir de filas
 * ya armadas en el cliente. Se usa para reportes que no tienen endpoint de
 * export en el backend (por ejemplo el ROI).
 *
 * En CSV, como solo cabe una tabla, cada hoja se separa con su nombre.
 */
export async function exportarHojas(
    hojas: HojaExport[],
    nombreBase: string,
    formato: FormatoExport = 'xlsx'
): Promise<void> {
    const fecha = new Date().toISOString().slice(0, 10)
    const XLSX = await import('xlsx')

    if (formato === 'csv') {
        const partes = hojas.map(({ nombre, filas }) => {
            const hoja = XLSX.utils.json_to_sheet(filas.length ? filas : [{}])
            return `${nombre}\n${XLSX.utils.sheet_to_csv(hoja)}`
        })
        // BOM UTF-8 para que Excel muestre bien acentos y ñ.
        descargarBlob(new Blob(['\uFEFF' + partes.join('\n\n')], { type: TIPOS_MIME.csv }), `${nombreBase}_${fecha}.csv`)
        return
    }

    const libro = XLSX.utils.book_new()
    hojas.forEach(({ nombre, filas }) => {
        const hoja = XLSX.utils.json_to_sheet(filas.length ? filas : [{}])
        XLSX.utils.book_append_sheet(libro, hoja, nombre.slice(0, 31))
    })

    const datos = XLSX.write(libro, { bookType: 'xlsx', type: 'array' })
    descargarBlob(new Blob([datos], { type: TIPOS_MIME.xlsx }), `${nombreBase}_${fecha}.xlsx`)
}
