<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
    @click.self="!procesando && $emit('close')">
    <div class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-slide-up">

      <!-- Header -->
      <div class="bg-white z-10 px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-black text-gray-900 tracking-tight">Finalizar pedido</h2>
            <p class="text-xs text-indigo-600 font-bold mt-0.5">{{ restauranteNombre || 'Kiosko de Menú' }}</p>
          </div>
          <button @click="$emit('close')" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition font-bold">✕</button>
        </div>
        <!-- Resumen rápido -->
        <div class="mt-3 flex items-center justify-between bg-indigo-50/80 border border-indigo-100 rounded-2xl px-4 py-2.5">
          <div class="flex items-center gap-2 text-xs font-black text-indigo-700 uppercase tracking-wider">
            <span>🛒</span>
            <span>{{ totalItems }} producto{{ totalItems !== 1 ? 's' : '' }}</span>
          </div>
          <span class="text-lg font-black text-indigo-700 leading-none">${{ totalPedido.toFixed(2) }}</span>
        </div>
      </div>

      <div class="px-6 py-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar">

        <!-- ── 1. TIPO DE ENTREGA (Comer aquí vs Para llevar) ── -->
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2.5">¿Dónde disfrutarás tu comida?</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="seleccionarTipoEntrega('comer_aqui')"
              :class="['p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center',
                tipoEntrega === 'comer_aqui'
                  ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700 shadow-md shadow-indigo-100 scale-[1.02]'
                  : 'border-slate-100 bg-slate-50/60 text-slate-600 hover:border-slate-200']">
              <span class="text-2xl">🍽️</span>
              <span class="text-xs font-black uppercase tracking-tight">Comer aquí</span>
            </button>

            <button
              type="button"
              @click="seleccionarTipoEntrega('para_llevar')"
              :class="['p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center',
                tipoEntrega === 'para_llevar'
                  ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700 shadow-md shadow-indigo-100 scale-[1.02]'
                  : 'border-slate-100 bg-slate-50/60 text-slate-600 hover:border-slate-200']">
              <span class="text-2xl">🛍️</span>
              <span class="text-xs font-black uppercase tracking-tight">Para llevar</span>
            </button>
          </div>
        </div>

        <!-- ── 2. SELECCIÓN DE MESA (Solo si es 'comer_aqui') ── -->
        <div v-if="tipoEntrega === 'comer_aqui'" class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-black text-gray-700 uppercase tracking-widest">
              Selecciona tu mesa <span class="text-red-500">*</span>
            </label>
            <span v-if="numeroMesa" class="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Mesa {{ numeroMesa }} seleccionada ✔
            </span>
          </div>

          <!-- Selector táctil de botones de mesas -->
          <div class="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50 custom-scrollbar">
            <button
              v-for="m in listaMesas"
              :key="m"
              type="button"
              @click="numeroMesa = m"
              :class="['py-3 rounded-xl font-black text-sm transition-all flex flex-col items-center justify-center border',
                numeroMesa === m
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-105 z-10'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30']">
              <span class="text-[9px] uppercase tracking-tighter opacity-70">Mesa</span>
              <span class="text-base leading-none">{{ m }}</span>
            </button>
          </div>

          <p v-if="!numeroMesa && intentoEnvio" class="text-xs font-bold text-red-500 mt-1 animate-pulse">
            ⚠️ Por favor toca tu número de mesa para continuar
          </p>
        </div>

        <!-- Mensaje cuando es 'para_llevar' -->
        <div v-else class="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <span class="text-2xl">📦</span>
          <div class="text-left">
            <p class="text-xs font-black text-emerald-800 uppercase tracking-tight">Pedido para llevar</p>
            <p class="text-[11px] font-bold text-emerald-600 mt-0.5">Se te llamará por tu número de ticket en mostrador.</p>
          </div>
        </div>

        <!-- ── 3. NOTAS ADICIONALES ── -->
        <div>
          <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">
            Nota para el restaurante <span class="text-gray-400 font-normal lowercase">(opcional)</span>
          </label>
          <textarea
            v-model="nota"
            rows="2"
            placeholder="Alergias, sin salsa, servilletas extras..."
            class="w-full px-4 py-3 border border-gray-200 rounded-2xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 resize-none"></textarea>
        </div>

        <!-- Error -->
        <div v-if="error" class="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-2">
          <span>❌</span><span>{{ error }}</span>
        </div>

      </div>

      <!-- ── BOTÓN CONFIRMAR ── -->
      <div class="p-5 border-t border-slate-100 bg-white shrink-0">
        <button
          @click="confirmar"
          :disabled="procesando"
          class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-black rounded-2xl transition-all text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50">
          <div v-if="procesando" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
          <span v-else>Confirmar Pedido · ${{ totalPedido.toFixed(2) }} ✨</span>
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
  totalMesas:        { type: [Number, String], default: 12 },
})
const emit = defineEmits(['close', 'confirmar'])

// ── Estado ─────────────────────────────────────────────────
const tipoEntrega  = ref('comer_aqui') // 'comer_aqui' | 'para_llevar'
const numeroMesa   = ref(null)
const nota         = ref(props.notaInicial)
const procesando   = ref(false)
const error        = ref('')
const intentoEnvio = ref(false)

// ── Lista de mesas disponibles ─────────────────────────────
const listaMesas = computed(() => {
  const cant = Number(props.totalMesas)
  const total = (!isNaN(cant) && cant > 0) ? cant : 15
  return Array.from({ length: total }, (_, i) => i + 1)
})

// ── Computed ───────────────────────────────────────────────
const totalItems   = computed(() => props.pedido.reduce((s,i) => s + (Number(i.cantidad) || 1), 0))
const totalPedido  = computed(() => props.pedido.reduce((s,i) => s + (Number(i.precio) || 0) * (Number(i.cantidad) || 1), 0))

const seleccionarTipoEntrega = (tipo) => {
  tipoEntrega.value = tipo
  error.value = ''
  if (tipo === 'para_llevar') {
    numeroMesa.value = null
  }
}

// ── Confirmar ──────────────────────────────────────────────
const confirmar = async () => {
  intentoEnvio.value = true
  error.value = ''

  if (tipoEntrega.value === 'comer_aqui' && !numeroMesa.value) { 
    error.value = 'Por favor selecciona el número de tu mesa'
    return 
  }

  procesando.value = true

  const infoLugar = tipoEntrega.value === 'para_llevar'
    ? '🛍️ Para llevar'
    : `🍽️ Mesa: ${numeroMesa.value}`

  const notaCompleta = [
    nota.value,
    infoLugar
  ].filter(Boolean).join(' | ')

  emit('confirmar', {
    numero_mesa:  tipoEntrega.value === 'para_llevar' ? null : Number(numeroMesa.value),
    tipo_entrega: tipoEntrega.value,
    notas:        notaCompleta,
  })
}

// Expuesto para que el padre maneje errores del backend
const setError = (msg) => { error.value = msg; procesando.value = false; }
const reset    = () => { procesando.value = false; }
defineExpose({ setError, reset })
</script>

<style scoped>
@keyframes fade-in  { from{opacity:0} to{opacity:1} }
@keyframes slide-up { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin     { to{transform:rotate(360deg)} }

.animate-fade-in  { animation: fade-in  0.2s ease-out; }
.animate-slide-up { animation: slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.animate-spin     { animation: spin 0.7s linear infinite; }

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>