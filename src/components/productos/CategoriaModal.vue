<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

      <!-- Encabezado -->
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-gray-800">
          {{ categoria ? 'Editar Categoría' : 'Nueva Categoría' }}
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none transition">✕</button>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
        {{ errorMessage }}
      </div>

      <div class="space-y-4">

        <!-- Nombre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            v-model="form.nombre"
            type="text"
            placeholder="Ej. Bebidas, Postres..."
            class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            :class="errors.nombre ? 'border-red-400' : 'border-gray-200'"
          />
          <p v-if="errors.nombre" class="text-xs text-red-500 mt-1">{{ errors.nombre }}</p>
        </div>

        <!-- Descripción -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Descripción <span class="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            v-model="form.descripcion"
            placeholder="Descripción de la categoría"
            rows="2"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm resize-none"
          ></textarea>
        </div>

        <!-- Color e Ícono -->
        <div class="grid grid-cols-2 gap-3">

          <!-- Color -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div class="flex items-center gap-2">
              <input
                v-model="form.color"
                type="color"
                class="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="c in coloresRapidos"
                  :key="c"
                  type="button"
                  @click="form.color = c"
                  class="w-6 h-6 rounded-full border-2 transition"
                  :style="{ backgroundColor: c }"
                  :class="form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'"
                />
              </div>
            </div>
          </div>

          <!-- Ícono -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ícono</label>
            <div class="flex flex-wrap gap-1.5 mb-2">
              <button
                v-for="icono in iconosDisponibles"
                :key="icono"
                type="button"
                @click="form.icono = icono"
                class="w-8 h-8 rounded-lg text-lg flex items-center justify-center transition border"
                :class="form.icono === icono
                  ? 'bg-indigo-100 border-indigo-400'
                  : 'bg-gray-50 border-transparent hover:bg-gray-100'"
              >
                {{ icono }}
              </button>
            </div>
            <input
              v-model="form.icono"
              type="text"
              placeholder="Ej. 🍔"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

        </div>

        <!-- Preview -->
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            :style="{ backgroundColor: form.color + '22', border: `2px solid ${form.color}` }"
          >
            {{ form.icono || '📦' }}
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ form.nombre || 'Nombre de categoría' }}</p>
            <p class="text-xs text-gray-400">{{ form.descripcion || 'Sin descripción' }}</p>
          </div>
          <span
            class="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
            :style="{ backgroundColor: form.color + '22', color: form.color }"
          >
            Preview
          </span>
        </div>

        <!-- Orden -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Orden <span class="text-gray-400 font-normal">(menor número = primero)</span>
          </label>
          <input
            v-model.number="form.orden"
            type="number"
            min="0"
            placeholder="0"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          />
        </div>

        <!-- Activo (solo edición) -->
        <div v-if="categoria" class="flex items-center gap-2">
          <input v-model="form.activo" type="checkbox" class="w-4 h-4 accent-indigo-600 rounded" />
          <label class="text-sm text-gray-700">Categoría activa</label>
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
          @click="save"
          :disabled="loading"
          class="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50"
          :style="{ backgroundColor: form.color }"
        >
          {{ loading ? 'Guardando...' : (categoria ? 'Guardar cambios' : 'Crear categoría') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { API_URL } from '@/config/api'

// Props recibidos desde ProductosView:
//   :categoria → selectedCategoria  (Object | null)
const props = defineProps({
  categoria: { type: Object, default: null },
})

// Emits consumidos por ProductosView: @close, @saved
const emit = defineEmits(['close', 'saved'])

// ── ESTADO ─────────────────────────────────────────────────
const loading      = ref(false)
const errorMessage = ref('')

const form = reactive({
  nombre:      '',
  descripcion: '',
  color:       '#6366f1',
  icono:       '',
  orden:       0,
  activo:      true,
})

const errors = reactive({ nombre: '' })

// ── OPCIONES ───────────────────────────────────────────────
const coloresRapidos = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
]

const iconosDisponibles = [
  '🍔', '🍕', '🌮', '🍣', '🍜', '🥗',
  '🍰', '🧁', '🍦', '🥤', '🍷', '☕',
  '🥩', '🍗', '🥚', '🧀', '🥦', '📦',
]

// ── PRECARGAR EN EDICIÓN ───────────────────────────────────
watch(() => props.categoria, (c) => {
  if (c) {
    form.nombre      = c.nombre      || ''
    form.descripcion = c.descripcion || ''
    form.color       = c.color       || '#6366f1'
    form.icono       = c.icono       || ''
    form.orden       = c.orden       ?? 0
    form.activo      = c.activo      ?? true
  } else {
    Object.assign(form, {
      nombre: '', descripcion: '', color: '#6366f1', icono: '', orden: 0, activo: true,
    })
  }
  errors.nombre      = ''
  errorMessage.value = ''
}, { immediate: true })

// ── HELPERS ────────────────────────────────────────────────
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

const validate = () => {
  errors.nombre = form.nombre.trim() ? '' : 'El nombre es obligatorio'
  return !errors.nombre
}

// ── GUARDAR ────────────────────────────────────────────────
const save = async () => {
  if (!validate()) return
  loading.value      = true
  errorMessage.value = ''

  try {
    const url    = props.categoria ? `${API_URL}/categorias/${props.categoria.id}` : `${API_URL}/categorias`
    const method = props.categoria ? 'PUT' : 'POST'

    const res  = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify({
        nombre:      form.nombre.trim(),
        descripcion: form.descripcion || null,
        color:       form.color,
        icono:       form.icono       || null,
        orden:       form.orden       ?? 0,
        activo:      form.activo,
      }),
    })

    const data = await res.json()

    if (res.ok && data.success) {
      emit('saved', data.data)
    } else {
      errorMessage.value = data.errors
        ? Object.values(data.errors).flat().join(' · ')
        : data.message || 'Error al guardar categoría'
    }
  } catch {
    errorMessage.value = 'Error de conexión'
  } finally {
    loading.value = false
  }
}
</script>