<template>
  <div class="p-4 sm:p-6 space-y-5 min-h-screen bg-slate-50/50">

    <!-- ══ TOASTS ══ -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px] max-w-sm animate-slide-in',
          toast.type==='success' ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800' :
          toast.type==='error'   ? 'bg-red-50 border-l-4 border-red-500 text-red-800'             :
          'bg-blue-50 border-l-4 border-blue-500 text-blue-800']">
        <span>{{ toast.type==='success' ? '✅' : toast.type==='error' ? '❌' : 'ℹ️' }}</span>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600">×</button>
      </div>
    </div>

    <!-- ══ CARGANDO CAJA ══ -->
    <div v-if="loadingCaja" class="flex flex-col items-center justify-center min-h-[70vh] gap-3">
      <div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-gray-400 text-sm font-medium">Sincronizando con el sistema...</p>
    </div>

    <!-- ══ CAJA CERRADA ══ -->
    <div v-else-if="!cajaAbierta"
      class="flex flex-col items-center justify-center min-h-[70vh] text-center gap-5">
      <div class="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center text-5xl shadow-sm">🔒</div>
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Caja cerrada</h2>
        <p class="text-gray-400 text-sm mt-2 max-w-xs">No se pueden registrar órdenes mientras la caja esté cerrada.</p>
      </div>
      <button @click="verificarCaja" class="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">🔄 Verificar estado</button>
    </div>

    <!-- ══ CONTENIDO PRINCIPAL ══ -->
    <template v-else>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Órdenes del día</h1>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{{ fechaHoy }}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-[10px] font-black uppercase">Caja abierta</span>
          </div>
          <button @click="vistaActual = 'nueva'" class="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-95">
            <span class="text-lg leading-none">＋</span> Nueva Orden
          </button>
        </div>
      </div>

      <!-- ══ VISTA LISTADO DE ÓRDENES ══ -->
      <div v-if="vistaActual === 'ordenes'">
        <!-- Tabs Superiores -->
        <div class="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
          <button v-for="tab in tabs" :key="tab.key" @click="tabActivo = tab.key"
            :class="['flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all border shrink-0',
              tabActivo === tab.key ? 'text-white border-transparent shadow-md scale-105' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 shadow-sm']"
            :style="tabActivo === tab.key ? { backgroundColor: tab.color } : {}">
            <span>{{ tab.icon }}</span> {{ tab.label.toUpperCase() }}
            <span class="px-1.5 py-0.5 rounded-lg text-[10px]" :class="tabActivo === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'">
              {{ contarOrdenes(tab.key) }}
            </span>
          </button>
        </div>

        <div v-if="loading" class="flex flex-col items-center justify-center py-32 gap-3">
          <div class="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p class="text-slate-400 text-sm">Actualizando órdenes...</p>
        </div>

        <div v-else-if="subOrdenesFiltradas.length === 0" class="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <span class="text-6xl block mb-4 opacity-20">{{ tabActual?.icon }}</span>
          <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Sin órdenes en {{ tabActual?.label }}</p>
        </div>

        <!-- Grid de Tarjetas -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-in">
          <div v-for="sub in subOrdenesFiltradas" :key="sub.uid"
            class="bg-white rounded-[2rem] border shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
            :class="borderColor(sub.estado_estacion)">

            <!-- Header tarjeta -->
            <div class="px-5 py-4 flex items-center justify-between" :class="bgEstado(sub.estado_estacion)">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center text-xl shadow-sm group-hover:rotate-12 transition-transform">
                  {{ iconEstado(sub.estado_estacion) }}
                </div>
                <div>
                  <p class="text-xs font-black text-slate-400 uppercase tracking-tighter">Orden</p>
                  <p class="text-base font-black text-slate-800 leading-none">{{ sub.folio || '#'+sub.id }}</p>
                </div>
              </div>
              <span class="text-[10px] font-black px-3 py-1.5 rounded-xl border" :class="badgeEstado(sub.estado_estacion)">
                {{ ['ABIERTA', 'ENTREGADA', 'CERRADA'].includes(sub.estado_estacion) ? labelEstado(sub.estado_estacion).toUpperCase() : 'ESPERANDO...' }}
              </span>
            </div>

            <!-- Contenido -->
            <div class="px-5 py-5 flex-1 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-lg">👤</span>
                  <span class="font-black text-indigo-700 truncate text-sm">{{ getNombreMostrable(sub) }}</span>
                </div>
                <div v-if="sub.mesa" class="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black">
                  MESA {{ sub.mesa }}
                </div>
              </div>

              <!-- Lista de productos en la orden -->
              <div class="space-y-1.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div v-for="detalle in sub.detalles_estacion" :key="detalle.id"
                  class="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span class="truncate flex-1">{{ detalle.cantidad }}× {{ (detalle.producto_nombre || detalle.producto?.nombre || 'Producto').toUpperCase() }}</span>
                  <span v-if="detalle.estado_preparacion === 'LISTO'" class="text-[9px] font-black text-white bg-emerald-500 px-2 py-0.5 rounded-lg ml-2 shadow-sm">LISTO</span>
                  <span v-if="detalle.estado_preparacion === 'ENTREGADO'" class="text-emerald-500 ml-2">●</span>
                </div>
              </div>
            </div>

            <!-- Footer con acciones -->
            <div class="px-5 pb-5">
              <button v-if="(tabActivo !== 'todas' || sub.estado_estacion === 'ABIERTA') && siguienteEstado(sub.estado_estacion)"
                @click="sub.estado_estacion === 'LISTA' ? entregarProductosSubOrden(sub) : cambiarEstadoSubOrden(sub, siguienteEstado(sub.estado_estacion))"
                :disabled="cambiando === sub.uid"
                class="w-full py-3.5 text-xs font-black rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                :class="btnEstado(sub.estado_estacion)">
                {{ cambiando === sub.uid ? 'PROCESANDO...' : accionEstado(sub.estado_estacion) }}
              </button>
              <div v-else class="w-full py-3.5 text-[10px] font-black text-center rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 uppercase tracking-widest">
                {{ sub.estado_estacion === 'ENTREGADA' ? '✓ Entregado' : (sub.estado_estacion === 'CERRADA' ? '🔒 Archivada' : 'En proceso') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ VISTA CREAR NUEVA ORDEN ══ -->
      <div v-else-if="vistaActual === 'nueva'" class="animate-fade-in">
        <div class="flex items-center gap-3 mb-6">
          <button @click="vistaActual = 'ordenes'" class="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center transition hover:bg-slate-50 text-slate-600 font-bold">←</button>
          <h2 class="text-xl font-black text-slate-800">Nueva Orden</h2>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Formulario y Catálogo -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Datos Básicos -->
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cliente (Opcional)</label>
                  <select v-model="nuevaOrden.clienteId" class="w-full px-4 py-3.5 border border-slate-100 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-bold">
                    <option :value="null">— Sin cliente registrado —</option>
                    <option v-for="c in clientes" :key="c.value" :value="c.value">{{ c.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Número de Mesa</label>
                  
                  <!-- Si es mesero y tiene mesas asignadas, mostrar Select -->
                  <select v-if="esMesero && mesasAsignadas.length > 0" v-model="nuevaOrden.mesa" class="w-full px-4 py-3.5 border border-slate-100 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-bold">
                    <option :value="null">Selecciona una mesa</option>
                    <option v-for="m in mesasAsignadas" :key="m" :value="m">Mesa {{ m }}</option>
                  </select>
                  
                  <!-- Si no es mesero o no tiene asignación, mostrar Input tradicional -->
                  <input v-else v-model="nuevaOrden.mesa" type="number" min="1" placeholder="Ej: 5" class="w-full px-4 py-3.5 border border-slate-100 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-bold" />
                </div>
              </div>
            </div>
            
            <!-- Catálogo Separado por Pestañas -->
            <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div class="p-6 border-b border-slate-50">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div class="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
                    <button @click="subTabActiva = 'productos'" 
                      :class="['px-6 py-2.5 text-[10px] font-black rounded-xl transition-all tracking-widest', subTabActiva === 'productos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600']">
                      🍽️ PRODUCTOS
                    </button>
                    <button @click="subTabActiva = 'paquetes'" 
                      :class="['px-6 py-2.5 text-[10px] font-black rounded-xl transition-all tracking-widest', subTabActiva === 'paquetes' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600']">
                      🎁 PAQUETES
                    </button>
                  </div>
                  <div class="relative flex-1 max-w-xs">
                    <input v-model="busqueda" type="text" :placeholder="'Buscar en ' + (subTabActiva === 'productos' ? 'productos...' : 'paquetes...')" 
                      class="w-full pl-11 pr-4 py-3 border border-slate-100 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-medium" />
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
                  </div>
                </div>
              </div>

              <div class="p-4 min-h-[450px]">
                <div v-if="loadingProductos" class="flex flex-col items-center justify-center py-24 text-slate-300 italic">
                  <div class="w-10 h-10 border-4 border-slate-50 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p class="text-sm font-bold uppercase tracking-widest">Sincronizando menú...</p>
                </div>
                
                <!-- Catálogo: Productos -->
                <div v-else-if="subTabActiva === 'productos'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto p-2 custom-scrollbar animate-fade-in">
                  <div v-if="productosFiltrados.length === 0" class="col-span-full py-24 text-center text-slate-300">
                    <p class="text-sm font-bold italic uppercase">No hay productos que coincidan</p>
                  </div>
                  <button v-for="p in productosFiltrados" :key="'p-'+p.id" @click="agregarAlCarrito(p, 'producto')" 
                    class="flex items-center gap-4 p-4 rounded-3xl transition-all text-left group hover:bg-slate-50 border border-transparent hover:border-slate-100 bg-white">
                    <div class="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                      <img v-if="p.imagen_url" :src="resolveImageUrl(p.imagen_url)" class="w-full h-full object-cover" />
                      <span v-else class="text-2xl">🍽️</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-black text-slate-800 text-sm truncate leading-tight">{{ p.nombre.toUpperCase() }}</p>
                      <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{{ p.categoria?.nombre || 'General' }}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-black text-sm text-slate-900">${{ Number(p.precio).toFixed(2) }}</p>
                      <span class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black opacity-0 group-hover:opacity-100 transition-all shadow-sm">+</span>
                    </div>
                  </button>
                </div>

                <!-- Catálogo: Paquetes -->
                <div v-else-if="subTabActiva === 'paquetes'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto p-2 custom-scrollbar animate-fade-in">
                  <div v-if="paquetesFiltrados.length === 0" class="col-span-full py-24 text-center text-slate-300">
                    <p class="text-sm font-bold italic uppercase">No hay paquetes disponibles ahora</p>
                  </div>
                  <button v-for="paq in paquetesFiltrados" :key="'paq-'+paq.id" @click="agregarAlCarrito(paq, 'paquete')" 
                    class="flex items-center gap-4 p-4 rounded-3xl transition-all text-left group hover:bg-indigo-50/50 border border-transparent hover:border-indigo-100 bg-white shadow-sm shadow-slate-100">
                    <div class="w-16 h-16 rounded-2xl overflow-hidden bg-indigo-50 shrink-0 flex items-center justify-center border border-indigo-100 shadow-sm relative group-hover:rotate-2 transition-transform">
                      <img v-if="paq.imagen_url" :src="resolveImageUrl(paq.imagen_url)" class="w-full h-full object-cover" />
                      <span v-else class="text-3xl">🎁</span>
                      <div class="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-xl shadow-sm">COMBO</div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-black text-slate-800 text-sm leading-tight uppercase tracking-tight">{{ paq.nombre }}</p>
                      <p class="text-[9px] text-indigo-500 font-black uppercase mt-1 tracking-tighter">✨ Promoción Especial</p>
                    </div>
                    <div class="text-right">
                      <p class="font-black text-sm text-indigo-600">${{ Number(paq.precio).toFixed(2) }}</p>
                      <span class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-indigo-200">+</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel de Resumen / Carrito -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden sticky top-6">
              <div class="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 class="font-black text-xs tracking-widest uppercase opacity-60">Resumen</h3>
                  <p class="text-lg font-black leading-none mt-1">PEDIDO ACTUAL</p>
                </div>
                <div class="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center font-black text-sm">
                  {{ carrito.length }}
                </div>
              </div>
              
              <div class="p-6">
                <div v-if="carrito.length === 0" class="flex flex-col items-center justify-center py-20 text-center opacity-30">
                  <div class="text-5xl mb-4">🛒</div>
                  <p class="text-xs font-black uppercase tracking-widest">Carrito Vacío</p>
                </div>
                
                <div v-else class="animate-fade-in">
                  <!-- Listado de ítems en carrito -->
                  <div class="space-y-3 mb-8 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                    <div v-for="item in carrito" :key="item.id + item.tipo" class="p-4 bg-slate-50 border border-slate-100 rounded-3xl transition-all hover:border-indigo-200 group">
                      <div class="flex justify-between items-start gap-3 mb-3">
                        <div class="flex items-center gap-3 min-w-0">
                          <span class="text-xl bg-white w-8 h-8 rounded-xl flex items-center justify-center shadow-sm">{{ item.tipo === 'paquete' ? '🎁' : '🍽️' }}</span>
                          <p class="text-xs font-black text-slate-800 truncate leading-tight uppercase">{{ item.nombre }}</p>
                        </div>
                        <button @click="eliminarDelCarrito(item.id, item.tipo)" class="text-slate-300 hover:text-red-500 transition-colors">✕</button>
                      </div>
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                          <button @click="decrementar(item.id, item.tipo)" class="w-7 h-7 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors font-black">−</button>
                          <span class="text-xs font-black w-4 text-center text-slate-700">{{ item.cantidad }}</span>
                          <button @click="incrementar(item.id, item.tipo)" class="w-7 h-7 flex items-center justify-center bg-slate-50 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors font-black">+</button>
                        </div>
                        <span class="font-black text-sm text-slate-900">${{ Number(item.precio * item.cantidad).toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Cálculos Finales -->
                  <div class="space-y-3 pt-6 border-t border-slate-100">
                    <div class="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span>${{ Number(totalCarrito).toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between items-end">
                      <span class="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Total Final</span>
                      <span class="text-2xl font-black text-indigo-600 leading-none">${{ Number(totalCarrito).toFixed(2) }}</span>
                    </div>
                  </div>

                  <button @click="crearOrden" :disabled="creando || !nuevaOrden.mesa" 
                    class="w-full py-4.5 bg-indigo-600 text-white font-black rounded-2xl mt-8 disabled:opacity-50 disabled:grayscale shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                    <template v-if="creando">
                      <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Enviando...
                    </template>
                    <template v-else>
                      CONFIRMAR ORDEN 🚀
                    </template>
                  </button>
                  <p v-if="!nuevaOrden.mesa && carrito.length > 0" class="text-[9px] text-center text-red-500 font-black mt-3 uppercase tracking-tighter animate-pulse">⚠️ Debes indicar el número de mesa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { API_URL, STORAGE_URL } from '@/config/api'

// --- Inicialización de Estados ---
const vistaActual = ref('ordenes')
const tabActivo = ref('todas')
const subTabActiva = ref('productos')
const ordenes = ref([])
const productos = ref([])
const paquetes = ref([])
const clientes = ref([])
const carrito = ref([])
const busqueda = ref('')

const loading = ref(true)
const loadingCaja = ref(true)
const loadingProductos = ref(true)
const creando = ref(false)
const cambiando = ref(null)
const toasts = ref([])
const cajaAbierta = ref(false)
const nuevaOrden = ref({ clienteId: null, mesa: null })
const mesasAsignadas = ref([])

// --- Usuario y Roles ---
const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'
const userActual = JSON.parse(userRaw)
const esMesero = computed(() => {
  const roles = userActual.roles || []
  return roles.some(r => r.id === 3 || r.id === '3')
})

// --- Configuración Catálogo ---
const BEBIDA_CATEGORIA_IDS = [7, 8]
const BEBIDA_KEYWORDS = ['coca', 'pepsi', 'fanta', 'sprite', 'jugo', 'refresco', 'bebida', 'cerveza', 'agua', 'trago', 'coctel', 'limonada', 'naranjada']

const tabs = [
  { key: 'todas', label: 'Todas', icon: '📋', color: '#6366f1' },
  { key: 'ABIERTA', label: 'Nuevas', icon: '📝', color: '#fcd34d' },
  { key: 'POR_PREPARAR', label: 'Por preparar', icon: '🟡', color: '#f59e0b' },
  { key: 'EN_PREPARACION', label: 'En preparación', icon: '🔥', color: '#f97316' },
  { key: 'LISTA', label: 'Listas', icon: '✅', color: '#10b981' },
  { key: 'ENTREGADA', label: 'Entregadas', icon: '🏁', color: '#8b5cf6' },
]

// --- Funciones de Lógica ---
const esBebida = (detalle) => {
  if (!detalle) return false
  const cat = (detalle.producto?.categoria?.nombre || detalle.categoria || '').trim().toLowerCase()
  const nombre = (detalle.producto_nombre || detalle.producto?.nombre || '').toLowerCase()
  return cat.includes('barra') || cat.includes('bebida') || cat.includes('refresco') || cat.includes('fria') || 
         BEBIDA_KEYWORDS.some(k => nombre.includes(k))
}

const esPostre = (detalle) => {
  if (!detalle) return false
  const cat = (detalle.producto?.categoria?.nombre || detalle.categoria || '').trim().toLowerCase()
  const nombre = (detalle.producto_nombre || detalle.producto?.nombre || '').toLowerCase()
  return cat.includes('postre') || cat.includes('reposteria') || cat.includes('pastel') || 
         nombre.includes('pastel') || nombre.includes('postre') || nombre.includes('helado')
}

const calcularEstadoEstacion = (detalles, estadoOrden) => {
  if (estadoOrden === 'ABIERTA') return 'ABIERTA'
  if (estadoOrden === 'CERRADA' || estadoOrden === 'PAGADA') return 'CERRADA'
  if (!detalles || detalles.length === 0) return 'POR_PREPARAR'
  
  const total = detalles.length
  const entregados = detalles.filter(d => d.estado_preparacion === 'ENTREGADO').length
  const listos = detalles.filter(d => d.estado_preparacion === 'LISTO').length
  const enPrep = detalles.filter(d => d.estado_preparacion === 'EN_PREPARACION').length

  if (entregados === total) return 'ENTREGADA'
  if (listos > 0) return 'LISTA'
  if (enPrep > 0) return 'EN_PREPARACION'
  return 'POR_PREPARAR'
}

const subOrdenes = computed(() => {
  const list = []
  if (!ordenes.value) return list
  ordenes.value.forEach(o => {
    const todos = o.detalles || []
    
    const barra = todos.filter(d => esBebida(d))
    const postres = todos.filter(d => esPostre(d) && !esBebida(d))
    const cocina = todos.filter(d => !esBebida(d) && !esPostre(d))

    if (cocina.length > 0) list.push({ ...o, uid: `${o.id}-COCINA`, detalles_estacion: cocina, estado_estacion: calcularEstadoEstacion(cocina, o.estado) })
    if (barra.length > 0) list.push({ ...o, uid: `${o.id}-BARRA`, detalles_estacion: barra, estado_estacion: calcularEstadoEstacion(barra, o.estado) })
    if (postres.length > 0) list.push({ ...o, uid: `${o.id}-POSTRES`, detalles_estacion: postres, estado_estacion: calcularEstadoEstacion(postres, o.estado) })
  })
  return list
})

const subOrdenesFiltradas = computed(() => {
  if (['todas', 'ABIERTA', 'ENTREGADA'].includes(tabActivo.value)) {
    return ordenes.value
      .filter(o => tabActivo.value === 'todas' ? true : o.estado === tabActivo.value)
      .map(o => ({ ...o, uid: `${o.id}-JOINT`, estado_estacion: o.estado, detalles_estacion: o.detalles || [] }))
  }
  return subOrdenes.value.filter(s => s.estado_estacion === tabActivo.value)
})

const contarOrdenes = (key) => {
  if (key === 'todas') return ordenes.value?.length || 0
  if (['ABIERTA', 'ENTREGADA'].includes(key)) return ordenes.value?.filter(o => o.estado === key).length || 0
  return subOrdenes.value?.filter(s => s.estado_estacion === key).length || 0
}

const tabActual = computed(() => tabs.find(t => t.key === tabActivo.value))
const totalCarrito = computed(() => carrito.value.reduce((s, i) => s + (i.precio * i.cantidad), 0))
const fechaHoy = computed(() => new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

const productosFiltrados = computed(() => {
  const b = busqueda.value?.toLowerCase() || ''
  return b ? productos.value.filter(p => p.nombre.toLowerCase().includes(b)) : productos.value
})

const paquetesFiltrados = computed(() => {
  const b = busqueda.value?.toLowerCase() || ''
  return b ? paquetes.value.filter(p => p.nombre.toLowerCase().includes(b)) : paquetes.value
})

// --- Estilos Visuales ---
const bgEstado = (e) => ['POR_PREPARAR', 'EN_PREPARACION', 'LISTA'].includes(e) ? 'bg-slate-50' : { ABIERTA:'bg-yellow-50', ENTREGADA:'bg-purple-50', CERRADA:'bg-slate-50' }[e] || 'bg-slate-50'
const borderColor = (e) => ['POR_PREPARAR', 'EN_PREPARACION', 'LISTA'].includes(e) ? 'border-slate-100' : { ABIERTA:'border-yellow-200', ENTREGADA:'border-purple-200', CERRADA:'border-slate-200' }[e] || 'border-slate-100'
const badgeEstado = (e) => ['POR_PREPARAR', 'EN_PREPARACION', 'LISTA'].includes(e) ? 'bg-slate-100 text-slate-500 border-slate-200' : { ABIERTA:'bg-yellow-100 text-yellow-700 border-yellow-200', ENTREGADA:'bg-purple-100 text-purple-700 border-purple-200', CERRADA:'bg-slate-200 text-slate-500 border-slate-300' }[e] || 'bg-slate-100 text-slate-500'
const iconEstado = (e) => ['POR_PREPARAR', 'EN_PREPARACION', 'LISTA'].includes(e) ? '🕒' : { ABIERTA:'📝', ENTREGADA:'🏁', CERRADA:'🔒' }[e] || '📋'
const labelEstado = (e) => ({ ABIERTA:'Abierta', POR_PREPARAR:'Esperando', EN_PREPARACION:'En Cocina', LISTA:'Lista', ENTREGADA:'Entregada', CERRADA:'Cerrada' }[e] || e)
const siguienteEstado = (e) => ({ ABIERTA:'POR_PREPARAR', LISTA:'ENTREGADA' }[e] || null)
const accionEstado = (e) => ({ ABIERTA:'▶ Enviar Pedido', LISTA:'🤝 Entregar' }[e] || '')
const btnEstado = (e) => ({ ABIERTA:'bg-amber-500 hover:bg-amber-600 text-white', LISTA:'bg-emerald-500 hover:bg-emerald-600 text-white' }[e] || 'bg-slate-100 text-slate-400')

// --- Funciones de API ---
const getHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''
  const restId = localStorage.getItem('restaurante_id_activo') || ''
  return { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Restaurante-Id': restId }
}

const cargarOrdenes = async () => {
  loading.value = true
  try {
    const today = new Date().toISOString().split('T')[0]
    const states = ['ABIERTA', 'POR_PREPARAR', 'EN_PREPARACION', 'LISTA', 'ENTREGADA']
    const endpoints = states.map(s => `${API_URL}/meseros/mis-ordenes?estado=${s}&per_page=100`)
    endpoints.push(`${API_URL}/meseros/mis-ordenes?estado=CERRADA&fecha_desde=${today}&fecha_hasta=${today}&per_page=100`)
    
    const results = await Promise.all(endpoints.map(url => fetch(url, { headers: getHeaders() }).then(r => r.ok ? r.json() : { success: false })))
    const map = new Map()
    results.forEach(res => { if (res.success && res.data) res.data.forEach(o => map.set(o.id, o)) })
    ordenes.value = [...map.values()].sort((a, b) => b.id - a.id)
  } catch (err) { console.error('Error órdenes:', err) } finally { loading.value = false }
}

const cargarMisMesas = async () => {
  if (!esMesero.value) return
  try {
    const res = await fetch(`${API_URL}/meseros/mis-mesas`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) {
      mesasAsignadas.value = data.data
    }
  } catch (err) { console.error('Error mesas:', err) }
}

const cargarProductos = async () => {
  loadingProductos.value = true
  try {
    const [pRes, paqRes] = await Promise.all([fetch(`${API_URL}/productos`, { headers: getHeaders() }), fetch(`${API_URL}/paquetes`, { headers: getHeaders() })])
    if (pRes.ok) { const d = await pRes.json(); if (d.success) productos.value = d.data }
    if (paqRes.ok) { const d = await paqRes.json(); if (d.success) paquetes.value = d.data }
  } catch (err) { console.error('Error catálogo:', err) } finally { loadingProductos.value = false }
}

const verificarCaja = async () => {
  loadingCaja.value = true
  try {
    const res = await fetch(`${API_URL}/caja/estado`, { headers: getHeaders() })
    if (res.ok) { const d = await res.json(); cajaAbierta.value = !!(d.success && d.data?.is_open) }
  } catch (err) { console.error('Error caja:', err) } finally { loadingCaja.value = false }
}

const cargarClientes = async () => {
  try {
    const res = await fetch(`${API_URL}/clientes/select-list`, { headers: getHeaders() })
    if (res.ok) { const d = await res.json(); if (d.success) clientes.value = d.data }
  } catch {}
}

const crearOrden = async () => {
  if (carrito.value.length === 0 || !nuevaOrden.value.mesa) return
  creando.value = true
  try {
    const payload = {
      cliente_id: nuevaOrden.value.clienteId,
      mesa: nuevaOrden.value.mesa,
      productos: carrito.value.map(i => {
        const item = { cantidad: i.cantidad }
        if (i.tipo === 'producto') item.producto_id = i.id
        if (i.tipo === 'paquete') item.paquete_id = i.id
        return item
      })
    }
    const res = await fetch(`${API_URL}/ordenes`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) })
    const data = await res.json()
    if (data.success) {
      carrito.value = []; nuevaOrden.value.mesa = null; vistaActual.value = 'ordenes'; await cargarOrdenes(); showToast('Orden confirmada 🚀', 'success')
    } else showToast(data.message || 'Error al crear', 'error')
  } catch { showToast('Error de conexión', 'error') } finally { creando.value = false }
}

// --- Carrito de Compras ---
const agregarAlCarrito = (item, tipo) => {
  const e = carrito.value.find(i => i.id === item.id && i.tipo === tipo)
  if (e) e.cantidad++
  else carrito.value.push({ id: item.id, nombre: item.nombre, precio: Number(item.precio), cantidad: 1, tipo })
}
const incrementar = (id, tipo) => { const i = carrito.value.find(x => x.id === id && x.tipo === tipo); if (i) i.cantidad++ }
const decrementar = (id, tipo) => { 
  const i = carrito.value.findIndex(x => x.id === id && x.tipo === tipo)
  if (i !== -1) { 
    if (carrito.value[i].cantidad > 1) carrito.value[i].cantidad--
    else carrito.value.splice(i, 1) 
  } 
}
const eliminarDelCarrito = (id, tipo) => { carrito.value = carrito.value.filter(x => !(x.id === id && x.tipo === tipo)) }

// --- Helpers de Imagen y UI ---
const resolveImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}${path.replace(/^\/?storage\//, '')}`
}
const getNombreMostrable = (o) => o.cliente?.nombre || o.cliente?.name || o.usuario?.name || o.user?.name || 'Comensal'
const showToast = (m, t = 'info') => { const id = Date.now(); toasts.value.push({ id, message: m, type: t }); setTimeout(() => toasts.value = toasts.value.filter(x => x.id !== id), 3000) }
const removeToast = (id) => toasts.value = toasts.value.filter(t => t.id !== id)

const cambiarEstadoSubOrden = async (sub, nuevoEstado) => {
  cambiando.value = sub.uid
  try {
    const res = await fetch(`${API_URL}/ordenes/${sub.id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ estado: nuevoEstado }) })
    if (res.ok) { await cargarOrdenes(); showToast('Estado actualizado', 'success') }
  } finally { cambiando.value = null }
}

const entregarProductosSubOrden = async (sub) => {
  const ids = sub.detalles_estacion.filter(d => d.estado_preparacion === 'LISTO').map(d => d.id)
  if (!ids.length) return
  cambiando.value = sub.uid
  try {
    const res = await fetch(`${API_URL}/ordenes/${sub.id}/station-status`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ detalles: ids, estado_preparacion: 'ENTREGADO' }) })
    if (res.ok) { await cargarOrdenes(); showToast('Pedido entregado ✨', 'success') }
  } finally { cambiando.value = null }
}

onMounted(async () => { 
  try {
    await verificarCaja()
    if (cajaAbierta.value) { 
      await Promise.all([cargarOrdenes(), cargarProductos(), cargarClientes()])
      if (esMesero.value) await cargarMisMesas()
    } 
  } catch (err) { console.error('Error inicialización:', err) }
})
</script>

<style scoped>
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-slide-in { animation: slideIn 0.3s ease-out; }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>