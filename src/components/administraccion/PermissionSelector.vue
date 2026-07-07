<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permisos</label>
    <p class="text-xs text-gray-400 dark:text-gray-500 mb-3">Seleccionados automáticamente según el rol</p>

    <div v-for="group in permissionGroups" :key="group.key" class="mb-2">
      <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{{ group.label }}</p>
      <div class="flex flex-wrap gap-1.5">
        <label v-for="perm in group.permissions" :key="perm.key"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition text-xs"
          :class="selectedPermissions.includes(perm.key)
            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-200'">
          <input type="checkbox" :checked="selectedPermissions.includes(perm.key)"
            @change="togglePermission(perm.key)" class="accent-indigo-600 w-3 h-3" />
          <span>{{ perm.label }}</span>
        </label>
      </div>
    </div>

    <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
      {{ selectedPermissions.length }} permiso{{ selectedPermissions.length !== 1 ? 's' : '' }} seleccionado{{ selectedPermissions.length !== 1 ? 's' : '' }}
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
    key: 'modulos',
    label: 'Módulos',
    permissions: [
      { key: 'VER_MESERO', label: 'Mesero' },
      { key: 'VER_COCINA', label: 'Cocina' },
      { key: 'VER_BARRA', label: 'Barra' },
      { key: 'VER_CAJA', label: 'Caja' },
      { key: 'VER_CLIENTE', label: 'Cliente' },
    ],
  },
  {
    key: 'gestion',
    label: 'Gestión',
    permissions: [
      { key: 'GESTIONAR_PRODUCTOS', label: 'Productos' },
      { key: 'GESTIONAR_EMPLEADOS', label: 'Empleados' },
      { key: 'GESTIONAR_INGREDIENTES', label: 'Ingredientes' },
      { key: 'GESTIONAR_GASTOS', label: 'Gastos' },
      { key: 'GESTIONAR_MESAS', label: 'Mesas' },
    ],
  },
  {
    key: 'reportes',
    label: 'Reportes',
    permissions: [
      { key: 'VER_REPORTES_VENTAS', label: 'Ventas' },
      { key: 'EXPORTAR_DATOS', label: 'Exportar' },
    ],
  },
]

const rolePresets = {
  1: permissionGroups.flatMap(g => g.permissions.map(p => p.key)),
  2: permissionGroups.flatMap(g => g.permissions.map(p => p.key)),
  3: ['VER_MESERO', 'VER_CLIENTE', 'GESTIONAR_MESAS'],
  4: ['VER_COCINA'],
  5: ['VER_CAJA', 'VER_REPORTES_VENTAS', 'EXPORTAR_DATOS'],
  6: ['VER_BARRA'],
  7: ['VER_CLIENTE'],
}

const selectedPermissions = ref([...props.modelValue])

const togglePermission = (key) => {
  const idx = selectedPermissions.value.indexOf(key)
  if (idx === -1) selectedPermissions.value.push(key)
  else selectedPermissions.value.splice(idx, 1)
  emit('update:modelValue', [...selectedPermissions.value])
}

watch(() => props.roleId, (newRole) => {
  if (newRole && rolePresets[newRole]) {
    selectedPermissions.value = [...rolePresets[newRole]]
    emit('update:modelValue', [...selectedPermissions.value])
  }
}, { immediate: true })

watch(() => props.modelValue, (val) => {
  selectedPermissions.value = [...val]
}, { immediate: true })
</script>
