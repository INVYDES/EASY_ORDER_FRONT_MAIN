<template>
  <Transition name="modal">
    <div v-if="modelValue" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-950/40 backdrop-blur-sm" @click="$emit('update:modelValue', false)"></div>
      
      <div class="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden relative flex flex-col max-h-[90vh] animate-modal-in">
        
        <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 class="text-2xl font-black text-gray-900 tracking-tight">
              {{ oferta ? 'Editar Promoción' : 'Nueva Promoción' }}
            </h3>
            <p class="text-sm text-gray-500 font-medium">Configura tu anuncio u oferta especial</p>
          </div>
          <button @click="$emit('update:modelValue', false)" class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">✕</button>
        </div>
        
        <div class="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          
          <section>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">¿Qué deseas publicar?</label>
            <div class="grid grid-cols-4 gap-3">
              <button v-for="t in tipos" :key="t.value" @click="form.tipo=t.value; form.emoji=t.emoji"
                :class="['p-4 rounded-[20px] border-2 transition-all flex flex-col items-center gap-2',
                  form.tipo===t.value ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100 scale-[1.02]' : 'border-gray-100 hover:border-gray-200']">
                <span class="text-2xl">{{ t.emoji }}</span>
                <span :class="['text-[10px] font-black tracking-widest text-center', form.tipo===t.value ? 'text-indigo-700' : 'text-gray-400']">{{ t.label }}</span>
              </button>
            </div>
          </section>
          
          <section class="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div class="sm:col-span-3">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Título</label>
              <input v-model="form.titulo" type="text" placeholder="Ej: 2x1 en Burgers"
                class="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-gray-800" />
            </div>
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 text-center">Icono</label>
              <input v-model="form.emoji" type="text" class="w-full py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl text-center text-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none" />
            </div>
          </section>
          
          <section class="p-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-[28px] border-2 border-indigo-100/50">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xl">🍕</span>
              <label class="text-[11px] font-black text-indigo-700 uppercase tracking-widest">Vincular Producto (Opcional)</label>
            </div>
            
            <div class="relative">
              <button type="button" @click="dropdownOpen = !dropdownOpen"
                class="w-full px-4 py-4 text-left border-2 border-white rounded-[20px] bg-white flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                <div class="flex items-center gap-3 overflow-hidden">
                  <template v-if="selectedProduct">
                    <img v-if="selectedProduct.imagen_url" :src="resolveImageUrl(selectedProduct.imagen_url)" class="w-8 h-8 rounded-lg object-cover" />
                    <div class="min-w-0">
                      <p class="font-black text-gray-800 text-sm truncate uppercase">{{ selectedProduct.nombre }}</p>
                      <p class="text-[10px] text-indigo-500 font-bold">{{ selectedProduct.precio_formateado }}</p>
                    </div>
                  </template>
                  <span v-else class="text-gray-400 font-medium text-sm">Selecciona un producto...</span>
                </div>
                <span class="text-indigo-300">▼</span>
              </button>
              
              <div v-if="dropdownOpen" class="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-[24px] shadow-2xl max-h-60 overflow-y-auto">
                <div v-for="p in products" :key="p.id" @click="seleccionarProducto(p)"
                  class="p-4 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 flex items-center gap-3">
                  <img v-if="p.imagen_url" :src="resolveImageUrl(p.imagen_url)" class="w-10 h-10 rounded-xl object-cover" />
                  <div class="flex-1">
                    <p class="text-sm font-black text-gray-800 uppercase">{{ p.nombre }}</p>
                    <p class="text-[10px] text-indigo-500 font-bold">{{ p.precio_formateado }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="form.producto_id" class="mt-5">
              <label class="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Nuevo Precio Promocional</label>
              <div class="flex items-center gap-4 bg-white p-4 rounded-[20px] shadow-inner border-2 border-emerald-50">
                <span class="text-gray-300 line-through font-bold text-lg">{{ selectedProduct?.precio_formateado }}</span>
                <div class="flex-1 relative">
                  <span class="absolute left-0 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xl">$</span>
                  <input v-model="form.precio_promo" type="number" step="0.01" 
                    class="w-full pl-6 bg-transparent text-emerald-600 text-2xl font-black outline-none" placeholder="0.00" />
                </div>
              </div>
            </div>
          </section>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-4">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Visibilidad</label>
              <div class="flex flex-col gap-2">
                <label class="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-2xl">
                  <input v-model="form.mostrar_cliente" type="checkbox" class="w-5 h-5 accent-indigo-600" />
                  <span class="font-bold text-gray-700 text-sm">📱 Clientes</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-2xl">
                  <input v-model="form.mostrar_interno" type="checkbox" class="w-5 h-5 accent-indigo-600" />
                  <span class="font-bold text-gray-700 text-sm">👨‍🍳 Staff</span>
                </label>
              </div>
            </div>
            
            <div class="space-y-4">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Color</label>
              <div class="grid grid-cols-5 gap-2">
                <button v-for="c in colores" :key="c.value" @click="form.color=c.value"
                  :class="['w-8 h-8 rounded-full border-2', c.bg, form.color===c.value ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-white']">
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-6 border-t border-gray-50 flex gap-4 bg-gray-50/30 sticky bottom-0">
          <button @click="$emit('update:modelValue', false)"
            class="flex-1 py-4 text-xs font-black text-gray-500 bg-white rounded-2xl border-2 border-gray-100">CERRAR</button>
          <button @click="guardar" :disabled="guardando"
            class="flex-1 py-4 text-xs font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 disabled:opacity-50">
            {{ guardando ? 'GUARDANDO...' : 'PUBLICAR AHORA' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { API_URL, STORAGE_URL } from '@/config/api';

// Helper: Resolver URLs de imágenes
const resolveImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('data:')) return path
  if (path.startsWith('/storage/')) return `${STORAGE_URL}${path.replace(/^\/?storage\//, '')}`
  return `${STORAGE_URL}${path}`
}

const props = defineProps({
  modelValue: Boolean, // Controla si se ve o no (v-model)
  oferta: Object,      // Si existe, es modo edición
  products: Array      // Lista de productos del padre
});

const emit = defineEmits(['update:modelValue', 'saved']);

const guardando = ref(false);
const dropdownOpen = ref(false);
const selectedProduct = ref(null);

const form = reactive({
  tipo: 'oferta',
  titulo: '',
  emoji: '🎯',
  producto_id: null,
  precio_promo: '',
  mostrar_cliente: true,
  mostrar_interno: true,
  color: 'indigo',
  fecha_inicio: '',
  fecha_fin: ''
});

const tipos = [
  { value: 'oferta', label: 'OFERTA', emoji: '🏷️' },
  { value: 'anuncio', label: 'ANUNCIO', emoji: '📢' },
  { value: 'evento', label: 'EVENTO', emoji: '📅' },
  { value: 'urgente', label: 'AVISO', emoji: '⚠️' }
];

const colores = [
  { value: 'indigo', bg: 'bg-indigo-500' },
  { value: 'emerald', bg: 'bg-emerald-500' },
  { value: 'amber', bg: 'bg-amber-500' },
  { value: 'rose', bg: 'bg-rose-500' },
  { value: 'blue', bg: 'bg-blue-500' }
];

// Sincronizar datos cuando se abre para editar
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.oferta) {
    Object.assign(form, props.oferta);
    if (props.oferta.producto_id) {
        selectedProduct.value = props.products.find(p => p.id === props.oferta.producto_id);
    }
  } else if (isOpen) {
    // Resetear formulario si es nuevo
    Object.assign(form, { tipo: 'oferta', titulo: '', emoji: '🎯', producto_id: null, precio_promo: '', mostrar_cliente: true, mostrar_interno: true, color: 'indigo' });
    selectedProduct.value = null;
  }
});

const seleccionarProducto = (p) => {
  form.producto_id = p.id;
  selectedProduct.value = p;
  dropdownOpen.value = false;
};

const guardar = async () => {
  guardando.value = true;
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  try {
    const url = props.oferta ? `${API_URL}/ofertas/${props.oferta.id}` : `${API_URL}/ofertas`;
    const method = props.oferta ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(form)
    });
    
    const data = await res.json();
    if (data.success) {
      emit('saved');
      emit('update:modelValue', false);
    }
  } catch (error) {
    console.error("Error al guardar:", error);
  } finally {
    guardando.value = false;
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.animate-modal-in { animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes modalIn { from { transform: scale(0.95) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
</style>