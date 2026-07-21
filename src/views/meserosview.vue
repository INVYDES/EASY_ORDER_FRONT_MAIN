<template>
  <div class="p-4 sm:p-6 space-y-5 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-slate-900 dark:to-slate-800/80" :style="{ zoom }">
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
            :class="vistaActual === 'admin' ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-200' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md'">
            <span class="flex items-center gap-2">📋 {{ vistaActual === 'admin' ? 'Ver mapa' : 'Pedidos' }}</span>
          </button>
          <div v-if="restauranteNombre" class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 shadow-sm">
            <span class="text-[10px] font-black uppercase tracking-wider">{{ restauranteNombre }}</span>
          </div>
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-300 dark:shadow-emerald-900/50"></span>
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
            <TableMap :model-value="mesaSeleccionada" :ordenes="ordenes" :total-mesas="totalMesasRestaurante" :mesas-asignadas="mesasAsignadas" :es-mesero="esMesero" @update:model-value="onMesaClick" />
          </div>
        </div>

        <div v-if="vistaActual === 'admin'" class="mt-6">
          <!-- ══ Órdenes del día / Estaciones ══ -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-800 p-5 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
            <div class="shrink-0">
              <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Órdenes del día</h1>
              <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{{ fechaHoy }}</p>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-3 flex-1">
              <div class="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50/80 dark:bg-amber-900/30 border border-amber-100/80 dark:border-amber-700/60 rounded-2xl shadow-sm hover:scale-105 transition-transform duration-200">
                <span class="text-lg animate-bounce inline-block" style="animation-duration: 2s;">🍳</span>
                <div>
                  <p class="text-[8px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest leading-none">Cocina</p>
                  <p class="text-sm font-black text-amber-800 dark:text-amber-300 mt-1">{{ formatTiempo(tiempoCocinaActual) }}</p>
                  <p v-if="countCocinaActual > 0" class="text-[9px] font-bold text-amber-600/70 dark:text-amber-400/70 -mt-0.5">{{ countCocinaActual }} producto(s)</p>
                </div>
              </div>
              <div class="flex items-center gap-2.5 px-4 py-2.5 bg-indigo-50/80 dark:bg-indigo-900/30 border border-indigo-100/80 dark:border-indigo-700/60 rounded-2xl shadow-sm hover:scale-105 transition-transform duration-200">
                <span class="text-lg animate-bounce inline-block" style="animation-duration: 2.2s;">🍹</span>
                <div>
                  <p class="text-[8px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest leading-none">Barra</p>
                  <p class="text-sm font-black text-indigo-800 dark:text-indigo-300 mt-1">{{ formatTiempo(tiempoBarraActual) }}</p>
                  <p v-if="countBarraActual > 0" class="text-[9px] font-bold text-indigo-600/70 dark:text-indigo-400/70 -mt-0.5">{{ countBarraActual }} producto(s)</p>
                </div>
              </div>
              <div class="flex items-center gap-2.5 px-4 py-2.5 bg-rose-50/80 dark:bg-rose-900/30 border border-rose-100/80 dark:border-rose-700/60 rounded-2xl shadow-sm hover:scale-105 transition-transform duration-200">
                <span class="text-lg animate-bounce inline-block" style="animation-duration: 2.4s;">🍰</span>
                <div>
                  <p class="text-[8px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-widest leading-none">Postres</p>
                  <p class="text-sm font-black text-rose-800 dark:text-rose-300 mt-1">{{ formatTiempo(tiempoPostresActual) }}</p>
                  <p v-if="countPostresActual > 0" class="text-[9px] font-bold text-rose-600/70 dark:text-rose-400/70 -mt-0.5">{{ countPostresActual }} producto(s)</p>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <div v-if="cajaAbierta" class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-700">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-[10px] font-black uppercase">Caja abierta</span>
              </div>
            </div>
          </div>

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
          <div v-else-if="tabActivo === 'tiempos'" class="animate-fade-in">
            <div class="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl p-5 border border-purple-100 dark:border-purple-800">
                  <p class="text-xs font-bold text-purple-500 dark:text-purple-400 uppercase tracking-wider">Tiempo promedio recogida</p>
                  <p class="text-3xl font-black text-purple-700 dark:text-purple-300 mt-2">{{ formatTiempo(kpiTiempoRecogidaPromedio) }}</p>
                  <p class="text-xs text-purple-400 dark:text-purple-500 mt-1">Desde que la cocina marca LISTO hasta que el mesero recoge</p>
                </div>
                <div class="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-800">
                  <p class="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">Tiempo promedio entrega</p>
                  <p class="text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-2">{{ formatTiempo(kpiTiempoEntregaPromedio) }}</p>
                  <p class="text-xs text-emerald-400 dark:text-emerald-500 mt-1">Desde que recoge hasta que entrega al cliente</p>
                </div>
                <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl p-5 border border-amber-100 dark:border-amber-800">
                  <p class="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider">Tiempo total del día</p>
                  <p class="text-3xl font-black text-amber-700 dark:text-amber-300 mt-2">{{ formatTiempo(kpiTiempoTotalPromedio) }}</p>
                  <p class="text-xs text-amber-400 dark:text-amber-500 mt-1">Ciclo completo desde que se crea hasta que se entrega</p>
                </div>
              </div>
              <div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
                <div class="flex items-center gap-4 flex-wrap">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-600 dark:text-slate-300">Órdenes hoy:</span>
                    <span class="text-lg font-black text-indigo-600 dark:text-indigo-400">{{ kpiTotalOrdenesHoy }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-600 dark:text-slate-300">Pendientes de recoger:</span>
                    <span class="text-lg font-black text-amber-600 dark:text-amber-400">{{ kpiPendientesRecoger }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-600 dark:text-slate-300">Pendientes de entregar:</span>
                    <span class="text-lg font-black text-emerald-600 dark:text-emerald-400">{{ kpiPendientesEntregar }}</span>
                  </div>
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-600">
                      <th class="text-left py-3 px-3 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase">Orden</th>
                      <th class="text-left py-3 px-3 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase">Mesa</th>
                      <th class="text-left py-3 px-3 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase">Producto</th>
                      <th class="text-right py-3 px-3 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase">T. Preparación</th>
                      <th class="text-right py-3 px-3 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase">T. Recogida</th>
                      <th class="text-right py-3 px-3 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase">T. Entrega</th>
                      <th class="text-right py-3 px-3 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="det in kpiDetallesConTiempos" :key="det.detalleId" class="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td class="py-3 px-3 font-medium text-gray-800 dark:text-slate-200">#{{ det.ordenId }}</td>
                      <td class="py-3 px-3 text-gray-600 dark:text-slate-300">{{ det.mesa }}</td>
                      <td class="py-3 px-3 text-gray-600 dark:text-slate-300 max-w-[200px] truncate">{{ det.producto }}</td>
                      <td class="py-3 px-3 text-right font-mono text-gray-600 dark:text-slate-300">{{ det.tiempoPreparacion ? det.tiempoPreparacion + 'm' : '—' }}</td>
                      <td class="py-3 px-3 text-right font-mono" :class="det.tiempoRecogida > 5 ? 'text-red-600 font-bold' : 'text-gray-600 dark:text-slate-300'">{{ det.tiempoRecogida ? det.tiempoRecogida + 'm' : '—' }}</td>
                      <td class="py-3 px-3 text-right font-mono" :class="det.tiempoEntrega > 5 ? 'text-red-600 font-bold' : 'text-gray-600 dark:text-slate-300'">{{ det.tiempoEntrega ? det.tiempoEntrega + 'm' : '—' }}</td>
                      <td class="py-3 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ det.tiempoTotal ? det.tiempoTotal + 'm' : '—' }}</td>
                    </tr>
                    <tr v-if="!kpiDetallesConTiempos.length">
                      <td colspan="7" class="text-center py-10 text-gray-400 dark:text-slate-500">Sin datos de tiempos para mostrar hoy</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div v-else class="animate-fade-in">
            <div v-if="loading" class="flex items-center justify-center py-20 gap-3">
              <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p class="text-gray-400 dark:text-slate-400 text-sm font-medium">Cargando órdenes...</p>
            </div>
            <div v-else-if="subOrdenesFiltradas.length === 0" class="text-center py-20 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
              <span class="text-6xl block mb-4">📋</span>
              <p class="text-gray-500 dark:text-slate-300 font-bold text-lg">Sin órdenes</p>
              <p class="text-gray-400 dark:text-slate-500 text-xs mt-1">No hay órdenes en esta categoría</p>
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <div v-for="sub in subOrdenesFiltradas" :key="sub.uid" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div class="px-4 py-3.5 flex items-center justify-between border-b border-slate-50 dark:border-slate-700" :class="bgEstado(sub.estado_estacion)">
                  <div class="flex items-center gap-2.5">
                    <span class="text-xl">{{ iconEstado(sub.estado_estacion) }}</span>
                    <div>
                      <p class="text-sm font-bold text-gray-800 dark:text-white">{{ sub.folio || 'Orden #'+sub.id }}</p>
                      <p class="text-[10px] text-gray-400 dark:text-slate-500 font-medium">{{ formatHora(sub.created_at) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[9px] font-bold px-2 py-1 rounded-full" :class="estacionBadge(sub._estacion)">{{ sub._estacion }}</span>
                    <span class="text-[10px] font-bold px-3 py-1.5 rounded-full border" :class="badgeEstado(sub.estado_estacion)">{{ labelEstado(sub.estado_estacion) }}</span>
                  </div>
                </div>
                <div class="px-4 py-3.5 flex-1 space-y-3">
                  <div class="flex items-center gap-2.5 text-sm text-gray-600 dark:text-slate-300">
                    <span class="text-lg">👤</span>
                    <span class="font-semibold">{{ getNombreMostrable(sub) }}</span>
                  </div>
                  <div v-if="sub.mesa" class="flex items-center gap-2.5 text-sm text-gray-500 dark:text-slate-400">
                    <span class="text-lg">🪑</span>
                    <span class="font-semibold">Mesa {{ sub.mesa }}</span>
                  </div>
                  <!-- Productos -->
                  <div class="space-y-2">
                    <div v-for="d in (sub.detalles_estacion || [])" :key="d.id"
                      class="py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0"
                      :class="d.cancelado ? 'opacity-50' : ''">
                      <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-1.5 min-w-0 flex-1">
                          <button v-if="!esAdminOPropietario && !d.cancelado" @click="actualizarCantidadItem(d, sub.id, -1)" class="w-6 h-6 rounded-md bg-white dark:bg-slate-600 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center text-xs font-bold shadow-sm border border-slate-100 dark:border-slate-500 transition-colors shrink-0">−</button>
                          <span class="text-sm font-bold text-center min-w-[16px]" :class="d.cancelado ? 'text-red-400 dark:text-red-500' : 'text-gray-800 dark:text-slate-200'">{{ d.cantidad }}</span>
                          <button v-if="!esAdminOPropietario && !d.cancelado" @click="actualizarCantidadItem(d, sub.id, 1)" class="w-6 h-6 rounded-md bg-white dark:bg-slate-600 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center justify-center text-xs font-bold shadow-sm border border-slate-100 dark:border-slate-500 transition-colors shrink-0">+</button>
                          <span class="text-sm font-bold truncate" :class="d.cancelado ? 'line-through text-red-400 dark:text-red-500' : 'text-gray-800 dark:text-slate-200'">{{ d.producto_nombre || d.nombre || 'Producto' }}</span>
                          <span v-if="d.cancelado" class="text-[9px] font-black text-red-500 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full shrink-0">CANCELADO</span>
                        </div>
                        <div class="flex items-center gap-1 shrink-0">
                          <button v-if="!d.cancelado" @click="abrirEditorNotas(d, sub.id)" class="w-6 h-6 rounded-lg text-slate-300 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 flex items-center justify-center text-xs transition-colors" title="Agregar/editar nota">✏️</button>
                          <button v-if="!d.cancelado" @click="eliminarProductoDeOrden(d.id, sub.id)" class="w-6 h-6 rounded-lg text-slate-300 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center text-xs transition-colors" title="Cancelar producto">🗑️</button>
                          <span class="text-xs font-semibold ml-1" :class="d.cancelado ? 'line-through text-red-400' : 'text-gray-500 dark:text-slate-400'">${{ Number(d.subtotal || d.precio || 0).toFixed(2) }}</span>
                        </div>
                      </div>
                      <p v-if="d.notas" class="text-[11px] text-gray-400 dark:text-slate-500 italic mt-0.5 ml-1 flex items-center gap-1">
                        <span>📝</span> {{ d.notas }}
                      </p>
                    </div>
                    <div v-if="!sub.detalles_estacion?.length" class="text-xs text-gray-400 dark:text-slate-500 italic text-center py-2">
                      Sin productos
                    </div>
                  </div>
                  <div v-if="sub.estado_estacion !== 'CERRADA' && sub.estado_estacion !== 'CANCELADA' && sub.estado_estacion !== 'PAGADA'" class="flex flex-wrap gap-2 pt-2">
                    <div v-if="esAdminOPropietario" class="w-full px-3 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 text-center">
                      🔒 BLOQUEADO — Solo lectura
                    </div>
                    <template v-else>
                      <button v-if="siguienteEstado(sub.estado_estacion)" @click="cambiarEstadoSubOrden(sub, siguienteEstado(sub.estado_estacion))" :disabled="cambiando === sub.uid"
                        class="flex-1 min-w-[120px] px-3 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
                        :class="btnEstado(sub.estado_estacion)">
                        <span v-if="cambiando === sub.uid" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span v-else>{{ accionEstado(sub.estado_estacion) }}</span>
                      </button>
                      <button v-if="['ABIERTA','POR_PREPARAR','EN_PREPARACION'].includes(sub.estado)" @click="abrirCancelarOrdenCompleta(sub.id)"
                        class="px-3 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800">
                        🚫 Cancelar
                      </button>
                    </template>
                  </div>
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
            <button @click="vistaActual = 'mapa'; carrito = []" class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 hover:shadow-md transition-all font-bold text-lg">←</button>
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">Mesa {{ nuevaOrden.mesa }} <span v-if="ordenAbiertaMesa" class="text-base">📋</span></h2>
              <p class="text-xs text-gray-400 dark:text-slate-500">{{ ordenAbiertaMesa ? 'Agregando productos al pedido actual' : 'Toca los productos para agregarlos' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-bold shadow-sm border border-indigo-200 dark:border-indigo-700">{{ carrito.length }} producto(s)</span>
            <button v-if="carrito.length > 0" @click="vistaActual = 'resumen'" class="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 active:scale-[0.97] flex items-center gap-1.5">
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
          <button v-for="p in productosFiltrados" :key="'p-'+p.id + (p.tipo || 'producto')"
            @click="agregarAlCarrito(p, subTabActiva === 'paquetes' ? 'paquete' : 'producto')"
            class="group bg-white dark:bg-slate-800 rounded-[1.25rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 active:scale-[0.97] relative">
            <div class="w-full h-28 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-700/50 flex items-center justify-center overflow-hidden">
              <img v-if="p.imagen_url" :src="resolveImageUrl(p.imagen_url)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span v-else class="text-4xl opacity-60 dark:opacity-30">🍽️</span>
            </div>
            <div class="p-3">
              <p class="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">{{ p.nombre }}</p>
              <p class="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-1.5">${{ Number(p.precio).toFixed(2) }}</p>
              <div v-if="getTamanoData(p).length > 0" class="flex items-center gap-1 mt-1.5 flex-wrap">
                <span v-for="(t, i) in getTamanoData(p)" :key="i" class="text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none whitespace-nowrap" :class="t.color.circle">{{ t.letter }} ${{ t.precio.toFixed(2) }}</span>
              </div>
            </div>
            <div v-if="subTabActiva !== 'paquetes' && totalEnCarritoPorId(p.id)" class="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-indigo-300 animate-pop">
              {{ totalEnCarritoPorId(p.id) }}
            </div>
            <div v-if="subTabActiva === 'paquetes' && totalEnCarritoPorPaqueteId(p.id)" class="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-indigo-300 animate-pop">
              {{ totalEnCarritoPorPaqueteId(p.id) }}
            </div>
          </button>
        </div>

        <!-- Carrito flotante -->
        <button v-if="carrito.length > 0" @click="vistaActual = 'resumen'"
          class="fixed bottom-6 right-6 z-40 px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-2xl shadow-indigo-300/50 dark:shadow-indigo-900/60 hover:from-indigo-700 hover:to-indigo-800 transition-all active:scale-95 flex items-center gap-3 font-bold text-sm">
          <span class="relative">
            🛒
            <span class="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">{{ carrito.length }}</span>
          </span>
          <span>${{ totalCarrito.toFixed(2) }}</span>
        </button>
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
          <div v-for="item in carrito" :key="item.cartId" class="py-3 border-b border-slate-50 dark:border-slate-700 last:border-0">
            <div class="flex items-center justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-gray-800 dark:text-slate-200 truncate">
                  {{ item.nombre }}
                  <span v-if="item.tamano && item.tamano !== 'pequeno'" class="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 ml-1">({{ item.tamano_nombre?.[0]?.toUpperCase() || (item.tamano === 'mediano' ? 'M' : 'L') }})</span>
                </p>
                <p class="text-xs text-gray-400 dark:text-slate-500">${{ Number(item.precio).toFixed(2) }} c/u</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <div class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 rounded-lg p-1 border border-slate-100 dark:border-slate-600">
                  <button v-if="!esAdminOPropietario" @click="decrementar(item.cartId)" class="w-7 h-7 rounded-md bg-white dark:bg-slate-600 text-gray-500 dark:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center text-sm font-bold shadow-sm border border-slate-100 dark:border-slate-500 transition-colors">−</button>
                  <span class="w-7 text-center text-sm font-black text-gray-800 dark:text-white">{{ item.cantidad }}</span>
                  <button v-if="!esAdminOPropietario" @click="incrementar(item.cartId)" class="w-7 h-7 rounded-md bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center justify-center text-sm font-bold shadow-sm border border-slate-100 dark:border-slate-500 transition-colors">+</button>
                </div>
                <span class="text-sm font-black text-indigo-600 dark:text-indigo-400 w-16 text-right">${{ Number(item.precio * item.cantidad).toFixed(2) }}</span>
                <button @click="eliminarDelCarrito(item.cartId)" class="w-7 h-7 rounded-lg text-slate-300 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center text-sm transition-colors">✕</button>
              </div>
            </div>
            <!-- Nota del producto: visible y destacada antes de enviar -->
            <div class="mt-2 ml-1 flex items-center gap-2">
              <span class="text-amber-400 text-xs shrink-0">📝</span>
              <input v-model="item.notas" placeholder="Nota: sin cebolla, término medio, extra queso..."
                class="flex-1 text-xs px-3 py-1.5 rounded-lg bg-amber-50/60 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-amber-200/60 dark:focus:ring-amber-500/30 focus:border-amber-300 outline-none transition-all placeholder:text-amber-300 dark:placeholder:text-amber-600/60 text-gray-700 dark:text-slate-200 font-medium" />
            </div>
          </div>
          <div v-if="carrito.length === 0" class="text-center py-10 text-gray-400 dark:text-slate-500 text-sm">
            <span class="text-4xl block mb-2">🛒</span>
            Sin productos en el ticket
          </div>
        </div>

        <div class="flex justify-between items-center mt-5 px-1">
          <span class="text-sm text-gray-500 dark:text-slate-400 font-medium">Total</span>
          <span class="text-xl font-black text-indigo-600 dark:text-indigo-400">${{ totalCarrito.toFixed(2) }}</span>
        </div>

        <button @click="crearOrden" :disabled="creando || carrito.length === 0"
          class="w-full mt-5 py-4 text-white text-sm font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
          :class="creando || carrito.length === 0 ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-200 dark:shadow-green-900/50'">
          <span v-if="creando" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ creando ? 'ENVIANDO...' : ordenAbiertaMesa ? '➕ AGREGAR A PEDIDO' : '🚀 ENVIAR A COCINA' }}
        </button>

        <!-- Modal de confirmación cuando la mesa ya tiene orden abierta -->
        <div v-if="ordenExistente" class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4" @click.self="ordenExistente = null">
          <div class="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm p-6 animate-pop">
            <div class="text-center mb-5">
              <span class="text-5xl block mb-3">📋</span>
              <h3 class="font-bold text-gray-900 dark:text-white text-lg">Mesa con pedido activo</h3>
              <p class="text-sm text-gray-400 dark:text-slate-500 mt-2">La mesa {{ nuevaOrden.mesa }} ya tiene un pedido en curso.<br>¿Agregar productos al ticket existente?</p>
            </div>
            <div class="flex gap-3">
              <button @click="ordenExistente = null" class="flex-1 py-3 text-sm font-bold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition">Cancelar</button>
              <button @click="confirmarAgregarAOrden" class="flex-1 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition shadow-lg">Agregar y enviar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Seleccionar Tamaño (Mesero) -->
      <div v-if="showTamanosModal" class="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in"
           @click.self="showTamanosModal = false">
        <div class="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-slide-up relative">
          <button @click="showTamanosModal = false" class="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 font-bold">✕</button>
          <div class="mb-6">
            <h3 class="font-black text-slate-900 dark:text-white text-2xl tracking-tight leading-tight pr-8">{{ productoTamanos?.nombre }}</h3>
            <p class="text-sm text-slate-500 mt-1 font-medium">Selecciona el tamaño deseado</p>
          </div>
          <div class="space-y-3">
            <button v-for="(t, i) in getTamanoData(productoTamanos)" :key="t.key"
                    @click="agregarConTamano(productoTamanos, t.key, t.precio, 'producto')"
                    class="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 group transition-all"
                    :class="t.color.hover">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg" :class="t.color.circle">{{ t.letter }}</div>
                <span class="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest" :class="t.color.hoverText">{{ t.nombre }}</span>
              </div>
              <span class="font-black text-slate-900 dark:text-white text-xl">${{ t.precio.toFixed(2) }}</span>
            </button>
          </div>
        </div>
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

          <!-- Person bar en modo división — tap para seleccionar persona activa -->
          <div v-if="modoDividirTicket" class="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            <div v-for="p in personasTicket" :key="p.id"
              @click="personaActivaId = personaActivaId === p.id ? null : p.id"
              class="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border transition-all cursor-pointer select-none"
              :class="personaActivaId === p.id ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-800 scale-[1.04] shadow-md' : 'opacity-55 hover:opacity-100 hover:scale-105'"
              :style="{ background: PERSONA_COLORS[(p.id - 1) % PERSONA_COLORS.length] + '20', color: PERSONA_COLORS[(p.id - 1) % PERSONA_COLORS.length], borderColor: PERSONA_COLORS[(p.id - 1) % PERSONA_COLORS.length] + '40' }">
              <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                :style="{ background: PERSONA_COLORS[(p.id - 1) % PERSONA_COLORS.length] }">{{ p.id }}</span>
              <span class="truncate max-w-[60px]">Pers {{ p.id }}</span>
              <span class="opacity-60">${{ totalPersona(p.id).toFixed(2) }}</span>
              <span v-if="personaActivaId === p.id" class="text-[9px] opacity-80 shrink-0">✓</span>
            </div>
            <button @click="agregarPersonaTicket" class="shrink-0 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center justify-center text-sm font-bold transition-colors">+</button>
            <button v-if="personaActivaId" @click="personaActivaId = null" class="shrink-0 text-[10px] text-slate-400 hover:text-slate-600 ml-1 font-bold">✕</button>
            <button @click="modoDividirTicket = false" class="shrink-0 text-[10px] text-slate-400 hover:text-red-500 ml-1 font-bold">Salir</button>
          </div>
          <p v-if="modoDividirTicket && !personaActivaId" class="text-[10px] text-slate-400 dark:text-slate-500 italic mb-2 -mt-1.5">Toca una persona arriba para seleccionarla, luego toca los productos para asignarlos</p>

          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
            <div v-for="d in ticketActivo.detalles" :key="d.id"
              class="text-sm py-2 border-b border-slate-100 dark:border-slate-600 last:border-0"
              :class="d.cancelado ? 'opacity-60' : ''">
              <div class="flex justify-between items-center gap-2">
                <button v-if="modoDividirTicket && !d.cancelado" @click="asignarProducto(d.id)"
                  class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm transition-all active:scale-110"
                  :class="personaActivaId && obtenerPersonaDeProducto(d.id) === -1 ? 'ring-2 ring-yellow-300 ring-offset-1' : ''"
                  :style="{ background: colorDePersona(d.id) }"
                  :title="personaActivaId ? `Asignar a Persona ${personaActivaId}` : `Persona ${numeroDePersona(d.id)}`">
                  {{ numeroDePersona(d.id) }}
                </button>
                <div class="flex items-center gap-1.5 min-w-0 flex-1">
                  <button v-if="!esAdminOPropietario && !d.cancelado" @click="actualizarCantidadItem(d, ticketActivo.id, -1)" class="w-6 h-6 rounded-md bg-white dark:bg-slate-600 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center text-xs font-bold shadow-sm border border-slate-100 dark:border-slate-500 transition-colors shrink-0">−</button>
                  <span class="font-semibold min-w-[20px] text-center" :class="d.cancelado ? 'text-red-400 dark:text-red-500' : 'text-gray-700 dark:text-slate-300'">{{ d.cantidad }}</span>
                  <button v-if="!esAdminOPropietario && !d.cancelado" @click="actualizarCantidadItem(d, ticketActivo.id, 1)" class="w-6 h-6 rounded-md bg-white dark:bg-slate-600 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center justify-center text-xs font-bold shadow-sm border border-slate-100 dark:border-slate-500 transition-colors shrink-0">+</button>
                  <span class="font-semibold truncate ml-1" :class="d.cancelado ? 'line-through text-red-400 dark:text-red-500' : 'text-gray-700 dark:text-slate-300'">{{ d.producto_nombre || d.nombre || 'Producto' }}</span>
                  <span v-if="d.cancelado" class="text-[9px] font-black text-red-500 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full shrink-0">CANCELADO</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button v-if="!d.cancelado" @click="abrirEditorNotas(d, ticketActivo.id)" class="w-7 h-7 rounded-lg text-slate-300 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 flex items-center justify-center text-xs transition-colors" title="Agregar/editar nota">✏️</button>
                  <button v-if="!d.cancelado" @click="eliminarProductoDeOrden(d.id, ticketActivo.id)" class="w-7 h-7 rounded-lg text-slate-300 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center text-xs transition-colors" title="Cancelar producto">🗑️</button>
                  <span class="font-bold ml-1" :class="d.cancelado ? 'line-through text-red-400' : 'text-gray-900 dark:text-white'">${{ Number(d.subtotal || 0).toFixed(2) }}</span>
                </div>
              </div>
              <p v-if="d.notas" class="text-[11px] text-gray-400 dark:text-slate-500 italic mt-0.5 ml-1 flex items-center gap-1">
                <span>📝</span> {{ d.notas }}
              </p>
            </div>
            <div v-if="!ticketActivo.detalles?.length" class="text-center py-6 text-gray-400 dark:text-slate-500 text-sm">
              Sin productos en esta orden
            </div>
          </div>

          <!-- Split mode: per‑person resumen + payment -->
          <template v-if="modoDividirTicket">
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
              <div v-for="p in personasTicket" :key="p.id" class="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                      :style="{ background: PERSONA_COLORS[(p.id - 1) % PERSONA_COLORS.length] }">{{ p.id }}</span>
                    <span class="text-xs font-bold text-gray-700 dark:text-slate-300">Persona {{ p.id }}</span>
                  </div>
                  <span class="text-sm font-black text-indigo-600 dark:text-indigo-400">${{ totalPersona(p.id).toFixed(2) }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <button v-for="m in metodosPago" :key="m.key"
                    @click="p.metodo = m.key"
                    :class="['flex-1 py-1.5 rounded-lg text-[10px] font-black transition border',
                      p.metodo === m.key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-gray-800 text-slate-400 dark:text-gray-500 border-slate-200 dark:border-gray-700']">
                    {{ m.icon }} {{ m.label }}
                  </button>
                </div>
                <div class="mt-2">
                  <div v-if="p.metodo === 'efectivo'" class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">$</span>
                    <input type="number" v-model.number="p.recibido" min="0" placeholder="Recibido"
                      class="w-full pl-7 pr-3 py-1.5 text-xs font-black bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-gray-200" />
                    <div v-if="p.recibido > 0 && p.recibido >= totalPersona(p.id)" class="mt-1 flex justify-between px-2 text-[10px] font-bold">
                      <span class="text-emerald-600">Cambio</span>
                      <span class="text-emerald-600">${{ (p.recibido - totalPersona(p.id)).toFixed(2) }}</span>
                    </div>
                    <div v-else-if="p.recibido > 0" class="mt-1 text-[10px] font-bold text-red-500 px-2">
                      Faltan ${{ (totalPersona(p.id) - p.recibido).toFixed(2) }}
                    </div>
                  </div>
                  <input v-else v-model="p.referencia" placeholder="Referencia / Folio"
                    class="w-full px-3 py-1.5 text-xs font-bold bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-gray-200" />
                </div>
              </div>
            </div>

            <div v-if="errorDividirTicket" class="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold text-red-700 dark:text-red-400">
              {{ errorDividirTicket }}
            </div>

            <button @click="cobrarDivididoTicket" :disabled="cobrandoDividido || !puedeCobrarDividido"
              class="w-full mt-4 py-3.5 text-sm font-black text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
              <div v-if="cobrandoDividido" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {{ cobrandoDividido ? 'Procesando...' : '💳 Cobrar dividido' }}
            </button>

            <div class="mt-3 flex justify-between items-center px-1">
              <span class="text-xs font-bold text-slate-400">Total dividido</span>
              <span class="text-base font-black text-indigo-600 dark:text-indigo-400">${{ totalDivididoTicket.toFixed(2) }}</span>
            </div>
          </template>

          <!-- Modo normal (sin división) -->
          <template v-else>
            <div class="flex justify-between items-center mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
              <span class="font-bold text-gray-700 dark:text-slate-300">Total</span>
              <span class="text-xl font-black text-indigo-600 dark:text-indigo-400">${{ Number(ticketActivo.total || 0).toFixed(2) }}</span>
            </div>

            <button @click="toggleDividirTicket"
              class="w-full mt-4 py-2.5 text-xs font-bold rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition flex items-center justify-center gap-2">
              ✂️ Dividir cuenta
            </button>

            <button v-if="!esAdminOPropietario" @click="showTicketModal = false; nuevaOrden.mesa = ticketActivo.mesa; carrito = []; vistaActual = 'productos'"
              class="w-full mt-3 py-3.5 text-sm font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 active:scale-[0.98] flex items-center justify-center gap-2">
              ➕ Agregar productos a esta mesa
            </button>
            <button v-if="!esAdminOPropietario && ['ABIERTA','POR_PREPARAR','EN_PREPARACION'].includes(ticketActivo.estado)" @click="abrirCancelarOrdenCompleta(ticketActivo.id)"
              class="w-full mt-2 py-3.5 text-sm font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-red-900/50 active:scale-[0.98] flex items-center justify-center gap-2">
              🚫 Cancelar orden
            </button>
          </template>
        </div>
      </div>
  </div>

<!-- Modal Editar Comentario -->
<div v-if="editorNotas.visible" class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4" @click.self="editorNotas.visible = false">
  <div class="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm p-6 animate-pop">
    <div class="text-center mb-5">
      <span class="text-5xl block mb-3">✏️</span>
      <h3 class="font-bold text-gray-900 dark:text-white text-lg">Editar comentario</h3>
      <p v-if="editorNotas.detalle" class="text-sm text-gray-400 dark:text-slate-500 mt-2">{{ editorNotas.detalle.cantidad }}× {{ editorNotas.detalle.producto_nombre || editorNotas.detalle.nombre || 'Producto' }}</p>
    </div>
    <textarea v-model="editorNotas.nota" rows="3" placeholder="Ej. sin cebolla, término medio, extra queso..."
      class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition text-sm font-medium resize-none placeholder:text-slate-300 dark:placeholder:text-slate-500"></textarea>
    <div class="flex gap-3 mt-5">
      <button @click="editorNotas.visible = false" class="flex-1 py-3 text-sm font-bold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition">Cancelar</button>
      <button @click="guardarNota" class="flex-1 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 transition shadow-lg">Guardar</button>
    </div>
  </div>
</div>

<!-- Modal Productos sin Receta -->
<div v-if="sinRecetaModal.visible" class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4" @click.self="sinRecetaModal.visible = false">
  <div class="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm p-6 animate-pop">
    <div class="text-center mb-5">
      <span class="text-5xl block mb-3">⚠️</span>
      <h3 class="font-bold text-gray-900 dark:text-white text-lg">Productos sin receta</h3>
      <p class="text-sm text-gray-400 dark:text-slate-500 mt-2">Los siguientes productos no tienen ingredientes asignados en su receta:</p>
    </div>
    <div class="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4 mb-5 space-y-2">
      <p v-for="(nombre, i) in sinRecetaModal.productos" :key="i" class="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
        <span>🍽️</span> {{ nombre }}
      </p>
    </div>
    <div class="flex gap-3">
      <button @click="sinRecetaModal.visible = false" class="flex-1 py-3 text-sm font-bold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition">Cancelar</button>
      <button @click="confirmarSinReceta" class="flex-1 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition shadow-lg">Enviar de todas formas</button>
    </div>
  </div>
</div>
<!-- ══ MODAL: CANCELACIÓN CON MOTIVO ══ -->
<div v-if="cancelacionModal.visible" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" @click.self="cancelacionModal.visible = false">
  <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up border border-slate-100 dark:border-gray-700">
    <div class="px-6 py-5 bg-red-50 dark:bg-red-900/30 border-b border-red-100 dark:border-red-800 flex items-center gap-3">
      <span class="text-2xl">⚠️</span>
      <div>
        <h3 class="font-black text-red-800 dark:text-red-400 text-sm uppercase tracking-tight">Motivo de cancelación</h3>
        <p class="text-[10px] font-bold text-red-400 dark:text-red-300 uppercase tracking-widest">Este producto no se cobrará</p>
      </div>
    </div>
    <div class="p-6">
      <div v-if="cancelacionModal.cantidadMaxima > 1" class="mb-4 bg-slate-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-slate-100 dark:border-gray-700 flex flex-col gap-2">
        <label class="block text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-1 text-center">Cantidad a Cancelar</label>
        <div class="flex items-center justify-center gap-4">
          <button @click="cancelacionModal.cantidadCancelar > 1 ? cancelacionModal.cantidadCancelar-- : null"
            class="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 font-black transition active:scale-95 text-sm">
            −
          </button>
          <span class="text-lg font-black text-slate-800 dark:text-gray-200 w-12 text-center">{{ cancelacionModal.cantidadCancelar }}</span>
          <button @click="cancelacionModal.cantidadCancelar < cancelacionModal.cantidadMaxima ? cancelacionModal.cantidadCancelar++ : null"
            class="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 font-black transition active:scale-95 text-sm">
            +
          </button>
        </div>
        <p class="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest text-center mt-1">De un total de {{ cancelacionModal.cantidadMaxima }} unidades</p>
      </div>

      <label class="block text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Selecciona o escribe el motivo</label>
      <div class="grid grid-cols-1 gap-2 mb-4">
        <button v-for="m in ['Platillo equivocado', 'Pelo/Objeto extraño', 'Mal sabor/Crudo', 'Tardanza excesiva', 'Cliente se arrepintió']" :key="m"
          @click="cancelacionModal.motivo = m"
          :class="['px-4 py-2.5 rounded-2xl text-xs font-bold transition text-left border', 
            cancelacionModal.motivo === m ? 'bg-red-500 text-white border-red-600 shadow-md' : 'bg-slate-50 dark:bg-gray-800/50 text-slate-600 dark:text-gray-400 border-slate-100 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-700']">
          {{ m }}
        </button>
      </div>
      <textarea v-model="cancelacionModal.motivo" rows="2" 
        class="w-full px-4 py-3.5 border border-slate-100 dark:border-gray-700 rounded-2xl text-sm bg-slate-50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-red-500/10 outline-none transition font-bold dark:text-gray-200"
        placeholder="Escribe otro motivo detallado..."></textarea>
    </div>
    <div class="px-6 py-4 bg-slate-50 dark:bg-gray-800/50 flex gap-3">
      <button @click="cancelacionModal.visible = false" 
        class="flex-1 py-3 text-xs font-black text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-400 transition uppercase tracking-widest">
        Ignorar
      </button>
      <button @click="confirmarCancelacion" :disabled="!cancelacionModal.motivo || creando"
        class="flex-1 py-3 text-xs font-black text-white bg-red-600 rounded-2xl hover:bg-red-700 transition shadow-lg shadow-red-100 uppercase tracking-widest disabled:opacity-50">
        {{ creando ? '...' : 'Confirmar' }}
      </button>
    </div>
  </div>
</div>
<!-- ══ MODAL: CONFIRMAR CANCELAR ORDEN COMPLETA ══ -->
<div v-if="cancelarOrdenModal.visible" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" @click.self="cancelarOrdenModal.visible = false">
  <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up border border-slate-100 dark:border-gray-700" :class="{ 'animate-shake': animandoCancelacion }">
    <div class="px-6 py-5 bg-red-50 dark:bg-red-900/30 border-b border-red-100 dark:border-red-800 flex items-center gap-3">
      <span class="text-2xl">🚫</span>
      <div>
        <h3 class="font-black text-red-800 dark:text-red-400 text-sm uppercase tracking-tight">Cancelar orden completa</h3>
        <p class="text-[10px] font-bold text-red-400 dark:text-red-300 uppercase tracking-widest">Esta acción no se puede deshacer</p>
      </div>
    </div>
    <div class="p-6 text-center">
      <p class="text-sm text-gray-600 dark:text-gray-300 font-medium">¿Estás seguro de cancelar toda la orden?</p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Se cancelarán todos los productos y se restaurará el inventario.</p>
    </div>
    <div class="px-6 py-4 bg-slate-50 dark:bg-gray-800/50 flex gap-3">
      <button @click="cancelarOrdenModal.visible = false" 
        class="flex-1 py-3 text-xs font-black text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-400 transition uppercase tracking-widest">
        Volver
      </button>
      <button @click="confirmarCancelarOrdenCompleta" :disabled="creando"
        class="flex-1 py-3 text-xs font-black text-white bg-red-600 rounded-2xl hover:bg-red-700 transition shadow-lg shadow-red-100 uppercase tracking-widest disabled:opacity-50">
        {{ creando ? '...' : 'Sí, cancelar orden' }}
      </button>
    </div>
  </div>
</div>

<!-- ══ OVERLAY: ANIMACIÓN DE CANCELACIÓN ══ -->
<div v-if="animandoCancelacion" class="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
  <div class="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"></div>
  <div class="relative flex flex-col items-center gap-4 animate-cancel-burst">
    <div class="text-8xl animate-cancel-icon">🚫</div>
    <div class="text-2xl font-black text-white tracking-widest uppercase animate-cancel-text">Orden cancelada</div>
    <div class="flex gap-1.5">
      <div class="w-2 h-2 bg-red-500 rounded-full animate-cancel-particle" style="animation-delay: 0s"></div>
      <div class="w-2 h-2 bg-red-400 rounded-full animate-cancel-particle" style="animation-delay: 0.1s"></div>
      <div class="w-2 h-2 bg-red-500 rounded-full animate-cancel-particle" style="animation-delay: 0.2s"></div>
      <div class="w-2 h-2 bg-red-400 rounded-full animate-cancel-particle" style="animation-delay: 0.3s"></div>
      <div class="w-2 h-2 bg-red-500 rounded-full animate-cancel-particle" style="animation-delay: 0.4s"></div>
    </div>
  </div>
</div>
</template><script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { API_URL, STORAGE_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'
import { useToast } from '@/composables/useToast'
import { useRestauranteChannel } from '@/composables/useRestauranteChannel'
import { useDeviceZoom } from '@/composables/useDeviceZoom'
import TableMap from '@/components/mesero/TableMap.vue'
import CajaTicketGrid from '@/components/caja/cajatiketgrid.vue'
import Marquesitawidget from '@/components/Marquesitawidget.vue'

const { zoom } = useDeviceZoom()
const vistaActual  = ref('mapa')
const tabActivo    = ref('todas')
const subTabActiva = ref('alimentos')
const ordenes      = ref([])
const productos    = ref([])
const paquetes     = ref([])
const clientes     = ref([])
const carrito      = ref([])
const busqueda     = ref('')
const showTamanosModal = ref(false)
const productoTamanos  = ref(null)

const marquesinaVariant = ref(localStorage.getItem('marquesina_variant') || 'dark')

const loading         = ref(true)
const loadingCaja     = ref(true)
const loadingProductos = ref(true)
const creando         = ref(false)
const cambiando       = ref(null)
const { toasts, showToast, removeToast } = useToast()
const cajaAbierta     = ref(false)
const nuevaOrden      = ref({ clienteId: null, mesa: null })
const mesaSeleccionada = ref(null)

const onMesaClick = (numMesa) => {
  mesaSeleccionada.value = numMesa
  if (!numMesa) return
  const ocupada = ordenes.value.some(o => Number(o.mesa) === Number(numMesa) && !['CERRADA','CANCELADA','PAGADA'].includes(o.estado))
  if (ocupada) {
    mostrarTicketMesa(numMesa)
  } else {
    nuevaOrden.value.mesa = numMesa
    carrito.value = []
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

const mesasAsignadas  = ref([])
const restauranteActivo = ref(localStorage.getItem('restaurante_id_activo'))
const restauranteNombre = ref(localStorage.getItem('restaurante_nombre_activo') || '')
const totalMesasRestaurante = ref(24)
const ultimaActualizacion = ref(null)

const POLL_INTERVAL = 15000 // Fluidez total (15s) + WS


const cancelacionModal = ref({ visible: false, detalleId: null, ordenId: null, motivo: '', cantidadMaxima: 1, cantidadCancelar: 1 })
const cancelarOrdenModal = ref({ visible: false, ordenId: null })
const animandoCancelacion = ref(false)

// ── NUEVO: estado para orden existente de la mesa ──────────────────────────
const ordenExistente = ref(null)   // se muestra el modal de confirmación



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
  { key: 'tiempos',        label: 'Tiempos',         icon: '⏱️', color: '#8b5cf6' },
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
const contarEstacion = (fnTest) => {
  let total = 0
  ordenes.value.forEach(o => {
    if (['CERRADA', 'CANCELADA', 'PAGADA'].includes(o.estado)) return
    ;(o.detalles || []).forEach(d => {
      if (d.cancelado) return
      const estado = d.estado_preparacion || d.estado
      if (estado === 'PENDIENTE' || estado === 'EN_PREPARACION') {
        if (fnTest(d)) total += Number(d.cantidad) || 1
      }
    })
  })
  return total
}

const sumarMinutosEstacion = (fnTest) => {
  let total = 0
  ordenes.value.forEach(o => {
    if (['CERRADA', 'CANCELADA', 'PAGADA'].includes(o.estado)) return
    ;(o.detalles || []).forEach(d => {
      if (d.cancelado) return
      const estado = d.estado_preparacion || d.estado
      if (estado === 'PENDIENTE' || estado === 'EN_PREPARACION') {
        if (fnTest(d)) total += (Number(d.cantidad) || 0) * (Number(d.minutos_produccion) || 0)
      }
    })
  })
  return Math.round(total)
}

const tiempoCocinaActual = computed(() => sumarMinutosEstacion(esCocina))
const tiempoBarraActual = computed(() => sumarMinutosEstacion(esBebida))
const tiempoPostresActual = computed(() => sumarMinutosEstacion((d) => esPostre(d) && !esBebida(d)))

const countCocinaActual = computed(() => contarEstacion(esCocina))
const countBarraActual = computed(() => contarEstacion(esBebida))
const countPostresActual = computed(() => contarEstacion((d) => esPostre(d) && !esBebida(d)))
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
  if (tabActivo.value === 'cobrar' || tabActivo.value === 'tiempos') return []

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
  ordenes.value.filter(o => {
    if (o.estado === 'ENTREGADA') return true
    if (['CERRADA', 'CANCELADA', 'PAGADA'].includes(o.estado)) return false
    const detallesSinCancelar = (o.detalles || []).filter(d => !d.cancelado)
    if (!detallesSinCancelar.length) return false
    return detallesSinCancelar.every(d => d.estado_preparacion === 'ENTREGADO')
  })
)

const ordenesFiltradas = computed(() => {
  if (tabActivo.value === 'todas' || tabActivo.value === 'cobrar' || tabActivo.value === 'tiempos') return ordenes.value
  return ordenes.value.filter(o => o.estado === tabActivo.value)
})

const contarOrdenes = (key) => {
  if (key === 'cobrar')   return ordenesParaCobrar.value.length
  if (key === 'tiempos')  return 0
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

const productosFiltrados = computed(() => {
  if (subTabActiva.value === 'paquetes') {
    const b = busqueda.value?.toLowerCase() || ''
    return b ? paquetes.value.filter(p => p.nombre.toLowerCase().includes(b)) : paquetes.value
  }
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
  return Math.ceil(productosFiltrados.value.length / itemsPorPagina)
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
const estacionBadge = (e) => ({ COCINA:'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300', BARRA:'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300', POSTRES:'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300' }[e] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400')
const siguienteEstado = (e) => ({ ABIERTA:'POR_PREPARAR', LISTA:'ENTREGADA' }[e] || null)
const accionEstado    = (e) => ({ ABIERTA:'▶ Enviar Pedido', LISTA:'🤝 Entregada' }[e] || '')
const btnEstado       = (e) => ({ ABIERTA:'bg-amber-500 hover:bg-amber-600 text-white', LISTA:'bg-emerald-500 hover:bg-emerald-600 text-white' }[e] || 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400')

// ── API ────────────────────────────────────────────────────────────────────

const cargarOrdenes = async (silent = true) => {
  if (!silent) loading.value = true
  try {
    const states = ['ABIERTA','POR_PREPARAR','EN_PREPARACION','LISTA','ENTREGADA']
    const bases = ['/meseros/mis-ordenes']
    if (esMesero.value) bases.push('/ordenes')
    if (esAdminOPropietario.value) bases.push('/ordenes')
    const urls = []
    bases.forEach(base => {
      states.forEach(s => urls.push(`${base}?estado=${s}&per_page=100`))
    })
    const results = await Promise.all(urls.map(url => apiClient.get(url)))
    const map = new Map()
    results.forEach(res => { 
      if (res.success || res.data) {
        const items = Array.isArray(res.data) ? res.data : (res.data?.data || [])
        items.forEach(o => {
          const existing = map.get(o.id)
          if (!existing || (o.detalles?.length || 0) > (existing.detalles?.length || 0)) {
            map.set(o.id, o)
          }
        })
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
      const merged = { ...ordenes.value[idx], ...orden }
      if (orden.detalles) {
        const map = new Map()
        ;(ordenes.value[idx].detalles || []).forEach(d => map.set(d.id, d))
        orden.detalles.forEach(d => map.set(d.id, d))
        merged.detalles = [...map.values()]
      }
      ordenes.value[idx] = merged
    } else {
      ordenes.value.unshift(orden)
      showToast(`Nueva orden #${orden.id} creada`, 'info')
    }
    
    const target = idx !== -1 ? ordenes.value[idx] : orden
    const tieneListos = (target.detalles || []).some(d => d.estado_preparacion === 'LISTO')
    if (tieneListos && target.estado !== 'ENTREGADA') {
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

const normalizarProducto = (p) => {
  if (!p) return p
  let tamanos = []
  if (Array.isArray(p.tamanos_disponibles)) {
    tamanos = p.tamanos_disponibles.map(t => ({
      key: t.key,
      nombre: t.nombre,
      precio: Number(t.precio ?? 0),
      stock: t.stock != null ? Number(t.stock) : undefined,
    }))
  } else if (p.tamanos_personalizados) {
    try {
      const raw = typeof p.tamanos_personalizados === 'string'
        ? JSON.parse(p.tamanos_personalizados)
        : p.tamanos_personalizados
      if (Array.isArray(raw)) {
        tamanos = raw.map(t => ({
          key: t.key,
          nombre: t.nombre || '',
          precio: Number(t.precio ?? 0),
          stock: t.stock != null ? Number(t.stock) : undefined,
        }))
      }
    } catch {}
  }
  return { ...p, tamanos_disponibles: tamanos }
}

const cargarProductos = async (silent = false) => {
  if (!silent) loadingProductos.value = true
  try {
    const rid = restauranteActivo.value
    const [pData, paqData] = await Promise.all([
      apiClient.get(`/productos?per_page=500${rid ? `&restaurante_id=${rid}` : ''}`),
      apiClient.get(`/paquetes${rid ? `?restaurante_id=${rid}` : ''}`),
    ])
    if (pData.success || pData.data) {
      const raw = pData.data || pData
      productos.value = Array.isArray(raw) ? raw.map(normalizarProducto) : raw
    }
    if (paqData.success || paqData.data) paquetes.value  = paqData.data || paqData
  } catch {}
  finally { if (!silent) loadingProductos.value = false }
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

const SLOT_NAMES = ['pequeno', 'mediano', 'grande']

const tamanoKeyToSlot = (productId, tamanoKey) => {
  if (!tamanoKey) return null
  const prod = productos.value.find(p => p.id === productId)
  if (!prod) return tamanoKey
  const tams = Array.isArray(prod.tamanos_disponibles) ? prod.tamanos_disponibles : []
  const idx = tams.findIndex(t => t.key === tamanoKey)
  return idx >= 0 && idx < SLOT_NAMES.length ? SLOT_NAMES[idx] : tamanoKey
}

// ── Crear / Agregar orden ──────────────────────────────────────────────────
const buildPayload = () => ({
  cliente_id: nuevaOrden.value.clienteId,
  mesa:       nuevaOrden.value.mesa,
  productos:  carrito.value.map(i => {
    const item = { 
      cantidad: i.cantidad, 
      notas: i.notas
    }
    if (i.tipo === 'producto') item.producto_id = i.id
    if (i.tipo === 'paquete')  item.paquete_id  = i.id
    if (i.tamano) item.tamano = tamanoKeyToSlot(i.id, i.tamano)
    return item
  }),
})

const productosSinReceta = ref([])
const sinRecetaModal = ref({ visible: false, productos: [] })

const verificarRecetas = async () => {
  const productosUnicos = new Map()
  carrito.value.forEach(i => {
    if (i.tipo === 'producto') {
      const key = `${i.id}-${i.tamano || 'default'}`
      if (!productosUnicos.has(key)) {
        productosUnicos.set(key, { id: i.id, nombre: i.nombre, tamano: i.tamano })
      }
    }
  })
  if (!productosUnicos.size) return true

  try {
    const resultados = await Promise.all(
      [...productosUnicos.values()].map(p =>
        apiClient.get(`/ingredientes/producto/${p.id}${p.tamano ? `?tamano=${p.tamano}` : ''}`)
          .then(data => ({ producto: p, ingredientes: (data.success || data.data) ? (data.data || data) : [] }))
          .catch(() => ({ producto: p, ingredientes: [] }))
      )
    )
    const sinReceta = resultados.filter(r => !r.ingredientes.length).map(r => r.producto.nombre)
    if (sinReceta.length) {
      sinRecetaModal.value = { visible: true, productos: sinReceta }
      return false
    }
    return true
  } catch {
    return true
  }
}

const crearOrden = async () => {
  if (!carrito.value.length || !nuevaOrden.value.mesa) return

  // Si la mesa ya tiene orden abierta, mostrar modal de confirmación
  if (mesaTieneOrdenAbierta.value) {
    ordenExistente.value = ordenAbiertaMesa.value
    return
  }

  if (!(await verificarRecetas())) return

  await enviarOrden()
}

// Confirmó desde el modal
const confirmarAgregarAOrden = async () => {
  ordenExistente.value = null
  await enviarOrden()
}

const confirmarSinReceta = () => {
  sinRecetaModal.value.visible = false
  enviarOrden()
}

const enviarOrden = async () => {
  creando.value = true
  try {
    const data = await apiClient.post('/ordenes', buildPayload())
    if (data.success || data.data) {
      carrito.value             = []
      nuevaOrden.value.mesa     = null
      vistaActual.value         = 'mapa'
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

// ── Split bill en ticket modal ────────────────────────────────────────────
const PERSONA_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

const metodosPago = [
  { key: 'efectivo',     icon: '💵', label: 'Efectivo' },
  { key: 'tarjeta',      icon: '💳', label: 'Tarjeta' },
  { key: 'transferencia', icon: '🏦', label: 'Transf.' },
]

const modoDividirTicket = ref(false)
const personaActivaId = ref(null)
const personasTicket = ref([])
const cobrandoDividido = ref(false)
const errorDividirTicket = ref('')

const toggleDividirTicket = () => {
  modoDividirTicket.value = !modoDividirTicket.value
  if (modoDividirTicket.value && ticketActivo.value?.detalles) {
    const detalles = ticketActivo.value.detalles.filter(d => !d.cancelado)
    personasTicket.value = [
      { id: 1, detalleIds: [...detalles.map(d => d.id)], metodo: 'efectivo', recibido: 0, referencia: '' },
      { id: 2, detalleIds: [], metodo: 'efectivo', recibido: 0, referencia: '' },
    ]
    personaActivaId.value = 1
  }
}

const agregarPersonaTicket = () => {
  const id = personasTicket.value.length + 1
  personasTicket.value.push({ id, detalleIds: [], metodo: 'efectivo', recibido: 0, referencia: '' })
  personaActivaId.value = id
}

const obtenerPersonaDeProducto = (detalleId) =>
  personasTicket.value.findIndex(p => p.detalleIds.includes(detalleId))

const colorDePersona = (detalleId) => {
  const idx = obtenerPersonaDeProducto(detalleId)
  return idx === -1 ? '#cbd5e1' : PERSONA_COLORS[idx % PERSONA_COLORS.length]
}

const numeroDePersona = (detalleId) => {
  const idx = obtenerPersonaDeProducto(detalleId)
  return idx === -1 ? '?' : idx + 1
}

const asignarProducto = (detalleId) => {
  const targetId = personaActivaId.value || 1
  const target = personasTicket.value.find(p => p.id === targetId)
  if (!target) return
  personasTicket.value.forEach(p => { p.detalleIds = p.detalleIds.filter(id => id !== detalleId) })
  target.detalleIds.push(detalleId)
  personasTicket.value = [...personasTicket.value]
}

const totalPersona = (personaId) => {
  const p = personasTicket.value.find(x => x.id === personaId)
  if (!p || !ticketActivo.value?.detalles) return 0
  return p.detalleIds.reduce((sum, id) => {
    const d = ticketActivo.value.detalles.find(x => x.id === id)
    return sum + Number(d?.subtotal || 0)
  }, 0)
}

const totalDivididoTicket = computed(() =>
  personasTicket.value.reduce((s, p) => s + totalPersona(p.id), 0)
)

const totalTicketNoCancelado = computed(() =>
  (ticketActivo.value?.detalles || [])
    .filter(d => !d.cancelado)
    .reduce((s, d) => s + Number(d.subtotal || 0), 0)
)

const puedeCobrarDividido = computed(() => {
  if (personasTicket.value.length < 2) return false
  const cubreTotal = Math.abs(totalDivididoTicket.value - totalTicketNoCancelado.value) < 0.01
  if (!cubreTotal) return false
  return personasTicket.value.every(p => {
    if (!p.detalleIds.length) return true
    if (p.metodo === 'efectivo') return (p.recibido || 0) >= totalPersona(p.id)
    return (p.referencia || '').trim().length > 0
  })
})

const cobrarDivididoTicket = async () => {
  if (!ticketActivo.value) return
  errorDividirTicket.value = ''
  cobrandoDividido.value = true

  if (!puedeCobrarDividido.value) {
    errorDividirTicket.value = 'Todos los productos deben estar asignados a una persona antes de cobrar'
    cobrandoDividido.value = false
    return
  }

  try {
    const ordenId = ticketActivo.value.id
    const tickets = personasTicket.value
      .filter(p => p.detalleIds.length > 0)
      .map((p, i) => ({
        comensal: `Persona ${i + 1}`,
        detalles: p.detalleIds,
      }))

    const dataDividir = await apiClient.post(`/ordenes/${ordenId}/dividir`, {
      metodo: 'manual',
      divisiones: tickets,
    })

    if (!dataDividir?.success && !dataDividir?.data) {
      errorDividirTicket.value = dataDividir?.message || 'Error al dividir'
      return
    }

    const cuentas = dataDividir.cuentas || dataDividir.data?.cuentas || []
    const detallePagos = personasTicket.value
      .filter(p => p.detalleIds.length > 0)
      .map((p, i) => ({
        monto: totalPersona(p.id),
        metodo: p.metodo,
        propina: 0,
        referencia: p.referencia || '',
        comensal: `Persona ${i + 1}`,
        detalles: p.detalleIds,
      }))

    const dataCerrar = await apiClient.post(`/ordenes/${ordenId}/cerrar`, {
      estado: 'CERRADA',
      pagos: detallePagos,
      total_final: totalDivididoTicket.value,
    })

    if (!dataCerrar?.success && !dataCerrar?.data) {
      errorDividirTicket.value = dataCerrar?.message || 'Error al cerrar'
      return
    }

    cuentas.forEach((c, idx) => {
      c.nombres_comensales = `Persona ${idx + 1}`
      const p = personasTicket.value.filter(x => x.detalleIds.length > 0)[idx]
      if (p) {
        c.pago_metodo = p.metodo
        c.pago_referencia = p.referencia
        c.pago_recibido = p.recibido
        c.pago_propina = 0
        c.pago_cambio = Math.max(0, (p.recibido || 0) - totalPersona(p.id))
      }
    })

    showToast('Cuenta dividida y cobrada ✅', 'success')
    modoDividirTicket.value = false
    showTicketModal.value = false
    await cargarOrdenes()
  } catch {
    errorDividirTicket.value = 'Error de conexión'
    showToast('Error al procesar división', 'error')
  } finally {
    cobrandoDividido.value = false
  }
}

const totalEnCarritoPorId = (productId) => {
  return carrito.value
    .filter(i => i.id === productId && i.tipo === 'producto')
    .reduce((sum, i) => sum + i.cantidad, 0)
}

const totalEnCarritoPorIdYTamano = (productId, tamano) => {
  return carrito.value
    .filter(i => i.id === productId && i.tipo === 'producto' && i.tamano === tamano)
    .reduce((sum, i) => sum + i.cantidad, 0)
}

const totalEnCarritoPorPaqueteId = (paqueteId) => {
  return carrito.value
    .filter(i => i.id === paqueteId && i.tipo === 'paquete')
    .reduce((sum, i) => sum + i.cantidad, 0)
}

const agregarAlCarrito = (item, tipo) => {
  if (tipo === 'paquete') {
    if (item.stock !== undefined && item.stock !== null && item.stock > 0 && totalEnCarritoPorPaqueteId(item.id) >= item.stock) {
      showToast(`No hay suficiente stock para el paquete "${item.nombre}". Límite: ${item.stock} uds`, 'error')
      return
    }
    agregarItemAlCarrito(item, null, Number(item.precio), 'paquete')
    return
  }

  // Si tiene múltiples tamaños, mostrar modal
  const sizes = getTamanoData(item)
  if (sizes.length > 1) {
    productoTamanos.value = item
    showTamanosModal.value = true
    return
  }

  const sizeKey = sizes.length === 1 ? sizes[0].key : null
  const sizePrecio = sizes.length === 1 ? sizes[0].precio : item.precio
  agregarItemAlCarrito(item, sizeKey || 'pequeno', sizePrecio, 'producto')
}

const sizeStyles = [
  { circle: 'bg-emerald-100 text-emerald-600', hover: 'hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30', hoverText: 'group-hover:text-emerald-700' },
  { circle: 'bg-blue-100 text-blue-600', hover: 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30', hoverText: 'group-hover:text-blue-700' },
  { circle: 'bg-purple-100 text-purple-600', hover: 'hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30', hoverText: 'group-hover:text-purple-700' },
  { circle: 'bg-amber-100 text-amber-600', hover: 'hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30', hoverText: 'group-hover:text-amber-700' },
  { circle: 'bg-rose-100 text-rose-600', hover: 'hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30', hoverText: 'group-hover:text-rose-700' },
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
        stock: t.stock != null ? Number(t.stock) : undefined,
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
      stock: p.stock != null ? Number(p.stock) : undefined,
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

const agregarConTamano = (item, tamano, precio, tipo) => {
  showTamanosModal.value = false
  agregarItemAlCarrito(item, tamano, precio, tipo)
}

const agregarItemAlCarrito = (item, tamano, precio, tipo) => {
  let stockMaximo = undefined

  if (tipo === 'producto') {
    const tamanoInfo = getTamanoData(item).find(t => t.key === tamano)
    const stockActual = tamanoInfo?.stock ?? item.stock
    stockMaximo = stockActual
    if (stockActual !== undefined && stockActual !== null && stockActual > 0) {
      if (totalEnCarritoPorIdYTamano(item.id, tamano) >= stockActual) {
        showToast(`No hay suficiente stock para "${item.nombre}". Límite: ${stockActual} uds`, 'error')
        return
      }
    }
  } else if (tipo === 'paquete') {
    stockMaximo = item.stock
  }

  let tamanoNombre = ''
  const tamanoInfo = getTamanoData(item).find(t => t.key === tamano)
  if (tamanoInfo?.nombre) tamanoNombre = tamanoInfo.nombre
  const sufijo = tamanoNombre ? ` (${tamanoNombre})` : (tamano ? ` (${tamano})` : '')
  carrito.value.push({ 
    cartId: Date.now() + Math.random(),
    id: item.id, 
    nombre: item.nombre + sufijo, 
    precio: Number(precio), 
    cantidad: 1, 
    tipo, 
    tamano: tamano || null,
    tamano_nombre: tamanoNombre || tamano || null,
    stock_maximo: stockMaximo,
    notas: '',
    minutos_produccion: parseFloat(item.minutos_produccion || 0)
  })
}
const incrementar = (cartId) => {
  const i = carrito.value.find(x => x.cartId === cartId)
  if (i) {
    if (i.tipo === 'producto' && i.stock_maximo !== undefined && i.stock_maximo !== null && i.stock_maximo > 0) {
      const totalActual = totalEnCarritoPorIdYTamano(i.id, i.tamano)
      if (totalActual >= i.stock_maximo) {
        showToast(`No hay suficiente stock para "${i.nombre}". Límite: ${i.stock_maximo} uds`, 'error')
        return
      }
    }
    if (i.tipo === 'paquete' && i.stock_maximo !== undefined && i.stock_maximo !== null && i.stock_maximo > 0) {
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
  // Indicar que esta sub‑orden está procesándose
  cambiando.value = sub.uid
  try {
    if (nuevoEstado === 'ENTREGADA') {
      // Utilizar el endpoint de entrega que también marca los detalles como ENTREGADO
      const ids = idsListos(sub)
      if (!ids.length) {
        showToast('No hay productos listos para entregar', 'warning')
        cambiando.value = null
        return
      }
      const ahora = new Date().toISOString()
      const data = await apiClient.put(`/ordenes/${sub.id}/station-status`, {
        detalles: ids,
        estado_preparacion: 'ENTREGADO',
        recogido_en: ahora,
        entregado_en: ahora,
      })
      if (data.success || data.data) {
        // Reemplazar los objetos detalle afectados con nuevas referencias para que
        // Vue detecte el cambio profundo y los computeds recalculen correctamente
        ordenes.value = ordenes.value.map(o => {
          if (o.id !== sub.id) return o
          return {
            ...o,
            detalles: (o.detalles || []).map(d =>
              ids.includes(d.id) ? { ...d, estado_preparacion: 'ENTREGADO' } : d
            )
          }
        })
        showToast('Pedido entregado al cliente ✨', 'success')
      } else {
        showToast(data.message || 'Error al entregar', 'error')
      }
    } else {
      // Cambios de estado genéricos (ABIERTA → POR_PREPARAR, etc.)
      const data = await apiClient.put(`/ordenes/${sub.id}`, { estado: nuevoEstado })
      if (data.success || data.data) {
        await cargarOrdenes()
        showToast('Estado actualizado', 'success')
      } else {
        if (data.message && data.message.includes('No se puede cambiar de')) {
          await cargarOrdenes()
        } else {
          showToast(data.message || 'Error al actualizar', 'error')
        }
      }
    }
  } catch (err) {
    showToast('Error de conexión', 'error')
  } finally {
    // Resetear indicador de carga
    cambiando.value = null
  }
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
      cancelacionModal.value.visible = false

      // ── Actualización local INMEDIATA para feedback instantáneo ──────────
      const ordenIdx = ordenes.value.findIndex(o => o.id === ordenId)
      let eraUltimo = false
      if (ordenIdx !== -1) {
        // Marcar el detalle como cancelado localmente
        const detalles = ordenes.value[ordenIdx].detalles || []
        const d = detalles.find(x => x.id === detalleId)
        if (d) {
          d.cancelado = true
          d.motivo_cancelacion = motivo
        }
        // Forzar reactividad creando una nueva referencia al array de órdenes
        ordenes.value = ordenes.value.map((o, idx) => idx === ordenIdx
          ? { ...o, detalles: [...detalles] }
          : o
        )
        const restantes = detalles.filter(x => !x.cancelado).length
        eraUltimo = restantes === 0
      }

      // Recargar desde el servidor
      await cargarOrdenes()

      // ── Re-sincronizar ticketActivo si el modal está abierto ─────────────
      if (showTicketModal.value && ticketActivo.value) {
        const updated = ordenes.value.find(o => o.id === ticketActivo.value.id)
        if (updated) {
          ticketActivo.value = updated
        } else {
          // La orden fue cancelada por completo — cerrar el modal
          showTicketModal.value = false
          ticketActivo.value = null
        }
      }

      const ordenSigue = ordenes.value.some(o => o.id === ordenId)
      if (!ordenSigue) {
        showToast('Orden cancelada por completo 🚫', 'warning')
      } else {
        showToast(eraUltimo ? 'Último producto cancelado, orden cerrada' : 'Producto cancelado correctamente ✅', 'success')
      }
    } else {
      showToast(data.message || 'Error al eliminar', 'error')
    }
  } catch (e) {
    showToast('Error de conexión', 'error')
  } finally {
    creando.value = false
  }
}

const abrirCancelarOrdenCompleta = (ordenId) => {
  cancelarOrdenModal.value = { visible: true, ordenId }
}

const confirmarCancelarOrdenCompleta = async () => {
  const { ordenId } = cancelarOrdenModal.value

  animandoCancelacion.value = true
  cancelarOrdenModal.value.visible = false
  await new Promise(r => setTimeout(r, 150))

  // ── Remoción local INMEDIATA — evita que la orden aparezca en "todas" ──
  ordenes.value = ordenes.value.filter(o => o.id !== ordenId)
  showTicketModal.value = false
  ticketActivo.value = null

  creando.value = true
  try {
    const data = await apiClient.put(`/ordenes/${ordenId}`, { estado: 'CANCELADA' })
    if (data.success || data.data) {
      showToast('Orden cancelada correctamente 🚫', 'warning')
      // Recargar para asegurarse de que el estado sea consistente
      await cargarOrdenes()
    } else {
      // Si falló el API, recargar para restaurar el estado correcto
      showToast(data.message || 'Error al cancelar orden', 'error')
      await cargarOrdenes()
    }
  } catch (e) {
    showToast('Error de conexión', 'error')
    await cargarOrdenes()
  } finally {
    creando.value = false
    setTimeout(() => { animandoCancelacion.value = false }, 600)
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
      showToast('Nota actualizada ✏️', 'success')
      editorNotas.value.visible = false
      await cargarOrdenes()

      // ── Re-sincronizar ticketActivo si el modal de ticket está abierto ──
      if (showTicketModal.value && ticketActivo.value) {
        const updated = ordenes.value.find(o => o.id === ticketActivo.value.id)
        if (updated) ticketActivo.value = updated
      }
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

// ── Acciones recoger+entregar (un solo paso) ──────────────────────────────

const idsListos = (orden) => (orden.detalles || []).filter(d => (d.estado_preparacion || d.estado) === 'LISTO' && !d.cancelado).map(d => d.id)

const tieneListos = (orden) => idsListos(orden).length > 0

const entregarACliente = async (orden) => {
  const ids = idsListos(orden)
  if (!ids.length) { showToast('No hay productos listos para entregar', 'warning'); return }
  cambiando.value = `entregar-${orden.id}`
  try {
    const ahora = new Date().toISOString()
    const data = await apiClient.put(`/ordenes/${orden.id}/station-status`, {
      detalles: ids,
      estado_preparacion: 'ENTREGADO',
      recogido_en: ahora,
      entregado_en: ahora,
    })
    if (data.success || data.data) {
      // Reemplazar objetos detalle afectados con nuevas referencias para reactividad correcta
      ordenes.value = ordenes.value.map(o => {
        if (o.id !== orden.id) return o
        return {
          ...o,
          detalles: (o.detalles || []).map(d =>
            ids.includes(d.id) ? { ...d, estado_preparacion: 'ENTREGADO' } : d
          )
        }
      })
      showToast('Pedido entregado al cliente ✨', 'success')
    } else {
      showToast(data.message || 'Error al entregar', 'error')
    }
  } catch { showToast('Error al entregar pedido', 'error') }
  finally { cambiando.value = null }
}

// ── Helpers ────────────────────────────────────────────────────────────────
const resolveImageUrl  = (path) => { if (!path) return null; if (path.startsWith('http')) return path; return `${STORAGE_URL}${path.replace(/^\/?storage\//, '')}` }
const getNombreMostrable = (o) => o.cliente?.nombre || o.cliente?.name || o.usuario?.name || o.user?.name || 'Comensal'
const formatHora       = (d) => { if (!d) return ''; return new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }

const kpiDetallesConTiempos = computed(() => {
  const hoy = new Date().toLocaleDateString('en-CA')
  const rows = []
  ordenes.value.forEach(o => {
    if (o.estado === 'CANCELADA') return
    const fechaOrd = o.created_at?.substring(0, 10)
    if (fechaOrd !== hoy) return
    ;(o.detalles || []).forEach(d => {
      if (d.cancelado) return
      const recogido = d.recogido_en ? new Date(d.recogido_en) : null
      const entregado = d.entregado_en ? new Date(d.entregado_en) : null
      const listo = (d.estado_preparacion === 'LISTO' || d.estado_preparacion === 'ENTREGADO') && d.updated_at ? new Date(d.updated_at) : null
      const creado = d.created_at ? new Date(d.created_at) : null

      const tPrep = listo && creado ? Math.round((listo - creado) / 60000) : null
      const tRec = recogido && listo ? Math.round((recogido - listo) / 60000) : null
      const tEnt = entregado && recogido ? Math.round((entregado - recogido) / 60000) : null
      const tTot = entregado && creado ? Math.round((entregado - creado) / 60000) : null

      rows.push({
        detalleId: d.id,
        ordenId: o.id,
        mesa: o.mesa || '—',
        producto: d.producto_nombre || d.nombre || 'Producto',
        tiempoPreparacion: tPrep,
        tiempoRecogida: tRec,
        tiempoEntrega: tEnt,
        tiempoTotal: tTot,
      })
    })
  })
  return rows.sort((a, b) => (a.ordenId - b.ordenId))
})

const kpiTiempoRecogidaPromedio = computed(() => {
  const vals = kpiDetallesConTiempos.value.map(r => r.tiempoRecogida).filter(v => v !== null)
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
})

const kpiTiempoEntregaPromedio = computed(() => {
  const vals = kpiDetallesConTiempos.value.map(r => r.tiempoEntrega).filter(v => v !== null)
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
})

const kpiTiempoTotalPromedio = computed(() => {
  const vals = kpiDetallesConTiempos.value.map(r => r.tiempoTotal).filter(v => v !== null)
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
})

const kpiTotalOrdenesHoy = computed(() => {
  const hoy = new Date().toLocaleDateString('en-CA')
  return ordenes.value.filter(o => o.created_at?.substring(0, 10) === hoy).length
})

const kpiPendientesRecoger = computed(() => {
  return kpiDetallesConTiempos.value.filter(d => d.tiempoPreparacion !== null && d.tiempoRecogida === null).length
})

const kpiPendientesEntregar = computed(() => {
  return kpiDetallesConTiempos.value.filter(d => d.tiempoRecogida !== null && d.tiempoEntrega === null).length
})

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
  if (e.key === 'restaurante_id_activo') {
    restauranteActivo.value = e.newValue
  }
  if (e.key === 'restaurante_nombre_activo') {
    restauranteNombre.value = e.newValue || ''
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
  try {
    const data = await apiClient.get('/me')
    const ra = data.data?.restaurante_activo || data.restaurante_activo
    if (ra) {
      const id = typeof ra === 'object' ? ra.id : ra
      const nombre = typeof ra === 'object' ? (ra.nombre || ra.nombre_corto || '') : ''
      restauranteActivo.value = id
      if (nombre) {
        restauranteNombre.value = nombre
        localStorage.setItem('restaurante_nombre_activo', nombre)
      }
    }
  } catch {}

  // Recordatorio cada 60s
  recordatorioTimer = setInterval(recordarMesasInactivas, 60000)

  // Iniciar un único polling silencioso de seguridad
  const poll = async () => {
    if (cajaAbierta.value) {
      await Promise.all([
        cargarOrdenes(true),
        cargarProductos(true),
      ])
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
</script>

<style scoped>
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-slide-in { animation: slideIn 0.3s ease-out; }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-bounce { animation: bounce 2s infinite; }
@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
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
.animate-slide-up { animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* ── Animación llamativa al cancelar orden ── */
@keyframes cancelBurst {
  0%   { opacity: 0; transform: scale(0.3) rotate(-10deg); }
  40%  { opacity: 1; transform: scale(1.15) rotate(3deg); }
  70%  { transform: scale(0.95) rotate(-1deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
.animate-cancel-burst {
  animation: cancelBurst 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes cancelIcon {
  0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
  60%  { transform: scale(1.3) rotate(15deg); opacity: 1; }
  80%  { transform: scale(0.9) rotate(-5deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
.animate-cancel-icon {
  animation: cancelIcon 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  filter: drop-shadow(0 0 30px rgba(239, 68, 68, 0.6));
}

@keyframes cancelText {
  0%   { opacity: 0; transform: translateY(20px) scale(0.8); letter-spacing: 10px; }
  100% { opacity: 1; transform: translateY(0) scale(1); letter-spacing: 4px; }
}
.animate-cancel-text {
  animation: cancelText 0.4s ease-out 0.2s forwards;
  opacity: 0;
}

@keyframes cancelParticle {
  0%   { opacity: 0; transform: translateY(0) scale(0); }
  50%  { opacity: 1; transform: translateY(-20px) scale(1.5); }
  100% { opacity: 0; transform: translateY(-40px) scale(0); }
}
.animate-cancel-particle {
  animation: cancelParticle 0.8s ease-out forwards;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
