<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
      <h3 class="font-semibold text-gray-800">Historial de cajas</h3>
      <div class="flex items-center gap-2">
        <input v-model="filtro" type="text" placeholder="Buscar por fecha..."
          class="px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none w-44" />
        <span class="text-xs text-gray-400">{{ filtrados.length }} registros</span>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-400 text-sm">Cargando historial...</div>
    <div v-else-if="filtrados.length === 0" class="text-center py-10 text-gray-400 italic text-sm">
      No hay cajas anteriores registradas
    </div>
    <div v-else class="space-y-3 max-h-[380px] overflow-y-auto pr-1">
      <div v-for="caja in filtrados" :key="caja.id"
        class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
        @click="$emit('ver-detalle', caja.id)">
        <div class="w-12 h-12 rounded-xl bg-indigo-100 flex flex-col items-center justify-center shrink-0">
          <span class="text-xs font-bold text-indigo-700 leading-tight">{{ formatDia(caja.fecha) }}</span>
          <span class="text-[10px] text-indigo-500">{{ formatMes(caja.fecha) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold text-gray-800">{{ caja.fecha }}</p>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
              :class="caja.diferencia >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'">
              {{ caja.diferencia >= 0 ? 'Sin faltante' : 'Con faltante' }}
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ toLocalTime(caja.apertura) }} → {{ toLocalTime(caja.cierre) }} · {{ caja.abierto_por || '—' }}
          </p>
        </div>
        <div class="text-right shrink-0 space-y-1">
          <p class="text-sm font-bold text-gray-800">${{ Number(caja.ventas_totales||0).toFixed(2) }}</p>
          <p class="text-xs" :class="caja.diferencia >= 0 ? 'text-emerald-600' : 'text-red-500'">
            {{ caja.diferencia >= 0 ? '+' : '' }}${{ Number(caja.diferencia||0).toFixed(2) }}
          </p>
          <span class="text-[10px] text-indigo-500 font-medium">Ver detalle →</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  historial: { type: Array,   default: () => [] },
  loading:   { type: Boolean, default: false    },
})
defineEmits(['ver-detalle'])

const filtro = ref('')

const filtrados = computed(() => {
  if (!filtro.value) return props.historial
  const f = filtro.value.toLowerCase()
  return props.historial.filter(c =>
    (c.fecha||'').toLowerCase().includes(f) ||
    (c.abierto_por||'').toLowerCase().includes(f)
  )
})

const parseFecha = (f) => {
  if (!f) return null
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(f)) { const [d,m,y]=f.split('/'); return new Date(`${y}-${m}-${d}T00:00:00`) }
  return new Date(f + 'T00:00:00')
}
const parseUTCDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  try {
    let d;
    if (typeof dateStr === 'string') {
      if (dateStr.includes('T')) {
        if (dateStr.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(dateStr)) {
          d = new Date(dateStr);
        } else {
          d = new Date(dateStr + 'Z');
        }
      } else if (dateStr.includes('/')) {
        const parts = dateStr.trim().split(' ');
        const fecha = parts[0];
        const hora = parts[1] || '00:00:00';
        const [dia, mes, anio] = fecha.split('/');
        d = new Date(`${anio}-${mes}-${dia}T${hora}`);
      } else if (dateStr.includes(':') && !dateStr.includes('-')) {
        const hoy = new Date().toLocaleDateString('en-CA');
        d = new Date(`${hoy}T${dateStr}`);
      } else {
        const cleanStr = dateStr.replace(' ', 'T');
        d = new Date(cleanStr);
      }
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return null;
    return d;
  } catch (e) {
    return null;
  }
};

const toLocalTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = parseUTCDate(dateStr);
  if (!d) return dateStr;
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatDia = (f) => { const d=parseFecha(f); return d&&!isNaN(d)?d.getDate().toString().padStart(2,'0'):'--' }
const formatMes = (f) => { const d=parseFecha(f); return d&&!isNaN(d)?d.toLocaleDateString('es-MX',{month:'short'}).toUpperCase():'' }
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(99, 102, 241, 0.2) transparent;
}
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(99, 102, 241, 0.2);
  border-radius: 20px;
}
</style>