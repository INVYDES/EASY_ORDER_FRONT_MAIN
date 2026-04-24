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
              <img v-if="previewUrl" :src="previewUrl" class="w-full h-full object-cover" />
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
            <div class="relative">
              <input 
                v-model="searchProd"
                type="text"
                placeholder="🔍 Buscar producto para añadir..."
                @focus="isFocused = true"
                @blur="setTimeout(() => isFocused = false, 200)"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm"
              />
              
              <!-- Resultados búsqueda / Lista desplegable -->
              <div v-if="isFocused && filteredProducts.length > 0" class="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto animate-fade-in border-t-4 border-t-indigo-500">
                <div class="p-2 border-b border-gray-50 bg-gray-50/50">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Selecciona un producto</p>
                </div>
                <button 
                  v-for="p in filteredProducts" 
                  :key="p.id"
                  @click="addProduct(p)"
                  class="w-full px-4 py-3 text-left hover:bg-indigo-50 flex items-center justify-between group transition-colors border-b border-gray-50 last:border-0"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-white">
                      <img v-if="p.imagen_url" :src="p.imagen_url" class="w-full h-full object-cover" />
                      <span v-else class="text-lg">🍽️</span>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">{{ p.nombre }}</p>
                      <p class="text-[10px] text-gray-400 font-medium">{{ p.categoria?.nombre || 'Producto' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-black text-gray-400 group-hover:text-indigo-500 transition-colors">${{ p.precio }}</span>
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
              :key="p.id"
              class="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  <img v-if="p.imagen_url" :src="p.imagen_url" class="w-full h-full object-cover" />
                  <span v-else>🍽️</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-800">{{ p.nombre }}</p>
                  <p class="text-[10px] text-gray-400 font-medium">{{ p.categoria?.nombre || 'Sin categoría' }}</p>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const props = defineProps({
  paquete: { type: Object, default: null },
  availableProducts: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'saved'])

const isEdit = computed(() => !!props.paquete)
const loading = ref(false)
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
  if (props.paquete) {
    form.nombre = props.paquete.nombre
    form.descripcion = props.paquete.descripcion
    form.precio = props.paquete.precio
    form.productos = props.paquete.productos.map(p => ({
      ...p,
      cantidad: p.pivot?.cantidad || 1
    }))
    previewUrl.value = props.paquete.imagen_url
  }
})

const filteredProducts = computed(() => {
  const s = searchProd.value.toLowerCase()
  const available = props.availableProducts.filter(p => !form.productos.find(fp => fp.id === p.id))
  
  if (!s) return available.slice(0, 20) // Mostrar primeros 20 por defecto
  
  return available.filter(p => 
    p.nombre.toLowerCase().includes(s)
  ).slice(0, 20)
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
  })

  // Para Laravel spoofing de PUT
  if (isEdit.value) {
    formData.append('_method', 'PUT')
  }

  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
    
    const url = isEdit.value ? `${API_URL}/paquetes/${props.paquete.id}` : `${API_URL}/paquetes`
    
    const res = await fetch(url, {
      method: 'POST', // Usamos POST siempre y _method para PUT
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const data = await res.json()
    if (data.success) {
      emit('saved', data.data)
    } else {
      alert(data.message || 'Error al guardar el paquete')
    }
  } catch (error) {
    console.error('Error saving package:', error)
    alert('Error de conexión')
  } finally {
    loading.value = false
  }
}
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
