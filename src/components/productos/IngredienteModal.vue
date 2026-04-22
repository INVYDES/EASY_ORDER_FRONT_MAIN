<template>
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

      <div class="flex items-center justify-between mb-5">
        <h3 class="text-lg font-semibold text-gray-800">
          {{ ingrediente ? 'Editar ingrediente' : 'Nuevo ingrediente' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>

      <div v-if="formError" class="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
        {{ formError }}
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            v-model="form.nombre"
            type="text"
            placeholder="Ej. Jitomate"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Unidad *</label>
            <select
              v-model="form.unidad"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="gramos">gramos</option>
              <option value="kilogramos">kilogramos</option>
              <option value="mililitros">mililitros</option>
              <option value="litros">litros</option>
              <option value="piezas">piezas</option>
              <option value="cucharadas">cucharadas</option>
              <option value="tazas">tazas</option>
              <option value="porciones">porciones</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Costo por unidad *</label>
            <div class="relative">
              <span class="absolute left-3 top-3 text-gray-400 text-xs">$</span>
              <input
                v-model="form.costo_unitario"
                type="number" min="0" step="0.0001" placeholder="0.00"
                class="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Stock actual</label>
            <input
              v-model="form.stock_actual"
              type="number" min="0" step="0.001"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
            <input
              v-model="form.stock_minimo"
              type="number" min="0" step="0.001"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
          <input
            v-model="form.proveedor"
            type="text"
            placeholder="Nombre del proveedor (opcional)"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          @click="$emit('close')"
          class="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
        >
          Cancelar
        </button>
        <button
          @click="guardar"
          :disabled="loading"
          class="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ loading ? 'Guardando...' : (ingrediente ? 'Guardar cambios' : 'Crear ingrediente') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { API_URL } from '@/config/api'

// Props: ingrediente (Object|null) para editar, null para crear
const props = defineProps({
  ingrediente: { type: Object, default: null },
})

// Emits consumidos por ProductosView: @close, @saved
const emit = defineEmits(['close', 'saved'])

const loading  = ref(false)
const formError = ref('')

const defaultForm = () => ({
  nombre:        '',
  unidad:        'gramos',
  costo_unitario:'',
  stock_actual:  '',
  stock_minimo:  '',
  proveedor:     '',
})

const form = ref(defaultForm())

// Precargar cuando se edita
watch(() => props.ingrediente, (ing) => {
  formError.value = ''
  if (ing) {
    form.value = {
      nombre:         ing.nombre,
      unidad:         ing.unidad,
      costo_unitario: ing.costo_unitario,
      stock_actual:   ing.stock_actual,
      stock_minimo:   ing.stock_minimo,
      proveedor:      ing.proveedor || '',
    }
  } else {
    form.value = defaultForm()
  }
}, { immediate: true })

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: token ? `Bearer ${token}` : '' }
}

const guardar = async () => {
  formError.value = ''
  if (!form.value.nombre.trim())     { formError.value = 'El nombre es obligatorio'; return }
  if (!form.value.costo_unitario)    { formError.value = 'El costo es obligatorio';  return }

  loading.value = true
  try {
    const url    = props.ingrediente ? `${API_URL}/ingredientes/${props.ingrediente.id}` : `${API_URL}/ingredientes`
    const method = props.ingrediente ? 'PUT' : 'POST'
    const res    = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form.value) })
    const data   = await res.json()
    if (res.ok && data.success) {
      emit('saved')
    } else {
      formError.value = data.message || Object.values(data.errors || {}).flat().join(' · ') || 'Error al guardar'
    }
  } catch {
    formError.value = 'Error de conexión'
  } finally {
    loading.value = false
  }
}
</script>