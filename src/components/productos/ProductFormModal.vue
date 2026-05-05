<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">

      <!-- Encabezado -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">
          {{ product ? 'Editar Producto' : 'Nuevo Producto' }}
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none transition">✕</button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        <button @click="activeTab = 'info'"
          :class="['flex-1 py-2 text-sm font-semibold rounded-lg transition',
            activeTab === 'info' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200']">
          📝 Información
        </button>
        <button @click="switchToReceta"
          :class="['flex-1 py-2 text-sm font-semibold rounded-lg transition relative',
            activeTab === 'receta' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200']">
          🧪 Receta
          <span v-if="receta.length" class="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {{ receta.length }}
          </span>
        </button>
      </div>

      <!-- Error general -->
      <div v-if="errorMessage" class="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
        {{ errorMessage }}
      </div>

      <!-- ══ TAB INFO ══ -->
      <div v-show="activeTab === 'info'" class="space-y-4">

        <!-- IMAGEN -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Imagen del producto</label>
          <div
            class="relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all"
            :class="isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @click="imageInput?.click()"
          >
            <input
              ref="imageInput"
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              class="hidden"
              @change="handleImageSelect"
            />
            <div v-if="imagePreview" class="relative">
              <img :src="imagePreview" alt="Preview" class="w-full h-40 object-cover" />
              <div class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-2">
                <span class="text-white text-sm font-medium">Cambiar imagen</span>
              </div>
              <button type="button" @click.stop="removeImage"
                class="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition">✕</button>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-8 text-gray-400">
              <span class="text-3xl mb-2">🖼️</span>
              <p class="text-sm font-medium">Arrastra una imagen o haz clic</p>
              <p class="text-xs mt-1">JPG, PNG, WebP · máx. 2MB</p>
            </div>
          </div>
          <label v-if="product?.tiene_imagen && !newImageFile" class="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
            <input v-model="form.eliminar_imagen" type="checkbox" class="accent-red-500" />
            <span class="text-red-500">Eliminar imagen actual</span>
          </label>
        </div>

        <!-- Nombre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input v-model="form.nombre" type="text" placeholder="Ej. Hamburguesa"
            class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            :class="errors.nombre ? 'border-red-400' : 'border-gray-200'" />
          <p v-if="errors.nombre" class="text-xs text-red-500 mt-1">{{ errors.nombre }}</p>
        </div>

        <!-- Descripción -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Descripción <span class="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea v-model="form.descripcion" placeholder="Descripción del producto" rows="2"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm resize-none"></textarea>
        </div>

        <!-- Precio y Stock -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
            <div class="relative">
              <span class="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
              <input v-model.number="form.precio" type="number" step="0.01" min="0" placeholder="0.00"
                class="w-full pl-7 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                :class="errors.precio ? 'border-red-400' : 'border-gray-200'" />
            </div>
            <p v-if="errors.precio" class="text-xs text-red-500 mt-1">{{ errors.precio }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Stock (Calculado por receta)</label>
            <input v-model.number="form.stock" type="number" readonly placeholder="0"
              class="w-full px-4 py-2.5 border border-gray-100 bg-gray-50 text-gray-500 rounded-xl focus:outline-none text-sm cursor-not-allowed font-bold" />
            <p v-if="receta.length" class="text-[10px] text-indigo-500 mt-1">✓ Sincronizado con ingredientes</p>
          </div>
        </div>

        <!-- Categoría -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
          <select v-model="form.categoria_id"
            class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white"
            :class="errors.categoria_id ? 'border-red-400' : 'border-gray-200'">
            <option :value="null">Seleccionar categoría</option>
            <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
          </select>
          <p v-if="errors.categoria_id" class="text-xs text-red-500 mt-1">{{ errors.categoria_id }}</p>
        </div>

        <!-- Stock mínimo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Stock mínimo <span class="text-gray-400 font-normal">(alerta de bajo stock)</span>
          </label>
          <input v-model.number="form.stock_minimo" type="number" min="0" placeholder="5"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" />
        </div>

        <!-- Activo (solo edición) -->
        <div v-if="product" class="flex items-center gap-2">
          <input v-model="form.activo" type="checkbox" class="w-4 h-4 accent-indigo-600 rounded" />
          <label class="text-sm text-gray-700">Producto activo</label>
        </div>

      </div>

      <!-- ══ TAB RECETA ══ -->
      <div v-show="activeTab === 'receta'" class="space-y-4">

        <!-- Loading -->
        <div v-if="loadingReceta" class="flex items-center justify-center py-10 gap-2 text-gray-400 text-sm">
          <div class="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
          Cargando receta...
        </div>

        <template v-else>

          <!-- ── PANEL DE PORCIONES (siempre visible si hay receta) ── -->
          <div v-if="receta.length" class="space-y-2">

            <!-- Costo + margen -->
            <div class="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3">
              <div>
                <p class="text-xs text-indigo-600 font-semibold uppercase tracking-wide">Costo de producción</p>
                <p class="text-lg font-black text-indigo-700">${{ costoTotalReceta.toFixed(2) }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-400">Margen estimado</p>
                <p class="text-sm font-bold" :class="margenEstimado >= 0 ? 'text-emerald-600' : 'text-red-500'">
                  {{ margenEstimado >= 0 ? '+' : '' }}${{ margenEstimado.toFixed(2) }}
                  <span class="text-xs">({{ margenPct }}%)</span>
                </p>
              </div>
            </div>

            <!-- Porciones posibles con stock actual -->
            <div v-if="porcionesDisponibles !== null"
              class="flex items-center justify-between rounded-xl px-4 py-3"
              :class="porcionesDisponibles === 0
                ? 'bg-red-50 border border-red-200'
                : porcionesDisponibles <= 5
                  ? 'bg-amber-50 border border-amber-200'
                  : 'bg-emerald-50 border border-emerald-200'">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide"
                  :class="porcionesDisponibles === 0 ? 'text-red-600' : porcionesDisponibles <= 5 ? 'text-amber-700' : 'text-emerald-700'">
                  {{ porcionesDisponibles === 0 ? '🚨 Sin stock suficiente' : porcionesDisponibles <= 5 ? '⚠️ Stock bajo' : '✅ Stock disponible' }}
                </p>
                <p class="text-xs text-gray-500 mt-0.5">Con el stock actual puedes preparar:</p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-black"
                  :class="porcionesDisponibles === 0 ? 'text-red-600' : porcionesDisponibles <= 5 ? 'text-amber-700' : 'text-emerald-700'">
                  {{ porcionesDisponibles }}
                </p>
                <p class="text-xs text-gray-400">porciones</p>
              </div>
            </div>

            <!-- ── PRECIO SUGERIDO ── -->
            <div class="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 space-y-2">
              <p class="text-xs font-bold text-violet-700 uppercase tracking-wide">💡 Precio sugerido</p>

              <!-- Minutos de producción -->
              <div class="flex items-center gap-3">
                <label class="text-xs text-gray-600 w-40 shrink-0">Tiempo de producción</label>
                <div class="flex items-center gap-1 flex-1">
                  <input
                    v-model.number="minutosProduccion"
                    type="number" min="0" step="1" placeholder="10"
                    class="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-400 outline-none text-center font-semibold"
                  />
                  <span class="text-xs text-gray-400">min</span>
                </div>
              </div>

              <!-- Nómina diaria total -->
              <div class="flex items-center gap-3">
                <label class="text-xs text-gray-600 w-40 shrink-0">Nómina diaria total</label>
                <div class="flex items-center gap-1 flex-1">
                  <span class="text-gray-400 text-sm">$</span>
                  <input
                    v-model.number="nominaDiaria"
                    type="number" min="0" step="0.01" placeholder="0.00"
                    class="w-24 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-400 outline-none font-semibold"
                  />
                  <span class="text-xs text-gray-400">/ día</span>
                </div>
              </div>

              <!-- Minutos de turno -->
              <div class="flex items-center gap-3">
                <label class="text-xs text-gray-600 w-40 shrink-0">Minutos por turno</label>
                <div class="flex items-center gap-1 flex-1">
                  <input
                    v-model.number="minutosTurno"
                    type="number" min="1" step="1" placeholder="480"
                    class="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-400 outline-none text-center font-semibold"
                  />
                  <span class="text-xs text-gray-400">min (ej. 480 = 8h)</span>
                </div>
              </div>

              <!-- Desglose del precio sugerido -->
              <div v-if="precioSugerido > 0" class="mt-2 pt-2 border-t border-violet-200 space-y-1">
                <div class="flex justify-between text-xs text-gray-500">
                  <span>Costo insumos</span>
                  <span>${{ costoTotalReceta.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-xs text-gray-500">
                  <span>Mano de obra ({{ minutosProduccion }} min)</span>
                  <span>${{ costoManoObra.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-xs text-gray-500">
                  <span>Gastos indirectos (5%)</span>
                  <span>${{ costoIndirectos.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-xs text-gray-500">
                  <span>Utilidad (30%)</span>
                  <span>${{ costoUtilidad.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm font-bold text-violet-800 pt-1 border-t border-violet-300">
                  <span>Precio sugerido</span>
                  <span>${{ precioSugerido.toFixed(2) }}</span>
                </div>
                <button @click="aplicarPrecioSugerido" type="button"
                  class="w-full mt-1 py-1.5 text-xs font-semibold text-violet-700 bg-white border border-violet-300 rounded-lg hover:bg-violet-100 transition">
                  Aplicar precio sugerido → ${{ precioSugerido.toFixed(2) }}
                </button>
              </div>
              <p v-else class="text-xs text-violet-500 italic">Ingresa los datos de nómina y tiempo para calcular el precio sugerido.</p>
            </div>

          </div>

          <!-- Lista de ingredientes de la receta -->
          <div v-if="receta.length" class="space-y-2">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ingredientes asignados</p>
            <div v-for="(item, idx) in receta" :key="item.id"
              class="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-indigo-200 transition">
              <div class="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-base"
                :class="item.bajo_stock ? 'bg-amber-100' : 'bg-indigo-50'">
                {{ item.bajo_stock ? '⚠️' : '🧄' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">{{ item.nombre }}</p>
                <p class="text-xs text-gray-400">
                  Stock: {{ item.stock_actual }} {{ item.unidad }}
                  · ${{ Number(item.costo_unitario).toFixed(4) }}/{{ item.unidad }}
                </p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <input v-model.number="item.cantidad_receta" type="number" min="0.001" step="0.001"
                  class="w-24 px-2 py-1.5 text-sm text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                  @input="recetaModificada = true" />
                <span class="text-xs text-gray-400 w-8">{{ item.unidad }}</span>
                <button @click="quitarDeReceta(idx)" type="button"
                  class="w-6 h-6 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition text-xs flex items-center justify-center">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- Lista de selección de ingredientes -->
          <div class="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <div class="p-3 bg-white border-b border-gray-200">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                {{ receta.length ? 'Agregar más ingredientes' : 'Catálogo de ingredientes' }}
              </p>
              <div class="relative">
                <input v-model="busquedaIngrediente" type="text" placeholder="🔍 Filtrar ingredientes..."
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  @input="buscarIngredientes" />
              </div>
            </div>
            
            <div class="max-h-60 overflow-y-auto p-2 space-y-1">
              <div v-if="!ingredientesBusqueda.length && busquedaIngrediente" class="py-10 text-center">
                <p class="text-xs text-gray-400 italic">No se encontraron ingredientes con "{{ busquedaIngrediente }}"</p>
              </div>
              <div v-else-if="!todosIngredientes.length" class="py-10 text-center">
                <p class="text-xs text-gray-400 italic">No hay ingredientes registrados en el sistema.</p>
              </div>
              <div v-else v-for="ing in (busquedaIngrediente ? ingredientesBusqueda : todosIngredientes)" :key="ing.id"
                class="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border border-transparent hover:border-indigo-100 hover:shadow-sm transition group">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">{{ ing.nombre }}</p>
                  <p class="text-[10px] text-gray-400">Stock: {{ ing.stock_actual }} {{ ing.unidad }} · ${{ Number(ing.costo_unitario).toFixed(2) }}</p>
                </div>
                <button v-if="!yaEnReceta(ing.id)" @click="seleccionarIngrediente(ing)" type="button"
                  class="px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-600 hover:text-white transition uppercase">
                  + Agregar
                </button>
                <span v-else class="px-3 py-1.5 text-[11px] font-bold text-emerald-500 bg-emerald-50 rounded-lg uppercase">
                  ✓ Agregado
                </span>
              </div>
            </div>
          </div>

          <p v-if="!receta.length && !loadingReceta" class="text-center text-xs text-gray-400 italic">
            Agrega ingredientes para calcular el costo de producción y controlar el stock automáticamente.
          </p>

          <!-- Guardar receta -->
          <button v-if="recetaModificada || receta.length" @click="guardarReceta" :disabled="guardandoReceta" type="button"
            class="w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition disabled:opacity-50">
            {{ guardandoReceta ? 'Guardando receta...' : '💾 Guardar receta' }}
          </button>

        </template>
      </div>

      <!-- Botones -->
      <div class="flex gap-3 mt-6">
        <button @click="$emit('close')" type="button"
          class="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
          Cancelar
        </button>
        <button @click="save" :disabled="loading" type="button"
          class="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
          {{ loading ? 'Guardando...' : (product ? 'Guardar cambios' : 'Crear producto') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted, onUnmounted } from 'vue'

// ── Importa la URL base desde tu config centralizado ──────────────────────────
// Si tu proyecto usa @/config/api, descomenta la siguiente línea y elimina la constante:
// import { API_URL } from '@/config/api'
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

// ── Props / Emits ─────────────────────────────────────────────────────────────
const props = defineProps<{
  product?: any
  categorias?: any[]
}>()

const emit = defineEmits(['close', 'saved'])

// ── Estado general ────────────────────────────────────────────────────────────
const loading      = ref(false)
const errorMessage = ref('')
const isDragging   = ref(false)
const imageInput   = ref<HTMLInputElement | null>(null)
const imagePreview = ref<string | null>(null)
const newImageFile = ref<File | null>(null)
const categorias   = ref<any[]>(props.categorias || [])
const activeTab    = ref<'info' | 'receta'>('info')

const form = reactive({
  nombre: '', descripcion: '', precio: 0, stock: 0,
  stock_minimo: 5, categoria_id: null as number | null,
  activo: true, eliminar_imagen: false,
  minutos_produccion: 0, nomina_diaria: 0
})

const errors = reactive({ nombre: '', precio: '', categoria_id: '' })

// ── Estado Receta ─────────────────────────────────────────────────────────────
const receta               = ref<any[]>([])
const loadingReceta        = ref(false)
const guardandoReceta      = ref(false)
// FIX: recetaModificada solo se activa cuando el USUARIO edita, no al cargar
const recetaModificada     = ref(false)
const busquedaIngrediente  = ref('')
const ingredientesBusqueda = ref<any[]>([])
const todosIngredientes    = ref<any[]>([])
const showDropdown         = ref(false)



// ── Estado Precio Sugerido ────────────────────────────────────────────────────
const minutosProduccion = computed({
  get: () => form.minutos_produccion,
  set: (val) => form.minutos_produccion = val
})
const nominaDiaria = computed({
  get: () => form.nomina_diaria,
  set: (val) => form.nomina_diaria = val
})
const minutosTurno      = ref(480) // 8 horas por defecto

// ── Computed: Costos y precio sugerido ───────────────────────────────────────
const costoTotalReceta = computed(() =>
  receta.value.reduce((s, i) => s + (Number(i.cantidad_receta) * Number(i.costo_unitario || 0)), 0)
)

/**
 * Costo de mano de obra por porción:
 * (nómina diaria × 1.66 carga social) / minutos del turno × minutos de producción
 */
const costoManoObra = computed(() => {
  if (!nominaDiaria.value || !minutosTurno.value || !minutosProduccion.value) return 0
  const costoPorMinuto = (nominaDiaria.value * 1.66) / minutosTurno.value
  return costoPorMinuto * minutosProduccion.value
})

const costoBase = computed(() => costoTotalReceta.value + costoManoObra.value)

// 5% de gastos indirectos sobre (insumos + mano de obra)
const costoIndirectos = computed(() => costoBase.value * 0.05)

// 30% de utilidad sobre el subtotal (insumos + mo + indirectos)
const costoUtilidad = computed(() => {
  const subtotal = costoBase.value + costoIndirectos.value
  return subtotal * 0.30
})

const precioSugerido = computed(() => {
  if (!receta.value.length) return 0
  return costoBase.value + costoIndirectos.value + costoUtilidad.value
})

const aplicarPrecioSugerido = () => {
  form.precio = Math.ceil(precioSugerido.value * 100) / 100
}

// Porciones posibles con el stock actual de ingredientes
const porcionesDisponibles = computed<number | null>(() => {
  if (!receta.value.length) return null
  const valores = receta.value.map(i => {
    const cant  = Number(i.cantidad_receta)
    const stock = Number(i.stock_actual ?? 0)
    if (cant <= 0) return Infinity
    return Math.floor(stock / cant)
  })
  const min = Math.min(...valores)
  return min === Infinity ? 0 : min
})

// ── Link de Stock Automático (Ahora en el orden correcto) ────────────────────
watch(porcionesDisponibles, (newVal) => {
  if (newVal !== null && receta.value.length > 0) {
    form.stock = newVal
  }
})

const margenEstimado = computed(() => {
  const precio = Number(form.precio) || 0
  return precio - costoTotalReceta.value
})

const margenPct = computed(() => {
  const precio = Number(form.precio) || 0
  return precio > 0 ? Math.round((margenEstimado.value / precio) * 100) : 0
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const getToken = () =>
  localStorage.getItem('token') ?? sessionStorage.getItem('token') ?? ''

const getHeaders = (withContentType = true) => {
  const token = getToken()
  const h: Record<string, string> = {
    Authorization: token ? `Bearer ${token}` : '',
    Accept: 'application/json',
  }
  if (withContentType) h['Content-Type'] = 'application/json'
  return h
}

const yaEnReceta = (id: number) => receta.value.some(r => r.id === id)

// ── Cargar ingredientes del catálogo (una sola vez) ───────────────────────────
const loadTodosIngredientes = async () => {
  if (todosIngredientes.value.length) return
  try {
    const res  = await fetch(`${API_URL}/ingredientes`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) todosIngredientes.value = data.data || []
  } catch (e) {
    console.error('Error cargando ingredientes:', e)
  }
}

/**
 * FIX PRINCIPAL: Cargar la receta del producto actual.
 * - Siempre hace el fetch (no cachea entre ediciones distintas).
 * - Mapea cantidad_receta desde el campo correcto del pivot.
 * - NO activa recetaModificada al cargar datos existentes.
 */
const cargarReceta = async () => {
  loadingReceta.value = true
  receta.value = []
  recetaModificada.value = false  // reset — cargar datos no es una modificación

  try {
    // Primero cargamos el catálogo de ingredientes (necesario para la búsqueda)
    await loadTodosIngredientes()

    if (!props.product?.id) {
      loadingReceta.value = false
      return
    }

    const res  = await fetch(`${API_URL}/ingredientes/producto/${props.product.id}`, { headers: getHeaders() })
    const data = await res.json()

    if (data.success && Array.isArray(data.data)) {
      receta.value = data.data.map((i: any) => ({
        ...i,
        // El backend devuelve cantidad_receta (v2) o cantidad (pivot v1)
        // Tomamos el primero que exista y no sea 0
        cantidad_receta: parseFloat(i.cantidad_receta ?? i.cantidad ?? 0),
      }))
    }
  } catch (e) {
    console.error('Error cargando receta:', e)
  } finally {
    loadingReceta.value = false
  }
}

// Cambiar a tab receta carga siempre los datos frescos
const switchToReceta = async () => {
  activeTab.value = 'receta'
  await cargarReceta()
}

// ── Búsqueda de ingredientes ──────────────────────────────────────────────────
const buscarIngredientes = () => {
  if (!busquedaIngrediente.value.trim()) {
    ingredientesBusqueda.value = []
    return
  }
  const q = busquedaIngrediente.value.toLowerCase()
  ingredientesBusqueda.value = todosIngredientes.value
    .filter(i => i.nombre.toLowerCase().includes(q))
    .slice(0, 8)
}

const seleccionarIngrediente = (ing: any) => {
  if (!yaEnReceta(ing.id)) {
    receta.value.push({ ...ing, cantidad_receta: 1 })
    recetaModificada.value = true
  }
  busquedaIngrediente.value  = ''
  ingredientesBusqueda.value = []
  showDropdown.value         = false
}

const quitarDeReceta = (idx: number) => {
  receta.value.splice(idx, 1)
  recetaModificada.value = true
}

// ── Guardar receta ────────────────────────────────────────────────────────────
const guardarReceta = async () => {
  if (!props.product?.id) return
  guardandoReceta.value = true

  try {
    const payload = {
      ingredientes: receta.value.map(i => ({
        id:       i.id,
        cantidad: Number(i.cantidad_receta),
      })),
    }
    const res  = await fetch(`${API_URL}/ingredientes/producto/${props.product.id}/sync`, {
      method:  'POST',
      headers: getHeaders(),
      body:    JSON.stringify(payload),
    })
    const data = await res.json()

    if (data.success) {
      recetaModificada.value = false
    } else {
      errorMessage.value = data.message || 'Error al guardar receta'
    }
  } catch {
    errorMessage.value = 'Error de conexión al guardar receta'
  } finally {
    guardandoReceta.value = false
  }
}

// ── Imagen ────────────────────────────────────────────────────────────────────
const handleImageSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) setImage(file)
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) setImage(file)
}

const setImage = (file: File) => {
  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = 'La imagen no puede superar 2MB'
    return
  }
  newImageFile.value   = file
  form.eliminar_imagen = false
  const reader         = new FileReader()
  reader.onload = (e) => { imagePreview.value = e.target?.result as string }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  newImageFile.value = null
  imagePreview.value = null
  if (imageInput.value) imageInput.value.value = ''
}

// ── Precargar formulario al abrir / cambiar producto ──────────────────────────
const resetForm = () => {
  const p = props.product
  form.nombre          = p?.nombre       ?? ''
  form.descripcion     = p?.descripcion  ?? ''
  form.precio          = p?.precio       ?? 0
  form.stock           = p?.stock        ?? 0
  form.stock_minimo    = p?.stock_minimo ?? 5
  form.categoria_id    = p?.categoria_id ?? null
  form.activo          = p?.activo       ?? true
  form.eliminar_imagen = false
  imagePreview.value     = p?.imagen_url   ?? null
  newImageFile.value     = null
  form.minutos_produccion = p?.minutos_produccion ?? 0
  form.nomina_diaria     = p?.nomina_diaria ?? 0
  errors.nombre          = ''
  errors.precio        = ''
  errors.categoria_id  = ''
  errorMessage.value   = ''
  // Reset receta — se cargará al abrir el tab
  receta.value          = []
  recetaModificada.value = false
  activeTab.value        = 'info'
}

watch(() => props.product, resetForm, { immediate: true })

// ── Validación ────────────────────────────────────────────────────────────────
const validate = () => {
  errors.nombre       = form.nombre.trim()   ? '' : 'El nombre es obligatorio'
  errors.precio       = form.precio > 0      ? '' : 'El precio debe ser mayor a 0'
  errors.categoria_id = form.categoria_id    ? '' : 'Selecciona una categoría'
  return !errors.nombre && !errors.precio && !errors.categoria_id
}

// ── Guardar producto ──────────────────────────────────────────────────────────
const save = async () => {
  if (!validate()) return
  loading.value      = true
  errorMessage.value = ''

  try {
    const url    = props.product ? `${API_URL}/productos/${props.product.id}` : `${API_URL}/productos`
    let res: Response

    if (newImageFile.value) {
      // Con imagen: multipart/form-data
      const fd = new FormData()
      fd.append('nombre',       form.nombre)
      fd.append('descripcion',  form.descripcion || '')
      fd.append('precio',       String(form.precio))
      fd.append('stock',        String(form.stock))
      fd.append('stock_minimo', String(form.stock_minimo))
      if (form.categoria_id) fd.append('categoria_id', String(form.categoria_id))
      fd.append('activo',             form.activo ? '1' : '0')
      fd.append('minutos_produccion', String(form.minutos_produccion))
      fd.append('nomina_diaria',      String(form.nomina_diaria))
      fd.append('imagen',             newImageFile.value)
      if (props.product) fd.append('_method', 'PUT')

      res = await fetch(url, {
        method:  'POST',
        headers: getHeaders(false),
        body:    fd,
      })
    } else {
      // Sin imagen: JSON
      const method = props.product ? 'PUT' : 'POST'
      res = await fetch(url, {
        method,
        headers: getHeaders(true),
        body: JSON.stringify({
          nombre:          form.nombre,
          descripcion:     form.descripcion,
          precio:          form.precio,
          stock:           form.stock,
          stock_minimo:    form.stock_minimo,
          categoria_id:    form.categoria_id,
          activo:             form.activo,
          eliminar_imagen:    form.eliminar_imagen,
          minutos_produccion: form.minutos_produccion,
          nomina_diaria:      form.nomina_diaria,
        }),
      })
    }

    const data = await res.json()

    if (res.ok && data.success) {
      emit('saved')
    } else {
      errorMessage.value = data.errors
        ? Object.values(data.errors).flat().join(' · ')
        : data.message || 'Error al guardar producto'
    }
  } catch {
    errorMessage.value = 'Error de conexión'
  } finally {
    loading.value = false
  }
}

// ── Categorías (si no vienen como prop) ──────────────────────────────────────
const loadCategorias = async () => {
  try {
    const res  = await fetch(`${API_URL}/categorias`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) categorias.value = data.data || []
  } catch (e) {
    console.error('Error categorías:', e)
  }
}

// ── Cerrar dropdown al hacer clic fuera ──────────────────────────────────────
const handleClickOutside = () => { showDropdown.value = false }

onMounted(() => {
  if (!categorias.value.length) loadCategorias()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>