#!/usr/bin/env node
// scripts/prerender.mjs — Genera HTML estático por ruta pública para SEO crawlable en Cloudflare Workers

import fs from 'fs'
import path from 'path'

const SITE_URL = (process.env.VITE_SITE_URL || 'https://eorder.mx').replace(/\/+$/, '')
const DIST = path.resolve('dist')
const TEMPLATE_PATH = path.join(DIST, 'index.html')

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error(`[prerender] No se encontró ${TEMPLATE_PATH}. Ejecuta vite build primero.`)
  process.exit(1)
}

const SITE_NAME = 'EASY ORDER'
const DEFAULT_TITLE = 'EASY ORDER — Sistema de Gestión para Restaurantes | POS, Cocina y Administración'
const DEFAULT_DESC = 'EASY ORDER es el sistema integral para restaurantes. Gestiona pedidos, cocina, barra, caja y administración en tiempo real. Optimiza tu restaurante con nuestra plataforma todo en uno.'

function buildTitle(pageTitle) {
  if (!pageTitle) return DEFAULT_TITLE
  if (pageTitle.includes('EASY ORDER')) return pageTitle
  return `${pageTitle} | EASY ORDER`
}

function buildCanonical(route) {
  if (!route || route === '/') return `${SITE_URL}/`
  return `${SITE_URL}${route.startsWith('/') ? route : '/' + route}`
}

// Mapa SEO — debe mantenerse sincronizado con src/config/seo.ts
const ROUTE_SEO = {
  '/': {
    title: 'EASY ORDER — Sistema de Gestión para Restaurantes | POS, Cocina y Administración',
    description:
      'eOrder conecta meseros, cocina, barra y caja en una sola plataforma. Gestiona pedidos, inventario y ventas de tu restaurante en tiempo real. Prueba 30 días gratis.',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  },
  '/login': {
    title: 'Iniciar Sesión | EASY ORDER',
    description: 'Accede a EASY ORDER y gestiona tu restaurante. Inicia sesión como mesero, cocina, caja, barra o administrador.',
    robots: 'noindex, follow',
  },
  '/registro/dueno': {
    title: 'Registro de Dueño — Crea tu Restaurante | EASY ORDER',
    description: 'Registra tu restaurante en EASY ORDER y empieza a gestionar ventas, cocina y administración en minutos.',
    robots: 'index, follow',
  },
  '/registro/cliente': {
    title: 'Registro de Cliente | EASY ORDER',
    description: 'Crea tu cuenta de cliente en EASY ORDER y realiza pedidos de forma rápida y sencilla.',
    robots: 'index, follow',
  },
  '/recuperar-contrasena': {
    title: 'Recuperar Contraseña | EASY ORDER',
    description: 'Recupera el acceso a tu cuenta de EASY ORDER. Te enviaremos un enlace para restablecer tu contraseña.',
    robots: 'noindex, follow',
  },
  '/reset-password': {
    title: 'Restablecer Contraseña | EASY ORDER',
    description: 'Restablece tu contraseña de EASY ORDER de forma segura.',
    robots: 'noindex, follow',
  },
  '/terminos-y-condiciones': {
    title: 'Términos y Condiciones | EASY ORDER',
    description: 'Consulta los términos y condiciones de uso de la plataforma EASY ORDER.',
    robots: 'index, follow',
  },
}

const routes = Object.keys(ROUTE_SEO)

let template = fs.readFileSync(TEMPLATE_PATH, 'utf8')

function patchHtml(html, route, seo) {
  const title = buildTitle(seo.title)
  const desc = seo.description || DEFAULT_DESC
  const canonical = buildCanonical(route)
  const robots = seo.robots || 'index, follow'
  const ogImage = `${SITE_URL}/logo.svg`

  let out = html

  // title tag
  out = out.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
  // meta title
  out = out.replace(/<meta name="title" content="[^"]*" \/>/, `<meta name="title" content="${escapeAttr(title)}" />`)
  // description
  out = out.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeAttr(desc)}" />`)
  // robots
  out = out.replace(/<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="${escapeAttr(robots)}" />`)
  // canonical
  out = out.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${escapeAttr(canonical)}" />`)
  // og
  out = out.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${escapeAttr(canonical)}" />`)
  out = out.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeAttr(title)}" />`)
  out = out.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeAttr(desc)}" />`)
  out = out.replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${escapeAttr(ogImage)}" />`)
  // twitter
  out = out.replace(/<meta name="twitter:url" content="[^"]*" \/>/, `<meta name="twitter:url" content="${escapeAttr(canonical)}" />`)
  out = out.replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeAttr(title)}" />`)
  out = out.replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeAttr(desc)}" />`)
  out = out.replace(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${escapeAttr(ogImage)}" />`)

  // JSON-LD breadcrumb + SoftwareApplication tweak (opcional): inyecta canonical correcto en el JSON-LD existente
  // Reemplaza "url": "https://eorder.mx/" por canonical en el script JSON-LD (solo el de SoftwareApplication/Organization)
  // Hacemos un reemplazo simple: si route !== '/', reemplazamos la url base en los ld+json
  if (route !== '/') {
    // No romper el JSON: reemplazar solo la url del sitio por la canónica no sería correcto para Organization.
    // Mejor dejar la url base de Organization como SITE_URL y solo asegurar que el canonical esté bien.
  }

  return out
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

console.log(`[prerender] SITE_URL=${SITE_URL}`)
console.log(`[prerender] Generando ${routes.length} rutas...`)

// Primero parchear el index raíz también (asegurar consistencia con SITE_URL env)
const rootSeo = ROUTE_SEO['/']
const patchedRoot = patchHtml(template, '/', rootSeo)
if (patchedRoot !== template) {
  fs.writeFileSync(TEMPLATE_PATH, patchedRoot, 'utf8')
  template = patchedRoot
  console.log('[prerender] ✔ / (index.html) actualizado')
} else {
  console.log('[prerender] ✔ / sin cambios')
}

// Generar subrutas
for (const route of routes) {
  if (route === '/') continue
  const seo = ROUTE_SEO[route]
  const html = patchHtml(template, route, seo)
  const dir = path.join(DIST, route.replace(/^\//, ''))
  fs.mkdirSync(dir, { recursive: true })
  const outPath = path.join(dir, 'index.html')
  fs.writeFileSync(outPath, html, 'utf8')
  console.log(`[prerender] ✔ ${route} -> ${path.relative(DIST, outPath)}`)
}

console.log('[prerender] Listo.')
