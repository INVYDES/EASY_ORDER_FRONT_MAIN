// src/config/seo.ts
// Configuración centralizada de SEO para EASY ORDER

import { PLAN_BY_ID, type PlanId } from './planes'

export const SITE_CONFIG = {
  name: 'EASY ORDER',
  shortName: 'Easy Order',
  titleTemplate: '%s | EASY ORDER',
  defaultTitle: 'EASY ORDER — Sistema de Gestión para Restaurantes | POS, Cocina y Administración',
  description:
    'EASY ORDER es el sistema integral para restaurantes. Gestiona pedidos, cocina, barra, caja y administración en tiempo real. Optimiza tu restaurante con nuestra plataforma todo en uno.',
  siteUrl: (import.meta.env.VITE_SITE_URL as string) || 'https://eorder.mx',
  // Imagen Open Graph dedicada 1200×630 (og-image.svg en /public).
  // Las redes sociales no renderizan SVG: public/og-image.png es el fallback
  // rasterizado (ver notas de despliegue en scripts/generar-og-png.mjs).
  ogImage: '/og-image.png',
  locale: 'es_ES',
  lang: 'es',
  author: 'TiendaFer',
  twitterHandle: '',
  themeColor: '#4f46e5',
  keywords: [
    'restaurante',
    'gestión restaurante',
    'POS',
    'punto de venta',
    'sistema cocina',
    'sistema bar',
    'meseros',
    'administración restaurante',
    'Easy Order',
    'software pos para restaurantes',
    'software restaurante',
    'comandas',
  ].join(', '),
} as const

export type SeoMeta = {
  title?: string
  description?: string
  keywords?: string
  image?: string
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
  type?: 'website' | 'article'
  /** JSON-LD extra para la página (se inyecta como script) */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

/**
 * Construye URL canónica absoluta.
 * Si no se pasa url, usa window.location.href en cliente.
 */
export function buildCanonical(path?: string): string {
  const base = SITE_CONFIG.siteUrl.replace(/\/+$/, '')
  if (!path) {
    if (typeof window !== 'undefined') return window.location.href.split('?')[0].split('#')[0]
    return base + '/'
  }
  if (path.startsWith('http')) return path
  return base + (path.startsWith('/') ? path : `/${path}`)
}

/** Título final con template */
export function buildTitle(pageTitle?: string): string {
  if (!pageTitle) return SITE_CONFIG.defaultTitle
  if (pageTitle.includes('EASY ORDER')) return pageTitle
  return SITE_CONFIG.titleTemplate.replace('%s', pageTitle)
}

/** Planes publicados como ofertas en el JSON-LD (precio de lista mensual) */
const OFFER_PLAN_IDS: PlanId[] = ['emprendimiento', 'basico', 'crecimiento', 'pro']

/** Ofertas derivadas de planes.ts para no duplicar precios */
const PLAN_OFFERS = OFFER_PLAN_IDS.flatMap((id) => {
  const { name, mensual } = PLAN_BY_ID[id]
  if (mensual === null) return []
  return [
    {
      '@type': 'Offer',
      name,
      price: String(mensual),
      priceCurrency: 'MXN',
      availability: 'https://schema.org/InStock',
    },
  ]
})

/**
 * JSON-LD de identidad del sitio (válido en todas las páginas).
 */
export const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'eOrder',
  alternateName: 'EASY ORDER',
  url: SITE_CONFIG.siteUrl,
  logo: `${SITE_CONFIG.siteUrl}/logo-eorder.jpg`,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'eorder.mexico@gmail.com',
    areaServed: 'MX',
    availableLanguage: 'es',
  },
} as const

/**
 * FAQ de la landing (debe coincidir con las preguntas visibles ahí).
 */
export const LANDING_FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
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
} as const

/**
 * FAQ de la página de planes (debe coincidir con las preguntas visibles ahí).
 */
export const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
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
    {
      '@type': 'Question',
      name: '¿Necesito hardware especial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No necesariamente. eOrder funciona con computadoras, tabletas y equipos que ya tengas. Te asesoramos en la implementación.',
      },
    },
  ],
} as const

/**
 * Mapa de SEO por ruta. Las rutas privadas usan noindex automáticamente
 * pero se define título/descripción para UX y si alguna se vuelve pública.
 */
export const ROUTE_SEO: Record<string, SeoMeta> = {
  '/': {
    title: 'EASY ORDER — Sistema de Gestión para Restaurantes | POS, Cocina y Administración',
    description:
      'eOrder conecta meseros, cocina, barra y caja en una sola plataforma. Gestiona pedidos, inventario y ventas de tu restaurante en tiempo real. Prueba 30 días gratis.',
    noindex: false,
    jsonLd: [ORGANIZATION_JSONLD, LANDING_FAQ_JSONLD],
  },
  '/login': {
    title: 'Iniciar Sesión | EASY ORDER',
    description: 'Accede a EASY ORDER y gestiona tu restaurante. Inicia sesión como mesero, cocina, caja, barra o administrador.',
    noindex: true,
  },
  '/registro/dueno': {
    title: 'Registro de Dueño — Crea tu Restaurante | EASY ORDER',
    description: 'Registra tu restaurante en EASY ORDER y empieza a gestionar ventas, cocina y administración en minutos.',
  },
  '/registro/cliente': {
    title: 'Registro de Cliente | EASY ORDER',
    description: 'Crea tu cuenta de cliente en EASY ORDER y realiza pedidos de forma rápida y sencilla.',
  },
  '/recuperar-contrasena': {
    title: 'Recuperar Contraseña | EASY ORDER',
    description: 'Recupera el acceso a tu cuenta de EASY ORDER. Te enviaremos un enlace para restablecer tu contraseña.',
    noindex: true,
  },
  '/reset-password': {
    title: 'Restablecer Contraseña | EASY ORDER',
    description: 'Restablece tu contraseña de EASY ORDER de forma segura.',
    noindex: true,
  },
  '/terminos-y-condiciones': {
    title: 'Términos y Condiciones | EASY ORDER',
    description: 'Consulta los términos y condiciones de uso de la plataforma EASY ORDER.',
  },
  '/politica-de-seguridad': {
    title: 'Política de Seguridad | EASY ORDER',
    description:
      'Conoce cómo EASY ORDER protege la información de tu restaurante: cifrado TLS, control de acceso por roles, aislamiento de datos por negocio, respaldos y respuesta a incidentes.',
  },
  '/gracias': {
    title: '¡Gracias! Recibimos tu solicitud | EASY ORDER',
    description: 'Tu solicitud fue recibida. Un especialista de EASY ORDER te contactará en menos de 24 horas hábiles.',
    noindex: true,
  },
  '/404': {
    title: 'Página no encontrada | EASY ORDER',
    description: 'La página que buscas no existe o cambió de dirección. Te ayudamos a volver a la sección correcta.',
    noindex: true,
  },
  '/menu': {
    title: 'Menú Digital | EASY ORDER',
    description: 'Explora el menú digital y realiza tu pedido en EASY ORDER.',
    noindex: true,
  },
  '/planes': {
    title: 'Planes eOrder — El plan ideal para tu restaurante desde $299 MXN',
    description: 'Planes eOrder para digitalizar tu restaurante desde $299 MXN/mes con 30 días gratis. Emprendimiento, Básico, Crecimiento, Pro, Food Hall y Enterprise. POS, KDS, inventario y más.',
    noindex: false,
    jsonLd: [
      ORGANIZATION_JSONLD,
      FAQ_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Planes eOrder',
        description: 'Software integral para restaurantes: POS, cocina, inventario y administración.',
        brand: { '@type': 'Brand', name: 'eOrder' },
        offers: PLAN_OFFERS,
      },
    ],
  },
  '/contactanos': {
    title: 'Contáctanos — Habla con eOrder | Asesoría para tu restaurante',
    description: 'Contacta a un distribuidor o representante de eOrder. Asesoría para elegir el plan ideal para tu restaurante. Respuesta rápida.',
    noindex: false,
  },
  '/contacto': {
    title: 'Contacto eOrder | Solicita información',
    description: 'Solicita información de eOrder y recibe asesoría personalizada para digitalizar tu restaurante.',
    noindex: false,
  },
  // Panel — privadas -> noindex
  '/panel/Gestion': {
    title: 'Gestión — Panel Administrativo | EASY ORDER',
    description: 'Panel de gestión para administradores y propietarios.',
    noindex: true,
  },
  '/panel/mesero': { title: 'Mesero — Toma de Pedidos | EASY ORDER', noindex: true },
  '/panel/cocina': { title: 'Cocina — Gestión de Órdenes | EASY ORDER', noindex: true },
  '/panel/caja': { title: 'Caja — Punto de Venta | EASY ORDER', noindex: true },
  '/panel/barra': { title: 'Barra — Gestión de Bebidas | EASY ORDER', noindex: true },
  '/panel/cliente': { title: 'Mi Pedido | EASY ORDER', noindex: true },
  '/panel/productos': { title: 'Productos — Catálogo | EASY ORDER', noindex: true },
  '/panel/contactos': { title: 'Solicitudes de contacto | EASY ORDER', noindex: true },
  '/panel/postres': { title: 'Postres — Gestión | EASY ORDER', noindex: true },
  '/panel/analisis': { title: 'Análisis y Reportes | EASY ORDER', noindex: true },
  '/panel/perfil': { title: 'Mi Perfil | EASY ORDER', noindex: true },
  '/panel/licencias': { title: 'Licencias | EASY ORDER', noindex: true },
  '/panel/nomina': { title: 'Nómina | EASY ORDER', noindex: true },
  '/panel/plataforma': { title: 'Plataforma — Super Admin | EASY ORDER', noindex: true },
}
