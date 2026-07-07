<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-800/50" :style="{ zoom }">

    <!-- ══ MARQUESITA ══ -->
    <MarquesitaWidget
      :api-url="API_URL"
      :get-headers="getHeaders"
      tipo="cliente"
      :variant="marquesinaVariant"
      :restaurante-id="restauranteSeleccionado?.id || authStore?.restauranteId || null"
    />

    <!-- ══ VISTA: LISTA DE RESTAURANTES ══ -->
    <div v-if="vista === 'restaurantes'">

      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-5 py-4 sticky top-0 z-20">
        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">¿Dónde quieres comer?</h1>
        <p class="text-gray-400 dark:text-gray-500 text-sm mt-0.5">Selecciona un restaurante para ver su menú</p>
        <div class="relative mt-3">
          <svg class="absolute left-3.5 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="busquedaRestaurante" type="text" placeholder="Buscar restaurante..."
            class="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border-0" />
        </div>
      </div>

      <LoadingSpinner v-if="loading.restaurantes" text="Cargando restaurantes..." />
      <div v-else-if="restaurantesFiltrados.length === 0" class="text-center py-20">
        <span class="text-5xl block mb-3">🍽️</span>
        <p class="text-gray-500 dark:text-gray-400 dark:text-gray-500 font-medium">No encontramos restaurantes</p>
      </div>
      <div v-else class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button v-for="rest in restaurantesFiltrados" :key="rest.id"
          @click="seleccionarRestaurante(rest)"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-left hover:shadow-md hover:-translate-y-0.5 transition-all group">
          <div class="w-full h-36 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden flex items-center justify-center">
            <img v-if="rest.imagen" :src="getImageUrl(rest.imagen)" class="w-full h-full object-cover" @error="onImageError" />
            <span v-else class="text-6xl opacity-30">🍽️</span>
            <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all"></div>
            <div class="absolute top-3 right-3">
              <span class="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Abierto</span>
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-bold text-gray-900 dark:text-gray-100 text-base">{{ rest.nombre }}</h3>
            <p v-if="rest.calle || rest.ciudad" class="text-xs text-gray-400 dark:text-gray-500 mt-1">
              📍 {{ [rest.calle, rest.ciudad, rest.estado].filter(Boolean).join(', ') }}
            </p>
            <p v-if="rest.telefono" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">📞 {{ rest.telefono }}</p>
            <div class="flex items-center justify-between mt-3">
              <span class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">Ver menú →</span>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- ══ VISTA: MENÚ DEL RESTAURANTE ══ -->
    <div v-else-if="vista === 'menu'" class="flex flex-col h-screen">

      <!-- Header menú -->
      <div class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20">
        <div class="w-full h-28 bg-gradient-to-br from-indigo-500 to-purple-600 relative flex items-end px-5 pb-4">
          <button @click="volverARestaurantes"
            class="absolute top-4 left-4 w-8 h-8 bg-white dark:bg-gray-800/20 hover:bg-white dark:bg-gray-800/30 rounded-full flex items-center justify-center transition text-white font-bold">
            ←
          </button>
          <div>
            <h2 class="text-xl font-bold text-white leading-tight">{{ restauranteSeleccionado?.nombre }}</h2>
            <p v-if="restauranteSeleccionado?.ciudad" class="text-white/70 text-xs mt-0.5">
              📍 {{ restauranteSeleccionado.ciudad }}
            </p>
          </div>
        </div>

        <!-- ══ OFERTAS DESTACADAS ══ -->
        <div v-if="ofertasProductos.length > 0" class="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-b border-amber-200">
          <div class="px-4 py-3">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center animate-pulse">
                <span class="text-white text-lg">🔥</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-800 dark:text-gray-200">Ofertas Especiales</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">¡Precios exclusivos por tiempo limitado!</p>
              </div>
              <span class="ml-auto bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                {{ ofertasProductos.length }} disponibles
              </span>
            </div>
            
            <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                v-for="oferta in ofertasProductos" 
                :key="oferta.id"
                @click="agregarOfertaAlPedido(oferta)"
                class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-amber-200 overflow-hidden flex-shrink-0 w-64 hover:shadow-lg transition-all group"
              >
                <div class="relative h-28 bg-gradient-to-br from-amber-400 to-orange-500">
                  <img 
                    v-if="oferta.imagen_url" 
                    :src="getImageUrl(oferta.imagen_url)" 
                    class="w-full h-full object-cover"
                    @error="onImageError"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <div class="absolute top-2 left-2">
                    <span class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                      -{{ oferta.descuento_porcentaje }}%
                    </span>
                  </div>
                  <div class="absolute bottom-2 left-2 right-2">
                    <h4 class="text-white font-bold text-sm drop-shadow">{{ oferta.nombre }}</h4>
                  </div>
                </div>
                
                <div class="p-3">
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <span class="text-gray-400 dark:text-gray-500 text-xs line-through">${{ oferta.precio_original.toFixed(2) }}</span>
                      <span class="text-amber-600 font-bold text-lg ml-2">${{ oferta.precio_oferta.toFixed(2) }}</span>
                    </div>
                    <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                      <span class="text-lg font-bold">+</span>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 line-clamp-2">{{ oferta.descripcion }}</p>
                  <div v-if="oferta.stock_limitado" class="mt-2">
                    <div class="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div class="h-full bg-amber-500 rounded-full" :style="{ width: `${(oferta.stock_actual / oferta.stock_total) * 100}%` }"></div>
                    </div>
                    <p class="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Quedan {{ oferta.stock_actual }} unidades</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Filtros de categoría -->
        <div class="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide bg-white dark:bg-gray-800">
          <button @click="categoriaActiva = null"
            :class="['px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition shrink-0',
              categoriaActiva === null ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600']">
            Todos
          </button>
          <button v-for="cat in categorias" :key="cat.id" @click="categoriaActiva = cat.id"
            :class="['px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition shrink-0 border',
              categoriaActiva === cat.id ? 'text-white border-transparent' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700']"
            :style="categoriaActiva === cat.id ? { backgroundColor: cat.color || '#6366f1' } : {}">
            {{ cat.icono ? cat.icono + ' ' : '' }}{{ cat.nombre }}
          </button>
        </div>
      </div>

      <!-- Layout: Productos + Carrito desktop -->
      <div class="flex flex-1 overflow-hidden">

        <!-- Lista de productos -->
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
          <LoadingSpinner v-if="loading.productos" text="Cargando menú..." />
          <div v-else-if="categoriasFiltradas.length === 0" class="text-center py-20">
            <span class="text-5xl block mb-3">😔</span>
            <p class="text-gray-500 dark:text-gray-400 dark:text-gray-500">Sin productos disponibles</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">{{ debugMsg }}</p>
          </div>
          <div v-else v-for="cat in categoriasFiltradas" :key="cat.id">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                :style="{ backgroundColor: (cat.color||'#6366f1')+'22', border:`2px solid ${cat.color||'#6366f1'}` }">
                {{ cat.icono || '📦' }}
              </div>
              <h3 class="font-bold text-gray-800 dark:text-gray-200">{{ cat.nombre }}</h3>
              <div class="flex-1 h-px bg-gray-100 dark:bg-gray-700"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button v-for="p in cat.productos" :key="p.id"
                @click="agregarAlPedido(p)"
                :disabled="p.agotado"
                class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex gap-3 p-3 text-left hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
                <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 flex items-center justify-center">
                  <img v-if="p.imagen_url" :src="getImageUrl(p.imagen_url)" :alt="p.nombre"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    @error="onImageError" />
                  <span v-else class="text-3xl">🍽️</span>
                </div>
                <div class="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p class="font-semibold text-gray-800 dark:text-gray-200 text-sm leading-tight">{{ p.nombre }}</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{{ p.descripcion || 'Sin descripción' }}</p>
                    <p v-if="p.bajo_stock && !p.agotado" class="text-[10px] text-amber-500 mt-1">
                      ⚠️ Últimas unidades
                    </p>
                    <span v-if="tieneAnuncio(p.id)"
                      class="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                      🔥 Promo
                    </span>
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    <div>
                      <span class="font-bold text-indigo-600 dark:text-indigo-400">${{ Number(p.precio||0).toFixed(2) }}</span>
                      <div v-if="(p.tiene_tamanos == true || p.tiene_tamanos == '1') && (p.precio_pequeno > 0 || p.precio_mediano > 0 || p.precio_grande > 0)" class="flex items-center gap-1 mt-1 flex-wrap">
                        <span v-if="p.precio_pequeno > 0" class="text-[8px] font-bold px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 leading-none">S ${{ Number(p.precio_pequeno).toFixed(2) }}</span>
                        <span v-if="p.precio_mediano > 0" class="text-[8px] font-bold px-1 py-0.5 rounded bg-blue-100 text-blue-700 leading-none">M ${{ Number(p.precio_mediano).toFixed(2) }}</span>
                        <span v-if="p.precio_grande > 0" class="text-[8px] font-bold px-1 py-0.5 rounded bg-purple-100 text-purple-700 leading-none">L ${{ Number(p.precio_grande).toFixed(2) }}</span>
                      </div>
                    </div>
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition"
                      :class="!p.agotado ? 'bg-indigo-100 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'">
                      {{ !p.agotado ? '+' : '✕' }}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Carrito lateral (desktop) -->
        <div class="hidden lg:flex w-96 shrink-0 bg-white dark:bg-gray-800 border-l border-gray-100 dark:border-gray-700 flex-col shadow-sm">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 class="font-bold text-gray-800 dark:text-gray-200">Tu pedido</h3>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ restauranteSeleccionado?.nombre }}</p>
          </div>
          <div class="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            <div v-if="pedido.length === 0" class="flex flex-col items-center justify-center h-full py-10 text-center">
              <span class="text-4xl mb-3">🛒</span>
              <p class="text-gray-400 dark:text-gray-500 text-sm">Agrega productos<br>para comenzar</p>
            </div>
            <div v-else v-for="item in pedido" :key="item.id"
              class="flex items-center gap-2.5 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 flex items-center justify-center">
                <img v-if="item.imagen" :src="item.imagen" :alt="item.nombre" class="w-full h-full object-cover" @error="onImageError" />
                <span v-else class="text-lg">🍽️</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {{ item.nombre }}
                  <span v-if="item.tamano && item.tamano !== 'pequeno' && item.tamano !== 'personalizado'" class="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 ml-1">({{ item.tamano === 'mediano' ? 'M' : 'L' }})</span>
                </p>
                <div class="flex items-center gap-1.5 mt-1.5">
                  <button @click="decrementar(item.id, item.tamano)"
                    class="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 dark:text-gray-500 text-xs hover:bg-gray-300 transition flex items-center justify-center font-bold">−</button>
                  <span class="text-xs font-bold w-4 text-center">{{ item.cantidad }}</span>
                  <button @click="incrementar(item.id, item.tamano)"
                    class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs hover:bg-indigo-200 transition flex items-center justify-center font-bold">+</button>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs font-bold text-gray-800 dark:text-gray-200">${{ (item.precio * item.cantidad).toFixed(2) }}</p>
                <button @click="eliminarDelPedido(item.id, item.tamano)" class="text-gray-300 hover:text-red-400 transition text-xs mt-0.5 block ml-auto">✕</button>
              </div>
            </div>
          </div>
          <div class="px-4 py-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
            <template v-if="pedido.length > 0">
              <div class="flex justify-between font-bold text-base">
                <span>Total</span>
                <span class="text-indigo-600 dark:text-indigo-400">${{ totalPedido.toFixed(2) }}</span>
              </div>
              <textarea v-model="notaGeneral" rows="2" placeholder="📝 Nota general del pedido..."
                class="w-full text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"></textarea>
            </template>
            <button @click="showCheckout = true" :disabled="pedido.length === 0"
              class="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
              Ir a pagar 💳
            </button>
            <div v-if="ordenConfirmada" class="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-xl text-center animate-fade-in">
              ✅ ¡Pedido enviado correctamente!
            </div>
            <div v-if="errorOrden" class="p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl text-center animate-fade-in">
              ❌ {{ errorOrden }}
            </div>
            <button v-if="pedido.length > 0" @click="vaciarPedido" class="w-full py-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-red-400 transition">
              Vaciar pedido
            </button>
          </div>
        </div>

      </div>

      <!-- Botón flotante carrito (móvil) -->
      <div v-if="pedido.length > 0" class="lg:hidden fixed bottom-5 left-4 right-4 z-20">
        <button @click="showCarritoMobile = true"
          class="w-full py-4 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-between px-5 font-semibold animate-slide-up">
          <span class="bg-white dark:bg-gray-800/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{{ totalItems }}</span>
          <span>Ver pedido</span>
          <span class="font-bold">${{ totalPedido.toFixed(2) }}</span>
        </button>
      </div>

      <!-- Modal carrito móvil -->
      <div v-if="showCarritoMobile" class="lg:hidden fixed inset-0 bg-black/50 z-30 flex items-end animate-fade-in"
        @click.self="showCarritoMobile = false">
        <div class="bg-white dark:bg-gray-800 w-full rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-slide-up">
          <div class="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2">
            <h3 class="font-bold text-gray-800 dark:text-gray-200">Tu pedido</h3>
            <button @click="showCarritoMobile = false" class="text-gray-400 dark:text-gray-500 text-xl hover:text-gray-600 dark:text-gray-400 dark:text-gray-500">✕</button>
          </div>
          <div class="space-y-2 mb-4 max-h-[45vh] overflow-y-auto">
            <div v-for="item in pedido" :key="item.id + (item.tamano || '')" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {{ item.nombre }}
                  <span v-if="item.tamano && item.tamano !== 'pequeno' && item.tamano !== 'personalizado'" class="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 ml-1">({{ item.tamano === 'mediano' ? 'M' : 'L' }})</span>
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500">${{ item.precio.toFixed(2) }} c/u</p>
              </div>
              <div class="flex items-center gap-2">
                <button @click="decrementar(item.id, item.tamano)" class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 text-sm flex items-center justify-center font-bold">−</button>
                <span class="text-sm font-bold w-5 text-center">{{ item.cantidad }}</span>
                <button @click="incrementar(item.id, item.tamano)" class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-sm flex items-center justify-center font-bold">+</button>
              </div>
              <span class="text-sm font-bold text-gray-800 dark:text-gray-200 w-16 text-right">${{ (item.precio * item.cantidad).toFixed(2) }}</span>
            </div>
          </div>
          <div class="flex justify-between font-bold text-lg mb-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <span>Total</span>
            <span class="text-indigo-600 dark:text-indigo-400">${{ totalPedido.toFixed(2) }}</span>
          </div>
          <textarea v-model="notaGeneral" rows="2" placeholder="📝 Nota general del pedido..."
            class="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none mb-3"></textarea>
          <button @click="showCheckout = true; showCarritoMobile = false"
            class="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition">
            Ir a pagar 💳
          </button>
          <div v-if="ordenConfirmada" class="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-xl text-center animate-fade-in">
            ✅ ¡Pedido enviado correctamente!
          </div>
          <div v-if="errorOrden" class="mt-3 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl text-center animate-fade-in">
            ❌ {{ errorOrden }}
          </div>
        </div>
      </div>

    </div>

    <!-- ══ MODAL SELECCIONAR TAMAÑO (Cliente) ══ -->
    <div v-if="showTamanosModal" class="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in"
         @click.self="showTamanosModal = false">
      <div class="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-slide-up relative">
        <button @click="showTamanosModal = false" class="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 font-bold">✕</button>
        <div class="mb-6">
          <h3 class="font-black text-slate-900 dark:text-white text-2xl tracking-tight leading-tight pr-8">{{ productoSeleccionado?.nombre }}</h3>
          <p class="text-sm text-slate-500 mt-1 font-medium">Selecciona el tamaño deseado</p>
        </div>
        <div class="space-y-3">
          <button v-if="productoSeleccionado?.precio_pequeno > 0 || productoSeleccionado?.precio > 0"
                  @click="agregarProductoConTamano(productoSeleccionado, 'pequeno', productoSeleccionado.precio_pequeno || productoSeleccionado.precio)"
                  class="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 group transition-all">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg">S</div>
              <span class="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest group-hover:text-emerald-700">Pequeño</span>
            </div>
            <span class="font-black text-slate-900 dark:text-white text-xl">${{ Number(productoSeleccionado?.precio_pequeno || productoSeleccionado?.precio).toFixed(2) }}</span>
          </button>
          <button v-if="productoSeleccionado?.precio_mediano > 0"
                  @click="agregarProductoConTamano(productoSeleccionado, 'mediano', productoSeleccionado.precio_mediano)"
                  class="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 group transition-all">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">M</div>
              <span class="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest group-hover:text-blue-700">Mediano</span>
            </div>
            <span class="font-black text-slate-900 dark:text-white text-xl">${{ Number(productoSeleccionado?.precio_mediano).toFixed(2) }}</span>
          </button>
          <button v-if="productoSeleccionado?.precio_grande > 0"
                  @click="agregarProductoConTamano(productoSeleccionado, 'grande', productoSeleccionado.precio_grande)"
                  class="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 group transition-all">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg">L</div>
              <span class="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest group-hover:text-purple-700">Grande</span>
            </div>
            <span class="font-black text-slate-900 dark:text-white text-xl">${{ Number(productoSeleccionado?.precio_grande).toFixed(2) }}</span>
          </button>
        </div>
        <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button @click="abrirPrecioPersonalizado(productoSeleccionado)" class="w-full py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center justify-center gap-2">
            ✏️ Precio personalizado
          </button>
        </div>
      </div>
    </div>

    <!-- ══ MODAL PRECIO PERSONALIZADO (Cliente) ══ -->
    <div v-if="showPrecioPersonalizado" class="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in"
         @click.self="showPrecioPersonalizado = false">
      <div class="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-slide-up relative">
        <button @click="showPrecioPersonalizado = false" class="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 font-bold">✕</button>
        <div class="mb-6">
          <h3 class="font-black text-slate-900 dark:text-white text-2xl tracking-tight leading-tight pr-8">{{ productoSeleccionado?.nombre }}</h3>
          <p class="text-sm text-slate-500 mt-1 font-medium">Define un precio y cantidad personalizados</p>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Precio unitario</label>
            <input v-model.number="precioPersonalizadoValor" type="number" step="0.01" min="0" placeholder="0.00"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition text-sm font-bold" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Cantidad</label>
            <input v-model.number="precioPersonalizadoCantidad" type="number" min="1" placeholder="1"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition text-sm font-bold" />
          </div>
          <button @click="agregarConPrecioPersonalizadoCliente" :disabled="!precioPersonalizadoValor || precioPersonalizadoValor <= 0"
            class="w-full py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 shadow-lg transition disabled:opacity-50">
            {{ !precioPersonalizadoValor || precioPersonalizadoValor <= 0 ? 'Ingresa un precio' : `Agregar $${Number(precioPersonalizadoValor).toFixed(2)} × ${precioPersonalizadoCantidad || 1}` }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ MODAL CHECKOUT ══ -->
    <ClienteCheckoutModal
      v-if="showCheckout"
      :pedido="pedido"
      :restaurante-nombre="restauranteSeleccionado?.nombre || ''"
      :nota-inicial="notaGeneral"
      ref="checkoutRef"
      @close="showCheckout = false"
      @confirmar="handleCheckout"
    />

  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MarquesitaWidget       from '../components/MarquesitaWidget.vue'
import ClienteCheckoutModal from '../components/cliente/Clientecheckoutmodal.vue'

const API_URL     = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
import { STORAGE_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { getHeaders } from '@/config/api'
import { useDeviceZoom } from '@/composables/useDeviceZoom'

const { zoom } = useDeviceZoom()

// ── ESTADO ─────────────────────────────────────────────────
const vista                   = ref('restaurantes')
const restaurantes            = ref([])
const restauranteSeleccionado = ref(null)
const productos               = ref([])
const pedido                  = ref([])
const categoriaActiva         = ref(null)
const showTamanosModal        = ref(false)
const productoSeleccionado    = ref(null)
const showPrecioPersonalizado = ref(false)
const precioPersonalizadoValor = ref(0)
const precioPersonalizadoCantidad = ref(1)
const busquedaRestaurante     = ref('')
const confirmando             = ref(false)
const showCarritoMobile       = ref(false)
const ordenConfirmada         = ref(false)
const errorOrden              = ref('')
const notaGeneral             = ref('')
const loading                 = ref({ restaurantes: true, productos: false })
const anuncios                = ref([])
const debugMsg                = ref('')
const showCheckout            = ref(false)
const checkoutRef             = ref(null)
const ofertasProductos        = ref([])
const loadingOfertas          = ref(false)
const marquesinaVariant       = ref(localStorage.getItem('marquesina_variant') || 'light')
let pollTimer = null
const POLL_INTERVAL = 5000 // 5 segundos

// Datos del usuario
const userRaw    = localStorage.getItem('user') ?? sessionStorage.getItem('user') ?? '{}'
const userActual = (() => { try { return JSON.parse(userRaw) } catch { return {} } })()
const roleRaw    = userActual?.roles?.[0]
const rolActual  = typeof roleRaw === 'string' ? roleRaw : (roleRaw?.nombre ?? '')
const esCliente  = rolActual === 'CLIENTE'
const clienteId  = esCliente ? (userActual?.cliente_id ?? null) : null

// ── HELPERS ────────────────────────────────────────────────
const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}${path.replace(/^\/?storage\//, '')}`
}
const onImageError = (e) => { e.target.style.display = 'none' }
const mostrarError = (msg, dur = 4000) => { errorOrden.value = msg; setTimeout(() => { if(errorOrden.value===msg) errorOrden.value='' }, dur) }
const mostrarExito = () => { ordenConfirmada.value = true; setTimeout(() => { ordenConfirmada.value = false }, 3000) }

// ── COMPUTED ───────────────────────────────────────────────
const restaurantesFiltrados = computed(() => {
  if (!busquedaRestaurante.value) return restaurantes.value
  const t = busquedaRestaurante.value.toLowerCase()
  return restaurantes.value.filter(r =>
    r.nombre?.toLowerCase().includes(t) || r.ciudad?.toLowerCase().includes(t)
  )
})

const categorias = computed(() => {
  const mapa = new Map()
  productos.value.forEach(p => {
    if (!p.categoria) return
    const id = p.categoria.id
    if (!mapa.has(id)) mapa.set(id, { id, nombre:p.categoria.nombre, color:p.categoria.color||'#6366f1', icono:p.categoria.icono||'📦', orden:p.categoria.orden??99, productos:[] })
    mapa.get(id).productos.push(p)
  })
  return [...mapa.values()].sort((a,b) => a.orden - b.orden)
})

const categoriasFiltradas = computed(() =>
  categoriaActiva.value === null ? categorias.value : categorias.value.filter(c => c.id === categoriaActiva.value)
)

const totalPedido = computed(() => pedido.value.reduce((s,i) => s + i.precio * i.cantidad, 0))
const totalItems  = computed(() => pedido.value.reduce((s,i) => s + i.cantidad, 0))

const idsConAnuncio = computed(() => new Set(
  anuncios.value.filter(a => a.tipo==='producto' && a.producto?.id).map(a => a.producto.id)
))
const tieneAnuncio = (id) => idsConAnuncio.value.has(id)

// ── NORMALIZAR producto desde cualquier endpoint ───────────
const normalizar = (p) => ({
  id:          p.id,
  nombre:      p.nombre,
  descripcion: p.descripcion || '',
  precio:      parseFloat(p.precio || 0),
  precio_pequeno: p.precio_pequeno !== null ? parseFloat(p.precio_pequeno) : null,
  precio_mediano: p.precio_mediano !== null ? parseFloat(p.precio_mediano) : null,
  precio_grande:  p.precio_grande !== null ? parseFloat(p.precio_grande) : null,
  tiene_tamanos:  p.tiene_tamanos == true || p.tiene_tamanos == '1',
  imagen_url:  p.imagen_url  || p.imagen || null,
  stock:       p.stock_restante ?? p.stock_disponible ?? p.stock ?? 0,
  stock_pequeno: parseFloat(p.stock_pequeno ?? p.stock_restante ?? p.stock_disponible ?? p.stock ?? 0),
  stock_mediano: parseFloat(p.stock_mediano ?? 0),
  stock_grande:  parseFloat(p.stock_grande ?? 0),
  agotado:     (p.stock_restante ?? p.stock_disponible ?? p.stock ?? 0) <= 0,
  bajo_stock:  p.bajo_stock ?? false,
  categoria:   p.categoria ? {
    id:     p.categoria.id,
    nombre: p.categoria.nombre,
    color:  p.categoria.color  || '#6366f1',
    icono:  p.categoria.icono  || '📦',
    orden:  p.categoria.orden  ?? 99,
  } : null,
})

// ── API ────────────────────────────────────────────────────
const cargarRestaurantes = async () => {
  loading.value.restaurantes = true
  try {
    const data = await apiClient.get('/restaurantes')
    if (data?.success) restaurantes.value = data.data?.restaurantes || data.data || []
  } catch { mostrarError('No se pudieron cargar los restaurantes') }
  finally { loading.value.restaurantes = false }
}

const cargarProductos = async (restauranteId, silent = true) => {
  if (!silent) {
    loading.value.productos = true
    productos.value = []
  }
  debugMsg.value  = ''
  try {
    const dispData = await apiClient.get(`/productos/disponibles?restaurante_id=${restauranteId}`)

    if (dispData?.success && Array.isArray(dispData.data) && dispData.data.length > 0) {
      productos.value = dispData.data.map(normalizar)
      return
    }

    debugMsg.value = 'Cargando menú completo...'
    const todosData = await apiClient.get(`/productos?restaurante_id=${restauranteId}&per_page=100`)

    if (todosData?.success) {
      let lista = todosData.data
      if (!Array.isArray(lista)) lista = lista?.data ?? []
      productos.value = lista.map(normalizar)
      debugMsg.value = productos.value.length === 0
        ? 'El restaurante no tiene productos activos aún'
        : ''
    } else {
      debugMsg.value = todosData.message || 'Error al cargar el menú'
    }
  } catch (e) {
    console.error('Error cargarProductos:', e)
    mostrarError('Error de conexión al cargar el menú')
  } finally {
    if (!silent) {
      loading.value.productos = false
    }
  }
}

const cargarAnuncios = async (restauranteId = null) => {
  try {
    const params = restauranteId
      ? `?tipo=cliente&restaurante_id=${restauranteId}`
      : '?tipo=cliente'
    const data = await apiClient.get(`/anuncios/videntes${params}`)
    if (data?.success) anuncios.value = data.data || []
  } catch { anuncios.value = [] }
}

// ── PERSISTENCIA ───────────────────────────────────────────
const cargarRestauranteDesdeLocalStorage = async () => {
  const id = localStorage.getItem('cliente_restaurante_id')
  if (!id) return null

  const rest = restaurantes.value.find(r => r.id.toString() === id)
  if (rest) {
    restauranteSeleccionado.value = rest
    vista.value = 'menu'
    await Promise.all([
      cargarProductos(rest.id),
      cargarOfertas(rest.id),
      cargarAnuncios(rest.id)
    ])
    return rest
  }
  localStorage.removeItem('cliente_restaurante_id')
  return null
}

const cargarOfertas = async (restauranteId) => {
  loadingOfertas.value = true
  try {
    const data = await apiClient.get(`/ofertas/activas?restaurante_id=${restauranteId}`)

    if (data?.success) {
      ofertasProductos.value = data.data
        .filter(oferta => oferta.producto?.restaurante_id === restauranteId)
        .map(oferta => ({
          id: oferta.id,
          producto_id: oferta.producto_id,
          nombre: oferta.producto?.nombre || 'Oferta',
          descripcion: oferta.producto?.descripcion || '',
          imagen_url: oferta.producto?.imagen_url || null,
          precio_original: parseFloat(oferta.producto?.precio || 0),
          precio_oferta: parseFloat(oferta.precio_oferta || 0),
          descuento_porcentaje: oferta.descuento_porcentaje || Math.round(
            ((parseFloat(oferta.producto?.precio || 0) - parseFloat(oferta.precio_oferta || 0))
            / parseFloat(oferta.producto?.precio || 1)) * 100
          ),
          fecha_inicio: oferta.fecha_inicio,
          fecha_fin: oferta.fecha_fin,
          stock_limitado: oferta.stock_limitado || false,
          stock_total: oferta.stock_total || 0,
          stock_actual: oferta.stock_actual || 0,
          agotado: oferta.stock_limitado && oferta.stock_actual <= 0
        }))
        .filter(o => !o.agotado)
    }
  } catch (error) {
    console.error('Error cargando ofertas:', error)
  } finally {
    loadingOfertas.value = false
  }
}

// ── NAVEGACIÓN ─────────────────────────────────────────────
const seleccionarRestaurante = async (rest) => {
  if (!rest?.id) {
    mostrarError('Restaurante no válido')
    return
  }
  restauranteSeleccionado.value = rest
  // Guardar en localStorage para persistir entre recargas
  localStorage.setItem('cliente_restaurante_id', rest.id.toString())
  categoriaActiva.value = null
  pedido.value = []
  notaGeneral.value = ''
  errorOrden.value = ''
  vista.value = 'menu'
  await Promise.all([
    cargarProductos(rest.id),
    cargarOfertas(rest.id),
    cargarAnuncios(rest.id)
  ])
}

const volverARestaurantes = () => {
  vista.value                   = 'restaurantes'
  restauranteSeleccionado.value = null
  localStorage.removeItem('cliente_restaurante_id')
  productos.value               = []
  pedido.value                  = []
  notaGeneral.value             = ''
  showCarritoMobile.value       = false
  errorOrden.value              = ''
  anuncios.value                = []
  ofertasProductos.value        = []
}

// ── CARRITO ────────────────────────────────────────────────
const agregarAlPedido = (p) => {
  if (p.agotado) { mostrarError(`"${p.nombre}" no está disponible`); return }

  if (p.tiene_tamanos && ((p.precio_mediano > 0) || (p.precio_grande > 0))) {
    productoSeleccionado.value = p
    showTamanosModal.value = true
    return
  }

  agregarProductoConTamano(p, 'pequeno', p.precio_pequeno || p.precio)
}

const agregarProductoConTamano = (p, tamano, precio) => {
  showTamanosModal.value = false
  const stockKey = tamano === 'mediano' ? 'stock_mediano' : tamano === 'grande' ? 'stock_grande' : 'stock_pequeno'
  const stockDisp = p[stockKey] ?? p.stock ?? 0

  if (stockDisp > 0) {
    const totalTamano = pedido.value.filter(i => i.id === p.id && i.tamano === tamano).reduce((s, i) => s + i.cantidad, 0)
    if (totalTamano >= stockDisp) {
      mostrarError(`No hay suficiente stock de tamaño "${tamano}" para "${p.nombre}". Límite: ${stockDisp} uds`)
      return
    }
  }

  const sizeMap = { 'pequeno': '', 'mediano': ' (M)', 'grande': ' (L)', 'personalizado': ' (Personalizado)' }
  const nombreMostrar = tamano !== 'pequeno' ? `${p.nombre}${sizeMap[tamano] || ''}` : p.nombre

  const existe = pedido.value.find(i => i.id === p.id && i.tamano === tamano && !i.es_oferta)
  if (existe) {
    existe.cantidad++
  } else {
    pedido.value.push({
      id: p.id,
      nombre: nombreMostrar,
      precio: parseFloat(precio),
      imagen: p.imagen_url ? getImageUrl(p.imagen_url) : null,
      cantidad: 1,
      stock_maximo: stockDisp,
      tamano: tamano,
      es_oferta: false
    })
  }
}

const agregarOfertaAlPedido = (oferta) => {
  if (oferta.agotado) { mostrarError('Esta oferta ya no está disponible'); return }
  const existe = pedido.value.find(i => i.id === oferta.producto_id)
  if (existe) {
    if (oferta.stock_limitado && existe.cantidad + 1 > oferta.stock_actual) {
      mostrarError(`Solo hay ${oferta.stock_actual} unidades disponibles`)
      return
    }
    existe.cantidad++
    existe.precio = oferta.precio_oferta
  } else {
    pedido.value.push({
      id:          oferta.producto_id,
      nombre:      oferta.nombre,
      precio:      oferta.precio_oferta,
      imagen:      oferta.imagen_url ? getImageUrl(oferta.imagen_url) : null,
      cantidad:    1,
      stock_maximo: oferta.stock_limitado ? oferta.stock_actual : 999,
      es_oferta:   true,
      oferta_id:   oferta.id
    })
  }
}

const abrirPrecioPersonalizado = (p) => {
  showTamanosModal.value = false
  productoSeleccionado.value = p
  precioPersonalizadoValor.value = p.precio || 0
  precioPersonalizadoCantidad.value = 1
  showPrecioPersonalizado.value = true
}

const agregarConPrecioPersonalizadoCliente = () => {
  if (!precioPersonalizadoValor.value || precioPersonalizadoValor.value <= 0) return
  const p = productoSeleccionado.value
  if (!p) return
  showPrecioPersonalizado.value = false
  const cantidad = precioPersonalizadoCantidad.value || 1
  for (let i = 0; i < cantidad; i++) {
    pedido.value.push({
      id: p.id,
      nombre: `${p.nombre} (Personalizado)`,
      precio: parseFloat(precioPersonalizadoValor.value),
      imagen: p.imagen_url ? getImageUrl(p.imagen_url) : null,
      cantidad: 1,
      stock_maximo: 9999,
      tamano: 'personalizado',
      es_oferta: false
    })
  }
}

const incrementar = (id, tamano = null) => {
  const item = pedido.value.find(i => i.id === id && (tamano ? i.tamano === tamano : true))
  if (!item) return
  if (item.stock_maximo > 0 && item.cantidad + 1 > item.stock_maximo) { mostrarError(`Límite de stock para "${item.nombre}"`); return }
  item.cantidad++
}

const decrementar = (id, tamano = null) => {
  const idx = pedido.value.findIndex(i => i.id === id && (tamano ? i.tamano === tamano : true))
  if (idx === -1) return
  pedido.value[idx].cantidad > 1 ? pedido.value[idx].cantidad-- : pedido.value.splice(idx, 1)
}

const eliminarDelPedido = (id, tamano = null) => {
  pedido.value = tamano
    ? pedido.value.filter(i => !(i.id === id && i.tamano === tamano))
    : pedido.value.filter(i => i.id !== id)
}

const vaciarPedido = () => { if (confirm('¿Vaciar todo el pedido?')) { pedido.value = []; notaGeneral.value = '' } }

const handleCheckout = async (checkoutData) => {
  if (!restauranteSeleccionado.value?.id) {
    mostrarError('No hay restaurante seleccionado. Por favor vuelve a seleccionarlo.')
    volverARestaurantes()
    return
  }
  try {
    const mapTipoOrden = { recoger: 'pickup', domicilio: 'delivery' }
    const direccionStr = checkoutData.direccion
      ? [checkoutData.direccion.calle, checkoutData.direccion.colonia, checkoutData.direccion.referencias].filter(Boolean).join(', ')
      : null

    const body = {
      restaurante_id:    restauranteSeleccionado.value.id,
      productos:         pedido.value.map(i => ({ producto_id: i.id, cantidad: i.cantidad, notas: null, tamano: i.tamano && i.tamano !== 'pequeno' ? i.tamano : null })),
      metodo_pago:       checkoutData.metodo_pago,
      tipo_orden:        mapTipoOrden[checkoutData.tipo_entrega] || 'pickup',
      direccion_entrega: direccionStr,
      notas:             checkoutData.notas || null,
      programado_para:   checkoutData.programado_para || null,
    }
    if (clienteId) body.cliente_id = clienteId

    const data = await apiClient.post('/ordenes', body)

    if (data?.success) {
      showCheckout.value      = false
      pedido.value            = []
      notaGeneral.value       = ''
      showCarritoMobile.value = false
      mostrarExito()
      // Recargar productos de inmediato de forma silenciosa para actualizar stock
      cargarProductos(restauranteSeleccionado.value.id, true)
    } else {
      const msg = data.errors
        ? Object.values(data.errors).flat().join('. ')
        : data.message || 'Error al procesar el pedido'
      checkoutRef.value?.setError(msg)
    }
  } catch {
    checkoutRef.value?.setError('Error de conexión')
  }
}

onMounted(async () => {
  await cargarRestaurantes()
  // Intentar restaurar restaurante seleccionado si el usuario recargó la página
  if (restaurantes.value.length > 0) {
    await cargarRestauranteDesdeLocalStorage()
  }

  // Polling silencioso para actualizar stocks periódicamente en el Kiosco
  const poll = async () => {
    marquesinaVariant.value = localStorage.getItem('marquesina_variant') || 'light'
    if (restauranteSeleccionado.value?.id) {
      await cargarProductos(restauranteSeleccionado.value.id, true)
    }
    pollTimer = setTimeout(poll, POLL_INTERVAL)
  }
  pollTimer = setTimeout(poll, POLL_INTERVAL)

  // Escuchar cambios de color de la marquesina en caliente
  const handleStorageEvent = (e) => {
    if (e.key === 'marquesina_variant') {
      marquesinaVariant.value = e.newValue || 'light'
    }
  }
  window.addEventListener('storage', handleStorageEvent)
  
  onMounted._handleStorage = handleStorageEvent
})

onUnmounted(() => {
  if (pollTimer) clearTimeout(pollTimer)
  if (onMounted._handleStorage) {
    window.removeEventListener('storage', onMounted._handleStorage)
  }
})
</script>

<style scoped>
@keyframes fade-in  { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
@keyframes slide-up { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }
.animate-fade-in  { animation: fade-in  0.3s ease-out; }
.animate-slide-up { animation: slide-up 0.3s ease-out; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
</style>