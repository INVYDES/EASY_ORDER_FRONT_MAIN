<template>
  <div class="p-4 sm:p-6 space-y-5 min-h-screen bg-slate-50/50">

    <!-- ══ TOASTS ══ -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px] max-w-sm animate-slide-in',
          toast.type==='success' ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800' :
          toast.type==='error'   ? 'bg-red-50 border-l-4 border-red-500 text-red-800'             :
          toast.type==='warning' ? 'bg-amber-50 border-l-4 border-amber-500 text-amber-800'       :
          'bg-blue-50 border-l-4 border-blue-500 text-blue-800']">
        <span>{{ toast.type==='success' ? '✅' : toast.type==='error' ? '❌' : toast.type==='warning' ? '⚠️' : 'ℹ️' }}</span>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600">×</button>
      </div>
    </div>

    <!-- ══ MODAL: Orden existente encontrada ══ -->
    <div v-if="ordenExistente" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-slide-in">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">🔔</div>
          <div>
            <h3 class="font-black text-slate-800">Mesa {{ nuevaOrden.mesa }} tiene orden abierta</h3>
            <p class="text-xs text-slate-400 font-medium">{{ ordenExistente.folio }} · {{ ordenExistente.detalles?.length || 0 }} producto(s)</p>
          </div>
        </div>

        <!-- Productos ya en la orden -->
        <div class="bg-slate-50 rounded-xl p-4 mb-5 space-y-1.5 max-h-40 overflow-y-auto">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Productos actuales</p>
          <div v-for="d in ordenExistente.detalles" :key="d.id" class="flex justify-between text-xs font-bold text-slate-600">
            <span class="text-sm font-black text-gray-800">{{ d.cantidad }}× {{ d.producto_nombre || d.nombre || (typeof d.producto === 'string' ? d.producto : d.producto?.nombre) || 'Producto' }}</span>
            <span class="text-slate-400">${{ Number(d.subtotal || 0).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Productos nuevos a agregar -->
        <div class="bg-indigo-50 rounded-xl p-4 mb-5 space-y-1.5">
          <p class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Productos a agregar</p>
          <div v-for="item in carrito" :key="item.id + item.tipo" class="flex justify-between text-xs font-bold text-indigo-700">
            <span>{{ item.cantidad }}× {{ item.nombre }}</span>
            <span>${{ Number(item.precio * item.cantidad).toFixed(2) }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button @click="ordenExistente = null"
            class="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition">
            Cancelar
          </button>
          <button @click="confirmarAgregarAOrden"
            :disabled="creando"
            class="flex-1 py-2.5 text-sm font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
            {{ creando ? 'Agregando...' : '➕ Agregar al ticket' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ CARGANDO CAJA ══ -->
    <div v-if="loadingCaja" class="flex flex-col items-center justify-center min-h-[70vh] gap-3">
      <div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-gray-400 text-sm font-medium">Sincronizando con el sistema...</p>
    </div>

    <!-- ══ CAJA CERRADA ══ -->
    <div v-else-if="!cajaAbierta" class="flex flex-col items-center justify-center min-h-[70vh] text-center gap-5">
      <div class="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center text-5xl shadow-sm">🔒</div>
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Caja cerrada</h2>
        <p class="text-gray-400 text-sm mt-2 max-w-xs">No se pueden registrar órdenes mientras la caja esté cerrada.</p>
      </div>
      <button @click="verificarCaja" class="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">🔄 Verificar estado</button>
    </div>

    <!-- ══ CONTENIDO PRINCIPAL ══ -->
    <template v-else>
      <!-- Marquesina de Anuncios General -->
      <div class="rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-6">
        <Marquesitawidget 
          :apiUrl="API_URL" 
          :getHeaders="() => ({})" 
          tipo="interno" 
          :variant="marquesinaVariant" 
        />
      </div>

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <!-- Izquierda: Título y Fecha -->
        <div class="shrink-0">
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Órdenes del día</h1>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{{ fechaHoy }}</p>
        </div>

        <!-- Centro: Indicadores de tiempo estimados por estación -->
        <div class="flex flex-wrap items-center justify-center gap-3 flex-1">
          <!-- Cocina -->
          <div class="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50/80 border border-amber-100/80 rounded-2xl shadow-sm hover:scale-105 transition-transform duration-200">
            <span class="text-lg animate-bounce inline-block" style="animation-duration: 2s;">🍳</span>
            <div>
              <p class="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none">Cocina</p>
              <p class="text-sm font-black text-amber-800 mt-1">{{ formatTiempo(tiempoCocinaActual) }}</p>
            </div>
          </div>

          <!-- Barra -->
          <div class="flex items-center gap-2.5 px-4 py-2.5 bg-indigo-50/80 border border-indigo-100/80 rounded-2xl shadow-sm hover:scale-105 transition-transform duration-200">
            <span class="text-lg animate-bounce inline-block" style="animation-duration: 2.2s;">🍹</span>
            <div>
              <p class="text-[8px] font-black text-indigo-500 uppercase tracking-widest leading-none">Barra</p>
              <p class="text-sm font-black text-indigo-800 mt-1">{{ formatTiempo(tiempoBarraActual) }}</p>
            </div>
          </div>

          <!-- Postres -->
          <div class="flex items-center gap-2.5 px-4 py-2.5 bg-rose-50/80 border border-rose-100/80 rounded-2xl shadow-sm hover:scale-105 transition-transform duration-200">
            <span class="text-lg animate-bounce inline-block" style="animation-duration: 2.4s;">🍰</span>
            <div>
              <p class="text-[8px] font-black text-rose-500 uppercase tracking-widest leading-none">Postres</p>
              <p class="text-sm font-black text-rose-800 mt-1">{{ formatTiempo(tiempoPostresActual) }}</p>
            </div>
          </div>
        </div>

        <!-- Derecha: Botón de Nueva Orden e Indicador de Caja -->
        <div class="flex items-center gap-3 shrink-0 self-end md:self-auto">
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-[10px] font-black uppercase">Caja abierta</span>
          </div>
          <button
            :disabled="esAdminOPropietario"
            @click="abrirMapaMesas"
            :class="['flex items-center gap-2 px-5 py-3.5 text-sm font-bold rounded-2xl transition shadow-lg active:scale-95',
                     esAdminOPropietario ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100']"
          >
            <span class="text-lg leading-none">🗺️</span>
            Ver Mapa de Mesas
          </button>
        </div>
      </div>

      <!-- ══ VISTA LISTADO ══ -->
      <div v-if="vistaActual === 'ordenes'">
        <div class="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
          <button v-for="tab in tabsVisibles" :key="tab.key" @click="tabActivo = tab.key"
            :class="['flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all border shrink-0',
              tabActivo === tab.key ? 'text-white border-transparent shadow-md scale-105' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 shadow-sm']"
            :style="tabActivo === tab.key ? { backgroundColor: tab.color } : {}">
            <span>{{ tab.icon }}</span> {{ tab.label.toUpperCase() }}
            <span class="px-1.5 py-0.5 rounded-lg text-[10px]"
              :class="tabActivo === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'">
              {{ contarOrdenes(tab.key) }}
            </span>
          </button>
        </div>

        <!-- Tab Cobrar -->
        <div v-if="tabActivo === 'cobrar'" class="animate-fade-in space-y-4">
          <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 min-h-[500px]">
            <CajaTicketGrid
              type="open"
              :orders="ordenesParaCobrar"
              :servicio-rapido="isServicioRapido"
              @order-paid="handleOrderPaid"
              @refresh="cargarOrdenes"
            />
          </div>
        </div>

        <div v-else>
          <div v-if="loading" class="flex flex-col items-center justify-center py-32 gap-3">
            <div class="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-slate-400 text-sm">Actualizando órdenes...</p>
          </div>

          <div v-else-if="subOrdenesFiltradas.length === 0" class="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
            <span class="text-6xl block mb-4 opacity-20">{{ tabActual?.icon }}</span>
            <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Sin órdenes en {{ tabActual?.label }}</p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-in">
            <div v-for="sub in subOrdenesFiltradas" :key="sub.uid"
              class="bg-white rounded-[2rem] border shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
              :class="borderColor(sub.estado_estacion)">

              <div class="px-5 py-4 flex items-center justify-between" :class="bgEstado(sub.estado_estacion)">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center text-xl shadow-sm group-hover:rotate-12 transition-transform">
                    {{ iconEstado(sub.estado_estacion) }}
                  </div>
                  <div>
                    <p class="text-xs font-black text-slate-400 uppercase tracking-tighter">Orden</p>
                    <div class="flex items-center gap-2 mt-0.5">
                      <p class="text-base font-black text-slate-800 leading-none">{{ sub.folio || '#'+sub.id }}</p>
                      <button 
                        v-if="['ENTREGADA', 'ABIERTA'].includes(sub.estado_estacion) && !['CERRADA','CANCELADA','PAGADA'].includes(sub.estado)" 
                        @click.stop="prepararEdicionOrden(sub)" 
                        title="Agregar productos / comensales"
                        class="w-6 h-6 rounded-lg bg-white/90 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 flex items-center justify-center text-[10px] shadow-sm hover:scale-110 active:scale-95 transition-all duration-200"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                </div>
                <span class="text-[10px] font-black px-3 py-1.5 rounded-xl border" :class="badgeEstado(sub.estado_estacion)">
                  {{ labelEstado(sub.estado_estacion).toUpperCase() }}
                </span>
              </div>

              <div class="px-5 py-5 flex-1 space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-lg">👤</span>
                    <span class="font-black text-indigo-700 truncate text-sm">{{ getNombreMostrable(sub) }}</span>
                  </div>
                  <div v-if="sub.mesa" class="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black">
                    MESA {{ sub.mesa }}
                  </div>
                </div>
                <div class="space-y-4">
                  <div v-for="(detalles, nomComensal) in agruparPorComensal(sub.detalles_estacion)" :key="nomComensal"
                    class="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    
                    <!-- Encabezado del Comensal -->
                    <div class="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100">
                      <span class="text-[10px]">👤</span>
                      <span class="text-[10px] font-black text-indigo-600 uppercase tracking-tight">{{ nomComensal }}</span>
                      <span v-if="calcularTiempoSubOrdenComensal(detalles) >= 0 && detalles.length > 0" class="text-[9px] text-slate-500 font-bold ml-auto">⏱️ {{ calcularTiempoSubOrdenComensal(detalles) }} min</span>
                    </div>

                    <!-- Lista de Productos -->
                    <div class="space-y-2">
                      <div v-for="detalle in detalles" :key="detalle.id"
                        :class="['flex flex-col gap-1.5 p-2 rounded-xl border shadow-sm group/item transition-all', 
                                detalle.cancelado ? 'bg-red-50/50 border-red-100 opacity-80' : 'bg-white border-slate-50']">
                        
                        <div class="flex items-center justify-between gap-2">
                          <div class="min-w-0 flex-1">
                            <p class="text-[11px] font-black leading-tight uppercase truncate"
                               :class="detalle.cancelado ? 'text-red-400 line-through' : 'text-slate-700'">
                              {{ detalle.cantidad }}× {{ getNombreDetalleConTamano(detalle) }}
                            </p>
                            <!-- Leyenda de cancelado -->
                            <p v-if="detalle.cancelado" class="text-[9px] font-black uppercase tracking-widest text-red-600 mt-0.5">
                              🚫 Cancelado: {{ detalle.motivo_cancelacion }}
                            </p>
                            <!-- Notas del producto (solo si no está cancelado para no saturar) -->
                            <p v-else-if="detalle.notas" class="text-[9px] text-amber-600 font-bold italic mt-0.5">
                              "{{ detalle.notas }}"
                            </p>
                          </div>

                          <!-- Acciones rápidas (Solo si no está cancelado y la orden está ABIERTA) -->
                          <div v-if="!detalle.cancelado && sub.estado_estacion === 'ABIERTA' && detalle.estado_preparacion === 'ABIERTA' && !esAdminOPropietario" class="flex items-center gap-2">
                            <button @click="abrirEditorNotas(detalle, sub.id)" class="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100 active:scale-90 transition-all">
                              <span class="text-base">📝</span>
                            </button>
                            <button @click="eliminarProductoDeOrden(detalle.id, sub.id)" class="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 shadow-sm border border-red-100 active:scale-90 transition-all">
                              <span class="text-base">🗑️</span>
                            </button>
                          </div>

                          <!-- Badge de estado para informativos -->
                          <div v-else class="flex items-center">
                            <span v-if="detalle.cancelado" class="text-[8px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-lg uppercase">Anulado</span>
                            <span v-else-if="detalle.estado_preparacion === 'LISTO'" class="text-[10px] font-black text-white bg-emerald-500 px-3 py-1 rounded-xl shadow-sm">LISTO</span>
                            <span v-else-if="detalle.estado_preparacion === 'ENTREGADO'" class="text-emerald-500 text-sm">●</span>
                          </div>
                        </div>

                        <!-- Controles de Cantidad (Solo en ABIERTAS y no cancelados) -->
                        <div v-if="sub.estado_estacion === 'ABIERTA' && detalle.estado_preparacion === 'ABIERTA' && !detalle.cancelado && !esAdminOPropietario" class="flex items-center justify-end gap-4 pt-2 border-t border-slate-100">
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-auto">Cantidad:</span>
                          <div class="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-100">
                            <span class="text-sm font-black text-slate-800 min-w-[20px] text-center">{{ detalle.cantidad }}</span>
                            <button @click="actualizarCantidadItem(detalle, sub.id, 1)" class="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-indigo-600 font-black text-base shadow-sm active:scale-90 transition-all">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="px-5 pb-5">
                <button
                  v-if="(tabActivo !== 'todas' || sub.estado_estacion === 'ABIERTA') && siguienteEstado(sub.estado_estacion)"
                  @click="sub.estado_estacion === 'LISTA' ? entregarProductosSubOrden(sub) : cambiarEstadoSubOrden(sub, siguienteEstado(sub.estado_estacion))"
                  :disabled="cambiando === sub.uid || esAdminOPropietario"
                  class="w-full py-3.5 text-xs font-black rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                  :class="esAdminOPropietario ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : btnEstado(sub.estado_estacion)">
                  {{ esAdminOPropietario ? '🚫 Acciones Bloqueadas' : (cambiando === sub.uid ? 'PROCESANDO...' : accionEstado(sub.estado_estacion)) }}
                </button>
                <div v-else class="w-full py-3.5 text-[10px] font-black text-center rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 uppercase tracking-widest">
                  {{ sub.estado_estacion === 'ENTREGADA' ? '✓ Entregado' : sub.estado_estacion === 'CERRADA' ? '🔒 Cobrada' : sub.estado_estacion === 'CANCELADA' ? '🚫 Cancelada' : 'En proceso' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ VISTA MAPA DE MESAS ══ -->
      <div v-else-if="vistaActual === 'mesas'" class="animate-fade-in space-y-6">
        <div class="flex items-center justify-between gap-3 mb-6 bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div>
            <h2 class="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>🗺️</span> Mesas del restaurante
            </h2>
            <p class="text-xs text-slate-400 font-bold mt-1">Selecciona una mesa para tomar un pedido o ver su orden activa</p>
          </div>
          <button @click="vistaActual = 'ordenes'" 
            class="px-5 py-3 text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition flex items-center gap-2 active:scale-95 shadow-sm">
            📋 Ver órdenes
          </button>
        </div>

        <!-- Indicadores de estado de Mesa -->
        <div class="flex justify-end gap-4 text-xs font-black text-slate-600 px-4">
          <div class="flex items-center gap-2">
            <span class="w-3.5 h-3.5 rounded-full bg-emerald-100 border border-emerald-300"></span>
            <span>Libre / Disponible</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3.5 h-3.5 rounded-full bg-amber-100 border border-amber-300"></span>
            <span>Ocupada / Orden Abierta</span>
          </div>
        </div>

        <!-- Contenedor del mapa de mesas -->
        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sm:p-8">
          <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Mapa de Mesas</h3>
          
          <div v-if="mesasFiltradas.length === 0" class="text-center py-12 text-slate-400 font-bold italic text-sm">
            No tienes mesas asignadas actualmente.
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            <button v-for="m in mesasFiltradas" :key="m"
              type="button"
              @click="seleccionarMesaDesdeMapa(m)"
              class="aspect-square rounded-3xl border-2 p-4 transition-all duration-200 active:scale-95 flex flex-col justify-between items-center group relative overflow-hidden"
              :class="mesaConOrden(m) 
                ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400 text-amber-900 shadow-md shadow-amber-50' 
                : 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-400 text-emerald-900 shadow-md shadow-emerald-50'">
              
              <div class="text-xs font-black text-slate-400 uppercase tracking-wider">Mesa</div>
              <div class="text-3xl font-black">{{ m }}</div>
              
              <div class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                :class="mesaConOrden(m) ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">
                {{ mesaConOrden(m) ? 'Ocupada' : 'Disponible' }}
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- ══ VISTA NUEVA ORDEN ══ -->
      <div v-else-if="vistaActual === 'nueva'" class="animate-fade-in">
        <div class="flex items-center justify-between gap-3 mb-6">
          <div class="flex items-center gap-3">
            <button @click="vistaActual = 'mesas'" class="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center transition hover:bg-slate-50 text-slate-600 font-bold">←</button>
            <h2 class="text-xl font-black text-slate-800">Nueva Orden</h2>
          </div>
          <!-- Botón fijo para ver el pedido actual en tablets y móviles -->
          <button 
            type="button"
            @click="showCarritoFlotante = true" 
            class="lg:hidden flex items-center gap-2.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md transition active:scale-95 border border-indigo-500 font-black text-xs uppercase tracking-wider animate-fade-in"
          >
            <span>🛒 Ver Pedido</span>
            <span class="bg-indigo-800 text-white px-2 py-0.5 rounded-full text-[10px] font-black">{{ carrito.length }}</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Formulario y Catálogo -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div v-if="!nuevaOrden.mesa" class="grid grid-cols-1 gap-6">
                <div>
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Número de Mesa
                    <!-- Indicador: mesa tiene orden abierta -->
                    <span v-if="mesaTieneOrdenAbierta" class="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg text-[9px] normal-case font-black">
                      ⚠️ Tiene orden abierta
                    </span>
                  </label>
                  <select v-if="esMesero && mesasAsignadas.length > 0" v-model="nuevaOrden.mesa"
                    class="w-full px-4 py-3.5 border border-slate-100 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-bold"
                    :class="mesaTieneOrdenAbierta ? 'border-amber-300 bg-amber-50' : ''">
                    <option :value="null">Selecciona una mesa</option>
                    <option v-for="m in mesasAsignadas" :key="m" :value="m">
                      Mesa {{ m }}{{ mesaConOrden(m) ? ' ⚠️ orden abierta' : '' }}
                    </option>
                  </select>
                  <select v-else v-model="nuevaOrden.mesa"
                    class="w-full px-4 py-3.5 border border-slate-100 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-bold"
                    :class="mesaTieneOrdenAbierta ? 'border-amber-300 bg-amber-50' : ''">
                    <option :value="null">Selecciona una mesa</option>
                    <option v-for="n in totalMesasRestaurante" :key="n" :value="n">
                      Mesa {{ n }}{{ mesaConOrden(n) ? ' ⚠️ abierta' : '' }}
                    </option>
                    <option v-if="totalMesasRestaurante === 0" disabled>No hay mesas configuradas</option>
                  </select>

                  <!-- Aviso inline si la mesa tiene orden abierta -->
                  <div v-if="mesaTieneOrdenAbierta" class="mt-2 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <span class="text-amber-500 text-sm mt-0.5">ℹ️</span>
                    <p class="text-xs text-amber-700 font-bold">
                      La mesa {{ nuevaOrden.mesa }} ya tiene una orden abierta ({{ ordenAbiertaMesa?.folio }}).
                      Al confirmar, los productos se <strong>agregarán al ticket existente</strong>.
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="flex flex-col sm:flex-row items-center gap-4 justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg">🍽️</div>
                  <div>
                    <h3 class="font-black text-slate-800 text-sm">Mesa Seleccionada: #{{ nuevaOrden.mesa }}</h3>
                    <p class="text-[10px] text-slate-400 font-bold mt-0.5">
                      {{ mesaTieneOrdenAbierta ? '⚠️ Tiene orden abierta - se agregará al ticket existente' : '✅ Mesa Libre - nueva orden' }}
                    </p>
                  </div>
                </div>
                <button type="button" @click="nuevaOrden.mesa = null; vistaActual = 'mesas'" class="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-black rounded-xl transition active:scale-95 shadow-sm">
                  🔄 Cambiar Mesa
                </button>
              </div>
            </div>

            <!-- Catálogo -->
            <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div class="p-6 border-b border-slate-50 space-y-4">
                <!-- Fila 1: Pestañas y Buscador -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <!-- Pestañas -->
                  <div class="flex bg-slate-100 p-1.5 rounded-2xl w-fit shrink-0 flex-wrap gap-1">
                    <button @click="subTabActiva = 'alimentos'"
                      type="button"
                      :class="['px-4 py-2 text-[10px] font-black rounded-xl transition-all tracking-widest relative',
                        subTabActiva === 'alimentos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600']">
                      🍽️ ALIMENTOS
                      <span v-if="tieneProductoNuevoHoy" class="absolute top-1 right-1 flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    </button>
                    <button @click="subTabActiva = 'bebidas'"
                      type="button"
                      :class="['px-4 py-2 text-[10px] font-black rounded-xl transition-all tracking-widest relative',
                        subTabActiva === 'bebidas' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600']">
                      🍹 BEBIDAS
                    </button>
                    <button @click="subTabActiva = 'postres'"
                      type="button"
                      :class="['px-4 py-2 text-[10px] font-black rounded-xl transition-all tracking-widest relative',
                        subTabActiva === 'postres' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600']">
                      🍰 POSTRES
                    </button>
                    <button @click="subTabActiva = 'paquetes'"
                      type="button"
                      :class="['px-4 py-2 text-[10px] font-black rounded-xl transition-all tracking-widest relative',
                        subTabActiva === 'paquetes' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600']">
                      🎁 PAQUETES
                      <span v-if="tienePaqueteNuevoHoy" class="absolute top-1 right-1 flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    </button>
                  </div>

                  <!-- Buscador -->
                  <div class="relative w-full sm:max-w-xs">
                    <input v-model="busqueda" type="text"
                      :placeholder="'Buscar en ' + (subTabActiva !== 'paquetes' ? 'productos...' : 'paquetes...')"
                      class="w-full pl-11 pr-4 py-3 border border-slate-100 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-medium" />
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
                  </div>
                </div>

                <!-- Fila 2: Paginación -->
                <div v-if="subTabActiva !== 'paquetes' && totalPaginasProductos > 1" class="flex justify-center border-t border-slate-100/50 pt-4 animate-fade-in">
                  <div class="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                    <button
                      type="button"
                      :disabled="paginaProductos === 1"
                      @click="paginaProductos--"
                      class="w-8 h-8 rounded-xl border border-slate-100 hover:border-slate-200 bg-white text-slate-500 disabled:opacity-40 transition active:scale-95 shadow-sm flex items-center justify-center font-bold text-xs"
                    >
                      ←
                    </button>
                    <div class="flex items-center gap-1">
                      <button
                        v-for="page in totalPaginasProductos"
                        :key="page"
                        type="button"
                        @click="paginaProductos = page"
                        :class="[
                          'w-8 h-8 rounded-xl text-[10px] font-black transition flex items-center justify-center shadow-sm',
                          paginaProductos === page ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-200'
                        ]"
                      >
                        {{ page }}
                      </button>
                    </div>
                    <button
                      type="button"
                      :disabled="paginaProductos === totalPaginasProductos"
                      @click="paginaProductos++"
                      class="w-8 h-8 rounded-xl border border-slate-100 hover:border-slate-200 bg-white text-slate-500 disabled:opacity-40 transition active:scale-95 shadow-sm flex items-center justify-center font-bold text-xs"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              <div class="p-4 min-h-[450px]">
                <div v-if="loadingProductos" class="flex flex-col items-center justify-center py-24 text-slate-300 italic">
                  <div class="w-10 h-10 border-4 border-slate-50 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p class="text-sm font-bold uppercase tracking-widest">Sincronizando menú...</p>
                </div>

                <template v-else-if="subTabActiva === 'alimentos' || subTabActiva === 'bebidas' || subTabActiva === 'postres'">
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[750px] overflow-y-auto p-2 custom-scrollbar animate-fade-in">
                    <div v-if="productosFiltrados.length === 0" class="col-span-full py-24 text-center text-slate-300">
                      <p class="text-sm font-bold italic uppercase">No hay productos que coincidan</p>
                    </div>
                    <button v-for="p in productosFiltrados" :key="'p-'+p.id" 
                      @click="agregarAlCarrito(p, 'producto')"
                      :disabled="p.stock !== undefined && p.stock !== null && totalEnCarritoPorId(p.id) >= p.stock"
                      class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group p-1 disabled:opacity-50 disabled:pointer-events-none disabled:grayscale relative">
                      
                      <!-- Product Image Container -->
                      <div class="w-full h-32 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center relative shadow-sm border border-slate-100/50">
                        <img v-if="p.imagen_url" :src="resolveImageUrl(p.imagen_url)" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span v-else class="text-3xl">🍽️</span>
                        
                        <!-- Agotado Overlay -->
                        <div v-if="p.stock !== undefined && p.stock !== null && totalEnCarritoPorId(p.id) >= p.stock" class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center text-red-500 font-black text-xs uppercase tracking-widest z-10">Agotado</div>
                        
                        <!-- Indicador de cantidad agregada -->
                        <div v-if="totalEnCarritoPorId(p.id) > 0" class="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-black w-6.5 h-6.5 rounded-full flex items-center justify-center shadow-md border-2 border-white animate-pop z-20">
                          {{ totalEnCarritoPorId(p.id) }}
                        </div>
                      </div>

                      <!-- Product Card Body -->
                      <div class="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p class="font-black text-slate-800 text-sm leading-tight uppercase line-clamp-2">{{ p.nombre }}</p>
                          <div class="flex items-center justify-between mt-1">
                            <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest">{{ p.categoria?.nombre || 'General' }}</p>
                            <div v-if="p.tamanos && p.tamanos.length > 0" class="flex gap-1">
                              <span v-for="t in p.tamanos" :key="t.id" class="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase">
                                {{ (t.nombre || '').charAt(0) }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-50">
                          <span class="font-black text-sm text-slate-900">{{ getPrecioRango(p) }}</span>
                          <div class="w-7 h-7 rounded-xl flex items-center justify-center text-sm font-bold transition shadow-sm bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white">
                            +
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </template>

                <div v-else-if="subTabActiva === 'paquetes'" class="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[750px] overflow-y-auto p-2 custom-scrollbar animate-fade-in">
                  <div v-if="paquetesFiltrados.length === 0" class="col-span-full py-24 text-center text-slate-300">
                    <p class="text-sm font-bold italic uppercase">No hay paquetes disponibles ahora</p>
                  </div>
                  <button v-for="paq in paquetesFiltrados" :key="'paq-'+paq.id" @click="agregarAlCarrito(paq, 'paquete')"
                    :disabled="paq.stock !== undefined && paq.stock !== null && totalEnCarritoPorPaqueteId(paq.id) >= paq.stock"
                    class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group p-1 disabled:opacity-50 disabled:pointer-events-none disabled:grayscale relative">
                    
                    <!-- Package Image Container -->
                    <div class="w-full h-32 rounded-2xl overflow-hidden bg-indigo-50 flex items-center justify-center relative shadow-sm border border-indigo-100/50">
                      <img v-if="paq.imagen_url" :src="resolveImageUrl(paq.imagen_url)" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span v-else class="text-3xl">🎁</span>
                      <div class="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-xl shadow-sm z-20">COMBO</div>
                      
                      <!-- Agotado Overlay -->
                      <div v-if="paq.stock !== undefined && paq.stock !== null && totalEnCarritoPorPaqueteId(paq.id) >= paq.stock" class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center text-red-500 font-black text-xs uppercase tracking-widest z-10">Agotado</div>
                      
                      <!-- Indicador de cantidad agregada -->
                      <div v-if="totalEnCarritoPorPaqueteId(paq.id) > 0" class="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-black w-6.5 h-6.5 rounded-full flex items-center justify-center shadow-md border-2 border-white animate-pop z-20">
                        {{ totalEnCarritoPorPaqueteId(paq.id) }}
                      </div>
                    </div>

                    <!-- Package Card Body -->
                    <div class="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <p class="font-black text-slate-800 text-sm leading-tight uppercase line-clamp-2">{{ paq.nombre }}</p>
                        <p class="text-[9px] text-indigo-500 font-black uppercase mt-1 tracking-tighter">✨ Promoción Especial</p>
                      </div>
                      <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-50">
                        <span class="font-black text-sm text-indigo-600">${{ Number(paq.precio).toFixed(2) }}</span>
                        <div class="w-7 h-7 rounded-xl flex items-center justify-center text-sm font-bold transition shadow-sm bg-indigo-600 text-white group-hover:scale-110">
                          +
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Carrito -->
          <div class="hidden lg:block lg:col-span-1">
            <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden sticky top-6">
              <div class="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 class="font-black text-xs tracking-widest uppercase opacity-60">Resumen</h3>
                  <p class="text-lg font-black leading-none mt-1">PEDIDO ACTUAL</p>
                </div>
                <div class="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center font-black text-sm">
                  {{ carrito.length }}
                </div>
              </div>

              <!-- Banner: se agregará a orden existente -->
              <div v-if="mesaTieneOrdenAbierta" class="px-6 pt-4">
                <div class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span class="text-amber-500">⚡</span>
                  <p class="text-xs font-black text-amber-700">Se añadirán a {{ ordenAbiertaMesa?.folio }}</p>
                </div>
              </div>

              <div class="p-6">
                <div class="animate-fade-in">
                  <div class="space-y-4 mb-8 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                    <div v-for="(nombre, cIdx) in comensalesNombres" :key="cIdx" 
                         class="overflow-hidden transition-all duration-300"
                         :class="comensalesNombres.length > 1 ? (comensalActivoIndex === cIdx ? 'border-2 border-indigo-500 shadow-md shadow-indigo-100 rounded-3xl' : 'border-2 border-slate-100 rounded-3xl') : ''">
                      
                      <!-- Box Header -->
                      <div v-if="comensalesNombres.length > 1" class="bg-slate-50 p-3 flex justify-between items-center cursor-pointer" @click="comensalActivoIndex = cIdx">
                        <div class="flex items-center gap-2">
                           <span class="text-lg">{{ comensalActivoIndex === cIdx ? '👤' : '👥' }}</span>
                           <div class="flex flex-col">
                             <input v-model="comensalesNombres[cIdx]" @click.stop class="bg-transparent font-black text-sm text-slate-800 outline-none w-32 border-b border-transparent focus:border-indigo-300 transition-colors" />
                             <span v-if="tiempoPorComensal(cIdx) > 0" class="text-[10px] font-bold text-slate-500 mt-0.5">⏱️ Tiempo est: {{ tiempoPorComensal(cIdx) }} min</span>
                           </div>
                        </div>
                        <span v-if="comensalActivoIndex === cIdx" class="text-[10px] font-black text-white bg-indigo-500 px-2 py-0.5 rounded-lg uppercase tracking-widest shadow-sm">Activo</span>
                        <span v-else class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inactivo</span>
                      </div>

                      <!-- Box Items -->
                      <div class="p-3 space-y-3 bg-white">
                        <div v-if="getItemsForComensal(cIdx).length === 0" class="text-center py-6 text-slate-300 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                          CAJA VACÍA
                        </div>
                        <div v-for="item in getItemsForComensal(cIdx)" :key="item.cartId" class="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-indigo-200 group transition-all">
                          <div class="flex justify-between items-start gap-3 mb-2">
                            <div class="flex items-center gap-2 min-w-0">
                              <span class="text-lg bg-white w-7 h-7 rounded-lg flex items-center justify-center shadow-sm">{{ item.tipo === 'paquete' ? '🎁' : '🍽️' }}</span>
                              <p class="text-[11px] font-black text-slate-800 truncate leading-tight uppercase">{{ item.nombre }} {{ item.tamano_nombre ? '(' + item.tamano_nombre + ')' : '' }}</p>
                            </div>
                            <button @click="eliminarDelCarrito(item.cartId)" class="text-slate-300 hover:text-red-500 transition-colors">✕</button>
                          </div>
                          <div class="mb-3">
                            <input v-model="item.notas" type="text" placeholder="Notas (Ej: Sin cebolla)" class="w-full px-3 py-1.5 text-[10px] font-bold border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                          </div>
                          <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-100">
                              <button @click="decrementar(item.cartId)" class="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-md text-slate-400 hover:text-red-500 transition-colors font-black">−</button>
                              <span class="text-[10px] font-black w-4 text-center text-slate-700">{{ item.cantidad }}</span>
                              <button @click="incrementar(item.cartId)"
                                :disabled="(item.tipo === 'producto' && item.stock_maximo !== undefined && item.stock_maximo !== null && totalEnCarritoPorId(item.id) >= item.stock_maximo) || (item.tipo === 'paquete' && item.stock_maximo !== undefined && item.stock_maximo !== null && totalEnCarritoPorPaqueteId(item.id) >= item.stock_maximo)"
                                class="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors font-black disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                            </div>
                            <span class="font-black text-xs text-slate-900">${{ Number(item.precio * item.cantidad).toFixed(2) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-3 pt-6 border-t border-slate-100">
                    <div class="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span>${{ Number(totalCarrito).toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between items-end">
                      <span class="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Total Final</span>
                      <span class="text-2xl font-black text-indigo-600 leading-none">${{ Number(totalCarrito).toFixed(2) }}</span>
                    </div>
                  </div>

                  <button @click="crearOrden" :disabled="creando || !nuevaOrden.mesa || esAdminOPropietario"
                    class="w-full py-4 font-black rounded-2xl mt-8 disabled:opacity-50 disabled:grayscale shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs text-white"
                    :class="esAdminOPropietario ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : (mesaTieneOrdenAbierta ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100')">
                    <template v-if="creando">
                      <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Enviando...
                    </template>
                    <template v-else>
                      {{ esAdminOPropietario ? '🚫 PEDIDO BLOQUEADO' : (mesaTieneOrdenAbierta ? '➕ AGREGAR AL TICKET' : 'CONFIRMAR ORDEN 🚀') }}
                    </template>
                  </button>
                  <p v-if="!nuevaOrden.mesa" class="text-[9px] text-center text-red-500 font-black mt-3 uppercase tracking-tighter animate-pulse">⚠️ Debes indicar el número de mesa</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sliding Cart Drawer (for tablets & mobile) -->
          <div v-if="showCarritoFlotante" class="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-end animate-fade-in" @click.self="showCarritoFlotante = false">
            <div class="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left overflow-hidden">
              <!-- Header -->
              <div class="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div>
                  <h3 class="font-black text-xs tracking-widest uppercase opacity-60">Resumen</h3>
                  <p class="text-lg font-black leading-none mt-1">PEDIDO ACTUAL</p>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center font-black text-sm">
                    {{ carrito.length }}
                  </div>
                  <button @click="showCarritoFlotante = false" class="text-white hover:text-slate-300 text-xl font-bold p-1">✕</button>
                </div>
              </div>

              <!-- Banner: se agregará a orden existente -->
              <div v-if="mesaTieneOrdenAbierta" class="px-6 pt-4 shrink-0">
                <div class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span class="text-amber-500">⚡</span>
                  <p class="text-xs font-black text-amber-700">Se añadirán a {{ ordenAbiertaMesa?.folio }}</p>
                </div>
              </div>

              <!-- Cuerpo del pedido -->
              <div class="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div class="space-y-4 mb-8">
                  <div v-for="(nombre, cIdx) in comensalesNombres" :key="'flo-'+cIdx" 
                       class="overflow-hidden transition-all duration-300"
                       :class="comensalesNombres.length > 1 ? (comensalActivoIndex === cIdx ? 'border-2 border-indigo-500 shadow-md shadow-indigo-100 rounded-3xl' : 'border-2 border-slate-100 rounded-3xl') : ''">
                    
                    <!-- Box Header -->
                    <div v-if="comensalesNombres.length > 1" class="bg-slate-50 p-3 flex justify-between items-center cursor-pointer" @click="comensalActivoIndex = cIdx">
                      <div class="flex items-center gap-2">
                         <span class="text-lg">{{ comensalActivoIndex === cIdx ? '👤' : '👥' }}</span>
                         <div class="flex flex-col">
                           <input v-model="comensalesNombres[cIdx]" @click.stop class="bg-transparent font-black text-sm text-slate-800 outline-none w-32 border-b border-transparent focus:border-indigo-300 transition-colors" />
                           <span v-if="tiempoPorComensal(cIdx) > 0" class="text-[10px] font-bold text-slate-500 mt-0.5">⏱️ Tiempo est: {{ tiempoPorComensal(cIdx) }} min</span>
                         </div>
                      </div>
                      <span v-if="comensalActivoIndex === cIdx" class="text-[10px] font-black text-white bg-indigo-500 px-2 py-0.5 rounded-lg uppercase tracking-widest shadow-sm">Activo</span>
                      <span v-else class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inactivo</span>
                    </div>

                    <!-- Box Items -->
                    <div class="p-3 space-y-3 bg-white">
                      <div v-if="getItemsForComensal(cIdx).length === 0" class="text-center py-6 text-slate-300 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                        CAJA VACÍA
                      </div>
                      <div v-for="item in getItemsForComensal(cIdx)" :key="'flo-'+item.cartId" class="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-indigo-200 group transition-all">
                        <div class="flex justify-between items-start gap-3 mb-2">
                          <div class="flex items-center gap-2 min-w-0">
                            <span class="text-lg bg-white w-7 h-7 rounded-lg flex items-center justify-center shadow-sm">{{ item.tipo === 'paquete' ? '🎁' : '🍽️' }}</span>
                            <p class="text-[11px] font-black text-slate-800 truncate leading-tight uppercase">{{ item.nombre }}</p>
                          </div>
                          <button @click="eliminarDelCarrito(item.cartId)" class="text-slate-300 hover:text-red-500 transition-colors">✕</button>
                        </div>
                        <div class="mb-3">
                          <input v-model="item.notas" type="text" placeholder="Notas (Ej: Sin cebolla)" class="w-full px-3 py-1.5 text-[10px] font-bold border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                        </div>
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-100">
                            <button @click="decrementar(item.cartId)" class="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-md text-slate-400 hover:text-red-500 transition-colors font-black">−</button>
                            <span class="text-[10px] font-black w-4 text-center text-slate-700">{{ item.cantidad }}</span>
                            <button @click="incrementar(item.cartId)"
                              :disabled="(item.tipo === 'producto' && item.stock_maximo !== undefined && item.stock_maximo !== null && totalEnCarritoPorId(item.id) >= item.stock_maximo) || (item.tipo === 'paquete' && item.stock_maximo !== undefined && item.stock_maximo !== null && totalEnCarritoPorPaqueteId(item.id) >= item.stock_maximo)"
                              class="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors font-black disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                          </div>
                          <span class="font-black text-xs text-slate-900">${{ Number(item.precio * item.cantidad).toFixed(2) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="space-y-3 pt-6 border-t border-slate-100">
                  <div class="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>${{ Number(totalCarrito).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between items-end">
                    <span class="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Total Final</span>
                    <span class="text-2xl font-black text-indigo-600 leading-none">${{ Number(totalCarrito).toFixed(2) }}</span>
                  </div>
                </div>

                <button @click="crearOrden(); showCarritoFlotante = false" :disabled="creando || !nuevaOrden.mesa || esAdminOPropietario"
                  class="w-full py-4 font-black rounded-2xl mt-8 disabled:opacity-50 disabled:grayscale shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs text-white"
                  :class="esAdminOPropietario ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : (mesaTieneOrdenAbierta ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100')">
                  <template v-if="creando">
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Enviando...
                  </template>
                  <template v-else>
                    {{ esAdminOPropietario ? '🚫 PEDIDO BLOQUEADO' : (mesaTieneOrdenAbierta ? '➕ AGREGAR AL TICKET' : 'CONFIRMAR ORDEN 🚀') }}
                  </template>
                </button>
                <p v-if="!nuevaOrden.mesa" class="text-[9px] text-center text-red-500 font-black mt-3 uppercase tracking-tighter animate-pulse">⚠️ Debes indicar el número de mesa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ══ MODAL: EDITAR NOTAS ══ -->
    <div v-if="editorNotas.visible" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4">
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in border border-slate-100">
        <div class="p-6 bg-slate-50 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📝</span>
            <div>
              <h3 class="font-black text-slate-800 text-sm">Editar notas</h3>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ editorNotas.detalle?.producto_nombre || 'Producto' }}</p>
            </div>
          </div>
        </div>
        <div class="p-6">
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Instrucciones especiales</label>
          <textarea v-model="editorNotas.nota" rows="3" 
            class="w-full px-4 py-3.5 border border-slate-100 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-bold"
            placeholder="Ej: Sin cebolla, extra picante..."></textarea>
        </div>
        <div class="p-6 bg-slate-50 flex gap-3">
          <button @click="editorNotas.visible = false" 
            class="flex-1 py-3 text-xs font-black text-slate-400 hover:text-slate-600 transition uppercase tracking-widest">
            Cancelar
          </button>
          <button @click="guardarNota" 
            class="flex-1 py-3 text-xs font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 uppercase tracking-widest">
            Guardar
          </button>
        </div>
      </div>
    </div>
    <!-- ══ MODAL: CANCELACIÓN CON MOTIVO ══ -->
    <div v-if="cancelacionModal.visible" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4" @click.self="cancelacionModal.visible = false">
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in border border-slate-100">
        <div class="p-6 bg-red-50 border-b border-red-100">
          <div class="flex items-center gap-3">
            <span class="text-2xl">⚠️</span>
            <div>
              <h3 class="font-black text-red-800 text-sm">Motivo de cancelación</h3>
              <p class="text-[10px] font-bold text-red-400 uppercase tracking-widest">Se requiere registrar el motivo</p>
            </div>
          </div>
        </div>
        <div class="p-6">
          <!-- Selector de Cantidad a Cancelar (solo si max > 1) -->
          <div v-if="cancelacionModal.cantidadMaxima > 1" class="mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center">Cantidad a Cancelar</label>
            <div class="flex items-center justify-center gap-4">
              <button @click="cancelacionModal.cantidadCancelar > 1 ? cancelacionModal.cantidadCancelar-- : null"
                class="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-black transition active:scale-95 text-sm">
                −
              </button>
              <span class="text-lg font-black text-slate-800 w-12 text-center">{{ cancelacionModal.cantidadCancelar }}</span>
              <button @click="cancelacionModal.cantidadCancelar < cancelacionModal.cantidadMaxima ? cancelacionModal.cantidadCancelar++ : null"
                class="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-indigo-600 hover:bg-indigo-50 font-black transition active:scale-95 text-sm">
                +
              </button>
            </div>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center mt-1">De un total de {{ cancelacionModal.cantidadMaxima }} unidades</p>
          </div>

          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">¿Por qué se cancela este producto?</label>
          <div class="grid grid-cols-1 gap-2 mb-4">
            <button v-for="m in ['Platillo equivocado', 'Pelo/Objeto extraño', 'Mal sabor/Crudo', 'Tardanza excesiva', 'Cliente se arrepintió']" :key="m"
              @click="cancelacionModal.motivo = m"
              :class="['px-4 py-2.5 rounded-xl text-xs font-bold transition text-left', 
                cancelacionModal.motivo === m ? 'bg-red-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100']">
              {{ m }}
            </button>
          </div>
          <textarea v-model="cancelacionModal.motivo" rows="2" 
            class="w-full px-4 py-3.5 border border-slate-100 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-red-500/10 outline-none transition font-bold"
            placeholder="Escribe otro motivo..."></textarea>
        </div>
        <div class="p-6 bg-slate-50 flex gap-3">
          <button @click="cancelacionModal.visible = false" 
            class="flex-1 py-3 text-xs font-black text-slate-400 hover:text-slate-600 transition uppercase tracking-widest">
            Cerrar
          </button>
          <button @click="confirmarCancelacion" :disabled="!cancelacionModal.motivo || creando"
            class="flex-1 py-3 text-xs font-black text-white bg-red-600 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-100 uppercase tracking-widest disabled:opacity-50">
            {{ creando ? 'Cancelando...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Tamaño del Producto -->
    <div v-if="showTamanoModal && productoTamanoSeleccionar" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 class="text-base font-black text-slate-800 uppercase tracking-wide">{{ productoTamanoSeleccionar.nombre }}</h3>
            <p class="text-xs font-semibold text-slate-400 mt-0.5">Selecciona el tamaño deseado</p>
          </div>
          <button @click="showTamanoModal = false" class="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm font-bold">✕</button>
        </div>

        <div class="space-y-2.5 my-5">
          <button v-for="tam in (productoTamanoSeleccionar?.tamanos || [])" :key="tam.id"
            @click="tam.stock !== undefined && tam.stock !== null && Number(tam.stock) <= 0 ? null : tamanoSeleccionadoModal = tam"
            :disabled="tam.stock !== undefined && tam.stock !== null && Number(tam.stock) <= 0"
            type="button"
            class="flex items-center justify-between w-full p-4 rounded-2xl border-2 transition-all cursor-pointer text-left disabled:opacity-40 disabled:cursor-not-allowed"
            :class="tamanoSeleccionadoModal?.id === tam.id ? 'border-blue-600 bg-blue-50/30 text-blue-700 shadow-sm' : 'border-slate-100 bg-slate-50/50 text-slate-700 hover:border-slate-200'">
            <div class="flex items-center">
              <span class="w-9 h-9 rounded-full bg-blue-100/80 text-blue-700 font-black flex items-center justify-center text-sm uppercase mr-3">
                {{ (tam.nombre || '').charAt(0).toUpperCase() }}
              </span>
              <div class="flex flex-col">
                <span class="font-black text-sm uppercase tracking-wide">{{ tam.nombre }}</span>
                <span v-if="tam.stock !== undefined && tam.stock !== null && Number(tam.stock) <= 0" class="text-[10px] text-red-500 font-black uppercase tracking-widest">Agotado</span>
              </div>
            </div>
            <span class="font-black text-base text-slate-900">${{ Number(tam.precio || 0).toFixed(2) }}</span>
          </button>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button @click="showTamanoModal = false" type="button"
            class="flex-1 py-3.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl transition">
            Cancelar
          </button>
          <button @click="confirmarAgregarTamanoAlCarrito" type="button"
            :disabled="!tamanoSeleccionadoModal || (tamanoSeleccionadoModal.stock !== undefined && tamanoSeleccionadoModal.stock !== null && Number(tamanoSeleccionadoModal.stock) <= 0)"
            class="flex-1 py-3.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-200 transition disabled:opacity-50">
            Agregar ${{ tamanoSeleccionadoModal ? Number(tamanoSeleccionadoModal.precio || 0).toFixed(2) : '0.00' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { API_URL, STORAGE_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'
import CajaTicketGrid from '../components/caja/cajatiketgrid.vue'
import Marquesitawidget from '../components/Marquesitawidget.vue'
import { useRestauranteChannel } from '../composables/useRestauranteChannel'

const vistaActual  = ref('ordenes')
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
const mesasAsignadas  = ref([])
const restauranteActivo = ref(localStorage.getItem('restaurante_id_activo'))
const totalMesasRestaurante = ref(0)
const ultimaActualizacion = ref(null)

const POLL_INTERVAL = 15000 // Fluidez total (15s) + WS

const getNombreDetalleConTamano = (d) => {
  if (!d) return 'Producto'
  const baseName = d.producto_nombre || d.nombre || (typeof d.producto === 'string' ? d.producto : d.producto?.nombre) || 'Producto'
  const tamName = d.tamano_nombre || (typeof d.producto === 'object' ? d.producto?.tamano_nombre : '')
  if (tamName && !baseName.toLowerCase().includes(tamName.toLowerCase())) {
    return `${baseName} (${tamName})`
  }
  return baseName
}


const cancelacionModal = ref({ visible: false, detalleId: null, ordenId: null, motivo: '', cantidadMaxima: 1, cantidadCancelar: 1 })

// ── NUEVO: estado para orden existente de la mesa ──────────────────────────
const ordenExistente = ref(null)   // se muestra el modal de confirmación

// ── ESTADO DE COMENSALES ───────────────────────────────────────────────────
const numeroComensales    = ref(1)
const comensalesNombres   = ref(['General'])
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

const mesasFiltradas = computed(() => {
  if (esMesero.value && mesasAsignadas.value.length > 0) {
    return mesasAsignadas.value
  }
  const count = totalMesasRestaurante.value || 0
  return Array.from({ length: count }, (_, i) => i + 1)
})

const abrirMapaMesas = () => {
  nuevaOrden.value = { clienteId: null, mesa: null }
  carrito.value = []
  vistaActual.value = 'mesas'
}

const seleccionarMesaDesdeMapa = (m) => {
  nuevaOrden.value.mesa = m
  carrito.value = []
  vistaActual.value = 'nueva'
}

const BEBIDA_KEYWORDS = ['coca','pepsi','fanta','sprite','jugo','refresco','bebida','cerveza','agua','trago','coctel','limonada','naranjada']


let pollTimer = null
let pollingEnProgreso = false

const restauranteObjeto = ref(null)
const isServicioRapido = computed(() => {
  if (restauranteObjeto.value?.servicio_rapido !== undefined) {
    return !!restauranteObjeto.value.servicio_rapido
  }
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    if (u?.restaurante_activo && typeof u.restaurante_activo === 'object') {
      return !!u.restaurante_activo.servicio_rapido
    }
  } catch {}
  return false
})

const tabs = [
  { key: 'todas',          label: 'Todas',          icon: '📋', color: '#6366f1' },
  { key: 'ABIERTA',        label: 'Nuevas',          icon: '📝', color: '#fcd34d' },
  { key: 'POR_PREPARAR',   label: 'Por preparar',    icon: '🟡', color: '#f59e0b' },
  { key: 'EN_PREPARACION', label: 'En preparación',  icon: '🔥', color: '#f97316' },
  { key: 'LISTA',          label: 'Listas',          icon: '✅', color: '#10b981' },
  { key: 'ENTREGADA',      label: 'Entregadas',      icon: '🏁', color: '#8b5cf6' },
  { key: 'cobrar',         label: 'Cobrar',          icon: '💵', color: '#10b981' },
]

const tabsVisibles = computed(() => {
  if (isServicioRapido.value) {
    return tabs.filter(t => !['POR_PREPARAR', 'LISTA'].includes(t.key))
  }
  return tabs
})

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
const itemsPorPagina = 9

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

const productosFiltrados = computed(() => {
  const start = (paginaProductos.value - 1) * itemsPorPagina
  return productosFiltradosBase.value.slice(start, start + itemsPorPagina)
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
const bgEstado    = (e) => ['POR_PREPARAR','EN_PREPARACION','LISTA'].includes(e) ? 'bg-slate-50' : ({ ABIERTA:'bg-yellow-50', ENTREGADA:'bg-purple-50', CERRADA:'bg-slate-50', CANCELADA:'bg-red-50' }[e] || 'bg-slate-50')
const borderColor = (e) => ['POR_PREPARAR','EN_PREPARACION','LISTA'].includes(e) ? 'border-slate-100' : ({ ABIERTA:'border-yellow-200', ENTREGADA:'border-purple-200', CERRADA:'border-slate-200', CANCELADA:'border-red-200' }[e] || 'border-slate-100')
const badgeEstado = (e) => ['POR_PREPARAR','EN_PREPARACION','LISTA'].includes(e) ? 'bg-slate-100 text-slate-500 border-slate-200' : ({ ABIERTA:'bg-yellow-100 text-yellow-700 border-yellow-200', ENTREGADA:'bg-purple-100 text-purple-700 border-purple-200', CERRADA:'bg-slate-200 text-slate-500 border-slate-300', CANCELADA:'bg-red-100 text-red-700 border-red-200' }[e] || 'bg-slate-100 text-slate-500')
const iconEstado  = (e) => ['POR_PREPARAR','EN_PREPARACION','LISTA'].includes(e) ? '🕒' : ({ ABIERTA:'📝', ENTREGADA:'🏁', CERRADA:'🔒', CANCELADA:'🚫' }[e] || '📋')
const labelEstado = (e) => ({ ABIERTA:'Abierta', POR_PREPARAR:'Esperando', EN_PREPARACION:'En Preparación', LISTA:'Lista', ENTREGADA:'Entregada', CERRADA:'Cobrada', CANCELADA:'Cancelada' }[e] || e)
const siguienteEstado = (e) => {
  if (isServicioRapido.value) {
    return { ABIERTA: 'EN_PREPARACION', EN_PREPARACION: 'ENTREGADA', LISTA: 'ENTREGADA' }[e] || null
  }
  return { ABIERTA: 'POR_PREPARAR', LISTA: 'ENTREGADA' }[e] || null
}

const accionEstado = (e) => {
  if (isServicioRapido.value) {
    return { ABIERTA: '🔥 Enviar a Preparación', EN_PREPARACION: '✅ Marcar Entregada', LISTA: '🤝 Entregada' }[e] || ''
  }
  return { ABIERTA: '▶ Enviar Pedido', LISTA: '🤝 Entregada' }[e] || ''
}

const btnEstado = (e) => {
  if (isServicioRapido.value) {
    return { ABIERTA: 'bg-orange-500 hover:bg-orange-600 text-white', EN_PREPARACION: 'bg-indigo-600 hover:bg-indigo-700 text-white', LISTA: 'bg-emerald-500 hover:bg-emerald-600 text-white' }[e] || 'bg-slate-100 text-slate-400'
  }
  return { ABIERTA: 'bg-amber-500 hover:bg-amber-600 text-white', LISTA: 'bg-emerald-500 hover:bg-emerald-600 text-white' }[e] || 'bg-slate-100 text-slate-400'
}

// ── API ────────────────────────────────────────────────────────────────────

const cargarOrdenes = async (silent = true) => {
  if (!silent) loading.value = true
  try {
    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    
    const states = ['ABIERTA','POR_PREPARAR','EN_PREPARACION','LISTA','ENTREGADA']
    const urls   = states.map(s => `/meseros/mis-ordenes?estado=${s}&per_page=100`)
    urls.push(`/meseros/mis-ordenes?fecha_desde=${today}&fecha_hasta=${today}&per_page=100`)
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
    if (i.tipo === 'producto') {
      item.producto_id = i.id
      if (i.tamano_id) {
        item.tamano_id = i.tamano_id
        item.tamano_nombre = i.tamano_nombre
      }
    }
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
      comensalesNombres.value   = ['General']
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
  
  // Forzamos un solo comensal General para evitar fragmentación de tickets
  comensalesNombres.value = ['General']
  numeroComensales.value = 1
  
  comensalActivoIndex.value = 0
  vistaActual.value = 'nueva'
}

const handleOrderPaid = async () => {
  showToast('Orden cobrada con éxito ✅', 'success')
  await cargarOrdenes()
  tabActivo.value = 'todas'
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

// ── Tamaños modal state ──
const showTamanoModal = ref(false)
const productoTamanoSeleccionar = ref(null)
const tamanoSeleccionadoModal = ref(null)

const abrirModalTamanos = (producto) => {
  productoTamanoSeleccionar.value = producto
  if (producto.tamanos && producto.tamanos.length > 0) {
    const disponible = producto.tamanos.find(t => t.stock === undefined || t.stock === null || Number(t.stock) > 0)
    tamanoSeleccionadoModal.value = disponible || null
  } else {
    tamanoSeleccionadoModal.value = null
  }
  showTamanoModal.value = true
}

const confirmarAgregarTamanoAlCarrito = () => {
  if (!productoTamanoSeleccionar.value || !tamanoSeleccionadoModal.value) return
  const prod = productoTamanoSeleccionar.value
  const tam = tamanoSeleccionadoModal.value

  const cIdx = comensalActivoIndex.value

  if (tam.stock !== undefined && tam.stock !== null) {
    const stockTam = Number(tam.stock)
    if (stockTam <= 0) {
      showToast(`El tamaño "${tam.nombre}" para "${prod.nombre}" está agotado`, 'error')
      return
    }
    const yaEnCarrito = carrito.value
      .filter(i => i.id === prod.id && i.tamano_id === tam.id)
      .reduce((sum, i) => sum + i.cantidad, 0)
    if (yaEnCarrito >= stockTam) {
      showToast(`No hay suficiente stock para "${prod.nombre} (${tam.nombre})". Límite: ${stockTam} uds`, 'error')
      return
    }
  }

  const e = carrito.value.find(i => i.id === prod.id && i.tamano_id === tam.id && i.comensalIndex === cIdx && !i.notas)
  if (e) {
    e.cantidad++
  } else {
    carrito.value.push({ 
      cartId: Date.now() + Math.random(),
      id: prod.id, 
      nombre: prod.nombre,
      tamano_id: tam.id,
      tamano_nombre: tam.nombre,
      precio: Number(tam.precio || 0), 
      cantidad: 1, 
      tipo: 'producto', 
      stock_maximo: tam.stock,
      notas: '', 
      comensalIndex: cIdx,
      minutos_produccion: parseFloat(prod.minutos_produccion || 0)
    })
  }

  showTamanoModal.value = false
  productoTamanoSeleccionar.value = null
  tamanoSeleccionadoModal.value = null
}

const agregarAlCarrito = (item, tipo) => {
  if (tipo === 'producto' && item.tamanos && item.tamanos.length > 0) {
    abrirModalTamanos(item)
    return
  }

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

const entregarProductosSubOrden = async (sub) => {
  const ids = sub.detalles_estacion.filter(d => (d.estado_preparacion || d.estado) === 'LISTO' && !d.cancelado).map(d => d.id)
  
  if (!ids.length) {
    // Si no hay productos "LISTOS" (por ej. fueron cancelados), forzamos avanzar la orden a ENTREGADA
    return cambiarEstadoSubOrden(sub, 'ENTREGADA');
  }

  cambiando.value = sub.uid
  try {
    const data = await apiClient.put(`/ordenes/${sub.id}/station-status`, { detalles: ids, estado_preparacion: 'ENTREGADO' })
    if (data.success || data.data) { await cargarOrdenes(); showToast('Pedido entregado ✨', 'success') }
  } finally { cambiando.value = null }
}

// ── Helpers ────────────────────────────────────────────────────────────────
const resolveImageUrl  = (path) => { if (!path) return null; if (path.startsWith('http')) return path; return `${STORAGE_URL}${path.replace(/^\/?storage\//, '')}` }
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
const getNombreMostrable = (o) => o.cliente?.nombre || o.cliente?.name || o.usuario?.name || o.user?.name || 'Comensal'
const showToast        = (m, t = 'info') => { const id = Date.now(); toasts.value.push({ id, message: m, type: t }); setTimeout(() => toasts.value = toasts.value.filter(x => x.id !== id), 3500) }
const removeToast      = (id) => { toasts.value = toasts.value.filter(t => t.id !== id) }

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
  try {
    const data = await apiClient.get('/me')
    const user = data.data || data
    const ra = user?.restaurante_activo
    if (ra) {
      if (typeof ra === 'object' && ra !== null) {
        restauranteActivo.value = ra.id
        restauranteObjeto.value = ra
      } else {
        restauranteActivo.value = ra
        apiClient.get(`/restaurantes/${ra}`).then(rData => {
          if (rData?.data) restauranteObjeto.value = rData.data
        }).catch(() => {})
      }
    }
  } catch {}

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
@keyframes pop {
  0% { transform: scale(0.6); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
.animate-pop {
  animation: pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
</style>