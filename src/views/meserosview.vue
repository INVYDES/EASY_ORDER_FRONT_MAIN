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
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Órdenes del día</h1>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{{ fechaHoy }}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-[10px] font-black uppercase">Caja abierta</span>
          </div>
          <button @click="vistaActual = 'nueva'" class="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-95">
            <span class="text-lg leading-none">＋</span> Nueva Orden
          </button>
        </div>
      </div>

      <!-- ══ VISTA LISTADO ══ -->
      <div v-if="vistaActual === 'ordenes'">
        <div class="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
          <button v-for="tab in tabs" :key="tab.key" @click="tabActivo = tab.key"
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
                    <p class="text-base font-black text-slate-800 leading-none">{{ sub.folio || '#'+sub.id }}</p>
                  </div>
                </div>
                <span class="text-[10px] font-black px-3 py-1.5 rounded-xl border" :class="badgeEstado(sub.estado_estacion)">
                  {{ ['ABIERTA','ENTREGADA','CERRADA'].includes(sub.estado_estacion) ? labelEstado(sub.estado_estacion).toUpperCase() : 'ESPERANDO...' }}
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
                              {{ detalle.cantidad }}× {{ detalle.producto_nombre || detalle.nombre || (typeof detalle.producto === 'string' ? detalle.producto : detalle.producto?.nombre) || 'Producto' }}
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

                          <!-- Acciones rápidas (Solo si no está cancelado y la orden no está cerrada) -->
                          <div v-if="!detalle.cancelado && !['CERRADA', 'PAGADA', 'CANCELADA'].includes(sub.estado_estacion)" class="flex items-center gap-2">
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
                        <div v-if="sub.estado_estacion === 'ABIERTA' && !detalle.cancelado" class="flex items-center justify-end gap-4 pt-2 border-t border-slate-100">
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-auto">Cantidad:</span>
                          <div class="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-100">
                            <button @click="actualizarCantidadItem(detalle, sub.id, -1)" class="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-400 hover:text-red-500 font-black text-base shadow-sm active:scale-90 transition-all">−</button>
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
                  :disabled="cambiando === sub.uid"
                  class="w-full py-3.5 text-xs font-black rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                  :class="btnEstado(sub.estado_estacion)">
                  {{ cambiando === sub.uid ? 'PROCESANDO...' : accionEstado(sub.estado_estacion) }}
                </button>
                <div v-else class="w-full py-3.5 text-[10px] font-black text-center rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 uppercase tracking-widest">
                  {{ sub.estado_estacion === 'ENTREGADA' ? '✓ Entregado' : sub.estado_estacion === 'CERRADA' ? '🔒 Cobrada' : 'En proceso' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ VISTA NUEVA ORDEN ══ -->
      <div v-else-if="vistaActual === 'nueva'" class="animate-fade-in">
        <div class="flex items-center gap-3 mb-6">
          <button @click="vistaActual = 'ordenes'" class="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center transition hover:bg-slate-50 text-slate-600 font-bold">←</button>
          <h2 class="text-xl font-black text-slate-800">Nueva Orden</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Formulario y Catálogo -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cliente (Opcional)</label>
                  <select v-model="nuevaOrden.clienteId" class="w-full px-4 py-3.5 border border-slate-100 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-bold">
                    <option :value="null">— Sin cliente registrado —</option>
                    <option v-for="c in clientes" :key="c.value" :value="c.value">{{ c.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Comensales</label>
                  <input v-model="numeroComensales" type="number" min="1" max="50" class="w-full px-4 py-3.5 border border-slate-100 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-bold" />
                </div>
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
            </div>

            <!-- Catálogo -->
            <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div class="p-6 border-b border-slate-50">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div class="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
                    <button @click="subTabActiva = 'productos'"
                      :class="['px-6 py-2.5 text-[10px] font-black rounded-xl transition-all tracking-widest',
                        subTabActiva === 'productos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600']">
                      🍽️ PRODUCTOS
                    </button>
                    <button @click="subTabActiva = 'paquetes'"
                      :class="['px-6 py-2.5 text-[10px] font-black rounded-xl transition-all tracking-widest',
                        subTabActiva === 'paquetes' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600']">
                      🎁 PAQUETES
                    </button>
                  </div>
                  <div class="relative flex-1 max-w-xs">
                    <input v-model="busqueda" type="text"
                      :placeholder="'Buscar en ' + (subTabActiva === 'productos' ? 'productos...' : 'paquetes...')"
                      class="w-full pl-11 pr-4 py-3 border border-slate-100 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-medium" />
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
                  </div>
                </div>
              </div>

              <div class="p-4 min-h-[450px]">
                <div v-if="loadingProductos" class="flex flex-col items-center justify-center py-24 text-slate-300 italic">
                  <div class="w-10 h-10 border-4 border-slate-50 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p class="text-sm font-bold uppercase tracking-widest">Sincronizando menú...</p>
                </div>

                <div v-else-if="subTabActiva === 'productos'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto p-2 custom-scrollbar animate-fade-in">
                  <div v-if="productosFiltrados.length === 0" class="col-span-full py-24 text-center text-slate-300">
                    <p class="text-sm font-bold italic uppercase">No hay productos que coincidan</p>
                  </div>
                  <button v-for="p in productosFiltrados" :key="'p-'+p.id" @click="agregarAlCarrito(p, 'producto')"
                    class="flex items-center gap-4 p-4 rounded-3xl transition-all text-left group hover:bg-slate-50 border border-transparent hover:border-slate-100 bg-white">
                    <div class="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                      <img v-if="p.imagen_url" :src="resolveImageUrl(p.imagen_url)" class="w-full h-full object-cover" />
                      <span v-else class="text-2xl">🍽️</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-black text-slate-800 text-sm truncate leading-tight">{{ p.nombre.toUpperCase() }}</p>
                      <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{{ p.categoria?.nombre || 'General' }}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-black text-sm text-slate-900">${{ Number(p.precio).toFixed(2) }}</p>
                      <span class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black opacity-0 group-hover:opacity-100 transition-all shadow-sm">+</span>
                    </div>
                  </button>
                </div>

                <div v-else-if="subTabActiva === 'paquetes'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto p-2 custom-scrollbar animate-fade-in">
                  <div v-if="paquetesFiltrados.length === 0" class="col-span-full py-24 text-center text-slate-300">
                    <p class="text-sm font-bold italic uppercase">No hay paquetes disponibles ahora</p>
                  </div>
                  <button v-for="paq in paquetesFiltrados" :key="'paq-'+paq.id" @click="agregarAlCarrito(paq, 'paquete')"
                    class="flex items-center gap-4 p-4 rounded-3xl transition-all text-left group hover:bg-indigo-50/50 border border-transparent hover:border-indigo-100 bg-white shadow-sm shadow-slate-100">
                    <div class="w-16 h-16 rounded-2xl overflow-hidden bg-indigo-50 shrink-0 flex items-center justify-center border border-indigo-100 shadow-sm relative group-hover:rotate-2 transition-transform">
                      <img v-if="paq.imagen_url" :src="resolveImageUrl(paq.imagen_url)" class="w-full h-full object-cover" />
                      <span v-else class="text-3xl">🎁</span>
                      <div class="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-xl shadow-sm">COMBO</div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-black text-slate-800 text-sm leading-tight uppercase tracking-tight">{{ paq.nombre }}</p>
                      <p class="text-[9px] text-indigo-500 font-black uppercase mt-1 tracking-tighter">✨ Promoción Especial</p>
                    </div>
                    <div class="text-right">
                      <p class="font-black text-sm text-indigo-600">${{ Number(paq.precio).toFixed(2) }}</p>
                      <span class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-indigo-200">+</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Carrito -->
          <div class="lg:col-span-1">
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
                <div v-if="carrito.length === 0" class="flex flex-col items-center justify-center py-20 text-center opacity-30">
                  <div class="text-5xl mb-4">🛒</div>
                  <p class="text-xs font-black uppercase tracking-widest">Carrito Vacío</p>
                </div>

                <div v-else class="animate-fade-in">
                  <div class="space-y-4 mb-8 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                    <div v-for="(nombre, cIdx) in comensalesNombres" :key="cIdx" 
                         class="border-2 rounded-3xl overflow-hidden transition-all duration-300"
                         :class="comensalActivoIndex === cIdx ? 'border-indigo-500 shadow-md shadow-indigo-100' : 'border-slate-100'">
                      
                      <!-- Box Header -->
                      <div class="bg-slate-50 p-3 flex justify-between items-center cursor-pointer" @click="comensalActivoIndex = cIdx">
                        <div class="flex items-center gap-2">
                           <span class="text-lg">{{ comensalActivoIndex === cIdx ? '👤' : '👥' }}</span>
                           <input v-model="comensalesNombres[cIdx]" @click.stop class="bg-transparent font-black text-sm text-slate-800 outline-none w-32 border-b border-transparent focus:border-indigo-300 transition-colors" />
                        </div>
                        <span v-if="comensalActivoIndex === cIdx" class="text-[10px] font-black text-white bg-indigo-500 px-2 py-0.5 rounded-lg uppercase tracking-widest shadow-sm">Activo</span>
                        <span v-else class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inactivo</span>
                      </div>

                      <!-- Box Items -->
                      <div class="p-3 space-y-3 bg-white">
                        <div v-if="getItemsForComensal(cIdx).length === 0" class="text-center py-4 text-slate-300 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-2xl">
                          Caja Vacía
                        </div>
                        <div v-for="item in getItemsForComensal(cIdx)" :key="item.cartId" class="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-indigo-200 group transition-all">
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
                              <button @click="incrementar(item.cartId)" class="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors font-black">+</button>
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

                  <button @click="crearOrden" :disabled="creando || !nuevaOrden.mesa"
                    class="w-full py-4 font-black rounded-2xl mt-8 disabled:opacity-50 disabled:grayscale shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs text-white"
                    :class="mesaTieneOrdenAbierta ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'">
                    <template v-if="creando">
                      <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Enviando...
                    </template>
                    <template v-else>
                      {{ mesaTieneOrdenAbierta ? '➕ AGREGAR AL TICKET' : 'CONFIRMAR ORDEN 🚀' }}
                    </template>
                  </button>
                  <p v-if="!nuevaOrden.mesa && carrito.length > 0" class="text-[9px] text-center text-red-500 font-black mt-3 uppercase tracking-tighter animate-pulse">⚠️ Debes indicar el número de mesa</p>
                </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { API_URL, STORAGE_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'
import CajaTicketGrid from '../components/caja/cajatiketgrid.vue'
import { useRestauranteChannel } from '../composables/useRestauranteChannel'

const vistaActual  = ref('ordenes')
const tabActivo    = ref('todas')
const subTabActiva = ref('productos')
const ordenes      = ref([])
const productos    = ref([])
const paquetes     = ref([])
const clientes     = ref([])
const carrito      = ref([])
const busqueda     = ref('')

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

const cancelacionModal = ref({ visible: false, detalleId: null, ordenId: null, motivo: '' })

// ── NUEVO: estado para orden existente de la mesa ──────────────────────────
const ordenExistente = ref(null)   // se muestra el modal de confirmación

// ── ESTADO DE COMENSALES ───────────────────────────────────────────────────
const numeroComensales    = ref(1)
const comensalesNombres   = ref(['Comensal 1'])
const comensalActivoIndex = ref(0)

watch(numeroComensales, (newVal) => {
  if (!newVal || newVal < 1) {
    numeroComensales.value = 1
    newVal = 1
  }
  const diff = newVal - comensalesNombres.value.length
  if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      comensalesNombres.value.push(`Comensal ${comensalesNombres.value.length + 1}`)
    }
  } else if (diff < 0) {
    comensalesNombres.value.splice(newVal)
    carrito.value.forEach(item => {
      if (item.comensalIndex >= newVal) item.comensalIndex = 0
    })
  }
  if (comensalActivoIndex.value >= newVal) {
    comensalActivoIndex.value = newVal - 1
  }
})

const getItemsForComensal = (cIdx) => carrito.value.filter(i => i.comensalIndex === cIdx)

const userRaw    = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'
const userActual = JSON.parse(userRaw)
const esMesero   = computed(() => {
  const roles = userActual.roles || []
  return roles.some(r => {
    if (typeof r === 'string') return r.toUpperCase() === 'MESERO'
    return r.id === 3 || r.id === '3' || r.nombre?.toUpperCase() === 'MESERO'
  })
})

const BEBIDA_KEYWORDS = ['coca','pepsi','fanta','sprite','jugo','refresco','bebida','cerveza','agua','trago','coctel','limonada','naranjada']

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

// ── Lógica de sub-órdenes (sin cambios) ────────────────────────────────────
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
const calcularEstadoEstacion = (detalles, estadoOrden) => {
  if (['ABIERTA', 'ENTREGADA', 'CERRADA', 'PAGADA', 'CANCELADA'].includes(estadoOrden)) return estadoOrden
  
  const validos = detalles?.filter(d => !d.cancelado) || []
  if (!validos.length) return 'ENTREGADA'
  
  const total      = validos.length
  const entregados = validos.filter(d => (d.estado_preparacion || d.estado) === 'ENTREGADO').length
  const listos     = validos.filter(d => (d.estado_preparacion || d.estado) === 'LISTO').length
  const enPrep     = validos.filter(d => (d.estado_preparacion || d.estado) === 'EN_PREPARACION').length
  
  if (entregados === total) return 'ENTREGADA'
  if (listos > 0) return 'LISTA'
  if (enPrep > 0) return 'EN_PREPARACION'
  return 'POR_PREPARAR'
}

const subOrdenes = computed(() => {
  const list = []
  ordenes.value.forEach(o => {
    const todos   = o.detalles || []
    const barra   = todos.filter(d => esBebida(d))
    const postres = todos.filter(d => esPostre(d) && !esBebida(d))
    const cocina  = todos.filter(d => !esBebida(d) && !esPostre(d))
    if (cocina.length)   list.push({ ...o, uid: `${o.id}-COCINA`,  detalles_estacion: cocina,  estado_estacion: calcularEstadoEstacion(cocina, o.estado) })
    if (barra.length)    list.push({ ...o, uid: `${o.id}-BARRA`,   detalles_estacion: barra,   estado_estacion: calcularEstadoEstacion(barra, o.estado) })
    if (postres.length)  list.push({ ...o, uid: `${o.id}-POSTRES`, detalles_estacion: postres, estado_estacion: calcularEstadoEstacion(postres, o.estado) })
  })
  return list
})

const subOrdenesFiltradas = computed(() => {
  if (tabActivo.value === 'cobrar') return []
  if (['todas','ABIERTA','ENTREGADA'].includes(tabActivo.value)) {
    return ordenes.value
      .filter(o => tabActivo.value === 'todas' ? true : o.estado === tabActivo.value)
      .map(o => ({ ...o, uid: `${o.id}-JOINT`, estado_estacion: o.estado, detalles_estacion: o.detalles || [] }))
  }
  return subOrdenes.value.filter(s => s.estado_estacion === tabActivo.value)
})

const ordenesParaCobrar = computed(() =>
  ordenes.value.filter(o => o.estado === 'ENTREGADA')
)

const contarOrdenes = (key) => {
  if (key === 'cobrar')   return ordenesParaCobrar.value.length
  if (key === 'todas')    return ordenes.value.length
  if (['ABIERTA','ENTREGADA'].includes(key)) return ordenes.value.filter(o => o.estado === key).length
  return subOrdenes.value.filter(s => s.estado_estacion === key).length
}

const tabActual      = computed(() => tabs.find(t => t.key === tabActivo.value))
const totalCarrito   = computed(() => carrito.value.reduce((s, i) => s + (i.precio * i.cantidad), 0))
const fechaHoy       = computed(() => new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
const productosFiltrados = computed(() => {
  const b = busqueda.value?.toLowerCase() || ''
  return b ? productos.value.filter(p => p.nombre.toLowerCase().includes(b)) : productos.value
})
const paquetesFiltrados = computed(() => {
  const b = busqueda.value?.toLowerCase() || ''
  return b ? paquetes.value.filter(p => p.nombre.toLowerCase().includes(b)) : paquetes.value
})

// ── Estilos ────────────────────────────────────────────────────────────────
const bgEstado    = (e) => ['POR_PREPARAR','EN_PREPARACION','LISTA'].includes(e) ? 'bg-slate-50' : ({ ABIERTA:'bg-yellow-50', ENTREGADA:'bg-purple-50', CERRADA:'bg-slate-50' }[e] || 'bg-slate-50')
const borderColor = (e) => ['POR_PREPARAR','EN_PREPARACION','LISTA'].includes(e) ? 'border-slate-100' : ({ ABIERTA:'border-yellow-200', ENTREGADA:'border-purple-200', CERRADA:'border-slate-200' }[e] || 'border-slate-100')
const badgeEstado = (e) => ['POR_PREPARAR','EN_PREPARACION','LISTA'].includes(e) ? 'bg-slate-100 text-slate-500 border-slate-200' : ({ ABIERTA:'bg-yellow-100 text-yellow-700 border-yellow-200', ENTREGADA:'bg-purple-100 text-purple-700 border-purple-200', CERRADA:'bg-slate-200 text-slate-500 border-slate-300' }[e] || 'bg-slate-100 text-slate-500')
const iconEstado  = (e) => ['POR_PREPARAR','EN_PREPARACION','LISTA'].includes(e) ? '🕒' : ({ ABIERTA:'📝', ENTREGADA:'🏁', CERRADA:'🔒' }[e] || '📋')
const labelEstado = (e) => ({ ABIERTA:'Abierta', POR_PREPARAR:'Esperando', EN_PREPARACION:'En Cocina', LISTA:'Lista', ENTREGADA:'Entregada', CERRADA:'Cobrada' }[e] || e)
const siguienteEstado = (e) => ({ ABIERTA:'POR_PREPARAR', LISTA:'ENTREGADA' }[e] || null)
const accionEstado    = (e) => ({ ABIERTA:'▶ Enviar Pedido', LISTA:'🤝 Entregada' }[e] || '')
const btnEstado       = (e) => ({ ABIERTA:'bg-amber-500 hover:bg-amber-600 text-white', LISTA:'bg-emerald-500 hover:bg-emerald-600 text-white' }[e] || 'bg-slate-100 text-slate-400')

// ── API ────────────────────────────────────────────────────────────────────

const cargarOrdenes = async () => {
  loading.value = true
  try {
    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    
    const states = ['ABIERTA','POR_PREPARAR','EN_PREPARACION','LISTA','ENTREGADA']
    const urls   = states.map(s => `/meseros/mis-ordenes?estado=${s}&per_page=100`)
    // Traer TODO el historial del día actual para no ocultar las canceladas o pagadas
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
  finally { loading.value = false }
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
      apiClient.get('/productos'),
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

const handleOrderPaid = async () => {
  showToast('Orden cobrada con éxito ✅', 'success')
  await cargarOrdenes()
  tabActivo.value = 'todas'
}

// ── Carrito ────────────────────────────────────────────────────────────────
const agregarAlCarrito = (item, tipo) => {
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
      notas: '', 
      comensalIndex: cIdx 
    })
  }
}
const incrementar        = (cartId) => { const i = carrito.value.find(x => x.cartId === cartId); if (i) i.cantidad++ }
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
  cancelacionModal.value = {
    visible: true,
    detalleId,
    ordenId,
    motivo: ''
  }
}

const confirmarCancelacion = async () => {
  const { detalleId, ordenId, motivo } = cancelacionModal.value
  if (!motivo) return
  
  creando.value = true
  try {
    const data = await apiClient.delete(`/ordenes/${ordenId}/detalles/${detalleId}?motivo=${encodeURIComponent(motivo)}`)
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
  const nuevaCantidad = detalle.cantidad + delta
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
const getNombreMostrable = (o) => o.cliente?.nombre || o.cliente?.name || o.usuario?.name || o.user?.name || 'Comensal'
const showToast        = (m, t = 'info') => { const id = Date.now(); toasts.value.push({ id, message: m, type: t }); setTimeout(() => toasts.value = toasts.value.filter(x => x.id !== id), 3500) }
const removeToast      = (id) => { toasts.value = toasts.value.filter(t => t.id !== id) }

onMounted(async () => {
  await verificarCaja()
  if (cajaAbierta.value) {
    await Promise.all([cargarOrdenes(), cargarProductos(), cargarClientes(), cargarCapacidadRestaurante()])
    if (esMesero.value) await cargarMisMesas()
  }
  
  // Sincronizar restaurante activo para WS si no estaba en localStorage
  if (!restauranteActivo.value) {
    try {
      const data = await apiClient.get('/me')
      const ra = data.data?.restaurante_activo || data.restaurante_activo
      restauranteActivo.value = typeof ra === 'object' ? ra.id : ra
    } catch {}
  }
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
</style>