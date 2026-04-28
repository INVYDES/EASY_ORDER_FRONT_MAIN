<template>
  <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">

    <div class="mb-4">
      <h2 class="text-xl font-semibold text-gray-800">
        {{ modoEdicion ? 'Editar Trabajador' : 'Registrar Nuevo Trabajador' }}
      </h2>
    </div>

    <!-- ✅ Cadena de acceso — se muestra tras registrar exitosamente -->
    <div v-if="cadenaAcceso" class="mb-5 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
      <p class="text-sm font-medium text-indigo-800 mb-1">✅ Empleado registrado correctamente</p>
      <p class="text-xs text-indigo-600 mb-2">
        Comparte esta cadena al empleado — la usará para iniciar sesión:
      </p>
      <div class="flex items-center gap-2">
        <span class="flex-1 font-mono text-lg font-bold tracking-widest text-indigo-900 bg-white border border-indigo-300 rounded px-3 py-2 text-center">
          {{ cadenaAcceso }}
        </span>
        <button type="button" @click="copiarCadena"
          class="px-3 py-2 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition whitespace-nowrap">
          {{ copiado ? '¡Copiado!' : 'Copiar' }}
        </button>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">

      <!-- Nombre -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input v-model="form.nombre" type="text" required maxlength="100"
          class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
      </div>

      <!-- Apellidos -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
        <input v-model="form.apellidos" type="text" required maxlength="120"
          class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
      </div>

      <!-- Email (opcional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Email
          <span class="text-xs text-gray-400 font-normal ml-1">(opcional)</span>
        </label>
        <input v-model="form.email" type="email" maxlength="150"
          placeholder="Se generará automáticamente si se omite"
          class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-300" />
      </div>

      <!-- Usuario (opcional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Usuario
          <span class="text-xs text-gray-400 font-normal ml-1">(opcional)</span>
        </label>
        <input v-model="form.usuario" type="text" maxlength="60"
          placeholder="Se generará automáticamente si se omite"
          class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-300" />
      </div>

      <!-- Password -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ modoEdicion ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña' }}
        </label>
        <input v-model="form.password" type="password" :required="!modoEdicion" minlength="6"
          class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
      </div>

      <!-- Confirmar password -->
      <div v-if="form.password">
        <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
        <input v-model="form.password_confirmation" type="password" minlength="6"
          :class="['w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none',
            passwordsMismatch ? 'border-red-400' : '']" />
        <p v-if="passwordsMismatch" class="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
      </div>

      <!-- Rol -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
        <select v-model="form.rol" required
          class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
          <option value="">Seleccionar rol</option>
          <option value="2">Administrador</option>
          <option value="3">Mesero</option>
          <option value="4">Cocina</option>
          <option value="5">Caja</option>
          <option value="6">Barra</option>
        </select>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {{ errorMessage }}
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-3 pt-4">
        <button v-if="modoEdicion" type="button" @click="cancelar"
          class="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
          Cancelar
        </button>
        <button type="submit" :disabled="loading || passwordsMismatch"
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
          {{ loading ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Registrar') }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  empleado: { type: Object, default: null }
})
const emit = defineEmits(['guardar', 'cancelar'])

const loading      = ref(false)
const errorMessage = ref('')
const cadenaAcceso = ref('')   // ← cadena id-propietario-restaurante devuelta por el backend
const copiado      = ref(false)

const modoEdicion = computed(() => !!props.empleado)

const getInitialForm = () => ({
  nombre:                '',
  apellidos:             '',
  email:                 '',
  usuario:               '',
  password:              '',
  password_confirmation: '',
  rol:                   '',
})

const form = ref(getInitialForm())

const passwordsMismatch = computed(() =>
  !!form.value.password &&
  !!form.value.password_confirmation &&
  form.value.password !== form.value.password_confirmation
)

// Cargar datos en modo edición
watch(() => props.empleado, (newVal) => {
  cadenaAcceso.value = ''
  if (newVal) {
    const nameParts = (newVal.name || '').split(' ')
    const rolId = newVal.roles?.[0]?.id || newVal.rol_id || newVal.rol || ''
    form.value = {
      nombre:                nameParts[0] || '',
      apellidos:             nameParts.slice(1).join(' ') || '',
      email:                 newVal.email    || '',
      usuario:               newVal.username || '',
      password:              '',
      password_confirmation: '',
      rol:                   rolId ? String(rolId) : '',
    }
  } else {
    form.value = getInitialForm()
  }
}, { immediate: true })

const handleSubmit = () => {
  if (loading.value) return
  errorMessage.value = ''
  cadenaAcceso.value = ''

  // Validaciones
  if (!form.value.nombre)    { errorMessage.value = 'El nombre es obligatorio'; return }
  if (!form.value.apellidos) { errorMessage.value = 'Los apellidos son obligatorios'; return }
  if (!form.value.rol)       { errorMessage.value = 'El rol es obligatorio'; return }
  if (!modoEdicion.value && !form.value.password) {
    errorMessage.value = 'La contraseña es obligatoria'
    return
  }
  if (passwordsMismatch.value) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }

  loading.value = true

  // Payload — email y username solo se mandan si el dueño los llenó
  const payload = {
    id:   props.empleado?.id,
    name: `${form.value.nombre} ${form.value.apellidos}`.trim(),
    rol:  form.value.rol,
  }

  if (form.value.email)   payload.email    = form.value.email
  if (form.value.usuario) payload.username = form.value.usuario

  if (form.value.password) {
    payload.password              = form.value.password
    payload.password_confirmation = form.value.password_confirmation
  }

  emit('guardar', payload)

  if (!modoEdicion.value) {
    form.value = getInitialForm()
  }
  loading.value = false
}

const cancelar = () => {
  emit('cancelar')
  form.value     = getInitialForm()
  cadenaAcceso.value = ''
  errorMessage.value = ''
}

// El padre llama a setError() si el backend responde con error
const setError = (msg) => { errorMessage.value = msg }

// El padre llama a setCadena() con la cadena devuelta por el backend
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