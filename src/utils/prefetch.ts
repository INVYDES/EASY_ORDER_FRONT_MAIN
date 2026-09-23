// src/utils/prefetch.ts
//
// Precarga de chunks de rutas perezosas al hacer hover/focus.
//
// Tras el code-splitting, cada vista del panel vive en su propio chunk.
// Para que la navegación se sienta instantánea, el menú lateral precarga el
// chunk de la ruta cuando el usuario apunta con el cursor (o navega con
// teclado) hacia el enlace: cuando hace clic, el código ya está en memoria.
//
// La técnica es la que documenta vue-router para lazy loading: resolver la
// misma función de import que declara la ruta. El navegador descarga el
// chunk una vez; llamadas repetidas se ignoran porque el módulo queda en la
// caché de módulos del bundler.
//
// Uso en el template:
//   <RouterLink to="/panel/caja" @mouseenter="prefetchRuta" @focusin="prefetchRuta">

import type { Router } from 'vue-router'

/**
 * Devuelve el componente (o su Promise) asociado a una ruta del router.
 * Soporta las tres formas que usa este proyecto:
 *  - componente ya resuelto (landing, import estático)
 *  - función async () => import('...')  ← las rutas perezosas
 */
function resolverComponenteRuta(router: Router, to: string): any | null {
  const resuelta = router.resolve(to)
  const componente = (resuelta?.matched?.[0]?.components ?? {})?.default
  if (!componente) return null
  return componente
}

const promesasEnCurso = new Map<string, Promise<unknown>>()

/**
 * Precarga el chunk de una ruta perezosa por su path.
 * Idempotente: si ya se precargó o hay una descarga en curso, no hace nada.
 */
export function prefetchRuta(router: Router, to: string): void {
  try {
    const componente = resolverComponenteRuta(router, to)
    if (typeof componente !== 'function') return // estática o ya resuelta

    if (!promesasEnCurso.has(to)) {
      promesasEnCurso.set(
        to,
        Promise.resolve(componente()).catch(() => {
          // Si falla la descarga (offline, deploy nuevo), limpiar para poder
          // reintentar en el próximo hover.
          promesasEnCurso.delete(to)
        }),
      )
    }
  } catch {
    // router.resolve puede fallar en edge cases; prefetch es best-effort.
  }
}

/** Igual que prefetchRuta pero pensado para usar directo en el template. */
export function crearPrefetchDeRutas(router: Router) {
  return (to: string) => prefetchRuta(router, to)
}
