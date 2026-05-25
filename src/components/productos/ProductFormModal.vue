<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-0 max-h-[95vh] flex flex-col overflow-hidden">

      <!-- Encabezado -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 class="text-xl font-bold text-gray-800">
            {{ product ? 'Editar Producto' : 'Nuevo Producto' }}
          </h2>
          <p class="text-xs text-gray-500 mt-1">Configura la información general y la receta del producto</p>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">✕</button>
      </div>

      <!-- ══ INSTRUCCIONES PARA NUEVO PRODUCTO ══ -->
      <div v-if="!product && !productoCreado" class="mx-6 mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
        <p class="text-xs font-black text-indigo-700 uppercase tracking-widest mb-2">Pasos para crear un producto</p>
        <div class="flex items-start gap-3">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
            <span class="text-xs font-bold text-indigo-800">Llena la info y presiona "Crear Producto"</span>
          </div>
          <span class="text-indigo-300">→</span>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">2</span>
            <span class="text-xs font-bold text-indigo-800">Asigna la receta</span>
          </div>
          <span class="text-indigo-300">→</span>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">3</span>
            <span class="text-xs font-bold text-indigo-800">Guardar Receta</span>
          </div>
        </div>
      </div>
      <div v-if="productoCreado && !recetaGuardada" class="mx-6 mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <p class="text-xs font-black text-emerald-700 uppercase tracking-widest">Producto creado · Ahora asigna la receta y presiona "Guardar Receta"</p>
      </div>
      <div v-if="productoCreado && recetaGuardada" class="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
        <p class="text-xs font-black text-blue-700 uppercase tracking-widest">Receta guardada · Ahora presiona "Guardar Información" para finalizar</p>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <!-- Error general -->
        <div v-if="errorMessage" class="mb-6 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          {{ errorMessage }}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          <!-- ══ COLUMNA IZQUIERDA: INFORMACIÓN ══ -->
          <div class="space-y-6">
            <div class="flex items-center gap-2 mb-2">
              <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
              <h3 class="font-bold text-gray-800">Información General</h3>
            </div>

            <!-- IMAGEN -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Imagen del producto</label>
              <div
                class="relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all"
                :class="isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
                @click="imageInput?.click()"
              >
                <input
                  ref="imageInput"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                  class="hidden"
                  @change="handleImageSelect"
                />
                <div v-if="imagePreview" class="relative">
                  <img :src="imagePreview" alt="Preview" class="w-full h-48 object-cover" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-2">
                    <span class="text-white text-sm font-medium">Cambiar imagen</span>
                  </div>
                  <button type="button" @click.stop="removeImage"
                    class="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center text-xs hover:bg-red-600 transition">✕</button>
                </div>
                <div v-else class="flex flex-col items-center justify-center py-10 text-gray-400">
                  <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3 text-gray-300">
                    Sin Imagen
                  </div>
                  <p class="text-sm font-bold text-gray-600">Arrastra una imagen o haz clic</p>
                  <p class="text-xs mt-1 font-bold" :class="errorMessage?.includes('250KB') ? 'text-red-500' : ''">JPG, PNG, WebP · máx. 250KB</p>
                </div>
              </div>
              <label v-if="product?.tiene_imagen && !newImageFile" class="flex items-center gap-2 mt-3 text-sm text-gray-600 cursor-pointer p-2 bg-red-50 rounded-lg w-fit">
                <input v-model="form.eliminar_imagen" type="checkbox" class="accent-red-500" />
                <span class="text-red-500 font-medium">Eliminar imagen actual</span>
              </label>
            </div>

            <!-- Nombre -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre del Producto *</label>
              <input v-model="form.nombre" type="text" placeholder="Ej. Hamburguesa Gourmet"
                class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm font-medium"
                :class="errors.nombre ? 'ring-2 ring-red-400' : ''" />
              <p v-if="errors.nombre" class="text-xs text-red-500 mt-1">{{ errors.nombre }}</p>
            </div>

            <!-- Categoría -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoría *</label>
              <select v-model="form.categoria_id"
                class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm font-medium"
                :class="errors.categoria_id ? 'ring-2 ring-red-400' : ''">
                <option :value="null">Seleccionar categoría</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
              </select>
              <p v-if="errors.categoria_id" class="text-xs text-red-500 mt-1">{{ errors.categoria_id }}</p>
            </div>

            <!-- Descripción -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Descripción <span class="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea v-model="form.descripcion" placeholder="¿Qué incluye este platillo?" rows="3"
                class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm resize-none"></textarea>
            </div>

            <!-- Precio y Stock -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Precio de Venta *</label>
                <div class="relative">
                  <span class="absolute left-4 top-3 text-gray-400 font-bold">$</span>
                  <input v-model.number="form.precio" type="number" step="0.01" min="0" placeholder="0.00"
                    class="w-full pl-8 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm font-black"
                    :class="errors.precio ? 'ring-2 ring-red-400' : ''" />
                </div>
                <p v-if="errors.precio" class="text-xs text-red-500 mt-1">{{ errors.precio }}</p>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Stock Actual</label>
                <div class="relative">
                  <input v-model.number="form.stock" type="number" readonly placeholder="0"
                    class="w-full px-4 py-3 border-none bg-gray-100 text-gray-500 rounded-xl focus:outline-none text-sm cursor-not-allowed font-black" />
                  <span v-if="receta.length" class="absolute right-3 top-3 text-indigo-500 text-[10px]" title="Calculado por receta">Sincronizado</span>
                </div>
                <p v-if="receta.length" class="text-[10px] text-indigo-500 mt-1 font-medium">Calculado por receta</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Stock Mínimo</label>
                <input v-model.number="form.stock_minimo" type="number" min="0" placeholder="5"
                  class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm font-medium" />
              </div>
              <div v-if="product" class="flex flex-col justify-end">
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input v-model="form.activo" type="checkbox" class="w-5 h-5 accent-indigo-600 rounded" />
                  <span class="text-sm font-bold text-gray-700">Producto Activo</span>
                </label>
              </div>
            </div>

            <!-- Botón Crear Producto (solo en modo creación, antes de crear) -->
            <button v-if="!product && !productoCreado" @click="crearProducto" :disabled="loading" type="button"
              class="w-full py-4 text-sm font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition disabled:opacity-50 mt-2">
              {{ loading ? 'Creando...' : '🚀 Crear Producto' }}
            </button>
          </div>

          <!-- ══ COLUMNA DERECHA: RECETA Y COSTOS ══ -->
          <div class="space-y-6">
            <div class="flex items-center gap-2 mb-2">
              <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">2</span>
              <h3 class="font-bold text-gray-800">Receta e Insumos</h3>
              <span v-if="!product && !productoCreado" class="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 ml-auto">⚠️ Crea el producto primero</span>
            </div>

            <!-- Loading Receta -->
            <div v-if="loadingReceta" class="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
              <div class="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
              <p class="text-sm text-gray-500 font-medium">Analizando ingredientes...</p>
            </div>

            <template v-else-if="!product && !productoCreado">
              <!-- Sección deshabilitada hasta crear producto -->
              <div class="py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <p class="text-3xl mb-3">🔒</p>
                <p class="text-sm font-bold text-gray-500">Primero crea el producto</p>
                <p class="text-xs text-gray-400 mt-1">Después podrás asignar ingredientes a la receta</p>
              </div>
            </template>

            <template v-else>
              <!-- ── PANEL DE COSTOS Y MÁRGENES ── -->
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-indigo-600 rounded-2xl p-4 shadow-sm shadow-indigo-200">
                  <p class="text-[10px] text-indigo-100 font-bold uppercase tracking-widest mb-1">Costo Total de Producción</p>
                  <p class="text-2xl font-black text-white mb-2">${{ (costoTotalReceta + costoManoObra + costoIndirectos).toFixed(2) }}</p>
                  
                  <div class="space-y-0.5 border-t border-indigo-500/30 pt-2">
                    <div class="flex justify-between text-[9px] font-bold text-indigo-100">
                      <span>Insumos (Receta):</span>
                      <span>${{ costoTotalReceta.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-[9px] font-bold text-indigo-100">
                      <span>Mano de Obra (MO):</span>
                      <span>${{ costoManoObra.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-[9px] font-bold text-indigo-100">
                      <span>Gastos Indirectos (5%):</span>
                      <span>${{ costoIndirectos.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
                <div class="rounded-2xl p-4 border" :class="margenEstimado >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'">
                  <p class="text-[10px] font-bold uppercase tracking-widest mb-1" :class="margenEstimado >= 0 ? 'text-emerald-600' : 'text-red-600'">Margen Real (con tu precio)</p>
                  <div class="flex items-baseline gap-1">
                    <p class="text-2xl font-black" :class="margenEstimado >= 0 ? 'text-emerald-700' : 'text-red-700'">
                      ${{ margenEstimado.toFixed(2) }}
                    </p>
                    <span class="text-xs font-bold" :class="margenEstimado >= 0 ? 'text-emerald-500' : 'text-red-400'">{{ margenPct }}%</span>
                  </div>
                </div>
              </div>

              <!-- ── PRECIO SUGERIDO ── -->
              <div class="bg-violet-50 border border-violet-100 rounded-2xl p-5 space-y-4">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-black text-violet-700 uppercase tracking-widest">Calculadora de Precio</p>
                </div>

                <div class="flex gap-4 items-end">
                  <div class="flex-1 space-y-1">
                    <label class="text-[10px] font-bold text-gray-500 uppercase">Tiempo Prep. Estimado</label>
                    <div class="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-violet-100">
                      <input v-model.number="minutosProduccion" type="number" min="0" class="w-full text-sm font-bold focus:outline-none" />
                      <span class="text-[10px] text-gray-400">min</span>
                    </div>
                  </div>

                  <!-- Recuadro Margen Sugerido (Tu dibujo) -->
                  <div v-if="precioSugerido > 0" class="flex-1 p-3 bg-white rounded-xl border border-violet-200 shadow-sm">
                    <p class="text-[9px] font-black text-violet-400 uppercase mb-1">Margen Sugerido</p>
                    <div class="flex items-baseline gap-1">
                      <span class="text-lg font-black text-violet-700">${{ margenSugerido.toFixed(2) }}</span>
                      <span class="text-[10px] font-bold text-violet-400">{{ margenSugeridoPct }}%</span>
                    </div>
                  </div>
                </div>

                <div v-if="precioSugerido > 0" class="pt-3 border-t border-violet-200">
                  <button @click="aplicarPrecioSugerido" type="button"
                    class="w-full py-3 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 shadow-sm shadow-violet-200 transition">
                    Aplicar Precio Sugerido: ${{ precioSugerido.toFixed(2) }}
                  </button>
                  <p class="text-[9px] text-center text-violet-500 mt-2 italic">
                    Referencia: Nómina Mensual ${{ totalSueldosBaseReal.toLocaleString() }} · Incluye Gastos e Utilidad (30%)
                  </p>
                </div>
              </div>

              <!-- ── INGREDIENTES ASIGNADOS ── -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-black text-gray-500 uppercase tracking-widest">Ingredientes en Receta</p>
                  <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{{ receta.length }} items</span>
                </div>

                <div v-if="!receta.length" class="py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <p class="text-sm text-gray-400 italic">No hay ingredientes asignados</p>
                </div>

                <div v-else class="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  <div v-for="(item, idx) in receta" :key="item.id"
                    class="group flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 hover:border-indigo-300 transition-all">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-gray-800 truncate">{{ item.nombre }}</p>
                      <p class="text-[10px] text-gray-400 font-medium">Stock: {{ item.stock_actual }} {{ item.unidad }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="flex items-center bg-gray-50 rounded-lg px-2 border border-gray-100 focus-within:border-indigo-400 transition">
                        <input v-model.number="item.cantidad_receta" type="number" step="0.001"
                          class="w-16 py-1.5 text-xs text-center font-black bg-transparent focus:outline-none"
                          @input="recetaModificada = true" />
                        <span class="text-[10px] text-gray-400 font-bold uppercase">{{ item.unidad }}</span>
                      </div>
                      <button @click="quitarDeReceta(idx)" type="button"
                        class="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ── BUSCADOR E INGREDIENTES ── -->
              <div class="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                
                <!-- Buscador -->
                <div class="relative">
                  <input v-model="busquedaIngrediente" type="text" placeholder="Buscar ingrediente por nombre..."
                    class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    @input="buscarIngredientes" @focus="buscarIngredientes" />
                </div>

                <div class="flex items-center gap-4 py-2">
                  <div class="h-px bg-gray-200 flex-1"></div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">o selecciona del catálogo</span>
                  <div class="h-px bg-gray-200 flex-1"></div>
                </div>

                <!-- Selector Desplegable Personalizado -->
                <div class="relative">
                  <button @click.stop="showDropdown = !showDropdown" type="button"
                    class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-left text-sm text-gray-700 flex items-center justify-between hover:border-indigo-300 transition shadow-sm">
                    <span>-- Selecciona del catálogo --</span>
                    <span class="text-gray-400 transition-transform" :class="showDropdown ? 'rotate-180' : ''">▼</span>
                  </button>

                  <div v-if="showDropdown" 
                    class="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                    <div v-for="ing in todosIngredientes" :key="ing.id"
                      @click="seleccionarIngrediente(ing); showDropdown = false"
                      class="px-4 py-3 text-sm hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-none flex items-center justify-between group"
                      :class="yaEnReceta(ing.id) ? 'opacity-50 pointer-events-none bg-gray-50' : ''">
                      <div class="flex-1">
                        <span class="font-bold text-gray-700">{{ ing.nombre }}</span>
                        <span class="text-[10px] text-gray-400 ml-2">({{ ing.unidad }})</span>
                      </div>
                      <span v-if="yaEnReceta(ing.id)" class="text-[10px] font-black text-emerald-600 uppercase">En receta</span>
                      <span v-else class="text-indigo-400 opacity-0 group-hover:opacity-100 font-bold">+ Agregar</span>
                    </div>
                  </div>
                </div>
                
                <div v-if="busquedaIngrediente" class="mt-4 space-y-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  <div v-for="ing in ingredientesBusqueda" :key="ing.id"
                    class="flex items-center justify-between p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 transition group">
                    <div class="flex-1">
                      <p class="text-sm font-bold text-gray-700">{{ ing.nombre }}</p>
                      <p class="text-[10px] text-gray-400">{{ ing.unidad }} · {{ Number(ing.costo_unitario).toFixed(2) }}</p>
                    </div>
                    <button v-if="!yaEnReceta(ing.id)" @click="seleccionarIngrediente(ing)" type="button"
                      class="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg hover:bg-indigo-600 hover:text-white transition uppercase tracking-wider">
                      Agregar
                    </button>
                    <span v-else class="text-emerald-600 text-xs font-bold">Ya en receta</span>
                  </div>
                  <div v-if="!ingredientesBusqueda.length" class="py-4 text-center">
                    <p class="text-xs text-gray-400">No se encontraron resultados</p>
                  </div>
                </div>
              </div>

              <!-- Guardar receta -->
              <button v-if="recetaModificada" @click="guardarReceta" :disabled="guardandoReceta" type="button"
                class="w-full py-4 bg-emerald-600 text-white text-sm font-black rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition">
                {{ guardandoReceta ? 'Guardando cambios...' : 'Guardar Receta' }}
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Botones de Acción Final -->
      <div class="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
        <button @click="productoCreado ? (emit('saved'), emit('close')) : emit('close')" type="button"
          class="flex-1 py-4 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-2xl hover:bg-gray-100 transition">
          {{ productoCreado ? 'Cerrar' : 'Cerrar sin guardar' }}
        </button>
        <button v-if="product || productoCreado" @click="save" :disabled="loading" type="button"
          class="flex-[2] py-4 text-sm font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition disabled:opacity-50">
          {{ loading ? 'Sincronizando...' : 'Guardar Información' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted, onUnmounted } from 'vue'

// ── Importa la URL base desde tu config centralizado ──────────────────────────
import { apiClient } from '@/utils/apiClient'

// ── Props / Emits ─────────────────────────────────────────────────────────────
const props = defineProps<{
  product?: any
  categorias?: any[]
}>()

const emit = defineEmits(['close', 'saved'])

// ── Estado general ────────────────────────────────────────────────────────────
const loading      = ref(false)
const errorMessage = ref('')
const isDragging   = ref(false)
const imageInput   = ref<HTMLInputElement | null>(null)
const imagePreview = ref<string | null>(null)
const newImageFile = ref<File | null>(null)
const categorias   = ref<any[]>(props.categorias || [])
const activeTab    = ref<'info' | 'receta'>('info')
const productoCreado = ref(false)
const productoId     = ref<number | null>(null)
const recetaGuardada = ref(false)

const form = reactive({
  nombre: '', descripcion: '', precio: 0, costo: 0, stock: 0,
  stock_minimo: 5, categoria_id: null as number | null,
  activo: true, eliminar_imagen: false,
  minutos_produccion: 0
})

const totalSueldosBaseReal = ref(0)
const loadingNomina = ref(false)

const errors = reactive({ nombre: '', precio: '', categoria_id: '' })

// ── Estado Receta ─────────────────────────────────────────────────────────────
const receta               = ref<any[]>([])
const loadingReceta        = ref(false)
const guardandoReceta      = ref(false)
const recetaModificada     = ref(false)
const busquedaIngrediente  = ref('')
const ingredientesBusqueda = ref<any[]>([])
const todosIngredientes    = ref<any[]>([])
const showDropdown         = ref(false)

// ── Cargar Receta automáticamente al montar o cambiar producto ────────────────
const initReceta = async () => {
  if (props.product?.id) {
    await cargarReceta()
  } else {
    await loadTodosIngredientes()
  }
}



// ── Estado Precio Sugerido ────────────────────────────────────────────────────
const minutosProduccion = computed({
  get: () => form.minutos_produccion,
  set: (val) => form.minutos_produccion = val
})
const minutosTurno      = ref(480) // 8 horas por defecto
const diasMes           = ref(30)  // Estándar mensual
const factorCargaSocial = ref(1.36) // Carga social por defecto

// ── Computed: Costos y precio sugerido ───────────────────────────────────────
const costoTotalReceta = computed(() =>
  receta.value.reduce((s, i) => s + (Number(i.cantidad_receta) * Number(i.costo_unitario || 0)), 0)
)

/**
 * Costo de mano de obra por porción basado en la nómina real:
 * (Suma sueldos base / minutos operativos al mes) * minutos de producción * factor carga social
 */
const costoManoObra = computed(() => {
  if (!totalSueldosBaseReal.value || !minutosTurno.value || !minutosProduccion.value) return 0
  const minutosTotalesMes = diasMes.value * minutosTurno.value
  const costoPorMinuto = (totalSueldosBaseReal.value / minutosTotalesMes) * factorCargaSocial.value
  return costoPorMinuto * minutosProduccion.value
})

const costoBase = computed(() => costoTotalReceta.value + costoManoObra.value)

// 5% de gastos indirectos sobre (insumos + mano de obra)
const costoIndirectos = computed(() => costoBase.value * 0.05)

// 30% de utilidad sobre el subtotal (insumos + mo + indirectos)
const costoUtilidad = computed(() => {
  const subtotal = costoBase.value + costoIndirectos.value
  return subtotal * 0.30
})

const precioSugerido = computed(() => {
  if (!receta.value.length && !minutosProduccion.value) return 0
  return costoBase.value + costoIndirectos.value + costoUtilidad.value
})

const aplicarPrecioSugerido = () => {
  form.precio = Math.ceil(precioSugerido.value * 100) / 100
}

const margenSugerido = computed(() => {
  const ps = precioSugerido.value
  return ps - costoTotalReceta.value - costoManoObra.value - costoIndirectos.value
})

const margenSugeridoPct = computed(() => {
  const ps = precioSugerido.value
  return ps > 0 ? Math.round((margenSugerido.value / ps) * 100) : 0
})

// Porciones posibles con el stock actual de ingredientes
const porcionesDisponibles = computed<number | null>(() => {
  if (!receta.value.length) return null
  const valores = receta.value.map(i => {
    const cant  = Number(i.cantidad_receta)
    const stock = Number(i.stock_actual ?? 0)
    if (cant <= 0) return Infinity
    return Math.floor(stock / cant)
  })
  const min = Math.min(...valores)
  return min === Infinity ? 0 : min
})

// ── Link de Stock Automático (Ahora en el orden correcto) ────────────────────
watch(porcionesDisponibles, (newVal) => {
  if (newVal !== null && receta.value.length > 0) {
    form.stock = newVal
  }
})

// ── Sincronizar campo COSTO con la receta ────────────────────────────────────
watch(costoTotalReceta, (newVal) => {
  form.costo = newVal
})

const margenEstimado = computed(() => {
  const precio = Number(form.precio) || 0
  const costos = costoTotalReceta.value + costoManoObra.value + costoIndirectos.value
  return precio - costos
})

const margenPct = computed(() => {
  const precio = Number(form.precio) || 0
  return precio > 0 ? Math.round((margenEstimado.value / precio) * 100) : 0
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const yaEnReceta = (id: number) => receta.value.some(r => r.id === id)

// ── Cargar ingredientes del catálogo (una sola vez) ───────────────────────────
const loadTodosIngredientes = async () => {
  if (todosIngredientes.value.length) return
  try {
    const data = await apiClient.get('/ingredientes')
    if (data.success || data.data) todosIngredientes.value = data.data || data || []
  } catch (e) {
    console.error('Error cargando ingredientes:', e)
  }
}

/**
 * FIX PRINCIPAL: Cargar la receta del producto actual.
 * - Siempre hace el fetch (no cachea entre ediciones distintas).
 * - Mapea cantidad_receta desde el campo correcto del pivot.
 * - NO activa recetaModificada al cargar datos existentes.
 */
const cargarNominaReal = async () => {
  loadingNomina.value = true
  try {
    const resp = await apiClient.get('/empleados')
    const emps = resp.data || resp || []
    if (Array.isArray(emps)) {
      totalSueldosBaseReal.value = emps.reduce((acc, e) => acc + Number(e.salario_base || 0), 0)
    }
  } catch (err) {
    console.error('Error cargando nomina real:', err)
  } finally {
    loadingNomina.value = false
  }
}

const cargarReceta = async () => {
  loadingReceta.value = true
  receta.value = []
  recetaModificada.value = false
  
  // Cargamos nómina al mismo tiempo
  cargarNominaReal()

  try {
    // Primero cargamos el catálogo de ingredientes (necesario para la búsqueda)
    await loadTodosIngredientes()

    if (!props.product?.id) {
      loadingReceta.value = false
      return
    }

    const data = await apiClient.get(`/ingredientes/producto/${props.product.id}`)

    const arrayData = data.data || data
    if ((data.success || arrayData) && Array.isArray(arrayData)) {
      receta.value = arrayData.map((i: any) => ({
        ...i,
        // El backend devuelve cantidad_receta (v2) o cantidad (pivot v1)
        // Tomamos el primero que exista y no sea 0
        cantidad_receta: parseFloat(i.cantidad_receta ?? i.cantidad ?? 0),
      }))
    }
  } catch (e) {
    console.error('Error cargando receta:', e)
  } finally {
    loadingReceta.value = false
  }
}

// ── Búsqueda de ingredientes ──────────────────────────────────────────────────
const buscarIngredientes = () => {
  if (!busquedaIngrediente.value.trim()) {
    // Si no hay búsqueda, mostramos los primeros 8 por defecto
    ingredientesBusqueda.value = todosIngredientes.value.slice(0, 8)
    return
  }
  const q = busquedaIngrediente.value.toLowerCase()
  ingredientesBusqueda.value = todosIngredientes.value
    .filter(i => i.nombre.toLowerCase().includes(q))
    .slice(0, 8)
}

const seleccionarIngrediente = (ing: any) => {
  if (!yaEnReceta(ing.id)) {
    receta.value.push({ ...ing, cantidad_receta: 1 })
    recetaModificada.value = true
  }
  busquedaIngrediente.value  = ''
  ingredientesBusqueda.value = []
  showDropdown.value         = false
}

const quitarDeReceta = (idx: number) => {
  receta.value.splice(idx, 1)
  recetaModificada.value = true
}

// ── Guardar receta ────────────────────────────────────────────────────────────
const guardarReceta = async () => {
  const pid = props.product?.id || productoId.value
  if (!pid) return
  guardandoReceta.value = true

  try {
    const payload = {
      ingredientes: receta.value.map(i => ({
        id:       i.id,
        cantidad: Number(i.cantidad_receta),
      })),
    }
    const data = await apiClient.post(`/ingredientes/producto/${pid}/sync`, payload)

    if (data.success || data.data) {
      recetaModificada.value = false
      recetaGuardada.value = true
    } else {
      errorMessage.value = data.message || 'Error al guardar receta'
    }
  } catch {
    errorMessage.value = 'Error de conexión al guardar receta'
  } finally {
    guardandoReceta.value = false
  }
}

// ── Imagen ────────────────────────────────────────────────────────────────────
const handleImageSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) setImage(file)
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) setImage(file)
}

const setImage = (file: File) => {
  if (file.size > 250 * 1024) {
    errorMessage.value = 'La imagen es demasiado pesada (' + (file.size/1024).toFixed(0) + 'KB). El límite es 250KB.'
    return
  }
  newImageFile.value   = file
  form.eliminar_imagen = false
  const reader         = new FileReader()
  reader.onload = (e) => { imagePreview.value = e.target?.result as string }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  newImageFile.value = null
  imagePreview.value = null
  if (imageInput.value) imageInput.value.value = ''
}

// ── Precargar formulario al abrir / cambiar producto ──────────────────────────
const resetForm = () => {
  const p = props.product
  form.nombre          = p?.nombre       ?? ''
  form.descripcion     = p?.descripcion  ?? ''
  form.precio          = p?.precio       ?? 0
  form.costo           = p?.costo        ?? 0
  form.stock           = p?.stock        ?? 0
  form.stock_minimo    = p?.stock_minimo ?? 5
  form.categoria_id    = p?.categoria_id ?? null
  form.activo          = p?.activo       ?? true
  form.eliminar_imagen = false
  imagePreview.value     = p?.imagen_url   ?? null
  newImageFile.value     = null
  form.minutos_produccion = p?.minutos_produccion ?? 0
  errors.nombre          = ''
  errors.precio        = ''
  errors.categoria_id  = ''
  errorMessage.value   = ''
  // Reset receta — se cargará al abrir el tab
  receta.value          = []
  recetaModificada.value = false
  activeTab.value        = 'info'
  productoCreado.value   = false
  productoId.value       = null
  recetaGuardada.value   = false
}

watch(() => props.product, resetForm, { immediate: true })

// ── Validación ────────────────────────────────────────────────────────────────
const validate = () => {
  errors.nombre       = form.nombre.trim()   ? '' : 'El nombre es obligatorio'
  errors.precio       = form.precio > 0      ? '' : 'El precio debe ser mayor a 0'
  errors.categoria_id = form.categoria_id    ? '' : 'Selecciona una categoría'
  return !errors.nombre && !errors.precio && !errors.categoria_id
}

// ── Crear Producto (Paso 1) ───────────────────────────────────────────────────
const crearProducto = async () => {
  if (!validate()) return
  loading.value      = true
  errorMessage.value = ''

  try {
    let data: any;

    if (newImageFile.value) {
      const fd = new FormData()
      fd.append('nombre',       form.nombre)
      fd.append('descripcion',  form.descripcion || '')
      fd.append('precio',       String(form.precio))
      fd.append('costo',        String(form.costo))
      fd.append('stock',        String(form.stock))
      fd.append('stock_minimo', String(form.stock_minimo))
      if (form.categoria_id) fd.append('categoria_id', String(form.categoria_id))
      fd.append('activo',             form.activo ? '1' : '0')
      fd.append('minutos_produccion', String(form.minutos_produccion))
      fd.append('imagen',             newImageFile.value)

      data = await apiClient.post('/productos', fd)
    } else {
      data = await apiClient.post('/productos', {
        nombre:          form.nombre,
        descripcion:     form.descripcion,
        precio:          form.precio,
        costo:           form.costo,
        stock:           form.stock,
        stock_minimo:    form.stock_minimo,
        categoria_id:    form.categoria_id,
        activo:             form.activo,
        minutos_produccion: form.minutos_produccion,
      })
    }

    if (data.success || data.data) {
      // Extraer el ID del producto creado
      const newProduct = data.data || data
      productoId.value = newProduct.id
      productoCreado.value = true
      errorMessage.value = ''

      // Cargar ingredientes para poder asignar receta
      await loadTodosIngredientes()
      await cargarNominaReal()
    } else {
      errorMessage.value = data.errors
        ? Object.values(data.errors).flat().join(' · ')
        : data.message || 'Error al crear producto'
    }
  } catch {
    errorMessage.value = 'Error de conexión'
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (!validate()) return
  loading.value      = true
  errorMessage.value = ''

  try {
    const pid = props.product?.id || productoId.value
    const endpoint = pid ? `/productos/${pid}` : `/productos`
    let data: any;

    if (newImageFile.value) {
      const fd = new FormData()
      fd.append('nombre',       form.nombre)
      fd.append('descripcion',  form.descripcion || '')
      fd.append('precio',       String(form.precio))
      fd.append('costo',        String(form.costo))
      fd.append('stock',        String(form.stock))
      fd.append('stock_minimo', String(form.stock_minimo))
      if (form.categoria_id) fd.append('categoria_id', String(form.categoria_id))
      fd.append('activo',             form.activo ? '1' : '0')
      fd.append('minutos_produccion', String(form.minutos_produccion))
      fd.append('imagen',             newImageFile.value)
      if (pid) fd.append('_method', 'PUT')

      data = await apiClient.post(endpoint, fd)
    } else {
      const method = pid ? 'put' : 'post'
      data = await apiClient[method](endpoint, {
        nombre:          form.nombre,
        descripcion:     form.descripcion,
        precio:          form.precio,
        costo:           form.costo,
        stock:           form.stock,
        stock_minimo:    form.stock_minimo,
        categoria_id:    form.categoria_id,
        activo:             form.activo,
        eliminar_imagen:    form.eliminar_imagen,
        minutos_produccion: form.minutos_produccion,
      })
    }

    if (data.success || data.data) {
      emit('saved')
    } else {
      errorMessage.value = data.errors
        ? Object.values(data.errors).flat().join(' · ')
        : data.message || 'Error al guardar producto'
    }
  } catch {
    errorMessage.value = 'Error de conexión'
  } finally {
    loading.value = false
  }
}

// ── Categorías (si no vienen como prop) ──────────────────────────────────────
const loadCategorias = async () => {
  try {
    const data = await apiClient.get('/categorias')
    if (data.success || data.data) categorias.value = data.data || data || []
  } catch (e) {
    console.error('Error categorías:', e)
  }
}

// ── Cerrar dropdown al hacer clic fuera ──────────────────────────────────────
const handleClickOutside = () => { showDropdown.value = false }

onMounted(() => {
  if (!categorias.value.length) loadCategorias()
  document.addEventListener('click', handleClickOutside)
  initReceta()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
