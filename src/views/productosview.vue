<template>
  <div class="space-y-5 p-4 sm:p-6">

    <ToastContainer :toasts="toasts" @remove="removeToast" />

    <!-- Sucursal badge + Header -->
    <SucursalBadge />

    <ProductsHeader
      v-model="searchTerm"
      @new="openCreate"
      @import="showImport = true"
      @export="exportProducts"
    />

    <!-- Sugerencia Estratégica (Posición Superior Prioritaria) -->
    <div class="relative z-10 my-4">
      <BundleStrategyCard 
        :key="'strategy-' + allProductsForSelection.length"
        :products="allProductsForSelection" 
        @execute="handleExecuteBundle"
      />
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1 w-fit flex-wrap">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'px-5 py-2 text-sm font-medium rounded-lg transition',
          activeTab === tab.key ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
        ]"
      >
        {{ tab.label }}
        <span
          class="ml-1.5 text-xs font-bold rounded-full px-1.5 py-0.5"
          :class="activeTab === tab.key ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'"
        >
          {{ getTabCount(tab.key) }}
        </span>
      </button>
    </div>

    <!-- ── PAQUETES ───────────────────────────────────────── -->
    <div v-if="activeTab === 'paquetes'" class="space-y-4">
      <div class="flex items-center gap-4">
        <!-- Buscador de paquetes -->
        <div class="relative flex-1 max-w-md">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model="searchTermPaquetes"
            @input="debouncedSearchPaquetes"
            type="text"
            placeholder="Buscar paquete por nombre..."
            class="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition shadow-sm"
          />
          <button
            v-if="searchTermPaquetes"
            @click="searchTermPaquetes = ''; loadPaquetes(1)"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition text-xs"
          >✕</button>
        </div>
        <button
          @click="openCreatePaquete"
          class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition ml-auto"
        >
          <span class="text-base leading-none">＋</span> Nuevo Paquete
        </button>
      </div>
      <PaquetesTable 
        :paquetes="paquetes"
        :pagination="paginationPaquetes"
        :loading="loading.paquetes"
        :total-sueldos-base="totalSueldosBase"
        @edit="openEditPaquete"
        @delete="handleDeletePaquete"
        @toggle-active="handleToggleActivePaquete"
        @change-page="changePagePaquetes"
      />
    </div>

    <!-- ══ PRODUCTOS ═════════════════════════════════════════ -->
    <div v-if="activeTab === 'productos'">
      <!-- Buscador de productos -->
      <div class="mb-4">
        <div class="relative max-w-md">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model="searchTerm"
            @input="debouncedSearch"
            type="text"
            placeholder="Buscar producto por nombre..."
            class="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition shadow-sm"
          />
          <button
            v-if="searchTerm"
            @click="searchTerm = ''; loadProducts(1)"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition text-xs"
          >✕</button>
        </div>
      </div>
      <ProductsTable
        :products="products"
        :pagination="pagination"
        :loading="loading.products"
        :search-term="searchTerm"
        @edit="openEdit"
        @delete="handleDelete"
        @toggle-active="handleToggleActive"
        @change-page="changePage"
      />
    </div>

    <!-- ── CATEGORÍAS (ELIMINADO POR PETICIÓN: AHORA SON FIJAS) ── -->

    <!-- ── INGREDIENTES ───────────────────────────────────── -->
    <div v-else-if="activeTab === 'ingredientes'">
      <!-- ... (todo tu código de ingredientes existente se mantiene igual) ... -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">🧄 Ingredientes</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Inventario y costos de ingredientes</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="showListaCompras = true"
            class="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition shadow-sm cursor-pointer"
          >
            📦 Lista de compras
          </button>
          <button
            @click="abrirModalIngrediente()"
            class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm cursor-pointer"
          >
            ＋ Nuevo ingrediente
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-indigo-500">
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total ingredientes</p>
          <p class="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">{{ statsIngredientes.total }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-amber-500">
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Bajo stock ⚠️</p>
          <p class="text-2xl font-black text-amber-600 mt-1">{{ statsIngredientes.bajo_stock }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-red-500">
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Sin stock 🚨</p>
          <p class="text-2xl font-black text-red-600 mt-1">{{ statsIngredientes.sin_stock }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-emerald-500">
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Valor inventario</p>
          <p class="text-2xl font-black text-emerald-600 mt-1">${{ formatearMoneda(statsIngredientes.costo_total) }}</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex items-center gap-3 flex-wrap mb-6">
        <input
          v-model="buscarIngrediente"
          type="text"
          placeholder="🔍 Buscar ingrediente..."
          class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64"
        />
        <button
          @click="filtroBajoStock = !filtroBajoStock"
          :class="['px-4 py-2 rounded-xl text-sm font-semibold transition border',
            filtroBajoStock ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 text-amber-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600']"
        >
          ⚠️ Solo bajo stock
        </button>
        <span class="text-xs text-gray-400 dark:text-gray-500 ml-auto">{{ ingredientesFiltrados.length }} ingredientes</span>
      </div>

      <!-- Tabla de ingredientes -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <LoadingSpinner v-if="loading.ingredientes" text="Cargando ingredientes..." />
        <div v-else-if="ingredientesFiltrados.length === 0" class="text-center py-16 text-gray-400 dark:text-gray-500">
          <span class="text-4xl block mb-3">🧄</span>
          <p>No hay ingredientes{{ buscarIngrediente ? ' con ese nombre' : ' registrados' }}</p>
          <button @click="abrirModalIngrediente()" class="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition">
            Agregar el primero
          </button>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Ingrediente</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Unidad</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Costo/unidad</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Stock actual</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Stock mín.</th>
                <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="ing in ingredientesFiltrados"
                :key="ing.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                :class="ing.sin_stock ? 'bg-red-50/40' : ing.bajo_stock ? 'bg-amber-50/40' : ''"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                      :class="ing.sin_stock ? 'bg-red-100' : ing.bajo_stock ? 'bg-amber-100' : 'bg-indigo-50 dark:bg-indigo-900/30'"
                    >
                      {{ ing.sin_stock ? '🚨' : ing.bajo_stock ? '⚠️' : '🧄' }}
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ ing.nombre }}</p>
                    <p v-if="ing.proveedor" class="text-xs text-gray-400 dark:text-gray-500">{{ ing.proveedor }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{{ ing.unidad }}</td>
                <td class="px-5 py-4 text-sm font-medium text-right text-gray-800 dark:text-gray-200">{{ ing.costo_formateado }}</td>
                <td class="px-5 py-4 text-right">
                  <span class="text-sm font-bold" :class="ing.sin_stock ? 'text-red-600' : ing.bajo_stock ? 'text-amber-600' : 'text-gray-800 dark:text-gray-200'">
                    {{ ing.stock_actual }}
                  </span>
                  <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">{{ ing.unidad }}</span>
                </td>
                <td class="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 text-right">{{ ing.stock_minimo }} {{ ing.unidad }}</td>
                <td class="px-5 py-4 text-center">
                  <span
                    class="px-2.5 py-1 text-xs font-semibold rounded-full"
                    :class="ing.sin_stock ? 'bg-red-100 text-red-700' : ing.bajo_stock ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
                  >
                    {{ ing.sin_stock ? 'Sin stock' : ing.bajo_stock ? 'Bajo stock' : 'OK' }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right">
                  <div class="flex justify-end gap-1">
                    <button @click="abrirAjusteStock(ing)" class="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition font-medium">📦 Stock</button>
                    <button @click="abrirModalIngrediente(ing)" class="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition font-medium">✏️</button>
                    <button @click="handleDeleteIngrediente(ing.id)" class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition font-medium">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── INSUMOS PREPARADOS ─────────────────────────────── -->
    <div v-else-if="activeTab === 'insumos_preparados'" class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">🥘 Insumos Preparados</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Mise en place — ingredientes pre-preparados (salsas, cortes, porciones)</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="abrirModalInsumoPreparado()"
            class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm cursor-pointer">
            ＋ Nuevo insumo preparado
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-indigo-500">
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total insumos</p>
          <p class="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">{{ insumosPreparados.length }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-amber-500">
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Bajo stock ⚠️</p>
          <p class="text-2xl font-black text-amber-600 mt-1">{{ statsInsumos.bajo_stock }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-red-500">
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Sin stock 🚨</p>
          <p class="text-2xl font-black text-red-600 mt-1">{{ statsInsumos.sin_stock }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-emerald-500">
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Valor inventario</p>
          <p class="text-2xl font-black text-emerald-600 mt-1">${{ formatearMoneda(statsInsumos.costo_total) }}</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex items-center gap-3 flex-wrap">
        <input v-model="buscarInsumo" type="text" placeholder="🔍 Buscar insumo preparado..."
          class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64" />
        <span class="text-xs text-gray-400 dark:text-gray-500 ml-auto">{{ insumosFiltrados.length }} insumos</span>
      </div>

      <!-- Tabla -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <LoadingSpinner v-if="loading.insumosPreparados" text="Cargando insumos preparados..." />
        <div v-else-if="insumosFiltrados.length === 0" class="text-center py-16 text-gray-400 dark:text-gray-500">
          <span class="text-4xl block mb-3">🥘</span>
          <p>No hay insumos preparados{{ buscarInsumo ? ' con ese nombre' : ' registrados' }}</p>
          <button @click="abrirModalInsumoPreparado()" class="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition">
            Agregar el primero
          </button>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Insumo</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Unidad</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Costo/unidad</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Stock actual</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Stock mín.</th>
                <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="ins in insumosFiltrados" :key="ins.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                :class="ins.sin_stock ? 'bg-red-50/40' : ins.bajo_stock ? 'bg-amber-50/40' : ''">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                      :class="ins.sin_stock ? 'bg-red-100' : ins.bajo_stock ? 'bg-amber-100' : 'bg-indigo-50 dark:bg-indigo-900/30'">
                      {{ ins.sin_stock ? '🚨' : ins.bajo_stock ? '⚠️' : '🥘' }}
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ ins.nombre }}</p>
                      <p v-if="ins.receta_count" class="text-xs text-gray-400 dark:text-gray-500">{{ ins.receta_count }} ingrediente(s) en receta</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{{ ins.unidad }}</td>
                <td class="px-5 py-4 text-sm font-medium text-right text-gray-800 dark:text-gray-200">{{ ins.costo_formateado }}</td>
                <td class="px-5 py-4 text-right">
                  <span class="text-sm font-bold" :class="ins.sin_stock?'text-red-600':ins.bajo_stock?'text-amber-600':'text-gray-800 dark:text-gray-200'">
                    {{ ins.stock_actual }}
                  </span>
                  <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">{{ ins.unidad }}</span>
                </td>
                <td class="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 text-right">{{ ins.stock_minimo }} {{ ins.unidad }}</td>
                <td class="px-5 py-4 text-center">
                  <span class="px-2.5 py-1 text-xs font-semibold rounded-full"
                    :class="ins.sin_stock ? 'bg-red-100 text-red-700' : ins.bajo_stock ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">
                    {{ ins.sin_stock ? 'Sin stock' : ins.bajo_stock ? 'Bajo stock' : 'OK' }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right">
                  <div class="flex justify-end gap-1">
                    <button @click="abrirAjusteStockInsumo(ins)"
                      class="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition font-medium">
                      📦 Stock
                    </button>
                    <button @click="editarInsumoPreparado(ins)"
                      class="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition font-medium">
                      ✏️
                    </button>
                    <button @click="eliminarInsumoPreparado(ins.id)"
                      class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition font-medium">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Insumo Preparado -->
      <div v-if="showModalInsumo" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
        @click.self="showModalInsumo=false">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">{{ editandoInsumo ? 'Editar insumo preparado' : 'Nuevo insumo preparado' }}</h3>
            <button @click="showModalInsumo=false" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 text-xl">✕</button>
          </div>
          <div v-if="formErrorInsumo" class="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">{{ formErrorInsumo }}</div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
              <input v-model="formInsumo.nombre" type="text" placeholder="Ej. Salsa de tomate"
                class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidad *</label>
                <select v-model="formInsumo.unidad"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                  <option value="gramos">gramos</option>
                  <option value="kilogramos">kilogramos</option>
                  <option value="mililitros">mililitros</option>
                  <option value="litros">litros</option>
                  <option value="piezas">piezas</option>
                  <option value="porciones">porciones</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Costo unitario *</label>
                <div class="relative">
                  <span class="absolute left-3 top-3 text-gray-400 dark:text-gray-500 text-xs">$</span>
                  <input v-model="formInsumo.costo_unitario" type="number" min="0" step="0.0001" placeholder="0.00"
                    class="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock actual</label>
                <input v-model="formInsumo.stock_actual" type="number" min="0" step="0.001"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock mínimo</label>
                <input v-model="formInsumo.stock_minimo" type="number" min="0" step="0.001"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vida útil (días)</label>
              <input v-model="formInsumo.vida_util_dias" type="number" min="0" step="1" placeholder="Ej. 7"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Receta (ingredientes crudos)</label>
              <p class="text-xs text-gray-400 dark:text-gray-500 mb-2">Define qué ingredientes crudos componen este insumo preparado.</p>
              <div class="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                <div v-for="(ri, idx) in formInsumo.receta" :key="idx" class="flex items-center gap-2">
                  <select v-model="ri.ingrediente_id" class="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
                    <option value="">Seleccionar ingrediente</option>
                    <option v-for="ing in ingredientes" :key="ing.id" :value="ing.id">{{ ing.nombre }}</option>
                  </select>
                  <input v-model="ri.cantidad" type="number" min="0" step="0.001" placeholder="Cant."
                    class="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-center" />
                  <span class="text-xs text-gray-400 w-12">{{ unidadIngrediente(ri.ingrediente_id) }}</span>
                  <button @click="formInsumo.receta.splice(idx, 1)" class="text-red-400 hover:text-red-600 text-sm">✕</button>
                </div>
                <button @click="formInsumo.receta.push({ ingrediente_id: '', cantidad: '' })"
                  class="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">＋ Agregar ingrediente</button>
              </div>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="showModalInsumo=false"
              class="flex-1 py-2.5 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">Cancelar</button>
            <button @click="guardarInsumoPreparado" :disabled="guardandoInsumo"
              class="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
              {{ guardandoInsumo ? 'Guardando...' : (editandoInsumo ? 'Guardar cambios' : 'Crear insumo') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Ajuste Stock Insumo -->
      <div v-if="showAjusteStockInsumo" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
        @click.self="showAjusteStockInsumo=false">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">📦 Ajustar stock</h3>
            <button @click="showAjusteStockInsumo=false" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 text-xl">✕</button>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4"><strong>{{ insumoAjuste?.nombre }}</strong> — Stock actual: <strong>{{ insumoAjuste?.stock_actual }} {{ insumoAjuste?.unidad }}</strong></p>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
              <select v-model="ajusteFormInsumo.tipo"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cantidad</label>
              <input v-model="ajusteFormInsumo.cantidad" type="number" min="0" step="0.001"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo</label>
              <input v-model="ajusteFormInsumo.motivo" type="text" placeholder="Ej. Producción diaria"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="showAjusteStockInsumo=false"
              class="flex-1 py-2.5 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">Cancelar</button>
            <button @click="guardarAjusteStockInsumo" :disabled="guardandoInsumo"
              class="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
              Guardar ajuste
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── ANUNCIOS / OFERTAS ───────────────────────────────────── -->
    <div v-else-if="activeTab === 'anuncios'">
      <AnunciosView />
    </div>
 
    <!-- ── MODALES ─────────────────────────────────────────── -->

    <!-- Productos -->
    <ProductFormModal
      v-if="showForm"
      :product="selectedProduct"
      :categorias="categories"
      @close="showForm = false"
      @saved="handleSaved"
    />
    <ProductImportModal
      v-if="showImport"
      @close="showImport = false"
      @imported="handleImported"
    />

    <!-- Categorías -->
    <CategoriaModal
      v-if="showCategoriaModal"
      :categoria="selectedCategoria"
      @close="showCategoriaModal = false"
      @saved="handleCategoriaSaved"
    />

    <!-- Ingredientes -->
    <IngredienteModal
      v-if="showIngredienteModal"
      :ingrediente="ingredienteEditando"
      @close="showIngredienteModal = false"
      @saved="handleIngredienteSaved"
    />
    <AjusteStockModal
      v-if="showAjusteStock"
      :ingrediente="ingredienteAjuste"
      @close="showAjusteStock = false"
      @saved="handleStockSaved"
    />
    
    <!-- Lista de Compras -->
    <ListaComprasModal
      v-if="showListaCompras"
      :ingredientes="ingredientes"
      @close="showListaCompras = false"
    />

    <!-- Paquetes -->
    <PaqueteFormModal 
      v-if="showPaqueteModal"
      :paquete="selectedPaquete"
      :available-products="allProductsForSelection"
      :initial-products="suggestedProductsForNewPaquete"
      @close="closePaqueteModal"
      @saved="handlePaqueteSaved"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

// Componentes
import SucursalBadge from '../components/SucursalBadge.vue'
import ProductsHeader from '../components/productos/ProductsHeader.vue'
import ProductsTable from '../components/productos/ProductsTable.vue'
import ProductFormModal from '../components/productos/ProductFormModal.vue'
import ProductImportModal from '../components/productos/ProductImportModal.vue'
import CategoriaModal from '../components/productos/CategoriaModal.vue'
import IngredienteModal from '../components/ingredientes/IngredienteModal.vue'
import ListaComprasModal from '../components/ingredientes/ListaComprasModal.vue'
import AjusteStockModal from '../components/productos/AjustesStockModal.vue'
import PaquetesTable from '../components/productos/PaquetesTable.vue'
import PaqueteFormModal from '../components/productos/PaqueteFormModal.vue'
import AnunciosView from './anunciosview.vue'
import BundleStrategyCard from '../components/administraccion/BundleStrategyCard.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useToast } from '@/composables/useToast'

import { STORAGE_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'

const router = useRouter()

// ── ESTADO GLOBAL ──────────────────────────────────────────
const activeTab = ref('productos')
const products = ref([])
const categories = ref([])
const ingredientes = ref([])
const paquetes = ref([])
const anuncios = ref([])
const selectedProduct = ref(null)
const selectedCategoria = ref(null)
const selectedPaquete = ref(null)
const suggestedProductsForNewPaquete = ref([])
const searchTerm = ref('')
const searchTermPaquetes = ref('')
const { toasts, showToast, removeToast } = useToast()

// ✅ PAGINACIÓN - AGREGADA
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: 0,
  to: 0
})

const paginationPaquetes = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0
})

// Modales
const showForm = ref(false)
const showImport = ref(false)
const showCategoriaModal = ref(false)
const showIngredienteModal = ref(false)
const showListaCompras = ref(false)
const showAjusteStock = ref(false)
const showPaqueteModal = ref(false)

// Refs de ingredientes
const ingredienteEditando = ref(null)
const ingredienteAjuste = ref(null)

// Estado ingredientes
const statsIngredientes = ref({ total: 0, bajo_stock: 0, sin_stock: 0, costo_total: 0 })
const buscarIngrediente = ref('')
const filtroBajoStock = ref(false)

const loading = reactive({ 
  products: false, 
  categories: false, 
  ingredientes: false,
  paquetes: false,
  insumosPreparados: false
})

// ── TABS ───────────────────────────────────────────────────
const tabs = [
  { key: 'productos',    label: '📦 Productos' },
  { key: 'paquetes',     label: '🎁 Paquetes' },
  { key: 'ingredientes',      label: '🧄 Ingredientes' },
  { key: 'insumos_preparados', label: '🥘 Insumos Preparados' },
  { key: 'anuncios',          label: '📢 Anuncios' },
]

const getTabCount = (key) => {
  if (key === 'productos') return products.value.length
  if (key === 'paquetes') return paquetes.value.length
  if (key === 'categorias') return categories.value.length
  if (key === 'ingredientes') return ingredientes.value.length
  if (key === 'insumos_preparados') return insumosPreparados.value.length
  if (key === 'anuncios') return anuncios.value.length
  return 0
}

// ── COMPUTED ───────────────────────────────────────────────
const ingredientesFiltrados = computed(() => {
  let lista = ingredientes.value
  if (filtroBajoStock.value) lista = lista.filter(i => i.bajo_stock || i.sin_stock)
  if (buscarIngrediente.value) {
    const b = buscarIngrediente.value.toLowerCase()
    lista = lista.filter(i => i.nombre.toLowerCase().includes(b) || (i.proveedor || '').toLowerCase().includes(b))
  }
  return lista
})

const allProductsForSelection = ref([])

// ── HELPERS ────────────────────────────────────────────────
const checkAuth = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  if (!token) { 
    router.push('/')
    return false 
  }
  return true
}

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}${path}`
}

const onImageError = (e) => { 
  e.target.style.display = 'none' 
}

const formatearMoneda = (v) => {
  return v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// ── PRODUCTOS (CON PAGINACIÓN CORREGIDA) ────────────────────
const loadProducts = async (page = 1) => {
  if (!checkAuth()) return
  loading.products = true
  try {
    const data = await apiClient.get(`/productos?page=${page}&per_page=15&buscar=${encodeURIComponent(searchTerm.value)}&_t=${Date.now()}`)
    if (data.success || data.data) {
      products.value = data.data || []
      if (data.pagination) {
        pagination.value = data.pagination
      } else if (data.meta) {
        pagination.value = {
          current_page: data.meta.current_page,
          last_page: data.meta.last_page,
          per_page: data.meta.per_page,
          total: data.meta.total,
          from: data.meta.from,
          to: data.meta.to
        }
      }
    }
    console.log('📦 Productos cargados:', products.value.length)
    console.log('📄 Página:', pagination.value.current_page, 'de', pagination.value.last_page)
  } catch (error) {
    console.error('Error loading products:', error)
    showToast('Error al cargar productos', 'error')
  } finally { 
    loading.products = false 
  }
}

// Debounce para búsqueda
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadProducts(1)
  }, 400)
}

const loadAllProductsForSelection = async () => {
  try {
    // Pedimos los datos con el cálculo de ventas de los últimos 30 días
    const data = await apiClient.get('/productos?per_page=1000&with=ingredientes,categoria&days=30')
    if (data.success || data.data) {
      let lista = data.data || data
      if (!Array.isArray(lista)) lista = lista?.data ?? []
      allProductsForSelection.value = lista
    }
  } catch (error) { console.error('Error loading products for selection:', error) }
}

// ✅ Cambiar página
const changePage = (page) => {
  if (page < 1 || page > pagination.value.last_page) return
  loadProducts(page)
}

const openCreate = () => { 
  selectedProduct.value = null
  showForm.value = true 
}

const openEdit = (p) => { 
  selectedProduct.value = p
  showForm.value = true 
}

// ✅ CORREGIDO: Recargar en la misma página después de guardar
const handleSaved = async () => { 
  showForm.value = false
  await nextTick()
  // Recargar en la página actual
  await loadProducts(pagination.value.current_page)
  showToast('Producto guardado correctamente', 'success') 
}

const handleDelete = async (id) => { 
  if (!confirm('¿Eliminar este producto?')) return
  try {
    await apiClient.delete(`/productos/${id}`)
    await loadProducts(pagination.value.current_page)
    showToast('Producto eliminado correctamente', 'success')
  } catch (error) {
    showToast('Error al eliminar producto', 'error')
  }
}

const handleToggleActive = async (id) => { 
  try {
    await apiClient.patch(`/productos/${id}/toggle-active`)
    await loadProducts(pagination.value.current_page)
    showToast('Estado del producto actualizado', 'success')
  } catch (error) {
    showToast('Error al cambiar estado', 'error')
  }
}

const exportProducts = () => { 
  showToast('Exportación próximamente', 'info') 
}

const handleImported = () => { 
  showImport.value = false
  loadProducts(1) // Volver a primera página después de importar
  showToast('Productos importados correctamente', 'success') 
}

// ── CATEGORÍAS ─────────────────────────────────────────────
const loadCategories = async () => {
  loading.categories = true
  try {
    const data = await apiClient.get('/categorias')
    if (data.success || data.data) {
      const baseNames = ['cocina', 'barra', 'postres']
      categories.value = (data.data || data || []).filter(c => 
        baseNames.includes((c.nombre || '').toLowerCase())
      )
    }
  } catch (error) {
    console.error('Error loading categories:', error)
    showToast('Error al cargar categorías', 'error')
  } finally { 
    loading.categories = false 
  }
}

const openCreateCategoria = () => { 
  selectedCategoria.value = null
  showCategoriaModal.value = true 
}

const openEditCategoria = (c) => { 
  selectedCategoria.value = c
  showCategoriaModal.value = true 
}

const handleCategoriaSaved = async () => { 
  showCategoriaModal.value = false
  await loadCategories()
  showToast('Categoría guardada correctamente', 'success') 
}

const handleDeleteCategoria = async (id) => { 
  if (!confirm('¿Eliminar esta categoría?')) return
  try {
    await apiClient.delete(`/categorias/${id}`)
    await loadCategories()
    showToast('Categoría eliminada correctamente', 'success')
  } catch (error) {
    showToast('Error al eliminar categoría', 'error')
  }
}

// ── INGREDIENTES ───────────────────────────────────────────
const loadIngredientes = async () => {
  loading.ingredientes = true
  try {
    const data = await apiClient.get('/ingredientes')
    if (data.success || data.data) {
      ingredientes.value = data.data || data || []
      statsIngredientes.value = data.stats || { total: 0, bajo_stock: 0, sin_stock: 0, costo_total: 0 }
    }
  } catch (error) {
    console.error('Error loading ingredients:', error)
    showToast('Error al cargar ingredientes', 'error')
  } finally { 
    loading.ingredientes = false 
  }
}

const abrirModalIngrediente = (ing = null) => {
  showIngredienteModal.value = false
  ingredienteEditando.value = ing
  nextTick(() => { showIngredienteModal.value = true })
}

const abrirAjusteStock = (ing) => {
  showAjusteStock.value = false
  ingredienteAjuste.value = ing
  nextTick(() => { showAjusteStock.value = true })
}

const handleIngredienteSaved = async () => { 
  showIngredienteModal.value = false
  await loadIngredientes()
  await loadProducts(pagination.value.current_page)
  await loadAllProductsForSelection()
  showToast('Ingrediente guardado correctamente', 'success') 
}

const handleStockSaved = async () => { 
  showAjusteStock.value = false
  await loadIngredientes()
  await loadProducts(pagination.value.current_page)
  await loadAllProductsForSelection()
  showToast('Stock actualizado correctamente', 'success') 
}

const loadAnuncios = async () => {
  try {
    const data = await apiClient.get('/admin/anuncios')
    if (data.success || data.data) anuncios.value = data.data || data || []
  } catch (error) { console.error('Error loading anuncios count:', error) }
}

// ── PAQUETES ───────────────────────────────────────────────
const loadPaquetes = async (page = 1) => {
  if (!checkAuth()) return
  loading.paquetes = true
  try {
    const data = await apiClient.get(`/paquetes?page=${page}&per_page=10&buscar=${encodeURIComponent(searchTermPaquetes.value)}&_t=${Date.now()}`)
    if (data.success || data.data) {
      paquetes.value = data.data || []
      if (data.pagination) {
        paginationPaquetes.value = data.pagination
      } else if (data.meta) {
        paginationPaquetes.value = {
          current_page: data.meta.current_page,
          last_page: data.meta.last_page,
          per_page: data.meta.per_page,
          total: data.meta.total,
          from: data.meta.from,
          to: data.meta.to
        }
      }
    }
  } catch (error) {
    console.error('Error loading packages:', error)
    showToast('Error al cargar paquetes', 'error')
  } finally {
    loading.paquetes = false
  }
}

const changePagePaquetes = (page) => {
  if (page < 1 || page > paginationPaquetes.value.last_page) return
  loadPaquetes(page)
}

// Debounce para búsqueda de paquetes
let searchPaquetesTimeout = null
const debouncedSearchPaquetes = () => {
  clearTimeout(searchPaquetesTimeout)
  searchPaquetesTimeout = setTimeout(() => {
    loadPaquetes(1)
  }, 400)
}

const openCreatePaquete = () => {
  selectedPaquete.value = null
  suggestedProductsForNewPaquete.value = []
  showPaqueteModal.value = true
}

const closePaqueteModal = () => {
  showPaqueteModal.value = false
  suggestedProductsForNewPaquete.value = []
}

const handleExecuteBundle = (products) => {
  suggestedProductsForNewPaquete.value = products
  activeTab.value = 'paquetes'
  selectedPaquete.value = null
  showPaqueteModal.value = true
  showToast('Sugerencia cargada en el nuevo paquete', 'info')
}

const openEditPaquete = (p) => {
  selectedPaquete.value = p
  showPaqueteModal.value = true
}

const handlePaqueteSaved = async () => {
  showPaqueteModal.value = false
  await loadPaquetes()
  showToast('Paquete guardado correctamente', 'success')
}

const handleDeletePaquete = async (id) => {
  if (!confirm('¿Eliminar este paquete?')) return
  try {
    const data = await apiClient.delete(`/paquetes/${id}`)
    if (data.success || data.data) {
      showToast('Paquete eliminado', 'success')
      await loadPaquetes()
    }
  } catch (error) { showToast('Error al eliminar paquete', 'error') }
}

const handleToggleActivePaquete = async (id) => {
  try {
    const data = await apiClient.patch(`/paquetes/${id}/toggle-active`)
    if (data.success || data.data) {
      showToast('Estado actualizado', 'success')
      await loadPaquetes()
    }
  } catch (error) { showToast('Error al cambiar estado', 'error') }
}

const handleDeleteIngrediente = async (id) => {
  if (!confirm('¿Eliminar este ingrediente?')) return
  try {
    const data = await apiClient.delete(`/ingredientes/${id}`)
    if (data.success || data.data) { 
      showToast('Ingrediente eliminado correctamente', 'success')
      await loadIngredientes()
    } else {
      showToast(data.message || 'Error al eliminar', 'error')
    }
  } catch (error) {
    console.error('Error deleting ingredient:', error)
    showToast('Error de conexión', 'error')
  }
}

// ── INSUMOS PREPARADOS ──────────────────────────────────────
const insumosPreparados = ref([])
const statsInsumos = ref({ total: 0, bajo_stock: 0, sin_stock: 0, costo_total: 0 })
const buscarInsumo = ref('')
const showModalInsumo = ref(false)
const showAjusteStockInsumo = ref(false)
const editandoInsumo = ref(null)
const guardandoInsumo = ref(false)
const formErrorInsumo = ref('')
const insumoAjuste = ref(null)

const formInsumo = ref({
  nombre: '',
  unidad: 'porciones',
  costo_unitario: '',
  stock_actual: '',
  stock_minimo: '',
  vida_util_dias: '',
  receta: [],
})

const ajusteFormInsumo = ref({
  tipo: 'entrada',
  cantidad: '',
  motivo: ''
})

const insumosFiltrados = computed(() => {
  let lista = insumosPreparados.value
  if (buscarInsumo.value) {
    const b = buscarInsumo.value.toLowerCase()
    lista = lista.filter(i => i.nombre.toLowerCase().includes(b))
  }
  return lista
})

const unidadIngrediente = (ingredienteId) => {
  if (!ingredienteId) return ''
  const ing = ingredientes.value.find(i => i.id === Number(ingredienteId))
  return ing?.unidad || ''
}

const loadInsumosPreparados = async () => {
  loading.insumosPreparados = true
  try {
    const data = await apiClient.get('/insumos-preparados')
    if (data.success || data.data) {
      insumosPreparados.value = data.data || data || []
      statsInsumos.value = data.stats || { total: 0, bajo_stock: 0, sin_stock: 0, costo_total: 0 }
    }
  } catch (error) {
    console.error('Error loading insumos preparados:', error)
    showToast('Error al cargar insumos preparados', 'error')
  } finally {
    loading.insumosPreparados = false
  }
}

const abrirModalInsumoPreparado = () => {
  editandoInsumo.value = null
  formErrorInsumo.value = ''
  formInsumo.value = { nombre: '', unidad: 'porciones', costo_unitario: '', stock_actual: '', stock_minimo: '', vida_util_dias: '', receta: [] }
  showModalInsumo.value = true
}

const editarInsumoPreparado = (ins) => {
  editandoInsumo.value = ins
  formErrorInsumo.value = ''
  formInsumo.value = {
    nombre: ins.nombre,
    unidad: ins.unidad,
    costo_unitario: ins.costo_unitario,
    stock_actual: ins.stock_actual,
    stock_minimo: ins.stock_minimo,
    vida_util_dias: ins.vida_util_dias || '',
    receta: (ins.receta || []).length ? ins.receta.map(r => ({ ingrediente_id: r.ingrediente_id || r.id, cantidad: r.cantidad })) : [],
  }
  showModalInsumo.value = true
}

const guardarInsumoPreparado = async () => {
  formErrorInsumo.value = ''
  if (!formInsumo.value.nombre) { formErrorInsumo.value = 'El nombre es obligatorio'; return }
  if (!formInsumo.value.costo_unitario) { formErrorInsumo.value = 'El costo es obligatorio'; return }

  guardandoInsumo.value = true
  try {
    const endpoint = editandoInsumo.value ? `/insumos-preparados/${editandoInsumo.value.id}` : '/insumos-preparados'
    const apiMethod = editandoInsumo.value ? apiClient.put : apiClient.post
    const data = await apiMethod(endpoint, formInsumo.value)
    if (data.success || data.data) {
      showToast(editandoInsumo.value ? 'Insumo actualizado' : 'Insumo creado', 'success')
      showModalInsumo.value = false
      await loadInsumosPreparados()
    } else {
      formErrorInsumo.value = data.message || 'Error al guardar'
    }
  } catch {
    formErrorInsumo.value = 'Error de conexión'
  } finally {
    guardandoInsumo.value = false
  }
}

const abrirAjusteStockInsumo = (ins) => {
  insumoAjuste.value = ins
  ajusteFormInsumo.value = { tipo: 'entrada', cantidad: '', motivo: '' }
  showAjusteStockInsumo.value = true
}

const guardarAjusteStockInsumo = async () => {
  if (!ajusteFormInsumo.value.cantidad) return
  guardandoInsumo.value = true
  try {
    const data = await apiClient.post(`/insumos-preparados/${insumoAjuste.value.id}/ajustar-stock`, ajusteFormInsumo.value)
    if (data.success || data.data) {
      showToast('Stock actualizado', 'success')
      showAjusteStockInsumo.value = false
      await loadInsumosPreparados()
    } else {
      showToast(data.message || 'Error al ajustar stock', 'error')
    }
  } catch {
    showToast('Error de conexión', 'error')
  } finally {
    guardandoInsumo.value = false
  }
}

const eliminarInsumoPreparado = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este insumo preparado?')) return
  try {
    const data = await apiClient.delete(`/insumos-preparados/${id}`)
    if (data.success || data.data) {
      showToast('Insumo eliminado', 'success')
      await loadInsumosPreparados()
    } else {
      showToast(data.message || 'Error al eliminar', 'error')
    }
  } catch {
    showToast('Error de conexión', 'error')
  }
}

const totalSueldosBase = ref(0)
const cargarNominaTotal = async () => {
  try {
    const data = await apiClient.get('/empleados')
    const emps = data.data || data || []
    if (Array.isArray(emps)) {
      totalSueldosBase.value = emps
        .filter(e => !!e.activo || e.activo === 1)
        .reduce((s, e) => s + parseFloat(e.salario_base || 0), 0)
    }
  } catch (e) { console.error('Error nomina:', e) }
}

// ── LIFECYCLE ──────────────────────────────────────────────
onMounted(() => {
  loadProducts(1)  // Cargar primera página
  loadCategories()
  loadIngredientes()
  loadInsumosPreparados()
  loadAnuncios()
  loadPaquetes()
  loadAllProductsForSelection()
  cargarNominaTotal()
})
</script>

<style scoped>
</style>