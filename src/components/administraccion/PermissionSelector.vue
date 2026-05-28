<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permisos específicos</label>
    <p class="text-xs text-gray-400 dark:text-gray-500 mb-3">Define permisos adicionales más allá del rol base</p>

    <div v-for="group in permissionGroups" :key="group.key" class="mb-3">
      <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{{ group.label }}</p>
      <div class="grid grid-cols-2 gap-1.5">
        <label v-for="perm in group.permissions" :key="perm.key"
          class="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition"
          :class="selectedPermissions.includes(perm.key)
            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-600'">
          <input type="checkbox" :checked="selectedPermissions.includes(perm.key)"
            @change="togglePermission(perm.key)" class="accent-indigo-600 w-3.5 h-3.5" />
          <span class="text-xs font-medium">{{ perm.label }}</span>
        </label>
      </div>
    </div>

    <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
      <span class="text-xs text-gray-400 dark:text-gray-500">{{ selectedPermissions.length }} permisos seleccionados</span>
      <div class="flex gap-2">
        <button @click="selectAll" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium">Seleccionar todos</button>
        <button @click="clearAll" class="text-xs text-gray-400 hover:text-red-500 font-medium">Limpiar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  roleId: { type: [String, Number], default: '' },
})

const emit = defineEmits(['update:modelValue'])

const permissionGroups = [
  {
    key: 'visualizacion',
    label: 'Visualización',
    permissions: [
      { key: 'VER_PANEL', label: 'Ver Dashboard' },
      { key: 'VER_MESERO', label: 'Ver Mesero' },
      { key: 'VER_COCINA', label: 'Ver Cocina' },
      { key: 'VER_BARRA', label: 'Ver Barra' },
      { key: 'VER_CAJA', label: 'Ver Caja' },
      { key: 'VER_POSTRES', label: 'Ver Postres' },
      { key: 'VER_CLIENTE', label: 'Ver Cliente' },
    ],
  },
  {
    key: 'gestion',
    label: 'Gestión',
    permissions: [
      { key: 'GESTIONAR_PRODUCTOS', label: 'Gestionar Productos' },
      { key: 'GESTIONAR_EMPLEADOS', label: 'Gestionar Empleados' },
      { key: 'GESTIONAR_INGREDIENTES', label: 'Gestionar Ingredientes' },
      { key: 'GESTIONAR_GASTOS', label: 'Gestionar Gastos' },
      { key: 'GESTIONAR_ANUNCIOS', label: 'Gestionar Anuncios' },
      { key: 'GESTIONAR_MESAS', label: 'Gestionar Mesas' },
    ],
  },
  {
    key: 'reportes',
    label: 'Reportes',
    permissions: [
      { key: 'VER_REPORTES_VENTAS', label: 'Ver Reportes Ventas' },
      { key: 'VER_REPORTES_ROI', label: 'Ver Reportes ROI' },
      { key: 'VER_REPORTES_PRODUCTOS', label: 'Ver KPIs Productos' },
      { key: 'EXPORTAR_DATOS', label: 'Exportar Datos' },
    ],
  },
  {
    key: 'administracion',
    label: 'Administración',
    permissions: [
      { key: 'GESTIONAR_RESTAURANTES', label: 'Gestionar Restaurantes' },
      { key: 'VER_LICENCIAS', label: 'Ver Licencias' },
      { key: 'GESTIONAR_ROLES', label: 'Gestionar Roles' },
      { key: 'VER_LOGS', label: 'Ver Registros' },
    ],
  },
]

const rolePresets = {
  2: ['VER_PANEL', 'VER_MESERO', 'VER_COCINA', 'VER_BARRA', 'VER_CAJA', 'VER_POSTRES', 'VER_CLIENTE',
      'GESTIONAR_PRODUCTOS', 'GESTIONAR_EMPLEADOS', 'GESTIONAR_INGREDIENTES', 'GESTIONAR_GASTOS',
      'GESTIONAR_ANUNCIOS', 'GESTIONAR_MESAS', 'VER_REPORTES_VENTAS', 'VER_REPORTES_ROI',
      'VER_REPORTES_PRODUCTOS', 'EXPORTAR_DATOS', 'GESTIONAR_RESTAURANTES', 'VER_LICENCIAS',
      'GESTIONAR_ROLES', 'VER_LOGS'],
  3: ['VER_PANEL', 'VER_MESERO', 'GESTIONAR_MESAS'],
  4: ['VER_PANEL', 'VER_COCINA', 'VER_POSTRES'],
  5: ['VER_PANEL', 'VER_CAJA', 'VER_REPORTES_VENTAS', 'EXPORTAR_DATOS'],
  6: ['VER_PANEL', 'VER_BARRA'],
}

const selectedPermissions = ref([...props.modelValue])

const togglePermission = (key) => {
  const idx = selectedPermissions.value.indexOf(key)
  if (idx === -1) selectedPermissions.value.push(key)
  else selectedPermissions.value.splice(idx, 1)
  emit('update:modelValue', [...selectedPermissions.value])
}

const selectAll = () => {
  selectedPermissions.value = permissionGroups.flatMap(g => g.permissions.map(p => p.key))
  emit('update:modelValue', [...selectedPermissions.value])
}

const clearAll = () => {
  selectedPermissions.value = []
  emit('update:modelValue', [])
}

watch(() => props.roleId, (newRole) => {
  if (newRole && rolePresets[newRole]) {
    selectedPermissions.value = [...rolePresets[newRole]]
    emit('update:modelValue', [...selectedPermissions.value])
  }
})

watch(() => props.modelValue, (val) => {
  selectedPermissions.value = [...val]
}, { immediate: true })
</script>
