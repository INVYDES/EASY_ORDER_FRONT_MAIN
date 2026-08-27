<script setup>
import { sessionGet, sessionSet, sessionRemove } from '@/utils/session'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import ProductoGrid from './productogrid.vue'
import Sumaorden from './sumaorden.vue'
import { API_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'
const router = useRouter()

const productos = ref([])
const pedido = ref([])

const loading = ref(true)
const error = ref('')

const getHeaders = () => {
  const token = sessionGet('token')

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

const checkAuth = () => {
  const token = sessionGet('token')

  if (!token) {
    router.push('/')
    return false
  }

  return true
}

const cargarProductos = async () => {

  if (!checkAuth()) return

  loading.value = true

  try {

    const data = await apiClient.get('/productos')

    if (data.success) {
      productos.value = data.data || []
    }

  } catch (err) {

    console.error(err)
    error.value = 'Error al cargar productos'

  } finally {

    loading.value = false

  }
}

onMounted(() => {
  cargarProductos()
})

/* ---------- FILTROS ---------- */

const productosComida = computed(() =>
  productos.value.filter(p => p.categoria?.id === 1)
)

const productosBebida = computed(() =>
  productos.value.filter(p => p.categoria?.id === 2)
)

/* ---------- PEDIDO ---------- */

const agregarAlPedido = (producto) => {

  const existe = pedido.value.find(p => p.id === producto.id)

  if (existe) {

    existe.cantidad++

  } else {

    pedido.value.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    })

  }

}

const eliminarDelPedido = (id) => {

  const index = pedido.value.findIndex(p => p.id === id)

  if (index !== -1) {

    if (pedido.value[index].cantidad > 1) {
      pedido.value[index].cantidad--
    } else {
      pedido.value.splice(index, 1)
    }

  }

}

const totalPedido = computed(() =>
  pedido.value.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
)

</script>

<template>
  <div class="p-6">

    <div class="grid grid-cols-12 gap-6">

      <!-- PRODUCTOS -->
      <div class="col-span-8">

        <div v-if="loading" class="text-center py-10">
          <p class="text-gray-500">Cargando productos...</p>
        </div>

        <template v-else>

          <!-- COMIDA -->
          <h2 class="text-xl font-bold mb-3">🍽 Comida</h2>

          <ProductoGrid
            :productos="productosComida"
            @agregar="agregarAlPedido"
          />

          <!-- BEBIDAS -->
          <h2 class="text-xl font-bold mt-8 mb-3">🥤 Bebidas</h2>

          <ProductoGrid
            :productos="productosBebida"
            @agregar="agregarAlPedido"
          />

        </template>

      </div>

      <!-- PEDIDO -->
      <div class="col-span-4">

        <Sumaorden
          :items="pedido"
          :total="totalPedido"
          @eliminar="eliminarDelPedido"
        />

      </div>

    </div>

  </div>
</template>