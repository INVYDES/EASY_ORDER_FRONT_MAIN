<template>
  <div class="space-y-6">
    <!-- Configuración Global de Mesas -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl">
          🪑
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900">Capacidad del Restaurante</h3>
          <p class="text-sm text-gray-500">Define cuántas mesas físicas tiene este establecimiento</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <input 
            v-model.number="totalMesas" 
            type="number" 
            min="0" 
            max="500"
            class="w-32 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <span class="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">MESAS</span>
        </div>
        <button 
          @click="saveTotalMesas"
          :disabled="loading.savingConfig"
          class="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ loading.savingConfig ? 'Guardando...' : 'Actualizar' }}
        </button>
      </div>
    </div>

    <!-- Tabla de Meseros -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 class="font-bold text-gray-900 text-lg">Asignación de Meseros</h3>
        <span class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
          {{ meseros.length }} Meseros registrados
        </span>
      </div>

      <div v-if="loading.meseros" class="py-20 text-center">
        <div class="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-400 font-medium">Obteniendo personal...</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50/50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mesero</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mesas Asignadas</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="mesero in meseros" :key="mesero.id" class="hover:bg-gray-50/80 transition">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {{ getInitials(mesero.name) }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-900">{{ mesero.name }}</p>
                    <p class="text-xs text-gray-500">@{{ mesero.username }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1.5">
                  <template v-if="mesero.mesas && mesero.mesas.length">
                    <span v-for="mesa in mesero.mesas" :key="mesa" 
                      class="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-xs font-bold shadow-sm">
                      Mesa {{ mesa }}
                    </span>
                  </template>
                  <span v-else class="text-xs text-gray-400 italic">Sin mesas asignadas</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <button 
                  @click="openAssignModal(mesero)"
                  class="px-4 py-2 bg-white border border-gray-200 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition shadow-sm"
                >
                  ⚙️ Gestionar Mesas
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Asignación -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-modal-in">
        <div class="p-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold">Asignar Mesas</h3>
            <p class="text-indigo-100 text-sm">Mesero: {{ selectedMesero?.name }}</p>
          </div>
          <button @click="showModal = false" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">✕</button>
        </div>
        
        <div class="p-8">
          <div class="mb-6 flex items-center justify-between bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <div class="flex items-center gap-3 text-amber-800 text-sm">
              <span>⚠️</span>
              <p>Puedes seleccionar hasta la mesa <strong>{{ totalMesas }}</strong></p>
            </div>
            <button @click="clearSelections" class="text-xs font-bold text-amber-700 hover:underline">Limpiar todo</button>
          </div>

          <div class="grid grid-cols-5 sm:grid-cols-8 gap-3 max-h-80 overflow-y-auto p-2 custom-scroll">
            <button 
              v-for="n in totalMesas" 
              :key="n"
              @click="toggleMesa(n)"
              :class="[
                'aspect-square rounded-2xl flex items-center justify-center text-sm font-bold transition-all transform active:scale-95',
                selectedMesas.includes(n) 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 border border-gray-100'
              ]"
            >
              {{ n }}
            </button>
          </div>

          <div v-if="totalMesas === 0" class="py-10 text-center text-gray-400 italic">
            Primero define el número total de mesas en la parte superior.
          </div>
        </div>

        <div class="p-6 bg-gray-50 flex gap-3">
          <button @click="showModal = false" class="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition">Cancelar</button>
          <button 
            @click="saveAssignments" 
            :disabled="loading.saving"
            class="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {{ loading.saving ? 'Guardando cambios...' : 'Confirmar Asignación' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Notificación Toast Simple -->
    <div v-if="toast.show" class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up">
      <span>{{ toast.type === 'success' ? '✅' : '❌' }}</span>
      <p class="text-sm font-medium">{{ toast.msg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { API_URL } from '@/config/api'

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
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  const restId = localStorage.getItem('restaurante_id_activo')
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
    const res = await fetch(`${API_URL}/meseros`, { headers: getHeaders() })
    const r = await res.json()
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
    const res = await fetch(`${API_URL}/meseros/config-mesas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ total_mesas: totalMesas.value })
    })
    const r = await res.json()
    if (r.success) {
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
    const res = await fetch(`${API_URL}/meseros/asignar-mesas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        user_id: selectedMesero.value.id,
        rol_id: selectedMesero.value.rol_id || 3, // Fallback a 3 si no viene
        mesas: selectedMesas.value
      })
    })
    const r = await res.json()
    if (r.success) {
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
