<template>
  <div class="space-y-6">
    <!-- Configuración Global de Mesas -->
    <div class="bg-white p-5 rounded-xl shadow-xs border border-[#DDE3DE] flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 bg-[#E8F1ED] text-[#245C4F] rounded-lg flex items-center justify-center text-base shrink-0">
          <i class="fa-solid fa-chair"></i>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-[#202723]">Capacidad del Restaurante</h3>
          <p class="text-xs text-[#68736C] mt-0.5">Define cuántas mesas físicas tiene este establecimiento</p>
        </div>
      </div>
      <div class="flex items-center gap-2.5">
        <div class="relative">
          <input 
            v-model.number="totalMesas" 
            type="number" 
            min="0" 
            max="500"
            class="w-28 px-3 py-1.5 bg-[#F6F7F5] border border-[#DDE3DE] rounded-lg text-center text-xs font-semibold text-[#202723] focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none"
          />
          <span class="absolute -top-2 -right-2 bg-[#245C4F] text-white text-[9px] px-1.5 py-0.2 rounded font-semibold">MESAS</span>
        </div>
        <button 
          @click="saveTotalMesas"
          :disabled="loading.savingConfig"
          class="px-4 py-1.5 bg-[#245C4F] text-white text-xs font-semibold rounded-lg hover:bg-[#19483D] transition disabled:opacity-50 shadow-xs cursor-pointer"
        >
          {{ loading.savingConfig ? 'Guardando...' : 'Actualizar' }}
        </button>
      </div>
    </div>

    <!-- Tabla de Meseros -->
    <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] overflow-hidden">
      <div class="px-5 py-3.5 border-b border-[#DDE3DE] bg-[#F6F7F5] flex items-center justify-between">
        <h3 class="font-semibold text-[#202723] text-sm">Asignación de Meseros</h3>
        <span class="px-2.5 py-0.5 bg-[#E8F1ED] text-[#245C4F] text-xs font-medium rounded-full">
          {{ meseros.length }} Meseros registrados
        </span>
      </div>

      <div v-if="loading.meseros" class="py-16 text-center">
        <div class="w-8 h-8 border-4 border-[#E8F1ED] border-t-[#245C4F] rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-[#68736C] text-xs font-medium">Obteniendo personal...</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-[#DDE3DE]">
          <thead class="bg-[#F0F2EF]">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Mesero</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Estado</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Mesas Asignadas</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-[#68736C] uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#DDE3DE]">
            <tr v-for="mesero in meseros" :key="mesero.id" class="hover:bg-[#F6F7F5] transition-colors">
              <td class="px-5 py-3.5 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center font-semibold text-xs shrink-0">
                    {{ getInitials(mesero.name) }}
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-[#202723]">{{ mesero.name }}</p>
                    <p class="text-[11px] text-[#68736C]">@{{ mesero.username }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" :checked="mesero.es_activo !== false" @change="toggleEstadoEmpleado(mesero)" class="sr-only peer">
                    <div class="w-9 h-5 bg-[#DDE3DE] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DDE3DE] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#26734D]"></div>
                  </label>
                  <span :class="['text-[11px] font-semibold uppercase w-12', mesero.es_activo !== false ? 'text-[#26734D]' : 'text-[#B93838]']">
                    {{ mesero.es_activo !== false ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex flex-wrap gap-1.5">
                  <template v-if="mesero.mesas && mesero.mesas.length">
                    <span v-for="mesa in mesero.mesas" :key="mesa" 
                      class="px-2 py-0.5 bg-[#E8F1ED] text-[#245C4F] border border-[#245C4F]/20 rounded text-xs font-medium">
                      Mesa {{ mesa }}
                    </span>
                  </template>
                  <span v-else class="text-xs text-[#68736C] italic">Sin mesas asignadas</span>
                </div>
              </td>
              <td class="px-5 py-3.5 text-right">
                <button 
                  @click="openAssignModal(mesero)"
                  class="px-2.5 py-1 bg-[#E8F1ED] text-[#245C4F] text-xs font-semibold rounded-md hover:bg-[#245C4F] hover:text-white transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <i class="fa-solid fa-pen-to-square text-[11px]"></i> Asignar Mesas
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Asignación -->
    <div v-if="showModal" class="fixed inset-0 bg-[#202723]/50 z-[60] flex items-center justify-center p-4"
      @click.self="showModal = false">
      <div class="bg-white rounded-xl shadow-xl border border-[#DDE3DE] w-full max-w-xl overflow-hidden">
        <div class="p-5 bg-[#F6F7F5] border-b border-[#DDE3DE] flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-[#202723]">Asignar Mesas</h3>
            <p class="text-xs text-[#68736C] mt-0.5">Mesero: <strong class="text-[#202723]">{{ selectedMesero?.name }}</strong></p>
          </div>
          <button @click="showModal = false" class="w-7 h-7 rounded-lg text-[#68736C] hover:text-[#202723] hover:bg-[#F0F2EF] flex items-center justify-center text-sm transition cursor-pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-4 flex items-center justify-between bg-[#FEF7EC] p-3 rounded-lg border border-[#A96517]/20">
            <div class="flex items-center gap-2 text-[#A96517] text-xs">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <p>Puedes seleccionar hasta la mesa <strong>{{ totalMesas }}</strong></p>
            </div>
            <button @click="clearSelections" class="text-xs font-semibold text-[#A96517] hover:underline cursor-pointer">Limpiar todo</button>
          </div>

          <div class="grid grid-cols-5 sm:grid-cols-8 gap-2 max-h-72 overflow-y-auto p-1 custom-scroll">
            <button 
              v-for="n in totalMesas" 
              :key="n"
              @click="toggleMesa(n)"
              :class="[
                'aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition cursor-pointer',
                selectedMesas.includes(n) 
                  ? 'bg-[#245C4F] text-white shadow-xs' 
                  : 'bg-white text-[#68736C] hover:bg-[#F6F7F5] border border-[#DDE3DE]'
              ]"
            >
              {{ n }}
            </button>
          </div>

          <div v-if="totalMesas === 0" class="py-8 text-center text-[#68736C] text-xs italic">
            Primero define el número total de mesas en la parte superior.
          </div>
        </div>

        <div class="p-4 bg-[#F6F7F5] border-t border-[#DDE3DE] flex gap-2.5">
          <button @click="showModal = false" class="flex-1 py-2 bg-[#F0F2EF] border border-[#DDE3DE] text-[#202723] font-semibold text-xs rounded-lg hover:bg-[#DDE3DE] transition cursor-pointer">Cancelar</button>
          <button 
            @click="saveAssignments" 
            :disabled="loading.saving"
            class="flex-[2] py-2 bg-[#245C4F] text-white font-semibold text-xs rounded-lg hover:bg-[#19483D] transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {{ loading.saving ? 'Guardando cambios...' : 'Confirmar Asignación' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Notificación Toast Simple -->
    <div v-if="toast.show" class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 bg-white border border-[#DDE3DE] text-[#202723] rounded-lg shadow-lg flex items-center gap-2.5">
      <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check text-[#26734D]' : 'fa-solid fa-circle-xmark text-[#B93838]'"></i>
      <p class="text-xs font-medium">{{ toast.msg }}</p>
    </div>
  </div>
</template>

<script setup>
import { sessionGet, sessionSet, sessionRemove } from '@/utils/session'
import { ref, onMounted, reactive } from 'vue'
import { API_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'

// --- Props / Emits si fueran necesarios ---

// --- Estado ---
const totalMesas = ref(0)
const meseros = ref([])
const showModal = ref(false)
const selectedMesero = ref(null)
const selectedMesas = ref([])
const loading = reactive({
  meseros: true,
  saving: false,
  savingConfig: false
})
const toast = reactive({ show: false, msg: '', type: 'success' })

// --- Helpers ---
const getHeaders = () => {
  const token = sessionGet('token')
  const restId = sessionGet('restaurante_id_activo')
  return { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json', 
    'Authorization': token ? `Bearer ${token}` : '',
    'X-Restaurante-Id': restId || ''
  }
}

// Escuchar cambios de sucursal (como en la marquesita)
onMounted(() => {
  loadMeserosData()
  window.addEventListener('storage', (e) => {
    if (e.key === 'restaurante_id_activo') loadMeserosData()
  })
})

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

const showNotify = (msg, type = 'success') => {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => toast.show = false, 3000)
}

// --- Acciones ---
const loadMeserosData = async () => {
  loading.meseros = true
  try {
    const r = await apiClient.get('/meseros')
      if (r.success) {
        meseros.value = r.data.meseros
        totalMesas.value = r.data.total_mesas
      }
  } catch (err) {
    console.error('Error cargando meseros:', err)
  } finally {
    loading.meseros = false
  }
}

const saveTotalMesas = async () => {
  loading.savingConfig = true
  try {
    const r = await apiClient.post('/meseros/config-mesas', { total_mesas: totalMesas.value })
    if (r?.success) {
      showNotify('Capacidad del restaurante actualizada', 'success')
    } else {
      showNotify(r.message || 'Error al actualizar', 'error')
    }
  } catch (err) {
    showNotify('Error de conexión', 'error')
  } finally {
    loading.savingConfig = false
  }
}

const openAssignModal = (mesero) => {
  selectedMesero.value = mesero
  selectedMesas.value = [...(mesero.mesas || [])]
  showModal.value = true
}

const toggleMesa = (n) => {
  const idx = selectedMesas.value.indexOf(n)
  if (idx === -1) selectedMesas.value.push(n)
  else selectedMesas.value.splice(idx, 1)
  selectedMesas.value.sort((a,b) => a - b)
}

const clearSelections = () => { selectedMesas.value = [] }

const saveAssignments = async () => {
  if (!selectedMesero.value) return
  loading.saving = true
  try {
    const r = await apiClient.post('/meseros/asignar-mesas', {
      user_id: selectedMesero.value.id,
      rol_id: selectedMesero.value.rol_id || 3,
      mesas: selectedMesas.value
    })
    if (r?.success) {
      showNotify('Mesas asignadas con éxito')
      showModal.value = false
      // Actualizar localmente
      const idx = meseros.value.findIndex(m => m.id === selectedMesero.value.id)
      if (idx !== -1) meseros.value[idx].mesas = [...selectedMesas.value]
    } else {
      showNotify(r.message || 'Error al guardar', 'error')
    }
  } catch (err) {
    showNotify('Error de conexión', 'error')
  } finally {
    loading.saving = false
  }
}

const toggleEstadoEmpleado = async (emp) => {
  const nuevoEstado = emp.es_activo === false ? true : false
  try {
    const r = await apiClient.put(`/users/${emp.id}`, { es_activo: nuevoEstado })
    if (r?.success) {
      emp.es_activo = nuevoEstado
      showNotify(`Mesero ${nuevoEstado ? 'activado' : 'desactivado'}`, 'success')
    } else {
      showNotify(r.message || 'Error al cambiar estado', 'error')
    }
  } catch (err) {
    showNotify('Error de conexión', 'error')
  }
}

onMounted(loadMeserosData)
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
.custom-scroll::-webkit-scrollbar-thumb:hover { background: #ccc; }

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-modal-in { animation: modalIn 0.3s ease-out; }

@keyframes slideUp {
  from { transform: translate(-50%, 100%); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}
.animate-slide-up { animation: slideUp 0.3s ease-out; }
</style>
