<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-zoom-in">
      
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h3 class="text-xl font-black text-gray-900">{{ isEdit ? 'Editar Paquete' : 'Nuevo Paquete' }}</h3>
          <p class="text-xs text-gray-400">Combina productos para crear ofertas únicas</p>
        </div>
        <button @click="$emit('close')" class="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-600 transition shadow-sm">✕</button>
      </div>

      <!-- Form Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        
        <!-- Información Básica -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Nombre del Paquete</label>
              <input 
                v-model="form.nombre"
                type="text"
                placeholder="Ej: Combo Familiar"
                class="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Precio Final</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input 
                  v-model="form.precio"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  class="w-full pl-8 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-bold"
                />
              </div>
            </div>
          </div>

          <!-- Imagen -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Imagen del Paquete</label>
            <div 
              @click="$refs.fileInput.click()"
              class="relative aspect-video rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-400 bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group"
            >
              <img v-if="previewUrl" :src="previewUrl" alt="Vista previa de la imagen del paquete" class="w-full h-full object-cover" />
              <div v-else class="text-center p-4">
                <span class="text-3xl block mb-2">🖼️</span>
                <p class="text-xs text-gray-400 font-medium">Click para subir imagen</p>
              </div>
              <div v-if="previewUrl" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span class="text-white text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">Cambiar Imagen</span>
              </div>
              <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFile" />
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Descripción</label>
          <textarea 
            v-model="form.descripcion"
            rows="2"
            placeholder="Describe qué incluye el paquete..."
            class="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition"
          ></textarea>
        </div>

        <!-- Selector de Productos -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 class="text-sm font-black text-gray-800 uppercase tracking-wider">Productos Incluidos</h4>
            <span class="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{{ form.productos.length }} productos seleccionados</span>
          </div>

            <!-- Buscador para agregar -->
            <div class="relative group">
              <input 
                v-model="searchProd"
                type="text"
                placeholder="🔍 Buscar producto o tamaño para añadir..."
                @focus="isFocused = true"
                @blur="setTimeout(() => isFocused = false, 250)"
                class="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm"
              />
              
              <!-- Botón de Flecha para abrir/cerrar -->
              <button 
                type="button"
                @click.stop="isFocused = !isFocused"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-all duration-300 transform"
                :class="isFocused ? 'rotate-180' : 'rotate-0'"
              >
                <span class="text-xs">▼</span>
              </button>
              
              <!-- Resultados búsqueda / Lista desplegable -->
              <div v-if="isFocused && filteredProducts.length > 0" class="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto animate-fade-in border-t-4 border-t-indigo-500">
                <div class="p-2 border-b border-gray-50 bg-gray-50/50">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Selecciona un producto o tamaño</p>
                </div>
                <button 
                  v-for="p in filteredProducts" 
                  :key="p.itemKey"
                  @click="addProduct(p)"
                  class="w-full px-4 py-3 text-left hover:bg-indigo-50 flex items-center justify-between group transition-colors border-b border-gray-50 last:border-0"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-white">
                      <img v-if="p.imagen_url" :src="p.imagen_url" :alt="p.nombre || 'Producto'" class="w-full h-full object-cover" />
                      <span v-else class="text-lg">🍽️</span>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                        {{ p.nombre }}
                        <span v-if="p.tamano_nombre" class="text-xs font-black text-indigo-600 ml-1 uppercase">({{ p.tamano_nombre }})</span>
                      </p>
                      <p class="text-[10px] text-gray-400 font-medium">{{ p.categoria?.nombre || 'Producto' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-black text-gray-400 group-hover:text-indigo-500 transition-colors">${{ Number(p.precio || 0).toFixed(2) }}</span>
                    <span class="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                  </div>
                </button>
              </div>
            </div>

          <!-- Lista de productos seleccionados -->
          <div class="space-y-2">
            <div v-if="form.productos.length === 0" class="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p class="text-xs text-gray-400 font-medium italic">Selecciona al menos un producto arriba</p>
            </div>
            <div 
              v-for="(p, index) in form.productos" 
              :key="p.itemKey || (p.id + '-' + (p.tamano_id || 'base'))"
              class="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  <img v-if="p.imagen_url" :src="p.imagen_url" :alt="p.nombre || 'Producto'" class="w-full h-full object-cover" />
                  <span v-else>🍽️</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-800">
                    {{ p.nombre }}
                    <span v-if="p.tamano_nombre" class="text-xs font-black text-indigo-600 ml-1 uppercase">({{ p.tamano_nombre }})</span>
                  </p>
                  <p class="text-[10px] text-gray-400 font-medium">${{ Number(p.precio || 0).toFixed(2) }} • {{ p.categoria?.nombre || 'Sin categoría' }}</p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 bg-gray-50 rounded-xl p-1 border border-gray-100">
                  <button @click="p.cantidad > 1 ? p.cantidad-- : null" class="w-7 h-7 rounded-lg bg-white shadow-sm text-gray-500 hover:text-indigo-600 transition flex items-center justify-center font-bold">−</button>
                  <span class="text-sm font-black w-6 text-center text-gray-700">{{ p.cantidad }}</span>
                  <button @click="p.cantidad++" class="w-7 h-7 rounded-lg bg-white shadow-sm text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center font-bold">+</button>
                </div>
                <button @click="removeProduct(index)" class="text-gray-300 hover:text-red-500 transition">✕</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ══ CALCULADORA DE PRECIO Y MÁRGENES ══ -->
        <div class="bg-indigo-50/30 rounded-3xl p-6 border border-indigo-100 space-y-5">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-black text-indigo-900 uppercase tracking-wider">💰 Análisis Financiero del Paquete</h4>
            </div>
            <div class="px-3 py-1 bg-white border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-500 shadow-sm flex items-center gap-1">
              <span>⏱️</span> Tiempo Prod: {{ minutosProduccionTotal }} min
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Costos -->
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-indigo-50">
              <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] font-black text-gray-400 uppercase">Costo Producción</span>
                <span class="text-xl font-black text-indigo-600">${{ costoTotal.toFixed(2) }}</span>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-[11px]">
                  <span class="text-gray-500 font-medium">Insumos (Suma):</span>
                  <span class="text-gray-900 font-bold">${{ costoInsumosTotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-[11px]">
                  <span class="text-gray-500 font-medium">Mano de Obra (MO):</span>
                  <span class="text-gray-900 font-bold">${{ costoManoObraTotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-[11px] pt-1 border-t border-gray-50">
                  <span class="text-gray-500 font-medium">Gastos Indirectos (5%):</span>
                  <span class="text-gray-900 font-bold">${{ costoIndirectosTotal.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Margen -->
            <div class="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
              <div class="flex justify-between items-center mb-1">
                <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Margen Real</span>
                <span class="text-xl font-black text-emerald-700">${{ margenReal.toFixed(2) }}</span>
              </div>
              <p class="text-3xl font-black text-emerald-600">{{ margenRealPct }}%</p>
              <p class="text-[10px] text-emerald-500 font-bold uppercase mt-1 tracking-tighter">Utilidad sobre precio final</p>
            </div>
          </div>

          <!-- Sugerencia -->
          <div class="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm relative overflow-hidden group">
            <div class="absolute right-0 top-0 bottom-0 w-24 bg-indigo-500/5 -skew-x-12 translate-x-12"></div>
            <div class="flex items-center justify-between relative z-10">
              <div>
                <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Precio Sugerido (30% util.)</p>
                <p class="text-2xl font-black text-indigo-600">${{ precioSugerido.toFixed(2) }}</p>
              </div>
              <button 
                @click="aplicarPrecioSugerido"
                class="px-5 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-95"
              >
                Aplicar Sugerido
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
        <button 
          @click="$emit('close')"
          class="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
        >
          Cancelar
        </button>
        <button 
          @click="save"
          :disabled="loading"
          class="flex-[2] py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 shadow-md shadow-indigo-100"
        >
          {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar Paquete' : 'Crear Paquete') }}
        </button>
      </div>
    </div>

    <!-- ══ PASO 1: AVISO — paquete en órdenes sin cobrar ══ -->
    <div v-if="advertenciaPrecio && !confirmacionPrecio" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] px-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 flex items-start gap-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <h3 class="text-lg font-bold text-gray-800">Paquete en órdenes sin cobrar</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ advertenciaPrecio.item?.nombre }}</p>
          </div>
        </div>

        <div class="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <p class="text-sm text-gray-600">
            {{ advertenciaPrecio.ordenes?.length }} orden(es) tienen este paquete y todavía no se han cobrado.
            El precio ya capturado en esas órdenes <strong>no cambiará</strong>; el nuevo precio solo aplicará a órdenes nuevas.
          </p>

          <div v-if="advertenciaPrecio.cambios?.length" class="rounded-xl bg-amber-50 border border-amber-100 p-3 space-y-1">
            <p class="text-[10px] font-black uppercase tracking-widest text-amber-700">Cambios de precio</p>
            <div v-for="(c, i) in advertenciaPrecio.cambios" :key="i" class="flex justify-between text-xs font-bold text-amber-800">
              <span>{{ c.nombre }}</span>
              <span>${{ Number(c.antes).toFixed(2) }} → ${{ Number(c.despues).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Impacto: cuánto cambiaría el total de las cuentas abiertas -->
          <div v-if="advertenciaPrecio.impacto" class="rounded-xl border p-3 flex items-center justify-between gap-3"
            :class="advertenciaPrecio.impacto.diferencia > 0 ? 'bg-red-50 border-red-100'
              : advertenciaPrecio.impacto.diferencia < 0 ? 'bg-emerald-50 border-emerald-100'
              : 'bg-gray-50 border-gray-100'">
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Si se aplicara el nuevo precio
              </p>
              <p class="text-[11px] text-gray-500 mt-0.5">
                El total ya capturado en las {{ advertenciaPrecio.impacto.ordenes }} cuenta(s) abiertas cambiaría
              </p>
            </div>
            <span class="text-lg font-black shrink-0" :class="colorDiferencia(advertenciaPrecio.impacto.diferencia)">
              {{ formatDiferencia(advertenciaPrecio.impacto.diferencia) }}
            </span>
          </div>

          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
              Órdenes afectadas · toca una para ver su detalle
            </p>
            <div class="rounded-xl border border-gray-100 divide-y divide-gray-100">
              <div v-for="o in advertenciaPrecio.ordenes" :key="o.id">
                <button type="button" @click="toggleDetalleOrden(o.id)"
                  class="w-full flex items-center justify-between px-3 py-2 text-xs gap-3 text-left hover:bg-gray-50 transition">
                  <span class="font-bold text-gray-700 shrink-0 flex items-center gap-1.5">
                    <span class="text-[9px] text-gray-400">{{ ordenDetalleAbierta === o.id ? '▼' : '▶' }}</span>
                    {{ o.folio }}<span v-if="o.mesa"> · Mesa {{ o.mesa }}</span>
                  </span>
                  <span class="text-gray-400 text-right flex items-center justify-end gap-1.5">
                    <span>
                      {{ o.estado }} · {{ o.cantidad }} pza(s)
                      <template v-if="o.precios_unitarios?.length"> · {{ formatPrecios(o.precios_unitarios) }}</template>
                    </span>
                    <!-- Cuánto cambiaría el total de esta cuenta -->
                    <span v-if="o.diferencia" class="shrink-0 text-[10px] font-black rounded px-1.5 py-0.5"
                      :class="o.diferencia > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'">
                      {{ formatDiferencia(o.diferencia) }}
                    </span>
                  </span>
                </button>

                <!-- Detalle de la orden -->
                <div v-if="ordenDetalleAbierta === o.id" class="px-3 pb-3 pt-1 bg-gray-50/70">
                  <!-- Solo se resaltan las líneas cuyo precio cambiaría -->
                  <div v-for="d in o.detalles" :key="d.id"
                    class="flex items-start justify-between text-[11px] gap-3 py-1"
                    :class="cambiaPrecio(d) ? 'text-amber-800 font-bold bg-amber-50 rounded px-1.5 -mx-1.5' : 'text-gray-500'">
                    <span class="min-w-0">
                      <span :class="d.cancelado ? 'line-through' : ''">
                        {{ Number(d.cantidad) }}× {{ d.nombre }}
                      </span>
                      <span v-if="cambiaPrecio(d)"
                        class="text-[9px] font-black uppercase bg-amber-600 text-white rounded px-1 ml-1 whitespace-nowrap">
                        {{ formatDiferencia(d.diferencia) }}
                      </span>
                      <span v-else-if="d.es_afectado"
                        class="text-[9px] uppercase bg-gray-100 text-gray-400 rounded px-1 ml-1 whitespace-nowrap">
                        este paquete
                      </span>
                      <span v-if="d.cancelado" class="text-[9px] uppercase text-red-400 ml-1">cancelado</span>
                    </span>
                    <span class="shrink-0 text-right" :class="d.cancelado ? 'line-through' : ''">
                      ${{ Number(d.subtotal).toFixed(2) }}
                      <template v-if="d.subtotal_nuevo !== null && d.subtotal_nuevo !== undefined">
                        <span class="text-gray-400 mx-0.5">→</span>
                        <span class="font-black text-amber-700">${{ Number(d.subtotal_nuevo).toFixed(2) }}</span>
                      </template>
                    </span>
                  </div>
                  <div class="flex justify-between text-[11px] font-black border-t border-gray-200 pt-1.5 mt-1.5"
                    :class="o.diferencia ? 'text-amber-800' : 'text-gray-700'">
                    <span>
                      Total de la orden
                      <span v-if="o.diferencia" class="font-normal text-[10px] text-gray-400">si se aplica el precio nuevo</span>
                    </span>
                    <span class="text-right">
                      ${{ Number(o.total || 0).toFixed(2) }}
                      <template v-if="o.diferencia">
                        <span class="text-gray-400 mx-0.5">→</span>
                        <span>${{ Number(o.total_nuevo || 0).toFixed(2) }}</span>
                      </template>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button @click="cancelarCambioPrecio" type="button"
            class="flex-1 py-3 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-2xl hover:bg-gray-100 transition">
            Cancelar
          </button>
          <button @click="confirmarCambioPrecio" type="button"
            class="flex-[2] py-3 text-sm font-black text-white bg-amber-600 rounded-2xl hover:bg-amber-700 shadow-lg shadow-amber-100 transition">
            Continuar
          </button>
        </div>
      </div>
    </div>

    <!-- ══ PASO 2: CONFIRMACIÓN FINAL para aplicar el cambio de precio ══ -->
    <div v-if="confirmacionPrecio" class="fixed inset-0 bg-black/70 flex items-center justify-center z-[80] px-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-5 flex items-start gap-3">
          <span class="text-2xl">🔒</span>
          <div>
            <h3 class="text-lg font-bold text-gray-800">¿Confirmas el cambio de precio?</h3>
            <p class="text-xs text-gray-500 mt-0.5">
              Esta es la última confirmación. El nuevo precio solo se aplicará a órdenes nuevas.
            </p>
          </div>
        </div>

        <div v-if="advertenciaPrecio?.cambios?.length" class="px-6 space-y-1">
          <div v-for="(c, i) in advertenciaPrecio.cambios" :key="i"
            class="flex justify-between text-xs font-bold text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <span>{{ c.nombre }}</span>
            <span>${{ Number(c.antes).toFixed(2) }} → ${{ Number(c.despues).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Impacto en el total de las cuentas abiertas -->
        <div v-if="advertenciaPrecio?.impacto" class="px-6 pt-3">
          <div class="flex justify-between items-center gap-3 text-xs font-bold rounded-lg px-3 py-2 border"
            :class="advertenciaPrecio.impacto.diferencia > 0 ? 'bg-red-50 border-red-100 text-red-700'
              : advertenciaPrecio.impacto.diferencia < 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-gray-50 border-gray-100 text-gray-600'">
            <span>
              Total de las {{ advertenciaPrecio.impacto.ordenes }} cuentas abiertas
              <span class="block font-normal text-[10px] text-gray-400">si se aplicara el nuevo precio</span>
            </span>
            <span class="text-base font-black shrink-0">
              {{ formatDiferencia(advertenciaPrecio.impacto.diferencia) }}
            </span>
          </div>
        </div>

        <div class="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button @click="volverCambioPrecio" type="button"
            class="flex-1 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-2xl hover:bg-gray-100 transition">
            No, volver
          </button>
          <button @click="aplicarCambioPrecio" :disabled="loading" type="button"
            class="flex-[2] py-3 text-sm font-black text-white bg-red-600 rounded-2xl hover:bg-red-700 shadow-lg shadow-red-100 transition disabled:opacity-50">
            {{ loading ? 'Guardando...' : 'Sí, cambiar precio' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { apiClient } from '@/utils/apiClient'

const props = defineProps({
  paquete: { type: Object, default: null },
  availableProducts: { type: Array, default: () => [] },
  initialProducts: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'saved'])

const isEdit = computed(() => !!props.paquete)
const loading = ref(false)
// ── Guardia de cambio de precio (paquete en órdenes sin cobrar) ──────────────
const advertenciaPrecio   = ref(null)
const confirmacionPrecio  = ref(false)
const forzarPrecio        = ref(false)
const ordenDetalleAbierta = ref(null)
const searchProd = ref('')
const isFocused = ref(false)
const previewUrl = ref(null)

const form = reactive({
  nombre: '',
  descripcion: '',
  precio: '',
  productos: [],
  imagenFile: null
})

onMounted(() => {
  advertenciaPrecio.value   = null
  confirmacionPrecio.value  = false
  forzarPrecio.value        = false
  ordenDetalleAbierta.value = null
  cargarNominaReal()
  if (props.paquete) {
    form.nombre = props.paquete.nombre
    form.descripcion = props.paquete.descripcion
    form.precio = props.paquete.precio
    form.productos = (props.paquete.productos || []).map(p => {
      const tamId   = p.pivot?.tamano_id || p.tamano_id || null
      const tamObj  = tamId && p.tamanos ? p.tamanos.find(t => t.id === tamId) : null
      const tamName = p.tamano_nombre || tamObj?.nombre || null
      return {
        ...p,
        tamano_id: tamId,
        tamano_nombre: tamName,
        precio: tamObj ? parseFloat(tamObj.precio) : parseFloat(p.precio || 0),
        itemKey: `${p.id}-${tamId || 'base'}`,
        cantidad: p.pivot?.cantidad || 1
      }
    })
    previewUrl.value = props.paquete.imagen_url
  } else if (props.initialProducts && props.initialProducts.length > 0) {
    // Si venimos desde una sugerencia estratégica
    form.productos = props.initialProducts.map(p => ({
      ...p,
      itemKey: `${p.id}-${p.tamano_id || 'base'}`,
      cantidad: 1
    }))
  }
})

// ── Lógica Financiera ──────────────────────────────────────────────────────────
const totalSueldosBaseReal = ref(0)
const cargarNominaReal = async () => {
  try {
    const resp = await apiClient.get('/empleados')
    const emps = resp.data || resp || []
    if (Array.isArray(emps)) {
      totalSueldosBaseReal.value = emps
        .filter(e => !!e.activo || e.activo === 1)
        .reduce((acc, e) => acc + Number(e.salario_base || 0), 0)
    }
  } catch (err) { console.error('Error nómina:', err) }
}

const minutosProduccionTotal = computed(() => {
  return form.productos.reduce((sum, p) => {
    return sum + (parseFloat(p.minutos_produccion || 0) * p.cantidad)
  }, 0)
})

const costoInsumosTotal = computed(() => {
  return form.productos.reduce((sum, p) => {
    const costoProd = (p.ingredientes || []).reduce((s, ing) => {
      const cantIng = parseFloat(ing.cantidad_necesaria || ing.pivot?.cantidad || 0)
      return s + (parseFloat(ing.costo_unitario || 0) * cantIng)
    }, 0)
    return sum + (costoProd * p.cantidad)
  }, 0)
})

const costoManoObraTotal = computed(() => {
  if (!totalSueldosBaseReal.value) return 0
  return form.productos.reduce((sum, p) => {
    const minProd = parseFloat(p.minutos_produccion || 0)
    const costoMO = (totalSueldosBaseReal.value / 14400) * 1.36 * minProd
    return sum + (costoMO * p.cantidad)
  }, 0)
})

const costoIndirectosTotal = computed(() => {
  return (costoInsumosTotal.value + costoManoObraTotal.value) * 0.05
})

const costoTotal = computed(() => {
  return costoInsumosTotal.value + costoManoObraTotal.value + costoIndirectosTotal.value
})

const precioSugerido = computed(() => {
  const subtotal = costoTotal.value
  return subtotal + (subtotal * 0.30)
})

const margenReal = computed(() => {
  const precio = parseFloat(form.precio || 0)
  return precio - costoTotal.value
})

const margenRealPct = computed(() => {
  const precio = parseFloat(form.precio || 0)
  return precio > 0 ? Math.round((margenReal.value / precio) * 100) : 0
})

const aplicarPrecioSugerido = () => {
  form.precio = Math.ceil(precioSugerido.value * 100) / 100
}

const filteredProducts = computed(() => {
  const s = searchProd.value.toLowerCase()
  const options = []

  props.availableProducts.forEach(p => {
    if (p.tamanos && p.tamanos.length > 0) {
      p.tamanos.forEach(tam => {
        const itemKey = `${p.id}-${tam.id}`
        const yaExiste = form.productos.some(fp => fp.id === p.id && fp.tamano_id === tam.id)
        if (!yaExiste) {
          options.push({
            ...p,
            itemKey,
            tamano_id: tam.id,
            tamano_nombre: tam.nombre,
            precio: parseFloat(tam.precio || 0),
            stock: parseFloat(tam.stock || 0),
            ingredientes: tam.ingredientes && tam.ingredientes.length ? tam.ingredientes : p.ingredientes
          })
        }
      })
    } else {
      const itemKey = `${p.id}-base`
      const yaExiste = form.productos.some(fp => fp.id === p.id && !fp.tamano_id)
      if (!yaExiste) {
        options.push({
          ...p,
          itemKey,
          tamano_id: null,
          tamano_nombre: null,
          precio: parseFloat(p.precio || 0),
          stock: parseFloat(p.stock || 0)
        })
      }
    }
  })

  if (!s) return options.slice(0, 25)

  return options.filter(item => {
    const fullSearch = item.tamano_nombre ? `${item.nombre} ${item.tamano_nombre}` : item.nombre
    return fullSearch.toLowerCase().includes(s)
  }).slice(0, 25)
})

const handleFile = (e) => {
  const file = e.target.files[0]
  if (!file) return
  form.imagenFile = file
  previewUrl.value = URL.createObjectURL(file)
}

const addProduct = (p) => {
  form.productos.push({ ...p, cantidad: 1 })
  searchProd.value = ''
  isFocused.value = false
}

const removeProduct = (idx) => {
  form.productos.splice(idx, 1)
}

const save = async () => {
  if (!form.nombre || !form.precio || form.productos.length === 0) {
    alert('Por favor completa los campos obligatorios y añade al menos un producto.')
    return
  }

  loading.value = true
  const formData = new FormData()
  formData.append('nombre', form.nombre)
  formData.append('descripcion', form.descripcion || '')
  formData.append('precio', form.precio)
  
  if (form.imagenFile) {
    formData.append('imagen', form.imagenFile)
  }

  form.productos.forEach((p, i) => {
    formData.append(`productos[${i}][id]`, p.id)
    formData.append(`productos[${i}][cantidad]`, p.cantidad)
    if (p.tamano_id) {
      formData.append(`productos[${i}][tamano_id]`, p.tamano_id)
    }
  })

  // Confirmado desde el aviso de "órdenes sin cobrar": se aplica el precio igualmente.
  if (forzarPrecio.value) {
    formData.append('forzar_precio', '1')
  }

  // Para Laravel spoofing de PUT
  if (isEdit.value) {
    formData.append('_method', 'PUT')
  }

  try {
    const endpoint = isEdit.value ? `/paquetes/${props.paquete.id}` : `/paquetes`
    
    const data = await apiClient.post(endpoint, formData)

    if (data.success || data.data) {
      emit('saved', data.data || data)
    } else {
      alert(data.message || 'Error al guardar el paquete')
    }
  } catch (error) {
    // El backend bloquea el cambio de precio si el paquete está en órdenes sin
    // cobrar (409): se abre el aviso de dos pasos y, al confirmar, se reintenta
    // con forzar_precio. El precio ya capturado en esas órdenes no se modifica.
    if (error?.response?.status === 409 && error.response.data?.code === 'PRECIO_EN_ORDEN_SIN_COBRAR') {
      advertenciaPrecio.value = error.response.data.data
    } else {
      console.error('Error saving package:', error)
      alert('Error de conexión')
    }
  } finally {
    loading.value = false
  }
}

// ── Confirmación en dos pasos del cambio de precio con órdenes sin cobrar ─────
// Paso 1 → 2: aviso con el detalle de las órdenes afectadas y confirmación final.
const confirmarCambioPrecio = () => {
  confirmacionPrecio.value = true
}

// Muestra/oculta el detalle completo de una orden dentro del aviso.
const toggleDetalleOrden = (id) => {
  ordenDetalleAbierta.value = ordenDetalleAbierta.value === id ? null : id
}

// Paso 2: confirmación final; recién aquí se aplica el cambio.
const aplicarCambioPrecio = async () => {
  advertenciaPrecio.value  = null
  confirmacionPrecio.value = false
  forzarPrecio.value       = true
  await save()
}

const volverCambioPrecio = () => {
  confirmacionPrecio.value = false
}

const cancelarCambioPrecio = () => {
  advertenciaPrecio.value   = null
  confirmacionPrecio.value  = false
  forzarPrecio.value        = false
  ordenDetalleAbierta.value = null
}

const formatPrecios = (precios) =>
  (precios || []).map(p => '$' + Number(p).toFixed(2)).join(' / ')

// Diferencia con signo (p. ej. +$5.00 / -$5.00) para el impacto del cambio.
const formatDiferencia = (valor) => {
  const n = Number(valor || 0)
  if (!n) return '$0.00'
  return (n > 0 ? '+' : '-') + '$' + Math.abs(n).toFixed(2)
}

const colorDiferencia = (valor) => {
  const n = Number(valor || 0)
  if (n > 0) return 'text-red-600'
  if (n < 0) return 'text-emerald-600'
  return 'text-gray-500'
}

// El backend solo manda la diferencia en las líneas cuyo precio cambiaría.
const cambiaPrecio = (detalle) =>
  detalle?.diferencia !== null && detalle?.diferencia !== undefined
</script>

<style scoped>
@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-zoom-in { animation: zoom-in 0.3s ease-out; }
.animate-fade-in { animation: fade-in 0.3s ease-out; }
</style>
