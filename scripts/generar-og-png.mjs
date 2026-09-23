#!/usr/bin/env node
// scripts/generar-og-png.mjs
//
// Rasteriza public/og-image.svg → public/og-image.png (1200×630).
//
// Las redes sociales (Facebook, X/Twitter, LinkedIn, WhatsApp) no renderizan
// SVG al mostrar la tarjeta de Open Graph, así que la imagen oficial de OG
// debe ser PNG/JPG. Este script usa sharp (ya es dependencia del proyecto)
// para convertir el SVG —que sí se edita cómodamente— a PNG.
//
// Uso:
//   node scripts/generar-og-png.mjs          # genera public/og-image.png
//   node scripts/generar-og-png.mjs --check  # falla si el PNG está desactualizado (CI)

import { readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const RAIZ = path.resolve(import.meta.dirname, '..')
const SVG = path.join(RAIZ, 'public', 'og-image.svg')
const PNG = path.join(RAIZ, 'public', 'og-image.png')

const svg = await readFile(SVG, 'utf8')
const png = await sharp(Buffer.from(svg), { density: 96 })
  .resize(1200, 630)
  .png({ compressionLevel: 9 })
  .toBuffer()

if (process.argv.includes('--check')) {
  try {
    const info = await stat(PNG)
    const actual = await sharp(PNG).metadata()
    if (actual.width !== 1200 || actual.height !== 630) {
      console.error('✖ og-image.png no mide 1200×630. Regenera con: node scripts/generar-og-png.mjs')
      process.exit(1)
    }
    console.log(`✔ og-image.png OK (${(info.size / 1024).toFixed(0)} KB, ${actual.width}×${actual.height})`)
  } catch {
    console.error('✖ Falta public/og-image.png. Genera con: node scripts/generar-og-png.mjs')
    process.exit(1)
  }
} else {
  await writeFile(PNG, png)
  console.log(`✔ public/og-image.png generado (${(png.length / 1024).toFixed(0)} KB, 1200×630)`)
}
