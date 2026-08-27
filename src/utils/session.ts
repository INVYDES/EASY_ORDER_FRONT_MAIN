// src/utils/session.ts
//
// ACCESO DE SESIÓN AISLADA POR PESTAÑA.
//
// `localStorage` es COMPARTIDO entre todas las pestañas/ventanas del mismo
// navegador. Por eso, si se inicia sesión con 2 restaurantes en la misma PC,
// ambos sobrescriben las mismas claves (token, user, restaurante_id, ...) y
// los datos se mezclan.
//
// La solución: `sessionStorage` es PRIVADO por pestaña, así que la sesión de
// cada pestaña/restaurante queda aislada. Estas funciones SIEMPRE leen primero
// de `sessionStorage` y usan `localStorage` solo como respaldo (persistencia
// de "keep me logged in") cuando `sessionStorage` está vacío.

// Claves de sesión que NO deben compartirse entre restaurantes.
export const SESSION_KEYS = [
  'token',
  'user',
  'restaurante_id',
  'restaurante_id_activo',
  'restaurante_activo',
  'restaurante_nombre',
  'cliente_restaurante_id',
]

const isSessionKey = (key: string): boolean => SESSION_KEYS.includes(key)

/**
 * Lee el valor actual de la sesión para `key`.
 * Prioriza sessionStorage (por pestaña) y usa localStorage como respaldo.
 */
export function sessionGet(key: string): string | null {
  if (!isSessionKey(key)) return localStorage.getItem(key)
  const tabValue = sessionStorage.getItem(key)
  if (tabValue !== null) return tabValue
  return localStorage.getItem(key)
}

/**
 * Escribe el valor:
 *  - sessionStorage SIEMPRE (aisla por pestaña)
 *  - localStorage SOLO si `persist` es true (mantener sesión entre recargas)
 */
export function sessionSet(key: string, value: string, persist = false): void {
  if (!isSessionKey(key)) {
    localStorage.setItem(key, value)
    return
  }
  sessionStorage.setItem(key, value)
  if (persist) localStorage.setItem(key, value)
}

/**
 * Elimina la clave de sessionStorage y de localStorage.
 */
export function sessionRemove(key: string): void {
  if (!isSessionKey(key)) {
    localStorage.removeItem(key)
    return
  }
  sessionStorage.removeItem(key)
  localStorage.removeItem(key)
}

// Conveniencias para el flujo de login/logout.

export function getSessionToken(): string | null {
  return sessionGet('token')
}

export function getSessionUser(): any | null {
  const raw = sessionGet('user')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function getSessionRestauranteId(): string | null {
  return sessionGet('restaurante_id_activo') ?? sessionGet('restaurante_id')
}

export function setLoginSession(token: string, user: unknown, persist = false): void {
  sessionSet('token', token, persist)
  sessionSet('user', JSON.stringify(user), persist)
}

export function clearSession(): void {
  SESSION_KEYS.forEach((k) => {
    sessionStorage.removeItem(k)
    localStorage.removeItem(k)
  })
}