<template>
  <div class="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
    @click.self="!procesando && $emit('close')">
    <div class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-up">

      <!-- Header -->
      <div class="sticky top-0 bg-white z-10 px-6 pt-5 pb-4 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Finalizar pedido</h2>
            <p class="text-xs text-gray-400 mt-0.5">{{ restauranteNombre }}</p>
          </div>
          <button @click="$emit('close')" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">✕</button>
        </div>
        <!-- Resumen rápido -->
        <div class="mt-3 flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-2.5">
          <div class="flex items-center gap-2 text-sm text-indigo-700">
            <span>🛒</span>
            <span class="font-medium">{{ totalItems }} producto{{ totalItems !== 1 ? 's' : '' }}</span>
          </div>
          <span class="text-base font-black text-indigo-700">${{ totalPedido.toFixed(2) }}</span>
        </div>
      </div>

      <div class="px-6 py-5 space-y-6">

        <!-- ── 1. NÚMERO DE MESA ── -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Número de Mesa <span class="text-red-500">*</span></label>
          <div class="relative">
            <span class="absolute left-4 top-3 text-xl">🍽️</span>
            <input v-model="numeroMesa" type="text" placeholder="Ej. 1, 5, Terraza 2"
              :class="['w-full pl-12 pr-4 py-3 border rounded-xl text-lg font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none',
                !numeroMesa && intentoEnvio ? 'border-red-400 bg-red-50' : 'border-gray-200']" />
          </div>
          <p v-if="!numeroMesa && intentoEnvio" class="text-xs text-red-500 mt-1">Por favor, ingresa el número de mesa</p>
        </div>

        <!-- ── 2. NOTA ── -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Nota para el restaurante <span class="text-gray-400 font-normal">(opcional)</span></label>
          <textarea v-model="nota" rows="3" placeholder="Alergias, preferencias, sin cebolla..."
            class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"></textarea>
        </div>

        <!-- Error -->
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
          <span>❌</span><span>{{ error }}</span>
        </div>

        <!-- ── BOTÓN ── -->
        <button @click="confirmar" :disabled="procesando"
          class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          <div v-if="procesando" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
          <span v-else>Enviar Pedido · ${{ totalPedido.toFixed(2) }}</span>
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  pedido:            { type: Array,  required: true },
  restauranteNombre: { type: String, default: '' },
  notaInicial:       { type: String, default: '' },
})
const emit = defineEmits(['close', 'confirmar'])

// ── Estado ─────────────────────────────────────────────────
const numeroMesa   = ref('')
const nota         = ref(props.notaInicial)
const procesando   = ref(false)
const error        = ref('')
const intentoEnvio = ref(false)

// ── Computed ───────────────────────────────────────────────
const totalItems   = computed(() => props.pedido.reduce((s,i) => s + i.cantidad, 0))
const totalPedido  = computed(() => props.pedido.reduce((s,i) => s + i.precio * i.cantidad, 0))

// ── Confirmar ──────────────────────────────────────────────
const confirmar = async () => {
  intentoEnvio.value = true
  error.value = ''

  if (!numeroMesa.value.trim()) { 
    error.value = 'Ingresa el número de mesa'
    return 
  }

  procesando.value = true

  const notaCompleta = [
    nota.value,
    `🍽️ Mesa: ${numeroMesa.value}`,
  ].filter(Boolean).join(' | ')

  emit('confirmar', {
    numero_mesa: numeroMesa.value,
    notas: notaCompleta,
  })
}

// Expuesto para que el padre maneje errores del backend
const setError = (msg) => { error.value = msg; procesando.value = false; }
const reset    = () => { procesando.value = false; }
defineExpose({ setError, reset })
</script>

<style scoped>
@keyframes fade-in  { from{opacity:0}                        to{opacity:1} }
@keyframes slide-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin     { to{transform:rotate(360deg)} }

.animate-fade-in  { animation: fade-in  0.2s ease-out; }
.animate-slide-up { animation: slide-up 0.3s ease-out; }
.animate-spin     { animation: spin 0.7s linear infinite; }
</style>