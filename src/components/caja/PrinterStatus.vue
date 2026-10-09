<template>
  <!-- ══ Barra de estado de impresora (inline, minimalista) ══ -->
  <div class="flex items-center gap-2">
    <!-- Status pill -->
    <button
      @click="togglePanel"
      :class="[
        'flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm cursor-pointer select-none',
        statusClasses
      ]"
      :title="statusTitle"
    >
      <span class="relative flex h-2 w-2">
        <span v-if="isConnected" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span :class="['relative inline-flex rounded-full h-2 w-2', dotClass]"></span>
      </span>
      <span class="hidden sm:inline">{{ statusLabel }}</span>
      <span class="text-base leading-none">🖨️</span>
    </button>

    <!-- Panel desplegable -->
    <Teleport to="body">
      <Transition name="panel">
        <div v-if="panelOpen" class="fixed inset-0 z-[100]" @click.self="panelOpen = false">
          <div 
            class="absolute bg-white rounded-2xl shadow-2xl border border-slate-100 w-80 overflow-hidden"
            :style="panelPosition"
          >
            <!-- Header -->
            <div class="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-lg">🖨️</span>
                <h4 class="text-xs font-black text-slate-700 uppercase tracking-widest">Impresora Térmica</h4>
              </div>
              <button @click="panelOpen = false" class="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 text-slate-400 hover:bg-slate-300 text-xs">✕</button>
            </div>

            <!-- Estado actual -->
            <div class="px-4 py-3 border-b border-slate-50">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</span>
                <span :class="['text-[10px] font-black px-2 py-0.5 rounded-lg', statusBadgeClass]">
                  {{ statusLabel }}
                </span>
              </div>
              <p v-if="printerName" class="text-xs font-bold text-slate-600">{{ printerName }}</p>
              <p v-if="lastError" class="text-[10px] font-bold text-red-500 mt-1">{{ lastError }}</p>
            </div>

            <!-- Botones de acción -->
            <div class="px-4 py-3 space-y-2 border-b border-slate-50">
              <button v-if="!isConnected" @click="handleConnect" :disabled="!isSupported || status === 'connecting'"
                class="w-full py-2.5 text-xs font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
                <span v-if="status === 'connecting'" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ status === 'connecting' ? 'Conectando...' : '🔌 Conectar Impresora' }}
              </button>
              <template v-else>
                <div class="grid grid-cols-2 gap-2">
                  <button @click="handleTestPrint" :disabled="isPrinting"
                    class="py-2 text-[10px] font-black text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition disabled:opacity-50 flex items-center justify-center gap-1">
                    🧪 Prueba
                  </button>
                  <button @click="handleOpenDrawer" :disabled="isPrinting"
                    class="py-2 text-[10px] font-black text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 transition disabled:opacity-50 flex items-center justify-center gap-1">
                    🗄️ Cajón
                  </button>
                </div>
                <button @click="handleDisconnect"
                  class="w-full py-2 text-[10px] font-black text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-1">
                  ⏏️ Desconectar
                </button>
              </template>

              <p v-if="!isSupported" class="text-[10px] font-bold text-amber-600 bg-amber-50 p-2 rounded-xl text-center">
                ⚠️ Web Serial no soportado. Usa Chrome o Edge.
              </p>
            </div>

            <!-- Configuración -->
            <div class="px-4 py-3">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Configuración</p>
              
              <!-- Tamaño de papel -->
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-slate-600">Papel</span>
                <div class="flex gap-1">
                  <button v-for="size in ['80mm', '58mm']" :key="size"
                    @click="updateConfig({ paperSize: size as any })"
                    :class="['px-2.5 py-1 rounded-lg text-[10px] font-black transition',
                      config.paperSize === size ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200']">
                    {{ size }}
                  </button>
                </div>
              </div>

              <!-- Cajón de dinero -->
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-slate-600">Abrir cajón al cobrar</span>
                <button @click="updateConfig({ openDrawer: !config.openDrawer })"
                  :class="['w-10 h-5 rounded-full transition-colors relative',
                    config.openDrawer ? 'bg-indigo-600' : 'bg-slate-200']">
                  <span :class="['absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                    config.openDrawer ? 'translate-x-5' : 'translate-x-0']"></span>
                </button>
              </div>

              <!-- Velocidad -->
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-600">Baudrate</span>
                <select v-model.number="baudRateLocal" @change="updateConfig({ baudRate: baudRateLocal })"
                  class="text-[10px] font-bold px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                  <option :value="9600">9600</option>
                  <option :value="19200">19200</option>
                  <option :value="38400">38400</option>
                  <option :value="57600">57600</option>
                  <option :value="115200">115200</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useThermalPrinter } from '@/composables/useThermalPrinter'

const {
  status, isConnected, isSupported, isPrinting, printerName, lastError, config,
  connect, disconnect, printTest, openCashDrawer, updateConfig,
} = useThermalPrinter()

const panelOpen = ref(false)
const baudRateLocal = ref(config.value.baudRate)

const togglePanel = () => { panelOpen.value = !panelOpen.value }

const panelPosition = computed(() => ({
  top: '60px',
  right: '16px',
}))

// ── Status display ──
const statusLabel = computed(() => {
  switch (status.value) {
    case 'connected':    return 'Conectada'
    case 'connecting':   return 'Conectando...'
    case 'printing':     return 'Imprimiendo...'
    case 'error':        return 'Error'
    default:             return 'Sin impresora'
  }
})

const statusTitle = computed(() => {
  if (isConnected.value) return `Impresora conectada: ${printerName.value}`
  if (lastError.value) return lastError.value
  return 'Click para configurar la impresora térmica'
})

const statusClasses = computed(() => {
  switch (status.value) {
    case 'connected':  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'connecting': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'printing':   return 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse'
    case 'error':      return 'bg-red-50 text-red-700 border-red-200'
    default:           return 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
  }
})

const dotClass = computed(() => {
  switch (status.value) {
    case 'connected':  return 'bg-emerald-500'
    case 'connecting': return 'bg-amber-500'
    case 'printing':   return 'bg-indigo-500'
    case 'error':      return 'bg-red-500'
    default:           return 'bg-slate-300'
  }
})

const statusBadgeClass = computed(() => {
  switch (status.value) {
    case 'connected':  return 'bg-emerald-100 text-emerald-700'
    case 'connecting': return 'bg-amber-100 text-amber-700'
    case 'printing':   return 'bg-indigo-100 text-indigo-700'
    case 'error':      return 'bg-red-100 text-red-700'
    default:           return 'bg-slate-100 text-slate-500'
  }
})

// ── Actions ──
const handleConnect = async () => {
  await connect()
}

const handleDisconnect = async () => {
  await disconnect()
}

const handleTestPrint = async () => {
  const ok = await printTest()
  if (!ok) {
    console.warn('Error en impresión de prueba:', lastError.value)
  }
}

const handleOpenDrawer = async () => {
  await openCashDrawer()
}
</script>

<style scoped>
.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
