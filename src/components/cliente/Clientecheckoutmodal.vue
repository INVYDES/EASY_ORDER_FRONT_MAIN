<template>
  <div class="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
    @click.self="!procesando && $emit('close')">
    <div class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-up">

      <!-- ══ PANTALLA DE PROCESANDO PAGO ONLINE ══ -->
      <div v-if="procesandoPagoOnline" class="flex flex-col items-center justify-center px-8 py-16 text-center gap-5">
        <div class="relative">
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg"
            :class="metodoPago==='paypal' ? 'bg-[#003087] text-white' : 'bg-[#009ee3] text-white'">
            {{ metodoPago==='paypal' ? 'PP' : 'MP' }}
          </div>
          <div class="absolute -bottom-2 -right-2 w-7 h-7 border-4 border-white rounded-full border-t-indigo-500 animate-spin"></div>
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900">Conectando con {{ metodoPago==='paypal' ? 'PayPal' : 'Mercado Pago' }}</p>
          <p class="text-sm text-gray-400 mt-1">Preparando tu sesión de pago segura...</p>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div class="h-full bg-indigo-500 rounded-full animate-progress"></div>
        </div>
        <p class="text-xs text-gray-400">Serás redirigido en un momento</p>
      </div>

      <!-- ══ FORMULARIO NORMAL ══ -->
      <template v-else>

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

          <!-- ── 1. TIPO DE ENTREGA ── -->
          <div>
            <p class="text-sm font-bold text-gray-700 mb-3">¿Cómo quieres recibir tu pedido?</p>
            <div class="grid grid-cols-2 gap-3">
              <button v-for="op in opcionesEntrega" :key="op.value" @click="entrega = op.value"
                :class="['flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition',
                  entrega === op.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 bg-white']">
                <span class="text-3xl">{{ op.icon }}</span>
                <span class="text-sm font-semibold" :class="entrega===op.value?'text-indigo-700':'text-gray-700'">{{ op.label }}</span>
                <span class="text-[10px] text-center leading-tight" :class="entrega===op.value?'text-indigo-500':'text-gray-400'">
                  {{ op.desc }}
                </span>
              </button>
            </div>
          </div>

          <!-- Dirección (solo domicilio) -->
          <div v-if="entrega === 'domicilio'" class="space-y-3 animate-fade-in">
            <p class="text-sm font-bold text-gray-700">Dirección de entrega</p>
            <input v-model="direccion" type="text" placeholder="Calle y número *"
              :class="['w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none',
                !direccion && intentoEnvio ? 'border-red-400 bg-red-50' : 'border-gray-200']" />
            <div class="grid grid-cols-2 gap-2">
              <input v-model="colonia"     type="text" placeholder="Colonia"
                class="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <input v-model="referencias" type="text" placeholder="Referencias"
                class="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>

          <!-- ── 2. MÉTODO DE PAGO ── -->
          <div>
            <p class="text-sm font-bold text-gray-700 mb-3">¿Cómo vas a pagar?</p>
            <div class="space-y-2">
              <button v-for="m in metodosPago" :key="m.value" @click="metodoPago = m.value"
                :class="['w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition text-left',
                  metodoPago === m.value ? `border-${m.color}-500 bg-${m.color}-50` : 'border-gray-200 hover:border-gray-300',
                  !metodoPago && intentoEnvio ? 'border-red-300' : '']"
                :style="metodoPago === m.value ? { borderColor: m.hex, backgroundColor: m.hexBg } : {}">
                <!-- Icono -->
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 font-black"
                  :style="metodoPago===m.value ? { backgroundColor: m.hex, color:'white' } : { backgroundColor:'#f3f4f6', color: m.hex }">
                  {{ m.icon }}
                </div>
                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800">{{ m.label }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ m.sub }}</p>
                </div>
                <!-- Badge online -->
                <span v-if="m.online" class="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  :style="metodoPago===m.value ? { backgroundColor: m.hex+'22', color: m.hex } : { backgroundColor:'#f3f4f6', color:'#9ca3af'}">
                  En línea
                </span>
                <!-- Radio -->
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  :style="metodoPago===m.value ? { borderColor: m.hex, backgroundColor: m.hex } : { borderColor:'#d1d5db' }">
                  <div v-if="metodoPago===m.value" class="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </button>
            </div>
          </div>

          <!-- Info según método -->
          <transition name="fade">
            <div v-if="infoPago.titulo" class="rounded-xl p-4 text-sm border" :style="{ backgroundColor: metodoActivo?.hexBg||'#f9fafb', borderColor: metodoActivo?.hex+'44'||'#e5e7eb' }">
              <p class="font-semibold mb-1" :style="{ color: metodoActivo?.hex||'#374151' }">{{ infoPago.titulo }}</p>
              <p class="text-xs leading-relaxed text-gray-600">{{ infoPago.descripcion }}</p>
              <!-- Aviso de redirección para pagos online -->
              <div v-if="metodoActivo?.online" class="mt-2 flex items-center gap-1.5 text-xs font-medium" :style="{ color: metodoActivo?.hex }">
                <span>🔒</span>
                <span>Serás redirigido a {{ metodoActivo?.label }} para completar el pago de forma segura</span>
              </div>
            </div>
          </transition>

          <!-- ── 3. NOTA ── -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Nota para el restaurante <span class="text-gray-400 font-normal">(opcional)</span></label>
            <textarea v-model="nota" rows="2" placeholder="Alergias, preferencias, sin cebolla..."
              class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"></textarea>
          </div>

          <!-- Error -->
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
            <span>❌</span><span>{{ error }}</span>
          </div>

          <!-- ── BOTÓN ── -->
          <button @click="confirmar" :disabled="procesando"
            class="w-full py-4 text-white font-bold rounded-2xl transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            :style="{ backgroundColor: metodoActivo?.hex || '#4f46e5' }"
            :class="!metodoActivo ? 'bg-indigo-600 hover:bg-indigo-700' : ''">
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

// ── Estado ─────────────────────────────────────────────────
const entrega             = ref('recoger')
const metodoPago          = ref('')
const direccion           = ref('')
const colonia             = ref('')
const referencias         = ref('')
const nota                = ref(props.notaInicial)
const procesando          = ref(false)
const procesandoPagoOnline= ref(false)
const error               = ref('')
const intentoEnvio        = ref(false)

// ── Catálogos ──────────────────────────────────────────────
const opcionesEntrega = [
  { value:'recoger',   icon:'🏪', label:'Recoger',   desc:'Pasa al local' },
  { value:'domicilio', icon:'🛵', label:'Domicilio',  desc:'Te lo llevamos' },
]

// ✅ FIX: computed para que 'sub' de efectivo reaccione al cambiar entrega
const metodosPago = computed(() => [
  { value:'efectivo',      label:'Efectivo',       sub: entrega.value==='recoger' ? 'Paga al recoger' : 'Paga al recibir', icon:'💵', hex:'#10b981', hexBg:'#f0fdf4', online:false },
  { value:'tarjeta',       label:'Tarjeta',         sub:'Débito o crédito',       icon:'💳', hex:'#3b82f6', hexBg:'#eff6ff', online:false },
  { value:'transferencia', label:'Transferencia',   sub:'SPEI / depósito',        icon:'📲', hex:'#8b5cf6', hexBg:'#f5f3ff', online:false },
  { value:'paypal',        label:'PayPal',          sub:'Pago en línea seguro',   icon:'PP', hex:'#003087', hexBg:'#eff6ff', online:true  },
  { value:'mercadopago',   label:'Mercado Pago',    sub:'QR, link o tarjeta',     icon:'MP', hex:'#009ee3', hexBg:'#f0f9ff', online:true  },
])

// ── Computed ───────────────────────────────────────────────
const totalItems   = computed(() => props.pedido.reduce((s,i) => s + i.cantidad, 0))
const totalPedido  = computed(() => props.pedido.reduce((s,i) => s + i.precio * i.cantidad, 0))
const metodoActivo = computed(() => metodosPago.value.find(m => m.value === metodoPago.value) || null)

const infoPago = computed(() => {
  const map = {
    efectivo:      { titulo: entrega.value==='recoger' ? '💵 Pago al recoger' : '💵 Pago contra entrega', descripcion:'Prepara el monto exacto. El cobro se realiza en el momento de la entrega.' },
    tarjeta:       { titulo:'💳 Terminal en punto de entrega', descripcion:'Tendrás una terminal disponible al recoger o recibir tu pedido. Aceptamos Visa, Mastercard y American Express.' },
    transferencia: { titulo:'📲 Datos para transferencia', descripcion:'Al confirmar recibirás el número de cuenta/CLABE. Envía tu comprobante para que iniciemos la preparación.' },
    paypal:        { titulo:'🔵 Pago seguro con PayPal', descripcion:'Se creará una orden de cobro en PayPal. Solo necesitas tu cuenta o tarjeta registrada. El pedido se confirma al acreditarse el pago.' },
    mercadopago:   { titulo:'🔵 Pago con Mercado Pago', descripcion:'Te enviaremos el link de pago de Mercado Pago. Puedes pagar con tarjeta, dinero en cuenta o QR. El pedido se confirma automáticamente.' },
  }
  return map[metodoPago.value] || { titulo:'', descripcion:'' }
})

const isValid = computed(() => {
  if (!metodoPago.value) return false
  if (entrega.value === 'domicilio' && !direccion.value.trim()) return false
  return true
})

// ── Confirmar ──────────────────────────────────────────────
const confirmar = async () => {
  intentoEnvio.value = true
  error.value = ''

  if (!metodoPago.value) { error.value = 'Selecciona un método de pago'; return }
  if (entrega.value === 'domicilio' && !direccion.value.trim()) { error.value = 'Ingresa tu dirección de entrega'; return }

  procesando.value = true

  // Pagos online → mostrar pantalla de "conectando" antes de emitir
  if (metodoActivo.value?.online) {
    procesandoPagoOnline.value = true
    // Simular delay de conexión con pasarela (en producción aquí irá la llamada al backend)
    await new Promise(r => setTimeout(r, 2000))
    // NOTA: cuando integres el backend real, aquí harías:
    // const res = await fetch(`${API_URL}/pagos/crear-sesion`, { method:'POST', ... })
    // const data = await res.json()
    // window.location.href = data.redirect_url  ← redirige a PayPal/MP
    // Por ahora simulamos que el pago fue aprobado
    procesandoPagoOnline.value = false
  }

  const notaCompleta = [
    nota.value,
    entrega.value === 'domicilio'
      ? `📍 Entrega: ${[direccion.value, colonia.value, referencias.value].filter(Boolean).join(', ')}`
      : '🏪 Recoger en local',
    `💳 Pago: ${metodoPago.value}`,
  ].filter(Boolean).join(' | ')

  emit('confirmar', {
    metodo_pago:  metodoPago.value,
    tipo_entrega: entrega.value,
    direccion:    entrega.value === 'domicilio'
      ? { calle: direccion.value, colonia: colonia.value, referencias: referencias.value }
      : null,
    notas: notaCompleta,
  })
}

// Expuesto para que el padre maneje errores del backend
const setError = (msg) => { error.value = msg; procesando.value = false; procesandoPagoOnline.value = false }
const reset    = () => { procesando.value = false; procesandoPagoOnline.value = false }
defineExpose({ setError, reset })
</script>

<style scoped>
@keyframes fade-in  { from{opacity:0}                        to{opacity:1} }
@keyframes slide-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin     { to{transform:rotate(360deg)} }
@keyframes progress { 0%{width:0%} 60%{width:70%} 90%{width:90%} 100%{width:95%} }

.animate-fade-in  { animation: fade-in  0.2s ease-out; }
.animate-slide-up { animation: slide-up 0.3s ease-out; }
.animate-spin     { animation: spin 0.7s linear infinite; }
.animate-progress { animation: progress 2s ease-out forwards; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>