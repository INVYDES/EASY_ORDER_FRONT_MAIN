<template>
  <!-- Solo renderiza si hay alertas -->
  <teleport to="body">
    <div class="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <transition-group name="alerta">
        <div
          v-for="alerta in alertas"
          :key="alerta.id"
          class="flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl pointer-events-auto border"
          :class="alerta.sin_stock
            ? 'bg-red-600 text-white border-red-700'
            : 'bg-amber-50 text-amber-900 border-amber-300'"
        >
          <!-- Icono -->
          <span class="text-xl shrink-0 mt-0.5">{{ alerta.sin_stock ? '🚨' : '⚠️' }}</span>

          <!-- Contenido -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold leading-tight">
              {{ alerta.sin_stock ? 'Sin stock' : 'Stock bajo' }}:
              {{ alerta.nombre }}
            </p>
            <p class="text-xs mt-0.5 opacity-80">
              {{ alerta.sin_stock
                ? 'El ingrediente se agotó — algunos platos no se podrán preparar'
                : `Quedan ${alerta.stock_actual} ${alerta.unidad || 'unidades'} (mínimo: ${alerta.stock_minimo})`
              }}
            </p>
          </div>

          <!-- Cerrar -->
          <button
            @click="cerrar(alerta.id)"
            class="shrink-0 opacity-60 hover:opacity-100 transition text-lg leading-none mt-0.5"
          >×</button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'

// Las alertas se agregan desde fuera usando el método expuesto
const alertas = ref([])

// Exponer método para que el padre llame: widgetRef.value.agregarAlerta(evento)
const agregarAlerta = (evento) => {
  const id = Date.now() + Math.random()
  alertas.value.push({ id, ...evento })

  // Auto-cerrar: sin_stock dura más (10s), bajo stock 6s
  const duracion = evento.sin_stock ? 10000 : 6000
  setTimeout(() => cerrar(id), duracion)
}

const cerrar = (id) => {
  alertas.value = alertas.value.filter(a => a.id !== id)
}

defineExpose({ agregarAlerta })
</script>

<style scoped>
.alerta-enter-active { animation: slideUp 0.3s ease-out; }
.alerta-leave-active { animation: slideUp 0.2s ease-in reverse; }
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
</style>