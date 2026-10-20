<template>
  <div class="fixed inset-0 bg-[#202723]/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
    @click.self="!procesando && cerrar()">
    <div class="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col overflow-hidden border border-[#DDE3DE] animate-slide-up">

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- VISTA 1: FORMULARIO DE CHECKOUT                                   -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <template v-if="paso === 'checkout'">
        <!-- Header Checkout -->
        <div class="bg-white z-10 px-5 pt-4 pb-3 border-b border-[#DDE3DE] shrink-0">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-[#202723] tracking-tight">Finalizar pedido</h2>
              <p class="text-xs text-[#245C4F] font-semibold mt-0.5">{{ restauranteNombre || 'Kiosko de Menú' }}</p>
            </div>
            <button @click="cerrar" :disabled="procesando" class="w-8 h-8 rounded-lg bg-[#F0F2EF] flex items-center justify-center text-[#68736C] hover:bg-[#DDE3DE] hover:text-[#202723] transition font-bold disabled:opacity-30 cursor-pointer">
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
          <!-- Resumen rápido -->
          <div class="mt-3 flex items-center justify-between bg-[#F6F7F5] border border-[#DDE3DE] rounded-xl px-4 py-2.5">
            <div class="flex items-center gap-2 text-xs font-semibold text-[#68736C] uppercase tracking-wider">
              <i class="fa-solid fa-cart-shopping text-[#245C4F]"></i>
              <span>{{ totalItems }} producto{{ totalItems !== 1 ? 's' : '' }}</span>
            </div>
            <span class="text-base font-bold text-[#245C4F] leading-none">${{ totalPedido.toFixed(2) }}</span>
          </div>
        </div>

        <div class="px-5 py-4 space-y-5 overflow-y-auto flex-1 custom-scrollbar">

          <!-- ── 1. TIPO DE ENTREGA (Comer aquí vs Para llevar) ── -->
          <div>
            <label class="block text-xs font-bold text-[#68736C] uppercase tracking-wider mb-2">¿Dónde disfrutarás tu comida?</label>
            <div class="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                @click="seleccionarTipoEntrega('comer_aqui')"
                :class="['p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer',
                  tipoEntrega === 'comer_aqui'
                    ? 'border-[#245C4F] bg-[#E8F1ED] text-[#245C4F] shadow-xs'
                    : 'border-[#DDE3DE] bg-[#F6F7F5] text-[#68736C] hover:border-[#245C4F]/30 hover:text-[#202723]']">
                <i class="fa-solid fa-utensils text-xl"></i>
                <span class="text-xs font-bold uppercase tracking-wide">Comer aquí</span>
              </button>

              <button
                type="button"
                @click="seleccionarTipoEntrega('para_llevar')"
                :class="['p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer',
                  tipoEntrega === 'para_llevar'
                    ? 'border-[#245C4F] bg-[#E8F1ED] text-[#245C4F] shadow-xs'
                    : 'border-[#DDE3DE] bg-[#F6F7F5] text-[#68736C] hover:border-[#245C4F]/30 hover:text-[#202723]']">
                <i class="fa-solid fa-bag-shopping text-xl"></i>
                <span class="text-xs font-bold uppercase tracking-wide">Para llevar</span>
              </button>
            </div>
          </div>

          <!-- ── 2. SELECCIÓN DE MESA (Solo si es 'comer_aqui') ── -->
          <div v-if="tipoEntrega === 'comer_aqui'" class="space-y-2.5">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-[#202723] uppercase tracking-wider">
                Selecciona tu mesa <span class="text-[#B93838]">*</span>
              </label>
              <span v-if="numeroMesa" class="text-xs font-semibold text-[#245C4F] bg-[#E8F1ED] px-2 py-0.5 rounded-lg flex items-center gap-1">
                <span>Mesa {{ numeroMesa }}</span>
                <i class="fa-solid fa-check text-[10px]"></i>
              </span>
            </div>

            <!-- Selector táctil de botones de mesas -->
            <div class="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-44 overflow-y-auto p-1.5 border border-[#DDE3DE] rounded-xl bg-[#F6F7F5] custom-scrollbar">
              <button
                v-for="m in listaMesas"
                :key="m"
                type="button"
                @click="numeroMesa = m"
                :class="['py-2.5 rounded-lg font-bold text-sm transition flex flex-col items-center justify-center border cursor-pointer',
                  numeroMesa === m
                    ? 'bg-[#245C4F] text-white border-[#245C4F] shadow-xs'
                    : 'bg-white text-[#202723] border-[#DDE3DE] hover:border-[#245C4F]/40 hover:bg-[#E8F1ED]/50']">
                <span class="text-[9px] uppercase tracking-wider opacity-70">Mesa</span>
                <span class="text-sm font-bold leading-none mt-0.5">{{ m }}</span>
              </button>
            </div>

            <p v-if="!numeroMesa && intentoEnvio" class="text-xs font-semibold text-[#B93838] flex items-center gap-1 mt-1">
              <i class="fa-solid fa-circle-exclamation text-xs"></i>
              <span>Por favor toca tu número de mesa para continuar</span>
            </p>
          </div>

          <!-- Mensaje cuando es 'para_llevar' -->
          <div v-else class="p-3.5 bg-[#E8F1ED] border border-[#245C4F]/20 rounded-xl flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-[#245C4F]/10 text-[#245C4F] flex items-center justify-center shrink-0">
              <i class="fa-solid fa-box text-base"></i>
            </div>
            <div class="text-left">
              <p class="text-xs font-bold text-[#245C4F] uppercase tracking-wide">Pedido para llevar</p>
              <p class="text-[11px] text-[#202723]/80 mt-0.5">Se te llamará por tu número de ticket en mostrador.</p>
            </div>
          </div>

          <!-- ── 3. NOTAS ADICIONALES ── -->
          <div>
            <label class="block text-xs font-bold text-[#202723] uppercase tracking-wider mb-1.5">
              Nota para el restaurante <span class="text-[#68736C] font-normal lowercase">(opcional)</span>
            </label>
            <textarea
              v-model="nota"
              rows="2"
              placeholder="Alergias, sin salsa, servilletas extras..."
              class="w-full px-3 py-2 border border-[#DDE3DE] rounded-xl text-xs font-medium bg-[#F6F7F5] focus:bg-white focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] outline-none transition placeholder:text-[#68736C]/60 resize-none"></textarea>
          </div>

          <!-- Error -->
          <div v-if="error" class="p-3 bg-[#FEF2F2] border border-[#B93838]/30 text-[#B93838] text-xs font-semibold rounded-xl flex items-center gap-2">
            <i class="fa-solid fa-circle-exclamation text-xs shrink-0"></i>
            <span>{{ error }}</span>
          </div>

        </div>

        <!-- ── BOTÓN CONFIRMAR ── -->
        <div class="p-4 border-t border-[#DDE3DE] bg-[#F6F7F5] shrink-0">
          <button
            @click="confirmar"
            :disabled="procesando"
            class="w-full py-3 bg-[#245C4F] hover:bg-[#19483D] active:scale-[0.99] text-white font-semibold rounded-xl transition text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer">
            <div v-if="procesando" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
            <span v-else class="flex items-center gap-2">
              <i class="fa-solid fa-circle-check text-xs"></i>
              Confirmar Pedido · ${{ totalPedido.toFixed(2) }}
            </span>
          </button>
        </div>
      </template>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- VISTA 2: NÚMERO DE TICKET GENERADO (ÉXITO KIOSKO)                  -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <template v-else-if="paso === 'ticket'">
        <!-- Header Éxito -->
        <div class="bg-white z-10 px-5 pt-4 pb-3 border-b border-[#DDE3DE] shrink-0 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#26734D] animate-ping"></span>
            <span class="text-xs font-bold text-[#26734D] uppercase tracking-wider">Pedido Generado con Éxito</span>
          </div>
          <button @click="cerrar" class="w-8 h-8 rounded-lg bg-[#F0F2EF] flex items-center justify-center text-[#68736C] hover:bg-[#DDE3DE] hover:text-[#202723] transition cursor-pointer">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div class="px-5 py-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar text-center">

          <!-- Checkmark animado -->
          <div class="w-14 h-14 rounded-full bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-2xl mx-auto ring-4 ring-[#E8F1ED]/60">
            <i class="fa-solid fa-check"></i>
          </div>

          <!-- TARJETA TICKET DE ATENCIÓN DESTACADO -->
          <div class="bg-white border-2 border-[#245C4F]/30 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <!-- Pestaña superior decorativa -->
            <div class="inline-flex items-center gap-1.5 bg-[#245C4F] text-white text-[10px] font-semibold tracking-wider uppercase px-3 py-0.5 rounded-full mb-2">
              <i class="fa-solid fa-ticket text-xs"></i>
              <span>Tu Número de Ticket</span>
            </div>

            <!-- NÚMERO GIGANTE DEL TICKET -->
            <div class="text-5xl sm:text-6xl font-bold text-[#245C4F] tracking-tight my-2 select-all">
              #{{ ordenExitosa?.id }}
            </div>

            <p v-if="ordenExitosa?.folio" class="text-xs font-mono font-medium text-[#68736C]">
              Folio: {{ ordenExitosa?.folio }}
            </p>

            <div class="mt-3 pt-3 border-t border-[#DDE3DE] flex items-center justify-between text-xs font-semibold text-[#68736C]">
              <span class="uppercase tracking-wider">Total Orden</span>
              <span class="text-base font-bold text-[#202723]">${{ Number(ordenExitosa?.total || 0).toFixed(2) }}</span>
            </div>
          </div>

          <!-- INSTRUCCIÓN CLARA SEGÚN TIPO DE ENTREGA -->
          <div v-if="ordenExitosa?.tipo_entrega === 'para_llevar'" 
               class="p-3.5 bg-[#F6F7F5] border border-[#DDE3DE] rounded-xl flex items-start gap-3 text-left">
            <div class="w-8 h-8 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center shrink-0 mt-0.5">
              <i class="fa-solid fa-bag-shopping text-sm"></i>
            </div>
            <div>
              <p class="text-xs font-bold text-[#202723] uppercase tracking-wider">Pedido Para Llevar</p>
              <p class="text-xs text-[#68736C] mt-1 leading-relaxed">
                Por favor toma asiento cerca del mostrador. Te llamaremos con tu ticket <span class="font-bold text-[#202723]">#{{ ordenExitosa?.id }}</span> cuando tu pedido esté listo para recoger.
              </p>
            </div>
          </div>

          <div v-else 
               class="p-3.5 bg-[#F6F7F5] border border-[#DDE3DE] rounded-xl flex items-start gap-3 text-left">
            <div class="w-8 h-8 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center shrink-0 mt-0.5">
              <i class="fa-solid fa-utensils text-sm"></i>
            </div>
            <div>
              <p class="text-xs font-bold text-[#202723] uppercase tracking-wider">
                Comer Aquí · Mesa {{ ordenExitosa?.mesa || 'Asignada' }}
              </p>
              <p class="text-xs text-[#68736C] mt-1 leading-relaxed">
                Tu pedido ha sido recibido en cocina. Toma asiento en la <span class="font-bold text-[#202723]">Mesa {{ ordenExitosa?.mesa }}</span>.
              </p>
            </div>
          </div>

        </div>

        <!-- Barra regresiva visual y botón de finalizar -->
        <div class="p-4 border-t border-[#DDE3DE] bg-[#F6F7F5] shrink-0 space-y-2">
          <button
            @click="cerrar"
            class="w-full py-3 bg-[#245C4F] hover:bg-[#19483D] active:scale-[0.99] text-white font-semibold rounded-xl transition text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 cursor-pointer">
            <span>Aceptar y Finalizar ({{ cuentaRegresiva }}s)</span>
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </button>
          <p class="text-[10px] text-center font-medium text-[#68736C]">
            La pantalla se reiniciará automáticamente para el siguiente cliente
          </p>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  pedido:            { type: Array,  required: true },
  restauranteNombre: { type: String, default: '' },
  notaInicial:       { type: String, default: '' },
  totalMesas:        { type: [Number, String], default: 12 },
})
const emit = defineEmits(['close', 'confirmar'])

// ── Estado ─────────────────────────────────────────────────
const paso           = ref('checkout') // 'checkout' | 'ticket'
const ordenExitosa   = ref(null)
const cuentaRegresiva= ref(12)
let timerInterval    = null

const tipoEntrega    = ref('comer_aqui') // 'comer_aqui' | 'para_llevar'
const numeroMesa     = ref(null)
const nota           = ref(props.notaInicial)
const procesando     = ref(false)
const error          = ref('')
const intentoEnvio   = ref(false)

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
    ? 'Para llevar'
    : `Mesa: ${numeroMesa.value}`

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

// ── Timers y Cierre ────────────────────────────────────────
const limpiarTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const cerrar = () => {
  limpiarTimer()
  emit('close')
}

// ── Transición al paso de Ticket Exitoso ──────────────────
const mostrarExitoTicket = (datos) => {
  ordenExitosa.value = datos
  paso.value = 'ticket'
  procesando.value = false
  cuentaRegresiva.value = 12
  limpiarTimer()
  timerInterval = setInterval(() => {
    cuentaRegresiva.value--
    if (cuentaRegresiva.value <= 0) {
      cerrar()
    }
  }, 1000)
}

onUnmounted(() => {
  limpiarTimer()
})

// Expuesto para que el padre maneje errores o transiciones
const setError = (msg) => { error.value = msg; procesando.value = false; }
const reset    = () => { procesando.value = false; }

defineExpose({ setError, reset, mostrarExitoTicket })
</script>

<style scoped>
@keyframes fade-in  { from{opacity:0} to{opacity:1} }
@keyframes slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin     { to{transform:rotate(360deg)} }

.animate-fade-in  { animation: fade-in  0.15s ease-out; }
.animate-slide-up { animation: slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.animate-spin     { animation: spin 0.7s linear infinite; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #DDE3DE; border-radius: 8px; }
</style>