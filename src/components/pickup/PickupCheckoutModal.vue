<template>
  <div class="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
    @click.self="!procesando && !procesandoPagoOnline && $emit('close')">
    <div class="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-up">

      <!-- ONLINE PAYMENT PROCESSING -->
      <div v-if="procesandoPagoOnline" class="flex flex-col items-center justify-center px-8 py-16 text-center gap-5">
        <div class="relative">
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg"
            :class="metodoPago==='paypal' ? 'bg-[#003087] text-white' : 'bg-[#009ee3] text-white'">
            {{ metodoPago==='paypal' ? 'PP' : 'MP' }}
          </div>
          <div class="absolute -bottom-2 -right-2 w-7 h-7 border-4 border-white rounded-full border-t-indigo-500 animate-spin"></div>
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 dark:text-gray-100">Conectando con {{ metodoPago==='paypal' ? 'PayPal' : 'Mercado Pago' }}</p>
          <p class="text-sm text-gray-400 mt-1">Preparando tu sesión de pago segura...</p>
        </div>
        <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div class="h-full bg-indigo-500 rounded-full animate-progress"></div>
        </div>
        <p class="text-xs text-gray-400">Serás redirigido en un momento</p>
      </div>

      <!-- NORMAL FORM -->
      <template v-else>
        <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Pedido para llevar</h2>
              <p class="text-xs text-gray-400 mt-0.5">{{ restauranteNombre }}</p>
            </div>
            <button @click="$emit('close')" class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">✕</button>
          </div>
          <div class="mt-3 flex items-center justify-between bg-amber-50 dark:bg-amber-900/30 rounded-xl px-4 py-2.5">
            <div class="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <span>🛒</span>
              <span class="font-medium">{{ totalItems }} producto{{ totalItems !== 1 ? 's' : '' }}</span>
            </div>
            <span class="text-base font-black text-amber-700 dark:text-amber-300">${{ totalPedido.toFixed(2) }}</span>
          </div>
        </div>

        <div class="px-6 py-5 space-y-6">
          <!-- PICKUP INFO -->
          <div class="rounded-xl p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🏪</span>
              <div>
                <p class="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Recoger en local</p>
                <p class="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">Te notificaremos cuando esté listo</p>
              </div>
            </div>
          </div>

          <!-- PAYMENT METHOD -->
          <div>
            <p class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">¿Cómo vas a pagar?</p>
            <div class="space-y-2">
              <button v-for="m in metodosPago" :key="m.value" @click="metodoPago = m.value"
                :class="['w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition text-left',
                  metodoPago === m.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300',
                  !metodoPago && intentoEnvio ? 'border-red-300' : '']">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 font-black"
                  :style="metodoPago===m.value ? { backgroundColor: m.hex, color:'white' } : { backgroundColor:'#f3f4f6', color: m.hex }">
                  {{ m.icon }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ m.label }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ m.sub }}</p>
                </div>
                <span v-if="m.online" class="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  :style="metodoPago===m.value ? { backgroundColor: m.hex+'22', color: m.hex } : { backgroundColor:'#f3f4f6', color:'#9ca3af'}">
                  En línea
                </span>
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  :style="metodoPago===m.value ? { borderColor: m.hex, backgroundColor: m.hex } : { borderColor:'#d1d5db' }">
                  <div v-if="metodoPago===m.value" class="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </button>
            </div>
          </div>

          <!-- PAYMENT INFO -->
          <transition name="fade">
            <div v-if="infoPago.titulo" class="rounded-xl p-4 text-sm border dark:border-gray-700" :style="{ backgroundColor: metodoActivo?.hexBg||'#f9fafb', borderColor: metodoActivo?.hex+'44'||'#e5e7eb' }">
              <p class="font-semibold mb-1" :style="{ color: metodoActivo?.hex||'#374151' }">{{ infoPago.titulo }}</p>
              <p class="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{{ infoPago.descripcion }}</p>
              <div v-if="metodoActivo?.online" class="mt-2 flex items-center gap-1.5 text-xs font-medium" :style="{ color: metodoActivo?.hex }">
                <span>🔒</span>
                <span>Serás redirigido a {{ metodoActivo?.label }} para completar el pago de forma segura</span>
              </div>
            </div>
          </transition>

          <!-- SCHEDULED ORDER -->
          <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <label class="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" v-model="programar" class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
              <span class="text-sm font-bold text-gray-700 dark:text-gray-300">📅 Programar pedido</span>
            </label>
            <transition name="fade">
              <div v-if="programar" class="pt-2">
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">¿Para cuándo lo quieres?</label>
                <input type="datetime-local" v-model="programadoPara"
                  :min="fechaMinima"
                  class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-900 dark:text-gray-200">
              </div>
            </transition>
          </div>

          <!-- NOTE -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nota <span class="text-gray-400 font-normal">(opcional)</span></label>
            <textarea v-model="nota" rows="2" placeholder="Alergias, preferencias, instrucciones..."
              class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none dark:bg-gray-900 dark:text-gray-200"></textarea>
          </div>

          <!-- ERROR -->
          <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2">
            <span>❌</span><span>{{ error }}</span>
          </div>

          <!-- SUBMIT -->
          <button @click="confirmar" :disabled="procesando"
            class="w-full py-4 text-white font-bold rounded-2xl transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            :style="{ backgroundColor: metodoActivo?.hex || '#4f46e5' }">
            <div v-if="procesando" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
            <span v-else>{{ metodoActivo?.online ? `Pagar con ${metodoActivo.label}` : 'Confirmar pedido' }} · ${{ totalPedido.toFixed(2) }}</span>
            <span v-if="!procesando && metodoActivo?.online">→</span>
          </button>

          <p v-if="metodoActivo?.online" class="text-center text-xs text-gray-400">
            🔒 Pago 100% seguro procesado por {{ metodoActivo.label }}
          </p>
        </div>
      </template>
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

const metodoPago          = ref('')
const nota                = ref(props.notaInicial)
const procesando          = ref(false)
const procesandoPagoOnline= ref(false)
const error               = ref('')
const intentoEnvio        = ref(false)
const programar           = ref(false)
const programadoPara      = ref('')
const fechaMinima         = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

const metodosPago = [
  { value:'efectivo',      label:'Efectivo',       sub:'Paga al recoger',           icon:'💵', hex:'#10b981', hexBg:'#f0fdf4', online:false },
  { value:'tarjeta',       label:'Tarjeta',        sub:'Débito o crédito',          icon:'💳', hex:'#3b82f6', hexBg:'#eff6ff', online:false },
  { value:'transferencia', label:'Transferencia',  sub:'SPEI / depósito',           icon:'📲', hex:'#8b5cf6', hexBg:'#f5f3ff', online:false },
  { value:'paypal',        label:'PayPal',          sub:'Pago en línea seguro',     icon:'PP', hex:'#003087', hexBg:'#eff6ff', online:true  },
  { value:'mercadopago',   label:'Mercado Pago',   sub:'QR, link o tarjeta',        icon:'MP', hex:'#009ee3', hexBg:'#f0f9ff', online:true  },
]

const totalItems   = computed(() => props.pedido.reduce((s,i) => s + i.cantidad, 0))
const totalPedido  = computed(() => props.pedido.reduce((s,i) => s + i.precio * i.cantidad, 0))
const metodoActivo = computed(() => metodosPago.find(m => m.value === metodoPago.value) || null)

const infoPago = computed(() => {
  const map = {
    efectivo:      { titulo:'💵 Pago al recoger', descripcion:'Prepara el monto exacto. El cobro se realiza cuando pases por tu pedido.' },
    tarjeta:       { titulo:'💳 Terminal en local', descripcion:'Tendrás una terminal disponible al recoger. Aceptamos Visa, Mastercard y American Express.' },
    transferencia: { titulo:'📲 Datos para transferencia', descripcion:'Al confirmar recibirás el número de cuenta/CLABE. Envía tu comprobante para iniciar la preparación.' },
    paypal:        { titulo:'🔵 Pago seguro con PayPal', descripcion:'Se creará una orden de cobro en PayPal. Solo necesitas tu cuenta o tarjeta registrada. El pedido se confirma al acreditarse el pago.' },
    mercadopago:   { titulo:'🟢 Pago con Mercado Pago', descripcion:'Paga con QR, link o tarjeta. El pedido se confirma automáticamente al acreditarse el pago.' },
  }
  return map[metodoPago.value] || { titulo:'', descripcion:'' }
})

const confirmar = async () => {
  intentoEnvio.value = true
  error.value = ''

  if (!metodoPago.value) { error.value = 'Selecciona un método de pago'; return }

  procesando.value = true

  if (metodoActivo.value?.online) {
    procesandoPagoOnline.value = true
  }

  emit('confirmar', {
    metodo_pago: metodoPago.value,
    notas: [nota.value, '🏪 Recoger en local', `💳 Pago: ${metodoPago.value}`].filter(Boolean).join(' | '),
    online: metodoActivo.value?.online || false,
    programado_para: programar.value && programadoPara.value ? new Date(programadoPara.value).toISOString() : null,
  })
}

const setError = (msg) => { error.value = msg; procesando.value = false; procesandoPagoOnline.value = false }
const reset    = () => { procesando.value = false; procesandoPagoOnline.value = false }
defineExpose({ setError, reset })
</script>

<style scoped>
@keyframes fade-in  { from{opacity:0}                        to{opacity:1} }
@keyframes slide-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin     { to{transform:rotate(360deg)} }
@keyframes progress { 0%{width:0%} 60%{width:70%} 90%{width:90%} 100%{width:95%} }
.animate-fade-in   { animation: fade-in  0.2s ease-out; }
.animate-slide-up  { animation: slide-up 0.3s ease-out; }
.animate-spin      { animation: spin 0.7s linear infinite; }
.animate-progress  { animation: progress 2s ease-out forwards; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
