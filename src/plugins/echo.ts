// src/plugins/echo.ts
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Echo: InstanceType<typeof Echo>
    Pusher: typeof Pusher
  }
}

window.Pusher = Pusher

// API_BASE se lee del .env (local/túnel/producción)
const API_BASE = import.meta.env.VITE_API_URL

console.log('🔌 Backend URL:', API_BASE)

// ✅ Token se lee dinámicamente en cada auth request, no al importar
const getToken = (): string =>
  localStorage.getItem('token') ?? sessionStorage.getItem('token') ?? ''

window.Echo = new Echo({
  broadcaster:       'reverb',
  key:               import.meta.env.VITE_REVERB_APP_KEY,
  wsHost:            import.meta.env.VITE_REVERB_HOST ?? 'localhost',
  wsPort:            Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
  wssPort:           Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
  forceTLS:          (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
  enabledTransports: ['ws', 'wss'],

  // ✅ Sin prefijo extra — Laravel registra la ruta en /broadcasting/auth
  authEndpoint: `${API_BASE}/broadcasting/auth`,

  // ✅ authorizer personalizado para leer el token en tiempo real
  authorizer: (channel: { name: string }) => ({
    authorize: (socketId: string, callback: (error: Error | null, data: any) => void) => {
      fetch(`${API_BASE}/broadcasting/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept':        'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          socket_id:    socketId,
          channel_name: channel.name,
        }),
      })
        .then(res => res.json())
        .then(data => callback(null, data))
        .catch(err => callback(err instanceof Error ? err : new Error(String(err)), null))
    },
  }),
})

if ('pusher' in window.Echo.connector) {
  window.Echo.connector.pusher.connection.bind('connected', () => {
    console.log('✅ WebSocket connected to Reverb')
  })

  window.Echo.connector.pusher.connection.bind('error', (err: unknown) => {
    console.warn('❌ WebSocket error:', err)
  })
}

export default window.Echo