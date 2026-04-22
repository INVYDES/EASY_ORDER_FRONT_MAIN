<template>
  <div class="p-4 sm:p-6 space-y-6">

    <!-- TOASTS -->
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-72 pointer-events-auto animate-slide-in',
          toast.type==='success'?'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800':
          toast.type==='error'  ?'bg-red-50 border-l-4 border-red-500 text-red-800':
          'bg-blue-50 border-l-4 border-blue-500 text-blue-800']">
        <span>{{ toast.type==='success'?'✅':toast.type==='error'?'❌':'ℹ️' }}</span>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600">×</button>
      </div>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">🧄 Ingredientes</h1>
        <p class="text-gray-500 text-sm mt-0.5">Inventario y costos de ingredientes</p>
      </div>
      <button @click="abrirModal()"
        class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition">
        ＋ Nuevo ingrediente
      </button>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 border-indigo-500">
        <p class="text-xs text-gray-500 uppercase font-semibold">Total ingredientes</p>
        <p class="text-2xl font-black text-gray-900 mt-1">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-500">
        <p class="text-xs text-gray-500 uppercase font-semibold">Bajo stock ⚠️</p>
        <p class="text-2xl font-black text-amber-600 mt-1">{{ stats.bajo_stock }}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
        <p class="text-xs text-gray-500 uppercase font-semibold">Sin stock 🚨</p>
        <p class="text-2xl font-black text-red-600 mt-1">{{ stats.sin_stock }}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 border-emerald-500">
        <p class="text-xs text-gray-500 uppercase font-semibold">Valor inventario</p>
        <p class="text-2xl font-black text-emerald-600 mt-1">${{ fm(stats.costo_total) }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex items-center gap-3 flex-wrap">
      <input v-model="buscar" type="text" placeholder="🔍 Buscar ingrediente..."
        class="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64" />
      <button @click="filtroBajoStock = !filtroBajoStock"
        :class="['px-4 py-2 rounded-xl text-sm font-semibold transition border',
          filtroBajoStock ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300']">
        ⚠️ Solo bajo stock
      </button>
      <span class="text-xs text-gray-400 ml-auto">{{ ingredientesFiltrados.length }} ingredientes</span>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div v-if="loading" class="text-center py-16 text-gray-400">
        <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
        Cargando ingredientes...
      </div>
      <div v-else-if="ingredientesFiltrados.length === 0" class="text-center py-16 text-gray-400">
        <span class="text-4xl block mb-3">🧄</span>
        <p>No hay ingredientes{{ buscar ? ' con ese nombre' : ' registrados' }}</p>
        <button @click="abrirModal()" class="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition">
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
            <tr v-for="ing in ingredientesFiltrados" :key="ing.id"
              class="hover:bg-gray-50 transition"
              :class="ing.sin_stock ? 'bg-red-50/40' : ing.bajo_stock ? 'bg-amber-50/40' : ''">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    :class="ing.sin_stock ? 'bg-red-100' : ing.bajo_stock ? 'bg-amber-100' : 'bg-indigo-50'">
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
                <span class="text-sm font-bold" :class="ing.sin_stock?'text-red-600':ing.bajo_stock?'text-amber-600':'text-gray-800'">
                  {{ ing.stock_actual }}
                </span>
                <span class="text-xs text-gray-400 ml-1">{{ ing.unidad }}</span>
              </td>
              <td class="px-5 py-4 text-sm text-gray-500 text-right">{{ ing.stock_minimo }} {{ ing.unidad }}</td>
              <td class="px-5 py-4 text-center">
                <span class="px-2.5 py-1 text-xs font-semibold rounded-full"
                  :class="ing.sin_stock ? 'bg-red-100 text-red-700'
                    : ing.bajo_stock    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'">
                  {{ ing.sin_stock ? 'Sin stock' : ing.bajo_stock ? 'Bajo stock' : 'OK' }}
                </span>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex justify-end gap-1">
                  <button @click="abrirAjuste(ing)"
                    class="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition font-medium">
                    📦 Stock
                  </button>
                  <button @click="abrirModal(ing)"
                    class="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition font-medium">
                    ✏️
                  </button>
                  <button @click="eliminar(ing.id)"
                    class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-medium">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══ MODAL CREAR/EDITAR ══ -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      @click.self="showModal=false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-gray-800">{{ editando ? 'Editar ingrediente' : 'Nuevo ingrediente' }}</h3>
          <button @click="showModal=false" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div v-if="formError" class="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">{{ formError }}</div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input v-model="form.nombre" type="text" placeholder="Ej. Jitomate"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Unidad *</label>
              <select v-model="form.unidad"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                <option value="gramos">gramos</option>
                <option value="kilogramos">kilogramos</option>
                <option value="mililitros">mililitros</option>
                <option value="litros">litros</option>
                <option value="piezas">piezas</option>
                <option value="cucharadas">cucharadas</option>
                <option value="tazas">tazas</option>
                <option value="porciones">porciones</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Costo por unidad *</label>
              <div class="relative">
                <span class="absolute left-3 top-3 text-gray-400 text-xs">$</span>
                <input v-model="form.costo_unitario" type="number" min="0" step="0.0001" placeholder="0.00"
                  class="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Stock actual</label>
              <input v-model="form.stock_actual" type="number" min="0" step="0.001"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
              <input v-model="form.stock_minimo" type="number" min="0" step="0.001"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
            <input v-model="form.proveedor" type="text" placeholder="Nombre del proveedor (opcional)"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showModal=false"
            class="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Cancelar</button>
          <button @click="guardar" :disabled="guardando"
            class="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
            {{ guardando ? 'Guardando...' : (editando ? 'Guardar cambios' : 'Crear ingrediente') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ MODAL AJUSTE STOCK ══ -->
    <AjustarStockModal
  v-if="showAjuste"
  :ingrediente="ingredienteAjuste"
  :form="ajusteForm"
  @close="showAjuste = false"
  @guardar="onStockActualizado"
  @saved="cargar"
/>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AjustarStockModal from '../components/ingredientes/AjusteStockModal.vue'
import { API_URL, STORAGE_URL } from '@/config/api'
const router = useRouter()
const onStockActualizado = (data) => {
  // opcional: actualizar UI sin recargar
  const i = ingredientes.value.find(i => i.id === data.id)
  if (i) {
    i.stock_actual = data.stock_actual
  }
}
// Estado
const ingredientes = ref([])
const stats = ref({ total: 0, bajo_stock: 0, sin_stock: 0, costo_total: 0 })
const loading = ref(false)
const guardando = ref(false)
const toasts = ref([])
const buscar = ref('')
const filtroBajoStock = ref(false)

const showModal = ref(false)
const showAjuste = ref(false)
const editando = ref(null)
const formError = ref('')
const ingredienteAjuste = ref(null)

const form = ref({
  nombre: '',
  unidad: 'gramos',
  costo_unitario: '',
  stock_actual: '',
  stock_minimo: '',
  proveedor: ''
})

const ajusteForm = ref({
  tipo: 'entrada',
  cantidad: '',
  motivo: ''
})

// Headers
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  if (!token) {
    router.push('/')
    return {}
  }
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

// Formatear moneda
const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'

// Toast
const showToast = (message, type = 'info') => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), 4000)
}
const removeToast = (id) => { toasts.value = toasts.value.filter(t => t.id !== id) }

// Ingredientes filtrados
const ingredientesFiltrados = computed(() => {
  let lista = ingredientes.value
  if (filtroBajoStock.value) lista = lista.filter(i => i.bajo_stock || i.sin_stock)
  if (buscar.value) {
    const b = buscar.value.toLowerCase()
    lista = lista.filter(i => i.nombre.toLowerCase().includes(b) || (i.proveedor || '').toLowerCase().includes(b))
  }
  return lista
})

// Cargar datos
const cargar = async () => {
  loading.value = true
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
      stats.value = data.stats || { total: 0, bajo_stock: 0, sin_stock: 0, costo_total: 0 }
    }
  } catch (e) {
    showToast('Error al cargar ingredientes', 'error')
  } finally {
    loading.value = false
  }
}

// Abrir modal crear/editar
const abrirModal = (ing = null) => {
  editando.value = ing
  formError.value = ''
  if (ing) {
    form.value = {
      nombre: ing.nombre,
      unidad: ing.unidad,
      costo_unitario: ing.costo_unitario,
      stock_actual: ing.stock_actual,
      stock_minimo: ing.stock_minimo,
      proveedor: ing.proveedor || ''
    }
  } else {
    form.value = {
      nombre: '',
      unidad: 'gramos',
      costo_unitario: '',
      stock_actual: '',
      stock_minimo: '',
      proveedor: ''
    }
  }
  showModal.value = true
}

// Guardar ingrediente
const guardar = async () => {
  formError.value = ''
  if (!form.value.nombre) { formError.value = 'El nombre es obligatorio'; return }
  if (!form.value.costo_unitario) { formError.value = 'El costo es obligatorio'; return }

  guardando.value = true
  try {
    const url = editando.value ? `${API_URL}/ingredientes/${editando.value.id}` : `${API_URL}/ingredientes`
    const method = editando.value ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(form.value)
    })
    const data = await res.json()
    if (res.ok && data.success) {
      showToast(editando.value ? 'Ingrediente actualizado' : 'Ingrediente creado', 'success')
      showModal.value = false
      await cargar()
    } else {
      formError.value = data.message || 'Error al guardar'
    }
  } catch {
    formError.value = 'Error de conexión'
  } finally {
    guardando.value = false
  }
}

// Abrir modal ajuste stock
const abrirAjuste = (ing) => {
  ingredienteAjuste.value = ing
  ajusteForm.value = { tipo: 'entrada', cantidad: '', motivo: '' }
  showAjuste.value = true
}

// Guardar ajuste stock
const guardarAjuste = async () => {
  if (!ajusteForm.value.cantidad) return

  guardando.value = true
  try {
    const res = await fetch(`${API_URL}/ingredientes/${ingredienteAjuste.value.id}/ajustar-stock`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(ajusteForm.value)
    })
    const data = await res.json()
    if (res.ok && data.success) {
      showToast('Stock actualizado', 'success')
      showAjuste.value = false
      await cargar()
    } else {
      showToast(data.message || 'Error al ajustar stock', 'error')
    }
  } catch {
    showToast('Error de conexión', 'error')
  } finally {
    guardando.value = false
  }
}

// Eliminar ingrediente
const eliminar = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este ingrediente?')) return

  try {
    const res = await fetch(`${API_URL}/ingredientes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    const r = await res.json()
    if (r.success) {
      showToast('Ingrediente eliminado', 'success')
      await cargar()
    } else {
      showToast(r.message || 'Error al eliminar', 'error')
    }
  } catch {
    showToast('Error de conexión', 'error')
  }
}

onMounted(() => {
  cargar()
})
</script>

<style scoped>
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>