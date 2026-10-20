<template>
  <div class="bg-white p-6 rounded-xl">

    <div class="mb-4 border-b border-[#DDE3DE] pb-3">
      <h2 class="text-base font-semibold text-[#202723]">
        {{ modoEdicion ? 'Editar Trabajador' : 'Registrar Nuevo Trabajador' }}
      </h2>
      <p v-if="!modoEdicion" class="text-xs text-[#68736C] mt-0.5">El usuario y correo se generarán automáticamente.</p>
    </div>

    <!-- Cadena de acceso -->
    <div v-if="cadenaAcceso" class="mb-4 p-3.5 bg-[#E8F1ED] border border-[#245C4F]/30 rounded-lg">
      <div class="flex items-center gap-2 text-xs font-semibold text-[#202723] mb-1">
        <i class="fa-solid fa-circle-check text-[#26734D]"></i>
        <span>Empleado registrado correctamente</span>
      </div>
      <p class="text-[11px] text-[#68736C] mb-2.5">
        Comparte esta cadena al empleado — la usará para iniciar sesión:
      </p>
      <div class="flex items-center gap-2">
        <span class="flex-1 font-mono text-sm font-semibold tracking-wider text-[#245C4F] bg-white border border-[#DDE3DE] rounded-md px-3 py-1.5 text-center">
          {{ cadenaAcceso }}
        </span>
        <button type="button" @click="copiarCadena"
          class="px-3 py-1.5 text-xs font-semibold bg-[#245C4F] text-white rounded-md hover:bg-[#19483D] transition whitespace-nowrap cursor-pointer">
          {{ copiado ? '¡Copiado!' : 'Copiar' }}
        </button>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">

      <!-- Nombre y Apellidos -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-[#202723] mb-1">Nombre *</label>
          <input v-model="form.nombre" type="text" required maxlength="100"
            class="w-full px-3 py-2 border border-[#DDE3DE] rounded-lg focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none text-xs" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-[#202723] mb-1">Apellidos *</label>
          <input v-model="form.apellidos" type="text" required maxlength="120"
            class="w-full px-3 py-2 border border-[#DDE3DE] rounded-lg focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none text-xs" />
        </div>
      </div>

      <!-- Password -->
      <div>
        <label class="block text-xs font-semibold text-[#202723] mb-1">
          {{ modoEdicion ? 'Nueva contraseña (vacío para no cambiar)' : 'Establecer Contraseña *' }}
        </label>
        <input v-model="form.password" type="password" :required="!modoEdicion" minlength="6"
          class="w-full px-3 py-2 border border-[#DDE3DE] rounded-lg focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none text-xs" />
      </div>

      <!-- Rol y Sucursal -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-[#202723] mb-1">Rol *</label>
          <select v-model="form.rol_id" required
            class="w-full px-3 py-2 border border-[#DDE3DE] rounded-lg focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none bg-white text-xs">
            <option value="">Seleccionar rol</option>
            <option value="2">Administrador</option>
            <option value="3">Mesero</option>
            <option value="4">Cocina</option>
            <option value="5">Caja</option>
            <option value="7">Menú</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-[#202723] mb-1">Sucursal *</label>
           <select v-model="form.restaurante_id" required
            class="w-full px-3 py-2 border border-[#DDE3DE] rounded-lg focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none bg-white text-xs">
            <option :value="null">Elegir sucursal</option>
            <option v-for="r in restaurantes" :key="r.id" :value="r.id">
              {{ r.nombre }}{{ r.es_activo || r.id === restauranteActivoId ? ' (Activo)' : '' }}
            </option>
          </select>
        </div>
      </div>

      <!-- Estado Activo -->
      <div v-if="modoEdicion" class="flex items-center gap-2 bg-[#F6F7F5] p-2.5 rounded-lg border border-[#DDE3DE]">
        <input v-model="form.es_activo" type="checkbox" id="emp-activo" class="w-4 h-4 accent-[#245C4F] rounded cursor-pointer" />
        <label for="emp-activo" class="text-xs font-semibold text-[#202723] cursor-pointer">Empleado Activo</label>
        <p class="text-[10px] text-[#68736C] ml-auto">(Influye en cálculos de nómina)</p>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="text-xs text-[#B93838] bg-[#FEF2F2] border border-[#B93838]/20 rounded-lg px-3 py-2 flex items-center gap-2">
        <i class="fa-solid fa-circle-exclamation text-xs"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-2.5 pt-4 border-t border-[#DDE3DE]">
        <button type="button" @click="cancelar"
          class="flex-1 py-2 bg-[#F0F2EF] text-[#202723] font-semibold rounded-lg hover:bg-[#DDE3DE] transition text-xs cursor-pointer">
          {{ modoEdicion ? 'Cerrar' : 'Cancelar' }}
        </button>
        <button type="submit" :disabled="loading || passwordsMismatch"
          class="flex-1 py-2 bg-[#245C4F] text-white font-semibold rounded-lg hover:bg-[#19483D] disabled:opacity-50 transition text-xs shadow-xs cursor-pointer">
          {{ loading ? 'Procesando...' : (modoEdicion ? 'Guardar Cambios' : 'Registrar Empleado') }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  empleado:            { type: Object, default: null },
  restaurantes:        { type: Array,  default: () => [] },
  restauranteActivoId: { type: Number, default: null }
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
  restaurante_id:        props.restauranteActivoId,
  es_activo:             true
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
      es_activo:             newVal.es_activo !== false
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