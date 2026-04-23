<template>
  <div class="p-4 sm:p-6 space-y-6 bg-gray-50/50 min-h-screen">
    
    <div class="fixed top-4 right-4 z-[60] space-y-2 pointer-events-none">
      <TransitionGroup name="list">
        <div v-for="toast in toasts" :key="toast.id"
          :class="['px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px] pointer-events-auto border backdrop-blur-md',
            toast.type==='success'?'bg-emerald-50/90 border-emerald-200 text-emerald-900':'bg-red-50/90 border-red-200 text-red-900']">
          <span class="text-xl">{{ toast.type==='success'?'✅':'❌' }}</span>
          <span class="text-sm font-semibold flex-1">{{ toast.message }}</span>
          <button @click="removeToast(toast.id)" class="opacity-50 hover:opacity-100 text-lg">×</button>
        </div>
      </TransitionGroup>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">📢 Marquesina de Anuncios</h1>
        <p class="text-gray-500 font-medium">Impulsa tus ventas con promociones en tiempo real</p>
      </div>
      <button @click="abrirModal()"
        class="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95">
        <span class="text-xl">＋</span> Nuevo anuncio
      </button>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group">
      <div class="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <h3 class="font-bold text-gray-800 text-sm uppercase tracking-wider">Vista previa (Menú Digital)</h3>
        </div>
        <div class="flex items-center gap-4">
          <div class="hidden">
             <button @click="previewTipo = 'cliente'">CLIENTE</button>
             <button @click="previewTipo = 'interno'">MENÚ DIGITAL</button>
          </div>
          <div v-for="v in ['dark', 'light', 'color', 'amber']" :key="v" 
            @click="previewVariant = v"
            :class="['w-4 h-4 rounded-full cursor-pointer border', previewVariant === v ? 'ring-2 ring-offset-2 ring-indigo-500' : '']"
            :style="{ backgroundColor: v === 'dark' ? '#030712' : v === 'amber' ? '#f59e0b' : v === 'color' ? '#6366f1' : '#f8fafc' }">
          </div>
        </div>
      </div>
      <MarquesitaWidget 
        :api-url="API_URL" 
        :get-headers="getHeaders" 
        :tipo="previewTipo" 
        :variant="previewVariant" 
        :restaurante-id="restauranteId"
      />
    </div>

    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button v-for="f in filtros" :key="f.key" @click="filtroActivo=f.key"
        :class="['px-5 py-2.5 text-sm font-bold rounded-2xl transition-all whitespace-nowrap border-2',
          filtroActivo===f.key ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white text-gray-500 border-transparent hover:border-gray-200']">
        {{ f.label }}
        <span :class="['ml-2 px-2 py-0.5 rounded-lg text-[10px]', filtroActivo===f.key ? 'bg-white/20' : 'bg-gray-100']">
          {{ contarFiltro(f.key) }}
        </span>
      </button>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-400">
      <div class="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="font-medium">Sincronizando anuncios...</p>
    </div>

    <div v-else-if="anunciosFiltrados.length === 0" class="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
      <span class="text-6xl block mb-4">📭</span>
      <h3 class="text-xl font-bold text-gray-800">No hay anuncios aquí</h3>
      <p class="text-gray-400 max-w-xs mx-auto mt-2">Crea un nuevo anuncio para empezar a mostrar contenido en tu marquesita.</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="a in anunciosFiltrados" :key="a.id"
        class="group bg-white rounded-3xl shadow-sm border-2 transition-all hover:shadow-xl hover:shadow-gray-200/50"
        :class="a.vigente ? 'border-transparent' : 'border-gray-100 opacity-75 grayscale-[0.5]'">
        
        <div class="p-4 flex items-center justify-between border-b border-gray-50"
          :class="`bg-${a.color || 'indigo'}-50/50` ">
          <div class="flex items-center gap-3">
            <span class="text-3xl drop-shadow-sm">{{ a.emoji || '📢' }}</span>
            <div>
              <span class="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg block w-fit mb-1"
                :class="`bg-${a.color || 'indigo'}-100 text-${a.color || 'indigo'}-700` ">
                {{ a.tipo }}
              </span>
              <div class="flex gap-1">
                 <span v-if="a.mostrar_cliente" class="text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border border-gray-100 text-gray-500">CLIENTES</span>
                 <span v-if="a.mostrar_interno" class="text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border border-gray-100 text-gray-500 uppercase">MENÚ DIGITAL</span>
              </div>
            </div>
          </div>
          <button @click="toggleActivo(a)" 
            :class="['w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm', 
              a.activo ? 'bg-white text-emerald-500 hover:scale-110' : 'bg-gray-200 text-gray-500']">
            {{ a.activo ? '●' : '○' }}
          </button>
        </div>
        
        <div class="p-5">
          <h4 class="font-black text-gray-900 text-lg leading-tight mb-1">{{ a.titulo }}</h4>
          <p v-if="a.contenido" class="text-sm text-gray-500 line-clamp-2 font-medium">{{ a.contenido }}</p>
          
          <div v-if="a.producto" class="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-indigo-50/50 transition-colors">
            <div class="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-100 shadow-sm">
               <img v-if="a.producto.imagen_url" :src="resolveImageUrl(a.producto.imagen_url)" class="w-full h-full object-cover" />
               <span v-else class="flex h-full items-center justify-center text-xl">🍽️</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-black text-gray-800 truncate uppercase tracking-tighter">{{ a.producto.nombre }}</p>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded" v-if="a.precio_promo">${{ Number(a.precio_promo).toFixed(2) }}</span>
                <span class="text-[10px] text-gray-400 line-through">antes {{ a.producto.precio_formateado }}</span>
              </div>
            </div>
          </div>
          
          <div class="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
            <div class="text-[10px] font-bold text-gray-400 flex flex-col uppercase tracking-tighter">
               <span>Inicio: {{ a.fecha_inicio || 'Inmediato' }}</span>
               <span>Fin: {{ a.fecha_fin || 'Indefinido' }}</span>
            </div>
            <div class="flex gap-2">
              <button @click="abrirModal(a)" class="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                ✏️
              </button>
              <button @click="eliminar(a.id)" class="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-950/40 backdrop-blur-sm" @click="showModal=false"></div>
        
        <div class="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden relative flex flex-col max-h-[90vh]">
          <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h3 class="text-2xl font-black text-gray-900 tracking-tight">{{ editando ? 'Editar Anuncio' : 'Crear Anuncio' }}</h3>
              <p class="text-sm text-gray-500 font-medium">Configura cómo se verá tu mensaje</p>
            </div>
            <button @click="showModal=false" class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">✕</button>
          </div>
          
          <div class="p-6 overflow-y-auto space-y-6">
            <div v-if="formError" class="p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-3">
              <span>⚠️</span> {{ formError }}
            </div>
            
            <section>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">¿Qué tipo de anuncio es?</label>
              <div class="grid grid-cols-4 gap-3">
                <button v-for="t in tipos" :key="t.value" @click="form.tipo=t.value; form.emoji=t.emoji"
                  :class="['p-4 rounded-[20px] border-2 transition-all flex flex-col items-center gap-2',
                    form.tipo===t.value ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100 scale-[1.02]' : 'border-gray-100 hover:border-gray-200']">
                  <span class="text-2xl">{{ t.emoji }}</span>
                  <span :class="['text-[10px] font-black tracking-widest', form.tipo===t.value ? 'text-indigo-700' : 'text-gray-400']">{{ t.label }}</span>
                </button>
              </div>
            </section>
            
            <section class="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div class="sm:col-span-3">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Título del Mensaje</label>
                <input v-model="form.titulo" type="text" placeholder="Ej: ¡Happy Hour Activado!"
                  class="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-gray-800" />
              </div>
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 text-center">Emoji</label>
                <input v-model="form.emoji" type="text" class="w-full py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl text-center text-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none" />
              </div>
            </section>
            
            <section>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Contenido (Opcional)</label>
              <textarea v-model="form.contenido" rows="2" placeholder="Describe brevemente la oferta..."
                class="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium text-gray-600 resize-none"></textarea>
            </section>
            
            <section class="flex flex-wrap items-center justify-between gap-6">
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Color de Énfasis</label>
                <div class="flex gap-2.5">
                  <button v-for="c in colores" :key="c.value" @click="form.color=c.value"
                    :class="['w-8 h-8 rounded-full border-4 transition-all shadow-sm', 
                      c.bg, form.color===c.value ? 'border-white ring-2 ring-indigo-500 scale-125' : 'border-transparent hover:scale-110']">
                  </button>
                </div>
              </div>
              <div class="w-32">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Orden / Prioridad</label>
                <input v-model="form.orden" type="number" class="w-full px-4 py-2 bg-gray-50 rounded-xl font-bold text-center border-2 border-transparent focus:border-indigo-500 outline-none" />
              </div>
            </section>

            <section class="p-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-[28px] border-2 border-indigo-100/50">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-xl">🍕</span>
                <label class="text-[11px] font-black text-indigo-700 uppercase tracking-widest">Vincular a un platillo</label>
              </div>
              
              <div class="relative product-selector">
                <button type="button" @click="dropdownOpen = !dropdownOpen"
                  class="w-full px-4 py-4 text-left border-2 border-white rounded-[20px] bg-white flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div class="flex items-center gap-3 overflow-hidden">
                    <template v-if="selectedProduct">
                      <img v-if="selectedProduct.imagen_url" :src="resolveImageUrl(selectedProduct.imagen_url)" class="w-8 h-8 rounded-lg object-cover ring-1 ring-gray-100" />
                      <span v-else class="text-xl">🍽️</span>
                      <div class="min-w-0">
                        <p class="font-black text-gray-800 text-sm truncate uppercase tracking-tighter">{{ selectedProduct.nombre }}</p>
                        <p class="text-[10px] text-indigo-500 font-bold">{{ selectedProduct.precio_formateado }}</p>
                      </div>
                    </template>
                    <span v-else class="text-gray-400 font-medium text-sm px-2">¿Quieres asociar un producto?</span>
                  </div>
                  <span class="text-indigo-300 mr-2">{{ dropdownOpen ? '▲' : '▼' }}</span>
                </button>
                
                <div v-if="dropdownOpen" class="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-[24px] shadow-2xl max-h-60 overflow-hidden flex flex-col animate-slide-up">
                  <div class="p-3 border-b bg-gray-50/50">
                    <input v-model="searchTerm" type="text" placeholder="Escribe para buscar..." 
                      class="w-full px-4 py-2.5 text-sm border-2 border-transparent bg-white rounded-xl outline-none focus:border-indigo-300 font-medium" @click.stop />
                  </div>
                  <div class="overflow-y-auto flex-1 custom-scrollbar">
                    <div v-for="p in productosFiltrados" :key="p.id" @click="seleccionarProducto(p)"
                      class="p-4 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors">
                      <img v-if="p.imagen_url" :src="resolveImageUrl(p.imagen_url)" class="w-10 h-10 rounded-xl object-cover border border-gray-100 bg-gray-100" />
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-black text-gray-800 truncate uppercase">{{ p.nombre }}</p>
                        <p class="text-[10px] text-indigo-500 font-bold tracking-widest">{{ p.precio_formateado }}</p>
                      </div>
                    </div>
                  </div>
                  <button v-if="form.producto_id" @click="form.producto_id=null; dropdownOpen=false" class="w-full py-3 bg-red-50 text-red-600 text-[10px] font-black hover:bg-red-100 tracking-[0.2em]">QUITAR VÍNCULO</button>
                </div>
              </div>
              
              <div v-if="form.producto_id" class="mt-5 animate-slide-up">
                <label class="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3 ml-1">Nuevo Precio Promocional</label>
                <div class="flex items-center gap-4 bg-white p-4 rounded-[20px] shadow-inner border-2 border-emerald-50">
                  <span class="text-gray-300 line-through font-bold text-lg leading-none">{{ selectedProduct?.precio_formateado }}</span>
                  <div class="flex-1 relative">
                    <span class="absolute left-0 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xl">$</span>
                    <input v-model="form.precio_promo" type="number" step="0.01" 
                      class="w-full pl-6 bg-transparent text-emerald-600 text-2xl font-black outline-none"
                      placeholder="0.00" />
                  </div>
                </div>
              </div>
            </section>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div class="space-y-4">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mostrar anuncio en:</label>
                <div class="flex flex-col gap-3">
                  <label class="flex items-center gap-3 cursor-pointer group p-3 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-indigo-100 transition-all">
                    <input v-model="form.mostrar_cliente" type="checkbox" class="w-5 h-5 rounded-lg accent-indigo-600" />
                    <span class="font-bold text-gray-700 text-sm group-hover:text-indigo-600">📱 APP CLIENTES</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer group p-3 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-indigo-100 transition-all">
                    <input v-model="form.mostrar_interno" type="checkbox" class="w-5 h-5 rounded-lg accent-indigo-600" />
                    <span class="font-bold text-gray-700 text-sm group-hover:text-indigo-600 uppercase">👨‍🍳 MENÚ DIGITAL</span>
                  </label>
                </div>
              </div>
              <div class="space-y-3">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Periodo de Vigencia</label>
                <div class="space-y-2">
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs">🕒</span>
                    <input v-model="form.fecha_inicio" type="date" class="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 outline-none focus:bg-white border border-transparent focus:border-indigo-200" />
                  </div>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs">🏁</span>
                    <input v-model="form.fecha_fin" type="date" class="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 outline-none focus:bg-white border border-transparent focus:border-indigo-200" />
                  </div>
                  <p class="text-[9px] text-gray-400 italic px-1">Si dejas vacío, el anuncio será permanente.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-6 border-t border-gray-50 flex gap-4 bg-gray-50/30 sticky bottom-0">
            <button @click="showModal=false"
              class="flex-1 py-4 text-xs font-black text-gray-500 bg-white rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-[0.2em] border-2 border-gray-100">Cancelar</button>
            <button @click="guardar" :disabled="guardando"
              class="flex-1 py-4 text-xs font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-[0.2em] disabled:opacity-50 active:scale-95">
              {{ guardando ? 'Guardando...' : 'Publicar Anuncio' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import MarquesitaWidget from '../components/MarquesitaWidget.vue'
import { API_URL, STORAGE_URL } from '@/config/api'

// --- Helper: Resolver URLs de imágenes ---
const resolveImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('data:')) return path
  if (path.startsWith('/storage/')) return `${STORAGE_URL}${path.replace(/^\/?storage\//, '')}`
  return `${STORAGE_URL}${path}`
}

// --- ESTADO ---
const anuncios = ref([])
const productos = ref([])
const loading = ref(false)
const guardando = ref(false)
const toasts = ref([])
const showModal = ref(false)
const editando = ref(null)
const formError = ref('')
const filtroActivo = ref('todos')
const dropdownOpen = ref(false)
const searchTerm = ref('')
const previewVariant = ref('dark')
const previewTipo = ref('interno')

// Variable reactiva para el ID del restaurante - esto asegura que el Widget se entere del cambio
const restauranteId = ref(localStorage.getItem('restaurante_id_activo'))

// Si no hay id activo, intentamos sacar el del usuario
if (!restauranteId.value) {
  const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'
  try {
    restauranteId.value = JSON.parse(userRaw)?.restaurante_id || null
  } catch { restauranteId.value = null }
}

// Cronómetro para detectar cambios de sucursal en el header (localStorage no es reactivo por sí solo)
const checkRestaurante = setInterval(() => {
  const currentId = localStorage.getItem('restaurante_id_activo')
  if (currentId && currentId !== restauranteId.value) {
    restauranteId.value = currentId
    cargar()
    cargarProductos()
  }
}, 1000)

const lastRestId = ref(restauranteId.value)

// --- AUTH HEADERS ---
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json', 
    'Authorization': token ? `Bearer ${token}` : '' 
  }
}

// --- CONFIGURACIÓN UI ---
const tipos = [
  { value: 'info', label: 'INFO', emoji: 'ℹ️' },
  { value: 'promo', label: 'PROMO', emoji: '🎉' },
  { value: 'alerta', label: 'ALERTA', emoji: '⚠️' },
  { value: 'producto', label: 'PLATO', emoji: '🍽️' },
]

const colores = [
  { value: 'indigo', bg: 'bg-indigo-500' },
  { value: 'emerald', bg: 'bg-emerald-500' },
  { value: 'amber', bg: 'bg-amber-500' },
  { value: 'rose', bg: 'bg-rose-500' },
  { value: 'blue', bg: 'bg-blue-500' },
  { value: 'purple', bg: 'bg-purple-500' },
]

const filtros = [
  { key: 'todos', label: 'Todos' },
  { key: 'activos', label: 'En vivo' },
  { key: 'cliente', label: 'Clientes' },
  { key: 'interno', label: 'Menú Digital' },
  { key: 'promo', label: 'Promos' },
]

// --- FORMULARIO ---
const defaultForm = () => ({
  titulo: '', contenido: '', tipo: 'info', emoji: '📢', color: 'indigo',
  mostrar_cliente: true, mostrar_interno: false,
  fecha_inicio: '', fecha_fin: '', orden: 0,
  producto_id: null, precio_promo: null, activo: true
})
const form = ref(defaultForm())

// --- COMPUTED ---
const selectedProduct = computed(() => {
  if (!form.value.producto_id) return null
  return productos.value.find(p => p.id === form.value.producto_id)
})

const productosFiltrados = computed(() => {
  const term = searchTerm.value.toLowerCase()
  return productos.value.filter(p => 
    p.nombre.toLowerCase().includes(term) ||
    (p.categoria?.nombre || '').toLowerCase().includes(term)
  ).slice(0, 15)
})

const anunciosFiltrados = computed(() => {
  let list = anuncios.value
  if (filtroActivo.value === 'activos') list = list.filter(a => a.vigente)
  if (filtroActivo.value === 'cliente') list = list.filter(a => a.mostrar_cliente)
  if (filtroActivo.value === 'interno') list = list.filter(a => a.mostrar_interno)
  if (filtroActivo.value === 'promo') list = list.filter(a => ['promo','producto'].includes(a.tipo))
  return list
})

const contarFiltro = (key) => {
  if (key === 'todos') return anuncios.value.length
  if (key === 'activos') return anuncios.value.filter(a => a.vigente).length
  if (key === 'cliente') return anuncios.value.filter(a => a.mostrar_cliente).length
  if (key === 'interno') return anuncios.value.filter(a => a.mostrar_interno).length
  if (key === 'promo') return anuncios.value.filter(a => ['promo','producto'].includes(a.tipo)).length
  return 0
}

// --- MÉTODOS ---
const showToast = (message, type = 'success') => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), 4000)
}

const removeToast = (id) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

const seleccionarProducto = (producto) => {
  form.value.producto_id = producto.id
  form.value.precio_promo = producto.precio
  dropdownOpen.value = false
  searchTerm.value = ''
}

const cargarProductos = async () => {
  try {
    const res = await fetch(`${API_URL}/productos?per_page=150`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) productos.value = data.data
  } catch (err) { console.error('Error productos:', err) }
}

const cargar = async () => {
  loading.value = true
  try {
    // Si no tenemos el ID (sucede al recargar la página), lo recuperamos de la sesión activa
    if (!restauranteId.value) {
      const restRes = await fetch(`${API_URL}/restaurantes`, { headers: getHeaders() })
      const restData = await restRes.json()
      if (restData.success && restData.data.restaurante_activo) {
        restauranteId.value = restData.data.restaurante_activo.id
      }
    }

    const res = await fetch(`${API_URL}/admin/anuncios`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) {
      anuncios.value = data.data.map(a => ({
        ...a,
        vigente: a.activo && (!a.fecha_fin || new Date(a.fecha_fin) >= new Date())
      }))
    }
  } catch (err) {
    showToast('Error al conectar con el servidor', 'error')
  } finally { loading.value = false }
}

const abrirModal = (a = null) => {
  editando.value = a
  formError.value = ''
  dropdownOpen.value = false
  searchTerm.value = ''
  
  if (a) {
    form.value = { ...defaultForm(), ...a }
    // Formatear fechas para input type="date"
    if(a.fecha_inicio) form.value.fecha_inicio = a.fecha_inicio.split(' ')[0]
    if(a.fecha_fin) form.value.fecha_fin = a.fecha_fin.split(' ')[0]
  } else {
    form.value = defaultForm()
  }
  showModal.value = true
}

const guardar = async () => {
  if (!form.value.titulo) return formError.value = 'El título es requerido'
  
  guardando.value = true
  try {
    const url = editando.value ? `${API_URL}/admin/anuncios/${editando.value.id}` : `${API_URL}/admin/anuncios`
    const method = editando.value ? 'PUT' : 'POST'
    
    const res = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(form.value)
    })
    
    const data = await res.json()
    
    if (data.success) {
      showToast(editando.value ? '¡Anuncio actualizado!' : '¡Anuncio publicado correctamente!', 'success')
      showModal.value = false
      cargar()
    } else {
      formError.value = data.message || 'Error al guardar el anuncio'
    }
  } catch (err) {
    formError.value = 'Fallo de conexión con el servidor'
  } finally { guardando.value = false }
}

const toggleActivo = async (a) => {
  try {
    const res = await fetch(`${API_URL}/admin/anuncios/${a.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ activo: !a.activo })
    })
    const data = await res.json()
    if (data.success) {
      showToast(a.activo ? 'Anuncio pausado' : 'Anuncio activado con éxito')
      cargar()
    }
  } catch (err) { showToast('Error de red', 'error') }
}

const eliminar = async (id) => {
  if (!confirm('¿Seguro que deseas eliminar este anuncio? Esta acción es permanente.')) return
  try {
    const res = await fetch(`${API_URL}/admin/anuncios/${id}`, { method: 'DELETE', headers: getHeaders() })
    const data = await res.json()
    if (data.success) {
      showToast('Anuncio eliminado del sistema')
      cargar()
    }
  } catch (err) { showToast('Error al eliminar', 'error') }
}

const handleClickOutside = (e) => {
  if (dropdownOpen.value && !e.target.closest('.product-selector')) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  cargar()
  cargarProductos()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  clearInterval(checkRestaurante)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Animaciones */
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from { opacity: 0; transform: translateX(30px); }
.list-leave-to { opacity: 0; transform: scale(0.9); }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up { animation: slideUp 0.3s ease-out forwards; }

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
</style>