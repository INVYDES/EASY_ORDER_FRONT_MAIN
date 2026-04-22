<template>
  <div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    @click.self="$emit('close')">
    
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-gray-100 animate-slide-up">
      
      <!-- Header con gradiente -->
      <div class="relative px-8 py-6 bg-gradient-to-r from-gray-900 to-gray-800">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        
        <div class="relative flex justify-between items-center">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-3xl">📦</span>
              <h3 class="text-2xl font-black text-white tracking-tight">Ajustar Stock</h3>
            </div>
            <p class="text-gray-400 text-sm">Movimientos de almacén y control de inventario</p>
          </div>
          <button 
            @click="$emit('close')" 
            class="text-white/50 hover:text-white text-3xl leading-none transition-all hover:rotate-90 duration-300"
          >
            &times;
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div v-if="errorLocal" class="mb-6 p-4 text-sm font-bold text-red-600 bg-red-50 border-l-4 border-red-500 rounded-xl animate-shake">
          <div class="flex items-center gap-2">
            <span class="text-lg">⚠️</span>
            <span>{{ errorLocal }}</span>
          </div>
        </div>

        <form @submit.prevent="handleGuardar" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Columna izquierda - Estado Actual -->
          <div class="space-y-5">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                <span class="text-sm">🔍</span>
              </div>
              <h4 class="font-bold text-indigo-600 text-sm uppercase tracking-wider">Estado Actual</h4>
            </div>

            <!-- Tarjeta de información del ingrediente -->
            <div class="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-100 shadow-sm">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-1">Insumo Seleccionado</p>
                  <p class="text-xl font-black text-gray-800">{{ ingrediente?.nombre || 'Cargando...' }}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-lg">
                  🧄
                </div>
              </div>
              
              <div class="mt-4 pt-4 border-t border-indigo-100">
                <div class="flex justify-between items-center mb-2">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-wider">Stock Actual</p>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="stockStatusBadge">
                    {{ stockStatusText }}
                  </span>
                </div>
                <div class="flex items-baseline gap-1">
                  <p class="text-3xl font-black" :class="stockStatusColor">
                    {{ Number(ingrediente?.stock_actual || 0).toFixed(2) }}
                  </p>
                  <span class="text-sm text-gray-500">{{ ingrediente?.unidad || 'unidad' }}</span>
                </div>
                <div v-if="ingrediente?.stock_minimo" class="mt-3 flex justify-between text-xs text-gray-500">
                  <span>📊 Stock mínimo:</span>
                  <span class="font-semibold">{{ Number(ingrediente.stock_minimo).toFixed(2) }} {{ ingrediente.unidad }}</span>
                </div>
                <div v-if="ingrediente?.proveedor" class="mt-2 flex justify-between text-xs text-gray-400">
                  <span>🏭 Proveedor:</span>
                  <span>{{ ingrediente.proveedor }}</span>
                </div>
              </div>
            </div>

            <!-- Selector de tipo de movimiento -->
            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Tipo de Movimiento
              </label>
              <div class="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 rounded-2xl shadow-inner">
                <button 
                  v-for="t in tiposMovimiento" 
                  :key="t.value"
                  @click="localForm.tipo = t.value" 
                  type="button"
                  :class="[
                    'py-2.5 text-[11px] font-black uppercase rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5',
                    localForm.tipo === t.value ? t.activeClass : 'text-gray-400 hover:text-gray-600 bg-transparent'
                  ]"
                >
                  <span>{{ t.icon }}</span>
                  <span>{{ t.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Columna derecha - Aplicar Cambio -->
          <div class="space-y-5">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <span class="text-sm">⚡</span>
              </div>
              <h4 class="font-bold text-emerald-600 text-sm uppercase tracking-wider">Aplicar Cambio</h4>
            </div>

            <!-- Tarjeta de ajuste -->
            <div class="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
              
              <!-- Campo cantidad -->
              <div class="mb-5">
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Cantidad a {{ localForm.tipo === 'entrada' ? 'agregar' : localForm.tipo === 'salida' ? 'retirar' : 'asignar' }}
                </label>
                <div class="relative group">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                    {{ localForm.tipo === 'entrada' ? '➕' : localForm.tipo === 'salida' ? '➖' : '📌' }}
                  </div>
                  <input 
                    v-model.number="localForm.cantidad" 
                    type="number" 
                    step="0.01" 
                    min="0.01"
                    required
                    class="w-full pl-12 pr-20 py-4 rounded-xl border-2 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm font-black text-2xl transition-all"
                    :class="cantidadInputClass"
                    placeholder="0.00"
                  >
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400 uppercase tracking-widest">
                    {{ ingrediente?.unidad || 'unidad' }}
                  </span>
                </div>
                <p v-if="localForm.tipo === 'salida' && localForm.cantidad > (ingrediente?.stock_actual || 0)" 
                   class="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <span>⚠️</span> La cantidad supera el stock actual
                </p>
                <p v-else-if="localForm.tipo === 'entrada'" class="text-xs text-emerald-500 mt-2">
                  ✅ Incrementará el stock en {{ localForm.cantidad || 0 }} {{ ingrediente?.unidad }}
                </p>
                <p v-else-if="localForm.tipo === 'ajuste'" class="text-xs text-blue-500 mt-2">
                  📌 El stock se establecerá exactamente en {{ localForm.cantidad || 0 }} {{ ingrediente?.unidad }}
                </p>
              </div>

              <!-- Campo motivo -->
              <div class="mb-5">
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Motivo / Referencia
                </label>
                <textarea 
                  v-model="localForm.motivo" 
                  rows="3"
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm text-sm font-medium resize-none transition-all"
                  placeholder="Ej. Compra a proveedor, Merma por caducidad, Devolución de cliente, Inventario inicial..."
                ></textarea>
              </div>

              <!-- Proyección de stock -->
              <div class="pt-3 border-t border-gray-200">
                <div class="rounded-xl p-4 transition-all duration-300" :class="proyeccionStyles.bg">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-[10px] font-black uppercase tracking-widest" :class="proyeccionStyles.text + ' opacity-70'">
                      Stock Resultante
                    </p>
                    <div class="text-2xl animate-bounce-slow">
                      {{ localForm.tipo === 'entrada' ? '📈' : localForm.tipo === 'salida' ? '📉' : '⚙️' }}
                    </div>
                  </div>
                  <div class="flex items-baseline gap-2">
                    <p class="font-black text-3xl" :class="proyeccionStyles.text">
                      {{ calcularProyeccion.toFixed(2) }}
                    </p>
                    <span class="text-sm" :class="proyeccionStyles.text + ' opacity-70'">
                      {{ ingrediente?.unidad || 'unidad' }}
                    </span>
                  </div>
                  <div class="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" 
                      :class="proyeccionBarClass"
                      :style="{ width: proyeccionPorcentaje + '%' }">
                    </div>
                  </div>
                  <p class="text-[10px] mt-2" :class="proyeccionStyles.text + ' opacity-70'">
                    {{ proyeccionMensaje }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer con botones -->
      <div class="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
        <button 
          @click="$emit('close')" 
          class="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
        >
          Cancelar
        </button>
        <button 
          @click="handleGuardar" 
          :disabled="!isFormValid || loading"
          class="relative px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          :class="buttonClass"
        >
          <span v-if="loading" class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando...
          </span>
          <span v-else class="flex items-center gap-2">
            <span>{{ localForm.tipo === 'entrada' ? '➕' : localForm.tipo === 'salida' ? '➖' : '📌' }}</span>
            {{ localForm.tipo === 'entrada' ? 'Agregar Stock' : localForm.tipo === 'salida' ? 'Retirar Stock' : 'Aplicar Ajuste' }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { API_URL } from '@/config/api'

const props = defineProps({
  ingrediente: {
    type: Object,
    required: true,
    default: () => ({})
  },
  form: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'guardar', 'saved'])

const loading = ref(false)
const errorLocal = ref('')

// Tipos de movimiento disponibles
const tiposMovimiento = [
  { value: 'entrada', label: 'Entrada', icon: '📥', activeClass: 'bg-white text-green-700 shadow-md' },
  { value: 'salida', label: 'Salida', icon: '📤', activeClass: 'bg-white text-red-700 shadow-md' },
  { value: 'ajuste', label: 'Ajuste', icon: '⚙️', activeClass: 'bg-white text-blue-700 shadow-md' }
]

// Formulario local
const localForm = ref({
  tipo: 'entrada',
  cantidad: 0,
  motivo: '',
  ...props.form
})

// Estado del stock actual
const stockStatusBadge = computed(() => {
  const stock = Number(props.ingrediente?.stock_actual || 0)
  const min = Number(props.ingrediente?.stock_minimo || 0)
  
  if (stock === 0) return 'bg-red-100 text-red-700'
  if (stock <= min) return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
})

const stockStatusText = computed(() => {
  const stock = Number(props.ingrediente?.stock_actual || 0)
  const min = Number(props.ingrediente?.stock_minimo || 0)
  
  if (stock === 0) return 'Sin stock'
  if (stock <= min) return 'Bajo stock'
  return 'Normal'
})

const stockStatusColor = computed(() => {
  const stock = Number(props.ingrediente?.stock_actual || 0)
  const min = Number(props.ingrediente?.stock_minimo || 0)
  
  if (stock === 0) return 'text-red-600'
  if (stock <= min) return 'text-amber-600'
  return 'text-indigo-600'
})

// Clase del input de cantidad según tipo
const cantidadInputClass = computed(() => {
  switch (localForm.value.tipo) {
    case 'entrada': return 'border-green-200 focus:border-green-500 focus:ring-green-500'
    case 'salida': return 'border-red-200 focus:border-red-500 focus:ring-red-500'
    case 'ajuste': return 'border-blue-200 focus:border-blue-500 focus:ring-blue-500'
    default: return 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'
  }
})

// Clase del botón según tipo
const buttonClass = computed(() => {
  switch (localForm.value.tipo) {
    case 'entrada': return 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-200'
    case 'salida': return 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-200'
    case 'ajuste': return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-200'
    default: return 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200'
  }
})

// Verificar si el formulario es válido
const isFormValid = computed(() => {
  if (!localForm.value.cantidad || localForm.value.cantidad <= 0) return false
  
  if (localForm.value.tipo === 'salida') {
    const stockActual = Number(props.ingrediente?.stock_actual || 0)
    if (localForm.value.cantidad > stockActual) return false
  }
  
  return true
})

// Watch para actualizar cuando cambia el prop form
watch(() => props.form, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    localForm.value = { ...localForm.value, ...newVal }
  }
}, { deep: true, immediate: true })

// Cálculo en tiempo real del stock proyectado
const calcularProyeccion = computed(() => {
  const actual = Number(props.ingrediente?.stock_actual || 0)
  const cantidad = Number(localForm.value.cantidad || 0)
  
  switch (localForm.value.tipo) {
    case 'entrada':
      return actual + cantidad
    case 'salida':
      return Math.max(0, actual - cantidad)
    case 'ajuste':
      return cantidad
    default:
      return actual
  }
})

// Porcentaje para la barra de progreso
const proyeccionPorcentaje = computed(() => {
  const stockMinimo = Number(props.ingrediente?.stock_minimo || 1)
  const proyeccion = calcularProyeccion.value
  const maxStock = Math.max(stockMinimo * 2, proyeccion)
  
  if (proyeccion <= 0) return 0
  if (proyeccion <= stockMinimo) return (proyeccion / stockMinimo) * 50
  return 50 + ((proyeccion - stockMinimo) / maxStock) * 50
})

// Mensaje de proyección
const proyeccionMensaje = computed(() => {
  const proyeccion = calcularProyeccion.value
  const stockMinimo = Number(props.ingrediente?.stock_minimo || 0)
  
  if (proyeccion <= 0) return '⚠️ Stock agotado - Requiere atención inmediata'
  if (proyeccion <= stockMinimo) return `⚠️ Stock bajo - Alerta: por debajo del mínimo (${stockMinimo})`
  return '✅ Stock saludable - Dentro del rango normal'
})

// Estilos para la proyección
const proyeccionStyles = computed(() => {
  const proyeccion = calcularProyeccion.value
  const stockMinimo = Number(props.ingrediente?.stock_minimo || 0)
  const esBajo = proyeccion <= stockMinimo && proyeccion > 0
  const esCero = proyeccion <= 0
  
  if (esCero) {
    return {
      bg: 'bg-red-50 border border-red-200',
      text: 'text-red-700'
    }
  }
  if (esBajo) {
    return {
      bg: 'bg-amber-50 border border-amber-200',
      text: 'text-amber-700'
    }
  }
  return {
    bg: 'bg-emerald-50 border border-emerald-200',
    text: 'text-emerald-700'
  }
})

// Clase de la barra de progreso
const proyeccionBarClass = computed(() => {
  const proyeccion = calcularProyeccion.value
  const stockMinimo = Number(props.ingrediente?.stock_minimo || 0)
  
  if (proyeccion <= 0) return 'bg-red-500'
  if (proyeccion <= stockMinimo) return 'bg-amber-500'
  return 'bg-emerald-500'
})

// Guardar el ajuste de stock
const handleGuardar = async () => {
  if (!isFormValid.value) {
    if (!localForm.value.cantidad || localForm.value.cantidad <= 0) {
      errorLocal.value = 'La cantidad debe ser mayor a 0'
    } else if (localForm.value.tipo === 'salida' && localForm.value.cantidad > (props.ingrediente?.stock_actual || 0)) {
      errorLocal.value = `No hay suficiente stock. Stock actual: ${props.ingrediente?.stock_actual} ${props.ingrediente?.unidad}`
    }
    return
  }
  
  loading.value = true
  errorLocal.value = ''

  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    
    if (!token) {
      errorLocal.value = 'No hay sesión activa. Por favor, inicia sesión nuevamente.'
      loading.value = false
      return
    }
    
    if (!props.ingrediente?.id) {
      errorLocal.value = 'Error: No se ha seleccionado un ingrediente válido.'
      loading.value = false
      return
    }
    
    const payload = {
      tipo: localForm.value.tipo,
      cantidad: Number(localForm.value.cantidad),
      motivo: localForm.value.motivo || `Ajuste de stock por ${localForm.value.tipo}`
    }
    
    const response = await fetch(`${API_URL}/ingredientes/${props.ingrediente.id}/ajustar-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (response.ok && data.success) {
      emit('guardar', data.data || { 
        id: props.ingrediente.id,
        stock_actual: calcularProyeccion.value 
      })
      emit('saved')
      emit('close')
    } else {
      errorLocal.value = data.message || data.error || 'Error al procesar el ajuste'
      if (data.errors) {
        const errors = Object.values(data.errors).flat()
        errorLocal.value = errors.join(', ')
      }
    }
  } catch (err) {
    console.error('Error en ajuste de stock:', err)
    errorLocal.value = 'Error de conexión con el servidor. Verifica tu conexión a internet.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a5b4fc;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-shake {
  animation: shake 0.3s ease-out;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.animate-bounce-slow {
  animation: bounce-slow 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 0.6s linear infinite;
}
</style>