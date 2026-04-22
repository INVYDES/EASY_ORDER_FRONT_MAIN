// src/composables/useRestauranteChannel.ts
import { watch, onUnmounted, ref, type Ref } from 'vue'

type Callbacks = {
  onOrden?: (event: any) => void
  onCaja?:  (event: any) => void
}

let echoInstance: typeof window.Echo | null = null

const loadEcho = async (): Promise<typeof window.Echo | null> => {
  if (echoInstance) return echoInstance
  try {
    await import('../plugins/echo')          // ejecuta el archivo, asigna window.Echo
    echoInstance = window.Echo
    return echoInstance
  } catch (e) {
    console.warn('Echo no disponible:', e)
    return null
  }
}

export function useRestauranteChannel(
  restauranteId: Ref<number | string | null> | number | string | null,
  callbacks: Callbacks = {}
) {
  const conectado = ref(false)
  let currentId:  number | string | null = null
  let channelRef: ReturnType<typeof window.Echo.private> | null = null

  const conectar = async (id: number | string | null) => {
    if (!id || id === currentId) return
    desconectar()

    const echo = await loadEcho()
    if (!echo) return

    currentId = id
    console.log(`🔌 Conectando al canal privado: restaurante.${id}`)

    try {
      // ✅ Siempre private() — nunca channel()
      channelRef = echo.private(`restaurante.${id}`)

      channelRef
        .subscribed(() => {
          conectado.value = true
          console.log(`✅ WS conectado: restaurante.${id}`)
        })
        .error((e: unknown) => {
          conectado.value = false
          console.warn('❌ WS error:', e)
        })

      if (callbacks.onOrden) {
        channelRef.listen('.orden.actualizada', (e: any) => callbacks.onOrden!(e))
      }
      if (callbacks.onCaja) {
        channelRef.listen('.caja.actualizada', (e: any) => callbacks.onCaja!(e))
      }
    } catch (e: unknown) {
      console.warn('Error al conectar canal:', (e as Error).message)
    }
  }

  const desconectar = (): void => {
    if (currentId && echoInstance) {
      try {
        echoInstance.leave(`restaurante.${currentId}`)
      } catch {}
      channelRef  = null
      currentId   = null
      conectado.value = false
    }
  }

  // Normalizar — acepta tanto Ref como valor directo
  const idRef: Ref<number | string | null> =
    typeof restauranteId === 'object' && restauranteId !== null && 'value' in restauranteId
      ? (restauranteId as Ref<number | string | null>)
      : ref(restauranteId as number | string | null)

  watch(idRef, (nuevoId) => {
    console.log('🔄 Cambio de restauranteId:', nuevoId)
    if (nuevoId) conectar(nuevoId)
    else desconectar()
  }, { immediate: true })

  onUnmounted(desconectar)

  return { conectado }
}