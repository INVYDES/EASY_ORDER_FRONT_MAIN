<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg">

    <div class="mb-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        {{ modoEdicion ? 'Editar Trabajador' : 'Registrar Nuevo Trabajador' }}
      </h2>
      <p v-if="!modoEdicion" class="text-xs text-gray-400 dark:text-gray-500 mt-1">El usuario y correo se generarán automáticamente.</p>
    </div>

    <!-- ✅ Permisos -->
    <div class="mb-5 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
      <PermissionSelector v-model="form.permisos" :role-id="form.rol_id" />
    </div>

    <!-- ✅ Cadena de acceso -->
    <transition name="fade-up">
      <div v-if="cadenaAcceso" class="mb-5 p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/80 dark:from-indigo-900/40 dark:to-indigo-800/30 border-2 border-indigo-200 dark:border-indigo-700 rounded-2xl shadow-inner">
        <div class="flex items-center gap-2.5 mb-3">
          <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white text-lg shadow-lg shadow-emerald-200/50">✅</span>
          <div>
            <p class="text-sm font-bold text-indigo-800 dark:text-indigo-300">Empleado registrado correctamente</p>
            <p class="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">Comparte la siguiente cadena de acceso con el empleado</p>
          </div>
        </div>
        <div class="flex items-center gap-2 bg-white dark:bg-gray-900/50 rounded-xl border border-indigo-200 dark:border-indigo-700 p-1">
          <span class="flex-1 font-mono text-lg font-black tracking-[0.25em] text-indigo-900 dark:text-indigo-200 px-4 py-3 text-center select-all">
            {{ cadenaAcceso }}
          </span>
          <button type="button" @click="copiarCadena"
            class="shrink-0 px-4 py-3 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all whitespace-nowrap flex items-center gap-1.5 shadow-md shadow-indigo-200/50">
            <span>{{ copiado ? '✓' : '📋' }}</span>
            {{ copiado ? '¡Copiado!' : 'Copiar' }}
          </button>
        </div>
      </div>
    </transition>

    <form @submit.prevent="handleSubmit" class="space-y-5">

      <!-- Nombre y Apellidos -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Nombre *</label>
          <input v-model="form.nombre" type="text" required maxlength="100"
            class="w-full px-4 py-3 border border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm shadow-sm" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Apellidos *</label>
          <input v-model="form.apellidos" type="text" required maxlength="120"
            class="w-full px-4 py-3 border border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm shadow-sm" />
        </div>
      </div>

      <!-- Password -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {{ modoEdicion ? 'Nueva contraseña (vacío para no cambiar)' : 'Establecer Contraseña *' }}
        </label>
        <input v-model="form.password" type="password" :required="!modoEdicion" minlength="6"
          class="w-full px-4 py-3 border border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm shadow-sm" />
      </div>

      <!-- Rol y Sucursal -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Rol *</label>
          <select v-model="form.rol_id" required
            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-200 text-sm shadow-sm">
            <option value="">Seleccionar rol</option>
            <option value="2">Administrador</option>
            <option value="3">Mesero</option>
            <option value="4">Cocina</option>
            <option value="5">Caja</option>
            <option value="7">Menú</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Sucursal *</label>
           <select v-model="form.restaurante_id" required
            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-200 text-sm shadow-sm">
            <option :value="null">Elegir sucursal</option>
            <option v-for="r in restaurantes" :key="r.id" :value="r.id">{{ r.nombre }}</option>
          </select>
        </div>
      </div>

      <!-- Estado Activo -->
      <div v-if="modoEdicion" class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
        <input v-model="form.es_activo" type="checkbox" id="emp-activo" class="w-4 h-4 accent-indigo-600 rounded" />
        <label for="emp-activo" class="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">Empleado Activo</label>
        <p class="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">(Influye en cálculos de nómina)</p>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-xl px-4 py-3 flex items-center gap-2">
        <span>⚠️</span>
        {{ errorMessage }}
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-3 pt-6">
        <button type="button" @click="cancelar"
          class="flex-1 py-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm">
          {{ modoEdicion ? 'Cerrar' : 'Cancelar' }}
        </button>
        <button type="submit" :disabled="guardando || loading || passwordsMismatch"
          class="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm shadow-md shadow-indigo-100">
          <span v-if="guardando || loading" class="flex items-center justify-center gap-2">
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Procesando...
          </span>
          <span v-else>{{ modoEdicion ? 'Guardar Cambios' : 'Registrar Empleado' }}</span>
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import PermissionSelector from '@/components/administraccion/PermissionSelector.vue'

const props = defineProps({
  empleado:     { type: Object, default: null },
  restaurantes: { type: Array,  default: () => [] },
  guardando:    { type: Boolean, default: false }
})
const emit = defineEmits(['guardar', 'cancelar'])

const loading      = ref(false)
const errorMessage = ref('')
const cadenaAcceso = ref('')
const copiado      = ref(false)

const modoEdicion = computed(() => !!props.empleado)

const getInitialForm = () => ({
  nombre:                '',
  apellidos:             '',
  password:              '',
  password_confirmation: '',
  rol_id:                '',
  restaurante_id:        null,
  es_activo:             true,
  permisos:              []
})

const form = ref(getInitialForm())

const passwordsMismatch = computed(() =>
  !!form.value.password &&
  !!form.value.password_confirmation &&
  form.value.password !== form.value.password_confirmation
)

watch(() => props.empleado, (newVal) => {
  cadenaAcceso.value = ''
  if (newVal) {
    const nameParts = (newVal.name || '').split(' ')
    const rolId = newVal.roles?.[0]?.id || newVal.rol_id || newVal.rol || ''
    const restId = (newVal.restaurante_activo && typeof newVal.restaurante_activo === 'object') 
      ? newVal.restaurante_activo.id 
      : (newVal.restaurante_activo || newVal.restaurante_id || null)

    form.value = {
      nombre:                nameParts[0] || '',
      apellidos:             nameParts.slice(1).join(' ') || '',
      password:              '',
      password_confirmation: '',
      rol_id:                rolId ? String(rolId) : '',
      restaurante_id:        restId ? Number(restId) : null,
      es_activo:             newVal.es_activo !== false,
      permisos:              newVal.permisos || []
    }
  } else {
    form.value = getInitialForm()
  }
}, { immediate: true })

const handleSubmit = () => {
  if (loading.value) return
  errorMessage.value = ''
  cadenaAcceso.value = ''

  if (!form.value.nombre)         { errorMessage.value = 'El nombre es obligatorio'; return }
  if (!form.value.rol_id)         { errorMessage.value = 'El rol es obligatorio'; return }
  if (!form.value.restaurante_id) { errorMessage.value = 'La sucursal es obligatoria'; return }
  
  if (!modoEdicion.value && !form.value.password) {
    errorMessage.value = 'La contraseña es obligatoria'
    return
  }

  loading.value = true

  const payload = {
    name:           `${form.value.nombre} ${form.value.apellidos}`.trim(),
    rol_id:         form.value.rol_id,
    restaurante_id: form.value.restaurante_id,
    es_activo:      form.value.es_activo,
    permisos:       form.value.permisos,
    // email y username se envían como null para que el backend los genere
    email:          null,
    username:       null
  }

  if (form.value.password) {
    payload.password              = form.value.password
    payload.password_confirmation = form.value.password 
  }

  emit('guardar', payload)
}

const cancelar = () => {
  emit('cancelar')
  form.value         = getInitialForm()
  cadenaAcceso.value = ''
  errorMessage.value = ''
  loading.value      = false
}

const setError = (msg) => { errorMessage.value = msg }
const setCadena = (cadena) => { cadenaAcceso.value = cadena }

const copiarCadena = async () => {
  try {
    await navigator.clipboard.writeText(cadenaAcceso.value)
    copiado.value = true
    setTimeout(() => { copiado.value = false }, 2000)
  } catch {
    copiado.value = false
  }
}

defineExpose({ setError, setCadena })
</script>

<style scoped>
.fade-up-enter-active { animation: fadeUpIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.fade-up-leave-active { animation: fadeUpIn 0.2s ease-in reverse; }
@keyframes fadeUpIn {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin { animation: spin 0.8s linear infinite; }
</style>