<template>
  <div class="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg text-white">
    <div class="flex items-center gap-3 mb-5">
      <div class="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-2xl">📦</div>
      <div>
        <h3 class="text-lg font-bold">Sugerencia de Paquete Estratégico</h3>
        <p class="text-indigo-100 text-xs">Cocina (mayor utilidad, fuera Top 10) · Bebida #1 ventas · Postre menor volumen con ROI+</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Cocina -->
      <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-2xl">🍳</span>
          <span class="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">Cocina</span>
          <span class="ml-auto text-[10px] text-indigo-200">Alta Utilidad</span>
        </div>
        <p class="font-bold text-base leading-tight">{{ bundle.kitchen || 'Calculando...' }}</p>
        <p class="text-indigo-200 text-xs mt-1">No está en Top 10 ventas</p>
        <div v-if="bundle.kitchenMargen" class="mt-2 flex items-center gap-1">
          <span class="text-emerald-300 text-xs font-black">${{ fmtM(bundle.kitchenMargen) }}</span>
          <span class="text-indigo-300 text-[10px]">margen unitario</span>
        </div>
      </div>

      <!-- Bebida -->
      <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-2xl">🥤</span>
          <span class="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">Bebida</span>
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
      <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-2xl">🍮</span>
          <span class="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">Postre</span>
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
        class="px-5 py-2 bg-white text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-50 transition uppercase tracking-wide shrink-0">
        Ejecutar Paquete
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  products: { type: Array, required: true, default: () => [] }
})

const fmtM = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'

const bundle = computed(() => {
  if (!props.products || props.products.length === 0) return { kitchen: 'N/A', drink: 'N/A', dessert: 'N/A' }

  // 0. Determinar umbral dinámico (si hay pocos, solo excluimos los 2 mejores para Cocina)
  const excludeCount = props.products.length > 10 ? 10 : Math.ceil(props.products.length * 0.3);

  // Top ventas para exclusión
  const topExclusion = [...props.products]
    .sort((a, b) => (b.ventas || 0) - (a.ventas || 0))
    .slice(0, excludeCount)
    .map(p => p.id)

  // Helpers de categorías flexibles
  const isDrink = (cat) => ['bebida', 'bebidas', 'refresco', 'refrescos', 'jugo', 'jugos', 'agua', 'aguas'].includes(cat?.toLowerCase());
  const isDessert = (cat) => ['postre', 'postres', 'dulce', 'reposteria', 'pastel', 'pasteles'].includes(cat?.toLowerCase());
  const isKitchen = (cat) => !isDrink(cat) && !isDessert(cat);

  // 1. Cocina: Mayor margen, NO en el top de ventas actual
  const kitchen = props.products
    .filter(p => isKitchen(p.categoria) && !topExclusion.includes(p.id))
    .sort((a, b) => ((b.precio || 0) - (b.costo || 0)) - ((a.precio || 0) - (a.costo || 0)))[0] 
    || props.products.sort((a, b) => ((b.precio || 0) - (b.costo || 0)) - ((a.precio || 0) - (a.costo || 0)))[0];

  // 2. Bebida: #1 en ventas
  const drink = props.products
    .filter(p => isDrink(p.categoria))
    .sort((a, b) => (b.ventas || 0) - (a.ventas || 0))[0]
    || props.products.filter(p => isDrink(p.categoria))[0];

  // 3. Postre: Menor volumen con ROI positivo
  const dessert = props.products
    .filter(p => isDessert(p.categoria) && (p.precio || 0) > (p.costo || 0))
    .sort((a, b) => (a.ventas || 0) - (b.ventas || 0))[0]
    || props.products.filter(p => isDessert(p.categoria))[0];

  return {
    kitchen: kitchen?.nombre || 'N/A',
    kitchenMargen: kitchen ? (kitchen.precio || 0) - (kitchen.costo || 0) : null,
    drink: drink?.nombre || 'N/A',
    drinkVentas: drink?.ventas || 0,
    dessert: dessert?.nombre || 'N/A',
    dessertVentas: dessert?.ventas || 0,
  }
})

const executeBundle = () => {
  alert(`Paquete estratégico enviado:\n🍳 ${bundle.value.kitchen}\n🥤 ${bundle.value.drink}\n🍮 ${bundle.value.dessert}`)
}
</script>
