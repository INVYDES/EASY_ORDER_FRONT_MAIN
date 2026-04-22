<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

    <!-- Empleados -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500">Empleados Registrados</p>
        <h3 class="text-2xl font-bold text-gray-800">
          {{ empleados.length }}
        </h3>
      </div>

      <div class="p-3 bg-blue-50 text-blue-600 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 20h5V4H2v16h5m10 0v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4m10 0H7" />
        </svg>
      </div>
    </div>


    <!-- Restaurantes -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500">Restaurantes Activos</p>
        <h3 class="text-2xl font-bold text-gray-800">
          {{ activeRestaurants }} / {{ maxRestaurants }}
        </h3>
      </div>

      <div class="p-3 bg-indigo-50 text-indigo-600 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
    </div>


    <!-- Administrador -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between col-span-1 md:col-span-2">

      <div>

        <p class="text-sm font-medium text-gray-500">
          Administrador
        </p>

        <h3 class="text-lg font-bold text-gray-800">
          {{ userFullName }}
        </h3>

        <div class="flex items-center mt-1 space-x-4">

          <!-- email -->
          <div class="flex items-center text-sm text-gray-600">

            <svg xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">

              <path stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />

            </svg>

            {{ userEmail }}

          </div>

          <!-- licencia -->

          <div class="flex items-center text-sm" :class="licenseClass">

            <span
              class="w-2 h-2 rounded-full mr-2"
              :class="licenseDotClass"
            ></span>

            Licencia: {{ licenseText }}

          </div>

        </div>

      </div>


      <!-- avatar -->

      <div class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full">
        <span class="text-lg font-bold">
          {{ userInitials }}
        </span>
      </div>

    </div>

  </div>
</template>



<script setup>

import { computed } from 'vue'


const props = defineProps({

  empleados: {
    type: Array,
    default: () => []
  },

  restaurantes: {
    type: Array,
    default: () => []
  },

  maxRestaurants: {
    type: Number,
    default: 0
  },

  user: {
    type: Object,
    default: () => ({})
  }

})


/*
------------------------------------------------
Restaurantes activos
------------------------------------------------
*/

const activeRestaurants = computed(() => {

  return props.restaurantes.filter(r => r?.activo !== false).length

})



/*
------------------------------------------------
Nombre completo
------------------------------------------------
*/

const userFullName = computed(() => {

  if (!props.user) return 'Usuario'

  if (props.user.name) return props.user.name

  const nombre = props.user.nombre || ''
  const apellido = props.user.apellido || ''

  const full = `${nombre} ${apellido}`.trim()

  return full || 'Usuario'

})



/*
------------------------------------------------
Email
------------------------------------------------
*/

const userEmail = computed(() => {

  return props.user?.email || props.user?.correo || 'Sin email'

})



/*
------------------------------------------------
Iniciales
------------------------------------------------
*/

const userInitials = computed(() => {

  if (!props.user?.name) return 'U'

  return props.user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

})



/*
------------------------------------------------
Licencia
------------------------------------------------
*/

const licenseText = computed(() => {

  if (props.maxRestaurants >= 5) return 'Empresarial'

  if (props.maxRestaurants >= 3) return 'Profesional'

  if (props.maxRestaurants >= 1) return 'Básico'

  return 'Sin licencia'

})


const licenseClass = computed(() => ({

  'text-green-600': licenseText.value !== 'Sin licencia',

  'text-gray-500': licenseText.value === 'Sin licencia'

}))


const licenseDotClass = computed(() => ({

  'bg-green-500': licenseText.value !== 'Sin licencia',

  'bg-gray-400': licenseText.value === 'Sin licencia'

}))

</script>