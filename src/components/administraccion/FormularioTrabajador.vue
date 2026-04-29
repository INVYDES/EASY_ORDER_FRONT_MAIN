<template>
  <div class="bg-white p-6 rounded-lg">

    <div class="mb-4">
      <h2 class="text-xl font-semibold text-gray-800">
        {{ modoEdicion ? 'Editar Trabajador' : 'Registrar Nuevo Trabajador' }}
      </h2>
      <p v-if="!modoEdicion" class="text-xs text-gray-400 mt-1">El usuario y correo se generarán automáticamente.</p>
    </div>

    <!-- ✅ Cadena de acceso -->
    <div v-if="cadenaAcceso" class="mb-5 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
      <p class="text-sm font-medium text-indigo-800 mb-1">✅ Empleado registrado correctamente</p>
      <p class="text-xs text-indigo-600 mb-2">
        Comparte esta cadena al empleado — la usará para iniciar sesión:
      </p>
      <div class="flex items-center gap-2">
        <span class="flex-1 font-mono text-lg font-bold tracking-widest text-indigo-900 bg-white border border-indigo-300 rounded px-3 py-2 text-center">
          {{ cadenaAcceso }}
        </span>
        <button type="button" @click="copiarCadena"
          class="px-3 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition whitespace-nowrap">
          {{ copiado ? '¡Copiado!' : 'Copiar' }}
        </button>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">

      <!-- Nombre y Apellidos -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nombre *</label>
          <input v-model="form.nombre" type="text" required maxlength="100"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm shadow-sm" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Apellidos *</label>
          <input v-model="form.apellidos" type="text" required maxlength="120"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm shadow-sm" />
        </div>
      </div>

      <!-- Password -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">
          {{ modoEdicion ? 'Nueva contraseña (vacío para no cambiar)' : 'Establecer Contraseña *' }}
        </label>
        <input v-model="form.password" type="password" :required="!modoEdicion" minlength="6"
          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm shadow-sm" />
      </div>

      <!-- Rol y Sucursal -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Rol *</label>
          <select v-model="form.rol_id" required
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-sm shadow-sm">
            <option value="">Seleccionar rol</option>
            <option value="2">Administrador</option>
            <option value="3">Mesero</option>
            <option value="4">Cocina</option>
            <option value="5">Caja</option>
            <option value="6">Barra</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Sucursal *</label>
          <select v-model="form.restaurante_id" required
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-sm shadow-sm">
            <option :value="null">Elegir sucursal</option>
            <option v-for="r in restaurantes" :key="r.id" :value="r.id">{{ r.nombre }}</option>
          </select>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
        <span>⚠️</span>
        {{ errorMessage }}
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-3 pt-6">
        <button type="button" @click="cancelar"
          class="flex-1 py-3 bg-gray-50 text-gray-500 font-bold rounded-xl hover:bg-gray-100 transition text-sm">
          {{ modoEdicion ? 'Cerrar' : 'Cancelar' }}
        </button>
        <button type="submit" :disabled="loading || passwordsMismatch"
          class="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition text-sm shadow-md shadow-indigo-100">
          {{ loading ? 'Procesando...' : (modoEdicion ? 'Guardar Cambios' : 'Registrar Empleado') }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  empleado:     { type: Object, default: null },
  restaurantes: { type: Array,  default: () => [] }
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
  restaurante_id:        null
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
      restaurante_id:        restId ? Number(restId) : null
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
    // email y username se envían como null para que el backend los genere
    email:          null,
    username:       null
  }

  if (form.value.password) {
    payload.password              = form.value.password
    payload.password_confirmation = form.value.password 
  }

  emit('guardar', payload)
  loading.value = false
}

const cancelar = () => {
  emit('cancelar')
  form.value         = getInitialForm()
  cadenaAcceso.value = ''
  errorMessage.value = ''
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