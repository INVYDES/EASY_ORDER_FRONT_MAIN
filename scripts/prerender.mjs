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

// JSON-LD de identidad del sitio (debe mantenerse sincronizado con src/config/seo.ts)
const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'eOrder',
  alternateName: 'EASY ORDER',
  url: SITE_URL,
  logo: `${SITE_URL}/logo-eorder.jpg`,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'eorder.mexico@gmail.com',
    areaServed: 'MX',
    availableLanguage: 'es',
  },
}

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    // FAQ de la landing (6) — sincronizado con src/config/seo.ts
    {
      '@type': 'Question',
      name: '¿Necesito comprar hardware especializado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. eOrder funciona desde cualquier navegador web, iPad, tablet Android o computadora convencional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si se cae el internet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El POS cuenta con modo de resiliencia local para seguir registrando ventas y sincronizar automáticamente cuando la conexión vuelva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo cancelar en cualquier momento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sin plazos forzosos ni letras chiquitas. Cancela o cambia de plan con un clic desde tu panel.',
      },
    },
    // FAQ de planes (4)
    {
      '@type': 'Question',
      name: '¿Puedo cambiar de plan después?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, puedes escalar o reducir tu plan en cualquier momento. El cambio aplica en el siguiente ciclo de facturación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los precios incluyen IVA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, todos los precios mostrados son en MXN e incluyen IVA.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué incluye la prueba de 30 días?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Acceso completo a todas las funciones de tu plan (menos Enterprise) para una sucursal, sin compromiso ni tarjeta.',
      },
    },
  ],
}

const LANDING_FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_JSONLD.mainEntity.slice(0, 6),
}

const PLANES_FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    ...FAQ_JSONLD.mainEntity.slice(3, 6),
    {
      '@type': 'Question',
      name: '¿Necesito hardware especial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No necesariamente. eOrder funciona con computadoras, tabletas y equipos que ya tengas. Te asesoramos en la implementación.',
      },
    },
  ],
}

const PLANES_PRODUCT_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Planes eOrder',
  description: 'Software integral para restaurantes: POS, cocina, inventario y administración.',
  brand: { '@type': 'Brand', name: 'eOrder' },
  offers: [
    { '@type': 'Offer', name: 'Emprendimiento', price: '299', priceCurrency: 'MXN', availability: 'https://schema.org/InStock' },
    { '@type': 'Offer', name: 'Básico', price: '899', priceCurrency: 'MXN', availability: 'https://schema.org/InStock' },
    { '@type': 'Offer', name: 'Crecimiento', price: '1899', priceCurrency: 'MXN', availability: 'https://schema.org/InStock' },
    { '@type': 'Offer', name: 'Pro', price: '3399', priceCurrency: 'MXN', availability: 'https://schema.org/InStock' },
  ],
}

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
    jsonLd: [ORGANIZATION_JSONLD, LANDING_FAQ_JSONLD],
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
  '/planes': {
    title: 'Planes eOrder — El plan ideal para tu restaurante desde $299 MXN',
    description: 'Planes eOrder para digitalizar tu restaurante desde $299 MXN/mes con 30 días gratis. Emprendimiento, Básico, Crecimiento, Pro, Food Hall y Enterprise. POS, KDS, inventario y más.',
    robots: 'index, follow',
    jsonLd: [ORGANIZATION_JSONLD, PLANES_FAQ_JSONLD, PLANES_PRODUCT_JSONLD],
  },
  '/contactanos': {
    title: 'Contáctanos — Habla con eOrder | Asesoría para tu restaurante',
    description: 'Contacta a un distribuidor o representante de eOrder. Asesoría para elegir el plan ideal para tu restaurante. Respuesta rápida.',
    robots: 'index, follow',
    jsonLd: [ORGANIZATION_JSONLD],
  },
}

const routes = Object.keys(ROUTE_SEO)

let template = fs.readFileSync(TEMPLATE_PATH, 'utf8')

function patchHtml(html, route, seo) {
  const title = buildTitle(seo.title)
  const desc = seo.description || DEFAULT_DESC
  const canonical = buildCanonical(route)
  const robots = seo.robots || 'index, follow'
  const ogImage = `${SITE_URL}/logo-eorder.jpg`

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

  // JSON-LD por ruta: elimina los inyectados dinámicamente heredados del template
  // y agrega solo los que corresponden a esta página (marcados con data-seo-jsonld)
  out = out.replace(/<script type="application\/ld\+json" data-seo-jsonld="true">[\s\S]*?<\/script>/g, '')
  if (seo.jsonLd && seo.jsonLd.length) {
    const scripts = seo.jsonLd
      .map((obj) => `<script type="application/ld+json" data-seo-jsonld="true">${JSON.stringify(obj)}</script>`)
      .join('\n  ')
    out = out.replace(/<\/head>/, `  ${scripts}\n</head>`)
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
