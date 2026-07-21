<template>
  <div class="p-6 space-y-6">
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
        <span class="text-lg">
          {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️' }}
        </span>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>
    </div>
    <!-- Header -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Panel de Plataforma</h1>
        <p class="text-gray-500 text-sm">Gestión global de propietarios y restaurantes</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="bg-indigo-50 p-3 rounded-lg flex items-center gap-3 border border-indigo-100">
          <div class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
            {{ stats.total_propietarios || 0 }}
          </div>
          <div>
            <p class="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Propietarios</p>
            <p class="text-sm font-bold text-indigo-900">Registrados</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="(val, label) in formattedStats" :key="label" 
           class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <p class="text-sm text-gray-500 font-medium capitalize">{{ label.replace('_', ' ') }}</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">{{ val }}</p>
      </div>
    </div>

    <!-- Main Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-800">Directorio de Propietarios</h2>
        <div class="relative">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Buscar por nombre o correo..." 
            class="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64"
          >
          <span class="absolute left-3 top-2.5 text-gray-400 italic">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
              <th class="px-6 py-4 font-semibold">Propietario</th>
              <th class="px-6 py-4 font-semibold">Datos Fiscales</th>
              <th class="px-6 py-4 font-semibold text-center">Restaurantes</th>
              <th class="px-6 py-4 font-semibold text-center">Usuarios / Empleados</th>
              <th class="px-6 py-4 font-semibold">Licencia Actual</th>
              <th class="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr v-for="prop in filteredPropietarios" :key="prop.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold">
                    {{ prop.nombre_completo.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-bold text-gray-800">{{ prop.nombre_completo }}</p>
                    <p class="text-xs text-gray-500">{{ prop.correo }}</p>
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
                  <span class="text-[11px] text-gray-400 font-semibold mt-1.5 uppercase tracking-wide">
                    Límite: {{ prop.licencia_actual?.max_restaurantes ?? 1 }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex flex-col items-center">
                  <span class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                    {{ prop.total_usuarios ?? 0 }} {{ prop.total_usuarios === 1 ? 'usuario' : 'usuarios' }}
                  </span>
                  <span class="text-[11px] text-gray-400 font-semibold mt-1.5 uppercase tracking-wide">
                    Límite: {{ prop.licencia_actual?.max_usuarios ?? 5 }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div v-if="prop.licencia_actual" class="flex flex-col">
                  <div class="flex items-center gap-1.5">
                    <span :class="prop.licencia_actual.estado === 'ACTIVA' ? 'text-indigo-600 font-bold' : 'text-red-500 font-bold'">
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
                  class="text-amber-600 hover:text-amber-900 font-semibold text-xs bg-amber-50 px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  Editar Licencia
                </button>
                <button 
                  @click="selectedPropietario = prop"
                  class="text-indigo-600 hover:text-indigo-900 font-semibold text-xs bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Ver Restaurantes
                </button>
                <button 
                  @click="deletePropietario(prop)"
                  class="text-red-600 hover:text-red-900 font-semibold text-xs bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Restaurantes -->
    <div v-if="selectedPropietario" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
          <div>
            <h3 class="text-xl font-bold">Restaurantes de {{ selectedPropietario.nombre_completo }}</h3>
            <p class="text-indigo-100 text-sm">Listado detallado y ubicación</p>
          </div>
          <button @click="selectedPropietario = null" class="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto space-y-4 bg-gray-50 flex-1">
          <div v-if="selectedPropietario.restaurantes.length === 0" class="text-center py-12">
            <p class="text-gray-400 italic">Este propietario aún no tiene restaurantes registrados.</p>
          </div>
          
          <div v-for="res in selectedPropietario.restaurantes" :key="res.id" 
               class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 hover:border-indigo-200 transition-colors">
            <div class="flex-1 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-lg font-bold text-gray-800">{{ res.nombre }}</h4>
                <div class="flex items-center gap-2">
                  <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">ID: #{{ res.id }}</span>
                  <button 
                    @click="deleteRestaurante(res)"
                    class="bg-red-50 text-red-500 p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                    title="Eliminar Restaurante"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div class="flex items-start gap-2 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>{{ res.ubicacion }}</p>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p>{{ res.telefono || 'Sin teléfono' }}</p>
                </div>
              </div>
            </div>
            <div class="flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
              <a 
                :href="'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(res.nombre + ' ' + res.ubicacion)" 
                target="_blank"
                class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Ver en Maps
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div class="p-6 bg-gray-50 text-right">
          <button @click="selectedPropietario = null" class="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-sm text-sm">
            Cerrar Detalles
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación Premium -->
    <div v-if="confirmModal.show" class="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl transform transition-all scale-100 border border-gray-100">
        <div class="p-8 text-center">
          <!-- Icono de Advertencia -->
          <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 class="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">{{ confirmModal.title }}</h3>
          <p class="text-gray-500 text-sm leading-relaxed mb-8">
            {{ confirmModal.message }}
          </p>

          <div class="flex flex-col gap-3">
            <button 
              @click="confirmAction"
              :disabled="confirmModal.loading"
              class="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="confirmModal.loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ confirmModal.loading ? 'Procesando...' : confirmModal.confirmText }}
            </button>
            <button 
              @click="confirmModal.show = false"
              :disabled="confirmModal.loading"
              class="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Editar Licencia -->
    <div v-if="editLicenciaModal.show" class="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div class="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-gray-100">
        <div class="p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Editar Licencia</h3>
            <button @click="editLicenciaModal.show = false" class="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p class="text-sm text-gray-500 mb-6">
            Propietario: <span class="font-semibold text-gray-800">{{ editLicenciaModal.propietario_nombre }}</span>
            <br>
            Licencia: <span class="font-semibold text-gray-800">{{ editLicenciaModal.licencia_nombre }}</span>
          </p>

          <div class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Fecha de Inicio</label>
              <input
                v-model="editLicenciaModal.fecha_inicio"
                type="date"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Fecha de Expiración</label>
              <input
                v-model="editLicenciaModal.fecha_expiracion"
                type="date"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex flex-col gap-3 mt-8">
            <button
              @click="updateLicencia"
              :disabled="editLicenciaModal.loading"
              class="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="editLicenciaModal.loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ editLicenciaModal.loading ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
            <button
              @click="editLicenciaModal.show = false"
              :disabled="editLicenciaModal.loading"
              class="w-full py-3 bg-gray-50 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all"
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
    fecha_inicio: lic.inicio ? lic.inicio.slice(0, 10) : '',
    fecha_expiracion: lic.expira ? lic.expira.slice(0, 10) : ''
  };
};

const updateLicencia = async () => {
  if (!editLicenciaModal.value.id) return;
  try {
    editLicenciaModal.value.loading = true;
    const body = {};
    if (editLicenciaModal.value.fecha_inicio) body.fecha_inicio = editLicenciaModal.value.fecha_inicio;
    if (editLicenciaModal.value.fecha_expiracion) body.fecha_expiracion = editLicenciaModal.value.fecha_expiracion;
    const res = await apiClient.put(`/propietario-licencias/${editLicenciaModal.value.id}`, body);
    if (res.success) {
      showToast('Licencia actualizada correctamente', 'success');
      editLicenciaModal.value.show = false;
      fetchPlataformaData();
    } else {
      showToast(res.message || 'Error al actualizar la licencia', 'error');
    }
  } catch (error) {
    showToast(error.message || 'Error al actualizar la licencia', 'error');
  } finally {
    editLicenciaModal.value.loading = false;
  }
};

const fetchPlataformaData = async () => {
  try {
    loading.value = true;
    const [resProps, resStats] = await Promise.all([
      apiClient.get('/plataforma/propietarios'),
      apiClient.get('/plataforma/stats')
    ]);
    
    if (resProps.success) propietarios.value = resProps.data;
    if (resStats.success) stats.value = resStats.data;
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
