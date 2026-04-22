<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Punto de Caja</h1>
      <p class="text-gray-400 text-sm mt-0.5">{{ fechaHoy }}</p>
    </div>
    <div class="flex items-center gap-2">
      <div v-if="cajaAbierta" class="flex items-center gap-1.5 text-xs"
        :class="wsConectado ? 'text-emerald-500' : 'text-amber-500'">
        <span class="w-2 h-2 rounded-full animate-pulse"
          :class="wsConectado ? 'bg-emerald-400' : 'bg-amber-400'"></span>
        <span>{{ wsConectado ? 'En vivo' : ultimaActualizacion || 'Conectando...' }}</span>
      </div>
      <div v-if="ordenesListas > 0"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-full animate-pulse">
        ✅ {{ ordenesListas }} lista{{ ordenesListas > 1 ? 's' : '' }} p/ cobrar
      </div>
      <span class="px-3 py-1.5 text-xs font-bold rounded-full"
        :class="cajaAbierta ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'">
        {{ cajaAbierta ? '🟢 Caja abierta' : '🔴 Caja cerrada' }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cajaAbierta:         Boolean,
  wsConectado:         Boolean,
  ultimaActualizacion: String,
  ordenesListas:       Number,
  fechaHoy:            String,
})
</script>