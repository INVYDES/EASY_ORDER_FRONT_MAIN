<template>
  <div class="space-y-6">
    <!-- Toasts -->
    <div class="fixed top-4 right-4 z-[200] space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] max-w-md',
          toast.type === 'success' ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800' : '',
          toast.type === 'error'   ? 'bg-red-50 border-l-4 border-red-500 text-red-800'             : '',
          toast.type === 'info'    ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-800'           : '',
          toast.type === 'warning' ? 'bg-amber-50 border-l-4 border-amber-500 text-amber-800'        : '',
        ]"
      >
        <i
          :class="[
            'text-lg',
            toast.type === 'success' ? 'fa-solid fa-circle-check text-emerald-600' :
            toast.type === 'error'   ? 'fa-solid fa-circle-xmark text-red-600' :
            toast.type === 'warning' ? 'fa-solid fa-triangle-exclamation text-amber-600' :
                                       'fa-solid fa-circle-info text-blue-600'
          ]"
        ></i>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>
    </div>

    <!-- Header Sticky -->
    <header class="sticky -top-4 lg:-top-8 z-20 bg-gray-50/95 backdrop-blur-xs -mx-4 lg:-mx-8 px-4 lg:px-8 pt-4 lg:pt-8 pb-3 border-b border-[#DDE3DE] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#202723]">Panel de Plataforma</h1>
        <p class="text-[#68736C] text-sm">Gestión global de propietarios y restaurantes</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="bg-[#E8F1ED] p-3 rounded-xl flex items-center gap-3 border border-[#245C4F]/20">
          <div class="w-10 h-10 bg-[#245C4F] rounded-xl flex items-center justify-center text-white font-bold">
            {{ stats.total_propietarios || 0 }}
          </div>
          <div>
            <p class="text-xs text-[#245C4F] font-bold uppercase tracking-wider">Propietarios</p>
            <p class="text-sm font-bold text-[#202723]">Registrados</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="(val, label) in formattedStats" :key="label" 
           class="bg-white p-6 rounded-2xl shadow-xs border border-[#DDE3DE] hover:shadow-md transition-shadow">
        <p class="text-sm text-[#68736C] font-semibold capitalize">{{ label.replace('_', ' ') }}</p>
        <p class="text-3xl font-black text-[#202723] mt-2">{{ val }}</p>
      </div>
    </div>

    <!-- Main Table -->
    <div class="bg-white rounded-2xl shadow-xs border border-[#DDE3DE] overflow-hidden">
      <div class="p-6 border-b border-[#DDE3DE] flex items-center justify-between">
        <h2 class="text-lg font-bold text-[#202723]">Directorio de Propietarios</h2>
        <div class="relative">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Buscar por nombre o correo..." 
            class="pl-9 pr-4 py-2 bg-gray-50 border border-[#DDE3DE] rounded-xl text-sm focus:ring-2 focus:ring-[#245C4F] focus:outline-none w-64"
          >
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-xs text-gray-400"></i>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 text-[#68736C] text-xs uppercase tracking-wider border-b border-[#DDE3DE]">
              <th class="px-6 py-4 font-bold">Propietario</th>
              <th class="px-6 py-4 font-bold">Datos Fiscales</th>
              <th class="px-6 py-4 font-bold text-center">Restaurantes</th>
              <th class="px-6 py-4 font-bold text-center">Usuarios / Empleados</th>
              <th class="px-6 py-4 font-bold">Licencia Actual</th>
              <th class="px-6 py-4 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#DDE3DE] text-sm">
            <tr v-for="prop in filteredPropietarios" :key="prop.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#E8F1ED] rounded-xl flex items-center justify-center text-[#245C4F] font-bold">
                    {{ prop.nombre_completo.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-bold text-[#202723]">{{ prop.nombre_completo }}</p>
                    <p class="text-xs text-[#68736C]">{{ prop.correo }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div v-if="prop.rfc" class="space-y-1">
                  <p class="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700 inline-block">{{ prop.rfc }}</p>
                  <p class="text-[10px] text-gray-400 uppercase font-semibold">{{ prop.regimen_fiscal || 'Sin régimen' }}</p>
                </div>
                <span v-else class="text-gray-400 italic text-xs">No registrado</span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex flex-col items-center">
                  <span class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                    {{ prop.total_restaurantes }} {{ prop.total_restaurantes === 1 ? 'creado' : 'creados' }}
                  </span>
                  <span class="text-[11px] text-[#68736C] font-semibold mt-1.5 uppercase tracking-wide">
                    Límite: {{ prop.licencia_actual?.max_restaurantes ?? 1 }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex flex-col items-center">
                  <span class="bg-[#E8F1ED] text-[#245C4F] px-3 py-1 rounded-full text-xs font-bold border border-[#245C4F]/20">
                    {{ prop.total_usuarios ?? 0 }} {{ prop.total_usuarios === 1 ? 'usuario' : 'usuarios' }}
                  </span>
                  <span class="text-[11px] text-[#68736C] font-semibold mt-1.5 uppercase tracking-wide">
                    Límite: {{ prop.licencia_actual?.max_usuarios ?? 5 }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div v-if="prop.licencia_actual" class="flex flex-col">
                  <div class="flex items-center gap-1.5">
                    <span :class="prop.licencia_actual.estado === 'ACTIVA' ? 'text-[#245C4F] font-bold' : 'text-red-500 font-bold'">
                      {{ prop.licencia_actual.nombre }}
                    </span>
                    <span v-if="prop.licencia_actual.estado !== 'ACTIVA'" class="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[9px] font-black uppercase">
                      {{ prop.licencia_actual.estado }}
                    </span>
                  </div>
                  <span class="text-[10px] text-gray-400 italic">Inicio: {{ formatDate(prop.licencia_actual.inicio) }}</span>
                  <span class="text-[10px] text-gray-400 italic" :class="prop.licencia_actual.estado !== 'ACTIVA' ? 'text-red-400 font-semibold' : ''">
                    Expira: {{ formatDate(prop.licencia_actual.expira) }}
                  </span>
                </div>
                <span v-else class="text-red-400 text-xs font-medium">Sin licencia activa</span>
              </td>
              <td class="px-6 py-4 text-right flex items-center justify-end gap-2">
                <button
                  v-if="prop.licencia_actual"
                  @click="openEditLicencia(prop)"
                  class="text-amber-700 hover:text-amber-900 font-bold text-xs bg-amber-50 px-3 py-2 rounded-xl hover:bg-amber-100 transition-colors border border-amber-200/60"
                >
                  Editar Licencia
                </button>
                <button
                  v-else
                  @click="openAddLicencia(prop)"
                  class="text-emerald-700 hover:text-emerald-900 font-bold text-xs bg-emerald-50 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200/60"
                >
                  Asignar Licencia
                </button>
                <button 
                  @click="selectedPropietario = prop"
                  class="text-[#245C4F] hover:text-[#1D4A3F] font-bold text-xs bg-[#E8F1ED] px-3 py-2 rounded-xl hover:bg-[#245C4F] hover:text-white transition-colors border border-[#245C4F]/20"
                >
                  Ver Restaurantes
                </button>
                <button 
                  @click="deletePropietario(prop)"
                  class="text-red-600 hover:text-white hover:bg-[#B93838] font-bold text-xs bg-red-50 p-2 rounded-xl transition-colors border border-red-200"
                  title="Eliminar propietario"
                >
                  <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Restaurantes -->
    <div v-if="selectedPropietario" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-[#DDE3DE]">
        <div class="p-6 border-b border-[#DDE3DE] flex items-center justify-between bg-[#245C4F] text-white">
          <div>
            <h3 class="text-xl font-bold">Restaurantes de {{ selectedPropietario.nombre_completo }}</h3>
            <p class="text-emerald-100 text-sm">Listado detallado y ubicación</p>
          </div>
          <button @click="selectedPropietario = null" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto space-y-4 bg-gray-50 flex-1">
          <div v-if="selectedPropietario.restaurantes.length === 0" class="text-center py-12">
            <p class="text-gray-400 italic">Este propietario aún no tiene restaurantes registrados.</p>
          </div>
          
          <div v-for="res in selectedPropietario.restaurantes" :key="res.id" 
               class="bg-white p-5 rounded-2xl border border-[#DDE3DE] shadow-xs flex flex-col md:flex-row gap-6 hover:border-[#245C4F]/40 transition-colors">
            <div class="flex-1 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-lg font-bold text-[#202723]">{{ res.nombre }}</h4>
                <div class="flex items-center gap-2">
                  <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">ID: #{{ res.id }}</span>
                  <button 
                    @click="deleteRestaurante(res)"
                    class="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                    title="Eliminar Restaurante"
                  >
                    <i class="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div class="flex items-start gap-2 text-[#68736C]">
                  <i class="fa-solid fa-location-dot text-[#245C4F] shrink-0 mt-0.5"></i>
                  <p>{{ res.ubicacion }}</p>
                </div>
                <div class="flex items-center gap-2 text-[#68736C]">
                  <i class="fa-solid fa-phone text-[#245C4F] shrink-0"></i>
                  <p>{{ res.telefono || 'Sin teléfono' }}</p>
                </div>
              </div>
            </div>
            <div class="flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-[#DDE3DE] pt-4 md:pt-0 md:pl-6">
              <a 
                :href="'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(res.nombre + ' ' + res.ubicacion)" 
                target="_blank"
                class="bg-[#245C4F] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#1D4A3F] transition-colors shadow-xs"
              >
                <span>Ver en Maps</span>
                <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-gray-50 border-t border-[#DDE3DE] text-right">
          <button @click="selectedPropietario = null" class="px-6 py-2 bg-white border border-[#DDE3DE] text-[#202723] rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-xs text-sm">
            Cerrar Detalles
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación Premium -->
    <div v-if="confirmModal.show" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all scale-100 border border-[#DDE3DE]">
        <div class="p-8 text-center">
          <!-- Icono de Advertencia -->
          <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-200">
            <i class="fa-solid fa-triangle-exclamation text-2xl"></i>
          </div>
          
          <h3 class="text-xl font-black text-[#202723] mb-2 uppercase tracking-tight">{{ confirmModal.title }}</h3>
          <p class="text-[#68736C] text-sm leading-relaxed mb-6">
            {{ confirmModal.message }}
          </p>

          <div class="flex flex-col gap-2.5">
            <button 
              @click="confirmAction"
              :disabled="confirmModal.loading"
              class="w-full py-3 bg-[#B93838] text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="confirmModal.loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ confirmModal.loading ? 'Procesando...' : confirmModal.confirmText }}
            </button>
            <button 
              @click="confirmModal.show = false"
              :disabled="confirmModal.loading"
              class="w-full py-3 bg-gray-100 text-[#68736C] rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Editar/Asignar Licencia -->
    <div v-if="editLicenciaModal.show" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#DDE3DE]">
        <div class="p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-xl font-bold text-[#202723]">{{ editLicenciaModal.id ? 'Editar Licencia' : 'Asignar Licencia' }}</h3>
            <button @click="editLicenciaModal.show = false" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <p class="text-sm text-[#68736C] mb-5">
            Propietario: <span class="font-bold text-[#202723]">{{ editLicenciaModal.propietario_nombre }}</span>
            <br>
            Licencia actual: <span class="font-bold text-[#245C4F]">{{ editLicenciaModal.licencia_nombre }}</span>
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-[#202723] mb-1.5">Tipo de Licencia / Plan</label>
              <select
                v-model="editLicenciaModal.licencia_id"
                class="w-full px-3.5 py-2 bg-gray-50 border border-[#DDE3DE] rounded-xl text-sm focus:ring-2 focus:ring-[#245C4F] focus:outline-none"
              >
                <option v-for="lic in licencias" :key="lic.id" :value="lic.id">
                  {{ lic.nombre }} · {{ lic.tipo }} ({{ lic.max_restaurantes }} suc · {{ lic.max_usuarios }} usr)
                </option>
              </select>
              <p class="text-[10px] text-gray-400 mt-1">Selecciona el plan que tendrá el propietario</p>
            </div>
            <div>
              <label class="block text-xs font-bold text-[#202723] mb-1.5">Fecha de Inicio</label>
              <input
                v-model="editLicenciaModal.fecha_inicio"
                type="date"
                class="w-full px-3.5 py-2 bg-gray-50 border border-[#DDE3DE] rounded-xl text-sm focus:ring-2 focus:ring-[#245C4F] focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-[#202723] mb-1.5">Fecha de Expiración</label>
              <input
                v-model="editLicenciaModal.fecha_expiracion"
                type="date"
                class="w-full px-3.5 py-2 bg-gray-50 border border-[#DDE3DE] rounded-xl text-sm focus:ring-2 focus:ring-[#245C4F] focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-[#202723] mb-1.5">Estado de la Licencia</label>
              <select
                v-model="editLicenciaModal.estado"
                class="w-full px-3.5 py-2 bg-gray-50 border border-[#DDE3DE] rounded-xl text-sm focus:ring-2 focus:ring-[#245C4F] focus:outline-none"
              >
                <option value="CANCELADA">Cancelada</option>
                <option value="EXPIRADA">Expirada</option>
                <option value="PENDIENTE">Pendiente</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-2.5 mt-6">
            <button
              @click="updateLicencia"
              :disabled="editLicenciaModal.loading"
              class="w-full py-2.5 bg-[#245C4F] text-white rounded-xl font-bold text-sm hover:bg-[#1D4A3F] transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="editLicenciaModal.loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ editLicenciaModal.loading ? 'Guardando...' : (editLicenciaModal.id ? 'Guardar Cambios' : 'Asignar Licencia') }}
            </button>
            <button
              v-if="editLicenciaModal.id"
              @click="removeLicencia(editLicenciaModal.id)"
              class="w-full py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all border border-red-200"
            >
              Quitar Licencia
            </button>
            <button
              @click="editLicenciaModal.show = false"
              :disabled="editLicenciaModal.loading"
              class="w-full py-2.5 bg-gray-100 text-[#68736C] rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { apiClient } from '@/utils/apiClient';

const propietarios = ref([]);
const stats = ref({});
const licencias = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedPropietario = ref(null);
const toasts = ref([]);

const showToast = (message, type = 'info', duration = 5000) => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  if (duration > 0) setTimeout(() => removeToast(id), duration)
}

const removeToast = (id) => {
  const i = toasts.value.findIndex(t => t.id === id)
  if (i !== -1) toasts.value.splice(i, 1)
}

// Modal de Confirmación
const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  confirmText: 'Eliminar',
  action: null,
  loading: false
});

// Modal Editar Licencia
const editLicenciaModal = ref({
  show: false,
  loading: false,
  id: null,
  propietario_nombre: '',
  licencia_nombre: '',
  licencia_id: null,
  fecha_inicio: '',
  fecha_expiracion: ''
});

const openEditLicencia = (prop) => {
  const lic = prop.licencia_actual;
  editLicenciaModal.value = {
    show: true,
    loading: false,
    id: lic.id,
    propietario_nombre: prop.nombre_completo,
    licencia_nombre: lic.nombre || '',
    licencia_id: lic.licencia_id ?? lic.id,
    fecha_inicio: lic.inicio ? lic.inicio.slice(0, 10) : '',
    fecha_expiracion: lic.expira ? lic.expira.slice(0, 10) : '',
    estado: lic.estado || 'ACTIVA'
  };
};

const openAddLicencia = (prop) => {
  editLicenciaModal.value = {
    show: true,
    loading: false,
    id: null,
    propietario_id: prop.id,
    propietario_nombre: prop.nombre_completo,
    licencia_nombre: 'Ninguna',
    licencia_id: licencias.value[0]?.id || null,
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    estado: 'ACTIVA'
  };
};

const updateLicencia = async () => {
  try {
    editLicenciaModal.value.loading = true;
    const body = {};
    if (editLicenciaModal.value.licencia_id) body.licencia_id = editLicenciaModal.value.licencia_id;
    if (editLicenciaModal.value.fecha_inicio) body.fecha_inicio = editLicenciaModal.value.fecha_inicio;
    if (editLicenciaModal.value.fecha_expiracion) body.fecha_expiracion = editLicenciaModal.value.fecha_expiracion;
    if (editLicenciaModal.value.estado) body.estado = editLicenciaModal.value.estado;

    let res;
    if (editLicenciaModal.value.id) {
      res = await apiClient.put(`/propietario-licencias/${editLicenciaModal.value.id}`, body);
    } else {
      body.propietario_id = editLicenciaModal.value.propietario_id;
      res = await apiClient.post('/propietario-licencias', body);
    }

    if (res.success) {
      showToast(editLicenciaModal.value.id ? 'Licencia actualizada correctamente' : 'Licencia asignada correctamente', 'success');
      editLicenciaModal.value.show = false;
      fetchPlataformaData();
    } else {
      showToast(res.message || 'Error al guardar la licencia', 'error');
    }
  } catch (error) {
    showToast(error.message || 'Error al guardar la licencia', 'error');
  } finally {
    editLicenciaModal.value.loading = false;
  }
};

const removeLicencia = async (id) => {
  confirmModal.value = {
    show: true,
    title: '¿QUITAR LICENCIA?',
    message: `Esta acción ELIMINARÁ la asignación de licencia del propietario. El propietario quedará sin licencia activa.`,
    confirmText: 'Sí, quitar licencia',
    action: async () => {
      editLicenciaModal.value.show = false;
      const res = await apiClient.delete(`/propietario-licencias/${id}`);
      if (res.success) {
        showToast('Licencia quitada correctamente', 'success');
        fetchPlataformaData();
      } else {
        showToast(res.message || 'Error al quitar la licencia', 'error');
      }
    }
  };
};

const fetchPlataformaData = async () => {
  try {
    loading.value = true;
    const [resProps, resStats, resLicencias] = await Promise.all([
      apiClient.get('/plataforma/propietarios'),
      apiClient.get('/plataforma/stats'),
      apiClient.get('/licencias?per_page=100')
    ]);
    
    if (resProps.success) propietarios.value = resProps.data;
    if (resStats.success) stats.value = resStats.data;
    if (resLicencias.success) licencias.value = resLicencias.data;
  } catch (error) {
    console.error('Error fetching platform data:', error);
  } finally {
    loading.value = false;
  }
};

const filteredPropietarios = computed(() => {
  if (!searchQuery.value) return propietarios.value;
  const q = searchQuery.value.toLowerCase();
  return propietarios.value.filter(p => 
    p.nombre_completo.toLowerCase().includes(q) || 
    p.correo.toLowerCase().includes(q) ||
    (p.rfc && p.rfc.toLowerCase().includes(q))
  );
});

const formattedStats = computed(() => {
  const s = stats.value;
  return {
    'Total Propietarios': s.total_propietarios || 0,
    'Restaurantes': s.total_restaurantes || 0,
    'Licencias Activas': s.licencias_activas || 0,
    'Usuarios Totales': s.total_usuarios || 0
  };
});

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const deletePropietario = (prop) => {
  confirmModal.value = {
    show: true,
    title: '¿ELIMINAR PROPIETARIO?',
    message: `Esta acción ELIMINARÁ PERMANENTEMENTE al propietario "${prop.nombre_completo}", TODOS sus restaurantes y TODOS los datos históricos (ventas, productos, etc.). Esta acción NO se puede deshacer.`,
    confirmText: 'Si, eliminar todo',
    action: async () => {
      const res = await apiClient.delete(`/plataforma/propietarios/${prop.id}`);
      if (res.success) fetchPlataformaData();
    }
  };
};

const deleteRestaurante = (res) => {
  confirmModal.value = {
    show: true,
    title: '¿ELIMINAR RESTAURANTE?',
    message: `¿Eliminar el restaurante "${res.nombre}"? Se borrarán todos sus productos, ventas e historial permanentemente.`,
    confirmText: 'Si, borrar restaurante',
    action: async () => {
      const resp = await apiClient.delete(`/plataforma/restaurantes/${res.id}`);
      if (resp.success) {
        if (selectedPropietario.value) {
          selectedPropietario.value.restaurantes = selectedPropietario.value.restaurantes.filter(r => r.id !== res.id);
        }
        fetchPlataformaData();
      }
    }
  };
};

const confirmAction = async () => {
  if (!confirmModal.value.action) return;
  try {
    confirmModal.value.loading = true;
    await confirmModal.value.action();
    confirmModal.value.show = false;
  } catch (error) {
    alert('Error al procesar la acción: ' + (error.message || 'Error desconocido'));
  } finally {
    confirmModal.value.loading = false;
  }
};

onMounted(fetchPlataformaData);
</script>

<style scoped>
.shadow-indigo-200 {
  shadow-color: rgba(99, 102, 241, 0.2);
}
</style>
