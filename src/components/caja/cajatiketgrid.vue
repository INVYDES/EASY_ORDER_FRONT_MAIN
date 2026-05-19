<template>
  <div>
    <!-- ══ MODAL: COBRAR ORDEN ══ -->
    <div v-if="ordenCobrar" class="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" @click.self="ordenCobrar = null">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-black text-slate-800 text-lg">Cobrar orden</h3>
            <p class="text-xs text-slate-400 font-bold">{{ ordenCobrar.folio }} · Mesa {{ ordenCobrar.mesa || '—' }}</p>
          </div>
          <button @click="ordenCobrar = null" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">✕</button>
        </div>

        <div class="px-6 py-4 max-h-52 overflow-y-auto space-y-2">
          <div v-for="d in ordenCobrar.detalles" :key="d.id" 
            :class="['flex justify-between items-center text-sm font-bold p-2 rounded-xl group/item transition-all', 
                    d.cancelado ? 'bg-red-50 text-red-400 opacity-80' : 'bg-slate-50 text-slate-700']">
            <div class="flex-1">
              <span :class="{'line-through': d.cancelado}">
                {{ d.cantidad }}× {{ d.producto_nombre || d.nombre || (typeof d.producto === 'string' ? d.producto : d.producto?.nombre) || 'Producto' }}
              </span>
              <p v-if="d.cancelado" class="text-[9px] font-black uppercase tracking-widest text-red-600 mt-0.5">🚫 Cancelado: {{ d.motivo_cancelacion }}</p>
              <p v-else-if="d.notas" class="text-[10px] text-amber-600 italic leading-none mt-0.5">{{ d.notas }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span :class="{'line-through': d.cancelado}">
                ${{ Number(d.subtotal || 0).toFixed(2) }}
              </span>
              <button v-if="!d.cancelado && !esMesero" @click="eliminarProductoDeOrden(d.id, ordenCobrar.id)" 
                class="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 active:scale-95 transition-all">
                <span class="text-xs">🗑️</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Propina -->
        <div class="px-6 py-3 bg-slate-50 border-y border-slate-100">
          <div class="flex items-center justify-between gap-4">
            <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Propina</label>
            <div class="flex items-center gap-2">
              <button v-for="pct in [0, 10, 15, 20]" :key="pct"
                @click="propinaPct = pct; propinaManual = ''"
                :class="['px-3 py-1.5 rounded-xl text-xs font-black transition',
                  propinaPct === pct && !propinaManual ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200']">
                {{ pct === 0 ? 'Sin propina' : pct + '%' }}
              </button>
              <div class="relative">
                <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                <input v-model="propinaManual" @focus="propinaPct = null" type="number" min="0" placeholder="0"
                  class="w-20 pl-5 pr-2 py-1.5 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </div>
          <div class="flex justify-between text-xs font-black text-slate-500 mt-3">
            <span>Subtotal</span><span>${{ Number(ordenCobrar.total || 0).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-base font-black text-slate-800 mt-1">
            <span>Total con propina</span>
            <span class="text-indigo-600">${{ totalConPropina.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Método de pago -->
        <div class="px-6 py-4">
          <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Método de pago</p>
          <div class="grid grid-cols-3 gap-2 mb-5">
            <button v-for="m in metodos" :key="m.key"
              @click="metodoPago = m.key; montoRecibido = 0"
              :class="['flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 font-black text-xs transition',
                metodoPago === m.key ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300']">
              <span class="text-xl">{{ m.icon }}</span>{{ m.label }}
            </button>
          </div>

          <!-- Campos extras de pago -->
          <div v-if="metodoPago === 'efectivo'" class="mb-5">
            <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Monto recibido</label>
            <div class="relative mt-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input v-model.number="montoRecibido" type="number" min="0" placeholder="0.00"
                class="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div v-if="cambio > 0" class="flex justify-between items-center mt-2 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl">
              <span class="text-xs font-bold uppercase tracking-widest">Cambio a entregar</span>
              <span class="text-sm font-black">${{ cambio.toFixed(2) }}</span>
            </div>
            <div v-else-if="montoRecibido > 0 && montoRecibido < totalConPropina" class="flex justify-between items-center mt-2 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <span class="text-xs font-bold uppercase tracking-widest">Monto insuficiente</span>
              <span class="text-sm font-black">Faltan ${{ (totalConPropina - montoRecibido).toFixed(2) }}</span>
            </div>
          </div>
          
          <div v-if="metodoPago !== 'efectivo'" class="mb-5">
            <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Referencia / Folio <span class="text-red-500">*</span></label>
            <input v-model="folio" type="text" placeholder="Ej. REF123456"
              class="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div v-if="errorCobro" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
            {{ errorCobro }}
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-3">
            <button :disabled="esAdminOPropietario || Object.keys(itemsByComensal).length <= 1" @click="abrirDividirCuenta"
              class="flex-1 py-3 text-xs font-black text-slate-600 bg-slate-100 rounded-2xl hover:bg-slate-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
              :title="Object.keys(itemsByComensal).length <= 1 ? 'No se puede dividir una cuenta con un solo comensal' : ''">
              ✂️ Dividir cuenta
            </button>
            <button @click="cobrarOrden" :disabled="cobrando || !canPay || esAdminOPropietario"
              class="flex-1 py-3 text-xs font-black text-white bg-emerald-600 rounded-2xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              <div v-if="cobrando" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {{ cobrando ? 'Procesando...' : '💳 Cobrar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MODAL: DIVIDIR CUENTA ══ -->
    <div v-if="modalDividir" class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" @click.self="modalDividir = false">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 class="font-black text-slate-800 text-lg">✂️ Dividir cuenta</h3>
            <p class="text-xs text-slate-400 font-bold">{{ ordenCobrar?.folio }}</p>
          </div>
          <button @click="modalDividir = false" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
        </div>

        <!-- Modo único: Por Comensales -->
        <div class="px-6 pt-4 shrink-0">
          <div class="flex bg-indigo-50 p-3 rounded-2xl border border-indigo-100 items-center gap-3">
            <span class="text-xl">👤</span>
            <div>
              <p class="text-xs font-black text-indigo-700">División por Comensales</p>
              <p class="text-[10px] text-indigo-400 font-bold">Asigna cada comensal a un ticket individual</p>
            </div>
          </div>
        </div>


        <!-- Modo Por Comensales -->
        <div class="px-6 py-4 flex-1 overflow-y-auto">
          <div class="mb-4">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asignar comensales a tickets</p>
            <div class="space-y-3">
              <div v-for="c in comensalesAuto" :key="c.nombre" class="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 transition">
                <div class="flex-1">
                  <p class="text-sm font-black text-slate-800">{{ c.nombre }}</p>
                  <p class="text-[10px] font-bold text-slate-400">
                    {{ c.detalles.map(d => `${Number(d.cantidad)}x ${d.producto_nombre || d.nombre || (typeof d.producto === 'string' ? d.producto : d.producto?.nombre) || 'Producto'}`).join(', ') }}
                    - ${{ c.subtotal.toFixed(2) }}
                  </p>
                </div>
                <div>
                  <select v-model="c.ticketId" class="pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-black bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none text-indigo-700 shadow-sm">
                    <option v-for="n in comensalesAuto.length" :key="n" :value="n">Agrupar en Ticket {{ n }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Vista previa Tickets con Pago Individual -->
          <div class="mt-4 pt-4 border-t border-slate-100">
             <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detalle de Pago por Ticket</p>
             <div class="space-y-3">
               <div v-for="t in ticketsAgrupados" :key="t.id" class="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
                 <div class="flex justify-between items-center mb-3">
                   <div>
                     <p class="text-xs font-black text-indigo-800">Ticket {{ t.id }}</p>
                     <p class="text-[9px] font-bold text-indigo-500 mt-0.5 leading-tight">{{ t.nombres.join(', ') }}</p>
                   </div>
                   <div class="text-right">
                     <p class="text-[9px] text-indigo-400 font-bold mb-0.5 uppercase">Total + Propina</p>
                     <span class="font-black text-indigo-700 text-lg">${{ (t.total + (getPagoTicket(t.id).propina || 0)).toFixed(2) }}</span>
                   </div>
                 </div>

                 <!-- Selector de Pago para este Ticket -->
                 <div class="grid grid-cols-3 gap-1 mb-2">
                    <button v-for="m in metodos" :key="m.key" 
                      @click="setPagoTicket(t.id, m.key)"
                      :class="['py-1.5 rounded-xl border text-[10px] font-black transition flex items-center justify-center gap-1',
                        getPagoTicket(t.id).metodo === m.key ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200']">
                      <span>{{ m.icon }}</span> {{ m.label }}
                    </button>
                 </div>

                 <!-- Campos adicionales según método -->
                 <div class="mt-2 space-y-2">
                    <div>
                      <p class="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">Propina</p>
                      <div class="flex items-center gap-2">
                        <button v-for="pct in [0, 10, 15, 20]" :key="pct"
                          @click="setPropinaTicket(t.id, pct, t.total)"
                          :class="['px-2 py-1 rounded-lg text-[10px] font-black transition',
                            getPagoTicket(t.id).propinaPct === pct && !getPagoTicket(t.id).propinaManual ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200']">
                          {{ pct === 0 ? 'Sin' : pct + '%' }}
                        </button>
                        <div class="relative flex-1">
                          <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">$</span>
                          <input type="number" v-model.number="getPagoTicket(t.id).propina" 
                            @focus="getPagoTicket(t.id).propinaPct = null; getPagoTicket(t.id).propinaManual = true"
                            class="w-full pl-5 pr-2 py-1 text-[10px] font-black bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p class="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">{{ getPagoTicket(t.id).metodo === 'efectivo' ? 'Recibido' : 'Referencia' }}</p>
                      <div class="relative">
                        <span v-if="getPagoTicket(t.id).metodo === 'efectivo'" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">$</span>
                        <input v-if="getPagoTicket(t.id).metodo === 'efectivo'" type="number" v-model.number="getPagoTicket(t.id).recibido" 
                          class="w-full pl-6 pr-3 py-1.5 text-xs font-black bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20" />
                        <input v-else v-model="getPagoTicket(t.id).referencia" 
                          placeholder="Folio..."
                          class="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                    </div>
                 </div>

                 <!-- Cálculo de Cambio o Monto Insuficiente (solo efectivo) -->
                 <div v-if="getPagoTicket(t.id).metodo === 'efectivo' && getPagoTicket(t.id).recibido > 0">
                    <div v-if="getPagoTicket(t.id).recibido >= (t.total + (getPagoTicket(t.id).propina || 0))" class="mt-2 flex justify-between items-center px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span class="text-[10px] font-black text-emerald-700 uppercase">Cambio</span>
                      <span class="text-xs font-black text-emerald-700">${{ ((getPagoTicket(t.id).recibido || 0) - (t.total + (getPagoTicket(t.id).propina || 0))).toFixed(2) }}</span>
                    </div>
                    <div v-else class="mt-2 flex justify-between items-center px-3 py-1.5 bg-red-50 rounded-xl border border-red-200">
                      <span class="text-[10px] font-black text-red-700 uppercase">Monto Insuficiente</span>
                      <span class="text-xs font-black text-red-700">Faltan ${{ ((t.total + (getPagoTicket(t.id).propina || 0)) - (getPagoTicket(t.id).recibido || 0)).toFixed(2) }}</span>
                    </div>
                 </div>
               </div>
             </div>
          </div>
        </div>


        <div class="px-6 py-4 border-t border-slate-100 shrink-0">
          <div class="flex items-center justify-between mb-3 text-sm font-black text-slate-800">
            <span>Total a cobrar</span>
            <span class="text-indigo-700 text-base">${{ totalDivididoGeneral.toFixed(2) }}</span>
          </div>
          <div v-if="errorDividir" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
            {{ errorDividir }}
          </div>
          <button @click="cobrarDividido" :disabled="cobrando || !canPayDividido || esAdminOPropietario"
            class="w-full py-3.5 text-sm font-black text-white bg-emerald-600 rounded-2xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            <div v-if="cobrando" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {{ cobrando ? 'Procesando e Imprimiendo...' : `💳 Cobrar y Emitir ${ticketsAgrupados.length || numComensales} Tickets` }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ GRID DE TICKETS ══ -->
    <div v-if="filteredOrders.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <span class="text-5xl mb-4 opacity-20">{{ type === 'open' ? '🎫' : '🗂️' }}</span>
      <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">
        {{ type === 'open' ? 'Sin órdenes por cobrar' : 'Sin órdenes cerradas' }}
      </p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="order in filteredOrders" :key="order.id"
        class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">

        <!-- Header ticket -->
        <div class="px-5 py-4 flex items-center justify-between"
          :class="type === 'open' ? 'bg-emerald-50' : ((order.estado || '').toUpperCase() === 'CANCELADA' ? 'bg-red-50/50' : 'bg-slate-50')">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm"
              :class="type === 'open' ? 'bg-emerald-100' : ((order.estado || '').toUpperCase() === 'CANCELADA' ? 'bg-red-100' : 'bg-slate-100')">
              {{ type === 'open' ? '💳' : ((order.estado || '').toUpperCase() === 'CANCELADA' ? '🚫' : '✓') }}
            </div>
            <div>
              <p class="text-xs font-black text-slate-400 uppercase tracking-tighter">
                {{ type === 'open' ? 'Por cobrar' : ((order.estado || '').toUpperCase() === 'CANCELADA' ? 'Cancelada' : 'Cerrada') }}
              </p>
              <p class="text-base font-black text-slate-800 leading-none">{{ order.folio || '#' + order.id }}</p>
              <p v-if="type === 'open'" class="text-[10px] font-bold text-indigo-600 mt-1">Estado: {{ order.estado }}</p>
            </div>
          </div>
          <div v-if="order.mesa" class="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black">
            MESA {{ order.mesa }}
          </div>
        </div>

        <!-- Detalles -->
        <div class="px-5 py-4 space-y-3">
          <div class="space-y-1.5 bg-slate-50 rounded-2xl p-3">
            <div v-for="d in (order.detalles || [])" :key="d.id"
              class="flex justify-between items-center text-xs font-bold gap-2"
              :class="d.cancelado ? 'text-red-400 line-through' : 'text-slate-600'">
              <span class="truncate flex-1">
                {{ d.cantidad }}× {{ d.producto_nombre || d.nombre || (typeof d.producto === 'string' ? d.producto : d.producto?.nombre) || 'Producto' }}
                <span v-if="d.cancelado" class="text-[8px] no-underline inline-block bg-red-100 text-red-600 px-1 rounded ml-1">CANCELADO</span>
                <p v-else-if="d.notas" class="text-[9px] text-amber-600 italic leading-none mt-0.5">{{ d.notas }}</p>
              </span>
              <div class="flex items-center gap-2">
                <span class="text-slate-400">${{ Number(d.subtotal || 0).toFixed(2) }}</span>
                <!-- Botón eliminar producto en caja -->
                <button v-if="type === 'open' && !d.cancelado && !esMesero" @click.stop="eliminarProductoDeOrden(d.id, order.id)"
                  class="w-6 h-6 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 active:scale-95 transition-all"
                  title="Eliminar Producto">
                  <span class="text-[10px]">🗑️</span>
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-bold">
              {{ order.created_at_formateado || (order.created_at ? new Date(order.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '—') }}
            </span>
            <div class="flex items-center gap-1">
              <span v-if="order.propina && Number(order.propina) > 0" class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                +${{ Number(order.propina).toFixed(2) }} propina
              </span>
              <span v-if="order.metodo_pago" class="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg uppercase">
                {{ order.metodo_pago }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer ticket -->
        <div class="px-5 pb-5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs text-slate-500 font-black">Total</span>
            <span class="text-xl font-black text-slate-800">${{ Number(order.total || 0).toFixed(2) }}</span>
          </div>
          <button v-if="type === 'open'"
            :disabled="esAdminOPropietario"
            @click="abrirCobrar(order)"
            :class="['w-full py-3 text-xs font-black rounded-2xl transition shadow-lg active:scale-95',
                     esAdminOPropietario ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100']">
            {{ esAdminOPropietario ? '🚫 Cobros Bloqueados' : '💳 Cobrar orden' }}
          </button>
          <div v-else class="w-full py-2.5 text-center text-[10px] font-black rounded-2xl uppercase tracking-widest"
            :class="(order.estado || '').toUpperCase() === 'CANCELADA' ? 'text-red-500 bg-red-50 border border-red-100' : 'text-slate-400 bg-slate-50'">
            {{ (order.estado || '').toUpperCase() === 'CANCELADA' ? '🚫 Cancelada completamente' : `✓ Pagada · ${order.metodo_pago || 'efectivo'}` }}
          </div>
        </div>
      </div>
    </div>
    <div id="ticket-printable" class="hidden">
      <div v-if="ordenCobrar" style="width: 80mm; padding: 2mm; font-family: 'Courier New', Courier, monospace; color: #000; background: #fff;">
        <div style="text-align: center; margin-bottom: 4mm;">
          <h2 style="margin: 0; font-size: 16px; font-weight: bold; text-transform: uppercase;">{{ nombreSucursal }}</h2>
          <p v-if="datosSucursal.direccion && datosSucursal.direccion.trim().length > 2" style="margin: 2px 0; font-size: 10px; line-height: 1.2;">{{ datosSucursal.direccion }}</p>
          <p v-if="datosSucursal.telefono" style="margin: 2px 0; font-size: 10px;">TEL: {{ datosSucursal.telefono }}</p>
          <div style="border-bottom: 1px dashed #000; margin-top: 3mm; margin-bottom: 3mm;"></div>
          <p style="margin: 0; font-size: 12px; font-weight: bold;">Comprobante de Pago</p>
          <p style="margin: 2px 0; font-size: 10px;">{{ new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' }) }}</p>
        </div>
        <div style="font-size: 11px; margin-bottom: 3mm;">
          <div style="display: flex; justify-content: space-between;">
            <span><strong>Mesa:</strong> {{ ordenCobrar.mesa || 'N/A' }}</span>
            <span><strong>Folio:</strong> {{ uniqueIdentifier }}</span>
          </div>
          <p style="margin: 2px 0;"><strong>Atendió:</strong> {{ userName }}</p>
          <p style="margin: 2px 0;"><strong>Pago:</strong> {{ (metodoPago || 'EFECTIVO').toUpperCase() }}</p>
          <p v-if="folio && folio.trim()" style="margin: 2px 0;"><strong>Referencia:</strong> {{ folio.toUpperCase() }}</p>
        </div>
        <table style="width: 100%; font-size: 11px; border-collapse: collapse; margin-bottom: 4mm;">
          <thead>
            <tr style="border-top: 1px dashed #000; border-bottom: 1px dashed #000;">
              <th style="text-align: left; padding: 1.5mm 0; width: 10%;">CANT</th>
              <th style="text-align: left; padding: 1.5mm 0; width: 60%;">DESCRIPCION</th>
              <th style="text-align: right; padding: 1.5mm 0; width: 30%;">IMPORTE</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(items, comensal) in itemsByComensal" :key="comensal">
              <!-- Header del comensal -->
              <tr>
                <td colspan="3" style="padding: 2mm 0 1mm 0; font-weight: bold; font-size: 11px; text-transform: uppercase; border-bottom: 1px dotted #ccc;">
                  {{ comensal === 'Compartido' ? '--- General ---' : `--- Comensal: ${comensal} ---` }}
                </td>
              </tr>
              <!-- Productos del comensal -->
              <tr v-for="item in items" :key="item.id" :style="item.cancelado ? 'color: #999; text-decoration: line-through;' : ''">
                <td style="padding: 1mm 0; vertical-align: top;">{{ item.cantidad }}</td>
                <td style="padding: 1mm 0; text-transform: uppercase;">
                  {{ item.nombre }}
                  <span v-if="item.cancelado" style="font-size: 8px; text-decoration: none !important; display: inline-block; background: #eee; padding: 0 1mm;">[CANCELADO]</span>
                  <div v-if="item.notas && !item.cancelado" style="font-size: 9px; font-style: italic; color: #555;">* {{ item.notas }}</div>
                  <div v-if="item.cancelado" style="font-size: 8px; font-style: italic; text-decoration: none !important;">Motivo: {{ item.motivo_cancelacion }}</div>
                </td>
                <td style="text-align: right; padding: 1mm 0; vertical-align: top;">${{ Number(item.subtotal).toFixed(2) }}</td>
              </tr>
            </template>
          </tbody>
        </table>
        <div style="font-size: 11px; text-align: right;">
          <div style="display: flex; justify-content: flex-end; margin-bottom: 1mm;">
            <span style="width: 30%;">SUBTOTAL:</span>
            <span style="width: 30%; font-weight: bold;">${{ Number(ordenCobrar.total || 0).toFixed(2) }}</span>
          </div>
          <div style="display: flex; justify-content: flex-end; font-size: 14px; margin-top: 2mm; border-top: 1.5px solid #000; padding-top: 2mm;">
            <span style="width: 30%; font-weight: bold;">TOTAL:</span>
            <span style="width: 30%; font-weight: bold;">${{ Number(ordenCobrar.total || 0).toFixed(2) }}</span>
          </div>
          <div v-if="propinaCalculada > 0" style="display: flex; justify-content: flex-end; margin-top: 2mm; color: #444;">
            <span style="width: 30%;">PROPINA:</span>
            <span style="width: 30%;">${{ propinaCalculada.toFixed(2) }}</span>
          </div>
        </div>
        <div style="margin-top: 8mm; text-align: center; border-top: 1px dashed #000; padding-top: 4mm;">
          <p style="margin: 4px 0; font-size: 9px; font-weight: bold;">ESTE NO ES UN COMPROBANTE FISCAL</p>
          <p style="margin: 2px 0; font-size: 9px; font-weight: bold;">PROPINA NO INCLUIDA EN EL TOTAL</p>
          <div style="margin-top: 5mm;">
            <p style="margin: 0; font-size: 9px; color: #444;">Código de Rastreo:</p>
            <p style="margin: 2px 0; font-size: 11px; font-weight: bold; letter-spacing: 1px;">* {{ uniqueIdentifier }} *</p>
          </div>
          <p style="margin-top: 5mm; font-size: 11px; font-style: italic;">¡Gracias por su visita!</p>
          <p style="margin-top: 2mm; font-size: 8px; color: #666;">*** EASY ORDER SYSTEM ***</p>
        </div>
      </div>
    </div>
    <!-- ══ MODAL: CANCELACIÓN CON MOTIVO ══ -->
    <div v-if="cancelacionModal.visible" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" @click.self="cancelacionModal.visible = false">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up border border-slate-100">
        <div class="px-6 py-5 bg-red-50 border-b border-red-100 flex items-center gap-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <h3 class="font-black text-red-800 text-sm uppercase tracking-tight">Motivo de cancelación</h3>
            <p class="text-[10px] font-bold text-red-400 uppercase tracking-widest">Este producto no se cobrará</p>
          </div>
        </div>
        <div class="p-6">
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Selecciona o escribe el motivo</label>
          <div class="grid grid-cols-1 gap-2 mb-4">
            <button v-for="m in ['Platillo equivocado', 'Pelo/Objeto extraño', 'Mal sabor/Crudo', 'Tardanza excesiva', 'Cliente se arrepintió']" :key="m"
              @click="cancelacionModal.motivo = m"
              :class="['px-4 py-2.5 rounded-2xl text-xs font-bold transition text-left border', 
                cancelacionModal.motivo === m ? 'bg-red-500 text-white border-red-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100']">
              {{ m }}
            </button>
          </div>
          <textarea v-model="cancelacionModal.motivo" rows="2" 
            class="w-full px-4 py-3.5 border border-slate-100 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-red-500/10 outline-none transition font-bold"
            placeholder="Escribe otro motivo detallado..."></textarea>
        </div>
        <div class="px-6 py-4 bg-slate-50 flex gap-3">
          <button @click="cancelacionModal.visible = false" 
            class="flex-1 py-3 text-xs font-black text-slate-400 hover:text-slate-600 transition uppercase tracking-widest">
            Ignorar
          </button>
          <button @click="confirmarCancelacion" :disabled="!cancelacionModal.motivo || cobrando"
            class="flex-1 py-3 text-xs font-black text-white bg-red-600 rounded-2xl hover:bg-red-700 transition shadow-lg shadow-red-100 uppercase tracking-widest disabled:opacity-50">
            {{ cobrando ? '...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { API_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'

const props = defineProps({
  orders: { type: Array, default: () => [] },
  type:   { type: String, default: 'open' }, // 'open' | 'closed'
})
const emit = defineEmits(['order-paid', 'refresh'])

const filteredOrders = computed(() => {
  return props.orders.map(o => {
    if (props.type !== 'open') return o
    
    // Only keep details that are ENTREGADO or cancelado
    const deliveredDetalles = (o.detalles || []).filter(d => 
      d.cancelado || d.estado_preparacion === 'ENTREGADO' || d.estado === 'ENTREGADO'
    )
    
    // Recalculate subtotal and total based on delivered items
    const subtotal = deliveredDetalles.reduce((sum, d) => sum + (d.cancelado ? 0 : parseFloat(d.subtotal || 0)), 0)
    const total = subtotal + parseFloat(o.propina || 0)
    
    return {
      ...o,
      detalles: deliveredDetalles,
      total: total
    }
  })
})

// ── Estado Cobrar ──────────────────────────────────────────────────────────
const ordenCobrar    = ref(null)
const metodoPago     = ref('efectivo')
const propinaPct     = ref(0)
const propinaManual  = ref('')
const cobrando       = ref(false)
const montoRecibido  = ref(0)
const folio          = ref('')
const errorCobro     = ref('')

const cancelacionModal = ref({ visible: false, detalleId: null, ordenId: null, motivo: '' })

const metodos = [
  { key: 'efectivo',      label: 'Efectivo',      icon: '💵' },
  { key: 'tarjeta',       label: 'Tarjeta',        icon: '💳' },
  { key: 'transferencia', label: 'Transferencia',  icon: '📲' },
]

const propinaCalculada = computed(() => {
  if (propinaManual.value) return Number(propinaManual.value) || 0
  if (!propinaPct.value)   return 0
  return (Number(ordenCobrar.value?.total || 0) * propinaPct.value) / 100
})

const totalConPropina = computed(() =>
  Number(ordenCobrar.value?.total || 0) + propinaCalculada.value
)

const canPay = computed(() => {
  if (metodoPago.value === 'efectivo') {
    return montoRecibido.value >= totalConPropina.value
  }
  return folio.value && folio.value.trim().length > 0
})

const cambio = computed(() => {
  if (metodoPago.value !== 'efectivo') return 0
  return Math.max(0, montoRecibido.value - totalConPropina.value)
})

// --- Datos del Usuario e Identidad de Sucursal ---
const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'
const user = JSON.parse(userRaw)
const userName = computed(() => user.name || 'Personal')

const esAdminOPropietario = computed(() => {
  const roles = user.roles || []
  return roles.some(r => {
    const name = (typeof r === 'string' ? r : (r.nombre || r.name || '')).toUpperCase()
    return name.includes('PROPIETARIO') || 
           name.includes('ADMIN') || 
           name.includes('ADMINISTRADOR') ||
           name.includes('DUEÑO')
  })
})

const esMesero = computed(() => {
  const roles = user.roles || []
  return roles.some(r => {
    if (typeof r === 'string') return r.toUpperCase() === 'MESERO'
    return r.id === 3 || r.id === '3' || r.nombre?.toUpperCase() === 'MESERO'
  })
})

const nombreSucursal = ref('RESTAURANTE E-ORDER')
const datosSucursal  = ref({ direccion: '', telefono: '', propietario_id: '' })
const detectedRestId = ref(null)

const restauranteId = computed(() => {
  if (detectedRestId.value) return detectedRestId.value
  const rid = ordenCobrar.value?.restaurante_id || ordenCobrar.value?.id_restaurante
  if (rid && rid !== 'undefined' && rid !== 'null') return rid
  const items = ordenCobrar.value?.detalles || []
  const itemWithId = items.find(i => i.restaurante_id || (i.producto && i.producto.restaurante_id))
  if (itemWithId) {
    const id = itemWithId.restaurante_id || itemWithId.producto.restaurante_id
    if (id) return id
  }
  if (user.restaurante_activo) return user.restaurante_activo
  return ''
})

const uniqueIdentifier = computed(() => {
  if (!ordenCobrar.value) return ''
  const pId = datosSucursal.value.propietario_id || user.propietario_id || ''
  const rId = restauranteId.value || ''
  return `${pId}${rId}${ordenCobrar.value.id}`
})

const itemsByComensal = computed(() => {
  const items = ordenCobrar.value?.detalles || []
  const grouped = {}
  items.forEach(item => {
    const comensal = item.nom_comensal || item.comensal || item.nombre_comensal || 'Compartido'
    if (!grouped[comensal]) grouped[comensal] = []
    grouped[comensal].push({
      id: item.id,
      cantidad: item.cantidad || 0,
      nombre: item.producto_nombre || item.nombre || (typeof item.producto === 'string' ? item.producto : item.producto?.nombre) || 'Producto',
      subtotal: item.subtotal || 0,
      notas: item.notas || '',
      cancelado: !!item.cancelado,
      motivo_cancelacion: item.motivo_cancelacion || ''
    })
  })
  return grouped
})

const syncIdentity = async () => {
  if (!ordenCobrar.value) return
  try {
    const rid = restauranteId.value
    if (rid) {
      const dataR = await apiClient.get(`/restaurantes/${rid}`)
      const r = dataR.data || dataR
      if (r) {
        nombreSucursal.value = (r.nombre || 'RESTAURANTE').toUpperCase()
        const d = r.direccion || {}
        const partes = [d.calle, d.ciudad, d.estado].filter(p => p && p.trim().length > 0)
        datosSucursal.value = {
          direccion: partes.join(', '),
          telefono: r.telefono || '',
          propietario_id: r.propietario_id || ''
        }
      }
    }
  } catch (err) {
    console.error('Error en syncIdentity:', err)
  }
}

const abrirCobrar = (order) => {
  ordenCobrar.value = order
  metodoPago.value  = 'efectivo'
  propinaPct.value  = 0
  propinaManual.value = ''
  montoRecibido.value = 0
  folio.value = ''
  errorCobro.value = ''
  modalDividir.value  = false
  syncIdentity()
}

const imprimirTicket = () => {
  const el = document.getElementById('ticket-printable')
  if (!el) return
  const win = window.open('', '_blank', 'width=400,height=600')
  win.document.write(`
    <html>
      <head>
        <title>Ticket_${uniqueIdentifier.value}</title>
        <style>
          @page { margin: 0; }
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        ${el.innerHTML}
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
    win.close()
  }, 500)
}

const imprimirTicketMultiple = (cuentas, folioOriginal, ordenesIds = []) => {
  const win = window.open('', '_blank', 'width=400,height=800')
  const pId = datosSucursal.value.propietario_id || user.propietario_id || ''
  const rId = restauranteId.value || ''
  const dateStr = new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' })
  
  let html = `<html><head><title>Tickets</title></head><body style="margin:0; padding:0; background:#fff; font-family:'Courier New', Courier, monospace; color:#000;">`
  
  cuentas.forEach((cuenta, index) => {
    html += `
      <div style="width:80mm; padding:2mm; margin-bottom:10mm; page-break-inside: avoid;">
        <div style="text-align:center; margin-bottom:4mm;">
          <h2 style="margin:0; font-size:16px; font-weight:bold; text-transform:uppercase;">${nombreSucursal.value}</h2>
          ${datosSucursal.value.direccion ? `<p style="margin:2px 0; font-size:10px;">${datosSucursal.value.direccion}</p>` : ''}
          ${datosSucursal.value.telefono ? `<p style="margin:2px 0; font-size:10px;">TEL: ${datosSucursal.value.telefono}</p>` : ''}
          <div style="border-bottom:1px dashed #000; margin:3mm 0;"></div>
          <p style="margin:0; font-size:12px; font-weight:bold;">Comprobante de Pago (Dividido)</p>
          <p style="margin:2px 0; font-size:10px;">${dateStr}</p>
        </div>
        <div style="font-size:11px; margin-bottom:3mm;">
          <div style="display:flex; justify-content:space-between;">
            <span><strong>Mesa:</strong> ${ordenCobrar.value?.mesa || 'N/A'}</span>
            <span><strong>Sub-cuenta:</strong> ${index + 1} de ${cuentas.length}</span>
          </div>
          <p style="margin:2px 0;"><strong>Atendió:</strong> ${userName.value}</p>
          <p style="margin:2px 0;"><strong>Folio:</strong> ${ordenesIds[index] ? (pId + '' + rId + '' + ordenesIds[index]) : folioOriginal}</p>
          ${cuenta.nombres_comensales ? `<p style="margin:2px 0;"><strong>Comensal(es):</strong> ${cuenta.nombres_comensales}</p>` : ''}
          <div style="border-top:1px dashed #000; margin:2mm 0; padding-top:2mm;">
            <div style="display:flex; justify-content:space-between; margin-bottom:1mm;">
               <span>Consumo:</span> <span>$${Number(cuenta.monto || 0).toFixed(2)}</span>
            </div>
            ${cuenta.pago_propina > 0 ? `
            <div style="display:flex; justify-content:space-between; margin-bottom:1mm;">
               <span>Propina:</span> <span>$${Number(cuenta.pago_propina).toFixed(2)}</span>
            </div>` : ''}
            <div style="display:flex; justify-content:space-between; font-weight:bold; border-top:1px solid #eee; padding-top:1mm;">
               <span>PAGADO CON:</span> <span>${cuenta.pago_metodo?.toUpperCase() || 'EFECTIVO'}</span>
            </div>
            ${cuenta.pago_referencia ? `<p style="margin:2px 0; font-size:10px;">REF: ${cuenta.pago_referencia}</p>` : ''}
            ${cuenta.pago_recibido ? `<p style="margin:2px 0; font-size:10px;">RECIBIDO: $${Number(cuenta.pago_recibido).toFixed(2)}</p>` : ''}
            ${cuenta.pago_cambio ? `<p style="margin:2px 0; font-size:10px;">CAMBIO: $${Number(cuenta.pago_cambio).toFixed(2)}</p>` : ''}
          </div>
        </div>
    `
    
    if (cuenta.detalles && cuenta.detalles.length > 0) {
      html += `
        <table style="width:100%; font-size:11px; border-collapse:collapse; margin-bottom:4mm;">
          <thead><tr style="border-top:1px dashed #000; border-bottom:1px dashed #000;">
            <th style="text-align:left; padding:1.5mm 0; width:10%;">CANT</th>
            <th style="text-align:left; padding:1.5mm 0; width:60%;">DESC</th>
            <th style="text-align:right; padding:1.5mm 0; width:30%;">IMP</th>
          </tr></thead>
          <tbody>
      `
      cuenta.detalles.forEach(det => {
        html += `
          <tr>
            <td style="padding:1mm 0; vertical-align:top;">${det.cantidad}</td>
            <td style="padding:1mm 0; text-transform:uppercase;">${det.producto_nombre}</td>
            <td style="text-align:right; padding:1mm 0; vertical-align:top;">$${Number(det.subtotal).toFixed(2)}</td>
          </tr>
        `
      })
      html += `</tbody></table>`
    } else {
      // Equitativo
      html += `<p style="font-size:11px; text-align:center; font-style:italic; margin-bottom:4mm;">División en partes iguales</p>`
    }
    
    html += `
        <div style="font-size:14px; text-align:right; border-top:1.5px solid #000; padding-top:2mm;">
          <strong>TOTAL A PAGAR: ${cuenta.monto_fmt || '$' + Number(cuenta.monto).toFixed(2)}</strong>
        </div>
        <div style="margin-top:8mm; text-align:center; border-top:1px dashed #000; padding-top:4mm;">
          <p style="margin:4px 0; font-size:9px; font-weight:bold;">ESTE NO ES UN COMPROBANTE FISCAL</p>
          <p style="margin:2px 0; font-size:8px; color:#666;">*** EASY ORDER SYSTEM ***</p>
        </div>
      </div>
    `
    if (index < cuentas.length - 1) {
      html += `<div style="page-break-after: always;"></div>`
    }
  })
  
  html += `</body></html>`
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
    win.close()
  }, 500)
}

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: token ? `Bearer ${token}` : '' }
}

const cobrarOrden = async () => {
  if (!ordenCobrar.value) return
  if (!canPay.value) {
    errorCobro.value = metodoPago.value === 'efectivo' ? 'Monto insuficiente' : 'Ingresa la referencia o folio'
    return
  }
  errorCobro.value = ''
  cobrando.value = true
  try {
    // Generar ticket antes de cerrar la orden
    await nextTick()
    imprimirTicket()

    // 1. Cerrar la orden con método de pago y propina
    let dataCerrar
    try {
      dataCerrar = await apiClient.post(`/ordenes/${ordenCobrar.value.id}/cerrar`, {
        metodo_pago: metodoPago.value,
        propina:     propinaCalculada.value,
        referencia:  folio.value.trim(),
      })
    } catch (e) {
      dataCerrar = await apiClient.put(`/ordenes/${ordenCobrar.value.id}`, {
        estado:      'CERRADA',
        metodo_pago: metodoPago.value,
        propina:     propinaCalculada.value,
        referencia:  folio.value.trim(),
      })
    }
    if (!dataCerrar?.success && !dataCerrar?.data) {
      throw new Error('Error al cerrar orden')
    }

    emit('order-paid', {
      id:          ordenCobrar.value.id,
      folio:       ordenCobrar.value.folio,
      total:       totalConPropina.value,
      metodo_pago: metodoPago.value,
      propina:     propinaCalculada.value,
      monto_pagado: metodoPago.value === 'efectivo' ? montoRecibido.value : totalConPropina.value,
      cambio:      cambio.value,
      folio_pago:  folio.value.trim() || null,
    })
    ordenCobrar.value = null
  } catch (e) {
    console.error('Error al cobrar:', e)
    alert('Error al cobrar la orden. Intenta de nuevo.')
  } finally {
    cobrando.value = false
  }
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
  
  cobrando.value = true
  try {
    const data = await apiClient.delete(`/ordenes/${ordenId}/detalles/${detalleId}?motivo=${encodeURIComponent(motivo)}`)
    if (data.success || data.data) {
      // Actualizar ordenCobrar.detalles localmente
      if (ordenCobrar.value && ordenCobrar.value.id === ordenId) {
        const item = ordenCobrar.value.detalles.find(d => d.id === detalleId)
        if (item) {
          item.cancelado = true
          item.motivo_cancelacion = motivo
        }
        // Recalcular total localmente (solo productos no cancelados)
        ordenCobrar.value.total = ordenCobrar.value.detalles.reduce((sum, d) => {
          return d.cancelado ? sum : sum + Number(d.subtotal || 0)
        }, 0)
      }
      cancelacionModal.value.visible = false
      emit('refresh')
    } else {
      alert(data.message || 'Error al eliminar')
    }
  } catch (e) {
    alert('Error de conexión')
  } finally {
    cobrando.value = false
  }
}

// ── Estado Dividir ─────────────────────────────────────────────────────────
const modalDividir      = ref(false)
const modoDividir       = ref('por_comensal')  // 'por_comensal' | 'equitativo' | 'manual'
const metodoPagoDividir = ref('efectivo')
const errorDividir      = ref('')
const comensalesAuto    = ref([]) // Para agrupar por nombres preasignados
const pagosPorTicket    = ref({}) // { ticketId: { metodo, recibido, referencia } }

const getPagoTicket = (id) => {
  if (!pagosPorTicket.value[id]) {
    pagosPorTicket.value[id] = { metodo: 'efectivo', recibido: 0, referencia: '', propina: 0, propinaPct: 0, propinaManual: false }
  }
  return pagosPorTicket.value[id]
}

const setPagoTicket = (id, metodo) => {
  const p = getPagoTicket(id)
  p.metodo = metodo
}

const setPropinaTicket = (id, pct, total) => {
  const p = getPagoTicket(id)
  p.propinaPct = pct
  p.propinaManual = false
  if (pct === 0) p.propina = 0
  else p.propina = (total * pct) / 100
}

const canPayDividido = computed(() => {
  if (modoDividir.value === 'por_comensal') {
    return ticketsAgrupados.value.every(t => {
      const p = getPagoTicket(t.id);
      if (p.metodo === 'efectivo') {
        return (p.recibido || 0) >= (t.total + (p.propina || 0));
      } else {
        return p.referencia && p.referencia.trim().length > 0;
      }
    });
  }
  return true;
})

const ticketsAgrupados = computed(() => {
  const map = {}
  comensalesAuto.value.forEach(c => {
    if (!map[c.ticketId]) map[c.ticketId] = { id: c.ticketId, total: 0, nombres: [], detalles: [] }
    map[c.ticketId].total += c.subtotal
    map[c.ticketId].nombres.push(c.nombre)
    map[c.ticketId].detalles.push(...c.detalles)
  })
  return Object.values(map).filter(t => t.total > 0).sort((a,b) => a.id - b.id)
})

const totalDivididoGeneral = computed(() => {
  if (modoDividir.value !== 'por_comensal') return Number(ordenCobrar.value?.total || 0);
  return ticketsAgrupados.value.reduce((sum, t) => {
    return sum + t.total + (getPagoTicket(t.id).propina || 0);
  }, 0);
})

// Modo manual
const comensalesManual    = ref([])
const detalleSeleccionado = ref(null)

const detallesSinAsignar = computed(() => {
  if (!ordenCobrar.value?.detalles) return []
  const asignados = comensalesManual.value.flatMap(c => c.detalles.map(d => d.id))
  return ordenCobrar.value.detalles.filter(d => !asignados.includes(d.id))
})

const subtotalComensal = (idx) => {
  return comensalesManual.value[idx]?.detalles.reduce((s, d) => s + Number(d.subtotal || 0), 0) || 0
}

const montoPorComensal = (n) => {
  const total = Number(ordenCobrar.value?.total || 0)
  const monto = total / numComensales.value
  // Último comensal absorbe los centavos residuales
  if (n === numComensales.value) return total - monto * (numComensales.value - 1)
  return monto
}

// ── Acciones de Modal Dividir ──────────────────────────────────────────────
const abrirDividirCuenta = () => {
  if (!ordenCobrar.value) return
  
  // Analizar comensales de los detalles para modo automático
  const detalles = ordenCobrar.value.detalles || []
  const grupos = {}
  detalles.forEach(d => {
    const nom = d.nom_comensal || d.comensal || d.nombre_comensal || 'General'
    if (!grupos[nom]) grupos[nom] = { nombre: nom, detalles: [], subtotal: 0 }
    grupos[nom].detalles.push(d)
    grupos[nom].subtotal += parseFloat(d.subtotal || 0)
  })
  
  const arr = Object.values(grupos)
  comensalesAuto.value = arr.map((g, i) => ({
    nombre: g.nombre,
    detalles: g.detalles,
    subtotal: g.subtotal,
    ticketId: i + 1 
  }))
  
  modoDividir.value       = arr.length > 1 ? 'por_comensal' : 'equitativo'
  metodoPagoDividir.value = 'efectivo'
  errorDividir.value      = ''
  pagosPorTicket.value    = {} // Reiniciar pagos
  comensalesManual.value = [
    { id: 1, detalles: [] },
    { id: 2, detalles: [] },
  ]
  modalDividir.value = true
}

const agregarComensal = () => {
  const id = (comensalesManual.value[comensalesManual.value.length - 1]?.id || 0) + 1
  comensalesManual.value.push({ id, detalles: [] })
}

const quitarComensal = () => {
  if (comensalesManual.value.length <= 2) return
  // Devolver detalles del último comensal al pool sin asignar
  const ultimo = comensalesManual.value.pop()
  // Los detalles vuelven a estar disponibles automáticamente por computed
}

const seleccionarDetalle = (d) => {
  detalleSeleccionado.value = detalleSeleccionado.value?.id === d.id ? null : d
}

const asignarAManual = (idxComensal) => {
  if (!detalleSeleccionado.value) return
  comensalesManual.value[idxComensal].detalles.push(detalleSeleccionado.value)
  detalleSeleccionado.value = null
}

const devolverDetalle = (d, idxComensal) => {
  comensalesManual.value[idxComensal].detalles =
    comensalesManual.value[idxComensal].detalles.filter(x => x.id !== d.id)
}

const cobrarDividido = async () => {
  if (!ordenCobrar.value) return
  errorDividir.value = ''

  // Validar modo manual: todos los detalles deben estar asignados
  if (modoDividir.value === 'manual') {
    if (detallesSinAsignar.value.length > 0) {
      errorDividir.value = `Faltan ${detallesSinAsignar.value.length} producto(s) por asignar a un comensal.`
      return
    }
    const vacios = comensalesManual.value.filter(c => c.detalles.length === 0)
    if (vacios.length > 0) {
      errorDividir.value = `El comensal ${vacios[0].id} no tiene productos asignados.`
      return
    }
  }

  if (modoDividir.value === 'por_comensal' && ticketsAgrupados.value.length < 2) {
    errorDividir.value = 'Para dividir por comensales, deben existir al menos 2 tickets. Si todo va en 1 solo ticket, usa el botón "Cobrar" normal de la pantalla principal.'
    return
  }

  cobrando.value = true
  try {
    // Llamar al endpoint dividirCuenta del backend
    const payload = modoDividir.value === 'equitativo'
      ? { metodo: 'equitativo', comensales: numComensales.value }
      : (modoDividir.value === 'por_comensal'
          ? {
              metodo: 'manual',
              divisiones: ticketsAgrupados.value.map((t, i) => ({
                comensal: String(t.nombres.join(', ') || (i + 1)),
                detalles: t.detalles.map(d => d.id)
              }))
            }
          : {
              metodo: 'manual',
              divisiones: comensalesManual.value.map((c, i) => ({
                comensal: String(i + 1),
                detalles: c.detalles.map(d => d.id),
              })),
            }
        )

    const dataDividir = await apiClient.post(`/ordenes/${ordenCobrar.value.id}/dividir`, payload)
    if (!dataDividir?.success) {
      errorDividir.value = dataDividir?.message || 'Error al dividir cuenta'
      return
    }

    // Cerrar la orden después de dividir
    const detallePagos = ticketsAgrupados.value.map(t => {
      const p = getPagoTicket(t.id)
      return {
        monto: t.total,
        metodo: p.metodo,
        propina: p.propina || 0,
        referencia: p.referencia || '',
        comensal: t.nombres.join(', '),
        detalles: t.detalles.map(d => d.id)
      }
    })

    const dataCerrar = await apiClient.post(`/ordenes/${ordenCobrar.value.id}/cerrar`, {
      estado: 'CERRADA',
      pagos: detallePagos,
      total_final: ordenCobrar.value.total
    })
    if (!dataCerrar?.success) {
      errorDividir.value = dataCerrar?.message || 'Error al cerrar la cuenta'
      return
    }
    
    // Mandar imprimir los tickets múltiples de las sub-cuentas
    if (modoDividir.value === 'por_comensal') {
      dataDividir.cuentas.forEach((c, idx) => {
        const tInfo = ticketsAgrupados.value[idx]
        if (tInfo) {
           c.nombres_comensales = tInfo.nombres.join(', ')
           const p = getPagoTicket(tInfo.id)
           c.pago_metodo     = p.metodo
           c.pago_referencia = p.referencia
           c.pago_recibido   = p.recibido
           c.pago_propina    = p.propina || 0
           c.pago_cambio     = Math.max(0, (p.recibido || 0) - (tInfo.total + (p.propina || 0)))
        }
      })
    } else if (modoDividir.value === 'equitativo') {
       dataDividir.cuentas.forEach((c, idx) => {
         c.nombres_comensales = `Parte ${idx + 1}`
         // Para equitativo, usamos el pago general por ahora o permitimos individual?
         // El UI actual solo muestra el selector general para equitativo, 
         // pero vamos a asignar el método general a todos.
         c.pago_metodo = metodoPagoDividir.value
       })
    }

    imprimirTicketMultiple(dataDividir.cuentas, ordenCobrar.value.folio || ordenCobrar.value.id, dataCerrar.data.ordenes_ids || [])

    emit('order-paid', {
      id:          ordenCobrar.value.id,
      folio:       ordenCobrar.value.folio,
      total:       ordenCobrar.value.total,
      metodo_pago: metodoPagoDividir.value,
      propina:     0,
      cuentas:     dataDividir.cuentas,
    })
    emit('refresh')
    modalDividir.value = false
    ordenCobrar.value  = null
  } catch (e) {
    errorDividir.value = 'Error de conexión al dividir cuenta'
  } finally {
    cobrando.value = false
  }
}
</script>

<style scoped>
.animate-spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.animate-slide-up { animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>