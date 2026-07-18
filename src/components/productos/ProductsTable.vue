<template>
  <div class="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">

    <!-- ═══ MOBILE: CARD VIEW (< md) ═══ -->
    <div class="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
      <template v-if="loading">
        <div class="flex flex-col items-center justify-center gap-3 py-10 text-gray-400 dark:text-gray-500">
          <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Cargando catálogo...</p>
        </div>
      </template>

      <template v-else-if="filteredProducts.length === 0">
        <div class="text-center py-12 text-gray-400 dark:text-gray-500 italic">
          <div class="flex flex-col items-center gap-2">
            <span class="text-3xl">🔍</span>
            <p>{{ searchTerm ? `No encontramos coincidencias para "${searchTerm}"` : 'Aún no hay productos en esta lista' }}</p>
          </div>
        </div>
      </template>

      <div
        v-else
        v-for="p in filteredProducts"
        :key="'m' + p.id"
        class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
      >
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 flex items-center justify-center border border-gray-50">
            <img
              v-if="hasImage(p)"
              :src="resolveImage(p)"
              :alt="p.nombre"
              class="w-full h-full object-cover"
              @error="onImageError"
            />
            <span v-else class="text-xl">{{ p.icono || '🍽️' }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-semibold text-gray-800 dark:text-gray-200">{{ p.nombre }}</p>
                <span
                  class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="badgeClass(p.categoria?.nombre)"
                >
                  {{ p.categoria?.nombre || 'General' }}
                </span>
              </div>
              <div class="flex gap-1 shrink-0">
                <button @click="$emit('edit', p)" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button @click="$emit('delete', p.id)" class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <p v-if="p.descripcion" class="text-[11px] text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{{ p.descripcion }}</p>

            <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-sm">
              <div>
                <span class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Stock</span>
                <span class="font-medium" :class="p.bajo_stock ? 'text-red-600' : 'text-gray-800 dark:text-gray-200'">{{ p.stock }} uds</span>
                <div v-if="getSizeBadges(p).length > 0" class="flex gap-1 mt-0.5 flex-wrap">
                  <span v-for="(b, i) in getSizeBadges(p)" :key="i" class="text-[9px] font-bold px-1 py-0.5 rounded-md whitespace-nowrap" :class="b.color">{{ b.letter }}:{{ b.stock }}</span>
                </div>
              </div>
              <div>
                <span class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Precio</span>
                <span class="font-bold text-gray-900 dark:text-gray-100">${{ Number(p.precio ?? 0).toFixed(2) }}</span>
                <div v-if="getSizePriceBadges(p).length > 1" class="flex gap-1 mt-0.5 flex-wrap">
                  <span v-for="(b, i) in getSizePriceBadges(p).slice(1)" :key="i" class="text-[9px] font-bold px-1 py-0.5 rounded-md whitespace-nowrap" :class="b.color">{{ b.letter }}:${{ b.precio.toFixed(2) }}</span>
                </div>
              </div>
              <div>
                <span class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Costo</span>
                <span class="text-gray-600 dark:text-gray-400">${{ calcularCostoPorTamano(p, 'pequeno').toFixed(2) }}</span>
              </div>
              <div>
                <span class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Margen</span>
                <span class="text-xs font-bold" :class="getMargenColor(calcularMargenPorTamano(p, 'pequeno'))">{{ calcularMargenPorTamano(p, 'pequeno').toFixed(1) }}%</span>
                <span class="text-[10px] text-gray-400 dark:text-gray-500 ml-1">+${{ calcularGananciaPorTamano(p, 'pequeno').toFixed(2) }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                @click="$emit('toggle-active', p.id)"
                class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                :class="p.activo ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-600'"
              >
                <span
                  class="pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-gray-800 shadow ring-0 transition duration-200 ease-in-out"
                  :class="p.activo ? 'translate-x-[14px]' : 'translate-x-0'"
                ></span>
              </button>
              <span class="text-[10px] text-gray-400 dark:text-gray-500">{{ p.activo ? 'Activo' : 'Inactivo' }}</span>
              <span class="text-[10px] text-gray-400 dark:text-gray-500">Min: {{ p.stock_minimo || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ TABLET / DESKTOP: TABLE VIEW (≥ md) ═══ -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide">
          <tr>
            <th class="px-5 py-3">Producto</th>
            <th class="px-4 py-3">Categoría</th>
            <th class="px-4 py-3">Stock</th>
            <th class="px-4 py-3">Precio</th>
            <th class="px-4 py-3 max-lg:hidden">Costo</th>
            <th class="px-4 py-3 max-lg:hidden">Margen</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-50">
          <tr v-if="loading">
            <td colspan="8" class="px-5 py-10">
              <div class="flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-500">
                <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p>Cargando catálogo...</p>
              </div>
            </td>
          </tr>

          <tr v-else-if="filteredProducts.length === 0">
            <td colspan="8" class="text-center py-12 text-gray-400 dark:text-gray-500 italic">
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
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
          >
            <td class="px-5 py-3 min-w-[180px]">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 flex items-center justify-center border border-gray-50">
                  <img
                    v-if="hasImage(p)"
                    :src="resolveImage(p)"
                    :alt="p.nombre"
                    class="w-full h-full object-cover"
                    @error="onImageError"
                  />
                  <span v-else class="text-lg">{{ p.icono || '🍽️' }}</span>
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-gray-800 dark:text-gray-200 leading-none truncate">{{ p.nombre }}</p>
                  <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1 truncate max-w-[180px]">
                    {{ p.descripcion || 'Sin descripción disponible' }}
                  </p>
                </div>
              </div>
            </td>

            <td class="px-4 py-3">
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                :class="badgeClass(p.categoria?.nombre)"
              >
                {{ p.categoria?.nombre || 'General' }}
              </span>
            </td>

            <td class="px-4 py-3">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-1.5">
                  <span
                    class="px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap"
                    :class="p.estado_stock?.clase || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'"
                  >
                    {{ p.stock }} uds
                  </span>
                  <span v-if="p.bajo_stock" class="text-xs animate-bounce" title="¡Stock Crítico!">⚠️</span>
                </div>
                <div v-if="getSizeBadges(p).length > 0" class="flex items-center gap-1 mt-1 flex-wrap">
                  <span v-for="(b, i) in getSizeBadges(p)" :key="i" class="text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap" :class="b.color">{{ b.letter }}:{{ b.stock }}</span>
                </div>
              </div>
            </td>

            <td class="px-4 py-3">
              <span class="font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">${{ Number(p.precio ?? 0).toFixed(2) }}</span>
              <div v-if="getSizePriceBadges(p).length > 1" class="flex gap-1 mt-1 flex-wrap">
                <span v-for="(b, i) in getSizePriceBadges(p).slice(1)" :key="i" class="text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap" :class="b.color">{{ b.letter }}:${{ b.precio.toFixed(2) }}</span>
              </div>
            </td>

            <td class="px-4 py-3 max-lg:hidden text-gray-600 dark:text-gray-400">
              <div class="flex flex-col">
                <span class="whitespace-nowrap">${{ calcularCostoPorTamano(p, 'pequeno').toFixed(2) }}</span>
                <div v-if="getSizePriceBadges(p).length > 1" class="flex gap-1 mt-1 flex-wrap">
                  <span v-for="(b, i) in getSizePriceBadges(p).slice(1)" :key="i" class="text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap" :class="b.color">{{ b.letter }}:${{ calcularCostoPorTamano(p, getTamanoKey(p, b.index)).toFixed(2) }}</span>
                </div>
              </div>
            </td>

            <td class="px-4 py-3 max-lg:hidden">
              <div class="flex flex-col">
                <span class="text-xs font-bold whitespace-nowrap" :class="getMargenColor(calcularMargenPorTamano(p, 'pequeno'))">
                  {{ calcularMargenPorTamano(p, 'pequeno').toFixed(1) }}%
                </span>
                <span class="text-[10px] text-gray-400 dark:text-gray-500 italic whitespace-nowrap">
                  +${{ calcularGananciaPorTamano(p, 'pequeno').toFixed(2) }}
                </span>
                <div v-if="getSizePriceBadges(p).length > 1" class="flex gap-1 mt-1 flex-wrap">
                  <span v-for="(b, i) in getSizePriceBadges(p).slice(1)" :key="i" class="text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap" :class="[b.color, getMargenColor(calcularMargenPorTamano(p, getTamanoKey(p, b.index)))]">
                    {{ b.letter }}:{{ calcularMargenPorTamano(p, getTamanoKey(p, b.index)).toFixed(1) }}%
                  </span>
                </div>
              </div>
            </td>

            <td class="px-4 py-3">
              <button
                @click="$emit('toggle-active', p.id)"
                class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                :class="p.activo ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-600'"
              >
                <span
                  class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-800 shadow ring-0 transition duration-200 ease-in-out"
                  :class="p.activo ? 'translate-x-5' : 'translate-x-0'"
                ></span>
              </button>
            </td>

            <td class="px-5 py-3 text-right">
              <div class="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="$emit('edit', p)"
                  class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
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
    <div v-if="pagination && pagination.total > 0" class="px-5 py-4 bg-gray-50 dark:bg-gray-800/50/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
      <p class="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
        Mostrando <span class="font-medium text-gray-700 dark:text-gray-300">{{ pagination.from || ((pagination.current_page - 1) * pagination.per_page + 1) }}</span> a 
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ pagination.to || Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span> de 
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ pagination.total }}</span> resultados
      </p>
      
      <div class="flex items-center gap-2">
        <button 
          @click="$emit('change-page', pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="p-2 border rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span class="text-xs font-semibold px-3 py-1 bg-white dark:bg-gray-800 border rounded-lg shadow-sm">
          Pág. {{ pagination.current_page }} / {{ pagination.last_page }}
        </span>

        <button 
          @click="$emit('change-page', pagination.current_page + 1)"
          :disabled="pagination.current_page >= pagination.last_page"
          class="p-2 border rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
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
import { API_URL, STORAGE_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'

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
const nominaMensual = ref(0)

const loadDatosCalculo = async () => {
  try {
    const [ingRes, empRes] = await Promise.all([
        apiClient.get('/ingredientes'),
        apiClient.get('/empleados')
    ])
    
    if (ingRes.success || ingRes.data) {
      ingredientesGlobales.value = ingRes.data || ingRes || []
      ingredientesCargados.value = true
    }

    if (empRes.success || empRes.data) {
        const emps = empRes.data || empRes || []
        nominaMensual.value = emps.reduce((s, e) => s + parseFloat(e.salario_base || 0), 0)
    }
    console.log('✅ Datos de cálculo cargados (Ingredientes y Nómina)')
  } catch (err) {
    console.error('Error cargando datos de cálculo:', err)
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

const calcularCostoPorTamano = (product, tamano = 'pequeno') => {
  // 1. Costo Insumos — filtrar ingredientes por tamaño
  const ingredientesFiltrados = (product.ingredientes || []).filter(ing =>
    (ing.tamano || 'pequeno') === tamano
  )
  const costoInsumos = ingredientesFiltrados.reduce((sum, ing) => {
    return sum + calcularCostoIngrediente(ing)
  }, 0)

  // Si no hay ingredientes para este tamaño, usar todos (caso single-size)
  const costoInsumosFinal = ingredientesFiltrados.length > 0
    ? costoInsumos
    : (product.ingredientes || []).reduce((sum, ing) => sum + calcularCostoIngrediente(ing), 0)

  // 2. Mano de Obra (MO)
  const minProd = parseFloat(product.minutos_produccion || 0)
  const costoMO = (nominaMensual.value / 14400) * 1.36 * minProd

  // 3. Gastos Indirectos (5% sobre Insumos + MO)
  const costoIndirecto = (costoInsumosFinal + costoMO) * 0.05

  return costoInsumosFinal + costoMO + costoIndirecto
}

const getPrecioTamano = (product, tamano = 'pequeno') => {
  const tams = Array.isArray(product.tamanos_disponibles) ? product.tamanos_disponibles : []
  const found = tams.find(t => t.key === tamano)
  if (found?.precio) return Number(found.precio)
  return parseFloat(product.precio ?? 0)
}

const calcularMargenPorTamano = (product, tamano = 'pequeno') => {
  const costo = calcularCostoPorTamano(product, tamano)
  const precio = getPrecioTamano(product, tamano)
  if (costo === 0 || precio === 0) return 0
  return ((precio - costo) / precio) * 100
}

const calcularGananciaPorTamano = (product, tamano = 'pequeno') => {
  const precio = getPrecioTamano(product, tamano)
  const costo = calcularCostoPorTamano(product, tamano)
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
  
  // Si empieza con /storage/, le quitamos eso porque STORAGE_URL ya lo incluye
  const cleanPath = path.replace(/^\/storage\//, '')
  return `${STORAGE_URL}${cleanPath}`
}
const onImageError = (e) => { e.target.style.display = 'none' }

const sizeStyles = [
  'bg-emerald-100 text-emerald-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

const getSizeLetterAt = (p, index) => {
  const tams = Array.isArray(p.tamanos_disponibles) ? p.tamanos_disponibles : []
  if (tams[index]?.nombre) return tams[index].nombre[0].toUpperCase()
  return '?'
}

const getSizeBadges = (p) => {
  const tams = Array.isArray(p.tamanos_disponibles) ? p.tamanos_disponibles : []
  if (tams.length > 0) {
    return tams.map((t, i) => ({
      letter: (t.nombre || '?')[0].toUpperCase(),
      precio: Number(t.precio ?? 0),
      stock: Number(t.stock ?? 0),
      color: sizeStyles[i % sizeStyles.length],
      index: i,
    })).filter(b => b.stock > 0 || b.precio > 0)
  }
  return []
}

const getSizePriceBadges = (p) => {
  const tams = Array.isArray(p.tamanos_disponibles) ? p.tamanos_disponibles : []
  if (tams.length > 0) {
    return tams.map((t, i) => ({
      letter: (t.nombre || '?')[0].toUpperCase(),
      precio: Number(t.precio ?? 0),
      color: sizeStyles[i % sizeStyles.length],
      index: i,
    })).filter(b => b.precio > 0)
  }
  return []
}

const getTamanoKey = (p, index) => {
  const tams = Array.isArray(p.tamanos_disponibles) ? p.tamanos_disponibles : []
  if (tams[index]?.key) return tams[index].key
  return 'pequeno'
}

// ✅ Recargar datos cuando cambian los productos
watch(() => props.products, () => {
  if (!ingredientesCargados.value) {
    loadDatosCalculo()
  }
}, { immediate: false })

onMounted(() => {
  loadDatosCalculo()
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