<template>
  <div class="h-screen w-screen bg-[#F6F7F5] flex flex-col font-sans overflow-hidden">

    <!-- Header Menú Kiosko -->
    <div class="shrink-0 bg-[#245C4F] shadow-sm border-b border-[#19483D] z-20">
      <div class="px-6 py-3.5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Logo del Restaurante -->
          <div v-if="restauranteSeleccionado?.imagen_url" class="w-11 h-11 rounded-xl overflow-hidden bg-white shadow-xs border border-white/20 shrink-0">
            <img :src="getImageUrl(restauranteSeleccionado.imagen_url)" :alt="restauranteSeleccionado.nombre || 'Imagen del restaurante'" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-11 h-11 rounded-xl bg-[#19483D] text-[#A4D1C6] flex items-center justify-center font-bold text-lg shrink-0 border border-white/10">
            <i class="fa-solid fa-store"></i>
          </div>
          <div>
            <h2 class="text-lg md:text-xl font-bold text-white leading-tight">
              {{ restauranteSeleccionado?.nombre || 'Kiosko de Menú' }}
            </h2>
            <p class="text-[#A4D1C6] text-xs mt-0.5 flex items-center gap-1.5 font-medium">
              <i class="fa-solid fa-location-dot text-[11px]"></i>
              <span>{{ restauranteSeleccionado?.ciudad ? restauranteSeleccionado.ciudad : 'Sincronizando menú...' }}</span>
            </p>
          </div>
        </div>
        <button @click="cerrarSesion" class="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-white/15 transition flex items-center gap-2 cursor-pointer shadow-xs">
          <span>Salir</span>
          <i class="fa-solid fa-arrow-right-from-bracket text-xs"></i>
        </button>
      </div>
      
      <!-- ══ OFERTAS DESTACADAS (Banner Superior) ══ -->
      <div v-if="ofertasProductos.length > 0" class="bg-[#FEF7EC] border-t border-[#A96517]/20">
        <div class="px-6 py-3">
          <div class="flex items-center gap-2 mb-2">
            <i class="fa-solid fa-fire text-[#A96517] text-xs"></i>
            <span class="text-[#A96517] text-xs font-bold uppercase tracking-wider">Ofertas del día</span>
          </div>
          
          <div class="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <button 
              v-for="oferta in ofertasProductos" 
              :key="oferta.id"
              @click="agregarOfertaAlPedido(oferta)"
              class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] hover:border-[#245C4F]/40 overflow-hidden flex-shrink-0 w-64 hover:shadow-md transition group text-left cursor-pointer"
            >
              <div class="relative h-24 bg-[#F6F7F5]">
                <img 
                  v-if="oferta.imagen_url" 
                  :src="getImageUrl(oferta.imagen_url)" alt="Imagen de la oferta" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div class="absolute top-2 left-2">
                  <span class="bg-[#B93838] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                    -{{ oferta.descuento_porcentaje }}%
                  </span>
                </div>
              </div>
              <div class="p-3">
                <h4 class="text-[#202723] font-bold text-xs truncate uppercase tracking-tight">{{ oferta.nombre }}</h4>
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-baseline gap-2">
                    <span class="text-[#68736C] text-[11px] line-through">${{ Number(oferta.precio_original || 0).toFixed(2) }}</span>
                    <span class="text-[#26734D] font-bold text-sm">${{ Number(oferta.precio_oferta || 0).toFixed(2) }}</span>
                  </div>
                  <div class="w-6 h-6 rounded-md bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center group-hover:bg-[#245C4F] group-hover:text-white transition shadow-xs text-xs font-bold">
                    +
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
        class="border-y border-black/10"
      />

      <!-- Filtros de categoría (Sub-Tabs) -->
      <div class="flex gap-2 px-6 py-3 overflow-x-auto scrollbar-hide bg-white shadow-xs border-b border-[#DDE3DE] items-center">
        <button @click="categoriaActiva = null"
          :class="['px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-2 cursor-pointer',
            categoriaActiva === null 
              ? 'bg-[#245C4F] text-white shadow-xs border border-[#245C4F]' 
              : 'bg-[#F0F2EF] text-[#68736C] hover:text-[#202723] hover:bg-[#E8F1ED] border border-transparent']">
          <i class="fa-solid fa-border-all text-xs"></i>
          <span>Todos</span>
        </button>
        
        <!-- Pestaña especial para Paquetes -->
        <button v-if="paquetes.length > 0" @click="categoriaActiva = 'paquetes'"
          :class="['px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-2 cursor-pointer',
            categoriaActiva === 'paquetes' 
              ? 'bg-[#245C4F] text-white shadow-xs border border-[#245C4F]' 
              : 'bg-[#F0F2EF] text-[#68736C] hover:text-[#202723] hover:bg-[#E8F1ED] border border-transparent']">
          <i class="fa-solid fa-boxes-packing text-xs"></i>
          <span>Paquetes</span>
        </button>

        <div class="h-5 w-px bg-[#DDE3DE] mx-1 shrink-0"></div>

        <button v-for="cat in categorias" :key="cat.id" @click="categoriaActiva = cat.id"
          :class="['px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-2 cursor-pointer',
            categoriaActiva === cat.id 
              ? 'bg-[#245C4F] text-white shadow-xs border border-[#245C4F]' 
              : 'bg-[#F0F2EF] text-[#68736C] hover:text-[#202723] hover:bg-[#E8F1ED] border border-transparent']">
          <i :class="getCategoryIcon(cat)" class="text-xs"></i>
          <span>{{ cat.nombre }}</span>
        </button>
      </div>
    </div>

    <!-- Layout Principal -->
    <div class="flex flex-1 min-h-0 overflow-hidden relative">

      <!-- Botón de Carrito (Toggle Sidebar) -->
      <button 
        @click="sidebarAbierta = !sidebarAbierta"
        class="hidden sm:flex absolute z-30 bg-white border border-[#DDE3DE] text-[#202723] shadow-md w-12 h-12 rounded-xl items-center justify-center hover:bg-[#F6F7F5] transition-all group cursor-pointer"
        :class="sidebarAbierta ? 'right-[24.5rem] top-3' : 'right-4 top-3'"
      >
        <div class="relative">
          <i class="fa-solid fa-cart-shopping text-base text-[#245C4F]"></i>
          <span v-if="totalItems > 0" 
                class="absolute -top-2.5 -right-3 bg-[#245C4F] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {{ totalItems }}
          </span>
        </div>
        <!-- Tooltip -->
        <div class="absolute -bottom-9 bg-[#202723] text-white text-[10px] font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
          {{ sidebarAbierta ? 'Ocultar Pedido' : 'Ver Mi Pedido' }}
        </div>
      </button>

      <!-- Contenedor de Scroll de Productos -->
      <div class="flex-1 min-h-0 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        <div v-if="loading.productos" class="flex flex-col items-center justify-center py-20 gap-3">
          <div class="w-8 h-8 border-4 border-[#E8F1ED] border-t-[#245C4F] rounded-full animate-spin"></div>
          <p class="text-[#68736C] text-xs font-semibold uppercase tracking-wider">Cargando catálogo...</p>
        </div>

        <template v-else>
          <!-- ══ SECCIÓN DE PAQUETES (Si está en 'Todos' o 'Paquetes') ══ -->
          <div v-if="(categoriaActiva === null || categoriaActiva === 'paquetes') && paquetes.length > 0" class="animate-fade-in">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-9 h-9 rounded-xl bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-sm shadow-xs border border-[#245C4F]/10">
                <i class="fa-solid fa-boxes-packing"></i>
              </div>
              <h3 class="font-bold text-[#202723] text-base tracking-tight uppercase">Combos y Paquetes</h3>
              <div class="flex-1 h-px bg-[#DDE3DE]"></div>
            </div>
            
            <div class="grid grid-cols-1 gap-5 transition-all duration-300"
                 :class="sidebarAbierta ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'">
              <button 
                v-for="pkg in paquetes" 
                :key="pkg.id"
                @click="agregarPaqueteAlPedido(pkg)"
                :disabled="pkg.stock !== undefined && pkg.stock !== null && totalEnPedidoPorPaqueteId(pkg.id) >= pkg.stock"
                class="bg-white rounded-2xl border border-[#DDE3DE] shadow-xs overflow-hidden flex flex-col text-left hover:shadow-md hover:border-[#245C4F]/40 transition group p-2.5 disabled:opacity-50 disabled:cursor-not-allowed relative cursor-pointer"
              >
                <div class="relative rounded-xl overflow-hidden bg-[#F6F7F5] h-40">
                  <img 
                    v-if="pkg.imagen_url" 
                    :src="getImageUrl(pkg.imagen_url)" :alt="pkg.nombre || 'Paquete'" 
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-3xl text-[#68736C]/40">
                    <i class="fa-solid fa-boxes-packing"></i>
                  </div>
                  <div v-if="pkg.stock !== undefined && pkg.stock !== null && totalEnPedidoPorPaqueteId(pkg.id) >= pkg.stock" class="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center text-[#B93838] font-bold text-xs uppercase tracking-wider z-10">Agotado</div>
                  <div class="absolute top-2.5 right-2.5">
                    <span class="bg-[#245C4F] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-xs uppercase tracking-wider">Promoción</span>
                  </div>
                </div>
                
                <div class="p-3 flex-1 flex flex-col">
                  <h4 class="text-[#202723] font-bold text-sm uppercase mb-1.5">{{ pkg.nombre }}</h4>
                  <div class="flex flex-wrap gap-1 mb-3">
                    <span v-for="p in pkg.productos" :key="p.id" class="text-[10px] bg-[#F6F7F5] text-[#68736C] px-2 py-0.5 rounded font-medium border border-[#DDE3DE]">
                      {{ p.pivot.cantidad }}× {{ p.nombre }}
                    </span>
                  </div>
                  <div class="mt-auto flex items-center justify-between pt-2.5 border-t border-[#DDE3DE]">
                    <span class="text-[#245C4F] font-bold text-base">${{ Number(pkg.precio).toFixed(2) }}</span>
                    <div class="w-7 h-7 rounded-lg bg-[#245C4F] text-white flex items-center justify-center shadow-xs group-hover:bg-[#19483D] transition text-xs font-bold">
                      +
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- ══ SECCIONES DE PRODUCTOS ══ -->
          <div v-if="categoriaActiva !== 'paquetes'" v-for="cat in categoriasFiltradas" :key="cat.id" class="animate-fade-in">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-9 h-9 rounded-xl bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-sm shadow-xs border border-[#245C4F]/10">
                <i :class="getCategoryIcon(cat)"></i>
              </div>
              <h3 class="font-bold text-[#202723] text-base tracking-tight uppercase">{{ cat.nombre }}</h3>
              <div class="flex-1 h-px bg-[#DDE3DE]"></div>
            </div>

            <div class="grid grid-cols-2 gap-4 transition-all duration-300"
                 :class="sidebarAbierta ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'">
              <button v-for="p in cat.productos" :key="p.id"
                @click="agregarAlPedido(p)"
                :disabled="p.agotado"
                class="bg-white rounded-2xl border border-[#DDE3DE] shadow-xs overflow-hidden flex flex-col text-left hover:shadow-md hover:border-[#245C4F]/40 transition group disabled:opacity-50 relative p-2.5 cursor-pointer">
                <div class="w-full rounded-xl overflow-hidden bg-[#F6F7F5] flex items-center justify-center relative transition-all duration-300 h-32 md:h-36">
                  <img v-if="p.imagen_url" :src="getImageUrl(p.imagen_url)" :alt="p.nombre"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span v-else class="text-2xl text-[#68736C]/40">
                    <i :class="getCategoryIcon(cat)"></i>
                  </span>
                  <div v-if="p.agotado" class="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center text-[#B93838] font-bold text-xs uppercase tracking-wider z-10">Agotado</div>
                </div>
                <div class="p-2 flex-1 flex flex-col justify-between">
                  <div>
                    <p class="font-bold text-[#202723] text-xs uppercase leading-tight line-clamp-2">{{ p.nombre }}</p>
                    <div class="flex items-center justify-between mt-1 flex-wrap gap-1">
                      <p v-if="p.bajo_stock && !p.agotado" class="font-semibold text-[#A96517] bg-[#FEF7EC] px-1.5 py-0.5 rounded text-[10px]">Últimas {{ p.stock }}</p>
                      <div v-if="p.tamanos && p.tamanos.length > 0" class="flex gap-1 ml-auto">
                        <span v-for="t in p.tamanos" :key="t.id" class="px-1.5 py-0.5 rounded bg-[#E8F1ED] text-[#245C4F] border border-[#245C4F]/10 text-[10px] font-semibold uppercase">
                          {{ t.nombre }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between mt-2.5 pt-2 border-t border-[#DDE3DE]">
                    <span class="font-bold text-[#202723] text-xs md:text-sm">{{ getPrecioRango(p) }}</span>
                    <div class="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold transition shadow-xs"
                      :class="!p.agotado ? 'bg-[#245C4F] text-white group-hover:bg-[#19483D]' : 'bg-[#F0F2EF] text-[#68736C]'">
                      {{ !p.agotado ? '+' : '✕' }}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Mensaje cuando no hay productos -->
          <div v-if="productos.length === 0 && paquetes.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-16 h-16 rounded-full bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-2xl mb-3">
              <i class="fa-solid fa-utensils"></i>
            </div>
            <h3 class="text-base font-bold text-[#202723] uppercase tracking-wider">Sin Productos Disponibles</h3>
            <p class="text-[#68736C] text-xs mt-1">No se encontraron productos disponibles en este momento.</p>
          </div>
        </template>
      </div>

      <!-- Carrito lateral (Escritorio) -->
      <div v-show="sidebarAbierta" class="w-96 shrink-0 h-full bg-white border-l border-[#DDE3DE] flex flex-col shadow-lg z-10 hidden sm:flex animate-slide-left">
        <div class="px-5 py-4 border-b border-[#DDE3DE] bg-[#F6F7F5]">
          <div class="flex justify-between items-center mb-1">
            <h3 class="font-bold text-[#202723] text-base tracking-tight flex items-center gap-2">
              <i class="fa-solid fa-receipt text-[#245C4F]"></i> Tu Pedido
            </h3>
            <span class="bg-[#E8F1ED] text-[#245C4F] px-2.5 py-0.5 rounded-full text-xs font-semibold">{{ totalItems }} items</span>
          </div>
          <p class="text-[11px] text-[#68736C] font-medium">Terminal Kiosko de Autoservicio</p>
        </div>
        
        <div class="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 bg-white custom-scrollbar">
          <div v-if="pedido.length === 0" class="flex flex-col items-center justify-center h-full text-center py-16">
            <div class="w-14 h-14 rounded-full bg-[#F0F2EF] text-[#68736C]/50 flex items-center justify-center text-2xl mb-3">
              <i class="fa-solid fa-basket-shopping"></i>
            </div>
            <p class="text-[#202723] font-bold text-sm">Tu orden está vacía</p>
            <p class="text-xs text-[#68736C] mt-1">Toca los platillos para agregarlos</p>
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="(nombre, cIdx) in comensalesNombres" :key="cIdx" 
                 class="overflow-hidden transition-all rounded-xl"
                 :class="comensalesNombres.length > 1 ? (comensalActivoIndex === cIdx ? 'border-2 border-[#245C4F] shadow-xs' : 'border border-[#DDE3DE]') : ''">
              
              <!-- Box Header -->
              <div v-if="comensalesNombres.length > 1" class="bg-[#F6F7F5] p-2.5 flex justify-between items-center cursor-pointer border-b border-[#DDE3DE]" @click="comensalActivoIndex = cIdx">
                 <div class="flex items-center gap-2">
                    <i :class="comensalActivoIndex === cIdx ? 'fa-solid fa-user text-[#245C4F]' : 'fa-solid fa-users text-[#68736C]'" class="text-xs"></i>
                    <div class="flex flex-col">
                      <input v-model="comensalesNombres[cIdx]" @click.stop class="bg-transparent font-bold text-xs text-[#202723] outline-none w-32 border-b border-transparent focus:border-[#245C4F] transition-colors" />
                      <span v-if="tiempoPorComensal(cIdx) >= 0 && getItemsForComensal(cIdx).length > 0" class="text-[10px] text-[#68736C] mt-0.5">Tiempo est: {{ tiempoPorComensal(cIdx) }} min</span>
                    </div>
                 </div>
                 <span v-if="comensalActivoIndex === cIdx" class="text-[10px] font-semibold text-[#245C4F] bg-[#E8F1ED] px-2 py-0.5 rounded">Activo</span>
                 <span v-else class="text-[10px] font-semibold text-[#68736C]">Inactivo</span>
              </div>

              <!-- Box Items -->
              <div class="p-2.5 space-y-2.5 bg-white">
                <div v-if="getItemsForComensal(cIdx).length === 0" class="text-center py-4 text-[#68736C] text-xs italic border border-dashed border-[#DDE3DE] rounded-lg">
                  Sin platillos agregados
                </div>
                
                <div v-for="item in getItemsForComensal(cIdx)" :key="item.cartId" 
                  class="p-2.5 bg-[#F6F7F5] border border-[#DDE3DE] rounded-xl hover:border-[#245C4F]/30 group transition">
                  <div class="flex items-center gap-2.5 mb-2">
                    <div class="w-9 h-9 rounded-lg overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-xs border border-[#DDE3DE]">
                      <img v-if="item.imagen" :src="item.imagen" :alt="item.nombre || 'Producto'" class="w-full h-full object-cover" />
                      <i v-else :class="item.es_paquete ? 'fa-solid fa-boxes-packing text-[#245C4F]' : 'fa-solid fa-utensils text-[#68736C]'" class="text-xs"></i>
                    </div>
                    <div class="flex-1 min-w-0 flex justify-between items-start">
                      <p class="text-xs font-bold text-[#202723] uppercase truncate leading-tight mt-0.5">
                        {{ item.nombre }} {{ item.tamano_nombre ? '(' + item.tamano_nombre + ')' : '' }}
                      </p>
                      <button @click="eliminarDelPedido(item.cartId)" class="text-[#68736C] hover:text-[#B93838] transition ml-2 cursor-pointer" title="Quitar producto">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  </div>
                  <div class="mb-2">
                    <input v-model="item.notas" type="text" placeholder="Notas (Ej: Sin cebolla)" class="w-full px-2.5 py-1 text-xs font-medium border border-[#DDE3DE] rounded-lg bg-white focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] outline-none transition placeholder:text-[#68736C]/60" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 bg-white rounded-lg p-0.5 border border-[#DDE3DE] shadow-xs">
                      <button @click="decrementar(item.cartId)" class="w-6 h-6 rounded bg-[#F0F2EF] text-[#202723] text-xs font-bold flex items-center justify-center hover:bg-[#DDE3DE] hover:text-[#B93838] transition cursor-pointer">−</button>
                      <span class="text-xs font-bold w-5 text-center text-[#202723]">{{ item.cantidad }}</span>
                      <button @click="incrementar(item.cartId)"
                        :disabled="(!item.es_paquete && item.stock_maximo !== undefined && item.stock_maximo !== null && totalEnPedidoPorId(item.id) >= item.stock_maximo) || (item.es_paquete && item.stock_maximo !== undefined && item.stock_maximo !== null && totalEnPedidoPorPaqueteId(item.paquete_id) >= item.stock_maximo)"
                        class="w-6 h-6 rounded bg-[#245C4F] text-white text-xs font-bold flex items-center justify-center hover:bg-[#19483D] transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">+</button>
                    </div>
                    <p class="text-xs font-bold text-[#202723]">${{ (item.precio * item.cantidad).toFixed(2) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-5 border-t border-[#DDE3DE] bg-[#F6F7F5] space-y-3 shrink-0">
          <div v-if="pedido.length > 0" class="space-y-1.5">
            <div class="flex justify-between text-xs text-[#68736C]">
              <span>Subtotal</span>
              <span class="font-medium">${{ totalPedido.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-baseline pt-1 border-t border-[#DDE3DE]">
              <span class="text-sm font-bold text-[#202723]">Total</span>
              <span class="text-2xl font-bold text-[#245C4F] leading-none">${{ totalPedido.toFixed(2) }}</span>
            </div>
          </div>
          
          <button @click="showCheckout = true" :disabled="pedido.length === 0"
            class="w-full py-3 bg-[#245C4F] text-white text-xs font-semibold rounded-xl hover:bg-[#19483D] hover:shadow-xs active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 cursor-pointer">
            <i class="fa-solid fa-circle-check text-xs"></i>
            <span>Confirmar Orden</span>
          </button>
          
          <div v-if="ordenConfirmada" class="p-2.5 bg-[#E8F1ED] text-[#26734D] border border-[#26734D]/30 text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-2">
            <i class="fa-solid fa-circle-check text-xs"></i>
            <span>¡Orden enviada correctamente!</span>
          </div>
          <div v-if="errorOrden" class="p-2.5 bg-[#FEF2F2] text-[#B93838] border border-[#B93838]/30 text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-2">
            <i class="fa-solid fa-circle-exclamation text-xs"></i>
            <span>{{ errorOrden }}</span>
          </div>
          
          <button v-if="pedido.length > 0" @click="vaciarPedido" class="w-full py-1 text-xs font-semibold text-[#68736C] hover:text-[#B93838] transition cursor-pointer">
            Vaciar Carrito
          </button>
        </div>
      </div>
    </div>

    <!-- Botón flotante móvil -->
    <div v-if="pedido.length > 0" class="sm:hidden fixed bottom-5 left-4 right-4 z-20">
      <button @click="showCarritoMobile = true"
        class="w-full py-3.5 bg-[#245C4F] text-white rounded-xl shadow-lg flex items-center justify-between px-5 font-bold border border-[#19483D] active:scale-[0.99] transition cursor-pointer">
        <span class="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-semibold">{{ totalItems }} Items</span>
        <span class="text-xs uppercase tracking-wider font-bold flex items-center gap-2">
          <i class="fa-solid fa-receipt text-xs"></i>
          Ver Pedido
        </span>
        <span class="text-sm font-bold">${{ totalPedido.toFixed(2) }}</span>
      </button>
    </div>

    <!-- Modal Carrito Móvil -->
    <div v-if="showCarritoMobile" class="sm:hidden fixed inset-0 bg-[#202723]/40 z-50 flex items-end backdrop-blur-xs transition-all duration-200"
      @click.self="showCarritoMobile = false">
      <div class="bg-white w-full rounded-t-2xl p-5 max-h-[85vh] flex flex-col shadow-xl border-t border-[#DDE3DE] animate-slide-up">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-[#DDE3DE] mb-3">
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-[#202723] text-base tracking-tight flex items-center gap-2">
              <i class="fa-solid fa-receipt text-[#245C4F]"></i>
              Tu Pedido
            </h3>
            <span class="bg-[#E8F1ED] text-[#245C4F] px-2 py-0.5 rounded-full text-xs font-semibold">{{ totalItems }} platillos</span>
          </div>
          <button @click="showCarritoMobile = false" class="w-8 h-8 bg-[#F0F2EF] rounded-lg flex items-center justify-center text-[#68736C] hover:bg-[#DDE3DE] hover:text-[#202723] transition cursor-pointer">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
        
        <!-- Lista de Comensales -->
        <div class="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 custom-scrollbar">
          <div v-if="pedido.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
            <div class="w-14 h-14 rounded-full bg-[#F0F2EF] text-[#68736C]/50 flex items-center justify-center text-2xl mb-2">
              <i class="fa-solid fa-basket-shopping"></i>
            </div>
            <p class="text-[#202723] font-bold text-sm">Tu orden está vacía</p>
            <p class="text-xs text-[#68736C] mt-0.5">Toca los platillos para agregarlos</p>
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="(nombre, cIdx) in comensalesNombres" :key="cIdx" 
                 class="overflow-hidden transition-all rounded-xl"
                 :class="comensalesNombres.length > 1 ? (comensalActivoIndex === cIdx ? 'border-2 border-[#245C4F] shadow-xs' : 'border border-[#DDE3DE]') : ''">
              
              <!-- Header Comensal -->
              <div v-if="comensalesNombres.length > 1" class="p-2.5 flex justify-between items-center cursor-pointer transition-colors bg-[#F6F7F5] border-b border-[#DDE3DE]" 
                   @click="comensalActivoIndex = cIdx">
                <div class="flex items-center gap-2">
                   <i :class="comensalActivoIndex === cIdx ? 'fa-solid fa-user text-[#245C4F]' : 'fa-solid fa-users text-[#68736C]'" class="text-xs"></i>
                   <div class="flex flex-col">
                     <input v-model="comensalesNombres[cIdx]" @click.stop class="bg-transparent font-bold text-xs text-[#202723] outline-none w-28 border-b border-transparent focus:border-[#245C4F] transition-colors" placeholder="Nombre..." />
                     <span v-if="tiempoPorComensal(cIdx) >= 0 && getItemsForComensal(cIdx).length > 0" class="text-[10px] text-[#68736C] mt-0.5">Tiempo est: {{ tiempoPorComensal(cIdx) }} min</span>
                   </div>
                </div>
                <span v-if="comensalActivoIndex === cIdx" class="text-[10px] font-semibold text-[#245C4F] bg-[#E8F1ED] px-2 py-0.5 rounded">Activo</span>
                <span v-else class="text-[10px] font-semibold text-[#68736C]">Inactivo</span>
              </div>

              <!-- Items Comensal -->
              <div class="p-2.5 space-y-2.5 bg-white">
                <div v-if="getItemsForComensal(cIdx).length === 0" class="text-center py-4 text-[#68736C] text-xs italic border border-dashed border-[#DDE3DE] rounded-lg">
                  Sin platillos agregados
                </div>
                
                <div v-for="item in getItemsForComensal(cIdx)" :key="item.cartId" class="p-2.5 bg-[#F6F7F5] border border-[#DDE3DE] rounded-xl hover:border-[#245C4F]/30 transition">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 rounded-lg overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-xs border border-[#DDE3DE]">
                      <img v-if="item.imagen" :src="item.imagen" :alt="item.nombre || 'Producto'" class="w-full h-full object-cover" />
                      <i v-else :class="item.es_paquete ? 'fa-solid fa-boxes-packing text-[#245C4F]' : 'fa-solid fa-utensils text-[#68736C]'" class="text-xs"></i>
                    </div>
                    <div class="flex-1 min-w-0 flex justify-between items-start">
                      <p class="text-xs font-bold text-[#202723] uppercase truncate leading-tight mt-0.5">
                        {{ item.nombre }} {{ item.tamano_nombre ? '(' + item.tamano_nombre + ')' : '' }}
                      </p>
                      <button @click="eliminarDelPedido(item.cartId)" class="text-[#68736C] hover:text-[#B93838] transition ml-2 cursor-pointer" title="Quitar producto">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  </div>
                  <div class="mb-2">
                    <input v-model="item.notas" type="text" placeholder="Notas (Ej: Sin cebolla)" class="w-full px-2.5 py-1 text-xs font-medium border border-[#DDE3DE] rounded-lg bg-white focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] outline-none transition placeholder:text-[#68736C]/60" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 bg-white rounded-lg p-0.5 border border-[#DDE3DE] shadow-xs">
                      <button @click="decrementar(item.cartId)" class="w-6 h-6 rounded bg-[#F0F2EF] text-[#202723] text-xs font-bold flex items-center justify-center hover:bg-[#DDE3DE] hover:text-[#B93838] transition cursor-pointer">−</button>
                      <span class="text-xs font-bold w-5 text-center text-[#202723]">{{ item.cantidad }}</span>
                      <button @click="incrementar(item.cartId)"
                        :disabled="(!item.es_paquete && item.stock_maximo !== undefined && item.stock_maximo !== null && totalEnPedidoPorId(item.id) >= item.stock_maximo) || (item.es_paquete && item.stock_maximo !== undefined && item.stock_maximo !== null && totalEnPedidoPorPaqueteId(item.paquete_id) >= item.stock_maximo)"
                        class="w-6 h-6 rounded bg-[#245C4F] text-white text-xs font-bold flex items-center justify-center hover:bg-[#19483D] transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">+</button>
                    </div>
                    <p class="text-xs font-bold text-[#202723]">${{ (item.precio * item.cantidad).toFixed(2) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Móvil -->
        <div class="pt-3 border-t border-[#DDE3DE] space-y-2 shrink-0 bg-white">
          <div class="flex justify-between items-baseline px-1">
            <span class="text-xs font-bold text-[#68736C] uppercase tracking-wider">Total</span>
            <span class="text-2xl font-bold text-[#245C4F] leading-none">${{ totalPedido.toFixed(2) }}</span>
          </div>
          <button @click="showCheckout = true; showCarritoMobile = false" :disabled="pedido.length === 0"
            class="w-full py-3 bg-[#245C4F] text-white text-xs font-semibold rounded-xl hover:bg-[#19483D] active:scale-[0.99] transition disabled:opacity-40 uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 cursor-pointer">
            <i class="fa-solid fa-circle-check text-xs"></i>
            <span>Confirmar Pedido</span>
          </button>
          <button v-if="pedido.length > 0" @click="vaciarPedido" class="w-full py-1 text-xs font-semibold text-[#68736C] hover:text-[#B93838] transition text-center cursor-pointer">
            Vaciar Carrito
          </button>
        </div>

      </div>
    </div>

    <!-- Modal Checkout -->
    <MenuCheckoutModal
      v-if="showCheckout"
      :pedido="pedido"
      :restaurante-nombre="restauranteSeleccionado?.nombre || ''"
      :total-mesas="Number(restauranteSeleccionado?.total_mesas || 0)"
      ref="checkoutRef"
      @close="showCheckout = false"
      @confirmar="handleCheckout"
    />

    <!-- Modal Tamaño del Producto (Kiosko) -->
    <div v-if="showTamanoModalKiosko && productoTamanoSeleccionarKiosko" class="fixed inset-0 bg-[#202723]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 border border-[#DDE3DE] animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between border-b border-[#DDE3DE] pb-3">
          <div>
            <h3 class="text-sm font-bold text-[#202723] uppercase tracking-wider">{{ productoTamanoSeleccionarKiosko?.nombre }}</h3>
            <p class="text-xs text-[#68736C] mt-0.5 font-medium">Selecciona el tamaño deseado</p>
          </div>
          <button @click="showTamanoModalKiosko = false" class="w-8 h-8 rounded-lg bg-[#F0F2EF] text-[#68736C] hover:bg-[#DDE3DE] hover:text-[#202723] flex items-center justify-center transition cursor-pointer">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div class="space-y-2 my-4">
          <button v-for="tam in (productoTamanoSeleccionarKiosko?.tamanos || [])" :key="tam.id"
            @click="tam.stock !== undefined && tam.stock !== null && Number(tam.stock) <= 0 ? null : tamanoSeleccionadoModalKiosko = tam"
            :disabled="tam.stock !== undefined && tam.stock !== null && Number(tam.stock) <= 0"
            type="button"
            class="flex items-center justify-between w-full p-3 rounded-xl border transition cursor-pointer text-left disabled:opacity-40 disabled:cursor-not-allowed"
            :class="tamanoSeleccionadoModalKiosko?.id === tam.id ? 'border-[#245C4F] bg-[#E8F1ED] text-[#245C4F] shadow-xs' : 'border-[#DDE3DE] bg-[#F6F7F5] text-[#202723] hover:border-[#245C4F]/40'">
            <div class="flex items-center">
              <span class="w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs uppercase mr-3"
                :class="tamanoSeleccionadoModalKiosko?.id === tam.id ? 'bg-[#245C4F] text-white' : 'bg-[#DDE3DE] text-[#202723]'">
                {{ (tam.nombre || '').charAt(0).toUpperCase() }}
              </span>
              <div class="flex flex-col">
                <span class="font-bold text-xs uppercase tracking-wide">{{ tam.nombre }}</span>
                <span v-if="tam.stock !== undefined && tam.stock !== null && Number(tam.stock) <= 0" class="text-[10px] text-[#B93838] font-semibold uppercase">Agotado</span>
              </div>
            </div>
            <span class="font-bold text-sm text-[#202723]">${{ Number(tam.precio || 0).toFixed(2) }}</span>
          </button>
        </div>

        <div class="flex items-center gap-2.5 pt-2">
          <button @click="showTamanoModalKiosko = false" type="button"
            class="flex-1 py-2.5 text-xs font-semibold text-[#68736C] bg-[#F0F2EF] hover:bg-[#DDE3DE] hover:text-[#202723] rounded-xl transition cursor-pointer">
            Cancelar
          </button>
          <button @click="confirmarAgregarTamanoAlPedidoKiosko" type="button"
            :disabled="!tamanoSeleccionadoModalKiosko || (tamanoSeleccionadoModalKiosko.stock !== undefined && tamanoSeleccionadoModalKiosko.stock !== null && Number(tamanoSeleccionadoModalKiosko.stock) <= 0)"
            class="flex-1 py-2.5 text-xs font-semibold text-white bg-[#245C4F] hover:bg-[#19483D] rounded-xl shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            Agregar ${{ tamanoSeleccionadoModalKiosko ? Number(tamanoSeleccionadoModalKiosko.precio || 0).toFixed(2) : '0.00' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { sessionGet, sessionSet, sessionRemove } from '@/utils/session'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import MarquesitaWidget from '../components/Marquesitawidget.vue'
import MenuCheckoutModal from '../components/menu/MenuCheckoutModal.vue'

const router = useRouter()
const API_URL     = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
import { STORAGE_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'

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
const checkoutRef             = ref(null)
const ofertasProductos        = ref([])
const paquetes                = ref([])
const sidebarAbierta          = ref(true)
const marquesinaVariant       = ref(localStorage.getItem('marquesina_variant') || 'dark')
let pollTimer = null
const POLL_INTERVAL = 5000 // 5 segundos

// --- ESTADO COMENSALES ---
const numeroComensales    = ref(1)
const comensalesNombres   = ref(['General'])
const comensalActivoIndex = ref(0)

watch(numeroComensales, (newVal) => {
  if (newVal === '' || newVal === null || newVal === undefined) {
    return
  }
  const numVal = parseInt(newVal)
  if (isNaN(numVal) || numVal < 1) {
    return
  }
  const diff = numVal - comensalesNombres.value.length
  if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      comensalesNombres.value.push(`Comensal ${comensalesNombres.value.length + 1}`)
    }
  } else if (diff < 0) {
    comensalesNombres.value.splice(numVal)
    pedido.value.forEach(item => {
      if (item.comensalIndex >= numVal) item.comensalIndex = 0
    })
  }
  if (comensalActivoIndex.value >= numVal) {
    comensalActivoIndex.value = numVal - 1
  }
})

const getItemsForComensal = (cIdx) => pedido.value.filter(i => i.comensalIndex === cIdx)

const tiempoPorComensal = (cIdx) => {
  return getItemsForComensal(cIdx).reduce((total, i) => total + ((i.minutos_produccion || 0) * i.cantidad), 0)
}

const userRaw    = sessionGet('user') ?? '{}'
const userActual = (() => { try { return JSON.parse(userRaw) } catch { return {} } })()
const empleadoId = userActual?.id ?? null

// --- Helpers ---
const getHeaders = () => {
  const token = sessionGet('token')
  return { 'Content-Type':'application/json', Accept:'application/json', Authorization: token ? `Bearer ${token}` : '' }
}
import { resolveImageUrl } from '@/config/api'
const getImageUrl = (path) => resolveImageUrl(path)
const getCategoryIcon = (cat) => {
  const n = String(cat?.nombre || '').toLowerCase()
  if (n.includes('bebida') || n.includes('barra') || n.includes('drink')) return 'fa-solid fa-glass-water'
  if (n.includes('alimento') || n.includes('comida') || n.includes('cocina')) return 'fa-solid fa-utensils'
  if (n.includes('postre') || n.includes('dulce') || n.includes('dessert') || n.includes('pastel')) return 'fa-solid fa-cookie-bite'
  if (n.includes('combo') || n.includes('paquete')) return 'fa-solid fa-boxes-packing'
  if (n.includes('entrada') || n.includes('snack') || n.includes('tapa')) return 'fa-solid fa-bowl-food'
  return 'fa-solid fa-utensils'
}
const onImageError = (e) => { e.target.style.display = 'none' }
const mostrarError = (msg, dur = 4000) => { errorOrden.value = msg; setTimeout(() => { if(errorOrden.value===msg) errorOrden.value='' }, dur) }
const mostrarExito = () => { ordenConfirmada.value = true; setTimeout(() => { ordenConfirmada.value = false }, 3000) }

const cerrarSesion = () => {
  sessionRemove('token'); sessionRemove('user')
  sessionRemove('token'); sessionRemove('user')
  router.push('/login')
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

const totalPedido = computed(() => pedido.value.reduce((s, i) => s + (Number(i.precio) || 0) * (Number(i.cantidad) || 1), 0))
const totalItems  = computed(() => pedido.value.reduce((s, i) => s + (Number(i.cantidad) || 1), 0))

const getPrecioRango = (p) => {
  if (p.tamanos && p.tamanos.length > 0) {
    const precios = p.tamanos.map(t => Number(t.precio) || 0).filter(pr => pr > 0)
    if (precios.length > 0) {
      const min = Math.min(...precios)
      const max = Math.max(...precios)
      if (min === max) {
        return `$${min.toFixed(2)}`
      }
      return `$${min.toFixed(2)} - $${max.toFixed(2)}`
    }
  }
  return `$${Number(p.precio || 0).toFixed(2)}`
}

const normalizar = (p) => {
  if (!p) return null;
  try {
    const rawTamanos = (Array.isArray(p.tamanos) && p.tamanos.length > 0)
      ? p.tamanos
      : ((Array.isArray(p.tamanos_disponibles) && p.tamanos_disponibles.length > 0)
          ? p.tamanos_disponibles
          : (Array.isArray(p.tamanos_personalizados) ? p.tamanos_personalizados : []));

    const tamanosList = rawTamanos
      .filter(t => t && t.id !== 'unico' && t.key !== 'unico' && String(t.nombre || '').trim().toLowerCase() !== 'único' && String(t.nombre || '').trim().toLowerCase() !== 'unico')
      .map((t, idx) => ({
        ...t,
        id: t.id ?? t.key ?? t.nombre ?? `tam-${idx}`,
        key: t.key ?? t.id ?? t.nombre ?? `tam-${idx}`,
        nombre: t.nombre ?? t.key ?? `Tamaño ${idx + 1}`,
        precio: parseFloat(t.precio || 0),
        stock: (t.stock !== undefined && t.stock !== null) ? Number(t.stock) : (p.stock ?? 0)
      }));

    const tieneTamanos = tamanosList.length > 0;
    const rawStock = parseFloat(p.stock_restante ?? p.stock_disponible ?? p.stock ?? 0);
    const estaAgotado = tieneTamanos 
      ? tamanosList.every(t => (t.stock !== undefined && t.stock !== null && t.stock > 0) ? parseFloat(t.stock) <= 0 : false)
      : rawStock <= 0;

    return {
      id:          p.id,
      nombre:      p.nombre || 'Sin nombre',
      descripcion: p.descripcion || '',
      precio:      parseFloat(p.precio || 0),
      imagen_url:  p.imagen_url  || p.imagen || null,
      stock:       rawStock,
      agotado:     estaAgotado,
      bajo_stock:  p.bajo_stock ?? false,
      minutos_produccion: parseFloat(p.minutos_produccion || 0),
      tamanos:     tamanosList,
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
      
      if (userData.restaurante) {
        restauranteSeleccionado.value = userData.restaurante
        sessionSet('restaurante_id_activo', userData.restaurante.id)
        return userData.restaurante.id
      }
      const ra = userData.restaurante_activo;
      if (ra) { 
        const id = typeof ra === 'object' ? ra.id : ra;
        restauranteSeleccionado.value = typeof ra === 'object' ? ra : { id: ra, nombre: 'Restaurante' };
        sessionSet('restaurante_id_activo', id);
        return id;
      }
      const listaRest = userData.restaurantes || userData.data?.restaurantes;
      if (Array.isArray(listaRest) && listaRest.length > 0) {
        const id = listaRest[0].id;
        restauranteSeleccionado.value = listaRest[0];
        sessionSet('restaurante_id_activo', id);
        return id;
      }
    }
    const savedId = sessionGet('restaurante_id_activo') ?? sessionGet('restaurante_id')
    return savedId
  } catch (err) { 
    return sessionGet('restaurante_id_activo') ?? sessionGet('restaurante_id')
  }
}

const cargarProductos = async (restauranteId, silent = true) => {
  if (!silent) {
    loading.value.productos = true
  }
  try {
    console.log('📡 [KIOSKO] Pidiendo productos disponibles...');
    const dispData = await apiClient.get(`/productos/disponibles?restaurante_id=${restauranteId}`)
    console.log('📦 [KIOSKO] Respuesta productos disponibles:', dispData);

    if (dispData?.success) {
      let lista = dispData.data; 
      if (!Array.isArray(lista)) lista = lista?.data ?? []
      productos.value = lista.map(normalizar).filter(p => p !== null);

      return;
    }

    const todosData = await apiClient.get(`/productos?restaurante_id=${restauranteId}&per_page=100`)
    console.log('📦 [KIOSKO] Respuesta catálogo general:', todosData);
    
    if (todosData?.success) {
      let lista = todosData.data; 
      if (!Array.isArray(lista)) lista = lista?.data ?? []
      productos.value = lista.map(normalizar).filter(p => p !== null);
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

// ── Tamaños modal state (Kiosko) ──
const showTamanoModalKiosko = ref(false)
const productoTamanoSeleccionarKiosko = ref(null)
const tamanoSeleccionadoModalKiosko = ref(null)

const abrirModalTamanosKiosko = (producto) => {
  productoTamanoSeleccionarKiosko.value = producto
  if (producto.tamanos && producto.tamanos.length > 0) {
    const disponible = producto.tamanos.find(t => t.stock === undefined || t.stock === null || Number(t.stock) > 0)
    tamanoSeleccionadoModalKiosko.value = disponible || null
  } else {
    tamanoSeleccionadoModalKiosko.value = null
  }
  showTamanoModalKiosko.value = true
}

const confirmarAgregarTamanoAlPedidoKiosko = () => {
  if (!productoTamanoSeleccionarKiosko.value || !tamanoSeleccionadoModalKiosko.value) return
  const prod = productoTamanoSeleccionarKiosko.value
  const tam = tamanoSeleccionadoModalKiosko.value
  const cIdx = comensalActivoIndex.value

  if (tam.stock !== undefined && tam.stock !== null) {
    const stockTam = Number(tam.stock)
    if (stockTam <= 0) {
      mostrarError(`El tamaño "${tam.nombre}" para "${prod.nombre}" está agotado`)
      return
    }
    const yaEnPedido = pedido.value
      .filter(i => i.id === prod.id && i.tamano_id === tam.id)
      .reduce((sum, i) => sum + i.cantidad, 0)
    if (yaEnPedido >= stockTam) {
      mostrarError(`No hay suficiente stock para "${prod.nombre} (${tam.nombre})". Límite: ${stockTam} uds`)
      return
    }
  }

  const existe = pedido.value.find(i => i.id === prod.id && i.tamano_id === tam.id && i.comensalIndex === cIdx && !i.notas && !i.es_oferta && !i.es_paquete)
  if (existe) { 
    existe.cantidad++ 
  } else { 
    pedido.value.push({ 
      cartId: Date.now() + Math.random(),
      id: prod.id, 
      nombre: prod.nombre,
      tamano_id: tam.id,
      tamano_nombre: tam.nombre,
      precio: parseFloat(tam.precio || 0), 
      imagen: prod.imagen_url ? getImageUrl(prod.imagen_url) : null, 
      cantidad: 1, 
      stock_maximo: tam.stock,
      notas: '',
      comensalIndex: cIdx,
      minutos_produccion: parseFloat(prod.minutos_produccion || 0)
    }) 
  }

  showTamanoModalKiosko.value = false
  productoTamanoSeleccionarKiosko.value = null
  tamanoSeleccionadoModalKiosko.value = null
}

// --- Carrito ---
const agregarAlPedido = (p) => {
  if (p.agotado) { mostrarError(`"${p.nombre}" agotado`); return }

  if (p.tamanos && p.tamanos.length > 0) {
    abrirModalTamanosKiosko(p)
    return
  }

  if (p.stock !== undefined && p.stock !== null) {
    if (totalEnPedidoPorId(p.id) >= p.stock) {
      mostrarError(`No hay suficiente stock para "${p.nombre}". Límite: ${p.stock} uds`)
      return
    }
  }

  const cIdx = comensalActivoIndex.value
  const existe = pedido.value.find(i => i.id === p.id && i.comensalIndex === cIdx && !i.notas && !i.es_oferta && !i.es_paquete)
  if (existe) { 
    existe.cantidad++ 
  } else { 
    pedido.value.push({ 
      cartId: Date.now() + Math.random(),
      id: p.id, 
      nombre: p.nombre, 
      precio: parseFloat(p.precio), 
      imagen: p.imagen_url ? getImageUrl(p.imagen_url) : null, 
      cantidad: 1, 
      stock_maximo: p.stock,
      notas: '',
      comensalIndex: cIdx,
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

  const cIdx = comensalActivoIndex.value
  const existe = pedido.value.find(i => i.id === oferta.producto_id && i.comensalIndex === cIdx && !i.notas && i.es_oferta)
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
      comensalIndex: cIdx,
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

  const cIdx = comensalActivoIndex.value
  const existe = pedido.value.find(i => i.paquete_id === pkg.id && i.comensalIndex === cIdx && !i.notas)
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
      comensalIndex: cIdx,
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

const handleCheckout = async (checkoutData) => {
  try {
    const isParaLlevar = checkoutData.tipo_entrega === 'para_llevar'
    const mesaValor = isParaLlevar ? null : checkoutData.numero_mesa
    const notaFinal = checkoutData.notas || (isParaLlevar ? 'Para llevar' : (mesaValor ? `Mesa ${mesaValor}` : ''))

    const body = {
      restaurante_id: restauranteSeleccionado.value.id,
      productos: pedido.value.map(i => ({ 
        producto_id: i.es_paquete ? null : (i.es_oferta ? i.id : i.id), 
        tamano_id: i.tamano_id || null,
        tamano_nombre: i.tamano_nombre || null,
        paquete_id: i.es_paquete ? i.paquete_id : null,
        cantidad: i.cantidad,
        notas: i.notas,
        nom_comensal: comensalesNombres.value[i.comensalIndex] || 'General'
      })),
      tipo_orden: 'kiosko',
      metodo_pago: 'efectivo',
      tipo_entrega: isParaLlevar ? 'para_llevar' : 'comer_aqui',
      notas: notaFinal,
      estado: 'ABIERTA',
      mesa: mesaValor,
      usuario_id: empleadoId,
    }
    const data = await apiClient.post('/ordenes', body)
    if (data?.success) { 
      const ordenData = data.data || {}
      const ticketInfo = {
        id: ordenData.id,
        folio: ordenData.folio,
        mesa: ordenData.mesa || mesaValor,
        tipo_entrega: checkoutData.tipo_entrega,
        total: ordenData.total ?? totalPedido.value,
        total_formateado: ordenData.total_formateado,
      }

      // 1. Mostrar ticket de forma destacada en el modal de checkout
      checkoutRef.value?.mostrarExitoTicket(ticketInfo)

      // 2. Limpiar carrito de fondo para el siguiente comensal
      pedido.value = []
      numeroComensales.value = 1
      comensalesNombres.value = ['General']
      comensalActivoIndex.value = 0

      // 4. Recargar productos silenciosamente para actualizar stock disponible
      if (restauranteSeleccionado.value?.id) {
        cargarProductos(restauranteSeleccionado.value.id, true)
      }
    } 
    else { checkoutRef.value?.setError(data?.message || 'Error al enviar pedido') }
  } catch (err) { 
    console.error('Error en checkout kiosko:', err)
    checkoutRef.value?.setError('Error de conexión al enviar el pedido') 
  }
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
</style>