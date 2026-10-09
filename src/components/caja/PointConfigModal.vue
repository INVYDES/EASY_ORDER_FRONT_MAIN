<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">

      <!-- Encabezado -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="text-lg font-semibold text-gray-800">Terminal Point</h2>
          <p class="text-xs text-gray-400">Mercado Pago · cobros en terminal</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>

      <!-- Cargando -->
      <div v-if="cargando" class="py-10 text-center text-gray-400 text-sm">Cargando estado…</div>

      <template v-else>
        <!-- Estado de la cuenta -->
        <div class="rounded-xl border p-4 mb-5"
          :class="estado.conectado ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="estado.conectado ? 'bg-emerald-500' : 'bg-amber-500'"></span>
            <p class="text-sm font-semibold" :class="estado.conectado ? 'text-emerald-700' : 'text-amber-700'">
              {{ estado.conectado ? 'Cuenta de Mercado Pago conectada' : 'Sin cuenta conectada' }}
            </p>
          </div>

          <div v-if="estado.conectado" class="mt-2 text-xs text-gray-600 space-y-0.5">
            <p><span class="text-gray-400">Usuario MP:</span> {{ estado.mp_user_id || '—' }}</p>
            <p><span class="text-gray-400">Modo:</span> {{ estado.live_mode ? 'Producción' : 'Pruebas' }}</p>
            <p v-if="!estado.vigente" class="text-red-600 font-medium">La conexión expiró: vuelve a conectar la cuenta.</p>
          </div>

          <div class="flex gap-2 mt-4">
            <button v-if="!estado.conectado || !estado.vigente" @click="conectar" :disabled="procesando"
              class="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
              Conectar Mercado Pago
            </button>
            <button v-if="estado.conectado" @click="desconectar" :disabled="procesando"
              class="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition disabled:opacity-50">
              Desconectar
            </button>
          </div>
        </div>

        <!-- Terminales -->
        <div v-if="estado.conectado">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm font-semibold text-gray-700">Terminales</p>
            <button @click="sincronizar" :disabled="procesando"
              class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50">
              ↻ Sincronizar
            </button>
          </div>

          <div v-if="!terminales.length" class="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-6 text-center">
            No hay terminales. Empareja una en la app de Mercado Pago y pulsa "Sincronizar".
          </div>

          <div v-else class="space-y-2">
            <div v-for="t in terminales" :key="t.id"
              class="flex items-center justify-between gap-3 border border-gray-100 rounded-xl px-4 py-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">{{ t.alias || 'Terminal' }}</p>
                <p class="text-[11px] text-gray-400 font-mono truncate">{{ t.terminal_id }}</p>
                <p class="text-[11px] text-gray-400">
                  Modo {{ t.operating_mode }}
                  · {{ t.print_on_terminal === 'seller_ticket' ? 'Imprime ticket' : 'Sin ticket' }}
                </p>
              </div>
              <button @click="toggleActivo(t)" :disabled="procesando"
                class="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition disabled:opacity-50"
                :class="t.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'">
                {{ t.is_active ? 'Activo' : 'Inactivo' }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Mensajes -->
      <div v-if="mensaje" class="mt-4 p-3 text-sm rounded-xl"
        :class="error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
        {{ mensaje }}
      </div>

      <div class="flex justify-end mt-6">
        <button @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
          Cerrar
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '@/utils/apiClient'

defineEmits(['close'])

const cargando   = ref(true)
const procesando = ref(false)
const mensaje    = ref('')
const error      = ref(false)

const estado = ref({
  conectado: false,
  vigente: false,
  mp_user_id: null,
  live_mode: false,
  connected_at: null,
})
const terminales = ref([])

const setMensaje = (texto, esError = false) => {
  mensaje.value = texto
  error.value = esError
}

const cargarEstado = async () => {
  cargando.value = true
  try {
    const res = await apiClient.get('/caja/mercadopago/oauth/estado')
    const d = res?.data || {}
    estado.value = {
      conectado: !!d.conectado,
      vigente: !!d.vigente,
      mp_user_id: d.mp_user_id || null,
      live_mode: !!d.live_mode,
      connected_at: d.connected_at || null,
    }
    terminales.value = d.terminales || []
  } catch (e) {
    setMensaje(e?.message || 'No se pudo consultar el estado de Mercado Pago.', true)
  } finally {
    cargando.value = false
  }
}

const conectar = async () => {
  procesando.value = true
  mensaje.value = ''
  try {
    const res = await apiClient.get('/caja/mercadopago/oauth/conectar')
    if (res?.authorization_url) {
      window.location.href = res.authorization_url
      return
    }
    setMensaje(res?.message || 'No se obtuvo la URL de autorización.', true)
  } catch (e) {
    setMensaje(e?.message || 'No se pudo iniciar la conexión con Mercado Pago.', true)
  } finally {
    procesando.value = false
  }
}

const desconectar = async () => {
  if (!confirm('¿Desconectar la cuenta de Mercado Pago de esta sucursal?')) return
  procesando.value = true
  mensaje.value = ''
  try {
    await apiClient.post('/caja/mercadopago/oauth/desconectar', {})
    await cargarEstado()
    setMensaje('Cuenta desconectada.', false)
  } catch (e) {
    setMensaje(e?.message || 'No se pudo desconectar la cuenta.', true)
  } finally {
    procesando.value = false
  }
}

const sincronizar = async () => {
  procesando.value = true
  mensaje.value = ''
  try {
    const res = await apiClient.get('/caja/mercadopago/point/terminales')
    terminales.value = res?.data || []
    setMensaje(`Terminales sincronizadas (${terminales.value.length}).`, false)
  } catch (e) {
    setMensaje(e?.message || 'No se pudieron sincronizar las terminales.', true)
  } finally {
    procesando.value = false
  }
}

const toggleActivo = async (t) => {
  procesando.value = true
  mensaje.value = ''
  try {
    await apiClient.post('/caja/mercadopago/point/terminales', {
      terminal_id: t.terminal_id,
      alias: t.alias,
      store_id: t.store_id,
      pos_id: t.pos_id,
      print_on_terminal: t.print_on_terminal,
      is_active: !t.is_active,
    })
    t.is_active = !t.is_active
  } catch (e) {
    setMensaje(e?.message || 'No se pudo actualizar la terminal.', true)
  } finally {
    procesando.value = false
  }
}

onMounted(cargarEstado)
</script>
