<template>
  <div
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 transition-all"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
      
      <div class="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 class="text-lg font-bold text-slate-800">
            {{ ingrediente ? `Editar: ${ingrediente.nombre}` : 'Nuevo Ingrediente' }}
          </h3>
          <p class="text-xs text-slate-500 italic">
            ID: {{ ingrediente ? ingrediente.id : 'Autogenerado' }}
          </p>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm border border-transparent hover:border-slate-100">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6">
        <div v-if="formError" class="mb-5 p-3 flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
          <span class="font-medium">{{ formError }}</span>
        </div>

        <div class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre *</label>
            <input v-model="form.nombre" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Unidad *</label>
              <select v-model="form.unidad" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer">
                <option value="gr">gramos (gr)</option>
                <option value="kg">kilogramos (kg)</option>
                <option value="ml">mililitros (ml)</option>
                <option value="lt">litros (lt)</option>
                <option value="pz">piezas (pz)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Costo Unitario *</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input v-model="form.costo_unitario" type="number" step="0.01" class="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stock Actual</label>
              <input v-model="form.stock_actual" type="number" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stock Mínimo</label>
              <input v-model="form.stock_minimo" type="number" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Proveedor</label>
            <input v-model="form.proveedor" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all" />
          </div>
        </div>
      </div>

      <div class="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex gap-3">
        <button @click="$emit('close')" class="flex-1 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition active:scale-95">
          Cancelar
        </button>
        <button @click="guardar" :disabled="loading" class="flex-1 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md transition active:scale-95 disabled:opacity-50">
          {{ loading ? 'Guardando...' : (ingrediente ? 'Actualizar' : 'Crear') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  ingrediente: { type: Object, default: null },
  apiUrl: { type: String, default: import.meta.env.VITE_API_URL + '/api' }
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const formError = ref('')

// Campos iniciales limpios
const defaultForm = () => ({
  nombre: '',
  unidad: 'kg',
  costo_unitario: 0,
  stock_actual: 0,
  stock_minimo: 0,
  proveedor: '',
})

const form = ref(defaultForm())

// --- Lógica de Relleno ---
// El watch detecta cuando la prop "ingrediente" cambia (cuando haces click en editar)
watch(() => props.ingrediente, (nuevoIngrediente) => {
  if (nuevoIngrediente) {
    // Rellenamos el formulario con los datos exactos del JSON de la API
    form.value = {
      nombre: nuevoIngrediente.nombre || '',
      unidad: nuevoIngrediente.unidad || 'kg',
      costo_unitario: nuevoIngrediente.costo_unitario || 0,
      stock_actual: nuevoIngrediente.stock_actual || 0,
      stock_minimo: nuevoIngrediente.stock_minimo || 0,
      proveedor: nuevoIngrediente.proveedor || '',
    }
  } else {
    // Si es nuevo (null), limpiamos el formulario
    form.value = defaultForm()
  }
}, { immediate: true })

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return { 
    'Content-Type': 'application/json', 
    'Authorization': `Bearer ${token}` 
  }
}

const guardar = async () => {
  formError.value = ''
  if (!form.value.nombre) { formError.value = 'El nombre es requerido'; return }

  loading.value = true
  try {
    const esEdit = !!props.ingrediente
    const url = esEdit 
      ? `${props.apiUrl}/ingredientes/${props.ingrediente.id}` 
      : `${props.apiUrl}/ingredientes`
    
    const method = esEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(form.value)
    })

    const data = await res.json()
    if (data.success) {
      emit('saved') // Notificamos al padre para que refresque la lista
    } else {
      formError.value = data.message || 'Error al procesar la solicitud'
    }
  } catch (error) {
    formError.value = 'Error de conexión con el servidor'
  } finally {
    loading.value = false
  }
}
</script>