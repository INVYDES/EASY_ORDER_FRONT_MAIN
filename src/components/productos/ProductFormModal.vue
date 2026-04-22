<template>
  <div
    class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
      
      <div class="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 class="text-xl font-bold text-slate-800">
            {{ product ? 'Editar Producto' : 'Nuevo Producto' }}
          </h3>
          <p class="text-xs text-slate-500 tracking-wide uppercase font-semibold mt-1">Ficha técnica y costos de producción</p>
        </div>
        <button 
          @click="$emit('close')" 
          class="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm border border-transparent hover:border-slate-100"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-8">
        <div v-if="loadingIngredientes" class="flex justify-center items-center py-20">
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-slate-500">Cargando ingredientes...</p>
          </div>
        </div>

        <form @submit.prevent="save" v-else class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          <div class="space-y-6">
            <h4 class="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
              <span class="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">📋</span> Información General
            </h4>
            
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Nombre del Producto *</label>
                <input 
                  v-model="form.nombre" 
                  type="text" 
                  required 
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition" 
                  placeholder="Ej. Pastel de Chocolate"
                >
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Categoría *</label>
                  <select 
                    v-model="form.categoria_id" 
                    required 
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  >
                    <option value="" disabled>Seleccionar...</option>
                    <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Precio de Venta *</label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <input 
                      v-model.number="form.precio" 
                      type="number" 
                      step="0.01" 
                      required 
                      class="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    >
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Stock Actual</label>
                  <input 
                    v-model.number="form.stock" 
                    type="number" 
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  >
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Stock Mínimo</label>
                  <input 
                    v-model.number="form.stock_minimo" 
                    type="number" 
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6 bg-slate-50/80 p-6 rounded-3xl border border-slate-100">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                <span class="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">🍳</span> Receta e Insumos
              </h4>
              <span class="text-xs font-medium px-2.5 py-1 bg-white text-slate-600 rounded-lg shadow-sm">
                {{ form.ingredientes.length }} Ingrediente(s)
              </span>
            </div>

            <div class="relative">
              <select 
                @change="addIngrediente" 
                v-model="selectedIngredienteId"
                class="w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 bg-white hover:border-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none text-sm shadow-sm cursor-pointer transition-all"
              >
                <option value="" disabled selected>➕ Añadir ingrediente a la receta...</option>
                <option v-for="ing in ingredientesParaSeleccionar" :key="ing.id" :value="ing.id">
                  {{ ing.nombre }} ({{ ing.unidad }}) - ${{ ing.costo_unitario }}
                </option>
              </select>
            </div>

            <div class="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
              <div 
                v-for="(item, index) in form.ingredientes" 
                :key="index" 
                class="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition hover:border-emerald-200"
              >
                <div class="flex-1">
                  <p class="text-sm font-bold text-slate-700">{{ getNombreIngrediente(item.ingrediente_id) }}</p>
                  <p class="text-[10px] text-slate-400 font-medium">Costo unitario: ${{ getCostoUnitario(item.ingrediente_id).toFixed(2) }}</p>
                </div>
                
                <div class="flex items-center gap-2">
                  <input 
                    v-model.number="item.cantidad" 
                    type="number" 
                    step="0.01" 
                    class="w-20 px-2 py-1.5 text-center text-sm font-bold rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="0"
                  >
                  <span class="text-xs text-slate-500 font-medium w-8">{{ getUnidadIngrediente(item.ingrediente_id) }}</span>
                </div>

                <div class="text-right min-w-[70px] border-l border-slate-100 pl-3">
                  <p class="text-sm font-black text-slate-600">${{ (item.cantidad * getCostoUnitario(item.ingrediente_id)).toFixed(2) }}</p>
                </div>

                <button 
                  @click="removeIngrediente(index)" 
                  type="button" 
                  class="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div v-if="form.ingredientes.length === 0" class="text-center py-12 bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
                <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p class="text-xs text-slate-400 italic font-medium">Selecciona ingredientes arriba para calcular el costo de producción.</p>
              </div>
            </div>

            <div class="pt-5 border-t border-slate-200 space-y-3">
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500 font-medium">Costo de producción:</span>
                <span class="font-bold text-slate-800 text-lg">${{ totalCosto.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between items-center p-3 rounded-xl transition-all" :class="margenBg">
                <span class="text-slate-500 font-medium">Margen de ganancia:</span>
                <div class="text-right">
                  <span :class="margenText" class="font-black block text-base">{{ margenPorcentaje.toFixed(1) }}%</span>
                  <span class="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">+ ${{ (form.precio - totalCosto).toFixed(2) }} por unidad</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
        <button 
          @click="$emit('close')" 
          class="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition active:scale-95"
        >
          Cancelar
        </button>
        <button 
          @click="save" 
          :disabled="loading || loadingIngredientes" 
          class="px-10 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition active:scale-95 flex items-center gap-2"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ loading ? 'Guardando...' : (product ? 'Actualizar Producto' : 'Crear Producto') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { API_URL } from '@/config/api'

const props = defineProps({
  product: { type: Object, default: null },
  categorias: { type: Array, default: () => [] },
  // ✅ Eliminada la prop apiUrl que causaba duplicación
})

const emit = emitDefinidos(['close', 'saved'])

const loading = ref(false)
const loadingIngredientes = ref(true)
const ingredientesDisponibles = ref([])
const selectedIngredienteId = ref('')

const form = ref({
  nombre: '',
  categoria_id: '',
  precio: 0,
  stock: 0,
  stock_minimo: 0,
  ingredientes: []
})

// ============================================
// UTILIDAD: Obtener token de cualquier storage
// ============================================
const getToken = () => {
  // Primero buscar en localStorage
  let token = localStorage.getItem('token');
  
  // Si no está, buscar en sessionStorage
  if (!token) {
    token = sessionStorage.getItem('token');
  }
  
  return token;
};

/**
 * CARGAR INGREDIENTES
 */
const loadIngredientes = async () => {
  const token = getToken();
  
  if (!token) {
    console.warn('⚠️ No hay token en localStorage ni sessionStorage');
    loadingIngredientes.value = false;
    return;
  }

  loadingIngredientes.value = true;
  
  try {
    // ✅ Usar API_URL directamente (sin props.apiUrl)
    const res = await fetch(`${API_URL}/ingredientes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Accept': 'application/json'
      }
    });

    const result = await res.json();

    if (result && result.success && Array.isArray(result.data)) {
      ingredientesDisponibles.value = result.data;
    } else {
      ingredientesDisponibles.value = [];
    }
  } catch (err) {
    console.error("🌐 Error al cargar ingredientes:", err);
    ingredientesDisponibles.value = [];
  } finally {
    loadingIngredientes.value = false;
  }
};

/**
 * MAPEAR PRODUCTO AL FORMULARIO
 */
const mapProductToForm = () => {
  if (!props.product) {
    form.value = {
      nombre: '',
      categoria_id: '',
      precio: 0,
      stock: 0,
      stock_minimo: 0,
      ingredientes: []
    };
    return;
  }

  // Filtrar solo los ingredientes que existen en la lista de insumos disponibles
  const ingredientesValidos = props.product.ingredientes ? props.product.ingredientes.filter(i => {
    const idABuscar = Number(i.ingrediente_id || i.id);
    return ingredientesDisponibles.value.some(ing => Number(ing.id) === idABuscar);
  }) : [];
  
  form.value = {
    nombre: props.product.nombre || '',
    categoria_id: props.product.categoria_id || '',
    precio: props.product.precio || 0,
    stock: props.product.stock || 0,
    stock_minimo: props.product.stock_minimo || 0,
    ingredientes: ingredientesValidos.map(i => ({
      ingrediente_id: Number(i.ingrediente_id || i.id),
      cantidad: Number(i.pivot?.cantidad || i.cantidad || 0)
    }))
  };
};

/**
 * FILTRAR INGREDIENTES PARA EL SELECT
 */
const ingredientesParaSeleccionar = computed(() => {
  const agregadosIds = form.value.ingredientes.map(i => Number(i.ingrediente_id));
  return ingredientesDisponibles.value.filter(ing => !agregadosIds.includes(Number(ing.id)));
});

/**
 * GESTIÓN DE INSUMOS
 */
const addIngrediente = () => {
  if (!selectedIngredienteId.value) return;
  
  const id = Number(selectedIngredienteId.value);
  const existe = form.value.ingredientes.find(i => Number(i.ingrediente_id) === id);
  
  if (!existe) {
    form.value.ingredientes.push({ ingrediente_id: id, cantidad: 1 });
  }
  
  selectedIngredienteId.value = "";
};

const removeIngrediente = (index) => {
  form.value.ingredientes.splice(index, 1);
};

/**
 * HELPERS DE UI
 */
const getNombreIngrediente = (id) => {
  const ing = ingredientesDisponibles.value.find(i => Number(i.id) === Number(id));
  return ing ? ing.nombre : `ID: ${id}`;
};

const getUnidadIngrediente = (id) => {
  const ing = ingredientesDisponibles.value.find(i => Number(i.id) === Number(id));
  return ing ? ing.unidad : '';
};

const getCostoUnitario = (id) => {
  const ing = ingredientesDisponibles.value.find(i => Number(i.id) === Number(id));
  return ing ? parseFloat(ing.costo_unitario || 0) : 0;
};

/**
 * CÁLCULOS
 */
const totalCosto = computed(() => {
  return form.value.ingredientes.reduce((acc, item) => {
    return acc + (Number(item.cantidad) * getCostoUnitario(item.ingrediente_id));
  }, 0);
});

const margenPorcentaje = computed(() => {
  const precio = parseFloat(form.value.precio) || 0;
  if (totalCosto.value === 0 || precio === 0) return 0;
  return ((precio - totalCosto.value) / precio) * 100;
});

const margenText = computed(() => {
  if (margenPorcentaje.value > 40) return 'text-emerald-600';
  if (margenPorcentaje.value > 15) return 'text-amber-600';
  return 'text-red-600';
});

const margenBg = computed(() => {
  if (margenPorcentaje.value > 40) return 'bg-emerald-50';
  if (margenPorcentaje.value > 15) return 'bg-amber-50';
  return 'bg-red-50';
});

/**
 * GUARDAR
 */
const save = async () => {
  const token = getToken();
  
  if (!token) {
    alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
    return;
  }

  loading.value = true;
  const isEditing = !!props.product;
  
  // ✅ Usar API_URL directamente (sin props.apiUrl)
  const url = isEditing 
    ? `${API_URL}/productos/${props.product.id}` 
    : `${API_URL}/productos`;
  
  const dataToSend = {
    nombre: form.value.nombre,
    categoria_id: parseInt(form.value.categoria_id),
    precio: parseFloat(form.value.precio),
    stock: parseInt(form.value.stock) || 0,
    stock_minimo: parseInt(form.value.stock_minimo) || 0,
    ingredientes: form.value.ingredientes.map(ing => ({
      ingrediente_id: Number(ing.ingrediente_id),
      cantidad: parseFloat(ing.cantidad) || 0
    }))
  };
  
  try {
    const res = await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    });
    
    const responseData = await res.json();
    
    if (res.ok) {
      emit('saved', responseData);
      emit('close');
    } else {
      throw new Error(responseData.message || "Error al guardar");
    }
  } catch (err) {
    console.error("Error:", err);
    alert(err.message || "Error al guardar");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadIngredientes();
  mapProductToForm();
});

watch(() => props.product, () => {
  if (!loadingIngredientes.value) {
    mapProductToForm();
  }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
input, select, button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>