// src/plugins/analytics.ts
//
// Analítica opcional, apagada por defecto.
//
// Se activa solo si defines en el .env:
//   VITE_ANALYTICS_PROVIDER = simpleanalytics | ga4
//   VITE_ANALYTICS_ID       = tu identificador
//
// Sin esas variables no se carga ningún script de terceros.
//
// Privacidad:
//  - Simple Analytics no usa cookies: se carga salvo que el usuario haya dicho
//    explícitamente "solo lo necesario" en el banner.
//  - GA4 sí usa cookies: solo se carga si el usuario aceptó todo.
//  - Las rutas privadas (panel, menú, login, registro) no se rastrean.

type Proveedor = 'simpleanalytics' | 'ga4'

const PROVEEDOR = (import.meta.env.VITE_ANALYTICS_PROVIDER as string | undefined)?.toLowerCase() as Proveedor | undefined
const ID = import.meta.env.VITE_ANALYTICS_ID as string | undefined
const CLAVE_CONSENT = 'eo_cookies_consent'

/** Rutas que nunca se envían a analítica (contienen datos del negocio o del usuario). */
const RUTAS_PRIVADAS = ['/panel', '/menu', '/login', '/registro', '/recuperar-contrasena', '/reset-password']

let cargado = false

const consentimiento = (): string | null => {
  try { return localStorage.getItem(CLAVE_CONSENT) } catch { return null }
}

export const esRutaPrivada = (ruta: string): boolean =>
  RUTAS_PRIVADAS.some((prefijo) => ruta === prefijo || ruta.startsWith(prefijo + '/'))

/** ¿Está configurada la analítica? */
export const analyticsDisponible = (): boolean =>
  Boolean(PROVEEDOR && ID) && (PROVEEDOR === 'simpleanalytics' || PROVEEDOR === 'ga4')

const puedeCargar = (): boolean => {
  const aceptado = consentimiento()
  if (PROVEEDOR === 'ga4') return aceptado === 'aceptado'
  // Simple Analytics es cookieless: solo se evita si el usuario lo rechazó.
  return aceptado !== 'rechazado'
}

const inyectarScript = (src: string, attrs: Record<string, string> = {}) => {
  if (document.querySelector(`script[data-analytics="true"]`)) return
  const script = document.createElement('script')
  script.src = src
  script.defer = true
  script.setAttribute('data-analytics', 'true')
  Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v))
  document.head.appendChild(script)
}

/** Carga el proveedor si está configurado y el usuario lo permite. */
export const initAnalytics = (): void => {
  if (cargado || !analyticsDisponible() || !puedeCargar()) return
  cargado = true

  if (PROVEEDOR === 'simpleanalytics') {
    inyectarScript('https://scripts.simpleanalyticscdn.com/latest.js', { 'data-api': ID as string })
    return
  }

  // GA4
  const gtag = document.createElement('script')
  gtag.async = true
  gtag.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`
  gtag.setAttribute('data-analytics', 'true')
  document.head.appendChild(gtag)

  const inline = document.createElement('script')
  inline.setAttribute('data-analytics', 'true')
  inline.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${ID}', { send_page_view: false });
  `
  document.head.appendChild(inline)
}

/** Registra una vista de página. Se llama en cada navegación. */
export const trackPageview = (ruta: string, titulo?: string, esPrimera = false): void => {
  if (!cargado || esRutaPrivada(ruta)) return

  if (PROVEEDOR === 'ga4') {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    w.gtag?.('event', 'page_view', {
      page_path: ruta,
      page_title: titulo || document.title,
      page_location: window.location.href,
    })
    return
  }

  // Simple Analytics rastrea la navegación del SPA por su cuenta; solo se
  // fuerza la primera vista por si el script terminó de cargar después.
  if (esPrimera) {
    const w = window as unknown as { sa_event?: (n: string) => void }
    w.sa_event?.(`vista_${ruta === '/' ? 'inicio' : ruta.replace(/^\//, '').replace(/\//g, '_')}`)
  }
}

/** Reacciona a la decisión del banner de cookies sin recargar la página. */
export const escucharConsentimiento = (): void => {
  window.addEventListener('eo:cookies-consent', () => {
    if (cargado) return
    initAnalytics()
    if (cargado && PROVEEDOR === 'ga4') trackPageview(window.location.pathname)
  })
}
