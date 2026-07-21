<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
    <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-zoom-in mx-4">
      
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50/50">
        <div>
          <h3 class="text-xl font-black text-gray-900 dark:text-gray-100">{{ isEdit ? 'Editar Paquete' : 'Nuevo Paquete' }}</h3>
          <p class="text-xs text-gray-400 dark:text-gray-500">Combina productos para crear ofertas únicas</p>
        </div>
        <button @click="$emit('close')" class="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-white dark:bg-gray-800 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 transition shadow-sm">✕</button>
      </div>

      <!-- Form Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        
        <!-- Información Básica -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase mb-1.5 ml-1">Nombre del Paquete</label>
              <input 
                v-model="form.nombre"
                type="text"
                placeholder="Ej: Combo Familiar"
                class="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase mb-1.5 ml-1">Precio Final</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold">$</span>
                <input 
                  v-model="form.precio"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  class="w-full pl-8 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-bold"
                />
              </div>
            </div>
          </div>

          <!-- Imagen -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase mb-1.5 ml-1">Imagen del Paquete</label>
            <div 
              @click="$refs.fileInput.click()"
              class="relative aspect-video rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-400 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group"
            >
              <img v-if="previewUrl" :src="previewUrl" class="w-full h-full object-cover" />
              <div v-else class="text-center p-4">
                <span class="text-3xl block mb-2">🖼️</span>
                <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">Click para subir imagen</p>
              </div>
              <div v-if="previewUrl" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span class="text-white text-xs font-bold bg-white dark:bg-gray-800/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">Cambiar Imagen</span>
              </div>
              <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFile" />
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase mb-1.5 ml-1">Descripción</label>
          <textarea 
            v-model="form.descripcion"
            rows="2"
            placeholder="Describe qué incluye el paquete..."
            class="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition"
          ></textarea>
        </div>

        <!-- Selector de Productos -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
            <h4 class="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">Productos Incluidos</h4>
            <span class="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">{{ form.productos.length }} productos seleccionados</span>
          </div>

            <!-- Buscador para agregar -->
            <div class="relative group">
              <input 
                v-model="searchProd"
                type="text"
                placeholder="🔍 Buscar producto para añadir..."
                @focus="isFocused = true"
                @blur="setTimeout(() => isFocused = false, 250)"
                class="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm"
              />
              
              <!-- Botón de Flecha para abrir/cerrar -->
              <button 
                type="button"
                @click.stop="isFocused = !isFocused"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:text-indigo-400 transition-all duration-300 transform"
                :class="isFocused ? 'rotate-180' : 'rotate-0'"
              >
                <span class="text-xs">▼</span>
              </button>
              
              <!-- Resultados búsqueda / Lista desplegable -->
              <div v-if="isFocused && filteredProducts.length > 0" class="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl max-h-64 overflow-y-auto animate-fade-in border-t-4 border-t-indigo-500">
                <div class="p-2 border-b border-gray-50 bg-gray-50 dark:bg-gray-800/50/50">
                  <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-2">Selecciona un producto</p>
                </div>
                <button 
                  v-for="p in filteredProducts" 
                  :key="p.id"
                  @click="addProduct(p)"
                  class="w-full px-4 py-3 text-left hover:bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-between group transition-colors border-b border-gray-50 last:border-0"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-white">
                      <img v-if="p.imagen_url" :src="p.imagen_url" class="w-full h-full object-cover" />
                      <span v-else class="text-lg">🍽️</span>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:text-indigo-400 transition-colors">{{ p.nombre }}</p>
                      <p class="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{{ p.categoria?.nombre || 'Producto' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-black text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 transition-colors">${{ p.precio }}</span>
                    <span class="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                  </div>
                </button>
              </div>
            </div>

          <!-- Lista de productos seleccionados (tabla) -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div v-if="form.productos.length === 0" class="text-center py-8">
              <p class="text-xs text-gray-400 dark:text-gray-500 font-medium italic">Selecciona al menos un producto arriba</p>
            </div>
          <template v-else>
              <div class="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                <div class="col-span-3">Producto</div>
                <div class="col-span-2 text-center">Tamaño</div>
                <div class="col-span-2 text-right">Precio c/u</div>
                <div class="col-span-2 text-center">Cant</div>
                <div class="col-span-2 text-right">Subtotal</div>
                <div class="col-span-1"></div>
              </div>
              <div v-for="(p, index) in productosConCosto" :key="p.id"
                class="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <div class="col-span-3 flex items-center gap-2 min-w-0">
                  <div class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                    <img v-if="p.imagen_url" :src="p.imagen_url" class="w-full h-full object-cover" />
                    <span v-else class="text-xs">🍽️</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{{ p.nombre }}</p>
                    <p class="text-[9px] text-gray-400 dark:text-gray-500 truncate">{{ p.categoria?.nombre || 'Sin categoría' }}</p>
                  </div>
                </div>
                <div class="col-span-2 text-center">
                  <select v-if="Array.isArray(p.tamanos_disponibles) && p.tamanos_disponibles.length > 1"
                    :value="p.tamano_key"
                    @change="changeProductSize(p, $event.target.value)"
                    class="text-[10px] px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none font-medium">
                    <option v-for="t in p.tamanos_disponibles" :key="t.key" :value="t.key">{{ t.nombre }}</option>
                  </select>
                  <span v-else class="text-[10px] text-gray-400 font-medium">{{ p.tamano_nombre || 'Único' }}</span>
                </div>
                <div class="col-span-2 text-right">
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300">${{ p.precioUnitario.toFixed(2) }}</span>
                  <p class="text-[9px] text-gray-400">c/u</p>
                </div>
                <div class="col-span-2 flex justify-center">
                  <div class="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <button @click="p.cantidad > 1 ? p.cantidad-- : null" class="w-6 h-6 rounded-lg text-gray-500 text-xs font-bold hover:text-indigo-600 transition">−</button>
                    <span class="text-xs font-black w-5 text-center text-gray-700 dark:text-gray-300">{{ p.cantidad }}</span>
                    <button @click="p.cantidad++" class="w-6 h-6 rounded-lg text-indigo-600 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition">+</button>
                  </div>
                </div>
                <div class="col-span-2 text-right text-xs font-black text-gray-900 dark:text-gray-100">${{ (p.precioUnitario * p.cantidad).toFixed(2) }}</div>
                <div class="col-span-1 text-right">
                  <button @click="removeProduct(index)" class="text-gray-300 hover:text-red-500 transition text-xs">✕</button>
                </div>
              </div>
            </template>


          </div>
        </div>

        <!-- ══ CALCULADORA DE PRECIO Y MÁRGENES ══ -->
        <div class="bg-indigo-50 dark:bg-indigo-900/30/30 rounded-3xl p-6 border border-indigo-100 space-y-5">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-black text-indigo-900 uppercase tracking-wider">💰 Análisis Financiero del Paquete</h4>
            </div>
            <div class="px-3 py-1 bg-white dark:bg-gray-800 border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-500 shadow-sm flex items-center gap-1">
              <span>⏱️</span> Tiempo Prod: {{ minutosProduccionTotal }} min
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Suma de Precios Individuales -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-indigo-50">
              <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">Suma Precios Individuales</span>
                <span class="text-xl font-black text-indigo-600 dark:text-indigo-400">${{ sumaPrecios.toFixed(2) }}</span>
              </div>
              <div v-if="productosConCosto.length > 0" class="space-y-1.5 text-[11px] border-t border-indigo-100 pt-2">
                <div v-for="p in productosConCosto" :key="'precio-'+p.id"
                  class="flex justify-between text-gray-500">
                  <span>{{ p.nombre }}<span v-if="p.tamano_nombre" class="text-gray-400"> ({{ p.tamano_nombre }})</span> <span class="text-gray-300">×{{ p.cantidad }}</span></span>
                  <span class="font-medium text-gray-700">${{ (p.precioUnitario * p.cantidad).toFixed(2) }}</span>
                </div>
              </div>
              <!-- Ahorro del paquete -->
              <div v-if="parseFloat(form.precio || 0) > 0 && sumaPrecios > 0" class="mt-3 pt-2 border-t border-dashed border-indigo-100 flex justify-between items-center">
                <span class="text-[10px] font-bold uppercase" :class="ahorroPaquete >= 0 ? 'text-emerald-500' : 'text-red-500'">{{ ahorroPaquete >= 0 ? '🎉 Ahorro cliente' : '⚠️ Sobreprecio' }}</span>
                <span class="text-sm font-black" :class="ahorroPaquete >= 0 ? 'text-emerald-600' : 'text-red-600'">${{ Math.abs(ahorroPaquete).toFixed(2) }} ({{ ahorroPaquetePct }}%)</span>
              </div>
            </div>

            <!-- Costo Producción -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-indigo-50">
              <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">Costo Producción Total</span>
                <span class="text-xl font-black text-orange-600 dark:text-orange-400">${{ costoTotal.toFixed(2) }}</span>
              </div>
              <div v-if="productosConCosto.length > 0" class="space-y-1.5 text-[11px] border-t border-indigo-100 pt-2">
                <div v-for="p in productosConCosto" :key="'costo-'+p.id"
                  class="flex justify-between text-gray-500">
                  <span>{{ p.nombre }}<span v-if="p.tamano_nombre" class="text-gray-400"> ({{ p.tamano_nombre }})</span> <span class="text-gray-300">×{{ p.cantidad }}</span></span>
                  <span class="font-medium text-gray-700">${{ (p.costoUnitario * p.cantidad).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Margen -->
          <div class="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
            <div class="flex justify-between items-center mb-1">
              <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Margen Real (Precio Paquete − Costo Prod.)</span>
              <span class="text-xl font-black text-emerald-700">${{ margenReal.toFixed(2) }}</span>
            </div>
            <p class="text-3xl font-black text-emerald-600">{{ margenRealPct }}%</p>
            <p class="text-[10px] text-emerald-500 font-bold uppercase mt-1 tracking-tighter">Utilidad sobre precio del paquete</p>
          </div>

          <!-- Sugerencia -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-indigo-100 shadow-sm relative overflow-hidden group">
            <div class="absolute right-0 top-0 bottom-0 w-24 bg-indigo-50 dark:bg-indigo-900/300/5 -skew-x-12 translate-x-12"></div>
            <div class="flex items-center justify-between relative z-10">
              <div>
                <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Precio Sugerido (30% util. sobre costo)</p>
                <p class="text-2xl font-black text-indigo-600 dark:text-indigo-400">${{ precioSugerido.toFixed(2) }}</p>
              </div>
              <button 
                @click="aplicarPrecioSugerido"
                class="px-5 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-95"
              >
                Aplicar Sugerido
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50/50 flex gap-3">
        <button 
          @click="$emit('close')"
          class="flex-1 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 transition"
        >
          Cancelar
        </button>
        <button 
          @click="save"
          :disabled="loading"
          class="flex-[2] py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 shadow-md shadow-indigo-100"
        >
          {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar Paquete' : 'Crear Paquete') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { apiClient } from '@/utils/apiClient'

const props = defineProps({
  paquete: { type: Object, default: null },
  availableProducts: { type: Array, default: () => [] },
  initialProducts: { type: Array, default: () => [] },
  totalSueldosBase: { type: Number, default: 0 }
})

const emit = defineEmits(['close', 'saved'])

const isEdit = computed(() => !!props.paquete)
const loading = ref(false)
const searchProd = ref('')
const isFocused = ref(false)
const previewUrl = ref(null)

const form = reactive({
  nombre: '',
  descripcion: '',
  precio: '',
  productos: [],
  imagenFile: null
})

/**
 * Extrae precio y costo de un tamaño.
 * - precio: viene siempre en tamanos_disponibles[].precio
 * - costo:  viene en tamanos_disponibles[].costo (si el backend lo incluye)
 *           o se busca en tamanos_personalizados[] como fallback.
 */
const extraerPrecioCosto = (p, tamanoKey) => {
  const tamanos = Array.isArray(p.tamanos_disponibles) ? p.tamanos_disponibles : []
  const tam = tamanoKey ? tamanos.find(t => t.key === tamanoKey) : tamanos[0]

  // Precio de venta del tamaño (siempre disponible)
  const precio = Number(tam?.precio ?? p.precio ?? 0)

  // Costo de producción: intentar desde tamanos_disponibles, luego tamanos_personalizados
  let costo = Number(tam?.costo ?? 0)
  if (!costo && p.tamanos_personalizados) {
    try {
      const raw = typeof p.tamanos_personalizados === 'string'
        ? JSON.parse(p.tamanos_personalizados)
        : p.tamanos_personalizados
      if (Array.isArray(raw)) {
        const match = tamanoKey
          ? raw.find(t => t.key === tamanoKey)
          : raw[0]
        costo = Number(match?.costo ?? 0)
      }
    } catch { /* ignore parse errors */ }
  }
  // Último fallback: campo costo en el producto
  if (!costo) costo = Number(p.costo ?? 0)

  return { precio, costo }
}

onMounted(() => {
  if (props.paquete) {
    form.nombre = props.paquete.nombre
    form.descripcion = props.paquete.descripcion
    form.precio = props.paquete.precio
    form.productos = props.paquete.productos.map(p => {
      const tamanos = Array.isArray(p.tamanos_disponibles) ? p.tamanos_disponibles : []
      const tamanoInicial = tamanos.find(t => t.key === p.tamano_key) || tamanos[0] || null
      const tamKey = p.tamano_key || tamanoInicial?.key || null
      const { precio, costo } = extraerPrecioCosto(p, tamKey)
      return {
        ...p,
        cantidad: p.pivot?.cantidad || 1,
        tamano_key: tamKey,
        tamano_nombre: p.tamano_nombre || tamanoInicial?.nombre || 'Único',
        precio_tamano: precio,
        costo_tamano: costo,
      }
    })
    previewUrl.value = props.paquete.imagen_url
  } else if (props.initialProducts && props.initialProducts.length > 0) {
    form.productos = props.initialProducts.map(p => {
      const tamanos = Array.isArray(p.tamanos_disponibles) ? p.tamanos_disponibles : []
      const tamano = tamanos.length > 0 ? tamanos[0] : null
      const tamKey = tamano?.key ?? null
      const { precio, costo } = extraerPrecioCosto(p, tamKey)
      return {
        ...p,
        cantidad: 1,
        tamano_key: tamKey,
        tamano_nombre: tamano?.nombre ?? 'Único',
        precio_tamano: precio,
        costo_tamano: costo,
      }
    })
  }
})

// ── Lógica Financiera ──────────────────────────────────────────────────────────
const minutosProduccionTotal = computed(() => {
  return form.productos.reduce((sum, p) => {
    return sum + (parseFloat(p.minutos_produccion || 0) * p.cantidad)
  }, 0)
})

/**
 * Cada producto en el paquete tiene:
 *   - precio_tamano: precio de venta unitario del tamaño elegido
 *   - costo_tamano:  costo de producción unitario (insumos + MO + indirectos)
 *
 * productosConCosto expone ambos valores calculados para el template.
 */
const precioProducto = (p) => Number(p.precio_tamano ?? p.precio ?? 0)
const costoProducto  = (p) => Number(p.costo_tamano  ?? p.costo  ?? 0)

const productosConCosto = computed(() =>
  form.productos.map(p => ({
    ...p,
    precioUnitario: precioProducto(p),
    costoUnitario:  costoProducto(p),
  }))
)

// Suma de los precios individuales de cada producto (lo que costarían por separado)
const sumaPrecios = computed(() =>
  productosConCosto.value.reduce((sum, p) => sum + (p.precioUnitario * p.cantidad), 0)
)

// Costo total de producción del paquete
const costoTotal = computed(() =>
  productosConCosto.value.reduce((sum, p) => sum + (p.costoUnitario * p.cantidad), 0)
)

// Ahorro que obtiene el cliente comprando el paquete vs. individualmente
const ahorroPaquete = computed(() => {
  const precioPaquete = parseFloat(form.precio || 0)
  return sumaPrecios.value - precioPaquete
})
const ahorroPaquetePct = computed(() => {
  return sumaPrecios.value > 0 ? Math.round((ahorroPaquete.value / sumaPrecios.value) * 100) : 0
})

// Precio sugerido con 30% de utilidad sobre el costo total de producción
const precioSugerido = computed(() => costoTotal.value > 0 ? costoTotal.value * 1.30 : sumaPrecios.value * 0.90)

// Margen real = precio del paquete − costo de producción
const margenReal = computed(() => {
  const precio = parseFloat(form.precio || 0)
  return precio - costoTotal.value
})

const margenRealPct = computed(() => {
  const precio = parseFloat(form.precio || 0)
  return precio > 0 ? Math.round((margenReal.value / precio) * 100) : 0
})

const aplicarPrecioSugerido = () => {
  form.precio = Math.ceil(precioSugerido.value * 100) / 100
}

const filteredProducts = computed(() => {
  const s = searchProd.value.toLowerCase()
  const available = props.availableProducts.filter(p => !form.productos.find(fp => fp.id === p.id))
  
  if (!s) return available.slice(0, 20) // Mostrar primeros 20 por defecto
  
  return available.filter(p => 
    p.nombre.toLowerCase().includes(s)
  ).slice(0, 20)
})

const handleFile = (e) => {
  const file = e.target.files[0]
  if (!file) return
  form.imagenFile = file
  previewUrl.value = URL.createObjectURL(file)
}

const addProduct = (p) => {
  const tamanos = Array.isArray(p.tamanos_disponibles) ? p.tamanos_disponibles : []
  const tamano = tamanos.length > 0 ? tamanos[0] : null
  const tamKey = tamano?.key ?? null
  const { precio, costo } = extraerPrecioCosto(p, tamKey)
  form.productos.push({
    ...p,
    cantidad: 1,
    tamano_key: tamKey,
    tamano_nombre: tamano?.nombre ?? 'Único',
    precio_tamano: precio,
    costo_tamano: costo,
  })
  searchProd.value = ''
  isFocused.value = false // 👈 Cerrar el buscador tras añadir
}

const changeProductSize = (p, tamanoKey) => {
  const tamanos = Array.isArray(p.tamanos_disponibles) ? p.tamanos_disponibles : []
  const tamano = tamanos.find(t => t.key === tamanoKey)
  if (tamano) {
    const { precio, costo } = extraerPrecioCosto(p, tamanoKey)
    p.tamano_key = tamano.key
    p.tamano_nombre = tamano.nombre
    p.precio_tamano = precio
    p.costo_tamano = costo
  }
}

const removeProduct = (idx) => {
  form.productos.splice(idx, 1)
}

const save = async () => {
  if (!form.nombre || !form.precio || form.productos.length === 0) {
    alert('Por favor completa los campos obligatorios y añade al menos un producto.')
    return
  }

  loading.value = true
  const formData = new FormData()
  formData.append('nombre', form.nombre)
  formData.append('descripcion', form.descripcion || '')
  formData.append('precio', form.precio)
  
  if (form.imagenFile) {
    formData.append('imagen', form.imagenFile)
  }

  form.productos.forEach((p, i) => {
    formData.append(`productos[${i}][id]`, p.id)
    formData.append(`productos[${i}][cantidad]`, p.cantidad)
  })

  // Para Laravel spoofing de PUT
  if (isEdit.value) {
    formData.append('_method', 'PUT')
  }

  try {
    const endpoint = isEdit.value ? `/paquetes/${props.paquete.id}` : `/paquetes`
    
    const data = await apiClient.post(endpoint, formData)

    if (data.success || data.data) {
      emit('saved', data.data || data)
    } else {
      alert(data.message || 'Error al guardar el paquete')
    }
  } catch (error) {
    console.error('Error saving package:', error)
    alert('Error de conexión')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-zoom-in { animation: zoom-in 0.3s ease-out; }
.animate-fade-in { animation: fade-in 0.3s ease-out; }
</style>
