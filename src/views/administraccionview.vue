<template>
  <div class="space-y-6">

    <SucursalBadge />

    <!-- TOASTS -->
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-72 animate-slide-in pointer-events-auto',
          toast.type==='success' ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800' :
          toast.type==='error'   ? 'bg-red-50 border-l-4 border-red-500 text-red-800' :
          'bg-blue-50 border-l-4 border-blue-500 text-blue-800']">
        <span>{{ toast.type==='success' ? '✅' : toast.type==='error' ? '❌' : 'ℹ️' }}</span>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600">×</button>
      </div>
    </div>

    <!-- Encabezado -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Administración</h2>
        <p class="text-gray-500 text-sm mt-1">Panel de control del restaurante</p>
      </div>
      <div class="flex gap-2">
        <button @click="abrirModalEmpleado()"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition">
          <span>👤</span> Nuevo Empleado
        </button>
        <button @click="abrirModalRestaurante()"
          class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition">
          <span>🏪</span> Nuevo Restaurante
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
      <button v-for="t in mainTabs" :key="t.key" @click="mainTab = t.key"
        :class="['px-5 py-2 text-sm font-medium rounded-lg transition',
          mainTab === t.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200']">
        {{ t.label }}
      </button>
    </div>

    <!-- ══ TAB RESUMEN (Limpiado: KPIs y Gráficas movidos a Métricas) ══ -->
    <template v-if="mainTab === 'resumen'">
      <div v-if="loading.general" class="flex items-center justify-center py-20 gap-3">
        <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p class="text-gray-400">Cargando...</p>
      </div>

      <template v-else>
        <!-- Título de sección operativa -->
        <div class="mb-6">
          <h3 class="text-lg font-bold text-gray-800">Control Operativo</h3>
          <p class="text-xs text-gray-500">Gestión de personal y sucursales activas</p>
        </div>

        <!-- Tabs CRUD -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-6">
            <button v-for="tab in crudTabs" :key="tab.key" @click="activeTab = tab.key"
              :class="['py-4 px-1 border-b-2 font-medium text-sm transition',
                activeTab===tab.key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
              {{ tab.label }}
              <span class="ml-1.5 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs font-semibold">{{ tab.count }}</span>
            </button>
          </nav>
        </div>

        <!-- Tabla empleados -->
        <div v-if="activeTab === 'empleados'" class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <!-- ... (Contenido de tabla empleados se mantiene igual) ... -->
          <div v-if="loading.empleados" class="text-center py-12 text-gray-400">Cargando empleados...</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Empleado</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rol</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sucursal</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usuario</th>
                  <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="empleados.length===0">
                  <td colspan="5" class="px-5 py-10 text-center text-gray-400 italic">No hay empleados</td>
                </tr>
                <tr v-for="emp in empleados" :key="emp.id" class="hover:bg-gray-50">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {{ getInitials(emp.name) }}
                      </div>
                      <div class="flex flex-col">
                        <span class="font-bold text-gray-900 text-sm">{{ emp.name }}</span>
                        <!-- <span class="text-[10px] text-gray-400">{{ emp.email }}</span> -->
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                      {{ getRolNombre(emp) }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <span class="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                      {{ emp.restaurante_activo?.nombre || emp.restaurante_activo_nombre || '—' }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-sm text-gray-500">{{ emp.username }}</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button @click="editarEmpleado(emp)"
                        class="text-sm text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition">
                        ✏️ Editar
                      </button>
                      <button @click="eliminarEmpleado(emp)"
                        class="text-sm text-red-600 font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition">
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabla restaurantes -->
        <div v-if="activeTab === 'restaurantes'" class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div v-if="loading.restaurantes" class="text-center py-12 text-gray-400">Cargando restaurantes...</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Dirección</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="restaurantes.length===0">
                  <td colspan="4" class="px-5 py-10 text-center text-gray-400 italic">No hay restaurantes</td>
                </tr>
                <tr v-for="rest in restaurantes" :key="rest.id" class="hover:bg-gray-50">
                  <td class="px-5 py-4">
                    <p class="text-sm font-medium text-gray-900">{{ rest.nombre }}</p>
                    <p class="text-xs text-gray-500">{{ rest.telefono || 'Sin teléfono' }}</p>
                  </td>
                  <td class="px-5 py-4 text-sm text-gray-600">
                    {{ [rest.calle, rest.ciudad, rest.estado].filter(Boolean).join(', ') || '—' }}
                  </td>
                  <td class="px-5 py-4">
                    <span class="px-2.5 py-1 text-xs font-semibold rounded-full"
                      :class="rest.es_activo!==false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'">
                      {{ rest.es_activo!==false ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button @click="editarRestaurante(rest)"
                        class="text-sm text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition">
                        ✏️ Editar
                      </button>
                      <button @click="eliminarRestaurante(rest.id)"
                        class="text-sm text-red-600 font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition">
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>


    <!-- ══ TAB MARQUESINA ══ -->
    <template v-if="mainTab === 'anuncios'">
      <AnunciosView />
    </template>

    <!-- ══ TAB GASTOS ══ -->
    <template v-if="mainTab === 'gastos'">
      <GastoView />
    </template>

    <!-- ══ TAB MESEROS ══ -->
    <template v-if="mainTab === 'meseros'">
      <MeserosManager />
    </template>

    <!-- ══ MODAL EMPLEADO (Componente Nuevo) ══ -->
    <div v-if="showModalEmpleado" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      @click.self="cerrarModalEmpleado">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <!-- Botón cerrar X -->
        <button @click="cerrarModalEmpleado" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl z-10">✕</button>
        
        <FormularioTrabajador 
          ref="formEmpleadoRef"
          :empleado="empleadoEditando"
          :restaurantes="restaurantes"
          @guardar="handleGuardarEmpleado"
          @cancelar="cerrarModalEmpleado"
        />
      </div>
    </div>

    <!-- ══ MODAL RESTAURANTE ══ -->
    <div v-if="showModalRestaurante" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      @click.self="cerrarModalRestaurante">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-gray-800">{{ restauranteEditando ? 'Editar Restaurante' : 'Nuevo Restaurante' }}</h3>
          <button @click="cerrarModalRestaurante" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div v-if="formError" class="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">{{ formError }}</div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input v-model="restForm.nombre" type="text"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input v-model="restForm.telefono" type="text"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Calle y número</label>
            <input v-model="restForm.calle" type="text"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input v-model="restForm.ciudad" type="text"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input v-model="restForm.estado" type="text"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>
          <div class="space-y-3 pt-2">
            <label class="block text-sm font-medium text-gray-700">Logo o Foto del Restaurante</label>
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                <img v-if="imgPreview || restForm.imagen_url" :src="imgPreview || getImageUrl(restForm.imagen_url)" class="w-full h-full object-cover" />
                <span v-else class="text-gray-300 text-2xl">📸</span>
              </div>
              <div class="flex-1">
                <input type="file" @change="onFileChange" accept="image/*" class="hidden" ref="fileInput" />
                <div class="flex flex-wrap gap-2">
                  <button @click="$refs.fileInput.click()" type="button"
                    class="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition uppercase tracking-wider">
                    {{ (imgPreview || restForm.imagen_url) ? 'Cambiar imagen' : 'Seleccionar imagen' }}
                  </button>
                  <button v-if="imgPreview || restForm.imagen_url" @click="quitarImagen" type="button"
                    class="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition uppercase tracking-wider">
                    Quitar
                  </button>
                </div>
                <div v-if="errorMsg" class="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-shake">
                  <i class="fa-solid fa-circle-exclamation text-red-400"></i>
                  <span class="font-medium">{{ typeof errorMsg === 'object' ? Object.values(errorMsg)[0][0] : errorMsg }}</span>
                </div>
                <p class="text-[10px] text-gray-400 mt-2">JPG, PNG o WebP. Máx 5MB.</p>
              </div>
            </div>
          </div>
          <div v-if="restauranteEditando" class="flex items-center gap-2 pt-2">
            <input v-model="restForm.activo" type="checkbox" id="activo-check" class="accent-indigo-600 w-4 h-4" />
            <label for="activo-check" class="text-sm text-gray-700 cursor-pointer">Restaurante activo</label>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="cerrarModalRestaurante"
            class="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Cancelar</button>
          <button @click="guardarRestaurante" :disabled="loading.guardando"
            class="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50">
            {{ loading.guardando ? 'Guardando...' : (restauranteEditando ? 'Guardar cambios' : 'Crear restaurante') }}
          </button>
        </div>
      </div>
    <!-- ══ MODAL CONFIRMACIÓN ELIMINAR (Nuevo Estético) ══ -->
    <div v-if="showConfirmDelete" class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center px-4 backdrop-blur-sm animate-fade-in"
      @click.self="cancelarEliminacion">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
        <div class="p-8 text-center">
          <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl animate-bounce-subtle">
            <i class="fa-solid fa-user-slash"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">¿Eliminar usuario?</h3>
          <p class="text-gray-500 text-sm leading-relaxed mb-6">
            Estás a punto de eliminar permanentemente a <span class="font-bold text-gray-800">{{ nameToDelete }}</span>. 
            Esta acción es definitiva y no se puede deshacer.
          </p>
          
          <div class="flex flex-col gap-3">
            <button @click="handleConfirmDelete" :disabled="loading.guardando"
              class="w-full py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition shadow-lg shadow-red-200 disabled:opacity-50">
              {{ loading.guardando ? 'Eliminando...' : 'Sí, Eliminar' }}
            </button>
            <button @click="cancelarEliminacion"
              class="w-full py-3 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition">
              No, Mantener
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import SucursalBadge       from '../components/SucursalBadge.vue'
import IngredientesView    from './ingredientesview.vue'
import AnunciosView        from './anunciosview.vue'
import GastoView           from './GastoView.vue'
import MeserosManager      from '../components/administraccion/MeserosManager.vue'
import FormularioTrabajador   from '../components/administraccion/FormularioTrabajador.vue'
import { API_URL } from '@/config/api'

const router = useRouter()

// ── Estado ─────────────────────────────────────────────────────────────────────
const mainTab   = ref('resumen')
const activeTab = ref('empleados')
const empleados    = ref([])
const restaurantes = ref([])
const currentUser  = ref(null)
const toasts       = ref([])
const formError    = ref('')

const showModalEmpleado    = ref(false)
const showModalRestaurante = ref(false)
const showConfirmDelete    = ref(false)
const idToDelete           = ref(null)
const nameToDelete         = ref(null)
const empleadoEditando     = ref(null)
const restauranteEditando  = ref(null)

const dashData           = reactive({ ventas_hoy: 0, ordenes_hoy: 0, ordenes_por_estado: [] })
const ordenesCerradasHoy = ref([])
const loading = reactive({ general: true, empleados: false, restaurantes: false, guardando: false, sucursales: false })

const empForm  = reactive({ nombre:'', apellidos:'', email:'', usuario:'', password:'', password_confirmation:'', rol:'', restaurante_id: null })
const restForm = reactive({ nombre:'', telefono:'', calle:'', ciudad:'', estado:'', activo:true, imagen: null, imagen_url: null, eliminar_imagen: false })
const imgPreview = ref(null)
const fileInput  = ref(null)
const sucursalesDueno = ref([])

// ── Tabs ───────────────────────────────────────────────────────────────────────
const mainTabs = [
  { key:'resumen',      label:'🏢 Sucursales y Personal' },
  { key:'meseros',      label:'👥 Meseros'       },
  { key:'anuncios',     label:'📢 Marquesina'    },
  { key:'gastos',       label:'🧾 Gastos'        },
]

const crudTabs = computed(() => [
  { key:'empleados',    label:'Empleados',    count: empleados.value.length    },
  { key:'restaurantes', label:'Restaurantes', count: restaurantes.value.length },
])

// ── Helpers ────────────────────────────────────────────────────────────────────
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 'Content-Type':'application/json', Accept:'application/json', Authorization: token ? `Bearer ${token}` : '' }
}

const ROLES_MAP = { 1:'Super Admin', 2:'Administrador', 3:'Mesero', 4:'Cocina', 5:'Caja', 6:'Barra', 7:'Cliente' }

const getRolNombre = (emp) => {
  if (emp.roles?.length) {
    const r = emp.roles[0]
    if (r?.nombre) return r.nombre
    if (r?.name)   return r.name
    if (typeof r === 'number') return ROLES_MAP[r] || `Rol ${r}`
    if (r?.id) return ROLES_MAP[r.id] || r.nombre || `Rol ${r.id}`
  }
  if (emp.rol)    return ROLES_MAP[emp.rol]    || emp.rol
  if (emp.rol_id) return ROLES_MAP[emp.rol_id] || `Rol ${emp.rol_id}`
  return 'Empleado'
}

const getRolId = (emp) => {
  if (emp.roles?.length) { const r=emp.roles[0]; if(r?.id) return String(r.id); if(typeof r==='number') return String(r) }
  if (emp.rol_id) return String(emp.rol_id)
  if (emp.rol)    return String(emp.rol)
  return ''
}

const getInitials = (name) => !name ? 'U' : name.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0,2)

const showToast = (message, type='info') => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), 4000)
}
const removeToast = (id) => { const i=toasts.value.findIndex(t=>t.id===id); if(i!==-1) toasts.value.splice(i,1) }

// ── Cargar datos ───────────────────────────────────────────────────────────────
const loadData = async () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  if (!token) { router.push('/'); return }
  loading.general = true
  try {
    const today = new Date().toISOString().split('T')[0]
    const [uRes, rRes, dRes, cRes] = await Promise.all([
      fetch(`${API_URL}/me`,                  { headers: getHeaders() }),
      fetch(`${API_URL}/restaurantes`,        { headers: getHeaders() }),
      fetch(`${API_URL}/reportes/dashboard`,  { headers: getHeaders() }),
      fetch(`${API_URL}/ordenes?estado=CERRADA&fecha_desde=${today}&fecha_hasta=${today}&per_page=100`, { headers: getHeaders() }),
    ])
    if (uRes.status === 401) { localStorage.removeItem('token'); router.push('/'); return }
    const [uData, rData, dData, cData] = await Promise.all([uRes.json(), rRes.json(), dRes.json(), cRes.json()])
    if (uData.success) currentUser.value = uData.data || uData
    if (rData.success) restaurantes.value = rData.data?.restaurantes || []
    if (cData.success) ordenesCerradasHoy.value = Array.isArray(cData.data) ? cData.data : []
    if (dData.success) {
      dashData.ventas_hoy         = dData.data?.ventas_hoy         || 0
      dashData.ordenes_por_estado = dData.data?.ordenes_por_estado || []
      dashData.ordenes_hoy        = dData.data?.ordenes_hoy
        ?? dashData.ordenes_por_estado.reduce((s, x) => s + Number(x.total || 0), 0)
    }
    if (rData.success) {
      const raId = currentUser.value?.restaurante_activo?.id ?? currentUser.value?.restaurante_activo ?? null
      const restActivo = (rData.data?.restaurantes || []).find(r => r.id === raId)
      if (restActivo?.estadisticas) {
        if (!dashData.ordenes_hoy && restActivo.estadisticas.ordenes_hoy) dashData.ordenes_hoy = restActivo.estadisticas.ordenes_hoy
        if (!dashData.ventas_hoy  && restActivo.estadisticas.ventas_hoy)  dashData.ventas_hoy  = restActivo.estadisticas.ventas_hoy
      }
    }
    if (currentUser.value?.propietario_id) {
      try {
        const eRes  = await fetch(`${API_URL}/propietarios/${currentUser.value.propietario_id}`, { headers: getHeaders() })
        const eData = await eRes.json()
        if (eData.success) {
          empleados.value = (eData.data?.usuarios || eData.data?.users || [])
            .filter(u => u.id !== currentUser.value.id)
        }
      } catch {}
      await cargarSucursalesDueno()
    }
  } catch(e) { console.error('Error loadData:', e) }
  finally { loading.general = false }
}

const cargarSucursalesDueno = async () => {
  loading.sucursales = true
  try {
    const res  = await fetch(`${API_URL}/user/owner-restaurants`, { headers: getHeaders() })
    const r    = await res.json()
    if (r.success) sucursalesDueno.value = r.data
  } catch(err) { console.error('Error sucursales:', err) }
  finally { loading.sucursales = false }
}

// ── Modales empleado ───────────────────────────────────────────────────────────
const abrirModalEmpleado = () => {
  empleadoEditando.value = null; formError.value = ''
  const rActivo = currentUser.value?.restaurante_activo
  const rId = (rActivo && typeof rActivo === 'object') ? Number(rActivo.id) : (rActivo ? Number(rActivo) : null)
  Object.assign(empForm, { nombre:'', apellidos:'', email:'', usuario:'', password:'', password_confirmation:'', rol:'', restaurante_activo: rId })
  showModalEmpleado.value = true
}
const editarEmpleado = (emp) => {
  empleadoEditando.value = emp; formError.value = ''
  const parts = (emp.name || '').split(' ')
  Object.assign(empForm, {
    nombre: parts[0] || '', apellidos: parts.slice(1).join(' ') || '',
    email: emp.email || '', usuario: emp.username || '',
    password: '', password_confirmation: '',
    rol: getRolId(emp),
    restaurante_id: (emp.restaurante_activo && typeof emp.restaurante_activo === 'object')
      ? Number(emp.restaurante_activo.id) : (emp.restaurante_activo ? Number(emp.restaurante_activo) : null)
  })
  showModalEmpleado.value = true
}
const cerrarModalEmpleado = () => {
  showModalEmpleado.value = false; empleadoEditando.value = null
  formError.value = ''; empForm.password = ''; empForm.password_confirmation = ''
}
const formEmpleadoRef = ref(null)
const handleGuardarEmpleado = async (payload) => {
  loading.guardando = true
  try {
    const isEdit = !!empleadoEditando.value
    const url    = isEdit ? `${API_URL}/users/${empleadoEditando.value.id}` : `${API_URL}/register-empleado`
    const method = isEdit ? 'PUT' : 'POST'
    
    // Añadimos el restaurante activo actual si no viene en el payload
    if (!payload.restaurante_id) {
      payload.restaurante_id = restauranteActivoId.value
    }
    payload.propietario_id = currentUser.value?.propietario_id

    const res = await fetch(url, { method, headers:getHeaders(), body:JSON.stringify(payload) })
    const r   = await res.json()
    
    if (res.ok && r.success) {
      showToast(isEdit ? 'Empleado actualizado' : 'Empleado creado', 'success')
      
      // Si el backend devolvió una cadena de acceso, se la pasamos al componente
      if (r.cadena_acceso) {
        formEmpleadoRef.value?.setCadena(r.cadena_acceso)
      } else if (!isEdit) {
        // Si no hay cadena y es nuevo, cerramos (pero normalmente el backend la mandará ahora)
        cerrarModalEmpleado()
      } else {
        cerrarModalEmpleado()
      }
      loadData()
    } else {
      const msg = r.message || Object.values(r.errors||{}).flat().join(' · ') || 'Error al guardar'
      formEmpleadoRef.value?.setError(msg)
    }
  } catch (err) {
    formEmpleadoRef.value?.setError('Error de conexión con el servidor')
  } finally {
    loading.guardando = false
  }
}

const restauranteActivoId = computed(() => {
  const r = currentUser.value?.restaurante_activo
  return (r && typeof r === 'object') ? Number(r.id) : (r ? Number(r) : null)
})
const eliminarEmpleado = (emp) => {
  idToDelete.value = emp.id
  nameToDelete.value = emp.name
  showConfirmDelete.value = true
}

const cancelarEliminacion = () => {
  showConfirmDelete.value = false
  idToDelete.value = null
  nameToDelete.value = null
}

const handleConfirmDelete = async () => {
  if (!idToDelete.value) return
  loading.guardando = true
  try {
    const res = await fetch(`${API_URL}/users/${idToDelete.value}`, { method:'DELETE', headers:getHeaders() })
    const r   = await res.json()
    if (res.ok && r.success) { 
      empleados.value = empleados.value.filter(e => e.id !== idToDelete.value)
      showToast('Empleado eliminado permanentemente', 'success') 
      cancelarEliminacion()
    } else { 
      showToast(r.message || 'Error al eliminar', 'error') 
    }
  } catch { 
    showToast('Error de conexión', 'error') 
  } finally { 
    loading.guardando = false
  }
}

// ── Modales restaurante ────────────────────────────────────────────────────────
const abrirModalRestaurante = () => {
  restauranteEditando.value = null; formError.value = ''
  Object.assign(restForm, { nombre:'', telefono:'', calle:'', ciudad:'', estado:'', activo:true, imagen: null, imagen_url: null, eliminar_imagen: false })
  imgPreview.value = null
  showModalRestaurante.value = true
}
const editarRestaurante = (rest) => {
  restauranteEditando.value = rest; formError.value = ''
  Object.assign(restForm, {
    nombre:rest.nombre||'', telefono:rest.telefono||'', calle:rest.calle||'',
    ciudad:rest.ciudad||'', estado:rest.estado||'', activo:rest.es_activo!==false,
    imagen: null, imagen_url: rest.imagen_url, eliminar_imagen: false
  })
  imgPreview.value = null
  showModalRestaurante.value = true
}
const cerrarModalRestaurante = () => {
  showModalRestaurante.value=false; restauranteEditando.value=null
  formError.value=''; imgPreview.value = null
}
const onFileChange = (e) => {
  const file = e.target.files[0]; if (!file) return
  restForm.imagen = file; restForm.eliminar_imagen = false
  const reader = new FileReader()
  reader.onload = (e) => imgPreview.value = e.target.result
  reader.readAsDataURL(file)
}
const quitarImagen = () => {
  restForm.imagen = null; restForm.imagen_url = null
  restForm.eliminar_imagen = true; imgPreview.value = null
  if (fileInput.value) fileInput.value.value = ''
}
const guardarRestaurante = async () => {
  formError.value = ''
  if (!restForm.nombre) { formError.value='El nombre es obligatorio'; return }
  loading.guardando = true
  try {
    const isEdit = !!restauranteEditando.value
    const url    = isEdit ? `${API_URL}/restaurantes/${restauranteEditando.value.id}` : `${API_URL}/restaurantes`
    const formData = new FormData()
    formData.append('nombre', restForm.nombre)
    formData.append('telefono', restForm.telefono || '')
    formData.append('calle', restForm.calle || '')
    formData.append('ciudad', restForm.ciudad || '')
    formData.append('estado', restForm.estado || '')
    formData.append('activo', restForm.activo ? '1' : '0')
    if (isEdit) formData.append('_method', 'PUT')
    if (restForm.imagen) formData.append('imagen', restForm.imagen)
    if (restForm.eliminar_imagen) formData.append('eliminar_imagen', '1')
    const headers = { ...getHeaders() }; delete headers['Content-Type']
    const res = await fetch(url, { method: 'POST', headers, body: formData })
    const r   = await res.json()
    if (res.ok && r.success) {
      if (isEdit) { const idx=restaurantes.value.findIndex(x=>x.id===restauranteEditando.value.id); if(idx!==-1) restaurantes.value[idx]={...restaurantes.value[idx],...(r.data||{})} }
      else restaurantes.value.push(r.data)
      showToast(isEdit ? 'Restaurante actualizado' : 'Restaurante creado', 'success')
      cerrarModalRestaurante()
    } else { formError.value = r.message || Object.values(r.errors||{}).flat().join(' · ') || 'Error al guardar' }
  } catch { formError.value = 'Error de conexión' }
  finally { loading.guardando = false }
}
const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_URL}/../storage/${path}`
}
const eliminarRestaurante = async (id) => {
  if (!confirm('¿Eliminar restaurante?')) return
  try {
    const res = await fetch(`${API_URL}/restaurantes/${id}`, { method:'DELETE', headers:getHeaders() })
    const r   = await res.json()
    if (res.ok && r.success) { restaurantes.value=restaurantes.value.filter(x=>x.id!==id); showToast('Restaurante eliminado','success') }
    else showToast(r.message||'Error al eliminar','error')
  } catch { showToast('Error de conexión','error') }
}

watch(mainTab, (val) => { if (val === 'resumen') loadData() })
onMounted(loadData)
</script>

<style scoped>
@keyframes slideIn { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
.animate-slide-in { animation: slideIn 0.3s ease-out; }
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes bounceSubtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.animate-bounce-subtle { animation: bounceSubtle 2s infinite ease-in-out; }
</style>