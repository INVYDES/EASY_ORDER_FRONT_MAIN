# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TiendaFer - Restaurant Management System Frontend

A Vue 3 + TypeScript + Vite SPA for restaurant operations including: POS (caja), kitchen display (cocina), bar management (barra), waiter interface (mesero), customer ordering (cliente), and administration.

## Development Commands

```bash
# Development server (hot-reload)
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

# Deploy to Laravel backend (builds + copies to ../Back-endApi/public/dist)
deploy.bat
```

## Project Architecture

### Tech Stack
- **Framework**: Vue 3 with Composition API (`<script setup>`)
- **Language**: TypeScript (strict mode enabled)
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 (`@import "tailwindcss"` in index.css)
- **State**: Pinia stores (src/stores/)
- **Routing**: Vue Router with role-based guards
- **Real-time**: Laravel Echo + Reverb WebSockets

### Backend Integration
- Backend is a separate Laravel API located at `../Back-endApi`
- WebSocket server runs via `php artisan reverb:start`
- Auth tokens stored in localStorage/sessionStorage
- API base URL configured via `VITE_API_URL` in .env

### Directory Structure

```
src/
├── views/           # Page-level components (role-based: cajaviews.vue, cocinaview.vue, etc.)
├── components/      # Reusable components organized by feature
│   ├── caja/        # Cash register components
│   ├── cocina/      # Kitchen display components
│   ├── cliente/     # Customer-facing components
│   ├── productos/   # Product management
│   ├── layout/      # AppSidebar, AppHeader, PanelLayout
│   └── ...
├── stores/          # Pinia state management
│   ├── caja.ts      # Cash register state, tickets, movements
│   ├── orden.ts     # Current order being built
│   ├── productos.ts # Product catalog with stock
│   ├── mesero.ts    # Waiter orders
│   ├── cocina.ts    # Kitchen orders
│   └── barra.ts     # Bar orders
├── composables/     # Vue composables (useRestauranteChannel for WebSockets)
├── plugins/         # echo.ts - Laravel Echo initialization
├── config/          # api.ts - API constants and headers helper
├── router/          # index.ts - Role-based routing + guards
└── data/            # Mock data (products.ts, users.ts, etc.)
```

### Role-Based Access

Routes protected by `meta.roles` array. Available roles:
- `MESERO` - Waiter interface
- `COCINA` - Kitchen display
- `CAJA` - Cash register/POS
- `BARRA` - Bar management
- `ADMIN` / `PROPIETARIO` - Administration panel
- `CLIENTE` - Customer ordering

Router redirects authenticated users to their default role route (`defaultRouteForRole` in router/index.ts).

### WebSocket Integration

Real-time updates via Laravel Reverb:
- **Setup**: `src/plugins/echo.ts` configures Echo with dynamic token retrieval
- **Composable**: `useRestauranteChannel()` manages private channel subscriptions
- **Pattern**: Components subscribe to `restaurante.${id}` channel, listen for events like `.orden.actualizada`
- **Auth**: Custom authorizer reads Bearer token from storage at connection time

### API Communication Pattern

```typescript
// src/config/api.ts exports:
const API_BASE_URL = import.meta.env.VITE_API_URL  // cleaned base
const API_URL = `${API_BASE_URL}/api`
const STORAGE_URL = `${API_BASE_URL}/storage/`
const getHeaders() // Returns headers with Bearer token from localStorage/sessionStorage
```

### State Management Patterns

Stores use Pinia with Options API style (state/getters/actions):
- `caja.ts` - Manages tickets, movements, closures; has `isOpen` flag blocking operations when closed
- `orden.ts` - Current cart; syncs with `productos.ts` for stock management
- Cross-store communication via store imports (e.g., `useMeseroStore()` inside `orden.ts` actions)

### Path Aliases

`@/` maps to `src/` - use for all imports:
```typescript
import { useCajaStore } from '@/stores/caja'
import ProductCard from '@/components/cliente/productocard.vue'
```

## Environment Variables

```env
VITE_API_URL=http://localhost:8000           # Laravel backend URL
VITE_REVERB_HOST=localhost                   # WebSocket host
VITE_REVERB_PORT=8080                        # WebSocket port
VITE_REVERB_SCHEME=http                      # http/https
VITE_REVERB_APP_KEY=local                    # Reverb app key
```

For tunnelling (Cloudflare/ngrok/devtunnels), see DEPLOY.md for full configuration.

## Important Implementation Details

- **Stock Management**: Decrements on add to order, returns on remove/increment
- **Caja State**: `isOpen` flag blocks all transactions when false (after closeRegister)
- **Auth Token**: Read dynamically via `getToken()` in echo.ts, not cached at import
- **Build Output**: `base: '/dist/'` in vite.config.ts - Laravel serves from this path
