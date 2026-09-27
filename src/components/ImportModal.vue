<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">

      <!-- Encabezado -->
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-gray-800">{{ titulo }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>

      <!-- Instrucciones + plantilla -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 text-sm text-blue-700">
        <p class="font-semibold mb-1">📋 Formato requerido</p>
        <p>
          El archivo debe ser <strong>CSV o Excel</strong> con las columnas:
          <code class="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono ml-1">
            {{ columnasPlantilla.join(', ') }}
          </code>
        </p>
        <p v-if="notaFormato" class="mt-1 text-xs text-blue-600">{{ notaFormato }}</p>

        <!-- Plantilla vacía con los encabezados correctos -->
        <button
          type="button"
          @click="descargarPlantilla"
          :disabled="generandoPlantilla"
          class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>{{ generandoPlantilla ? '⏳' : '⬇️' }}</span>
          {{ generandoPlantilla ? 'Generando plantilla...' : 'Descargar plantilla (.xlsx)' }}
        </button>
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
        <p class="text-xs text-gray-400 mt-1">CSV o Excel · máximo {{ maxFilas }} registros</p>
      </div>

      <!-- Opciones -->
      <div v-if="fileSelected" class="mt-4 space-y-2">
        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input v-model="sobrescribir" type="checkbox" class="accent-indigo-600" />
          Sobrescribir {{ etiquetaItems }} existentes (por nombre)
        </label>
      </div>

      <!-- Vista previa -->
      <div v-if="previewData.length > 0" class="mt-5">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Vista previa (primeros {{ previewData.length }})
        </p>
        <div class="overflow-x-auto rounded-xl border border-gray-100">
          <table class="w-full text-xs">
            <thead class="bg-gray-50">
              <tr>
                <th
                  v-for="col in columnasPreview"
                  :key="col.key"
                  class="text-left px-3 py-2 font-semibold text-gray-500"
                >
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="(fila, i) in previewData" :key="i" class="hover:bg-gray-50">
                <td v-for="col in columnasPreview" :key="col.key" class="px-3 py-2 text-gray-800">
                  {{ fila[col.key] ?? '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="mt-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
        {{ errorMessage }}
      </div>

      <!-- Advertencia de precio (409): requiere confirmación explícita -->
      <div v-if="advertencia" class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p class="text-sm font-semibold text-amber-800 mb-1">⚠️ Confirmación requerida</p>
        <p class="text-sm text-amber-700">{{ advertencia }}</p>
        <button
          @click="ejecutar(true)"
          :disabled="importing"
          class="mt-3 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition disabled:opacity-50"
        >
          {{ importing ? 'Importando...' : 'Continuar de todos modos' }}
        </button>
      </div>

      <!-- Progreso -->
      <div v-if="importing" class="mt-4">
        <div class="flex justify-between text-sm text-gray-600 mb-1">
          <span>Importando {{ etiquetaItems }}...</span>
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
        </div>
        <div v-if="importResult.errores?.length" class="mt-2 text-xs text-red-600">
          <p class="font-semibold">Con errores ({{ importResult.errores.length }}):</p>
          <p v-for="(err, i) in importResult.errores.slice(0, 5)" :key="i">
            • {{ err.producto || err.paquete || err.ingrediente || '—' }}: {{ err.error }}
          </p>
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
          @click="ejecutar(false)"
          :disabled="!fileSelected || importing"
          class="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ importing ? 'Importando...' : `Importar ${etiquetaItems}` }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { apiClient } from '@/utils/apiClient'
import { leerFilasDeArchivo, descargarPlantillaExcel } from '@/utils/excel'

const props = defineProps({
  titulo: { type: String, required: true },
  /** Endpoint al que se envía el POST, p. ej. '/paquetes/import' */
  endpoint: { type: String, required: true },
  /** Clave del arreglo dentro del body, p. ej. 'paquetes' */
  claveItems: { type: String, required: true },
  /** Nombre plural mostrado en textos y botones */
  etiquetaItems: { type: String, default: 'registros' },
  /** Encabezados que se esperan en el archivo (y en la plantilla) */
  columnasPlantilla: { type: Array, required: true },
  /** Columnas mostradas en la vista previa: [{ key, label }] */
  columnasPreview: { type: Array, required: true },
  nombreArchivoPlantilla: { type: String, required: true },
  hoja: { type: String, default: 'Datos' },
  notaFormato: { type: String, default: '' },
  maxFilas: { type: Number, default: 200 },
  /** Convierte una fila del archivo en el objeto que espera el backend */
  mapearFila: { type: Function, required: true },
})

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
const sobrescribir      = ref(true)
const advertencia       = ref('')
const generandoPlantilla = ref(false)

const descargarPlantilla = async () => {
  if (generandoPlantilla.value) return
  generandoPlantilla.value = true
  errorMessage.value = ''
  try {
    await descargarPlantillaExcel(props.columnasPlantilla, props.nombreArchivoPlantilla, props.hoja)
  } catch (err) {
    errorMessage.value = 'No se pudo generar la plantilla'
  } finally {
    generandoPlantilla.value = false
  }
}

const processFile = async (file) => {
  fileName.value     = file.name
  fileSelected.value = true
  errorMessage.value = ''
  advertencia.value  = ''
  previewData.value  = []
  rawData.value      = []
  importResult.value = null

  try {
    const filas = await leerFilasDeArchivo(file)

    if (filas.length === 0) {
      errorMessage.value = 'El archivo no contiene datos'
      fileSelected.value = false
      return
    }

    if (filas.length > props.maxFilas) {
      errorMessage.value = `El archivo excede el límite de ${props.maxFilas} registros`
      fileSelected.value = false
      return
    }

    rawData.value     = filas
    previewData.value = filas.slice(0, 5)
  } catch (err) {
    errorMessage.value = 'Error al leer el archivo. Verifica el formato.'
    fileSelected.value = false
  }
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
const ejecutar = async (forzar) => {
  if (!rawData.value.length) return

  importing.value      = true
  importProgress.value = 0
  errorMessage.value   = ''
  importResult.value   = null

  if (!forzar) advertencia.value = ''

  let interval = null

  try {
    interval = setInterval(() => {
      importProgress.value = Math.min(importProgress.value + 10, 90)
    }, 150)

    const data = await apiClient.post(props.endpoint, {
      [props.claveItems]: rawData.value.map(props.mapearFila),
      sobrescribir: sobrescribir.value,
      forzar_precio: forzar,
    })

    clearInterval(interval)
    interval = null
    importProgress.value = 100

    if (data.success || data.data) {
      advertencia.value  = ''
      importResult.value = data.data || data
      setTimeout(() => {
        emit('imported')
        emit('close')
      }, 1800)
    } else {
      errorMessage.value = data.message || 'Error al importar'
    }
  } catch (e) {
    // El backend bloquea la importación si sobrescribiría el precio de un
    // paquete que está en órdenes sin cobrar: se pide confirmación.
    if (e?.response?.status === 409 && e.response.data?.code === 'PRECIO_EN_ORDEN_SIN_COBRAR') {
      advertencia.value    = e.response.data.message
      importProgress.value = 0
    } else {
      errorMessage.value = e.response?.data?.message || 'Error al conectar con el servidor'
    }
  } finally {
    if (interval) clearInterval(interval)
    importing.value = false
  }
}
</script>
