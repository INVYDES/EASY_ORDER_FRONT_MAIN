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

    <!-- ── PRODUCTOS ──────────────────────────────────────── -->
    <div v-if="activeTab === 'productos'">
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

    <!-- ── CATEGORÍAS ─────────────────────────────────────── -->
    <div v-else-if="activeTab === 'categorias'">
      <div class="flex justify-end mb-4">
        <button
          @click="openCreateCategoria"
          class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition"
        >
          <span class="text-base leading-none">＋</span> Nueva Categoría
        </button>
      </div>
      <div v-if="loading.categories" class="text-center py-10 text-gray-400 text-sm">Cargando categorías...</div>
      <div v-else-if="categories.length === 0" class="text-center py-16 bg-white rounded-2xl border border-gray-100">
        <span class="text-4xl block mb-3">📂</span>
        <p class="text-gray-500 text-sm">No hay categorías registradas</p>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 shrink-0">
              <img v-if="cat.imagen" :src="getImageUrl(cat.imagen)" class="w-full h-full object-cover" @error="onImageError" />
              <span v-else class="text-xl">{{ cat.icono || '📦' }}</span>
            </div>
            <div>
              <p class="font-semibold text-gray-800 text-sm">{{ cat.nombre }}</p>
              <p class="text-xs text-gray-400 line-clamp-1">{{ cat.descripcion || 'Sin descripción' }}</p>
            </div>
          </div>
          <div class="flex gap-2 mt-2">
            <button @click="openEditCategoria(cat)" class="flex-1 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition">Editar</button>
            <button @click="handleDeleteCategoria(cat.id)" class="flex-1 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">Eliminar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── INGREDIENTES ───────────────────────────────────── -->
    <div v-else-if="activeTab === 'ingredientes'">
      <!-- ... (todo tu código de ingredientes existente se mantiene igual) ... -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">🧄 Ingredientes</h1>
          <p class="text-gray-500 text-sm mt-0.5">Inventario y costos de ingredientes</p>
        </div>
        <button
          @click="abrirModalIngrediente()"
          class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
        >
          ＋ Nuevo ingrediente
        </button>
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

  </div>
</template>

<script setup>
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
import AjusteStockModal from '../components/productos/AjustesStockModal.vue'
import AnunciosView from './anunciosview.vue'

import { API_URL } from '@/config/api'

const router = useRouter()

// ── ESTADO GLOBAL ──────────────────────────────────────────
const activeTab = ref('productos')
const products = ref([])
const categories = ref([])
const ingredientes = ref([])
const anuncios = ref([])
const selectedProduct = ref(null)
const selectedCategoria = ref(null)
const searchTerm = ref('')
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

// Modales
const showForm = ref(false)
const showImport = ref(false)
const showCategoriaModal = ref(false)
const showIngredienteModal = ref(false)
const showAjusteStock = ref(false)

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
  ingredientes: false 
})

// ── TABS ───────────────────────────────────────────────────
const tabs = [
  { key: 'productos',    label: '📦 Productos' },
  { key: 'categorias',   label: '🏷️ Categorías' },
  { key: 'ingredientes', label: '🧄 Ingredientes' },
  { key: 'anuncios',     label: '📢 Anuncios' },
]

const getTabCount = (key) => {
  if (key === 'productos') return products.value.length
  if (key === 'categorias') return categories.value.length
  if (key === 'ingredientes') return ingredientes.value.length
  if (key === 'anuncios') return anuncios.value.length
  return 0
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
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 
    'Content-Type': 'application/json', 
    Accept: 'application/json', 
    Authorization: token ? `Bearer ${token}` : '' 
  }
}

const checkAuth = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  if (!token) { 
    router.push('/')
    return false 
  }
  return true
}

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${API_URL}/storage/${path}`
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
    // ✅ Agregamos página y timestamp para evitar caché
    const res = await fetch(`${API_URL}/productos?page=${page}&per_page=15&_t=${Date.now()}`, { 
      headers: getHeaders() 
    })
    const data = await res.json()
    if (data.success) {
      products.value = data.data || []
      // ✅ Actualizar paginación
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
    await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE', headers: getHeaders() })
    await loadProducts(pagination.value.current_page)
    showToast('Producto eliminado correctamente', 'success')
  } catch (error) {
    showToast('Error al eliminar producto', 'error')
  }
}

const handleToggleActive = async (id) => { 
  try {
    await fetch(`${API_URL}/productos/${id}/toggle-active`, { method: 'PATCH', headers: getHeaders() })
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
    const res = await fetch(`${API_URL}/categorias`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) categories.value = data.data || []
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
    await fetch(`${API_URL}/categorias/${id}`, { method: 'DELETE', headers: getHeaders() })
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
    const res = await fetch(`${API_URL}/ingredientes`, { headers: getHeaders() })
    if (res.status === 401) { 
      localStorage.removeItem('token')
      router.push('/')
      return 
    }
    const data = await res.json()
    if (data.success) {
      ingredientes.value = data.data || []
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
  showToast('Ingrediente guardado correctamente', 'success') 
}

const handleStockSaved = async () => { 
  showAjusteStock.value = false
  await loadIngredientes()
  showToast('Stock actualizado correctamente', 'success') 
}

const loadAnuncios = async () => {
  try {
    const res = await fetch(`${API_URL}/admin/anuncios`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) anuncios.value = data.data || []
  } catch (error) { console.error('Error loading anuncios count:', error) }
}

const handleDeleteIngrediente = async (id) => {
  if (!confirm('¿Eliminar este ingrediente?')) return
  try {
    const res = await fetch(`${API_URL}/ingredientes/${id}`, { method: 'DELETE', headers: getHeaders() })
    const data = await res.json()
    if (data.success) { 
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

// ── LIFECYCLE ──────────────────────────────────────────────
onMounted(() => {
  loadProducts(1)  // Cargar primera página
  loadCategories()
  loadIngredientes()
  loadAnuncios()
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