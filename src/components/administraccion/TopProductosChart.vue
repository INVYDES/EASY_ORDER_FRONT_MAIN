<template>
  <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="font-bold text-slate-800 text-lg">🏆 Top Ventas</h3>
        <p class="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Platos estrella</p>
      </div>
      
      <div class="flex bg-slate-100 p-1 rounded-xl">
        <button v-for="p in periodos" :key="p.value" @click="setPeriodo(p.value)"
          :class="['px-3 py-1.5 text-xs rounded-lg font-bold transition-all',
            periodo === p.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
          {{ p.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-3">
      <div class="w-8 h-8 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
      <span class="text-xs font-bold text-slate-400 uppercase tracking-tighter">Analizando ventas...</span>
    </div>

    <div v-else-if="productos.length === 0" class="text-center py-12 px-6">
      <div class="bg-slate-50 rounded-2xl p-4 inline-block mb-3">🍽️</div>
      <p class="text-xs text-slate-400 italic font-medium">No hay registros para este periodo</p>
    </div>

    <div v-else class="space-y-5">
      <div v-for="(p, i) in productos.slice(0, 6)" :key="p.id || i" class="flex items-center gap-4 group">
        
        <div class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-transform group-hover:scale-110 shadow-sm"
          :class="rankClass(i)">
          {{ i + 1 }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-end mb-1.5">
            <span class="font-bold text-slate-700 text-sm truncate pr-2">{{ p.nombre }}</span>
            <span class="text-[11px] font-black text-slate-400 shrink-0">{{ p.total_vendido }} <span class="font-medium">uds</span></span>
          </div>
          
          <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(0,0,0,0.05)]"
              :class="barClass(i)"
              :style="{ width: pct(p.total_vendido) + '%' }">
            </div>
          </div>
        </div>

        <div class="text-right shrink-0 min-w-[70px]">
          <p class="text-xs font-black text-slate-800">${{ fm(p.total_ventas) }}</p>
          <p class="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter">Ingreso</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  apiUrl:     { type: String,   required: true },
  getHeaders: { type: Function, required: true },
})

const loading  = ref(false)
const productos = ref([])
const periodo  = ref(30)

const periodos = [
  { label: '7D',  value: 7  },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
]

// Formateo de moneda (con comas para miles)
const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'

// Porcentaje relativo al #1 para que la barra del primero siempre esté al 100%
const pct = (v) => {
  const max = productos.value[0]?.total_vendido || 0
  if (max === 0) return 0
  return Math.round((Number(v) / Number(max)) * 100)
}

// Clases de medallas mejoradas
const rankClass = (i) => {
  const styles = [
    'bg-amber-400 text-white', // Oro
    'bg-slate-300 text-slate-600', // Plata
    'bg-orange-300 text-white', // Bronce
    'bg-indigo-50 text-indigo-500 border border-indigo-100',
    'bg-slate-50 text-slate-400 border border-slate-100',
    'bg-slate-50 text-slate-400 border border-slate-100',
  ]
  return styles[i] || 'bg-slate-50 text-slate-400'
}

const barClass = (i) => {
  const bars = [
    'bg-gradient-to-r from-amber-300 to-amber-500',
    'bg-slate-400',
    'bg-orange-400',
    'bg-indigo-400',
    'bg-indigo-300',
    'bg-indigo-200',
  ]
  return bars[i] || 'bg-slate-300'
}

const fetchProductos = async () => {
  loading.value = true
  try {
    const hoy = new Date()
    const fin = hoy.toISOString().split('T')[0]
    const ini = new Date(hoy)
    ini.setDate(ini.getDate() - periodo.value + 1)
    const iniStr = ini.toISOString().split('T')[0]
    
    const res = await fetch(
      `${props.apiUrl}/reportes/productos-mas-vendidos?fecha_inicio=${iniStr}&fecha_fin=${fin}&limite=6`,
      { headers: props.getHeaders() }
    )
    const data = await res.json()
    // Ajuste según tu estructura típica de Laravel { success: true, data: [...] }
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

onMounted(fetchProductos)
</script>