<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 class="text-xl sm:text-2xl font-semibold text-[#202723]">Punto de Caja</h1>
      <p class="text-[#68736C] text-xs mt-0.5">{{ fechaHoy }}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <div v-if="cajaAbierta" class="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
        :class="wsConectado ? 'text-[#26734D] bg-[#E8F1ED]' : 'text-[#A96517] bg-[#FEF7EC]'">
        <span class="w-2 h-2 rounded-full animate-pulse"
          :class="wsConectado ? 'bg-[#26734D]' : 'bg-[#A96517]'"></span>
        <span>{{ wsConectado ? 'En vivo' : ultimaActualizacion || 'Conectando...' }}</span>
      </div>
      <div v-if="ordenesListas > 0"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-[#245C4F] text-white text-xs font-semibold rounded-lg shadow-xs animate-pulse">
        <i class="fa-solid fa-circle-check text-xs"></i>
        <span>{{ ordenesListas }} lista{{ ordenesListas > 1 ? 's' : '' }} p/ cobrar</span>
      </div>
      <button @click="showPoint = true"
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E8F1ED] text-[#245C4F] hover:bg-[#d8e8e1] border border-[#245C4F]/20 transition cursor-pointer shadow-xs">
        <i class="fa-solid fa-credit-card text-xs"></i>
        <span>Terminal Point</span>
      </button>
      <PrinterStatus />
      <span class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border shadow-xs"
        :class="cajaAbierta ? 'bg-[#E8F1ED] text-[#26734D] border-[#26734D]/30' : 'bg-[#F0F2EF] text-[#68736C] border-[#DDE3DE]'">
        <i :class="cajaAbierta ? 'fa-solid fa-lock-open text-xs text-[#26734D]' : 'fa-solid fa-lock text-xs text-[#68736C]'"></i>
        <span>{{ cajaAbierta ? 'Caja abierta' : 'Caja cerrada' }}</span>
      </span>
    </div>
  </div>

  <PointConfigModal v-if="showPoint" @close="showPoint = false" />
</template>

<script setup>
import { ref } from 'vue'
import PrinterStatus from './PrinterStatus.vue'
import PointConfigModal from './PointConfigModal.vue'

const showPoint = ref(false)

defineProps({
  cajaAbierta:         Boolean,
  wsConectado:         Boolean,
  ultimaActualizacion: String,
  ordenesListas:       Number,
  fechaHoy:            String,
})
</script>