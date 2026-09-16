// src/config/seo.ts
// Configuración centralizada de SEO para EASY ORDER

export const SITE_CONFIG = {
  name: 'EASY ORDER',
  shortName: 'Easy Order',
  titleTemplate: '%s | EASY ORDER',
  defaultTitle: 'EASY ORDER — Sistema de Gestión para Restaurantes | POS, Cocina y Administración',
  description:
    'EASY ORDER es el sistema integral para restaurantes. Gestiona pedidos, cocina, barra, caja y administración en tiempo real. Optimiza tu restaurante con nuestra plataforma todo en uno.',
  siteUrl: (import.meta.env.VITE_SITE_URL as string) || 'https://eorder.mx',
  ogImage: '/logo.svg',
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
    'TiendaFer',
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

/**
 * Mapa de SEO por ruta. Las rutas privadas usan noindex automáticamente
 * pero se define título/descripción para UX y si alguna se vuelve pública.
 */
export const ROUTE_SEO: Record<string, SeoMeta> = {
  '/': {
    title: 'Iniciar Sesión | EASY ORDER',
    description: 'Accede a EASY ORDER y gestiona tu restaurante. Inicia sesión como mesero, cocina, caja, barra o administrador.',
    noindex: false,
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
  '/menu': {
    title: 'Menú Digital | EASY ORDER',
    description: 'Explora el menú digital y realiza tu pedido en EASY ORDER.',
    noindex: true,
  },
  '/planes': {
    title: 'Planes eOrder — El plan ideal para tu restaurante desde $299 MXN',
    description: 'Planes eOrder para digitalizar tu restaurante desde $299 MXN/mes con 30 días gratis. Emprendimiento, Básico, Crecimiento, Pro, Food Hall y Enterprise. POS, KDS, inventario y más.',
    noindex: false,
    jsonLd: {
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
    },
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
