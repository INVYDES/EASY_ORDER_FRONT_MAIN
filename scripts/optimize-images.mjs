#!/usr/bin/env node
// scripts/optimize-images.mjs
//
// Comprime las imágenes del proyecto (public/ y src/assets/).
//
// Por defecto NO modifica nada: solo informa cuánto se ahorraría.
//
//   npm run images          → simulación (no toca archivos)
//   npm run images:write    → aplica y respalda cada original en .image-backups/
//
// Los SVG se ignoran (son vectoriales, no ganan nada comprimiéndolos).

import { copyFile, mkdir, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const RAIZ = path.resolve(import.meta.dirname, '..')
const CARPETAS = ['public', 'src/assets']
const EXTENSIONES = new Set(['.jpg', '.jpeg', '.png'])
const RESPALDO = path.join(RAIZ, '.image-backups')

const args = process.argv.slice(2)
const ESCRIBIR = args.includes('--write')
const leerArg = (nombre, defecto) => {
  const encontrado = args.find((a) => a.startsWith(`--${nombre}=`))
  return encontrado ? Number(encontrado.split('=')[1]) : defecto
}
const MAX_ANCHO = leerArg('max-width', 1920)
const CALIDAD = leerArg('quality', 80)

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`

async function* recorrer(dir) {
  if (!existsSync(dir)) return
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name)
    if (entrada.isDirectory()) {
      if (entrada.name.startsWith('.') || entrada.name === 'node_modules') continue
      yield* recorrer(completo)
    } else if (EXTENSIONES.has(path.extname(entrada.name).toLowerCase())) {
      yield completo
    }
  }
}

const comprimir = async (archivo) => {
  const original = await stat(archivo)
  const ext = path.extname(archivo).toLowerCase()

  let pipeline = sharp(archivo, { failOn: 'none' }).rotate()
  const meta = await pipeline.metadata()

  if (meta.width && meta.width > MAX_ANCHO) {
    pipeline = pipeline.resize({ width: MAX_ANCHO, withoutEnlargement: true })
  }

  pipeline = ext === '.png'
    ? pipeline.png({ quality: CALIDAD, compressionLevel: 9, palette: true })
    : pipeline.jpeg({ quality: CALIDAD, mozjpeg: true })

  const buffer = await pipeline.toBuffer()

  if (ESCRIBIR && buffer.length < original.size) {
    const relativo = path.relative(RAIZ, archivo)
    const respaldo = path.join(RESPALDO, relativo)
    await mkdir(path.dirname(respaldo), { recursive: true })
    if (!existsSync(respaldo)) await copyFile(archivo, respaldo)
    // Se escribe en un temporal y se reemplaza: en algunos sistemas de archivos
    // (unidades de red, volúmenes virtuales) abrir el original para truncar falla.
    const temporal = `${archivo}.tmp-${process.pid}`
    await writeFile(temporal, buffer)
    try {
      await rename(temporal, archivo)
    } catch (error) {
      await rm(temporal, { force: true })
      throw error
    }
  }

  return { archivo, antes: original.size, despues: buffer.length, ancho: meta.width, formato: meta.format }
}

const resultados = []
for (const carpeta of CARPETAS) {
  for await (const archivo of recorrer(path.join(RAIZ, carpeta))) {
    try {
      resultados.push(await comprimir(archivo))
    } catch (error) {
      console.error(`  ✖ ${path.relative(RAIZ, archivo)} → ${error.message}`)
    }
  }
}

if (!resultados.length) {
  console.log('No se encontraron imágenes para comprimir.')
  process.exit(0)
}

resultados.sort((a, b) => (b.antes - b.despues) - (a.antes - a.despues))

let totalAntes = 0
let totalDespues = 0

console.log(`\n  Ancho máx: ${MAX_ANCHO}px · calidad: ${CALIDAD} · modo: ${ESCRIBIR ? 'APLICAR' : 'simulación'}\n`)
console.log('  archivo'.padEnd(46) + 'antes'.padStart(10) + 'después'.padStart(12) + 'ahorro'.padStart(12))
console.log('  ' + '─'.repeat(76))

for (const r of resultados) {
  totalAntes += r.antes
  totalDespues += r.despues
  const relativo = path.relative(RAIZ, r.archivo).replace(/\\/g, '/').padEnd(44).slice(0, 44)
  const ahorro = r.antes > r.despues ? `-${((1 - r.despues / r.antes) * 100).toFixed(0)}%` : 'ya óptimo'
  console.log(`  ${relativo}${kb(r.antes).padStart(10)}${kb(r.despues).padStart(12)}${ahorro.padStart(12)}`)
}

console.log('  ' + '─'.repeat(76))
console.log(
  `  ${String(resultados.length + ' imágenes').padEnd(44)}${kb(totalAntes).padStart(10)}${kb(totalDespues).padStart(12)}` +
  `${('-' + ((1 - totalDespues / totalAntes) * 100).toFixed(0) + '%').padStart(12)}`
)

console.log(
  ESCRIBIR
    ? `\n  ✔ Cambios aplicados. Los originales están en ${path.relative(RAIZ, RESPALDO).replace(/\\/g, '/')}/\n`
    : '\n  Simulación: no se modificó ningún archivo.\n  Para aplicarlo:  npm run images:write\n'
)
