# Frontend Vue - Deploy a Laravel

## Inicio Rápido

### 1. Desarrollo Local (con hot-reload)

```bash
# Terminal 1 - Backend
cd ../Back-endApi
php artisan serve
php artisan reverb:start

# Terminal 2 - Frontend (desarrollo)
npm run dev
```

Abre: http://localhost:5173

### 2. Deploy (Laravel sirve el frontend)

```bash
# Ejecutar script de deploy
deploy.bat

# Terminal 1 - Backend
cd ../Back-endApi
php artisan serve
php artisan reverb:start
```

Abre: http://localhost:8000

---

## Configurar Túnel

Cuando uses un túnel (Cloudflare/ngrok/devtunnels), actualiza ambos `.env`:

### Frontend `.env`

```env
# Descomenta esto y pon tu URL:
VITE_API_URL=https://TU-TUNNEL.usw3.devtunnels.ms/api
VITE_REVERB_HOST=TU-TUNNEL.usw3.devtunnels.ms
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

### Backend `.env`

```env
# Descomenta esto y pon tu URL:
APP_URL=https://TU-TUNNEL.usw3.devtunnels.ms/
SANCTUM_STATEFUL_DOMAINS=TU-TUNNEL.usw3.devtunnels.ms
SESSION_DOMAIN=.usw3.devtunnels.ms
SESSION_SECURE_COOKIE=true

REVERB_HOST=TU-TUNNEL.usw3.devtunnels.ms
REVERB_PORT=443
REVERB_SCHEME=https
```

Luego ejecuta `deploy.bat` para rebuild.

---

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo con hot-reload |
| `npm run build` | Build para producción |
| `deploy.bat` | Build + copia al backend |

---

## Estructura

```
proyecto_limpio_mas_platilla/
├── src/              # Código fuente Vue
├── dist/             # Build (se copia al backend)
├── .env              # Variables de entorno
├── deploy.bat        # Script de deploy
└── vite.config.ts    # Configuración Vite
```
