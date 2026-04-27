<template>
  <div class="space-y-6">

    <SucursalBadge />

    <!-- Encabezado -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Análisis</h2>
      <p class="text-gray-500 text-sm mt-1">Métricas y rendimiento del negocio</p>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
      <button v-for="t in tabs" :key="t.key" @click="activeTab = t.key"
        :class="['px-5 py-2 text-sm font-medium rounded-lg transition',
          activeTab === t.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200']">
        {{ t.label }}
      </button>
    </div>

    <!-- ══ KPIs VENTAS ══ -->
    <template v-if="activeTab === 'kpis'">
      <KpiVentas :api-url="API_URL" :get-headers="getHeaders" />
    </template>

    <!-- ══ KPIs PRODUCTOS ══ -->
    <template v-if="activeTab === 'productos'">
      <KpiProductos :api-url="API_URL" :get-headers="getHeaders" />
    </template>

    <!-- ══ ROI ══ -->
    <template v-if="activeTab === 'roi'">
      <RoiChart :api-url="API_URL" :get-headers="getHeaders" />
    </template>

    <!-- ══ MÉTRICAS MESEROS ══ -->
    <template v-if="activeTab === 'meseros'">
      <MetricasMeseros :api-url="API_URL" :get-headers="getHeaders" />
    </template>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import SucursalBadge   from '../components/SucursalBadge.vue'
import KpiVentas       from '../components/administraccion/KpiVentas.vue'
import KpiProductos    from '../components/administraccion/KpiProductos.vue'
import RoiChart        from '../components/RoiChart.vue'
import MetricasMeseros from '../components/administraccion/MetricasMeseros.vue'

import { API_URL } from '@/config/api'

const activeTab = ref('kpis')

const tabs = [
  { key: 'kpis',      label: '📊 KPIs Ventas'    },
  { key: 'productos', label: '📦 KPIs Productos'  },
  { key: 'roi',       label: '📈 ROI'              },
  { key: 'meseros',   label: '👥 Métricas Meseros' },
]

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 'Content-Type':'application/json', Accept:'application/json', Authorization: token ? `Bearer ${token}` : '' }
}
</script>