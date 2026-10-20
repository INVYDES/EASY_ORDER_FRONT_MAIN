<template>
  <div v-if="restauranteNombre"
    class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#DDE3DE] rounded-lg shadow-xs">
    <span class="w-2 h-2 rounded-full bg-[#26734D]"></span>
    <span class="text-xs font-medium text-[#68736C]">
      Sucursal:
      <span class="text-[#202723] font-semibold ml-1">{{ restauranteNombre }}</span>
    </span>
  </div>
</template>

<script setup>
import { sessionGet, sessionSet } from '@/utils/session'
import { ref, onMounted } from 'vue'
import { apiClient } from '@/utils/apiClient'

const restauranteNombre = ref('')

const getToken = () => {
  return sessionGet('token')
}

const fetchSucursalActual = async () => {
  try {
    const token = getToken()
    if (!token) {
      restauranteNombre.value = sessionGet('restaurante_nombre') || ''
      return
    }

    const data = await apiClient.get('/me')
    const userData = data.data || data

    // El nombre viene en userData.restaurante.nombre
    if (userData.restaurante?.nombre) {
      restauranteNombre.value = userData.restaurante.nombre
      sessionSet('restaurante_nombre', restauranteNombre.value)
    } else {
      restauranteNombre.value = sessionGet('restaurante_nombre') || ''
    }

  } catch (error) {
    console.error("[SucursalBadge] Error:", error.message)
    restauranteNombre.value = sessionGet('restaurante_nombre') || ''
  }
}

onMounted(() => {
  fetchSucursalActual()
})
</script>

<style scoped>
div {
  user-select: none;
}
</style>