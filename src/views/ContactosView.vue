<template>
  <div class="space-y-6">

    <!-- TOASTS -->
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-72 pointer-events-auto',
          toast.type === 'success' ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800'
                                   : 'bg-red-50 border-l-4 border-red-500 text-red-800']">
        <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check text-emerald-600' : 'fa-solid fa-circle-xmark text-red-600'"></i>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>
    </div>

    <!-- Encabezado Sticky -->
    <div class="sticky -top-4 lg:-top-8 z-20 bg-gray-50/95 backdrop-blur-xs -mx-4 lg:-mx-8 px-4 lg:px-8 pt-4 lg:pt-8 pb-3 border-b border-[#DDE3DE] shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-[#202723] flex items-center gap-2">
          <i class="fa-solid fa-envelope-open-text text-[#245C4F]"></i> Solicitudes de contacto
        </h2>
        <p class="text-sm text-[#68736C]">Formularios recibidos desde la landing pública (eorder.mx/contactanos)</p>
      </div>
      <button @click="cargarTodo"
        class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#DDE3DE] text-[#202723] text-sm font-semibold rounded-xl hover:bg-[#E8F1ED] hover:text-[#245C4F] transition shadow-xs">
        <i :class="['fa-solid fa-arrows-rotate text-sm', loading.lista ? 'animate-spin' : '']"></i> Actualizar
      </button>
    </div>

    <!-- KPIs por estatus -->
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      <button v-for="kpi in kpis" :key="kpi.key" @click="filtrarPorEstatus(kpi.key)"
        :class="['text-left bg-white rounded-2xl border p-4 shadow-xs transition hover:shadow-md',
          filtros.estatus === kpi.key ? 'border-[#245C4F] ring-1 ring-[#245C4F] bg-[#E8F1ED]/20' : 'border-[#DDE3DE]']">
        <p class="text-[11px] font-bold text-[#68736C] uppercase tracking-wide">{{ kpi.label }}</p>
        <p class="text-2xl font-black text-[#202723] mt-1">{{ kpi.total }}</p>
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-2xl shadow-xs border border-[#DDE3DE] p-5">
      <p class="text-xs font-bold text-[#68736C] uppercase tracking-wide mb-3">Filtros</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-semibold text-[#202723] mb-1">Buscar</label>
          <input v-model="filtros.buscar" @keyup.enter="buscarDesdeCero" type="text"
            placeholder="Nombre, negocio, correo, teléfono o folio"
            class="w-full px-3 py-2 border border-[#DDE3DE] rounded-xl text-sm focus:ring-2 focus:ring-[#245C4F] focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-[#202723] mb-1">Estatus</label>
          <select v-model="filtros.estatus" @change="buscarDesdeCero"
            class="w-full px-3 py-2 border border-[#DDE3DE] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#245C4F] focus:outline-none">
            <option value="">Todos</option>
            <option v-for="e in ESTATUS" :key="e" :value="e">{{ etiquetaEstatus(e) }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-[#202723] mb-1">Tipo de contacto</label>
          <select v-model="filtros.tipo_contacto" @change="buscarDesdeCero"
            class="w-full px-3 py-2 border border-[#DDE3DE] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#245C4F] focus:outline-none">
            <option value="">Todos</option>
            <option value="distribuidor">Distribuidor</option>
            <option value="representante">Representante</option>
            <option value="indistinto">Indistinto</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-[#202723] mb-1">Por página</label>
          <select v-model.number="filtros.per_page" @change="buscarDesdeCero"
            class="w-full px-3 py-2 border border-[#DDE3DE] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#245C4F] focus:outline-none">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl shadow-xs border border-[#DDE3DE] overflow-hidden">
      <div v-if="loading.lista" class="py-16 text-center text-gray-400">Cargando solicitudes…</div>
      <div v-else-if="solicitudes.length === 0" class="py-16 text-center text-gray-400 italic">
        No hay solicitudes que coincidan con los filtros
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-[#DDE3DE]">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-bold text-[#68736C] uppercase">Contacto</th>
              <th class="px-5 py-3 text-left text-xs font-bold text-[#68736C] uppercase">Datos</th>
              <th class="px-5 py-3 text-left text-xs font-bold text-[#68736C] uppercase">Tipo</th>
              <th class="px-5 py-3 text-left text-xs font-bold text-[#68736C] uppercase">Preferencias</th>
              <th class="px-5 py-3 text-left text-xs font-bold text-[#68736C] uppercase">Estatus</th>
              <th class="px-5 py-3 text-right text-xs font-bold text-[#68736C] uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#DDE3DE]">
            <tr v-for="s in solicitudes" :key="s.id" class="hover:bg-gray-50 align-top">
              <td class="px-5 py-4">
                <p class="font-bold text-[#202723] text-sm">{{ s.nombre }}</p>
                <p class="text-xs text-[#68736C]">{{ s.negocio || 'Sin negocio' }}</p>
                <p class="text-[11px] text-gray-400 mt-1 font-mono">{{ s.folio }}</p>
                <p class="text-[11px] text-gray-400">{{ formatFecha(s.creado_en) }}</p>
              </td>
              <td class="px-5 py-4 text-xs text-[#68736C] space-y-1">
                <p class="flex items-center gap-1.5"><i class="fa-solid fa-envelope text-[#245C4F]"></i> <a :href="`mailto:${s.email}`" class="text-[#245C4F] hover:underline font-medium">{{ s.email }}</a></p>
                <p class="flex items-center gap-1.5"><i class="fa-solid fa-phone text-[#245C4F]"></i> <span>{{ s.telefono }}</span></p>
                <p v-if="s.ciudad" class="flex items-center gap-1.5"><i class="fa-solid fa-location-dot text-[#245C4F]"></i> <span>{{ s.ciudad }}</span></p>
              </td>
              <td class="px-5 py-4">
                <span class="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium capitalize">
                  {{ s.tipo_contacto }}
                </span>
              </td>
              <td class="px-5 py-4 text-xs text-[#68736C] space-y-0.5">
                <p class="font-medium text-[#202723]">{{ etiquetaMedio(s.medio_preferido) }}</p>
                <p class="text-gray-400">{{ etiquetaHorario(s.horario_preferido) }}</p>
              </td>
              <td class="px-5 py-4">
                <span :class="['text-xs px-2.5 py-1 rounded-full font-bold', colorEstatus(s.estatus)]">
                  {{ etiquetaEstatus(s.estatus) }}
                </span>
                <p v-if="s.asignado_a" class="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  <i class="fa-solid fa-user"></i> {{ s.asignado_a }}
                </p>
              </td>
              <td class="px-5 py-4 text-right whitespace-nowrap">
                <button @click="abrirDetalle(s)"
                  class="text-xs px-3 py-1.5 rounded-lg bg-[#E8F1ED] text-[#245C4F] hover:bg-[#245C4F] hover:text-white transition font-bold">
                  Gestionar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="pagination.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-[#DDE3DE] bg-gray-50">
        <p class="text-xs text-[#68736C]">
          Página {{ pagination.current_page }} de {{ pagination.last_page }} · {{ pagination.total }} solicitudes
        </p>
        <div class="flex gap-2">
          <button :disabled="pagination.current_page <= 1" @click="cambiarPagina(pagination.current_page - 1)"
            class="px-3 py-1.5 text-xs rounded-lg bg-white border border-[#DDE3DE] text-[#202723] disabled:opacity-40">Anterior</button>
          <button :disabled="pagination.current_page >= pagination.last_page" @click="cambiarPagina(pagination.current_page + 1)"
            class="px-3 py-1.5 text-xs rounded-lg bg-white border border-[#DDE3DE] text-[#202723] disabled:opacity-40">Siguiente</button>
        </div>
      </div>
    </div>

    <!-- ══ MODAL DETALLE / SEGUIMIENTO ══ -->
    <div v-if="detalleVisible" class="fixed inset-0 bg-black/50 z-50 flex items-start justify-center px-4 py-8 overflow-y-auto"
      @click.self="cerrarDetalle">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-[#DDE3DE]">
        <div class="flex items-start justify-between p-6 border-b border-[#DDE3DE]">
          <div>
            <h3 class="text-lg font-bold text-[#202723]">{{ seleccionada?.nombre }}</h3>
            <p class="text-xs text-gray-400 font-mono mt-0.5">{{ seleccionada?.folio }}</p>
          </div>
          <button @click="cerrarDetalle" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div v-if="seleccionada" class="p-6 space-y-5">
          <!-- Datos del contacto -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <p><span class="text-[#68736C] text-xs block font-semibold">Correo</span>{{ seleccionada.email }}</p>
            <p><span class="text-[#68736C] text-xs block font-semibold">Teléfono</span>{{ seleccionada.telefono }}</p>
            <p><span class="text-[#68736C] text-xs block font-semibold">Negocio</span>{{ seleccionada.negocio || '—' }}</p>
            <p><span class="text-[#68736C] text-xs block font-semibold">Ciudad</span>{{ seleccionada.ciudad || '—' }}</p>
            <p><span class="text-[#68736C] text-xs block font-semibold">Tipo</span>{{ seleccionada.tipo_contacto }}</p>
            <p><span class="text-[#68736C] text-xs block font-semibold">Medio y horario</span>
              {{ etiquetaMedio(seleccionada.medio_preferido) }} · {{ etiquetaHorario(seleccionada.horario_preferido) }}</p>
            <p><span class="text-[#68736C] text-xs block font-semibold">Recibida</span>{{ formatFecha(seleccionada.creado_en) }}</p>
            <p><span class="text-[#68736C] text-xs block font-semibold">Contactado</span>{{ seleccionada.contactado_en ? formatFecha(seleccionada.contactado_en) : '—' }}</p>
            <p class="sm:col-span-2"><span class="text-[#68736C] text-xs block font-semibold">Origen</span>{{ seleccionada.origen }}</p>
          </div>

          <div class="bg-gray-50 rounded-xl p-4 border border-[#DDE3DE]">
            <p class="text-xs font-bold text-[#68736C] uppercase tracking-wide mb-2">Mensaje</p>
            <p class="text-sm text-[#202723] whitespace-pre-line">{{ seleccionada.mensaje }}</p>
          </div>

          <!-- Seguimiento -->
          <div class="border-t border-[#DDE3DE] pt-5 space-y-4">
            <p class="text-xs font-bold text-[#68736C] uppercase tracking-wide">Seguimiento</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-[#202723] mb-1">Estatus</label>
                <select v-model="formSeguimiento.estatus"
                  class="w-full px-3 py-2 border border-[#DDE3DE] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#245C4F] focus:outline-none">
                  <option v-for="e in ESTATUS" :key="e" :value="e">{{ etiquetaEstatus(e) }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#202723] mb-1">Asignado a</label>
                <input v-model="formSeguimiento.asignado_a" type="text" maxlength="120" placeholder="Nombre del asesor"
                  class="w-full px-3 py-2 border border-[#DDE3DE] rounded-xl text-sm focus:ring-2 focus:ring-[#245C4F] focus:outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#202723] mb-1">Notas internas</label>
              <textarea v-model="formSeguimiento.notas_internas" rows="3" maxlength="5000"
                placeholder="Acuerdos, resultados de la llamada, siguiente paso…"
                class="w-full px-3 py-2 border border-[#DDE3DE] rounded-xl text-sm resize-y focus:ring-2 focus:ring-[#245C4F] focus:outline-none"></textarea>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 p-6 border-t border-[#DDE3DE]">
          <button @click="cerrarDetalle"
            class="px-4 py-2 text-sm font-semibold text-[#68736C] bg-gray-100 rounded-xl hover:bg-gray-200 transition">Cerrar</button>
          <button @click="guardarSeguimiento" :disabled="guardando"
            class="px-4 py-2 text-sm font-bold text-white bg-[#245C4F] rounded-xl hover:bg-[#1D4A3F] transition disabled:opacity-50">
            {{ guardando ? 'Guardando…' : 'Guardar seguimiento' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '@/utils/apiClient'

const route = useRoute()
const router = useRouter()

// ── CATÁLOGOS ──────────────────────────────────────────────
const ESTATUS = ['nuevo', 'asignado', 'contactado', 'calificado', 'descartado', 'convertido']

const ETIQUETAS_ESTATUS = {
  nuevo: 'Nuevo', asignado: 'Asignado', contactado: 'Contactado',
  calificado: 'Calificado', descartado: 'Descartado', convertido: 'Convertido',
}
const COLORES_ESTATUS = {
  nuevo: 'bg-blue-100 text-blue-700',
  asignado: 'bg-emerald-100 text-[#245C4F]',
  contactado: 'bg-amber-100 text-amber-700',
  calificado: 'bg-emerald-100 text-emerald-700',
  descartado: 'bg-gray-200 text-gray-600',
  convertido: 'bg-purple-100 text-purple-700',
}
const MEDIOS = { telefono: 'Llamada', whatsapp: 'WhatsApp', email: 'Correo' }
const HORARIOS = { cualquiera: 'Cualquier horario', manana: '9:00 a 13:00', tarde: '13:00 a 18:00' }

const etiquetaEstatus = (e) => ETIQUETAS_ESTATUS[e] || e || '—'
const colorEstatus = (e) => COLORES_ESTATUS[e] || 'bg-gray-100 text-gray-600'
const etiquetaMedio = (m) => MEDIOS[m] || m || '—'
const etiquetaHorario = (h) => HORARIOS[h] || h || '—'

// ── ESTADO ─────────────────────────────────────────────────
const solicitudes   = ref([])
const resumen       = ref({ total: 0, por_estatus: {}, ultimos_7_dias: 0 })
const loading       = ref({ lista: false, resumen: false })
const guardando     = ref(false)
const detalleVisible = ref(false)
const seleccionada  = ref(null)
const toasts        = ref([])

const pagination = ref({ current_page: 1, per_page: 20, total: 0, last_page: 1 })

// El panel se puede abrir ya filtrado: /panel/contactos?estatus=nuevo
const estatusInicialDeQuery = () => {
  const valor = route.query.estatus
  return typeof valor === 'string' && ESTATUS.includes(valor) ? valor : ''
}

const filtros = reactive({
  buscar: '', estatus: estatusInicialDeQuery(), tipo_contacto: '', per_page: 20,
})

const formSeguimiento = reactive({
  estatus: 'nuevo', asignado_a: '', notas_internas: '',
})

// ── HELPERS ────────────────────────────────────────────────
const formatFecha = (fecha) => {
  if (!fecha) return '—'
  const d = new Date(String(fecha).replace(' ', 'T'))
  return isNaN(d.getTime()) ? String(fecha) : d.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
}

const showToast = (message, type = 'success') => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), 4000)
}
const removeToast = (id) => { toasts.value = toasts.value.filter(t => t.id !== id) }

// ── COMPUTED ───────────────────────────────────────────────
const kpis = computed(() => {
  const porEstatus = resumen.value.por_estatus || {}
  return [
    { key: '', label: 'Total', total: resumen.value.total || 0 },
    ...ESTATUS.map(e => ({ key: e, label: etiquetaEstatus(e), total: porEstatus[e] || 0 })),
  ]
})

// ── CARGA DE DATOS ─────────────────────────────────────────
const cargarSolicitudes = async (pagina = 1) => {
  loading.value.lista = true
  try {
    const res = await apiClient.get('/contactos', {
      params: {
        page: pagina,
        per_page: filtros.per_page,
        buscar: filtros.buscar || undefined,
        estatus: filtros.estatus || undefined,
        tipo_contacto: filtros.tipo_contacto || undefined,
      },
    })
    solicitudes.value = res.data || []
    pagination.value = res.pagination || pagination.value
  } catch (e) {
    showToast(e?.response?.data?.message || 'No se pudieron cargar las solicitudes', 'error')
  } finally {
    loading.value.lista = false
  }
}

const cargarResumen = async () => {
  loading.value.resumen = true
  try {
    const res = await apiClient.get('/contactos/resumen')
    resumen.value = res.data || resumen.value
  } catch (e) {
    showToast(e?.response?.data?.message || 'No se pudo cargar el resumen', 'error')
  } finally {
    loading.value.resumen = false
  }
}

const cargarTodo = () => Promise.all([cargarSolicitudes(pagination.value.current_page), cargarResumen()])

// Refleja el estatus activo en la URL para poder compartir/enlazar la vista filtrada
const sincronizarQuery = () => {
  if (String(route.query.estatus ?? '') === (filtros.estatus ?? '')) return
  const query = { ...route.query }
  if (filtros.estatus) query.estatus = filtros.estatus
  else delete query.estatus
  router.replace({ query })
}

const buscarDesdeCero = () => {
  sincronizarQuery()
  cargarSolicitudes(1)
}

// Si se cambia el filtro desde fuera (p. ej. clic en el badge del sidebar)
watch(() => route.query.estatus, (valor) => {
  const estatus = typeof valor === 'string' && ESTATUS.includes(valor) ? valor : ''
  if (estatus === filtros.estatus) return
  filtros.estatus = estatus
  cargarSolicitudes(1)
})
const cambiarPagina = (pagina) => cargarSolicitudes(pagina)
const filtrarPorEstatus = (estatus) => {
  filtros.estatus = filtros.estatus === estatus ? '' : estatus
  buscarDesdeCero()
}

// ── DETALLE / SEGUIMIENTO ──────────────────────────────────
const abrirDetalle = (solicitud) => {
  seleccionada.value = { ...solicitud }
  formSeguimiento.estatus = solicitud.estatus || 'nuevo'
  formSeguimiento.asignado_a = solicitud.asignado_a || ''
  formSeguimiento.notas_internas = solicitud.notas_internas || ''
  detalleVisible.value = true
}

const cerrarDetalle = () => {
  detalleVisible.value = false
  seleccionada.value = null
}

const guardarSeguimiento = async () => {
  if (!seleccionada.value) return
  guardando.value = true
  try {
    const res = await apiClient.patch(`/contactos/${seleccionada.value.id}`, {
      estatus: formSeguimiento.estatus,
      asignado_a: formSeguimiento.asignado_a || null,
      notas_internas: formSeguimiento.notas_internas || null,
    })
    showToast(res?.message || 'Solicitud actualizada')
    cerrarDetalle()
    await cargarTodo()
  } catch (e) {
    const errores = e?.response?.data?.errors
    const primerError = errores ? Object.values(errores)[0]?.[0] : null
    showToast(primerError || e?.response?.data?.message || 'No se pudo actualizar la solicitud', 'error')
  } finally {
    guardando.value = false
  }
}

onMounted(cargarTodo)
</script>
