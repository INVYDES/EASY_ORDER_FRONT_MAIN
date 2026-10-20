<template>
  <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-5">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="font-semibold text-[#202723] text-sm">Top Ventas</h3>
        <p class="text-xs text-[#68736C] mt-0.5">Platos con mayor demanda</p>
      </div>
      
      <div class="flex bg-[#F0F2EF] border border-[#DDE3DE] p-1 rounded-lg">
        <button v-for="p in periodos" :key="p.value" @click="setPeriodo(p.value)"
          :class="['px-2.5 py-0.5 text-xs rounded-md font-medium transition-colors cursor-pointer',
            periodo === p.value ? 'bg-white text-[#245C4F] font-semibold shadow-xs' : 'text-[#68736C] hover:text-[#202723]']">
          {{ p.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-10 gap-2">
      <div class="w-6 h-6 border-2 border-[#E8F1ED] border-t-[#245C4F] rounded-full animate-spin"></div>
      <span class="text-xs text-[#68736C]">Cargando ventas...</span>
    </div>

    <div v-else-if="productos.length === 0" class="text-center py-10 px-4 text-[#68736C]">
      <i class="fa-solid fa-utensils text-xl mb-1 text-[#DDE3DE]"></i>
      <p class="text-xs italic">No hay registros para este período</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="(p, i) in productos.slice(0, 6)" :key="p.id || i" class="flex items-center gap-3">
        
        <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0"
          :class="rankClass(i)">
          {{ i + 1 }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-end mb-1">
            <span class="font-semibold text-[#202723] text-xs truncate pr-2">{{ p.nombre }}</span>
            <span class="text-[11px] font-semibold text-[#68736C] font-mono tabular-nums shrink-0">{{ p.total_vendido }} <span class="font-normal">uds</span></span>
          </div>
          
          <div class="w-full bg-[#F0F2EF] rounded-full h-1.5 overflow-hidden">
            <div class="h-full rounded-full bg-[#245C4F] transition-all duration-700"
              :style="{ width: pct(p.total_vendido) + '%' }">
            </div>
          </div>
        </div>

        <div class="text-right shrink-0 min-w-[70px]">
          <p class="text-xs font-bold font-mono tabular-nums text-[#202723]">${{ fm(p.total_ventas) }}</p>
          <p class="text-[9px] text-[#68736C] uppercase font-semibold">Total</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { STORAGE_URL } from '@/config/api'

const props = defineProps({
  apiUrl:     { type: String,   required: true },
  getHeaders: { type: Function, required: true },
  refreshKey: { type: Number,   default: 0 },
  serverDate: { type: String,   default: '' },
})

const loading  = ref(false)
const productos = ref([])
const periodo  = ref(30)

const periodos = [
  { label: '7D',  value: 7  },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
]

const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}${path}`
}

const pct = (v) => {
  const max = productos.value[0]?.total_vendido || 0
  if (max === 0) return 0
  return Math.round((Number(v) / Number(max)) * 100)
}

const rankClass = (i) => {
  const styles = [
    'bg-[#E8F1ED] text-[#245C4F] border border-[#245C4F]/20 font-bold',
    'bg-[#F0F2EF] text-[#202723] border border-[#DDE3DE] font-semibold',
    'bg-[#F0F2EF] text-[#202723] border border-[#DDE3DE] font-semibold',
  ]
  return styles[i] || 'bg-white text-[#68736C] border border-[#DDE3DE] font-medium'
}

const getServerToday = () => props.serverDate || new Date().toLocaleDateString('en-CA')

const fetchProductos = async () => {
  loading.value = true
  try {
    const hoyStr = getServerToday()
    const fin = hoyStr
    const ini = new Date(hoyStr + 'T00:00:00')
    ini.setDate(ini.getDate() - periodo.value + 1)
    const iniStr = ini.toLocaleDateString('en-CA')
    
    const res = await fetch(
      `${props.apiUrl}/reportes/productos-mas-vendidos?fecha_inicio=${iniStr}&fecha_fin=${fin}&limite=6`,
      { headers: props.getHeaders() }
    )
    const data = await res.json()
    if (data.success) {
      productos.value = data.data || []
    }
  } catch (e) { 
    console.error('Error top productos:', e) 
  } finally { 
    loading.value = false 
  }
}

const setPeriodo = (v) => { periodo.value = v; fetchProductos() }

watch(() => props.refreshKey, fetchProductos)
onMounted(fetchProductos)
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>