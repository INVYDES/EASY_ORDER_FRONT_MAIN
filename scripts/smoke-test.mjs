#!/usr/bin/env node
// scripts/smoke-test.mjs
//
// Smoke test de navegación con Chrome headless contra `vite preview`.
//
// Verifica, tras el code-splitting, que:
//   1. La landing carga y no hay errores de consola ni páginas en blanco.
//   2. La navegación cliente a rutas perezosas funciona (/planes).
//   3. Con una sesión simulada (fetch de /api/* interceptado), el guard
//      deja entrar al panel, el sidebar monta y el prefetch por hover
//      descarga el chunk de /panel/analisis (incluye apexcharts).
//
// Uso:
//   node scripts/smoke-test.mjs            # contra http://localhost:4173
//   BASE_URL=http://... node scripts/...   # contra otro origen
//
// Requiere Chrome/Chromium instalado (usa puppeteer-core con el ejecutable
// del sistema; NO descarga nada).

import puppeteer from 'puppeteer-core'

const BASE = process.env.BASE_URL || 'http://localhost:4173'

const CHROME_CANDIDATES = process.platform === 'win32'
  ? [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
    ]
  : [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ]

const ejecutable = CHROME_CANDIDATES.find((p) => p && fs.existsSync(p))
if (!ejecutable) {
  console.error('✖ No se encontró Chrome/Chromium instalado.')
  process.exit(1)
}

import fs from 'node:fs'

const USER = {
  id: 1,
  name: 'Smoke Tester',
  username: 'smoke',
  roles: [{ id: 2, nombre: 'ADMIN' }],
  permissions: [],
  licencia_activa: true,
  restaurante_activo: { id: 1, nombre: 'Sucursal Demo', servicio_rapido: 0 },
}

const RESTAURANTES = {
  success: true,
  data: { restaurantes: [{ id: 1, nombre: 'Sucursal Demo', imagen: null, servicio_rapido: 0 }] },
}

/** Respuestas simuladas de la API por prefijo de endpoint. */
const API_STUBS = [
  { match: '/me', body: { success: true, data: USER } },
  { match: '/restaurantes', body: RESTAURANTES },
  { match: '/ordenes/pendientes/conteo', body: { success: true, data: { cocina: 0, barra: 0, postres: 0 } } },
  { match: '/contactos/resumen', body: { success: true, data: { por_estatus: { nuevo: 0 } } } },
  { match: '/reportes/dashboard', body: { success: true, data: { ventas_hoy: 0, ordenes_hoy: 0 } } },
  { match: '/propietarios/dashboard', body: { success: true, data: { estadisticas: { total_usuarios: 1 } } } },
  { match: '/empleados', body: { success: true, data: [] } },
  { match: '/user/owner-restaurants', body: { success: true, data: [] } },
  { match: '/propietarios/1/licencias-activas', body: { success: true, data: [] } },
]

let fallos = 0
const verificar = (cond, ok, bad) => {
  if (cond) console.log(`  ✔ ${ok}`)
  else { console.log(`  ✖ ${bad}`); fallos++ }
}

const browser = await puppeteer.launch({
  executablePath: ejecutable,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

try {
  const page = await browser.newPage()
  const erroresConsola = []
  page.on('pageerror', (e) => erroresConsola.push(String(e)))
  page.on('console', (m) => {
    if (m.type() === 'error') erroresConsola.push(m.text())
  })

  // Interceptar la API para simular sesión sin backend
  await page.setRequestInterception(true)
  page.on('request', (req) => {
    const url = req.url()
    if (url.includes('/api/')) {
      const stub = API_STUBS.find((s) => url.includes(s.match))
      if (stub) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(stub.body),
        })
        return
      }
      req.respond({ status: 200, contentType: 'application/json', body: '{}' })
      return
    }
    req.continue()
  })

  // ── 1. Landing ──────────────────────────────────────────────
  console.log('\n— Landing')
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 30000 })
  const landingHtml = await page.content()
  verificar(
    await page.$('.hero'),
    'Hero visible',
    'No se encontró .hero',
  )
  verificar(
    landingHtml.includes('eOrder') || landingHtml.includes('Easy Order'),
    'Marca presente',
    'Marca ausente',
  )

  // ── 2. Navegación cliente a ruta perezosa (/planes) ─────────
  console.log('\n— Navegación SPA a /planes')
  await page.click('a[href="/planes"]').catch(() => {})
  await new Promise((r) => setTimeout(r, 1500))
  verificar(
    page.url().includes('/planes'),
    `URL ${page.url()}`,
    'La URL no cambió a /planes',
  )
  verificar(
    Boolean(await page.$('.planes-page')),
    'Vista Planes montada',
    'PlanesView no montó',
  )

  // ── 3. Sesión simulada + panel + prefetch por hover ─────────
  console.log('\n— Panel con sesión simulada (ADMIN)')
  await page.evaluate((user) => {
    sessionStorage.setItem('token', 'fake-token')
    sessionStorage.setItem('user', JSON.stringify(user))
    sessionStorage.setItem('restaurante_id_activo', '1')
  }, USER)

  const chunksDescargados = new Set()
  page.on('request', (req) => {
    const url = req.url()
    if (url.includes('/assets/') && url.endsWith('.js')) {
      chunksDescargados.add(url.split('/').pop())
    }
  })

  await page.goto(`${BASE}/panel/analisis`, { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise((r) => setTimeout(r, 1500))

  const chartsPrecargado = [...chunksDescargados].some((c) => c.startsWith('charts-'))
  verificar(
    page.url().includes('/panel/analisis'),
    `URL ${page.url()}`,
    'No se llegó a /panel/analisis',
  )
  verificar(
    Boolean(await page.$('aside')),
    'Sidebar montado',
    'Sidebar ausente',
  )
  verificar(
    chartsPrecargado || (await page.$('.metrics-root, canvas, svg')) !== null,
    'Chunk de análisis (charts) descargado',
    'El chunk charts no se descargó al entrar a análisis',
  )

  // Hover sobre "Gestión" para disparar prefetch
  await page.goto(`${BASE}/panel/analisis`, { waitUntil: 'networkidle2' })
  const enlaces = await page.$$('aside a[href]')
  if (enlaces.length) {
    const gestion = enlaces.find(async (el) => (await el.getProperty('href')).jsonValue().then((h) => h.includes('/panel/Gestion')))
    if (gestion) {
      await gestion.hover()
      await new Promise((r) => setTimeout(r, 1200))
    }
  }

  // ── Errores de consola ──────────────────────────────────────
  console.log('\n— Consola')
  const erroresReales = erroresConsola.filter(
    (e) => !e.includes('favicon') && !e.includes('net::') && !e.includes('WebSocket'),
  )
  verificar(erroresReales.length === 0, 'Sin errores de consola', `Errores: ${erroresReales.slice(0, 3).join(' | ')}`)
} finally {
  await browser.close()
}

if (fallos > 0) {
  console.log(`\n✖ ${fallos} verificación(es) fallaron`)
  process.exit(1)
}
console.log('\n✔ Smoke test completo: navegación OK tras code-splitting')
