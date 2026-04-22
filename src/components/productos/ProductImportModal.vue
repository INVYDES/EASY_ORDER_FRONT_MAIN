<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">

      <!-- Encabezado -->
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-gray-800">Importar Productos</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>

      <!-- Instrucciones -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 text-sm text-blue-700">
        <p class="font-semibold mb-1">📋 Formato requerido</p>
        <p>
          El archivo debe ser <strong>CSV o Excel</strong> con las columnas:
          <code class="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono ml-1">
            nombre, precio, descripcion, categoria_id, stock, stock_minimo
          </code>
        </p>
      </div>

      <!-- Dropzone -->
      <div
        class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
        :class="
          isDragging
            ? 'border-indigo-400 bg-indigo-50'
            : fileSelected
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
        "
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="fileInput?.click()"
      >
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept=".csv,.xlsx,.xls"
          @change="handleFileSelect"
        />
        <div class="text-3xl mb-2">{{ fileSelected ? '📄' : '📁' }}</div>
        <p class="text-sm font-medium text-gray-700">
          {{ fileName || 'Arrastra un archivo o haz clic para seleccionar' }}
        </p>
        <p class="text-xs text-gray-400 mt-1">CSV o Excel · máximo 100 productos</p>
      </div>

      <!-- Opciones -->
      <div v-if="fileSelected" class="mt-4 space-y-2">
        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input v-model="overwriteExisting" type="checkbox" class="accent-indigo-600" />
          Sobrescribir productos existentes (por nombre)
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input v-model="createCategories" type="checkbox" class="accent-indigo-600" />
          Crear categorías automáticamente si no existen
        </label>
      </div>

      <!-- Vista previa -->
      <div v-if="previewData.length > 0" class="mt-5">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Vista previa (primeros {{ previewData.length }} productos)
        </p>
        <div class="overflow-x-auto rounded-xl border border-gray-100">
          <table class="w-full text-xs">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-3 py-2 font-semibold text-gray-500">Nombre</th>
                <th class="text-left px-3 py-2 font-semibold text-gray-500">Precio</th>
                <th class="text-left px-3 py-2 font-semibold text-gray-500">Stock</th>
                <th class="text-left px-3 py-2 font-semibold text-gray-500">Categoría ID</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="(item, i) in previewData" :key="i" class="hover:bg-gray-50">
                <td class="px-3 py-2 text-gray-800">{{ item.nombre || '—' }}</td>
                <td class="px-3 py-2">${{ Number(item.precio || 0).toFixed(2) }}</td>
                <td class="px-3 py-2">{{ item.stock || 0 }}</td>
                <td class="px-3 py-2 text-gray-400">{{ item.categoria_id || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="mt-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
        {{ errorMessage }}
      </div>

      <!-- Progreso -->
      <div v-if="importing" class="mt-4">
        <div class="flex justify-between text-sm text-gray-600 mb-1">
          <span>Importando productos...</span>
          <span>{{ importProgress }}%</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div
            class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: importProgress + '%' }"
          ></div>
        </div>
      </div>

      <!-- Resultado -->
      <div v-if="importResult" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <p class="text-sm font-semibold text-emerald-700 mb-2">✅ Importación completada</p>
        <div class="grid grid-cols-2 gap-2 text-sm text-emerald-700">
          <div>Creados: <span class="font-bold">{{ importResult.creados }}</span></div>
          <div>Actualizados: <span class="font-bold">{{ importResult.actualizados }}</span></div>
          <div v-if="importResult.errores?.length" class="col-span-2 text-red-600">
            Con errores: {{ importResult.errores.length }}
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex gap-3 mt-6">
        <button
          @click="$emit('close')"
          class="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
        >
          Cancelar
        </button>
        <button
          @click="startImport"
          :disabled="!fileSelected || importing"
          class="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ importing ? 'Importando...' : 'Importar Productos' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { API_URL } from '@/config/api'

// Emits consumidos por ProductosView: @close, @imported
const emit = defineEmits(['close', 'imported'])

const fileInput         = ref(null)
const fileName          = ref('')
const fileSelected      = ref(false)
const isDragging        = ref(false)
const previewData       = ref([])
const rawData           = ref([])
const importing         = ref(false)
const importProgress    = ref(0)
const errorMessage      = ref('')
const importResult      = ref(null)
const overwriteExisting = ref(true)
const createCategories  = ref(false)

// ── HELPERS ────────────────────────────────────────────────
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

const normalizeRow = (item) => ({
  nombre:       item.nombre       || item.Nombre       || item.name        || item.Name        || '',
  precio:       parseFloat(item.precio || item.Precio   || item.price       || item.Price)      || 0,
  descripcion:  item.descripcion  || item.Descripcion  || item.description || item.Description || '',
  categoria_id: item.categoria_id || item.CategoriaId  || item.category_id || null,
  stock:        parseInt(item.stock        || item.Stock)       || 0,
  stock_minimo: parseInt(item.stock_minimo || item.StockMinimo) || 5,
})

// ── FILE HANDLING ──────────────────────────────────────────
const processFile = (file) => {
  fileName.value     = file.name
  fileSelected.value = true
  errorMessage.value = ''
  previewData.value  = []
  rawData.value      = []
  importResult.value = null

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data     = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet    = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      if (jsonData.length === 0) {
        errorMessage.value = 'El archivo no contiene datos'
        fileSelected.value = false
        return
      }
      if (jsonData.length > 100) {
        errorMessage.value = 'El archivo excede el límite de 100 productos'
        fileSelected.value = false
        return
      }

      rawData.value     = jsonData
      previewData.value = jsonData.slice(0, 5)
    } catch (err) {
      errorMessage.value = 'Error al leer el archivo. Verifica el formato.'
      fileSelected.value = false
    }
  }
  reader.readAsArrayBuffer(file)
}

const handleFileSelect = (e) => {
  const f = e.target.files[0]
  if (f) processFile(f)
}

const handleDrop = (e) => {
  isDragging.value = false
  const f = e.dataTransfer.files[0]
  if (f) processFile(f)
}

// ── IMPORTAR ───────────────────────────────────────────────
const startImport = async () => {
  if (!rawData.value.length) return
  importing.value      = true
  importProgress.value = 0
  errorMessage.value   = ''
  importResult.value   = null

  try {
    const productos = rawData.value.map(normalizeRow)

    const interval = setInterval(() => {
      importProgress.value = Math.min(importProgress.value + 10, 90)
    }, 150)

    const res = await fetch(`${API_URL}/productos/import`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productos, sobrescribir: overwriteExisting.value }),
    })

    clearInterval(interval)
    importProgress.value = 100

    const data = await res.json()

    if (res.ok && data.success) {
      importResult.value = data.data
      // Avisa al padre y cierra tras mostrar el resultado
      setTimeout(() => {
        emit('imported')
        emit('close')
      }, 1800)
    } else {
      errorMessage.value = data.message || 'Error al importar productos'
    }
  } catch {
    errorMessage.value = 'Error al conectar con el servidor'
  } finally {
    importing.value = false
  }
}
</script>