<template>
  <div class="bg-gray-50 rounded-2xl p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="font-bold text-gray-800 text-lg">👥 Distribución de Equipo</h3>
        <p class="text-sm text-gray-500">Gestión de personal por departamentos</p>
      </div>
      <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
        {{ empleados.length }} Total
      </span>
    </div>

    <div v-if="Object.keys(rolesCount).length === 0" 
         class="h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
      <span class="text-4xl mb-2">🧊</span>
      <p class="text-sm">No hay datos para mostrar</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="(count, rol, index) in rolesCount" :key="rol"
           class="group relative overflow-hidden bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        
        <div :style="{ backgroundColor: COLORS[index % COLORS.length] }" 
             class="absolute left-0 top-0 h-full w-1 opacity-80"></div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">{{ rol }}</p>
            <h4 class="text-2xl font-bold text-gray-800 mt-1">
              <AnimatedNumber :value="count" />
            </h4>
          </div>
          
          <div :style="{ color: COLORS[index % COLORS.length], backgroundColor: `${COLORS[index % COLORS.length]}15` }"
               class="p-2 rounded-lg transition-colors group-hover:bg-opacity-25">
             <component :is="getIcon(rol)" class="w-6 h-6" />
          </div>
        </div>

        <div class="mt-3 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div :style="{ 
                 width: `${(count / empleados.length) * 100}%`,
                 backgroundColor: COLORS[index % COLORS.length] 
               }" 
               class="h-full rounded-full transition-all duration-1000 ease-out">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
  empleados: { type: Array, default: () => [] },
})

const ROLES_MAP = { 1:'Super Admin', 2:'Administrador', 3:'Mesero', 4:'Cocina', 5:'Caja', 6:'Barra', 7:'Cliente' }
const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#06b6d4']

// Procesar los datos para el contador
const rolesCount = computed(() => {
  const counts = {}
  props.empleados.forEach(e => {
    const r = getRolNombre(e)
    counts[r] = (counts[r] || 0) + 1
  })
  return counts
})

const getRolNombre = (emp) => {
  if (emp.roles?.length) {
    const r = emp.roles[0]
    if (r?.nombre || r?.name) return r.nombre || r.name
    if (typeof r === 'number') return ROLES_MAP[r] || `Rol ${r}`
  }
  if (emp.rol) return ROLES_MAP[emp.rol] || emp.rol
  if (emp.rol_id) return ROLES_MAP[emp.rol_id] || `Rol ${emp.rol_id}`
  return 'Personal'
}

// Lógica para asignar iconos simples basados en texto (Emoji para simplicidad, puedes usar Lucide-vue)
const getIcon = (rol) => {
  const icons = {
    'Administrador': '🛡️',
    'Super Admin': '👑',
    'Mesero': '🍽️',
    'Cocina': '👨‍🍳',
    'Caja': '💰',
    'Barra': '🍷',
    'Cliente': '👤'
  }
  return {
    template: `<span>${icons[rol] || '👥'}</span>`
  }
}

/**
 * Sub-componente interno para la animación del número
 */
const AnimatedNumber = {
  props: ['value'],
  setup(props) {
    const displayValue = ref(0)
    
    const animate = () => {
      let start = displayValue.value
      const end = props.value
      const duration = 800
      const startTime = performance.now()

      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1)
        displayValue.value = Math.floor(progress * (end - start) + start)
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    watch(() => props.value, animate)
    onMounted(animate)

    return () => displayValue.value
  }
}
</script>

<style scoped>
/* Transición suave para las barras */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 500ms;
}
</style>