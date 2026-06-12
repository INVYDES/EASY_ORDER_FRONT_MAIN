<template>
  <div class="p-4 sm:p-6 space-y-5 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-slate-900 dark:to-slate-800/80">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px] max-w-sm animate-slide-in',
          toast.type==='success' ? 'bg-emerald-50 dark:bg-emerald-900/80 dark:text-emerald-200 border-l-4 border-emerald-500 text-emerald-800' :
          toast.type==='error'   ? 'bg-red-50 dark:bg-red-900/80 dark:text-red-200 border-l-4 border-red-500 text-red-800'             :
          toast.type==='warning' ? 'bg-amber-50 dark:bg-amber-900/80 dark:text-amber-200 border-l-4 border-amber-500 text-amber-800'       :
          'bg-blue-50 dark:bg-blue-900/80 dark:text-blue-200 border-l-4 border-blue-500 text-blue-800']">
        <span>{{ toast.type==='success' ? '✅' : toast.type==='error' ? '❌' : toast.type==='warning' ? '⚠️' : 'ℹ️' }}</span>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>
    </div>

    <div v-if="loadingCaja" class="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <div class="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-gray-400 dark:text-slate-500 text-sm font-medium">Sincronizando con el sistema...</p>
    </div>

    <div v-else-if="!cajaAbierta" class="flex flex-col items-center justify-center min-h-[70vh] text-center gap-6">
      <div class="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center text-5xl shadow-sm border border-red-200 dark:border-red-700">🔒</div>
      <div>
        <h2 class="text-2xl font-black text-gray-800 dark:text-white">Caja cerrada</h2>
        <p class="text-gray-400 dark:text-slate-500 text-sm mt-2 max-w-xs">No se pueden registrar órdenes mientras la caja esté cerrada.</p>
      </div>
      <button @click="verificarCaja" class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 active:scale-[0.97]">🔄 Verificar estado</button>
    </div>

    <div v-else>
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
        <div class="shrink-0">
          <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mapa de Mesas</h1>
          <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{{ fechaHoy }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="vistaActual = vistaActual === 'admin' ? 'mapa' : 'admin'"
            class="px-4 py-3 text-sm font-bold rounded-2xl transition-all shadow-sm active:scale-95"
            :class="vistaActual === 'admin' ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md'">
            <span class="flex items-center gap-2">📋 {{ vistaActual === 'admin' ? 'Ver mapa' : 'Admin' }}</span>
          </button>
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-300"></span>
            <span class="text-[10px] font-black uppercase tracking-wider">Caja abierta</span>
          </div>
        </div>
      </div>

      <div v-if="vistaActual === 'mapa' || vistaActual === 'admin'">
        <div v-if="vistaActual === 'mapa'" class="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm p-5 sm:p-6">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><span class="text-2xl">🗺️</span> Mesas del restaurante</h2>
              <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5 ml-9">Toca una mesa libre para comenzar un pedido</p>
            </div>
            <div class="flex items-center gap-4 text-xs">
              <span class="flex items-center gap-1.5 font-medium text-gray-500 dark:text-slate-400"><span class="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-300 border border-emerald-400 shadow-sm"></span> Libre</span>
              <span class="flex items-center gap-1.5 font-medium text-gray-500 dark:text-slate-400"><span class="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 border border-amber-400 shadow-sm"></span> Ocupada</span>
            </div>
          </div>
          <div class="rounded-xl bg-slate-50/50 dark:bg-slate-700/50 p-3">
            <TableMap :model-value="mesaSeleccionada" :ordenes="ordenes" :total-mesas="totalMesasRestaurante" @update:model-value="onMesaClick" />
          </div>
        </div>

        <div v-if="vistaActual === 'admin'" class="mt-6">
          <div class="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
            <button v-for="tab in tabs" :key="tab.key" @click="tabActivo = tab.key"
              :class="['flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all border shrink-0',
                tabActivo === tab.key ? 'text-white border-transparent shadow-lg scale-[1.02]' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm']"
              :style="tabActivo === tab.key ? { background: `linear-gradient(135deg, ${tab.color}, ${tab.color}dd)`, boxShadow: `0 4px 12px ${tab.color}44` } : {}">
              <span class="text-lg">{{ tab.icon }}</span>
              <span>{{ tab.label.toUpperCase() }}</span>
              <span class="px-1.5 py-0.5 rounded-lg text-[10px] font-bold"
                :class="tabActivo === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'">
                {{ contarOrdenes(tab.key) }}
              </span>
            </button>
          </div>
          <div v-if="tabActivo === 'cobrar'" class="animate-fade-in">
            <div class="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm p-6 min-h-[400px]">
              <CajaTicketGrid type="open" :orders="ordenesParaCobrar" @order-paid="handleOrderPaid" @refresh-orders="loadOrdersForCashier" />
            </div>
          </div>
          <div v-else class="animate-fade-in">
            <div v-if="loading" class="flex items-center justify-center py-20 gap-3">
              <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p class="text-gray-400 text-sm font-medium">Cargando órdenes...</p>
            </div>
            <div v-else-if="ordenesFiltradas.length === 0" class="text-center py-20 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
              <span class="text-6xl block mb-4">📋</span>
              <p class="text-gray-500 dark:text-slate-300 font-bold text-lg">Sin órdenes</p>
              <p class="text-gray-400 dark:text-slate-500 text-xs mt-1">No hay órdenes en esta categoría</p>
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <div v-for="orden in ordenesFiltradas" :key="orden.id" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div class="px-4 py-3.5 flex items-center justify-between border-b border-slate-50 dark:border-slate-700" :class="bgEstado(orden.estado)">
                  <div class="flex items-center gap-2.5">
                    <span class="text-xl">{{ iconEstado(orden.estado) }}</span>
                    <div>
                      <p class="text-sm font-bold text-gray-800 dark:text-white">{{ orden.folio || 'Orden #'+orden.id }}</p>
                      <p class="text-[10px] text-gray-400 dark:text-slate-500 font-medium">{{ formatHora(orden.created_at) }}</p>
                    </div>
                  </div>
                  <span class="text-[10px] font-bold px-3 py-1.5 rounded-full border" :class="badgeEstado(orden.estado)">{{ labelEstado(orden.estado) }}</span>
                </div>
                <div class="px-4 py-3.5 flex-1 space-y-2.5">
                  <div class="flex items-center gap-2.5 text-sm text-gray-600 dark:text-slate-300">
                    <span class="text-lg">👤</span>
                    <span class="font-semibold">{{ getNombreMostrable(orden) }}</span>
                  </div>
                  <div v-if="orden.mesa" class="flex items-center gap-2.5 text-sm text-gray-500 dark:text-slate-400">
                    <span class="text-lg">🪑</span>
                    <span class="font-semibold">Mesa {{ orden.mesa }}</span>
                  </div>
                  <div v-if="orden.estado !== 'CERRADA' && orden.estado !== 'CANCELADA' && orden.estado !== 'PAGADA'" class="flex flex-wrap gap-2 pt-2">
                    <button v-if="tieneListos(orden) && orden.detalles?.some(d => !d.recogido_en)" @click="recogerDeCocina(orden)" :disabled="cambiando === `recoger-${orden.id}`"
                      class="flex-1 min-w-[120px] px-3 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5">
                      <span v-if="cambiando === `recoger-${orden.id}`" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span v-else>🍳 Recoger</span>
                    </button>
                    <button v-if="tieneRecogidosSinEntregar(orden)" @click="entregarACliente(orden)" :disabled="cambiando === `entregar-${orden.id}`"
                      class="flex-1 min-w-[120px] px-3 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5">
                      <span v-if="cambiando === `entregar-${orden.id}`" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span v-else>🤝 Entregar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="vistaActual === 'productos'">
        <div v-if="ordenAbiertaMesa" class="mb-4 px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200 dark:border-amber-700 rounded-2xl flex items-center gap-3 shadow-sm">
          <span class="text-xl">📋</span>
          <span class="text-xs font-bold text-amber-800 dark:text-amber-300 flex-1">Mesa tiene pedido activo — los productos se agregarán al ticket existente</span>
        </div>

        <div class="flex items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <button @click="vistaActual = 'mapa'; carritoSimple = []" class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 hover:shadow-md transition-all font-bold text-lg">←</button>
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">Mesa {{ nuevaOrden.mesa }} <span v-if="ordenAbiertaMesa" class="text-base">📋</span></h2>
              <p class="text-xs text-gray-400 dark:text-slate-500">{{ ordenAbiertaMesa ? 'Agregando productos al pedido actual' : 'Toca los productos para agregarlos' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-bold shadow-sm border border-indigo-200 dark:border-indigo-700">{{ carritoSimple.length }} producto(s)</span>
            <button v-if="carritoSimple.length > 0" @click="vistaActual = 'resumen'" class="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 active:scale-[0.97] flex items-center gap-1.5">
              Revisar y enviar <span class="text-lg">→</span>
            </button>
          </div>
        </div>

        <div class="flex gap-2 mb-4 overflow-x-auto pb-1 custom-scrollbar">
          <button v-for="cat in categoriasProducto" :key="cat.key"
            @click="subTabActiva = cat.key"
            class="shrink-0 px-5 py-3 rounded-xl text-sm font-bold transition-all border-2"
            :class="subTabActiva === cat.key ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 scale-[1.02]' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md'">
            <span class="text-lg mr-1.5">{{ cat.icon }}</span> {{ cat.label }}
          </button>
        </div>

        <div v-if="loadingProductos" class="flex items-center justify-center py-20">
          <div class="flex flex-col items-center gap-3">
            <div class="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-gray-400 dark:text-slate-500 text-sm font-medium">Cargando productos...</p>
          </div>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <button v-for="p in productosFiltrados" :key="'p-'+p.id"
            @click="agregarSimple(p)"
            class="group bg-white dark:bg-slate-800 rounded-[1.25rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 active:scale-[0.97] relative">
            <div class="w-full h-28 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-700/50 flex items-center justify-center overflow-hidden">
              <img v-if="p.imagen_url" :src="resolveImageUrl(p.imagen_url)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span v-else class="text-4xl opacity-60 dark:opacity-30">🍽️</span>
            </div>
            <div class="p-3">
              <p class="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">{{ p.nombre }}</p>
              <p class="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-1.5">${{ Number(p.precio).toFixed(2) }}</p>
            </div>
            <div class="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-indigo-300">+</div>
          </button>
        </div>
      </div>

      <div v-if="vistaActual === 'resumen'" class="max-w-lg mx-auto">
        <div class="flex items-center gap-3 mb-6">
          <button @click="vistaActual = 'productos'" class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 hover:shadow-md transition-all font-bold text-lg">←</button>
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Mesa {{ nuevaOrden.mesa }} <span v-if="ordenAbiertaMesa" class="text-sm font-normal text-amber-600 dark:text-amber-400">· Agregando</span></h2>
            <p class="text-xs text-gray-400 dark:text-slate-500">Revisa los productos antes de enviar</p>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm p-5 space-y-1">
          <div v-for="item in carritoSimple" :key="item.id + (item.notas || '')" class="py-3 border-b border-slate-50 dark:border-slate-700 last:border-0">
            <div class="flex items-center justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-gray-800 dark:text-slate-200 truncate">{{ item.nombre }}</p>
                <p class="text-xs text-gray-400 dark:text-slate-500">${{ Number(item.precio).toFixed(2) }} c/u</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <div class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 rounded-lg p-1 border border-slate-100 dark:border-slate-600">
                  <button @click="item.cantidad > 1 && item.cantidad--" class="w-7 h-7 rounded-md bg-white dark:bg-slate-600 text-gray-500 dark:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center text-sm font-bold shadow-sm border border-slate-100 dark:border-slate-500 transition-colors">−</button>
                  <span class="w-7 text-center text-sm font-black text-gray-800 dark:text-white">{{ item.cantidad }}</span>
                  <button @click="item.cantidad++" class="w-7 h-7 rounded-md bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center justify-center text-sm font-bold shadow-sm border border-slate-100 dark:border-slate-500 transition-colors">+</button>
                </div>
                <span class="text-sm font-black text-indigo-600 dark:text-indigo-400 w-16 text-right">${{ Number(item.precio * item.cantidad).toFixed(2) }}</span>
                <button @click="carritoSimple = carritoSimple.filter(i => i !== item)" class="w-7 h-7 rounded-lg text-slate-300 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center text-sm transition-colors">✕</button>
              </div>
            </div>
            <div class="mt-2 ml-1 flex items-center gap-2">
              <span class="text-slate-300 dark:text-slate-600 text-xs">📝</span>
              <input v-model="item.notas" placeholder="Comentario (ej. sin cebolla, término medio...)"
                class="flex-1 text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-indigo-200/50 dark:focus:ring-indigo-500/50 focus:border-indigo-300 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500 text-gray-800 dark:text-slate-200" />
            </div>
          </div>
          <div v-if="carritoSimple.length === 0" class="text-center py-10 text-gray-400 dark:text-slate-500 text-sm">
            <span class="text-4xl block mb-2">🛒</span>
            Carrito vacío
          </div>
        </div>

        <div class="flex justify-between items-center mt-5 px-1">
          <span class="text-sm text-gray-500 dark:text-slate-400 font-medium">Total</span>
          <span class="text-xl font-black text-indigo-600 dark:text-indigo-400">${{ Number(totalSimple).toFixed(2) }}</span>
        </div>

        <button @click="enviarOrdenSimple" :disabled="creando || carritoSimple.length === 0"
          class="w-full mt-5 py-4 text-white text-sm font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
          :class="creando || carritoSimple.length === 0 ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-200 dark:shadow-green-900/50'">
          <span v-if="creando" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ creando ? 'ENVIANDO...' : '🚀 ENVIAR A COCINA' }}
        </button>
      </div>

      <div v-if="showTicketModal && ticketActivo" class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4" @click.self="showTicketModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto animate-pop">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/40 flex items-center justify-center text-2xl border border-amber-200 dark:border-amber-700">🧾</div>
              <div>
                <h3 class="font-bold text-gray-900 dark:text-white text-lg">Mesa {{ ticketActivo.mesa }}</h3>
                <p class="text-xs text-gray-400 dark:text-slate-500 font-medium">{{ ticketActivo.folio }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold px-3 py-1.5 rounded-full border shadow-sm" :class="badgeEstado(ticketActivo.estado)">{{ labelEstado(ticketActivo.estado) }}</span>
              <button @click="showTicketModal = false" class="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center text-lg transition-colors">✕</button>
            </div>
          </div>

          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
            <div v-for="d in ticketActivo.detalles" :key="d.id" class="text-sm py-2 border-b border-slate-100 dark:border-slate-600 last:border-0">
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-700 dark:text-slate-300">{{ d.cantidad }}× {{ d.producto_nombre || d.nombre || 'Producto' }}</span>
                <span class="font-bold text-gray-900 dark:text-white">${{ Number(d.subtotal || 0).toFixed(2) }}</span>
              </div>
              <p v-if="d.notas" class="text-[11px] text-gray-400 dark:text-slate-500 italic mt-0.5 ml-1 flex items-center gap-1">
                <span>📝</span> {{ d.notas }}
              </p>
            </div>
            <div v-if="!ticketActivo.detalles?.length" class="text-center py-6 text-gray-400 dark:text-slate-500 text-sm">
              Sin productos en esta orden
            </div>
          </div>

          <div class="flex justify-between items-center mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
            <span class="font-bold text-gray-700 dark:text-slate-300">Total</span>
            <span class="text-xl font-black text-indigo-600 dark:text-indigo-400">${{ Number(ticketActivo.total || 0).toFixed(2) }}</span>
          </div>

          <button @click="showTicketModal = false; nuevaOrden.mesa = ticketActivo.mesa; carritoSimple = []; vistaActual = 'productos'"
            class="w-full mt-5 py-3.5 text-sm font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 active:scale-[0.98] flex items-center justify-center gap-2">
            ➕ Agregar productos a esta mesa
          </button>
        </div>
      </div>
    </div>
  </div>
</template><script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { API_URL, STORAGE_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'
import CajaTicketGrid from '../components/caja/cajatiketgrid.vue'
import Marquesitawidget from '../components/Marquesitawidget.vue'
import { useRestauranteChannel } from '../composables/useRestauranteChannel'
import TableMap from '@/components/mesero/TableMap.vue'

const vistaActual  = ref('mapa')
const tabActivo    = ref('todas')
const subTabActiva = ref('alimentos')
const ordenes      = ref([])
const productos    = ref([])
const paquetes     = ref([])
const clientes     = ref([])
const carrito      = ref([])
const busqueda     = ref('')
const marquesinaVariant = ref(localStorage.getItem('marquesina_variant') || 'dark')

const loading         = ref(true)
const loadingCaja     = ref(true)
const loadingProductos = ref(true)
const creando         = ref(false)
const cambiando       = ref(null)
const toasts          = ref([])
const cajaAbierta     = ref(false)
const nuevaOrden      = ref({ clienteId: null, mesa: null })
const carritoSimple   = ref([])
const mesaSeleccionada = ref(null)

const onMesaClick = (numMesa) => {
  mesaSeleccionada.value = numMesa
  if (!numMesa) return
  const ocupada = ordenes.value.some(o => Number(o.mesa) === Number(numMesa) && !['CERRADA','CANCELADA','PAGADA'].includes(o.estado))
  if (ocupada) {
    mostrarTicketMesa(numMesa)
  } else {
    nuevaOrden.value.mesa = numMesa
    carritoSimple.value = []
    vistaActual.value = 'productos'
  }
}

const mostrarTicketMesa = (numMesa) => {
  const orden = ordenes.value.find(o => Number(o.mesa) === Number(numMesa) && !['CERRADA','CANCELADA','PAGADA'].includes(o.estado))
  if (orden) {
    ticketActivo.value = orden
    showTicketModal.value = true
  }
}

const showTicketModal = ref(false)
const ticketActivo = ref(null)

const categoriasProducto = [
  { key:'alimentos', icon:'🍽️', label:'Comida' },
  { key:'bebidas',   icon:'🥤', label:'Bebidas' },
  { key:'postres',   icon:'🍰', label:'Postres' },
  { key:'paquetes',  icon:'🎁', label:'Paquetes' },
]

const productosFiltrados = computed(() => {
  if (subTabActiva.value === 'paquetes') return paquetes.value
  let items = productos.value.filter(p => {
    const cat = (p.categoria?.nombre || '').toLowerCase()
    if (subTabActiva.value === 'alimentos') return !cat.includes('barra') && !cat.includes('bebida') && !cat.includes('postre')
    if (subTabActiva.value === 'bebidas')   return cat.includes('barra') || cat.includes('bebida')
    if (subTabActiva.value === 'postres')   return cat.includes('postre')
    return true
  })
  if (busqueda.value) {
    const t = busqueda.value.toLowerCase()
    items = items.filter(p => p.nombre?.toLowerCase().includes(t))
  }
  return items
})

const totalSimple = computed(() => carritoSimple.value.reduce((s, i) => s + Number(i.precio) * i.cantidad, 0))

const agregarSimple = (p) => {
  const exist = carritoSimple.value.find(i => i.id === p.id)
  if (exist) { exist.cantidad++ }
  else { carritoSimple.value.push({ id: p.id, nombre: p.nombre, precio: Number(p.precio), cantidad: 1, tipo: 'producto', notas: '' }) }
}

const enviarOrdenSimple = async () => {
  if (!nuevaOrden.value.mesa || carritoSimple.value.length === 0) return
  if (!cajaAbierta.value) { showToast('La caja está cerrada', 'error'); return }
  creando.value = true
  try {
    const ordenExistente = ordenes.value.find(o =>
      Number(o.mesa) === Number(nuevaOrden.value.mesa) &&
      !['CERRADA', 'CANCELADA', 'PAGADA'].includes(o.estado)
    )
    const url = ordenExistente ? `${API_URL}/ordenes/${ordenExistente.id}/productos` : `${API_URL}/ordenes`
    const method = ordenExistente ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') ?? sessionStorage.getItem('token')}`
      },
      body: JSON.stringify({
        mesa: nuevaOrden.value.mesa,
        productos: carritoSimple.value.map(i => ({ producto_id: i.id, cantidad: i.cantidad, notas: i.notas || '' }))
      })
    })
    const data = await res.json()
    if (res.ok && data.success) {
      carritoSimple.value = []
      vistaActual.value = 'mapa'
      showToast(ordenExistente ? '➕ Productos agregados al pedido' : '🚀 ¡Pedido enviado a cocina!', 'success')
      cargarOrdenes(true)
    } else {
      showToast(data.message || 'Error al crear orden', 'error')
    }
  } catch {
    showToast('Error de conexión', 'error')
  } finally {
    creando.value = false
  }
}
const mesasAsignadas  = ref([])
const restauranteActivo = ref(localStorage.getItem('restaurante_id_activo'))
const totalMesasRestaurante = ref(24)
const ultimaActualizacion = ref(null)

const POLL_INTERVAL = 15000 // Fluidez total (15s) + WS


const cancelacionModal = ref({ visible: false, detalleId: null, ordenId: null, motivo: '', cantidadMaxima: 1, cantidadCancelar: 1 })

// ── NUEVO: estado para orden existente de la mesa ──────────────────────────
const ordenExistente = ref(null)   // se muestra el modal de confirmación

// ── ESTADO DE COMENSALES ───────────────────────────────────────────────────
const numeroComensales    = ref(1)
const comensalesNombres   = ref(['Comensal 1'])
const comensalActivoIndex = ref(0)
const showCarritoFlotante = ref(false)

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
    carrito.value.forEach(item => {
      if (item.comensalIndex >= numVal) item.comensalIndex = 0
    })
  }
  if (comensalActivoIndex.value >= numVal) {
    comensalActivoIndex.value = numVal - 1
  }
})

const getItemsForComensal = (cIdx) => carrito.value.filter(i => i.comensalIndex === cIdx)

const tiempoPorComensal = (cIdx) => {
  return getItemsForComensal(cIdx).reduce((total, i) => total + ((i.minutos_produccion || 0) * i.cantidad), 0)
}

const calcularTiempoSubOrdenComensal = (detalles) => {
  return detalles.reduce((total, d) => {
    return total + ((d.minutos_produccion || 0) * d.cantidad)
  }, 0)
}

const userRaw    = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'
const userActual = JSON.parse(userRaw)
const esMesero   = computed(() => {
  const roles = userActual.roles || []
  return roles.some(r => {
    if (typeof r === 'string') return r.toUpperCase() === 'MESERO'
    return r.id === 3 || r.id === '3' || r.nombre?.toUpperCase() === 'MESERO'
  })
})

const esAdminOPropietario = computed(() => {
  const roles = userActual.roles || []
  return roles.some(r => {
    const name = (typeof r === 'string' ? r : (r.nombre || r.name || '')).toUpperCase()
    return name.includes('PROPIETARIO') || 
           name.includes('ADMIN') || 
           name.includes('ADMINISTRADOR') ||
           name.includes('DUEÑO')
  })
})

const BEBIDA_KEYWORDS = ['coca','pepsi','fanta','sprite','jugo','refresco','bebida','cerveza','agua','trago','coctel','limonada','naranjada']


let pollTimer = null
let pollingEnProgreso = false
let recordatorioTimer = null

const tabs = [
  { key: 'todas',          label: 'Todas',          icon: '📋', color: '#6366f1' },
  { key: 'ABIERTA',        label: 'Nuevas',          icon: '📝', color: '#fcd34d' },
  { key: 'POR_PREPARAR',   label: 'Por preparar',    icon: '🟡', color: '#f59e0b' },
  { key: 'EN_PREPARACION', label: 'En preparación',  icon: '🔥', color: '#f97316' },
  { key: 'LISTA',          label: 'Listas',          icon: '✅', color: '#10b981' },
  { key: 'ENTREGADA',      label: 'Entregadas',      icon: '🏁', color: '#8b5cf6' },
  { key: 'cobrar',         label: 'Cobrar',          icon: '💵', color: '#10b981' },
]

// ── Computed: detectar si la mesa seleccionada ya tiene orden abierta ──────
const ordenAbiertaMesa = computed(() => {
  if (!nuevaOrden.value.mesa) return null
  return ordenes.value.find(o =>
    Number(o.mesa) === Number(nuevaOrden.value.mesa) &&
    !['CERRADA', 'CANCELADA', 'PAGADA'].includes(o.estado)
  ) || null
})

const mesaTieneOrdenAbierta = computed(() => !!ordenAbiertaMesa.value)

// Qué mesas de la lista ya tienen orden abierta
const mesaConOrden = (m) => ordenes.value.some(o =>
  Number(o.mesa) === Number(m) && !['CERRADA','CANCELADA','PAGADA'].includes(o.estado)
)

const esBebida = (d) => {
  if (!d) return false
  const prodRaw = d.producto
  const cat = (prodRaw?.categoria?.nombre || d.categoria || '').toLowerCase()
  return cat.includes('barra') || cat.includes('bebida')
}
const esPostre = (d) => {
  if (!d) return false
  const prodRaw = d.producto
  const cat = (prodRaw?.categoria?.nombre || d.categoria || '').toLowerCase()
  return cat.includes('postre') || cat.includes('reposteria') || cat.includes('pastel')
}
const esCocina = (d) => {
  return !esBebida(d) && !esPostre(d)
}

// Tiempos estimados acumulados en preparación por estación para el mesero
const tiempoCocinaActual = computed(() => {
  let total = 0
  ordenes.value.forEach(o => {
    if (['CERRADA', 'CANCELADA', 'PAGADA'].includes(o.estado)) return
    (o.detalles || []).forEach(d => {
      if (d.cancelado) return
      const estado = d.estado_preparacion || d.estado
      if (estado === 'PENDIENTE' || estado === 'EN_PREPARACION') {
        if (esCocina(d)) {
          total += (Number(d.cantidad) || 0) * (Number(d.minutos_produccion) || 0)
        }
      }
    })
  })
  return Math.round(total)
})

const tiempoBarraActual = computed(() => {
  let total = 0
  ordenes.value.forEach(o => {
    if (['CERRADA', 'CANCELADA', 'PAGADA'].includes(o.estado)) return
    (o.detalles || []).forEach(d => {
      if (d.cancelado) return
      const estado = d.estado_preparacion || d.estado
      if (estado === 'PENDIENTE' || estado === 'EN_PREPARACION') {
        if (esBebida(d)) {
          total += (Number(d.cantidad) || 0) * (Number(d.minutos_produccion) || 0)
        }
      }
    })
  })
  return Math.round(total)
})

const tiempoPostresActual = computed(() => {
  let total = 0
  ordenes.value.forEach(o => {
    if (['CERRADA', 'CANCELADA', 'PAGADA'].includes(o.estado)) return
    (o.detalles || []).forEach(d => {
      if (d.cancelado) return
      const estado = d.estado_preparacion || d.estado
      if (estado === 'PENDIENTE' || estado === 'EN_PREPARACION') {
        if (esPostre(d) && !esBebida(d)) {
          total += (Number(d.cantidad) || 0) * (Number(d.minutos_produccion) || 0)
        }
      }
    })
  })
  return Math.round(total)
})
// Formatea minutos: si < 60 muestra 'X min', si >= 60 muestra 'X hrs' o 'X:30 hrs'
const formatTiempo = (min) => {
  if (!min || min <= 0) return '0 min'
  if (min < 60) return `${min} min`
  const horas = Math.floor(min / 60)
  const resto = min % 60
  if (resto === 0) return `${horas} hrs`
  const minStr = String(resto).padStart(2, '0')
  return `${horas}:${minStr} hrs`
}

const epToEstacion = (ep) => ({
  'PENDIENTE':      'POR_PREPARAR',
  'EN_PREPARACION': 'EN_PREPARACION',
  'LISTO':          'LISTA',
  'ENTREGADO':      'ENTREGADA'
})[ep] || 'POR_PREPARAR'

const subOrdenes = computed(() => {
  const list = []
  ordenes.value.forEach(o => {
    if (['CERRADA', 'PAGADA', 'CANCELADA'].includes(o.estado)) return

    const todos   = o.detalles || []
    // Separar por estación (excluyendo cancelados para clasificación)
    const estaciones = [
      { nombre: 'COCINA',  detalles: todos.filter(d => !esBebida(d) && !esPostre(d)) },
      { nombre: 'BARRA',   detalles: todos.filter(d => esBebida(d)) },
      { nombre: 'POSTRES', detalles: todos.filter(d => esPostre(d) && !esBebida(d)) },
    ]

    estaciones.forEach(({ nombre, detalles }) => {
      if (!detalles.length) return

      // Agrupar los detalles NO cancelados por su estado de preparación
      const grupos = {}
      detalles.forEach(d => {
        if (d.cancelado) return
        const ep = d.estado_preparacion || d.estado || 'PENDIENTE'
        if (ep === 'ABIERTA') return // productos sin enviar, los maneja la pestaña NUEVAS
        if (!grupos[ep]) grupos[ep] = []
        grupos[ep].push(d)
      })

      // Generar una tarjeta independiente por cada estado encontrado
      Object.entries(grupos).forEach(([ep, items]) => {
        list.push({
          ...o,
          uid: `${o.id}-${nombre}-${ep}`,
          detalles_estacion: items,
          estado_estacion: epToEstacion(ep),
          _estacion: nombre,
          _ep: ep
        })
      })
    })
  })
  return list
})

const subOrdenesFiltradas = computed(() => {
  if (tabActivo.value === 'cobrar') return []

  if (tabActivo.value === 'ABIERTA') {
    return ordenes.value
      .filter(o => o.estado === 'ABIERTA' || (o.detalles || []).some(d => !d.cancelado && d.estado_preparacion === 'ABIERTA'))
      .map(o => {
        const detallesAbiertos = (o.detalles || []).filter(d => !d.cancelado && d.estado_preparacion === 'ABIERTA')
        return {
          ...o,
          uid: `${o.id}-ABIERTA-APPEND`,
          estado_estacion: 'ABIERTA',
          detalles_estacion: detallesAbiertos
        }
      })
      .filter(o => o.detalles_estacion.length > 0)
  }

  if (tabActivo.value === 'todas') {
    return ordenes.value.map(o => ({
      ...o,
      uid: `${o.id}-JOINT`,
      estado_estacion: o.estado,
      detalles_estacion: o.detalles || []
    }))
  }

  // Para POR_PREPARAR, EN_PREPARACION, LISTA y ENTREGADA:
  // Cada tarjeta ya contiene solo productos del mismo estado, filtrar directamente.
  return subOrdenes.value.filter(s => s.estado_estacion === tabActivo.value)
})

const ordenesParaCobrar = computed(() =>
  ordenes.value.filter(o => 
    o.estado === 'ENTREGADA' ||
    (!['CERRADA', 'CANCELADA', 'PAGADA'].includes(o.estado) && 
      (o.detalles || []).some(d => d.estado_preparacion === 'ENTREGADO' || d.estado === 'ENTREGADO'))
  )
)

const ordenesFiltradas = computed(() => {
  if (tabActivo.value === 'todas' || tabActivo.value === 'cobrar') return ordenes.value
  return ordenes.value.filter(o => o.estado === tabActivo.value)
})

const contarOrdenes = (key) => {
  if (key === 'cobrar')   return ordenesParaCobrar.value.length
  if (key === 'todas')    return ordenes.value.length
  if (key === 'ABIERTA') {
    return ordenes.value.filter(o => 
      o.estado === 'ABIERTA' || (o.detalles || []).some(d => !d.cancelado && d.estado_preparacion === 'ABIERTA')
    ).length
  }
  return subOrdenes.value.filter(s => s.estado_estacion === key).length
}

const tabActual      = computed(() => tabs.find(t => t.key === tabActivo.value))
const totalCarrito   = computed(() => carrito.value.reduce((s, i) => s + (i.precio * i.cantidad), 0))
const fechaHoy       = computed(() => new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
const paginaProductos = ref(1)
const itemsPorPagina = 6

watch([busqueda, subTabActiva], () => {
  paginaProductos.value = 1
})

const esBebidaProducto = (p) => {
  const cat = (p.categoria?.nombre || '').toLowerCase()
  return cat.includes('barra') || cat.includes('bebida')
}
const esPostreProducto = (p) => {
  const cat = (p.categoria?.nombre || '').toLowerCase()
  return cat.includes('postre') || cat.includes('reposteria') || cat.includes('pastel')
}
const esCocinaProducto = (p) => {
  return !esBebidaProducto(p) && !esPostreProducto(p)
}

const productosFiltradosBase = computed(() => {
  const b = busqueda.value?.toLowerCase() || ''
  let list = productos.value
  
  if (subTabActiva.value === 'alimentos') {
    list = list.filter(esCocinaProducto)
  } else if (subTabActiva.value === 'bebidas') {
    list = list.filter(esBebidaProducto)
  } else if (subTabActiva.value === 'postres') {
    list = list.filter(esPostreProducto)
  }
  
  return b ? list.filter(p => p.nombre.toLowerCase().includes(b)) : list
})

const totalPaginasProductos = computed(() => {
  return Math.ceil(productosFiltradosBase.value.length / itemsPorPagina)
})
const paquetesFiltrados = computed(() => {
  const b = busqueda.value?.toLowerCase() || ''
  return b ? paquetes.value.filter(p => p.nombre.toLowerCase().includes(b)) : paquetes.value
})

const tieneProductoNuevoHoy = computed(() => {
  const hoy = new Date().toLocaleDateString('en-CA')
  return productos.value.some(p => {
    if (!p.created_at) return false
    return p.created_at.substring(0, 10) === hoy
  })
})

const tienePaqueteNuevoHoy = computed(() => {
  const hoy = new Date().toLocaleDateString('en-CA')
  return paquetes.value.some(p => {
    if (!p.created_at) return false
    return p.created_at.substring(0, 10) === hoy
  })
})

// ── Estilos ────────────────────────────────────────────────────────────────
const bgEstado    = (e) => ['POR_PREPARAR','EN_PREPARACION','LISTA'].includes(e) ? 'bg-slate-50 dark:bg-slate-800' : ({ ABIERTA:'bg-yellow-50 dark:bg-yellow-950', ENTREGADA:'bg-purple-50 dark:bg-purple-950', CERRADA:'bg-slate-50 dark:bg-slate-800', CANCELADA:'bg-red-50 dark:bg-red-950' }[e] || 'bg-slate-50 dark:bg-slate-800')
const borderColor = (e) => ['POR_PREPARAR','EN_PREPARACION','LISTA'].includes(e) ? 'border-slate-100 dark:border-slate-700' : ({ ABIERTA:'border-yellow-200 dark:border-yellow-800', ENTREGADA:'border-purple-200 dark:border-purple-800', CERRADA:'border-slate-200 dark:border-slate-600', CANCELADA:'border-red-200 dark:border-red-800' }[e] || 'border-slate-100 dark:border-slate-700')
const badgeEstado = (e) => ['POR_PREPARAR','EN_PREPARACION','LISTA'].includes(e) ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600' : ({ ABIERTA:'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800', ENTREGADA:'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800', CERRADA:'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-500', CANCELADA:'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' }[e] || 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400')
const iconEstado  = (e) => ['POR_PREPARAR','EN_PREPARACION','LISTA'].includes(e) ? '🕒' : ({ ABIERTA:'📝', ENTREGADA:'🏁', CERRADA:'🔒', CANCELADA:'🚫' }[e] || '📋')
const labelEstado = (e) => ({ ABIERTA:'Abierta', POR_PREPARAR:'Esperando', EN_PREPARACION:'En Preparación', LISTA:'Lista', ENTREGADA:'Entregada', CERRADA:'Cobrada', CANCELADA:'Cancelada' }[e] || e)
const siguienteEstado = (e) => ({ ABIERTA:'POR_PREPARAR', LISTA:'ENTREGADA' }[e] || null)
const accionEstado    = (e) => ({ ABIERTA:'▶ Enviar Pedido', LISTA:'🤝 Entregada' }[e] || '')
const btnEstado       = (e) => ({ ABIERTA:'bg-amber-500 hover:bg-amber-600 text-white', LISTA:'bg-emerald-500 hover:bg-emerald-600 text-white' }[e] || 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400')

// ── API ────────────────────────────────────────────────────────────────────

const cargarOrdenes = async (silent = true) => {
  if (!silent) loading.value = true
  try {
    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const base = esAdminOPropietario.value ? '/ordenes' : '/meseros/mis-ordenes'
    const states = ['ABIERTA','POR_PREPARAR','EN_PREPARACION','LISTA','ENTREGADA']
    const urls   = states.map(s => `${base}?estado=${s}&per_page=100`)
    urls.push(`${base}?fecha_desde=${today}&fecha_hasta=${today}&per_page=100`)
    const results = await Promise.all(urls.map(url => apiClient.get(url)))
    const map = new Map()
    results.forEach(res => { 
      if (res.success || res.data) {
        const items = Array.isArray(res.data) ? res.data : (res.data?.data || [])
        items.forEach(o => map.set(o.id, o))
      }
    })
    ordenes.value = [...map.values()].sort((a, b) => b.id - a.id)
  } catch (err) { console.error('Error órdenes:', err) }
  finally { if (!silent) loading.value = false }
}

// ── WebSockets ────────────────────────────────────────────────────────────────
const onOrdenWS = async (evento) => {
  const { accion, orden } = evento
  console.log('📡 WS Waiter:', accion, orden.id)
  ultimaActualizacion.value = new Date().toLocaleTimeString()

  if (accion === 'creada' || accion === 'actualizada' || accion === 'estado_cambiado') {
    const idx = ordenes.value.findIndex(o => o.id === orden.id)
    if (idx !== -1) {
      ordenes.value[idx] = { ...ordenes.value[idx], ...orden }
    } else {
      ordenes.value.unshift(orden)
      showToast(`Nueva orden #${orden.id} creada`, 'info')
    }
    
    // Si un producto se puso LISTO, avisar al mesero
    const tieneListos = (orden.detalles || []).some(d => d.estado_preparacion === 'LISTO')
    if (tieneListos && orden.estado !== 'ENTREGADA') {
      showToast(`¡Orden #${orden.folio || orden.id} tiene productos listos! 🍽️`, 'success', 6000)
    }
  } else if (accion === 'cerrada' || accion === 'eliminada') {
    ordenes.value = ordenes.value.filter(o => o.id !== orden.id)
  }
}

const { conectado: wsConectado } = useRestauranteChannel(restauranteActivo, {
  onOrden: onOrdenWS
})

const cargarMisMesas = async () => {
  if (!esMesero.value) return
  try {
    const res = await apiClient.get('/meseros/mis-mesas')
    if (res.success && res.data) {
      mesasAsignadas.value = res.data.mis_mesas || []
    }
  } catch (err) {
    console.error('Error cargando mis mesas:', err)
  }
}

const cargarCapacidadRestaurante = async () => {
  try {
    const res = await apiClient.get('/meseros')
    if (res.success && res.data) {
      totalMesasRestaurante.value = Number(res.data.total_mesas || 0)
    }
  } catch (err) {
    console.error('Error cargando capacidad:', err)
  }
}

const cargarProductos = async () => {
  loadingProductos.value = true
  try {
    const [pData, paqData] = await Promise.all([
      apiClient.get('/productos?per_page=500'),
      apiClient.get('/paquetes'),
    ])
    if (pData.success || pData.data) productos.value = pData.data || pData
    if (paqData.success || paqData.data) paquetes.value  = paqData.data || paqData
  } catch {}
  finally { loadingProductos.value = false }
}

const verificarCaja = async () => {
  loadingCaja.value = true
  try {
    const d = await apiClient.get('/caja/estado')
    if (d.success || d.data) cajaAbierta.value = !!(d.data?.is_open || d.is_open)
  } catch {}
  finally { loadingCaja.value = false }
}

const cargarClientes = async () => {
  try {
    const d = await apiClient.get('/clientes/select-list')
    if (d.success || d.data) clientes.value = d.data || d
  } catch {}
}

// ── Crear / Agregar orden ──────────────────────────────────────────────────
const buildPayload = () => ({
  cliente_id: nuevaOrden.value.clienteId,
  mesa:       nuevaOrden.value.mesa,
  productos:  carrito.value.map(i => {
    const item = { 
      cantidad: i.cantidad, 
      notas: i.notas, 
      nom_comensal: comensalesNombres.value[i.comensalIndex] || 'General' 
    }
    if (i.tipo === 'producto') item.producto_id = i.id
    if (i.tipo === 'paquete')  item.paquete_id  = i.id
    return item
  }),
})

const crearOrden = async () => {
  if (!carrito.value.length || !nuevaOrden.value.mesa) return

  // Si la mesa ya tiene orden abierta, mostrar modal de confirmación
  if (mesaTieneOrdenAbierta.value) {
    ordenExistente.value = ordenAbiertaMesa.value
    return
  }

  await enviarOrden()
}

// Confirmó desde el modal
const confirmarAgregarAOrden = async () => {
  ordenExistente.value = null
  await enviarOrden()
}

const enviarOrden = async () => {
  creando.value = true
  try {
    const data = await apiClient.post('/ordenes', buildPayload())
    if (data.success || data.data) {
      carrito.value             = []
      nuevaOrden.value.mesa     = null
      numeroComensales.value    = 1
      comensalesNombres.value   = ['Comensal 1']
      comensalActivoIndex.value = 0
      vistaActual.value         = 'ordenes'
      await cargarOrdenes()
      if (data.es_nueva === false) {
        showToast(`Productos agregados al ticket ${data.data?.folio || ''} 📋`, 'warning')
      } else {
        showToast('Orden confirmada 🚀', 'success')
      }
    } else {
      showToast(data.message || 'Error al crear', 'error')
    }
  } catch {
    showToast('Error de conexión', 'error')
  } finally {
    creando.value = false
  }
}

const prepararEdicionOrden = (sub) => {
  if (!sub) return
  carrito.value = []
  
  // Establecer el número de mesa
  if (sub.mesa !== undefined && sub.mesa !== null) {
    nuevaOrden.value.mesa = Number(sub.mesa)
  } else {
    nuevaOrden.value.mesa = null
  }
  
  // Extraer comensales únicos de la orden existente
  const nombresUnicos = [...new Set((sub.detalles || [])
    .map(d => d.nom_comensal || d.comensal)
    .filter(Boolean))]
    
  if (nombresUnicos.length > 0) {
    comensalesNombres.value = [...nombresUnicos]
    numeroComensales.value = nombresUnicos.length
  } else {
    comensalesNombres.value = ['Comensal 1']
    numeroComensales.value = 1
  }
  
  comensalActivoIndex.value = 0
  vistaActual.value = 'nueva'
}

const handleOrderPaid = async () => {
  showToast('Orden cobrada con éxito ✅', 'success')
  await cargarOrdenes()
  tabActivo.value = 'todas'
}

const loadOrdersForCashier = async () => {
  await cargarOrdenes()
}

const totalEnCarritoPorId = (productId) => {
  return carrito.value
    .filter(i => i.id === productId && i.tipo === 'producto')
    .reduce((sum, i) => sum + i.cantidad, 0)
}

const totalEnCarritoPorPaqueteId = (paqueteId) => {
  return carrito.value
    .filter(i => i.id === paqueteId && i.tipo === 'paquete')
    .reduce((sum, i) => sum + i.cantidad, 0)
}

const agregarAlCarrito = (item, tipo) => {
  if (tipo === 'producto' && item.stock !== undefined && item.stock !== null) {
    if (totalEnCarritoPorId(item.id) >= item.stock) {
      showToast(`No hay suficiente stock para "${item.nombre}". Límite: ${item.stock} uds`, 'error')
      return
    }
  }
  if (tipo === 'paquete' && item.stock !== undefined && item.stock !== null) {
    if (totalEnCarritoPorPaqueteId(item.id) >= item.stock) {
      showToast(`No hay suficiente stock para el paquete "${item.nombre}". Límite: ${item.stock} uds`, 'error')
      return
    }
  }

  const cIdx = comensalActivoIndex.value
  const e = carrito.value.find(i => i.id === item.id && i.tipo === tipo && i.comensalIndex === cIdx && !i.notas)
  if (e) {
    e.cantidad++
  } else {
    carrito.value.push({ 
      cartId: Date.now() + Math.random(),
      id: item.id, 
      nombre: item.nombre, 
      precio: Number(item.precio), 
      cantidad: 1, 
      tipo, 
      stock_maximo: item.stock,
      notas: '', 
      comensalIndex: cIdx,
      minutos_produccion: parseFloat(item.minutos_produccion || 0)
    })
  }
}
const incrementar = (cartId) => {
  const i = carrito.value.find(x => x.cartId === cartId)
  if (i) {
    if (i.tipo === 'producto' && i.stock_maximo !== undefined && i.stock_maximo !== null) {
      if (totalEnCarritoPorId(i.id) >= i.stock_maximo) {
        showToast(`No hay suficiente stock para "${i.nombre}". Límite: ${i.stock_maximo} uds`, 'error')
        return
      }
    }
    if (i.tipo === 'paquete' && i.stock_maximo !== undefined && i.stock_maximo !== null) {
      if (totalEnCarritoPorPaqueteId(i.id) >= i.stock_maximo) {
        showToast(`No hay suficiente stock para el paquete "${i.nombre}". Límite: ${i.stock_maximo} uds`, 'error')
        return
      }
    }
    i.cantidad++
  }
}
const decrementar        = (cartId) => { const idx = carrito.value.findIndex(x => x.cartId === cartId); if (idx !== -1) { if (carrito.value[idx].cantidad > 1) carrito.value[idx].cantidad--; else carrito.value.splice(idx, 1) } }
const eliminarDelCarrito = (cartId) => { carrito.value = carrito.value.filter(x => x.cartId !== cartId) }

// ── Acciones de órdenes ────────────────────────────────────────────────────
const cambiarEstadoSubOrden = async (sub, nuevoEstado) => {
  if (!nuevoEstado) return
  cambiando.value = sub.uid
  try {
    const data = await apiClient.put(`/ordenes/${sub.id}`, { estado: nuevoEstado })
    if (data.success || data.data) { 
      await cargarOrdenes()
      showToast('Estado actualizado', 'success') 
    } else {
      // Si el error es por estado redundante, lo tratamos como éxito silencioso
      if (data.message && data.message.includes('No se puede cambiar de')) {
        await cargarOrdenes()
      } else {
        showToast(data.message || 'Error al actualizar', 'error')
      }
    }
  } catch (err) {
    showToast('Error de conexión', 'error')
  } finally {
    cambiando.value = null
  }
}

// ── Agrupación por comensal ────────────────────────────────────────────────
const agruparPorComensal = (detalles) => {
  const grupos = {}
  detalles.forEach(d => {
    const comensal = d.nom_comensal || d.comensal || d.nombre_comensal || 'General'
    if (!grupos[comensal]) grupos[comensal] = []
    grupos[comensal].push(d)
  })
  return grupos
}

const eliminarProductoDeOrden = (detalleId, ordenId) => {
  let maxCant = 1;
  const orden = ordenes.value.find(o => o.id === ordenId);
  if (orden && orden.detalles) {
    const d = orden.detalles.find(item => item.id === detalleId);
    if (d) {
      maxCant = Number(d.cantidad || 1);
    }
  }

  cancelacionModal.value = {
    visible: true,
    detalleId,
    ordenId,
    motivo: '',
    cantidadMaxima: maxCant,
    cantidadCancelar: maxCant
  }
}

const confirmarCancelacion = async () => {
  const { detalleId, ordenId, motivo, cantidadCancelar } = cancelacionModal.value
  if (!motivo) return
  
  creando.value = true
  try {
    const data = await apiClient.delete(`/ordenes/${ordenId}/detalles/${detalleId}?motivo=${encodeURIComponent(motivo)}&cantidad_cancelar=${cantidadCancelar || 1}`)
    if (data.success || data.data) {
      showToast('Producto cancelado correctamente', 'success')
      cancelacionModal.value.visible = false
      // Actualizar localmente para feedback inmediato
      const ordenIdx = ordenes.value.findIndex(o => o.id === ordenId)
      if (ordenIdx !== -1) {
        const d = (ordenes.value[ordenIdx].detalles || []).find(x => x.id === detalleId)
        if (d) {
          d.cancelado = true
          d.motivo_cancelacion = motivo
        }
      }
      await cargarOrdenes()
    } else {
      showToast(data.message || 'Error al eliminar', 'error')
    }
  } catch (e) {
    showToast('Error de conexión', 'error')
  } finally {
    creando.value = false
  }
}

const editorNotas = ref({ visible: false, detalle: null, ordenId: null, nota: '' })

const abrirEditorNotas = (detalle, ordenId) => {
  editorNotas.value = {
    visible: true,
    detalle,
    ordenId,
    nota: detalle.notas || ''
  }
}

const guardarNota = async () => {
  const { detalle, ordenId, nota } = editorNotas.value
  try {
    const data = await apiClient.put(`/ordenes/${ordenId}/detalles/${detalle.id}`, { cantidad: detalle.cantidad, notas: nota })
    if (data.success || data.data) {
      showToast('Nota actualizada', 'success')
      editorNotas.value.visible = false
      await cargarOrdenes()
    }
  } catch (e) {
    showToast('Error al guardar nota', 'error')
  }
}

const actualizarCantidadItem = async (detalle, ordenId, delta) => {
  const nuevaCantidad = parseFloat(detalle.cantidad) + delta
  if (nuevaCantidad < 1) {
    return eliminarProductoDeOrden(detalle.id, ordenId)
  }
  
  try {
    const data = await apiClient.put(`/ordenes/${ordenId}/detalles/${detalle.id}`, { cantidad: nuevaCantidad, notas: detalle.notas })
    if (data.success || data.data) {
      await cargarOrdenes()
    }
  } catch (e) {
    showToast('Error al actualizar cantidad', 'error')
  }
}

// ── Acciones tiempos recoger/entregar ─────────────────────────────────────

const idsListos = (orden) => (orden.detalles || []).filter(d => (d.estado_preparacion || d.estado) === 'LISTO' && !d.cancelado).map(d => d.id)
const idsRecogidosSinEntregar = (orden) => (orden.detalles || []).filter(d => (d.estado_preparacion || d.estado) === 'LISTO' && !d.cancelado && d.recogido_en && !d.entregado_en).map(d => d.id)

const tieneListos = (orden) => idsListos(orden).length > 0
const tieneRecogidosSinEntregar = (orden) => idsRecogidosSinEntregar(orden).length > 0

const recogerDeCocina = async (orden) => {
  const ids = idsListos(orden)
  if (!ids.length) { showToast('No hay productos listos para recoger', 'warning'); return }
  cambiando.value = `recoger-${orden.id}`
  try {
    const ahora = new Date().toISOString()
    const data = await apiClient.put(`/ordenes/${orden.id}/station-status`, {
      detalles: ids,
      estado_preparacion: 'LISTO',
      recogido_en: ahora,
    })
    if (data.success || data.data) { await cargarOrdenes(); showToast('Productos recogidos de cocina ✅', 'success') }
  } catch { showToast('Error al recoger productos', 'error') }
  finally { cambiando.value = null }
}

const entregarACliente = async (orden) => {
  const ids = idsRecogidosSinEntregar(orden)
  if (!ids.length) { showToast('No hay productos para entregar', 'warning'); return }
  cambiando.value = `entregar-${orden.id}`
  try {
    const ahora = new Date().toISOString()
    const data = await apiClient.put(`/ordenes/${orden.id}/station-status`, {
      detalles: ids,
      estado_preparacion: 'ENTREGADO',
      entregado_en: ahora,
    })
    if (data.success || data.data) { await cargarOrdenes(); showToast('Pedido entregado al cliente ✨', 'success') }
  } catch { showToast('Error al entregar pedido', 'error') }
  finally { cambiando.value = null }
}

// ── Helpers ────────────────────────────────────────────────────────────────
const resolveImageUrl  = (path) => { if (!path) return null; if (path.startsWith('http')) return path; return `${STORAGE_URL}${path.replace(/^\/?storage\//, '')}` }
const getNombreMostrable = (o) => o.cliente?.nombre || o.cliente?.name || o.usuario?.name || o.user?.name || 'Comensal'
const showToast        = (m, t = 'info', duration = 3500) => { const id = Date.now(); toasts.value.push({ id, message: m, type: t, duration }); setTimeout(() => toasts.value = toasts.value.filter(x => x.id !== id), duration) }
const removeToast      = (id) => { toasts.value = toasts.value.filter(t => t.id !== id) }
const formatHora       = (d) => { if (!d) return ''; return new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }

const MINUTOS_INACTIVIDAD = 15
const mesasRecordadas = ref(new Set())
const recordarMesasInactivas = () => {
  if (!esMesero.value) return
  ordenes.value.forEach(o => {
    if (['CERRADA', 'CANCELADA', 'PAGADA'].includes(o.estado)) return
    const mins = Math.floor((Date.now() - new Date(o.updated_at || o.created_at).getTime()) / 60000)
    if (mins >= MINUTOS_INACTIVIDAD && !mesasRecordadas.value.has(o.id)) {
      mesasRecordadas.value.add(o.id)
      showToast(`⏰ Mesa ${o.mesa} — ${mins} min sin actividad`, 'warning', 8000)
    }
  })
}

const handleStorageEvent = (e) => {
  if (e.key === 'marquesina_variant') {
    marquesinaVariant.value = e.newValue || 'dark'
  }
}

onMounted(async () => {
  marquesinaVariant.value = localStorage.getItem('marquesina_variant') || 'dark'
  window.addEventListener('storage', handleStorageEvent)
  await verificarCaja()
  if (cajaAbierta.value) {
    // Primera carga explícita no silenciosa para mostrar el spinner inicial
    await Promise.all([cargarOrdenes(false), cargarProductos(), cargarClientes(), cargarCapacidadRestaurante()])
    if (esMesero.value) await cargarMisMesas()
  }

  // Sincronizar restaurante activo para WS si no estaba en localStorage
  if (!restauranteActivo.value) {
    try {
      const data = await apiClient.get('/me')
      const ra = data.data?.restaurante_activo || data.restaurante_activo
      if (ra) {
        restauranteActivo.value = (typeof ra === 'object' && ra !== null && ra !== undefined) ? ra.id : ra
      }
    } catch {}
  }

  // Recordatorio cada 60s
  recordatorioTimer = setInterval(recordarMesasInactivas, 60000)

  // Iniciar un único polling silencioso de seguridad
  const poll = async () => {
    if (cajaAbierta.value) {
      await cargarOrdenes(true)
    }
    pollTimer = setTimeout(poll, POLL_INTERVAL)
  }
  pollTimer = setTimeout(poll, POLL_INTERVAL)
})

onUnmounted(() => {
  if (pollTimer) clearTimeout(pollTimer)
  if (recordatorioTimer) clearInterval(recordatorioTimer)
  window.removeEventListener('storage', handleStorageEvent)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-slide-in { animation: slideIn 0.3s ease-out; }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
@keyframes pop {
  0% { transform: scale(0.6); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
.animate-pop {
  animation: pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
</style>
