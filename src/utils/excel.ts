// src/utils/excel.ts
import { descargarBlob } from '@/utils/exportar'

const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/**
 * Lee un archivo CSV/Excel y devuelve sus filas como objetos.
 *
 * SheetJS (~430 KB minificado) se importa de forma diferida: solo se descarga
 * cuando el usuario realmente elige un archivo, no al abrir el panel.
 */
export async function leerFilasDeArchivo(file: File): Promise<Record<string, any>[]> {
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const libro = XLSX.read(new Uint8Array(buffer), { type: 'array' })
    const hoja = libro.Sheets[libro.SheetNames[0]]

    return XLSX.utils.sheet_to_json(hoja)
}

/**
 * Genera y descarga una plantilla .xlsx vacía con los encabezados indicados,
 * para que el usuario la llene en Excel respetando el formato de importación.
 */
export async function descargarPlantillaExcel(
    columnas: string[],
    nombreArchivo: string,
    hoja = 'Datos'
): Promise<void> {
    const XLSX = await import('xlsx')
    const hojaDatos = XLSX.utils.aoa_to_sheet([columnas])
    hojaDatos['!cols'] = columnas.map(() => ({ wch: 18 }))

    const libro = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro, hojaDatos, hoja)

    const datos = XLSX.write(libro, { bookType: 'xlsx', type: 'array' })
    descargarBlob(new Blob([datos], { type: MIME_XLSX }), nombreArchivo)
}
