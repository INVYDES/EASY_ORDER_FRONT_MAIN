# Conexiones — EASY ORDER FRONT

Todo lo necesario para conectar este front con el resto del sistema: back Laravel + MySQL,
WebSockets (Reverb), WhatsApp (evolution-api), correo y el deploy en Cloudflare.

---

## 1. Mapa del sistema

```
                        ┌─────────────────────────────────────────────┐
  Visitante ──https──►  │ Cloudflare Worker "eorder" (worker.js)      │
                        │ assets estáticos desde dist/ (wrangler.toml)│
                        └─────────────────────────────────────────────┘
                                        │
                                        ▼
                        Vue 3 + Vite (SPA, este repo)
                          │
              HTTP/JSON   │                WebSockets (protocolo Pusher)
                          ▼                             ▼
        ┌──────────────────────────────┐   ┌───────────────────────────┐
        │ Back Laravel 12 (PHP 8.2)    │   │ Reverb                    │
        │ local  http://localhost:8000 │   │ local ws://localhost:8080 │
        │ prod   (Cloud Run, us-central1)   │ prod wss://…:443          │
        └──────────────┬───────────────┘   └───────────────────────────┘
                       ▼
        ┌──────────────────────────────┐   evolution-api (WhatsApp)
        │ MySQL                        │◄── docker, http://localhost:8080
        │ prod: Railway (proxy)        │    panel: http://localhost:3000
        │ local: 127.0.0.1:3306        │
        └──────────────────────────────┘
```

Repos: **front** `INVYDES/EASY_ORDER_FRONT_MAIN` (este) · **back** `INVYDES/EASY_ORDER_BACK_MAIN`
(el detalle de DB, Reverb, WhatsApp y Cloud Run vive en `CONEXIONES.md` del repo del back).

---

## 2. Variables de entorno

| Variable | Para qué sirve | Local | Producción |
|---|---|---|---|
| `VITE_API_URL` | Base de la API. El código le quita el `/api` final y lo vuelve a añadir (`src/config/api.ts`) | `http://localhost:8000` | `https://easy-order-back-201452705980.us-central1.run.app` |
| `VITE_REVERB_HOST` | Host de los WebSockets | `localhost` | host de Cloud Run |
| `VITE_REVERB_PORT` | Puerto de los WebSockets | `8080` | `443` |
| `VITE_REVERB_SCHEME` | `http` (→ `ws`) o `https` (→ `wss`) | `http` | `https` |
| `VITE_REVERB_APP_KEY` | Key pública de la app Reverb. **Debe coincidir** con `REVERB_APP_KEY` del back | — | — |

Archivos `.env` versionados en esta rama:

| Archivo | Para qué se usa |
|---|---|
| `.env` | Desarrollo local (back en `localhost:8000`, Reverb en `localhost:8080`) |
| `.env.production` | Build de producción (Cloud Run + `wss` en 443) |
| `.env.server` | Build apuntando al mismo back de producción (se usó para pruebas desde servidor) |
| `.env.old` | Respaldo del hosting anterior (`corion.mx/cws/eorder/backend/public/index.php`) |

> ⚠️ **Estos `.env` contienen credenciales reales y están versionados en la rama `conexiones`.**
> Si el repo se comparte o se hace público, rota `REVERB_APP_KEY` y cualquier token que aparezca
> ahí, y muévelos a variables de entorno del CI en lugar de al repo.

---

## 3. Cómo se conecta el código

**API** — `src/config/api.ts`

```ts
const base = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const cleanBase = base.replace(/\/+$/, '').replace(/\/api$/, '')

export const API_BASE_URL = cleanBase          // https://…run.app
export const API_URL      = `${cleanBase}/api` // + /api
export const STORAGE_URL  = `${cleanBase}/storage/`  // imágenes y archivos
```

- `getHeaders()` añade `Authorization: Bearer <token>` (Sanctum) y `X-Restaurante-Id`
  (el restaurante activo de la sesión).
- `src/utils/apiClient.ts` es el wrapper que usa todo el front; los endpoints se piden
  relativos, ej. `apiClient.get('/ordenes')`.

**WebSockets** — `src/plugins/echo.ts`

```ts
window.Pusher = Pusher
new Echo({ broadcaster: 'reverb', key: VITE_REVERB_APP_KEY, wsHost: VITE_REVERB_HOST,
           wsPort: VITE_REVERB_PORT, forceTLS: VITE_REVERB_SCHEME === 'https',
           authEndpoint: `${API_BASE_URL}/broadcasting/auth` })
```

El canal privado se autoriza contra el back (`/broadcasting/auth`), por eso el token de sesión
y el `CORS_ALLOWED_ORIGINS` del back tienen que permitir el origen del front.

**Proxy de desarrollo** — `vite.config.ts`

```ts
server: {
  port: 5173,
  proxy: { '/cws/eorder/api': { target: 'http://192.168.1.71:8000', changeOrigin: true } }
}
```

Es una ruta heredada del hosting viejo (`corion.mx/cws/eorder/...`). Si tu back no está en esa
IP de la red local, cámbiala por `http://localhost:8000` o por la IP de tu máquina; el front no
usa ese prefijo (usa `VITE_API_URL`), así que solo afecta a pruebas que lo llamen directo.

---

## 4. Levantarlo en local

```bash
# 1. Back (otro repo)
cd EASY_ORDER_BACK_MAIN && php artisan serve --host=0.0.0.0 --port=8000
php artisan reverb:start --host=0.0.0.0 --port=8080   # WebSockets

# 2. Front
npm install
npm run dev          # http://localhost:5173
```

El back debe tener en su `.env`: `FRONTEND_URL=http://localhost:5173` y
`CORS_ALLOWED_ORIGINS` / `SANCTUM_STATEFUL_DOMAINS` incluyendo `localhost:5173`.

---

## 5. Deploy

```bash
npm run build            # vite build + prerender de rutas públicas + og-image
npm run deploy           # build + wrangler deploy   (worker "eorder")
npm run deploy:wrangler  # solo sube dist/ si ya compilaste
```

- `wrangler.toml`: worker `eorder`, `main = worker.js`, assets desde `dist/`.
- Dominios: `https://eorder.mx` (+ `www`) y `https://eorder.eorder-mexico.workers.dev`.
- El `build` prerenderiza `/`, `/planes`, `/contactanos`, legales, login y registro con el
  `<head>` de cada ruta (`scripts/prerender.mjs`, `SITE_URL=https://eorder.mx`).
- Los `.env` **no** se leen en runtime: se hornean en el bundle al compilar (Vite). Para cambiar
  de back hay que recompilar.

---

## 6. Checklist para conectar un entorno nuevo

1. `VITE_API_URL` apuntando al back (sin `/api` final, se añade solo).
2. `VITE_REVERB_*` con la misma `REVERB_APP_KEY` y host/puerto del servidor Reverb de ese entorno.
3. Back con `CORS_ALLOWED_ORIGINS`, `SANCTUM_STATEFUL_DOMAINS` y `FRONTEND_URL` con el origen del front.
4. `APP_URL` del back alcanzable desde el navegador (para `/storage/` y las imágenes).
5. Prueba rápida: login → `/panel/Gestion`, y una comanda para ver que llega por WebSocket sin recargar.
