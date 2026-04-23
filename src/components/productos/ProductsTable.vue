<template>
  <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <tr>
            <th class="px-5 py-3">Producto</th>
            <th class="px-4 py-3">Categoría</th>
            <th class="px-4 py-3">Stock</th>
            <th class="px-4 py-3">Precio</th>
            <th class="px-4 py-3">Costo</th>
            <th class="px-4 py-3">Margen</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-50">
          <tr v-if="loading">
            <td colspan="8" class="px-5 py-10">
              <div class="flex flex-col items-center justify-center gap-3 text-gray-400">
                <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p>Cargando catálogo...</p>
              </div>
            </td>
          </tr>

          <tr v-else-if="filteredProducts.length === 0">
            <td colspan="8" class="text-center py-12 text-gray-400 italic">
              <div class="flex flex-col items-center gap-2">
                <span class="text-3xl">🔍</span>
                <p>{{ searchTerm ? `No encontramos coincidencias para "${searchTerm}"` : 'Aún no hay productos en esta lista' }}</p>
              </div>
            </td>
          </tr>

          <tr
            v-else
            v-for="p in filteredProducts"
            :key="p.id"
            class="hover:bg-gray-50/50 transition-colors group"
          >
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center border border-gray-50">
                  <img
                    v-if="hasImage(p)"
                    :src="resolveImage(p)"
                    :alt="p.nombre"
                    class="w-full h-full object-cover"
                    @error="onImageError"
                  />
                  <span v-else class="text-lg">{{ p.icono || '🍽️' }}</span>
                </div>
                <div>
                  <p class="font-semibold text-gray-800 leading-none">{{ p.nombre }}</p>
                  <p class="text-[11px] text-gray-400 mt-1 line-clamp-1 max-w-[180px]">
                    {{ p.descripcion || 'Sin descripción disponible' }}
                  </p>
                </div>
              </div>
            </td>

            <td class="px-4 py-3">
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                :class="badgeClass(p.categoria?.nombre)"
              >
                {{ p.categoria?.nombre || 'General' }}
              </span>
            </td>

            <td class="px-4 py-3">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-1.5">
                  <span
                    class="px-2 py-0.5 rounded-md text-xs font-medium"
                    :class="p.estado_stock?.clase || 'bg-gray-100 text-gray-600'"
                  >
                    {{ p.stock }} uds
                  </span>
                  <span v-if="p.bajo_stock" class="text-xs animate-bounce" title="¡Stock Crítico!">⚠️</span>
                </div>
                <p class="text-[10px] text-gray-400">Min: {{ p.stock_minimo || 0 }}</p>
              </div>
            </td>

            <td class="px-4 py-3">
              <span class="font-bold text-gray-900">${{ Number(p.precio || 0).toFixed(2) }}</span>
            </td>

            <td class="px-4 py-3 text-gray-600">
              <div class="flex flex-col">
                <span>${{ calcularCostoTotal(p).toFixed(2) }}</span>
                <span class="text-[10px] text-gray-400">Insumos: {{ p.ingredientes?.length || 0 }}</span>
              </div>
            </td>

            <td class="px-4 py-3">
              <div class="flex flex-col">
                <span class="text-xs font-bold" :class="getMargenColor(calcularMargen(p))">
                  {{ calcularMargen(p).toFixed(1) }}%
                </span>
                <span class="text-[10px] text-gray-400 italic">
                  + ${{ calcularGanancia(p).toFixed(2) }}
                </span>
              </div>
            </td>

            <td class="px-4 py-3">
              <button
                @click="$emit('toggle-active', p.id)"
                class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                :class="p.activo ? 'bg-emerald-500' : 'bg-gray-200'"
              >
                <span
                  class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="p.activo ? 'translate-x-5' : 'translate-x-0'"
                ></span>
              </button>
            </td>

            <td class="px-5 py-3 text-right">
              <div class="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="$emit('edit', p)"
                  class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  title="Editar producto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  @click="$emit('delete', p.id)"
                  class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Eliminar producto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ✅ PAGINACIÓN - Mejorada con verificación de datos -->
    <div v-if="pagination && pagination.total > 0" class="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
      <p class="text-xs text-gray-500">
        Mostrando <span class="font-medium text-gray-700">{{ pagination.from || ((pagination.current_page - 1) * pagination.per_page + 1) }}</span> a 
        <span class="font-medium text-gray-700">{{ pagination.to || Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span> de 
        <span class="font-medium text-gray-700">{{ pagination.total }}</span> resultados
      </p>
      
      <div class="flex items-center gap-2">
        <button 
          @click="$emit('change-page', pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="p-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span class="text-xs font-semibold px-3 py-1 bg-white border rounded-lg shadow-sm">
          Pág. {{ pagination.current_page }} / {{ pagination.last_page }}
        </span>

        <button 
          @click="$emit('change-page', pagination.current_page + 1)"
          :disabled="pagination.current_page >= pagination.last_page"
          class="p-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { API_URL } from '@/config/api'

// 1. Props y Emits
const props = defineProps({
  products:   { type: Array,   default: () => [] },
  pagination: { type: Object,  default: () => ({ current_page: 1, last_page: 1, total: 0, per_page: 15 }) },
  loading:    { type: Boolean, default: false },
  searchTerm: { type: String,  default: '' },
})

const emit = defineEmits(['edit', 'delete', 'toggle-active', 'change-page'])

// 2. Insumos/Ingredientes para cálculos de costo
const ingredientesGlobales = ref([])
const ingredientesCargados = ref(false)

const loadIngredientes = async () => {
  if (ingredientesCargados.value) return
  
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) {
      console.warn('No hay token para cargar ingredientes')
      return
    }
    
    const res = await fetch(`${API_URL}/ingredientes`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    })
    const data = await res.json()
    if (data.success) {
      ingredientesGlobales.value = data.data || []
      ingredientesCargados.value = true
      console.log('✅ Ingredientes cargados:', ingredientesGlobales.value.length)
    }
  } catch (err) {
    console.error('Error cargando ingredientes:', err)
  }
}

// 3. Lógica de Negocio (Cálculos)
const getCostoUnitario = (ingredienteId) => {
  const ingrediente = ingredientesGlobales.value.find(i => i.id === ingredienteId)
  const costo = ingrediente?.costo_unitario || 0
  return parseFloat(costo)
}

const calcularCostoIngrediente = (ing) => {
  const ingredienteId = ing.id || ing.ingrediente_id
  const cantidad = parseFloat(ing.cantidad_necesaria || ing.cantidad || 0)
  const costoUnitario = getCostoUnitario(ingredienteId)
  return costoUnitario * cantidad
}

const calcularCostoTotal = (product) => {
  if (!product.ingredientes || product.ingredientes.length === 0) return 0
  
  return product.ingredientes.reduce((sum, ing) => {
    return sum + calcularCostoIngrediente(ing)
  }, 0)
}

const calcularMargen = (product) => {
  const costo = calcularCostoTotal(product)
  const precio = parseFloat(product.precio || 0)
  
  if (costo === 0 || precio === 0) return 0
  return ((precio - costo) / precio) * 100
}

const calcularGanancia = (product) => {
  const precio = parseFloat(product.precio || 0)
  const costo = calcularCostoTotal(product)
  return precio - costo
}

const getMargenColor = (margen) => {
  if (isNaN(margen)) return 'text-gray-400'
  if (margen >= 40) return 'text-emerald-600'
  if (margen >= 20) return 'text-blue-600'
  if (margen > 0)   return 'text-amber-600'
  return 'text-red-600'
}

// 4. Filtros y Visualización
const filteredProducts = computed(() => {
  if (!props.searchTerm) return props.products
  const t = props.searchTerm.toLowerCase()
  return props.products.filter(p => 
    p.nombre?.toLowerCase().includes(t) || 
    p.categoria?.nombre?.toLowerCase().includes(t)
  )
})

const badgeClass = (cat) => {
  const c = (cat || '').toLowerCase()
  if (c.includes('bebida')) return 'bg-blue-50 text-blue-600 border border-blue-100'
  if (c.includes('comida')) return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
  if (c.includes('postre')) return 'bg-purple-50 text-purple-600 border border-purple-100'
  return 'bg-gray-50 text-gray-500 border border-gray-100'
}

// 5. Imágenes - Backend devuelve imagen_url como /storage/productos/...
const hasImage = (p) => !!(p.imagen_url || p.imagen)
const resolveImage = (p) => {
  const path = p.imagen_url || p.imagen
  if (!path) return ''
  
  // Si ya es URL completa o data URI, devolverla tal cual
  if (path.startsWith('http') || path.startsWith('data:')) return path
  
  const base = API_URL.replace('/api', '')
  // Si empieza con /storage, concatenar con base URL
  if (path.startsWith('/storage/')) return `${base}${path}`
  
  // Fallback
  return `${base}/storage/${path}`
}
const onImageError = (e) => { e.target.style.display = 'none' }

// ✅ Recargar ingredientes cuando cambian los productos (por si hay nuevos)
watch(() => props.products, (newProducts) => {
  // Si hay productos con ingredientes y no tenemos ingredientes cargados, cargarlos
  const hasProductWithIngredients = newProducts.some(p => p.ingredientes?.length > 0)
  if (hasProductWithIngredients && !ingredientesCargados.value) {
    loadIngredientes()
  }
}, { immediate: false })

onMounted(() => {
  loadIngredientes()
})
</script>

<style scoped>
/* Transición suave para los toggles y botones */
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>