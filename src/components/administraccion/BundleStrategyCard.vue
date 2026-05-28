<template>
  <div class="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg text-white">
    <div class="flex items-center gap-3 mb-5">
      <div class="w-11 h-11 bg-white dark:bg-gray-800/20 rounded-xl flex items-center justify-center text-2xl">📦</div>
      <div>
        <h3 class="text-lg font-bold">Sugerencia de Paquete Estratégico</h3>
        <p class="text-indigo-100 text-xs">Cocina (mayor utilidad, fuera Top 10) · Bebida #1 ventas · Postre menor volumen con ROI+</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Cocina -->
      <div class="bg-white dark:bg-gray-800/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-2xl">🍳</span>
          <span class="text-xs bg-white dark:bg-gray-800/20 px-2 py-0.5 rounded-full font-bold uppercase">Cocina</span>
          <span class="ml-auto text-[10px] text-indigo-200">Alta Utilidad</span>
        </div>
        <p class="font-bold text-base leading-tight">{{ bundle.kitchen || 'Calculando...' }}</p>
        <p class="text-indigo-200 text-xs mt-1">No está en Top 10 ventas</p>
        <div v-if="bundle.kitchenVentas !== undefined" class="mt-2 flex items-center gap-1">
          <span class="text-emerald-300 text-xs font-black">{{ bundle.kitchenVentas }} uds</span>
          <span class="text-indigo-300 text-[10px]">vendidas</span>
        </div>
      </div>

      <!-- Bebida -->
      <div class="bg-white dark:bg-gray-800/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-2xl">🥤</span>
          <span class="text-xs bg-white dark:bg-gray-800/20 px-2 py-0.5 rounded-full font-bold uppercase">Bebida</span>
          <span class="ml-auto text-[10px] text-indigo-200">Top Ventas</span>
        </div>
        <p class="font-bold text-base leading-tight">{{ bundle.drink || 'Calculando...' }}</p>
        <p class="text-indigo-200 text-xs mt-1">Bebida más vendida</p>
        <div v-if="bundle.drinkVentas" class="mt-2 flex items-center gap-1">
          <span class="text-emerald-300 text-xs font-black">{{ bundle.drinkVentas }} uds</span>
          <span class="text-indigo-300 text-[10px]">vendidas</span>
        </div>
      </div>

      <!-- Postre -->
      <div class="bg-white dark:bg-gray-800/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-2xl">🍮</span>
          <span class="text-xs bg-white dark:bg-gray-800/20 px-2 py-0.5 rounded-full font-bold uppercase">Postre</span>
          <span class="ml-auto text-[10px] text-indigo-200">Bajo Vol. (ROI+)</span>
        </div>
        <p class="font-bold text-base leading-tight">{{ bundle.dessert || 'Calculando...' }}</p>
        <p class="text-indigo-200 text-xs mt-1">Menor volumen con ROI positivo</p>
        <div v-if="bundle.dessertVentas !== undefined" class="mt-2 flex items-center gap-1">
          <span class="text-emerald-300 text-xs font-black">{{ bundle.dessertVentas }} uds</span>
          <span class="text-indigo-300 text-[10px]">vendidas</span>
        </div>
      </div>
    </div>

    <div class="mt-5 flex items-center justify-between">
      <p class="text-[11px] text-indigo-200 italic">
        Lógica: Margen Max(Cocina ∉ Top10) + Ventas Max(Bebida) + Vol Min(Postre con ROI+)
      </p>
      <button @click="executeBundle"
        class="px-5 py-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-50 dark:bg-indigo-900/30 transition uppercase tracking-wide shrink-0">
        Ejecutar Paquete
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'

const emit = defineEmits(['execute'])

const props = defineProps({
  products: { type: Array, required: true, default: () => [] }
})

onMounted(() => {
  console.log('📊 BundleStrategyCard montado. Productos:', props.products?.length)
})

const num = (v) => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return v
  const clean = String(v).replace(/[$,\s%]/g, '')
  const n = parseFloat(clean)
  return isNaN(n) ? 0 : n
}

const bundle = computed(() => {
  const source = Array.isArray(props.products) ? props.products : []
  
  if (source.length === 0) {
    return { kitchen: 'Cargando...', drink: 'Cargando...', dessert: 'Cargando...' }
  }

  const result = {
    kitchen: 'N/A', kitchenMargen: 0, kitchenVentas: 0, kitchenObj: null,
    drink: 'N/A', drinkVentas: 0, drinkObj: null,
    dessert: 'N/A', dessertVentas: 0, dessertObj: null
  }

  try {
    const safeProducts = source.filter(p => p && typeof p === 'object')
    
    // Función interna para obtener ventas de forma flexible
    const getVentas = (p) => num(p.ventas_count) || num(p.ventas) || num(p.cantidad_vendida) || 0;

    // Top ventas para exclusión
    const sortedBySales = [...safeProducts].sort((a, b) => getVentas(b) - getVentas(a))
    const excludeCount = Math.max(2, Math.ceil(safeProducts.length * 0.2))
    const topExclusionIds = sortedBySales.slice(0, excludeCount).map(p => p.id)

    // Helpers de categorías
    const getCatName = (p) => {
      if (!p) return ''
      if (typeof p.categoria === 'object' && p.categoria !== null) return String(p.categoria.nombre || '').toLowerCase()
      return String(p.categoria || '').toLowerCase()
    }

    const isDrink = (p) => {
      const c = getCatName(p)
      return ['bebida', 'bebidas', 'refresco', 'refrescos', 'jugo', 'jugos', 'agua', 'aguas', 'barra', 'barras'].includes(c)
    }
    const isDessert = (p) => {
      const c = getCatName(p)
      return ['postre', 'postres', 'dulce', 'reposteria', 'pastel', 'pasteles', 'nieve', 'helado'].includes(c)
    }
    const isKitchen = (p) => {
      const c = getCatName(p)
      if (!c) return true
      return !isDrink(p) && !isDessert(p)
    }

    // 1. Cocina
    try {
      const kitchenOptions = safeProducts.filter(p => isKitchen(p) && !topExclusionIds.includes(p.id))
      const k = kitchenOptions.length > 0 
        ? kitchenOptions.sort((a, b) => (num(b.precio) - num(b.costo)) - (num(a.precio) - num(a.costo)))[0]
        : safeProducts.sort((a, b) => (num(b.precio) - num(b.costo)) - (num(a.precio) - num(a.costo)))[0]
      
      if (k) {
        result.kitchen = k.nombre
        result.kitchenMargen = num(k.precio) - num(k.costo)
        result.kitchenVentas = getVentas(k)
        result.kitchenObj = k
      }
    } catch (e1) { console.error('Error Cocina:', e1) }

    // 2. Bebida
    try {
      const drinkOptions = safeProducts.filter(p => isDrink(p))
      const d = drinkOptions.length > 0
        ? drinkOptions.sort((a, b) => getVentas(b) - getVentas(a))[0]
        : null
      
      if (d) {
        result.drink = d.nombre
        result.drinkVentas = getVentas(d)
        result.drinkObj = d
      }
    } catch (e2) { console.error('Error Bebida:', e2) }

    // 3. Postre
    try {
      const dessertOptions = safeProducts.filter(p => isDessert(p))
      const ds = dessertOptions.length > 0
        ? dessertOptions.sort((a, b) => getVentas(a) - getVentas(b))[0]
        : null
      
      if (ds) {
        result.dessert = ds.nombre
        result.dessertVentas = getVentas(ds)
        result.dessertObj = ds
      }
    } catch (e3) { console.error('Error Postre:', e3) }

  } catch (err) {
    console.error('❌ Error general en BundleStrategyCard:', err)
  }

  return result
})

const executeBundle = () => {
  if (bundle.value.kitchen === 'N/A' || bundle.value.kitchen === 'Cargando...') return
  
  const suggestedProducts = []
  if (bundle.value.kitchenObj) suggestedProducts.push(bundle.value.kitchenObj)
  if (bundle.value.drinkObj) suggestedProducts.push(bundle.value.drinkObj)
  if (bundle.value.dessertObj) suggestedProducts.push(bundle.value.dessertObj)

  emit('execute', suggestedProducts)
}
</script>
