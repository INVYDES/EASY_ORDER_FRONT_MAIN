<template>
  <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">

    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-800">
        {{ modoEdicion ? 'Editar Restaurante' : 'Registrar Nuevo Restaurante' }}
      </h2>

      <span v-if="!modoEdicion" class="text-sm font-medium bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full">
        Creados: {{ restaurantsCount }} / {{ maxRestaurants }}
      </span>
    </div>

    <!-- LÍMITE ALCANZADO (solo en creación) -->
    <div
      v-if="!modoEdicion && restaurantsCount >= maxRestaurants"
      class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4"
    >
      <p class="text-sm text-yellow-700">
        Has alcanzado el límite de restaurantes permitidos por tu plan actual.
      </p>
    </div>

    <!-- FORM -->
    <form @submit.prevent="handleSubmit" class="space-y-4">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- nombre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Sucursal</label>
          <input v-model="form.nombre" type="text" maxlength="120" required
            class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Ej. Restaurante Centro" />
        </div>

        <!-- teléfono -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input v-model="form.telefono" type="tel" maxlength="20" required
            class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Ej. 5551234567" />
        </div>
      </div>

      <!-- dirección -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
        <input v-model="form.direccion" type="text" maxlength="200" required
          class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="Ej. Av. Principal #123" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- ciudad -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
          <input v-model="form.ciudad" type="text" maxlength="100" required
            class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>

        <!-- estado -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <input v-model="form.estado" type="text" maxlength="100" required
            class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- horario -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Horario</label>
          <input v-model="form.horario" type="text" maxlength="100"
            class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="09:00 - 21:00" />
        </div>

        <!-- activo -->
        <div class="flex items-center pt-6">
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input v-model="form.activo" type="checkbox" class="w-4 h-4 text-indigo-600 rounded" />
            Restaurante activo
          </label>
        </div>
      </div>

      <!-- error -->
      <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
        {{ errorMessage }}
      </div>

      <!-- botones -->
      <div class="flex justify-end gap-3 pt-4">
        <button type="button" @click="cancelar"
          class="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
          Cancelar
        </button>
        <button type="submit" :disabled="loading || (!modoEdicion && restaurantsCount >= maxRestaurants)"
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
          {{ loading ? 'Guardando...' : (modoEdicion ? 'Actualizar Restaurante' : 'Registrar Restaurante') }}
        </button>
      </div>

    </form>

  </div>
</template>

<script setup>
// ✅ FIX 1: Se agregó `computed` que faltaba en el import
import { ref, computed, watch } from 'vue'

const props = defineProps({
  maxRestaurants:   { type: Number, required: true },
  restaurantsCount: { type: Number, required: true },
  restaurante:      { type: Object, default: null }
})

const emit = defineEmits(['guardar', 'cancelar'])

const loading      = ref(false)
const errorMessage = ref('')

// ✅ FIX 1: computed ya importado, ahora funciona correctamente
const modoEdicion = computed(() => !!props.restaurante)

const getInitialForm = () => ({
  nombre:    '',
  direccion: '',
  telefono:  '',
  ciudad:    '',
  estado:    '',
  horario:   '',
  activo:    true
})

const form = ref(getInitialForm())

// ✅ FIX 2: immediate:true garantiza que los datos se carguen
//           al abrir el modal de edición sin esperar un cambio
watch(
  () => props.restaurante,
  (newVal) => {
    if (newVal) {
      form.value = {
        nombre:    newVal.nombre    || '',
        direccion: newVal.calle     || '',   // mapeo calle → direccion
        telefono:  newVal.telefono  || '',
        ciudad:    newVal.ciudad    || '',
        estado:    newVal.estado    || '',
        horario:   newVal.horario   || '',
        activo:    newVal.activo !== false
      }
    } else {
      form.value = getInitialForm()
    }
  },
  { immediate: true }
)

const handleSubmit = () => {
  if (loading.value) return

  // Validaciones
  if (!modoEdicion.value && props.restaurantsCount >= props.maxRestaurants) {
    errorMessage.value = 'Has alcanzado el límite de restaurantes.'
    return
  }
  if (!form.value.nombre)   { errorMessage.value = 'El nombre es obligatorio';   return }
  if (!form.value.telefono) { errorMessage.value = 'El teléfono es obligatorio'; return }
  if (!form.value.ciudad)   { errorMessage.value = 'La ciudad es obligatoria';   return }

  errorMessage.value = ''
  loading.value = true

  emit('guardar', {
    ...form.value,
    id: props.restaurante?.id ?? null   // ✅ FIX 3: null explícito si es creación
  })

  // ✅ FIX 4: loading se apaga y form se limpia SOLO si es creación
  //           En edición el padre cierra el modal, no hace falta limpiar aquí
  if (!modoEdicion.value) {
    form.value = getInitialForm()
  }
  loading.value = false
}

const cancelar = () => {
  errorMessage.value = ''
  form.value = getInitialForm()
  emit('cancelar')
}
</script>