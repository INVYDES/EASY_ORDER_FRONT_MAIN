<template>
  <div class="min-h-screen bg-gray-50 flex flex-col" :style="{ zoom }">

    <!-- Header Menú Kiosko -->
    <div class="bg-gradient-to-br from-indigo-600 to-purple-700 shadow-md">
      <div class="px-5 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Logo del Restaurante -->
          <div v-if="restauranteSeleccionado?.imagen_url" class="w-12 h-12 rounded-2xl overflow-hidden bg-white shadow-sm border border-white/20 shrink-0">
            <img :src="getImageUrl(restauranteSeleccionado.imagen_url)" class="w-full h-full object-cover" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-white leading-tight">
              {{ restauranteSeleccionado?.nombre || 'Kiosko de Menú' }}
            </h2>
            <p class="text-indigo-100 text-xs mt-0.5 font-medium">
              {{ restauranteSeleccionado?.ciudad ? '📍 ' + restauranteSeleccionado.ciudad : 'Sincronizando menú...' }}
            </p>
          </div>
        </div>
        <button @click="cerrarSesion" class="bg-white/20 hover:bg-white/30 text-white text-[10px] font-black px-4 py-2 rounded-xl transition uppercase tracking-widest">
          Salir
        </button>
      </div>
      
      <!-- ══ OFERTAS DESTACADAS (Banner Superior) ══ -->
      <div v-if="ofertasProductos.length > 0" class="bg-amber-400/10 border-t border-white/5 backdrop-blur-sm">
        <div class="px-5 py-3">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-white text-[10px] font-black uppercase tracking-widest opacity-80">🔥 Ofertas del día</span>
          </div>
          
          <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              v-for="oferta in ofertasProductos" 
              :key="oferta.id"
              @click="agregarOfertaAlPedido(oferta)"
              class="bg-white rounded-2xl shadow-md border border-amber-200 overflow-hidden flex-shrink-0 w-64 hover:shadow-xl transition-all group text-left"
            >
              <div class="relative h-24 bg-amber-50">
                <img 
                  v-if="oferta.imagen_url" 
                  :src="getImageUrl(oferta.imagen_url)" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div class="absolute top-2 left-2">
                  <span class="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg">
                    -{{ oferta.descuento_porcentaje }}%
                  </span>
                </div>
              </div>
              <div class="p-3">
                <h4 class="text-slate-800 font-black text-xs truncate uppercase tracking-tighter">{{ oferta.nombre }}</h4>
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-baseline gap-2">
                    <span class="text-slate-400 text-[10px] line-through">${{ oferta.precio_original.toFixed(2) }}</span>
                    <span class="text-amber-600 font-black text-base">${{ oferta.precio_oferta.toFixed(2) }}</span>
                  </div>
                  <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                    <span class="text-sm font-bold">+</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <!-- ══ MARQUESINA ══ -->
      <MarquesitaWidget 
        :api-url="API_URL" 
        :get-headers="getHeaders" 
        tipo="interno"
        :variant="marquesinaVariant" 
        :restaurante-id="restauranteSeleccionado?.id"
        class="border-y border-white/5"
      />

      <!-- Filtros de categoría (Sub-Tabs) -->
      <div class="flex gap-2 px-5 py-4 overflow-x-auto scrollbar-hide bg-white shadow-sm border-b border-gray-100 items-center">
        <button @click="categoriaActiva = null"
          :class="['px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shrink-0',
            categoriaActiva === null ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100']">
          Todos
        </button>
        
        <!-- Pestaña especial para Paquetes -->
        <button v-if="paquetes.length > 0" @click="categoriaActiva = 'paquetes'"
          :class="['px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shrink-0 border-2',
            categoriaActiva === 'paquetes' ? 'bg-indigo-50 border-indigo-600 text-indigo-600 shadow-md' : 'bg-white border-transparent text-slate-400 hover:text-slate-600']">
          🎁 Paquetes
        </button>

        <div class="h-6 w-px bg-slate-200 mx-1 shrink-0"></div>

        <button v-for="cat in categorias" :key="cat.id" @click="categoriaActiva = cat.id"
          :class="['px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shrink-0 border-2',
            categoriaActiva === cat.id ? 'text-white shadow-lg' : 'bg-white border-transparent text-slate-400']"
          :style="categoriaActiva === cat.id ? { backgroundColor: cat.color || '#6366f1', borderColor: cat.color || '#6366f1' } : {}">
          {{ cat.icono ? cat.icono + ' ' : '' }}{{ cat.nombre }}
        </button>
      </div>
    </div>

    <!-- Layout Principal -->
    <div class="flex flex-1 overflow-hidden h-full relative">

      <!-- Botón de Carrito (Toggle Sidebar) -->
      <button 
        @click="sidebarAbierta = !sidebarAbierta"
        class="hidden sm:flex absolute z-30 bg-white border-2 border-indigo-600 text-indigo-600 shadow-xl w-14 h-14 rounded-2xl items-center justify-center hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all group overflow-hidden"
        :class="sidebarAbierta ? 'right-[25rem] top-2' : 'right-4 top-2'"
      >
        <div class="relative">
          <span class="text-2xl transition-transform duration-500" :class="{ 'scale-110': sidebarAbierta }">🛒</span>
          <span v-if="totalItems > 0" 
                class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow-sm">
            {{ totalItems }}
          </span>
        </div>
        <!-- Tooltip -->
        <div class="absolute -bottom-10 bg-slate-800 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
          {{ sidebarAbierta ? 'Ocultar Pedido' : 'Ver Mi Pedido' }}
        </div>
      </button>

      <!-- Contenedor de Scroll de Productos -->
      <div class="flex-1 overflow-y-auto p-5 space-y-10 custom-scrollbar transition-all duration-700 ease-in-out">
        
        <div v-if="loading.productos" class="flex flex-col items-center justify-center py-20 gap-3">
          <div class="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Cargando catálogo...</p>
        </div>

        <template v-else>
          <!-- ══ SECCIÓN DE PAQUETES (Si está en 'Todos' o 'Paquetes') ══ -->
          <div v-if="(categoriaActiva === null || categoriaActiva === 'paquetes') && paquetes.length > 0" class="animate-fade-in">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl shadow-sm border border-indigo-100">🎁</div>
              <h3 class="font-black text-slate-800 text-xl tracking-tight uppercase">Combos y Paquetes</h3>
              <div class="flex-1 h-px bg-slate-100"></div>
            </div>
            
            <div class="grid grid-cols-1 gap-6 transition-all duration-700"
                 :class="sidebarAbierta ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'">
              <button 
                v-for="pkg in paquetes" 
                :key="pkg.id"
                @click="agregarPaqueteAlPedido(pkg)"
                :disabled="pkg.stock !== undefined && pkg.stock !== null && totalEnPedidoPorPaqueteId(pkg.id) >= pkg.stock"
                class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col text-left hover:shadow-xl hover:-translate-y-1 transition-all group p-1 disabled:opacity-50 disabled:cursor-not-allowed relative"
                :class="{ 'p-2 scale-105': !sidebarAbierta }"
              >
                <div class="relative rounded-[1.8rem] overflow-hidden bg-indigo-50"
                     :class="sidebarAbierta ? 'h-40' : 'h-64'">
                  <img 
                    v-if="pkg.imagen_url" 
                    :src="getImageUrl(pkg.imagen_url)" 
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-5xl text-indigo-100">🎁</div>
                  <div v-if="pkg.stock !== undefined && pkg.stock !== null && totalEnPedidoPorPaqueteId(pkg.id) >= pkg.stock" class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center text-red-500 font-black text-xs uppercase tracking-widest z-10">Agotado</div>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  <div class="absolute top-3 right-3">
                    <span class="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-tighter">Promoción</span>
                  </div>
                </div>
                
                <div class="p-4 flex-1 flex flex-col">
                  <h4 class="text-slate-800 font-black leading-tight uppercase mb-2"
                      :class="sidebarAbierta ? 'text-base' : 'text-2xl'">{{ pkg.nombre }}</h4>
                  <div class="flex flex-wrap gap-1.5 mb-4">
                    <span v-for="p in pkg.productos" :key="p.id" class="text-[9px] bg-slate-50 text-slate-500 px-2 py-1 rounded-lg font-black border border-slate-100">
                      {{ p.pivot.cantidad }}× {{ p.nombre.toUpperCase() }}
                    </span>
                  </div>
                  <div class="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
                    <span class="text-indigo-600 font-black text-xl">${{ Number(pkg.precio).toFixed(2) }}</span>
                    <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform">
                      <span class="text-xl font-bold">+</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- ══ SECCIONES DE PRODUCTOS ══ -->
          <div v-if="categoriaActiva !== 'paquetes'" v-for="cat in categoriasFiltradas" :key="cat.id" class="animate-fade-in">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm border"
                :style="{ backgroundColor: (cat.color||'#6366f1')+'11', borderColor:cat.color||'#6366f1' }">
                {{ cat.icono || '🍽️' }}
              </div>
              <h3 class="font-black text-slate-800 text-xl tracking-tight uppercase">{{ cat.nombre }}</h3>
              <div class="flex-1 h-px bg-slate-100"></div>
            </div>

            <div class="grid grid-cols-2 gap-6 transition-all duration-700"
                 :class="sidebarAbierta ? 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'">
              <button v-for="p in cat.productos" :key="p.id"
                @click="agregarAlPedido(p)"
                :disabled="p.agotado"
                class="glass-card bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden flex flex-col text-left hover:shadow-xl transition-all group disabled:opacity-50 relative p-1">
                <div class="w-full rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center relative transition-all duration-700"
                     :class="sidebarAbierta ? 'h-28' : 'h-52'">
                  <img v-if="p.imagen_url" :src="getImageUrl(p.imagen_url)" :alt="p.nombre"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <span v-else class="text-3xl">🍽️</span>
                  <div v-if="p.agotado" class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center text-red-500 font-black text-xs uppercase tracking-widest z-10">Agotado</div>
                </div>
                <div class="p-3 flex-1 flex flex-col justify-between" :class="{ 'p-4': !sidebarAbierta }">
                  <div>
                    <p class="font-black text-slate-800 leading-tight uppercase tracking-tighter line-clamp-2 transition-all"
                       :class="sidebarAbierta ? 'text-xs' : 'text-xl'">{{ p.nombre }}</p>
                    <p v-if="p.bajo_stock && !p.agotado" class="font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-1.5 inline-block uppercase transition-all"
                       :class="sidebarAbierta ? 'text-[8px]' : 'text-sm'">Últimas {{ p.stock }}</p>
                  </div>
                  <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <div class="flex flex-col">
                       <span class="font-black text-slate-900 text-sm">${{ Number(p.precio||0).toFixed(2) }}</span>
                    <div v-if="getTamanoData(p).length > 0" class="flex items-center gap-1 mt-1 flex-wrap">
                         <span v-for="(t, i) in getTamanoData(p)" :key="i" class="text-[9px] font-bold px-1.5 py-0.5 rounded leading-none whitespace-nowrap" :class="t.color.circle">{{ t.letter }} ${{ t.precio.toFixed(2) }}</span>
                       </div>
                     </div>
                    <div class="w-7 h-7 rounded-xl flex items-center justify-center text-base font-bold transition-all shadow-sm"
                      :class="!p.agotado ? 'bg-slate-900 text-white group-hover:scale-110' : 'bg-slate-100 text-slate-300'">
                      {{ !p.agotado ? '+' : '✕' }}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Mensaje cuando no hay productos -->
          <div v-if="productos.length === 0 && paquetes.length === 0" class="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <span class="text-7xl mb-4">📭</span>
            <h3 class="text-xl font-black text-slate-800 uppercase tracking-widest">Sin Productos Disponibles</h3>
            <p class="text-slate-500 text-sm mt-2 font-medium">No se encontraron productos para este restaurante.</p>
          </div>
        </template>
      </div>

      <!-- Carrito lateral (Escritorio) -->
      <div v-show="sidebarAbierta" class="w-96 shrink-0 bg-white border-l border-slate-100 flex flex-col shadow-2xl z-10 hidden sm:flex animate-slide-left">
        <div class="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
          <div class="flex justify-between items-center mb-1">
            <h3 class="font-black text-slate-900 text-xl tracking-tight">Tu Pedido</h3>
            <span class="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{{ totalItems }} items</span>
          </div>
          <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Restaurant Kiosk System</p>
          
        </div>
        
        <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-white custom-scrollbar">
          <div v-if="pedido.length === 0" class="flex flex-col items-center justify-center h-full text-center opacity-20 py-20">
            <span class="text-7xl mb-6">🍽️</span>
            <p class="text-slate-900 font-black text-xl uppercase tracking-widest">Orden Vacía</p>
            <p class="text-sm text-slate-500 mt-2 font-medium">Toca los platos para agregarlos</p>
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="item in pedido" :key="item.cartId" 
              class="p-3 bg-slate-50/50 border border-slate-100 rounded-xl hover:border-indigo-200 group transition-all">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-xl overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-sm border border-slate-100">
                  <img v-if="item.imagen" :src="item.imagen" class="w-full h-full object-cover" />
                  <span v-else class="text-lg">{{ item.es_paquete ? '🎁' : '🍽️' }}</span>
                </div>
                <div class="flex-1 min-w-0 flex justify-between items-start">
                  <p class="text-[11px] font-black text-slate-800 uppercase tracking-tighter truncate leading-none mt-1">{{ item.nombre }}</p>
                  <button @click="eliminarDelPedido(item.cartId)" class="text-slate-300 hover:text-red-500 transition-all ml-2">✕</button>
                </div>
              </div>
              <div class="mb-2">
                <input v-model="item.notas" type="text" placeholder="Notas (Ej: Sin cebolla)" class="w-full px-2 py-1.5 text-[10px] font-bold border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none" />
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-100 shadow-sm">
                  <button @click="decrementar(item.cartId)" class="w-6 h-6 rounded-md bg-slate-50 text-slate-400 text-xs font-black flex items-center justify-center hover:text-red-500 transition-colors">−</button>
                  <span class="text-[10px] font-black w-4 text-center text-slate-700">{{ item.cantidad }}</span>
                  <button @click="incrementar(item.cartId)"
                    :disabled="(!item.es_paquete && item.stock_maximo !== undefined && item.stock_maximo !== null && totalEnPedidoPorId(item.id) >= item.stock_maximo) || (item.es_paquete && item.stock_maximo !== undefined && item.stock_maximo !== null && totalEnPedidoPorPaqueteId(item.paquete_id) >= item.stock_maximo)"
                    class="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 text-xs font-black flex items-center justify-center hover:bg-indigo-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                </div>
                <p class="text-xs font-black text-slate-900">${{ (item.precio * item.cantidad).toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-slate-100 bg-slate-50/30 space-y-4">
          <div v-if="pedido.length > 0" class="space-y-2">
            <div class="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
              <span>Subtotal</span>
              <span>${{ totalPedido.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-end py-2">
              <span class="text-sm font-black text-slate-900 uppercase tracking-widest">Total</span>
              <span class="text-3xl font-black text-indigo-600 leading-none">${{ totalPedido.toFixed(2) }}</span>
            </div>
          </div>
          
          <button @click="showCheckout = true" :disabled="pedido.length === 0"
            class="w-full py-5 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-700 hover:shadow-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
            Confirmar Orden ✨
          </button>
          
          <div v-if="ordenConfirmada" class="p-3 bg-emerald-500 text-white text-[10px] font-black rounded-xl text-center uppercase tracking-widest animate-bounce">
            ¡Enviada correctamente!
          </div>
          <div v-if="errorOrden" class="p-3 bg-red-50 text-red-500 text-[10px] font-black rounded-xl text-center uppercase tracking-widest">
            {{ errorOrden }}
          </div>
          
          <button v-if="pedido.length > 0" @click="vaciarPedido" class="w-full py-2 text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">
            Limpiar Carrito
          </button>
        </div>
      </div>
    </div>

    <!-- Modal carrito móvil MEJORADO -->
    <div v-if="showCarritoMobile" class="sm:hidden fixed inset-0 bg-slate-900/40 z-50 flex items-end backdrop-blur-sm transition-all duration-300"
      @click.self="showCarritoMobile = false">
      <div class="bg-white w-full rounded-t-[2.5rem] p-6 max-h-[85vh] flex flex-col shadow-2xl transform transition-transform duration-300 animate-slide-up">
        
        <!-- Header más limpio y botón cerrar -->
        <div class="flex items-center justify-between mb-5">
          <div class="flex flex-col">
            <h3 class="font-black text-slate-900 text-2xl tracking-tight">Tu Orden</h3>
            <span class="text-indigo-600 text-xs font-black uppercase tracking-widest mt-1">{{ totalItems }} Platillos</span>
          </div>
          <button @click="showCarritoMobile = false" class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors shadow-sm">✕</button>
        </div>
        
        <!-- Lista de Items -->
        <div class="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 custom-scrollbar">
          <div v-if="pedido.length === 0" class="flex flex-col items-center justify-center py-12 opacity-40">
            <span class="text-6xl mb-4">🍽️</span>
            <p class="text-slate-900 font-black uppercase tracking-widest text-sm">Orden Vacía</p>
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="item in pedido" :key="item.cartId" class="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm relative group transition-all">
              <button @click="eliminarDelPedido(item.cartId)" class="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-[10px] font-black border border-white shadow-sm hover:bg-red-500 hover:text-white transition-colors">✕</button>
              <div class="flex flex-col mb-3">
                <p class="text-xs font-black text-slate-800 uppercase tracking-tighter leading-tight pr-4">{{ item.nombre }}</p>
                <p class="text-[10px] font-bold text-slate-400 mt-1">${{ Number(item.precio).toFixed(2) }} c/u</p>
              </div>
              <div class="mb-3">
                <input v-model="item.notas" type="text" placeholder="📝 Agregar notas (ej: sin cebolla)" class="w-full px-3 py-2 text-[10px] font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400" />
              </div>
              <div class="flex items-center justify-between pt-2 border-t border-slate-50">
                <div class="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100 shadow-sm">
                  <button @click="decrementar(item.cartId)" class="w-8 h-8 rounded-lg bg-white text-slate-600 text-sm font-black flex items-center justify-center shadow-sm hover:text-red-500 transition-colors">−</button>
                  <span class="text-[11px] font-black w-6 text-center text-slate-800">{{ item.cantidad }}</span>
                  <button @click="incrementar(item.cartId)"
                    :disabled="(!item.es_paquete && item.stock_maximo !== undefined && item.stock_maximo !== null && totalEnPedidoPorId(item.id) >= item.stock_maximo) || (item.es_paquete && item.stock_maximo !== undefined && item.stock_maximo !== null && totalEnPedidoPorPaqueteId(item.paquete_id) >= item.stock_maximo)"
                    class="w-8 h-8 rounded-lg bg-indigo-600 text-white text-sm font-black flex items-center justify-center shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                </div>
                <p class="text-sm font-black text-slate-900">${{ (item.precio * item.cantidad).toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-5 border-t border-slate-100 space-y-4 shrink-0 bg-white">
          <div class="flex justify-between items-end px-1">
            <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Total Orden</span>
            <span class="text-3xl font-black text-indigo-600 leading-none tracking-tighter">${{ totalPedido.toFixed(2) }}</span>
          </div>
          <button @click="showCheckout = true; showCarritoMobile = false" :disabled="pedido.length === 0"
            class="w-full py-4 bg-slate-900 text-white text-sm font-black rounded-2xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-40 uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
            Confirmar Pedido <span class="text-lg">✨</span>
          </button>
          <button v-if="pedido.length > 0" @click="vaciarPedido" class="w-full py-2 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest text-center transition-colors">
            Vaciar todo el carrito
          </button>
        </div>

      </div>
    </div>

    <!-- Botón flotante móvil -->
    <div v-if="pedido.length > 0" class="sm:hidden fixed bottom-6 left-6 right-6 z-20">
      <button @click="showCarritoMobile = true"
        class="w-full py-5 bg-slate-900 text-white rounded-3xl shadow-2xl flex items-center justify-between px-6 font-black animate-slide-up border border-slate-800">
        <span class="bg-indigo-500 text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">{{ totalItems }} Items</span>
        <span class="uppercase tracking-widest text-xs">Ver Pedido</span>
        <span class="text-sm">${{ totalPedido.toFixed(2) }}</span>
      </button>
    </div>

    <!-- Modal Checkout -->
    <MenuCheckoutModal
      v-if="showCheckout"
      :pedido="pedido"
      :restaurante-nombre="restauranteSeleccionado?.nombre || ''"
      ref="checkoutRef"
      @close="showCheckout = false"
      @confirmar="handleCheckout"
    />

    <!-- Modal Seleccionar Tamaño -->
    <div v-if="showTamanosModal" class="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in"
         @click.self="showTamanosModal = false">
      <div class="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-slide-up relative">
        <button @click="showTamanosModal = false" class="absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 font-bold">✕</button>
        
        <div class="mb-6">
          <h3 class="font-black text-slate-900 text-2xl tracking-tight leading-tight pr-8">{{ productoSeleccionado?.nombre }}</h3>
          <p class="text-sm text-slate-500 mt-1 font-medium">Selecciona el tamaño deseado</p>
        </div>

        <div class="space-y-3">
          <button v-for="(t, i) in getTamanoData(productoSeleccionado)" :key="t.key"
                  @click="agregarProductoConTamano(productoSeleccionado, t.key, t.precio)"
                  class="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 group transition-all"
                  :class="[t.color.hover, t.stock <= 0 ? 'opacity-50 cursor-not-allowed' : '']"
                  :disabled="t.stock <= 0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg" :class="t.color.circle">{{ t.letter }}</div>
              <div>
                <span class="font-black text-slate-700 uppercase tracking-widest block" :class="t.color.hoverText">{{ t.nombre }}</span>
                <span class="text-[10px] font-medium text-slate-400">{{ t.stock > 0 ? t.stock + ' disp.' : 'Agotado' }}</span>
              </div>
            </div>
            <span class="font-black text-slate-900 text-xl">${{ t.precio.toFixed(2) }}</span>
          </button>
        </div>

        <!-- Opción precio personalizado -->
        <div class="mt-4 pt-4 border-t border-slate-100">
          <button @click="abrirPrecioPersonalizado(productoSeleccionado)" class="w-full py-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition flex items-center justify-center gap-2">
            ✏️ Precio personalizado
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Precio Personalizado -->
    <div v-if="showPrecioPersonalizado" class="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in"
         @click.self="showPrecioPersonalizado = false">
      <div class="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-slide-up relative">
        <button @click="showPrecioPersonalizado = false" class="absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 font-bold">✕</button>
        <div class="mb-6">
          <h3 class="font-black text-slate-900 text-2xl tracking-tight leading-tight pr-8">{{ productoSeleccionado?.nombre }}</h3>
          <p class="text-sm text-slate-500 mt-1 font-medium">Define un precio y cantidad personalizados</p>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Precio unitario</label>
            <input v-model.number="precioPersonalizadoValor" type="number" step="0.01" min="0" placeholder="0.00"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm font-bold" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cantidad</label>
            <input v-model.number="precioPersonalizadoCantidad" type="number" min="1" placeholder="1"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm font-bold" />
          </div>
          <button @click="agregarConPrecioPersonalizado" :disabled="!precioPersonalizadoValor || precioPersonalizadoValor <= 0"
            class="w-full py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 shadow-lg transition disabled:opacity-50">
            {{ !precioPersonalizadoValor || precioPersonalizadoValor <= 0 ? 'Ingresa un precio' : `Agregar $${Number(precioPersonalizadoValor).toFixed(2)} × ${precioPersonalizadoCantidad || 1}` }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MarquesitaWidget from '../components/Marquesitawidget.vue'
import MenuCheckoutModal from '../components/menu/MenuCheckoutModal.vue'

const router = useRouter()
const API_URL     = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
import { STORAGE_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'
import { useDeviceZoom } from '@/composables/useDeviceZoom'

const { zoom } = useDeviceZoom()

// --- Estado ---
const restauranteSeleccionado = ref(null)
const productos               = ref([])
const pedido                  = ref([])
const categoriaActiva         = ref(null)
const showCarritoMobile       = ref(false)
const ordenConfirmada         = ref(false)
const errorOrden              = ref('')
const loading                 = ref({ productos: true })
const debugMsg                = ref('')
const showCheckout            = ref(false)
const showTamanosModal        = ref(false)
const productoSeleccionado    = ref(null)
const showPrecioPersonalizado = ref(false)
const precioPersonalizadoValor = ref(0)
const precioPersonalizadoCantidad = ref(1)
const checkoutRef             = ref(null)
const ofertasProductos        = ref([])
const paquetes                = ref([])
const sidebarAbierta          = ref(true)
const marquesinaVariant       = ref(localStorage.getItem('marquesina_variant') || 'dark')
let pollTimer = null
const POLL_INTERVAL = 5000 // 5 segundos

const userRaw    = localStorage.getItem('user') ?? sessionStorage.getItem('user') ?? '{}'
const userActual = (() => { try { return JSON.parse(userRaw) } catch { return {} } })()
const empleadoId = userActual?.id ?? null

// --- Helpers ---
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 'Content-Type':'application/json', Accept:'application/json', Authorization: token ? `Bearer ${token}` : '' }
}
const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}${path.replace(/^\/?storage\//, '')}`
}
const onImageError = (e) => { e.target.style.display = 'none' }
const mostrarError = (msg, dur = 4000) => { errorOrden.value = msg; setTimeout(() => { if(errorOrden.value===msg) errorOrden.value='' }, dur) }
const mostrarExito = () => { ordenConfirmada.value = true; setTimeout(() => { ordenConfirmada.value = false }, 3000) }

const cerrarSesion = () => {
  localStorage.removeItem('token'); localStorage.removeItem('user')
  sessionStorage.removeItem('token'); sessionStorage.removeItem('user')
  router.push('/')
}

// --- Computed ---
const categorias = computed(() => {
  const mapa = new Map()
  productos.value.forEach(p => {
    const catData = p.categoria || { id: 0, nombre: 'Otros', color: '#6366f1', icono: '📦', orden: 99 }
    const id = catData.id
    const nombreCat = catData.nombre.toUpperCase() === 'COCINA' ? 'Alimentos' : (catData.nombre.toUpperCase() === 'BARRA' ? 'Bebidas' : catData.nombre)
    if (!mapa.has(id)) mapa.set(id, { id, nombre:nombreCat, color:catData.color||'#6366f1', icono:catData.icono||'📦', orden:catData.orden??99, productos:[] })
    mapa.get(id).productos.push(p)
  })
  return [...mapa.values()].sort((a,b) => a.orden - b.orden)
})

const categoriasFiltradas = computed(() => {
  if (categoriaActiva.value === 'paquetes') return []
  return categoriaActiva.value === null ? categorias.value : categorias.value.filter(c => c.id === categoriaActiva.value)
})

const totalPedido = computed(() => pedido.value.reduce((s,i) => s + i.precio * i.cantidad, 0))
const totalItems  = computed(() => pedido.value.reduce((s,i) => s + i.cantidad, 0))

const normalizar = (p) => {
  if (!p) return null;
  try {
    const tamanos = Array.isArray(p.tamanos_disponibles)
      ? p.tamanos_disponibles.map(t => ({
          key: t.key,
          nombre: t.nombre,
          precio: Number(t.precio ?? 0),
          stock: Number(t.stock ?? 0),
        }))
      : []
    return {
      id:          p.id,
      nombre:      p.nombre || 'Sin nombre',
      descripcion: p.descripcion || '',
      precio:      parseFloat(p.precio || 0),
      imagen_url:  p.imagen_url  || p.imagen || null,
      stock:       parseFloat(p.stock_restante ?? p.stock_disponible ?? p.stock ?? 0),
      tamanos_disponibles: tamanos,
      agotado:     parseFloat(p.stock_restante ?? p.stock_disponible ?? p.stock ?? 0) <= 0,
      bajo_stock:  p.bajo_stock ?? false,
      minutos_produccion: parseFloat(p.minutos_produccion || 0),
      categoria:   p.categoria ? {
        id:     p.categoria.id,
        nombre: p.categoria.nombre.toUpperCase() === 'COCINA' ? 'Alimentos' : (p.categoria.nombre.toUpperCase() === 'BARRA' ? 'Bebidas' : p.categoria.nombre),
        color:  p.categoria.color  || '#6366f1',
        icono:  p.categoria.icono  || '📦',
        orden:  p.categoria.orden  ?? 99,
      } : { id: 0, nombre: 'Otros', color: '#6366f1', icono: '📦', orden: 99 },
    }
  } catch (e) {
    console.error('❌ Error normalizando producto:', p, e);
    return null;
  }
}

const cargarRestauranteActivo = async () => {
  try {
    const data = await apiClient.get('/me')
    if (data?.success) {
      const userData = data.data || data;
      
      // 1. Intentar obtener el objeto restaurante completo (ya viene en /me)
      if (userData.restaurante) {
        console.log('✅ [KIOSKO] Info del restaurante cargada desde /me:', userData.restaurante.nombre)
        restauranteSeleccionado.value = userData.restaurante
        localStorage.setItem('restaurante_id_activo', userData.restaurante.id)
        return userData.restaurante.id
      }

      // 2. Fallback al ID de restaurante_activo
      const ra = userData.restaurante_activo;
      if (ra) { 
        const id = typeof ra === 'object' ? ra.id : ra;
        console.log('✅ [KIOSKO] Usando ID de restaurante_activo:', id);
        restauranteSeleccionado.value = typeof ra === 'object' ? ra : { id: ra, nombre: 'Restaurante' };
        localStorage.setItem('restaurante_id_activo', id);
        return id;
      }

      // 3. Fallback: Ver si hay una lista de restaurantes
      const listaRest = userData.restaurantes || userData.data?.restaurantes;
      if (Array.isArray(listaRest) && listaRest.length > 0) {
        const id = listaRest[0].id;
        console.warn('⚠️ [KIOSKO] Usando primer restaurante de la lista del usuario:', id);
        restauranteSeleccionado.value = listaRest[0];
        localStorage.setItem('restaurante_id_activo', id);
        return id;
      }
    }

    // 4. Fallback final: LocalStorage
    const savedId = localStorage.getItem('restaurante_id_activo') || localStorage.getItem('restaurante_id')
    if (savedId) {
      console.warn('⚠️ [KIOSKO] Usando fallback de localStorage:', savedId)
      return savedId
    }
    return null
  } catch (err) { 
    console.error('❌ Error cargando /me:', err)
    return localStorage.getItem('restaurante_id_activo') || localStorage.getItem('restaurante_id')
  }
}

const cargarProductos = async (restauranteId, silent = true) => {
  if (!silent) {
    loading.value.productos = true
  }
  try {
    console.log('📡 [KIOSKO] Pidiendo productos disponibles...');
    const dispData = await apiClient.get(`/productos/disponibles?restaurante_id=${restauranteId}`)
    console.log('📦 [KIOSKO] Respuesta disponibles:', dispData);
    
    if (dispData?.success && Array.isArray(dispData.data) && dispData.data.length > 0) {
      productos.value = dispData.data.map(normalizar).filter(p => p !== null); 
      console.log('✅ [KIOSKO] Productos con stock cargados:', productos.value.length);
      return
    }
    
    console.warn('⚠️ [KIOSKO] No hay productos con stock, intentando catálogo general...');
    const todosData = await apiClient.get(`/productos?restaurante_id=${restauranteId}&per_page=100`)
    console.log('📦 [KIOSKO] Respuesta catálogo general:', todosData);
    
    if (todosData?.success) {
      let lista = todosData.data; 
      if (!Array.isArray(lista)) lista = lista?.data ?? []
      productos.value = lista.map(normalizar).filter(p => p !== null);
      console.log('✅ [KIOSKO] Catálogo general cargado:', productos.value.length);
    } else {
      console.error('❌ [KIOSKO] Falló carga de catálogo general:', todosData?.message);
    }
  } catch (err) {
    console.error('❌ [KIOSKO] Error en cargarProductos:', err);
  } finally { 
    if (!silent) {
      loading.value.productos = false 
    }
  }
}

const cargarOfertas = async (restauranteId) => {
  try {
    const data = await apiClient.get(`/ofertas/activas?restaurante_id=${restauranteId}`)
    if (data?.success) {
      ofertasProductos.value = data.data
        .filter(oferta => oferta.producto?.restaurante_id === restauranteId)
        .map(oferta => ({
          id: oferta.id,
          producto_id: oferta.producto_id,
          nombre: oferta.producto?.nombre || 'Oferta',
          imagen_url: oferta.producto?.imagen_url || null,
          precio_original: parseFloat(oferta.producto?.precio || 0),
          precio_oferta: parseFloat(oferta.precio_oferta || 0),
          descuento_porcentaje: oferta.descuento_porcentaje || 0,
          agotado: oferta.stock_limitado && oferta.stock_actual <= 0
        })).filter(o => !o.agotado)
    }
  } catch {}
}

const cargarPaquetes = async (restauranteId) => {
  try {
    const data = await apiClient.get(`/paquetes?restaurante_id=${restauranteId}`)
    if (data?.success) { paquetes.value = (data.data || []).filter(p => p.activo) }
  } catch {}
}

const totalEnPedidoPorId = (productId) => {
  return pedido.value
    .filter(i => i.id === productId && !i.es_paquete)
    .reduce((sum, i) => sum + i.cantidad, 0)
}

const totalEnPedidoPorPaqueteId = (paqueteId) => {
  return pedido.value
    .filter(i => i.paquete_id === paqueteId && i.es_paquete)
    .reduce((sum, i) => sum + i.cantidad, 0)
}

const totalEnPedidoPorTamano = (productId, tamano) => {
  return pedido.value
    .filter(i => i.id === productId && i.tamano === tamano && !i.es_paquete && !i.es_oferta)
    .reduce((sum, i) => sum + i.cantidad, 0)
}

const tieneStockTamano = (p, tamano) => {
  const tamanoInfo = getTamanoData(p).find(t => t.key === tamano)
  const stock = tamanoInfo?.stock ?? p.stock ?? 0
  if (stock <= 0) return false
  return totalEnPedidoPorTamano(p.id, tamano) < stock
}

const sizeStyles = [
  { circle: 'bg-emerald-100 text-emerald-600', hover: 'hover:border-emerald-500 hover:bg-emerald-50', hoverText: 'group-hover:text-emerald-700' },
  { circle: 'bg-blue-100 text-blue-600', hover: 'hover:border-blue-500 hover:bg-blue-50', hoverText: 'group-hover:text-blue-700' },
  { circle: 'bg-purple-100 text-purple-600', hover: 'hover:border-purple-500 hover:bg-purple-50', hoverText: 'group-hover:text-purple-700' },
  { circle: 'bg-amber-100 text-amber-600', hover: 'hover:border-amber-500 hover:bg-amber-50', hoverText: 'group-hover:text-amber-700' },
  { circle: 'bg-rose-100 text-rose-600', hover: 'hover:border-rose-500 hover:bg-rose-50', hoverText: 'group-hover:text-rose-700' },
]

const getTamanoData = (p) => {
  const tams = Array.isArray(p?.tamanos_disponibles) ? p.tamanos_disponibles : []
  if (tams.length > 0) {
    return tams
      .map((t, i) => ({
        letter: (t.nombre || '?')[0].toUpperCase(),
        nombre: t.nombre,
        key: t.key,
        precio: Number(t.precio ?? 0),
        stock: Number(t.stock ?? 0),
        color: sizeStyles[i % sizeStyles.length],
        index: i,
      }))
      .filter(t => t.precio > 0)
  }
  if (Number(p?.precio ?? 0) > 0) {
    return [{
      letter: 'Ú',
      nombre: 'Único',
      key: 'unico',
      precio: Number(p.precio),
      stock: Number(p.stock ?? 0),
      color: sizeStyles[0],
      index: 0,
    }]
  }
  return []
}

const getTamanoLetter = (tamanoKey, p) => {
  const tams = Array.isArray(p?.tamanos_disponibles) ? p.tamanos_disponibles : []
  const found = tams.find(t => t.key === tamanoKey)
  return found?.nombre ? found.nombre[0].toUpperCase() : '?'
}

// --- Carrito ---
const agregarAlPedido = (p) => {
  if (p.agotado) { mostrarError(`"${p.nombre}" agotado`); return }

  const sizes = getTamanoData(p)
  if (sizes.length > 1) {
    productoSeleccionado.value = p
    showTamanosModal.value = true
    return
  }

  if (sizes.length === 1) {
    agregarProductoConTamano(p, sizes[0].key, sizes[0].precio)
  } else {
    agregarProductoConTamano(p, 'pequeno', p.precio)
  }
}

const agregarProductoConTamano = (p, tamano, precio) => {
  showTamanosModal.value = false

  let tamanoNombre = ''
  const tamanoInfo = getTamanoData(p).find(t => t.key === tamano)
  if (tamanoInfo?.nombre) tamanoNombre = tamanoInfo.nombre
  const stockDisp = tamanoInfo?.stock ?? p.stock ?? 0
  if (stockDisp > 0 && totalEnPedidoPorTamano(p.id, tamano) >= stockDisp) {
    mostrarError(`No hay suficiente stock para "${p.nombre}" (${tamanoNombre || tamano}). Límite: ${stockDisp} uds`)
    return
  }

  const existe = pedido.value.find(i => i.id === p.id && i.tamano === tamano && !i.notas && !i.es_oferta && !i.es_paquete)
  if (existe) { 
    existe.cantidad++ 
  } else { 
    const sizeMap = { 'pequeno': 'Pequeño', 'mediano': 'Mediano', 'grande': 'Grande', 'personalizado': 'Personalizado' }
    const sufijo = tamanoNombre ? ` (${tamanoNombre})` : (tamano !== 'pequeno' ? ` (${sizeMap[tamano] || tamano})` : '')
    const nombreMostrar = tamano !== 'pequeno' ? `${p.nombre}${sufijo}` : p.nombre
    
    pedido.value.push({ 
      cartId: Date.now() + Math.random(),
      id: p.id, 
      nombre: nombreMostrar, 
      precio: parseFloat(precio), 
      imagen: p.imagen_url ? getImageUrl(p.imagen_url) : null, 
      cantidad: 1, 
      stock_maximo: stockDisp,
      notas: '',
      tamano: tamano,
      tamano_nombre: tamanoNombre || tamano,
      minutos_produccion: parseFloat(p.minutos_produccion || 0)
    }) 
  }
}

const agregarOfertaAlPedido = (oferta) => {
  const p = productos.value.find(prod => prod.id === oferta.producto_id)
  const stockLimit = p ? p.stock : 99999

  if (stockLimit !== undefined && stockLimit !== null) {
    if (totalEnPedidoPorId(oferta.producto_id) >= stockLimit) {
      mostrarError(`No hay suficiente stock para "${oferta.nombre}". Límite: ${stockLimit} uds`)
      return
    }
  }

  const existe = pedido.value.find(i => i.id === oferta.producto_id && !i.notas && i.es_oferta)
  if (existe) { 
    existe.cantidad++; 
    existe.precio = oferta.precio_oferta 
  } else {
    pedido.value.push({
      cartId: Date.now() + Math.random(),
      id: oferta.producto_id, 
      nombre: oferta.nombre, 
      precio: oferta.precio_oferta,
      imagen: oferta.imagen_url ? getImageUrl(oferta.imagen_url) : null,
      cantidad: 1, 
      es_oferta: true, 
      oferta_id: oferta.id,
      stock_maximo: stockLimit,
      notas: '',
      minutos_produccion: parseFloat(oferta.producto?.minutos_produccion || oferta.minutos_produccion || 0)
    })
  }
}

const agregarPaqueteAlPedido = (pkg) => {
  if (pkg.stock !== undefined && pkg.stock !== null) {
    if (totalEnPedidoPorPaqueteId(pkg.id) >= pkg.stock) {
      mostrarError(`No hay suficiente stock para el paquete "${pkg.nombre}". Límite: ${pkg.stock} uds`)
      return
    }
  }

  const existe = pedido.value.find(i => i.paquete_id === pkg.id && !i.notas)
  if (existe) { 
    existe.cantidad++ 
  } else {
    pedido.value.push({
      cartId: Date.now() + Math.random(),
      id: `pkg_${pkg.id}`, 
      paquete_id: pkg.id, 
      nombre: pkg.nombre,
      precio: parseFloat(pkg.precio), 
      imagen: pkg.imagen_url ? getImageUrl(pkg.imagen_url) : null,
      cantidad: 1, 
      es_paquete: true,
      stock_maximo: pkg.stock,
      notas: '',
      minutos_produccion: parseFloat(pkg.minutos_produccion || 0)
    })
  }
}

const incrementar = (cartId) => {
  const item = pedido.value.find(i => i.cartId === cartId)
  if (item) {
    if (!item.es_paquete && item.stock_maximo !== undefined && item.stock_maximo !== null) {
      if (totalEnPedidoPorId(item.id) >= item.stock_maximo) {
        mostrarError(`No hay suficiente stock para "${item.nombre}". Límite: ${item.stock_maximo} uds`)
        return
      }
    }
    if (item.es_paquete && item.stock_maximo !== undefined && item.stock_maximo !== null) {
      if (totalEnPedidoPorPaqueteId(item.paquete_id) >= item.stock_maximo) {
        mostrarError(`No hay suficiente stock para el paquete "${item.nombre}". Límite: ${item.stock_maximo} uds`)
        return
      }
    }
    item.cantidad++
  }
}
const decrementar = (cartId) => {
  const idx = pedido.value.findIndex(i => i.cartId === cartId)
  if (idx !== -1) { pedido.value[idx].cantidad > 1 ? pedido.value[idx].cantidad-- : pedido.value.splice(idx, 1) }
}
const eliminarDelPedido = (cartId) => { pedido.value = pedido.value.filter(i => i.cartId !== cartId) }
const vaciarPedido = () => { if (confirm('¿Vaciar todo el pedido?')) pedido.value = [] }

const abrirPrecioPersonalizado = (p) => {
  showTamanosModal.value = false
  productoSeleccionado.value = p
  precioPersonalizadoValor.value = p.precio || 0
  precioPersonalizadoCantidad.value = 1
  showPrecioPersonalizado.value = true
}

const agregarConPrecioPersonalizado = () => {
  if (!precioPersonalizadoValor.value || precioPersonalizadoValor.value <= 0) return
  const p = productoSeleccionado.value
  if (!p) return
  showPrecioPersonalizado.value = false
  const cantidad = precioPersonalizadoCantidad.value || 1
  for (let i = 0; i < cantidad; i++) {
    pedido.value.push({
      cartId: Date.now() + Math.random(),
      id: p.id,
      nombre: `${p.nombre} (Personalizado)`,
      precio: parseFloat(precioPersonalizadoValor.value),
      imagen: p.imagen_url ? getImageUrl(p.imagen_url) : null,
      cantidad: 1,
      stock_maximo: 9999,
      notas: '',
      tamano: 'personalizado',
      minutos_produccion: parseFloat(p.minutos_produccion || 0)
    })
  }
}

const handleCheckout = async (checkoutData) => {
  try {
    const body = {
      restaurante_id: restauranteSeleccionado.value.id,
      productos: pedido.value.map(i => ({ 
        producto_id: i.es_paquete ? null : (i.es_oferta ? i.id : i.id), 
        paquete_id: i.es_paquete ? i.paquete_id : null,
        cantidad: i.cantidad,
        notas: i.notas,
        tamano: i.tamano || null
      })),
      metodo_pago: 'efectivo', tipo_orden: 'local',
      notas: checkoutData.notas || `Mesa ${checkoutData.numero_mesa}`,
      estado: 'ABIERTA', mesa: checkoutData.numero_mesa, usuario_id: empleadoId,
      programado_para: checkoutData.programado_para || null,
    }
    const data = await apiClient.post('/ordenes', body)
    if (data?.success) { 
      showCheckout.value = false; 
      pedido.value = []; 
      mostrarExito() 
      // Recargar productos de inmediato de forma silenciosa para actualizar stock
      if (restauranteSeleccionado.value?.id) {
        cargarProductos(restauranteSeleccionado.value.id, true)
      }
    } 
    else { checkoutRef.value?.setError(data.message || 'Error al enviar') }
  } catch { checkoutRef.value?.setError('Error de conexión') }
}

onMounted(async () => {
  console.log('🚀 [KIOSKO] Iniciando inicialización...');
  try {
    const restId = await cargarRestauranteActivo()
    console.log('📍 [KIOSKO] Resultado de ID Restaurante:', restId);
    
    if (restId) { 
      console.log('🔄 [KIOSKO] Cargando productos para ID:', restId);
      await cargarProductos(restId, false).catch(e => console.error('❌ [KIOSKO] Error productos:', e))
      
      console.log('🔄 [KIOSKO] Cargando ofertas y paquetes...');
      cargarOfertas(restId).catch(e => console.error('❌ [KIOSKO] Error ofertas:', e))
      cargarPaquetes(restId).catch(e => console.error('❌ [KIOSKO] Error paquetes:', e))
    } else {
      console.error('❌ [KIOSKO] No se pudo identificar el restaurante activo. Revisa el localStorage o la sesión.');
    }
  } catch (err) {
    console.error('🔥 [KIOSKO] Error crítico en inicialización:', err)
  } finally {
    loading.value.productos = false
    console.log('✅ [KIOSKO] Carga finalizada.');
  }

  // Polling silencioso y limpio cada 5 segundos para mantener el stock al día en el Kiosco
  const poll = async () => {
    marquesinaVariant.value = localStorage.getItem('marquesina_variant') || 'dark'
    if (restauranteSeleccionado.value?.id) {
      await cargarProductos(restauranteSeleccionado.value.id, true)
    }
    pollTimer = setTimeout(poll, POLL_INTERVAL)
  }
  pollTimer = setTimeout(poll, POLL_INTERVAL)

  // Escuchar cambios de color de la marquesina en caliente
  const handleStorageEvent = (e) => {
    if (e.key === 'marquesina_variant') {
      marquesinaVariant.value = e.newValue || 'dark'
    }
  }
  window.addEventListener('storage', handleStorageEvent)
  
  // Guardamos la referencia para poder limpiar el listener al desmontar
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
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-slide-left { animation: slideLeft 0.3s ease-out; }
@keyframes slideLeft { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
.animate-slide-up { animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

@layer utilities {
  .glass-card {
    background: hsla(0,0%,100%,0.8);
    backdrop-filter: blur(12px) saturate(150%);
    border: 1px solid rgba(255,255,255,0.2);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .glass-card:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 40px rgba(0,0,0,0.2);
  }
}
</style>