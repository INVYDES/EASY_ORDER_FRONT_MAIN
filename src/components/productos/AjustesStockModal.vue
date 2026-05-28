<template>
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">

      <div class="flex items-center justify-between mb-5">
        <div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Ajustar stock</h3>
          <p class="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">{{ ingrediente?.nombre }}</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 text-xl leading-none">✕</button>
      </div>

      <!-- Stock actual -->
      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mb-5 flex items-center justify-between">
        <span class="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Stock actual</span>
        <span class="text-base font-bold text-gray-800 dark:text-gray-200">
          {{ ingrediente?.stock_actual }} <span class="text-xs text-gray-400 dark:text-gray-500">{{ ingrediente?.unidad }}</span>
        </span>
      </div>

      <div class="space-y-4">

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de movimiento</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-2 cursor-pointer flex-1 p-3 border rounded-xl transition"
              :class="form.tipo === 'entrada' ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:border-gray-600'">
              <input type="radio" value="entrada" v-model="form.tipo" class="w-4 h-4 text-emerald-600" />
              <span class="text-sm font-medium">➕ Entrada</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer flex-1 p-3 border rounded-xl transition"
              :class="form.tipo === 'salida' ? 'border-red-400 bg-red-50' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:border-gray-600'">
              <input type="radio" value="salida" v-model="form.tipo" class="w-4 h-4 text-red-600" />
              <span class="text-sm font-medium">➖ Salida</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cantidad * <span class="text-gray-400 dark:text-gray-500 font-normal">({{ ingrediente?.unidad }})</span>
          </label>
          <input
            v-model.number="form.cantidad"
            type="number" min="0.001" step="0.001"
            class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <!-- Preview del resultado -->
        <div v-if="form.cantidad > 0" class="flex items-center justify-between p-3 rounded-xl text-sm font-medium"
          :class="form.tipo === 'entrada' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">
          <span>Stock resultante</span>
          <span class="font-bold">
            {{ form.tipo === 'entrada'
                ? Number(ingrediente?.stock_actual || 0) + Number(form.cantidad)
                : Math.max(0, Number(ingrediente?.stock_actual || 0) - Number(form.cantidad))
            }} {{ ingrediente?.unidad }}
          </span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Motivo <span class="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span>
          </label>
          <textarea
            v-model="form.motivo"
            rows="2"
            placeholder="Ej: Compra semanal, merma, etc."
            class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
          ></textarea>
        </div>

      </div>

      <div class="flex gap-3 mt-6">
        <button
          @click="$emit('close')"
          class="flex-1 py-2.5 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:bg-gray-600 transition"
        >
          Cancelar
        </button>
        <button
          @click="guardar"
          :disabled="loading"
          class="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50"
          :class="form.tipo === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'"
        >
          {{ loading ? 'Procesando...' : 'Aplicar ajuste' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { API_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'

// Props: ingrediente (Object) — el ingrediente al que se ajusta el stock
const props = defineProps({
  ingrediente: { type: Object, default: null },
})

// Emits consumidos por ProductosView: @close, @saved
const emit = defineEmits(['close', 'saved'])

const loading = ref(false)

const form = ref({ tipo: 'entrada', cantidad: '', motivo: '' })

// Resetear el form cuando cambia el ingrediente
watch(() => props.ingrediente, () => {
  form.value = { tipo: 'entrada', cantidad: '', motivo: '' }
}, { immediate: true })

const guardar = async () => {
  if (!form.value.cantidad || Number(form.value.cantidad) <= 0) {
    alert('Ingresa una cantidad válida')
    return
  }

  loading.value = true
  try {
    const data = await apiClient.post(`/ingredientes/${props.ingrediente.id}/ajustar-stock`, {
      tipo:     form.value.tipo,
      cantidad: Number(form.value.cantidad),
      motivo:   form.value.motivo || null,
    })
    
    if (data.success || data.data) {
      emit('saved')
    } else {
      alert(data.message || 'Error al ajustar stock')
    }
  } catch {
    alert('Error de conexión')
  } finally {
    loading.value = false
  }
}
</script>