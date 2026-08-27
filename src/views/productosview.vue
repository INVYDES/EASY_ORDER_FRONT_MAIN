<template>
  <div class="space-y-5 p-4 sm:p-6">

    <!-- TOASTS -->
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in pointer-events-auto',
          toast.type === 'success' ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800' : '',
          toast.type === 'error'   ? 'bg-red-50 border-l-4 border-red-500 text-red-800' : '',
          toast.type === 'warning' ? 'bg-amber-50 border-l-4 border-amber-500 text-amber-800' : '',
          toast.type === 'info'    ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-800' : '',
        ]"
      >
        <span class="text-lg">{{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️' }}</span>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>
    </div>

    <!-- Sucursal badge + Header -->
    <SucursalBadge />

    <ProductsHeader
      v-model="searchTerm"
      @new="openCreate"
      @import="showImport = true"
      @export="exportProducts"
    />

    <!-- Sugerencia Estratégica (Posición Superior Prioritaria) -->
    <div class="relative z-10 my-4">
      <BundleStrategyCard 
        :key="'strategy-' + allProductsForSelection.length"
        :products="allProductsForSelection" 
        @execute="handleExecuteBundle"
      />
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'px-5 py-2 text-sm font-medium rounded-lg transition',
          activeTab === tab.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200'
        ]"
      >
        {{ tab.label }}
        <span
          class="ml-1.5 text-xs font-bold rounded-full px-1.5 py-0.5"
          :class="activeTab === tab.key ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'"
        >
          {{ getTabCount(tab.key) }}
        </span>
      </button>
    </div>

    <!-- ── PAQUETES ───────────────────────────────────────── -->
    <div v-if="activeTab === 'paquetes'" class="space-y-4">
      <div class="flex justify-end">
        <BotonDudas @click="abrirAyuda('paquetes')" />
      </div>
      <div class="flex items-center gap-4">
        <!-- Buscador de paquetes -->
        <div class="relative flex-1 max-w-md">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model="searchTermPaquetes"
            @input="debouncedSearchPaquetes"
            type="text"
            placeholder="Buscar paquete por nombre..."
            class="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition shadow-sm"
          />
          <button
            v-if="searchTermPaquetes"
            @click="searchTermPaquetes = ''; loadPaquetes(1)"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition text-xs"
          >✕</button>
        </div>
        <button
          @click="openCreatePaquete"
          class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition ml-auto"
        >
          <span class="text-base leading-none">＋</span> Nuevo Paquete
        </button>
      </div>
      <PaquetesTable 
        :paquetes="paquetes"
        :pagination="paginationPaquetes"
        :loading="loading.paquetes"
        :total-sueldos-base="totalSueldosBase"
        @edit="openEditPaquete"
        @delete="handleDeletePaquete"
        @toggle-active="handleToggleActivePaquete"
        @change-page="changePagePaquetes"
      />
    </div>

    <!-- ══ PRODUCTOS ═════════════════════════════════════════ -->
    <div v-if="activeTab === 'productos'">
      <div class="flex justify-end mb-4">
        <BotonDudas @click="abrirAyuda('productos')" />
      </div>
      <!-- Buscador de productos -->
      <div class="mb-4">
        <div class="relative max-w-md">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model="searchTerm"
            @input="debouncedSearch"
            type="text"
            placeholder="Buscar producto por nombre..."
            class="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition shadow-sm"
          />
          <button
            v-if="searchTerm"
            @click="searchTerm = ''; loadProducts(1)"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition text-xs"
          >✕</button>
        </div>
      </div>
      <ProductsTable
        :products="products"
        :pagination="pagination"
        :loading="loading.products"
        :search-term="searchTerm"
        @edit="openEdit"
        @delete="handleDelete"
        @toggle-active="handleToggleActive"
        @change-page="changePage"
      />
    </div>

    <!-- ── CATEGORÍAS (ELIMINADO POR PETICIÓN: AHORA SON FIJAS) ── -->

    <!-- ── INGREDIENTES ───────────────────────────────────── -->
    <div v-else-if="activeTab === 'ingredientes'">
      <div class="flex justify-end mb-4">
        <BotonDudas @click="abrirAyuda('ingredientes')" />
      </div>
      <!-- ... (todo tu código de ingredientes existente se mantiene igual) ... -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">🧄 Ingredientes</h1>
          <p class="text-gray-500 text-sm mt-0.5">Inventario y costos de ingredientes</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="showListaCompras = true"
            class="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition shadow-sm cursor-pointer"
          >
            📦 Lista de compras
          </button>
          <button
            @click="abrirModalIngrediente()"
            class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm cursor-pointer"
          >
            ＋ Nuevo ingrediente
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 border-indigo-500">
          <p class="text-xs text-gray-500 uppercase font-semibold">Total ingredientes</p>
          <p class="text-2xl font-black text-gray-900 mt-1">{{ statsIngredientes.total }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-500">
          <p class="text-xs text-gray-500 uppercase font-semibold">Bajo stock ⚠️</p>
          <p class="text-2xl font-black text-amber-600 mt-1">{{ statsIngredientes.bajo_stock }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
          <p class="text-xs text-gray-500 uppercase font-semibold">Sin stock 🚨</p>
          <p class="text-2xl font-black text-red-600 mt-1">{{ statsIngredientes.sin_stock }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 border-emerald-500">
          <p class="text-xs text-gray-500 uppercase font-semibold">Valor inventario</p>
          <p class="text-2xl font-black text-emerald-600 mt-1">${{ formatearMoneda(statsIngredientes.costo_total) }}</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex items-center gap-3 flex-wrap mb-6">
        <input
          v-model="buscarIngrediente"
          type="text"
          placeholder="🔍 Buscar ingrediente..."
          class="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64"
        />
        <button
          @click="filtroBajoStock = !filtroBajoStock"
          :class="['px-4 py-2 rounded-xl text-sm font-semibold transition border',
            filtroBajoStock ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300']"
        >
          ⚠️ Solo bajo stock
        </button>
        <span class="text-xs text-gray-400 ml-auto">{{ ingredientesFiltrados.length }} ingredientes</span>
      </div>

      <!-- Tabla de ingredientes -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div v-if="loading.ingredientes" class="text-center py-16 text-gray-400">
          <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
          Cargando ingredientes...
        </div>
        <div v-else-if="ingredientesFiltrados.length === 0" class="text-center py-16 text-gray-400">
          <span class="text-4xl block mb-3">🧄</span>
          <p>No hay ingredientes{{ buscarIngrediente ? ' con ese nombre' : ' registrados' }}</p>
          <button @click="abrirModalIngrediente()" class="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition">
            Agregar el primero
          </button>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ingrediente</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Unidad</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Costo/unidad</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Stock actual</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Stock mín.</th>
                <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="ing in ingredientesFiltrados"
                :key="ing.id"
                class="hover:bg-gray-50 transition"
                :class="ing.sin_stock ? 'bg-red-50/40' : ing.bajo_stock ? 'bg-amber-50/40' : ''"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                      :class="ing.sin_stock ? 'bg-red-100' : ing.bajo_stock ? 'bg-amber-100' : 'bg-indigo-50'"
                    >
                      {{ ing.sin_stock ? '🚨' : ing.bajo_stock ? '⚠️' : '🧄' }}
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-900">{{ ing.nombre }}</p>
                      <p v-if="ing.proveedor" class="text-xs text-gray-400">{{ ing.proveedor }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 text-sm text-gray-600">{{ ing.unidad }}</td>
                <td class="px-5 py-4 text-sm font-medium text-right text-gray-800">{{ ing.costo_formateado }}</td>
                <td class="px-5 py-4 text-right">
                  <span class="text-sm font-bold" :class="ing.sin_stock ? 'text-red-600' : ing.bajo_stock ? 'text-amber-600' : 'text-gray-800'">
                    {{ ing.stock_actual }}
                  </span>
                  <span class="text-xs text-gray-400 ml-1">{{ ing.unidad }}</span>
                </td>
                <td class="px-5 py-4 text-sm text-gray-500 text-right">{{ ing.stock_minimo }} {{ ing.unidad }}</td>
                <td class="px-5 py-4 text-center">
                  <span
                    class="px-2.5 py-1 text-xs font-semibold rounded-full"
                    :class="ing.sin_stock ? 'bg-red-100 text-red-700' : ing.bajo_stock ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
                  >
                    {{ ing.sin_stock ? 'Sin stock' : ing.bajo_stock ? 'Bajo stock' : 'OK' }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right">
                  <div class="flex justify-end gap-1">
                    <button @click="abrirAjusteStock(ing)" class="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition font-medium">📦 Stock</button>
                    <button @click="abrirModalIngrediente(ing)" class="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition font-medium">✏️</button>
                    <button @click="handleDeleteIngrediente(ing.id)" class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-medium">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── ANUNCIOS / OFERTAS ───────────────────────────────────── -->
    <div v-else-if="activeTab === 'anuncios'">
      <div class="flex justify-end mb-4">
        <BotonDudas @click="abrirAyuda('anuncios')" />
      </div>
      <AnunciosView />
    </div>
 
    <!-- ── MODALES ─────────────────────────────────────────── -->

    <!-- Productos -->
    <ProductFormModal
      v-if="showForm"
      :product="selectedProduct"
      :categorias="categories"
      @close="showForm = false"
      @saved="handleSaved"
    />
    <ProductImportModal
      v-if="showImport"
      @close="showImport = false"
      @imported="handleImported"
    />

    <!-- Categorías -->
    <CategoriaModal
      v-if="showCategoriaModal"
      :categoria="selectedCategoria"
      @close="showCategoriaModal = false"
      @saved="handleCategoriaSaved"
    />

    <!-- Ingredientes -->
    <IngredienteModal
      v-if="showIngredienteModal"
      :ingrediente="ingredienteEditando"
      @close="showIngredienteModal = false"
      @saved="handleIngredienteSaved"
    />
    <AjusteStockModal
      v-if="showAjusteStock"
      :ingrediente="ingredienteAjuste"
      @close="showAjusteStock = false"
      @saved="handleStockSaved"
    />
    
    <!-- Lista de Compras -->
    <ListaComprasModal
      v-if="showListaCompras"
      :ingredientes="ingredientes"
      @close="showListaCompras = false"
    />

    <!-- Paquetes -->
    <PaqueteFormModal 
      v-if="showPaqueteModal"
      :paquete="selectedPaquete"
      :available-products="allProductsForSelection"
      :initial-products="suggestedProductsForNewPaquete"
      @close="closePaqueteModal"
      @saved="handlePaqueteSaved"
    />

    <!-- Modal de Dudas -->
    <AyudaModal
      v-if="showAyuda"
      :titulo="ayudaInfo.titulo"
      :secciones="ayudaInfo.secciones"
      @close="showAyuda = false"
    />

  </div>
</template>

<script setup>
import { sessionGet, sessionSet, sessionRemove } from '@/utils/session'
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

// Componentes
import SucursalBadge from '../components/SucursalBadge.vue'
import ProductsHeader from '../components/productos/ProductsHeader.vue'
import ProductsTable from '../components/productos/ProductsTable.vue'
import ProductFormModal from '../components/productos/ProductFormModal.vue'
import ProductImportModal from '../components/productos/ProductImportModal.vue'
import CategoriaModal from '../components/productos/CategoriaModal.vue'
import IngredienteModal from '../components/ingredientes/IngredienteModal.vue'
import ListaComprasModal from '../components/ingredientes/ListaComprasModal.vue'
import AjusteStockModal from '../components/productos/AjustesStockModal.vue'
import PaquetesTable from '../components/productos/PaquetesTable.vue'
import PaqueteFormModal from '../components/productos/PaqueteFormModal.vue'
import AnunciosView from './anunciosview.vue'
import BundleStrategyCard from '../components/administraccion/BundleStrategyCard.vue'
import InfoBox from '../components/administraccion/InfoBox.vue'
import BotonDudas from '../components/administraccion/BotonDudas.vue'
import AyudaModal from '../components/administraccion/AyudaModal.vue'

import { STORAGE_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'

const router = useRouter()

// ── ESTADO GLOBAL ──────────────────────────────────────────
const activeTab = ref('ingredientes')
const products = ref([])
const categories = ref([])
const ingredientes = ref([])
const paquetes = ref([])
const anuncios = ref([])
const selectedProduct = ref(null)
const selectedCategoria = ref(null)
const selectedPaquete = ref(null)
const suggestedProductsForNewPaquete = ref([])
const searchTerm = ref('')
const searchTermPaquetes = ref('')
const toasts = ref([])

// ✅ PAGINACIÓN - AGREGADA
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: 0,
  to: 0
})

const paginationPaquetes = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0
})

// Modales
const showForm = ref(false)
const showImport = ref(false)
const showCategoriaModal = ref(false)
const showIngredienteModal = ref(false)
const showListaCompras = ref(false)
const showAjusteStock = ref(false)
const showPaqueteModal = ref(false)

// Refs de ingredientes
const ingredienteEditando = ref(null)
const ingredienteAjuste = ref(null)

// Estado ingredientes
const statsIngredientes = ref({ total: 0, bajo_stock: 0, sin_stock: 0, costo_total: 0 })
const buscarIngrediente = ref('')
const filtroBajoStock = ref(false)

const loading = reactive({ 
  products: false, 
  categories: false, 
  ingredientes: false,
  paquetes: false
})

// ── TABS ───────────────────────────────────────────────────
const tabs = [
  { key: 'ingredientes', label: '🧄 Ingredientes' },
  { key: 'productos',    label: '📦 Productos' },
  { key: 'paquetes',     label: '🎁 Paquetes' },
  { key: 'anuncios',     label: '📢 Anuncios' },
]

const getTabCount = (key) => {
  if (key === 'productos') return products.value.length
  if (key === 'paquetes') return paquetes.value.length
  if (key === 'categorias') return categories.value.length
  if (key === 'ingredientes') return ingredientes.value.length
  if (key === 'anuncios') return anuncios.value.length
  return 0
}

// ── Botón de Dudas ────────────────────────────────────────────────────────────
const showAyuda = ref(false)
const ayudaTab  = ref('ingredientes')
const abrirAyuda = (tab) => { ayudaTab.value = tab; showAyuda.value = true }
const ayudaInfo = computed(() => AYUDA[ayudaTab.value] || AYUDA.ingredientes)

const AYUDA = {
  ingredientes: {
    titulo: 'Productos → Ingredientes',
    secciones: [
      { icon: '🗓️', titulo: '¿Dónde estoy?', texto: 'La despensa del negocio. Aquí creas y controlas los ingredientes que usan tus platillos.', nota: 'El costo unitario afecta la utilidad de todos los productos que lo usan.' },
      { icon: '➕', titulo: 'Formulario "＋ Nuevo ingrediente"', texto: 'Cómo se llena cada campo:', lista: [
        'Nombre * — cómo se llama el ingrediente (ej. Jitomate).',
        'Unidad * — en qué se mide: gr, kg, ml, lt o pz.',
        'Costo unitario * — cuánto vale UNA unidad (ej. $15 por kg). Es el dato más importante: de aquí sale el costo de tus platillos.',
        'Stock actual — cuánto tienes en la despensa hoy.',
        'Stock mínimo — lo calcula el sistema según tus recetas; no se edita.',
        'Proveedor — quién te lo surte (opcional).',
      ], nota: 'Los campos marcados con * son obligatorios.' },
      { icon: '📦', titulo: 'Formulario "📦 Stock" (ajustar inventario)', texto: 'Para reponer o dar de baja stock sin borrar el ingrediente.', lista: [
        'Tipo de movimiento — ➕ Entrada (compraste) o ➖ Salida (merma/uso).',
        'Cantidad — cuánto entró o salió, en la unidad del ingrediente.',
        'Motivo — opcional, ej. "Compra semanal" o "Merma".',
        'El sistema muestra el stock resultante antes de aplicar.',
      ]},
      { icon: '📊', titulo: 'Estados e inventario', texto: 'OK (verde) · Bajo stock ⚠️ (amarillo) · Sin stock 🚨 (rojo).', nota: 'Valor inventario = stock actual × costo unitario. Usa "Lista de compras" para reponer lo urgente.' },
      { icon: '✏️', titulo: 'Editar y borrar', texto: '✏️ abre el mismo formulario ya precargado. 🗑️ elimina el ingrediente (solo si no está en uso por alguna receta).' },
    ],
  },
  productos: {
    titulo: 'Productos → Menú',
    secciones: [
      { icon: '🗓️', titulo: '¿Dónde estoy?', texto: 'Tu menú. El botón "＋ Nuevo producto" abre un formulario en 2 pasos: información general y receta.', nota: 'Primero creas el producto y después le asignas su receta.' },
      { icon: '1️⃣', titulo: 'Paso 1 — Información general', texto: 'Los campos del formulario:', lista: [
        'Imagen — arrastra una foto o haz clic para subirla (JPG, PNG, WebP · máx. 250 KB).',
        'Nombre * — nombre del platillo (ej. Hamburguesa Gourmet).',
        'Categoría * — cocina, barra, postres, etc.',
        'Descripción — qué incluye el platillo (opcional).',
        'Tamaños — si tiene chico/grande, cada tamaño lleva su nombre, precio y stock.',
        'Precio de venta * — lo que paga el cliente (si no usas tamaños).',
        'Stock — lo calcula el sistema con la receta; no se edita.',
        'Stock mínimo — mínimo sugerido para avisar reposición.',
        'Termina el paso 1 con "🚀 Crear Producto".',
      ]},
      { icon: '2️⃣', titulo: 'Paso 2 — Receta e insumos', texto: 'Define de qué está hecho el platillo:', lista: [
        'Busca un ingrediente por nombre o elígelo del catálogo y presiona "Agregar".',
        'Escribe la cantidad necesaria de cada ingrediente en la receta.',
        'Con la receta lista, el sistema calcula: costo de insumos + mano de obra + 5% indirectos.',
        'Tiempo prep. estimado — minutos que tarda en prepararse; afecta el costo de mano de obra y el precio sugerido.',
        'Precio sugerido — pulsa "Aplicar Precio Sugerido" si quieres venderlo con esa ganancia.',
        'Termina con "Guardar Receta" y después "Guardar Información".',
      ]},
      { icon: '📊', titulo: 'Panel de costos y margen', texto: 'Muestra el costo total de producción, el margen real con tu precio y el % de utilidad.', nota: 'Si el margen sale en rojo, el precio no alcanza a cubrir los costos.' },
      { icon: '⚙️', titulo: 'Editar y estado', texto: 'Editas con ✏️ el mismo formulario precargado. Con Activo/inactivo controlas si el producto se puede vender.' },
    ],
  },
  paquetes: {
    titulo: 'Productos → Paquetes',
    secciones: [
      { icon: '🗓️', titulo: '¿Dónde estoy?', texto: 'Los combos: vendes varios productos juntos a un solo precio.' },
      { icon: '➕', titulo: 'Formulario "＋ Nuevo paquete"', texto: 'Cómo se llena cada campo:', lista: [
        'Nombre del paquete * — ej. Combo Familiar.',
        'Precio final * — el precio que pagará el cliente.',
        'Imagen — opcional; haz clic para subir una foto del combo.',
        'Descripción — qué incluye (opcional).',
        'Productos incluidos * — busca un producto (o tamaño) y agrégalo; ajusta la cantidad de cada uno con − / +.',
      ], nota: 'Faltan los 3 obligatorios (nombre, precio y al menos 1 producto) y no se guarda.' },
      { icon: '💰', titulo: 'Análisis financiero del paquete', texto: 'Al agregar productos ves en vivo: costo de producción, margen real y % de utilidad.', lista: [
        'Precio sugerido (con 30% de utilidad) — pulsa "Aplicar Sugerido" para usarlo.',
      ]},
      { icon: '💡', titulo: 'Sugerencia estratégica', texto: 'Arriba la app sugiere combos según lo más vendido y lo más rentable; pulsa "Ejecutar" para cargarlos automáticamente en el formulario.' },
    ],
  },
  anuncios: {
    titulo: 'Productos → Anuncios',
    secciones: [
      { icon: '🗓️', titulo: '¿Dónde estoy?', texto: 'La marquesina: promociones que se muestran a tus clientes y en el menú digital.', nota: 'Hay una vista previa arriba para ver cómo se verá antes de publicarlo.' },
      { icon: '➕', titulo: 'Formulario "＋ Nuevo anuncio"', texto: 'Cómo se llena cada campo:', lista: [
        'Tipo de anuncio — qué categoría representa.',
        'Título del mensaje * — lo más visible, ej. "¡Happy Hour Activado!".',
        'Emoji — el icono que acompaña al título.',
        'Contenido — descripción breve de la oferta (opcional).',
        'Color de énfasis — tono visual del anuncio.',
        'Orden / Prioridad — qué tan arriba debe mostrarse.',
        'Vincular a un platillo/combo — búscalo y añádelo.',
        'Precio promocional — el precio con descuento (opcional).',
        'Mostrar en — activa clientes y/o menú digital con los interruptores.',
        'Fecha de inicio y fin — la vigencia del anuncio.',
      ]},
      { icon: '👁️', titulo: 'Activación', texto: 'Pulsa ● / ○ en cada tarjeta para mostrar u ocultar el anuncio al instante.' },
    ],
  },
}

// ── COMPUTED ───────────────────────────────────────────────
const ingredientesFiltrados = computed(() => {
  let lista = ingredientes.value
  if (filtroBajoStock.value) lista = lista.filter(i => i.bajo_stock || i.sin_stock)
  if (buscarIngrediente.value) {
    const b = buscarIngrediente.value.toLowerCase()
    lista = lista.filter(i => i.nombre.toLowerCase().includes(b) || (i.proveedor || '').toLowerCase().includes(b))
  }
  return lista
})

const allProductsForSelection = ref([])

// ── TOASTS ─────────────────────────────────────────────────
const showToast = (message, type = 'info', duration = 4000) => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  if (duration > 0) setTimeout(() => removeToast(id), duration)
}

const removeToast = (id) => {
  const i = toasts.value.findIndex(t => t.id === id)
  if (i !== -1) toasts.value.splice(i, 1)
}

// ── HELPERS ────────────────────────────────────────────────
const checkAuth = () => {
  const token = sessionGet('token')
  if (!token) { 
    router.push('/')
    return false 
  }
  return true
}

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}${path}`
}

const onImageError = (e) => { 
  e.target.style.display = 'none' 
}

const formatearMoneda = (v) => {
  return v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// ── PRODUCTOS (CON PAGINACIÓN CORREGIDA) ────────────────────
const loadProducts = async (page = 1) => {
  if (!checkAuth()) return
  loading.products = true
  try {
    const data = await apiClient.get(`/productos?page=${page}&per_page=15&buscar=${encodeURIComponent(searchTerm.value)}&_t=${Date.now()}`)
    if (data.success || data.data) {
      products.value = data.data || []
      if (data.pagination) {
        pagination.value = data.pagination
      } else if (data.meta) {
        pagination.value = {
          current_page: data.meta.current_page,
          last_page: data.meta.last_page,
          per_page: data.meta.per_page,
          total: data.meta.total,
          from: data.meta.from,
          to: data.meta.to
        }
      }
    }
    console.log('📦 Productos cargados:', products.value.length)
    console.log('📄 Página:', pagination.value.current_page, 'de', pagination.value.last_page)
  } catch (error) {
    console.error('Error loading products:', error)
    showToast('Error al cargar productos', 'error')
  } finally { 
    loading.products = false 
  }
}

// Debounce para búsqueda
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadProducts(1)
  }, 400)
}

const loadAllProductsForSelection = async () => {
  try {
    // Pedimos los datos con el cálculo de ventas de los últimos 30 días
    const data = await apiClient.get('/productos?per_page=1000&with=ingredientes,categoria&days=30')
    if (data.success || data.data) {
      let lista = data.data || data
      if (!Array.isArray(lista)) lista = lista?.data ?? []
      allProductsForSelection.value = lista
    }
  } catch (error) { console.error('Error loading products for selection:', error) }
}

// ✅ Cambiar página
const changePage = (page) => {
  if (page < 1 || page > pagination.value.last_page) return
  loadProducts(page)
}

const openCreate = () => { 
  selectedProduct.value = null
  showForm.value = true 
}

const openEdit = (p) => { 
  selectedProduct.value = p
  showForm.value = true 
}

// ✅ CORREGIDO: Recargar en la misma página después de guardar
const handleSaved = async () => { 
  showForm.value = false
  await nextTick()
  // Recargar en la página actual
  await loadProducts(pagination.value.current_page)
  showToast('Producto guardado correctamente', 'success') 
}

const handleDelete = async (id) => { 
  if (!confirm('¿Eliminar este producto?')) return
  try {
    await apiClient.delete(`/productos/${id}`)
    await loadProducts(pagination.value.current_page)
    showToast('Producto eliminado correctamente', 'success')
  } catch (error) {
    showToast('Error al eliminar producto', 'error')
  }
}

const handleToggleActive = async (id) => { 
  try {
    await apiClient.patch(`/productos/${id}/toggle-active`)
    await loadProducts(pagination.value.current_page)
    showToast('Estado del producto actualizado', 'success')
  } catch (error) {
    showToast('Error al cambiar estado', 'error')
  }
}

const exportProducts = () => { 
  showToast('Exportación próximamente', 'info') 
}

const handleImported = () => { 
  showImport.value = false
  loadProducts(1) // Volver a primera página después de importar
  showToast('Productos importados correctamente', 'success') 
}

// ── CATEGORÍAS ─────────────────────────────────────────────
const loadCategories = async () => {
  loading.categories = true
  try {
    const data = await apiClient.get('/categorias')
    if (data.success || data.data) {
      const baseNames = ['cocina', 'barra', 'postres', 'comida', 'comidas', 'bebida', 'bebidas']
      categories.value = (data.data || data || []).filter(c => 
        baseNames.includes((c.nombre || '').toLowerCase())
      )
    }
  } catch (error) {
    console.error('Error loading categories:', error)
    showToast('Error al cargar categorías', 'error')
  } finally { 
    loading.categories = false 
  }
}

const openCreateCategoria = () => { 
  selectedCategoria.value = null
  showCategoriaModal.value = true 
}

const openEditCategoria = (c) => { 
  selectedCategoria.value = c
  showCategoriaModal.value = true 
}

const handleCategoriaSaved = async () => { 
  showCategoriaModal.value = false
  await loadCategories()
  showToast('Categoría guardada correctamente', 'success') 
}

const handleDeleteCategoria = async (id) => { 
  if (!confirm('¿Eliminar esta categoría?')) return
  try {
    await apiClient.delete(`/categorias/${id}`)
    await loadCategories()
    showToast('Categoría eliminada correctamente', 'success')
  } catch (error) {
    showToast('Error al eliminar categoría', 'error')
  }
}

// ── INGREDIENTES ───────────────────────────────────────────
const loadIngredientes = async () => {
  loading.ingredientes = true
  try {
    const data = await apiClient.get('/ingredientes')
    if (data.success || data.data) {
      ingredientes.value = data.data || data || []
      statsIngredientes.value = data.stats || { total: 0, bajo_stock: 0, sin_stock: 0, costo_total: 0 }
    }
  } catch (error) {
    console.error('Error loading ingredients:', error)
    showToast('Error al cargar ingredientes', 'error')
  } finally { 
    loading.ingredientes = false 
  }
}

const abrirModalIngrediente = (ing = null) => {
  showIngredienteModal.value = false
  ingredienteEditando.value = ing
  nextTick(() => { showIngredienteModal.value = true })
}

const abrirAjusteStock = (ing) => {
  showAjusteStock.value = false
  ingredienteAjuste.value = ing
  nextTick(() => { showAjusteStock.value = true })
}

const handleIngredienteSaved = async () => { 
  showIngredienteModal.value = false
  await loadIngredientes()
  await loadProducts(pagination.value.current_page)
  await loadAllProductsForSelection()
  showToast('Ingrediente guardado correctamente', 'success') 
}

const handleStockSaved = async () => { 
  showAjusteStock.value = false
  await loadIngredientes()
  await loadProducts(pagination.value.current_page)
  await loadAllProductsForSelection()
  showToast('Stock actualizado correctamente', 'success') 
}

const loadAnuncios = async () => {
  try {
    const data = await apiClient.get('/admin/anuncios')
    if (data.success || data.data) anuncios.value = data.data || data || []
  } catch (error) { console.error('Error loading anuncios count:', error) }
}

// ── PAQUETES ───────────────────────────────────────────────
const loadPaquetes = async (page = 1) => {
  if (!checkAuth()) return
  loading.paquetes = true
  try {
    const data = await apiClient.get(`/paquetes?page=${page}&per_page=10&buscar=${encodeURIComponent(searchTermPaquetes.value)}&_t=${Date.now()}`)
    if (data.success || data.data) {
      paquetes.value = data.data || []
      if (data.pagination) {
        paginationPaquetes.value = data.pagination
      } else if (data.meta) {
        paginationPaquetes.value = {
          current_page: data.meta.current_page,
          last_page: data.meta.last_page,
          per_page: data.meta.per_page,
          total: data.meta.total,
          from: data.meta.from,
          to: data.meta.to
        }
      }
    }
  } catch (error) {
    console.error('Error loading packages:', error)
    showToast('Error al cargar paquetes', 'error')
  } finally {
    loading.paquetes = false
  }
}

const changePagePaquetes = (page) => {
  if (page < 1 || page > paginationPaquetes.value.last_page) return
  loadPaquetes(page)
}

// Debounce para búsqueda de paquetes
let searchPaquetesTimeout = null
const debouncedSearchPaquetes = () => {
  clearTimeout(searchPaquetesTimeout)
  searchPaquetesTimeout = setTimeout(() => {
    loadPaquetes(1)
  }, 400)
}

const openCreatePaquete = () => {
  selectedPaquete.value = null
  suggestedProductsForNewPaquete.value = []
  showPaqueteModal.value = true
}

const closePaqueteModal = () => {
  showPaqueteModal.value = false
  suggestedProductsForNewPaquete.value = []
}

const handleExecuteBundle = (products) => {
  suggestedProductsForNewPaquete.value = products
  activeTab.value = 'paquetes'
  selectedPaquete.value = null
  showPaqueteModal.value = true
  showToast('Sugerencia cargada en el nuevo paquete', 'info')
}

const openEditPaquete = (p) => {
  selectedPaquete.value = p
  showPaqueteModal.value = true
}

const handlePaqueteSaved = async () => {
  showPaqueteModal.value = false
  await loadPaquetes()
  showToast('Paquete guardado correctamente', 'success')
}

const handleDeletePaquete = async (id) => {
  if (!confirm('¿Eliminar este paquete?')) return
  try {
    const data = await apiClient.delete(`/paquetes/${id}`)
    if (data.success || data.data) {
      showToast('Paquete eliminado', 'success')
      await loadPaquetes()
    }
  } catch (error) { showToast('Error al eliminar paquete', 'error') }
}

const handleToggleActivePaquete = async (id) => {
  try {
    const data = await apiClient.patch(`/paquetes/${id}/toggle-active`)
    if (data.success || data.data) {
      showToast('Estado actualizado', 'success')
      await loadPaquetes()
    }
  } catch (error) { showToast('Error al cambiar estado', 'error') }
}

const handleDeleteIngrediente = async (id) => {
  if (!confirm('¿Eliminar este ingrediente?')) return
  try {
    const data = await apiClient.delete(`/ingredientes/${id}`)
    if (data.success || data.data) { 
      showToast('Ingrediente eliminado correctamente', 'success')
      await loadIngredientes()
    } else {
      showToast(data.message || 'Error al eliminar', 'error')
    }
  } catch (error) {
    console.error('Error deleting ingredient:', error)
    showToast('Error de conexión', 'error')
  }
}

const totalSueldosBase = ref(0)
const cargarNominaTotal = async () => {
  try {
    const data = await apiClient.get('/empleados')
    const emps = data.data || data || []
    if (Array.isArray(emps)) {
      totalSueldosBase.value = emps
        .filter(e => !!e.activo || e.activo === 1)
        .reduce((s, e) => s + parseFloat(e.salario_base || 0), 0)
    }
  } catch (e) { console.error('Error nomina:', e) }
}

// ── LIFECYCLE ──────────────────────────────────────────────
onMounted(() => {
  loadProducts(1)  // Cargar primera página
  loadCategories()
  loadIngredientes()
  loadAnuncios()
  loadPaquetes()
  loadAllProductsForSelection()
  cargarNominaTotal()
})
</script>

<style scoped>
@keyframes slideIn { 
  from { transform: translateX(100%); opacity: 0; } 
  to { transform: translateX(0); opacity: 1; } 
}

.animate-slide-in { 
  animation: slideIn 0.3s ease-out; 
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

.animate-spin { 
  animation: spin 1s linear infinite; 
}
</style>