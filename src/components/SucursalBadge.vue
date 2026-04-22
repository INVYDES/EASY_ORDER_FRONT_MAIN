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
import { ref, onMounted } from 'vue'
import { API_URL } from '@/config/api'

const restauranteNombre = ref('')

// Intentar cargar desde localStorage primero
const restauranteActivoData = localStorage.getItem('restaurante_activo')
if (restauranteActivoData) {
  try {
    const data = JSON.parse(restauranteActivoData)
    restauranteNombre.value = data.nombre || ''
    console.log("✅ [SucursalBadge] Nombre cargado desde restaurante_activo:", restauranteNombre.value)
  } catch (e) {
    console.warn("⚠️ [SucursalBadge] Error al parsear restaurante_activo:", e)
  }
}

const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

const fetchSucursalActual = async () => {
  console.log("🔄 [SucursalBadge] Iniciando fetchSucursalActual...")
  
  try {
    const token = getToken()
    
    if (!token) {
      console.warn("⚠️ [SucursalBadge] No hay token disponible, usando datos de localStorage")
      if (!restauranteNombre.value) {
        restauranteNombre.value = localStorage.getItem('restaurante_nombre') || ''
      }
      return
    }

    // ✅ Usar el endpoint /me que devuelve el usuario con restaurante_activo
    const url = `${API_URL}/me`
    console.log("🌐 [SucursalBadge] Fetching desde:", url)

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log("📦 [SucursalBadge] Respuesta:", data)

    // La respuesta puede estar en data.data o directamente en data
    const userData = data.data || data
    
    if (userData.restaurante_activo && userData.restaurante_activo.nombre) {
      restauranteNombre.value = userData.restaurante_activo.nombre
      console.log("✅ [SucursalBadge] Nombre desde restaurante_activo:", restauranteNombre.value)
      localStorage.setItem('restaurante_nombre', restauranteNombre.value)
    } 
    // Fallback: si no tiene restaurante_activo pero tiene restaurantes asignados
    else if (userData.restaurantes && userData.restaurantes.length > 0) {
      restauranteNombre.value = userData.restaurantes[0].nombre
      console.log("✅ [SucursalBadge] Nombre desde primer restaurante:", restauranteNombre.value)
      localStorage.setItem('restaurante_nombre', restauranteNombre.value)
    }
    else {
      console.warn("⚠️ [SucursalBadge] No se encontró restaurante activo")
      restauranteNombre.value = localStorage.getItem('restaurante_nombre') || ''
    }
    
  } catch (error) {
    console.error("❌ [SucursalBadge] Error:", error.message)
    restauranteNombre.value = localStorage.getItem('restaurante_nombre') || restauranteNombre.value || ''
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