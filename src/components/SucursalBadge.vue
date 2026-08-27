<template>
  <div v-if="restauranteNombre"
    class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-300">

    <span class="w-2 h-2 rounded-full bg-emerald-400 mr-2.5 animate-pulse ring-2 ring-emerald-400/50"></span>

    <span class="text-xs font-bold text-white tracking-wide uppercase">
      🏪 Sucursal:
      <span class="text-white font-black ml-1.5">{{ restauranteNombre }}</span>
    </span>
  </div>
</template>

<script setup>
import { sessionGet, sessionSet, sessionRemove } from '@/utils/session'
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

    // ✅ El nombre viene en userData.restaurante.nombre
    if (userData.restaurante?.nombre) {
      restauranteNombre.value = userData.restaurante.nombre
      sessionSet('restaurante_nombre', restauranteNombre.value)
    } else {
      restauranteNombre.value = sessionGet('restaurante_nombre') || ''
    }

  } catch (error) {
    console.error("❌ [SucursalBadge] Error:", error.message)
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
  backdrop-filter: blur(4px);
}
</style>