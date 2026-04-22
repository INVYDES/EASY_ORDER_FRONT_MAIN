<template>
  <div class="min-h-screen flex">

    <!-- ── FORMULARIO ── -->
    <div class="flex items-center justify-center w-full lg:w-1/2 bg-white px-6 py-10">
      <div class="w-full max-w-md">

        <!-- Header -->
        <div class="mb-8">
          <div class="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <span>🍽️</span> Easy Order
          </div>
          <h1 class="text-3xl font-black text-gray-900 leading-tight">Crea tu cuenta</h1>
          <p class="text-gray-500 mt-1.5 text-sm">Explora menús, haz pedidos y sigue tus órdenes en tiempo real.</p>
        </div>

        <!-- Alerts -->
        <div v-if="errorMessage" class="mb-4 p-3.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <span>❌</span> {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="mb-4 p-3.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
          <span>✅</span> {{ successMessage }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">

          <!-- Nombre -->
          <div>
            <label class="block mb-1.5 text-sm font-semibold text-gray-700">Nombre completo</label>
            <input v-model="form.nombre" type="text" placeholder="¿Cómo te llamas?" required
              :class="['w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm',
                errors.nombre ? 'border-red-400 bg-red-50' : 'border-gray-200']" />
            <p v-if="errors.nombre" class="text-xs text-red-500 mt-1">{{ errors.nombre[0] }}</p>
          </div>

          <!-- Email -->
          <div>
            <label class="block mb-1.5 text-sm font-semibold text-gray-700">Correo electrónico</label>
            <input v-model="form.email" type="email" placeholder="tu@correo.com" required
              :class="['w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm',
                errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200']" />
            <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email[0] }}</p>
          </div>

          <!-- Teléfono -->
          <div>
            <label class="block mb-1.5 text-sm font-semibold text-gray-700">
              Teléfono <span class="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input v-model="form.telefono" type="tel" placeholder="Ej. 5512345678"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm" />
          </div>

          <!-- Contraseña -->
          <div>
            <label class="block mb-1.5 text-sm font-semibold text-gray-700">Contraseña</label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'"
                placeholder="Mínimo 6 caracteres" required
                :class="['w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm',
                  errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200']" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition text-sm">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <p v-if="errors.password" class="text-xs text-red-500 mt-1">{{ errors.password[0] }}</p>
          </div>

          <!-- Confirmar contraseña -->
          <div>
            <label class="block mb-1.5 text-sm font-semibold text-gray-700">Confirmar contraseña</label>
            <input v-model="form.password_confirmation" :type="showPassword ? 'text' : 'password'"
              placeholder="Repite tu contraseña" required
              :class="['w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm',
                passwordMismatch ? 'border-red-400 bg-red-50' : 'border-gray-200']" />
            <p v-if="passwordMismatch" class="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
          </div>

          <!-- Indicador de fuerza de contraseña -->
          <div v-if="form.password" class="space-y-1.5">
            <div class="flex gap-1">
              <div v-for="i in 4" :key="i"
                class="flex-1 h-1.5 rounded-full transition-all duration-300"
                :class="i <= passwordStrength.level ? passwordStrength.color : 'bg-gray-100'"></div>
            </div>
            <p class="text-xs" :class="passwordStrength.textColor">{{ passwordStrength.label }}</p>
          </div>

          <!-- Botón -->
          <button type="submit" :disabled="loading || passwordMismatch"
            class="w-full py-3.5 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 font-bold text-sm shadow-lg shadow-indigo-200/50 flex items-center justify-center gap-2 mt-2">
            <div v-if="loading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
            <span>{{ loading ? 'Creando cuenta...' : '🚀 Comenzar a pedir' }}</span>
          </button>

        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?
          <RouterLink to="/" class="text-indigo-600 font-bold hover:underline">Inicia sesión</RouterLink>
        </p>

        <p class="mt-3 text-center text-xs text-gray-400">
          ¿Eres dueño de un restaurante?
          <RouterLink to="/registro/dueno" class="text-indigo-500 hover:underline">Regístrate aquí</RouterLink>
        </p>

      </div>
    </div>

    <!-- ── PANEL DECORATIVO ── -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 items-center justify-center overflow-hidden">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:28px_28px]"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-indigo-400 rounded-full blur-3xl opacity-20"></div>

      <div class="relative z-10 text-center text-white px-12 space-y-8">
        <div class="text-7xl">🍕🌮🍔</div>
        <h2 class="text-4xl font-black leading-tight">
          El menú de todos<br>tus restaurantes<br>favoritos
        </h2>
        <p class="text-indigo-200 text-lg leading-relaxed">
          Haz pedidos, sigue tus órdenes en tiempo real<br>y disfruta de ofertas exclusivas.
        </p>
        <div class="flex justify-center gap-6 text-sm text-indigo-300">
          <div class="flex flex-col items-center gap-1">
            <span class="text-2xl">🛵</span>
            <span>A domicilio</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-2xl">🏪</span>
            <span>Para recoger</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-2xl">📍</span>
            <span>En mesa</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '@/config/api'

const router = useRouter()

const loading        = ref(false)
const errorMessage   = ref('')
const successMessage = ref('')
const showPassword   = ref(false)
const errors         = ref<Record<string, string[]>>({})

const form = ref({
  nombre:               '',
  email:                '',
  telefono:             '',
  password:             '',
  password_confirmation:'',
})

// ── Validaciones en tiempo real ────────────────────────────────────────────────
const passwordMismatch = computed(() =>
  form.value.password_confirmation.length > 0 &&
  form.value.password !== form.value.password_confirmation
)

const passwordStrength = computed(() => {
  const p = form.value.password
  if (!p) return { level: 0, label: '', color: '', textColor: '' }
  let level = 0
  if (p.length >= 6)  level++
  if (p.length >= 10) level++
  if (/[A-Z]/.test(p) || /[0-9]/.test(p)) level++
  if (/[^A-Za-z0-9]/.test(p)) level++
  const map = [
    { level:1, label:'Contraseña débil',    color:'bg-red-400',    textColor:'text-red-500'    },
    { level:2, label:'Contraseña regular',  color:'bg-amber-400',  textColor:'text-amber-600'  },
    { level:3, label:'Contraseña buena',    color:'bg-indigo-400', textColor:'text-indigo-600' },
    { level:4, label:'Contraseña fuerte ✅',color:'bg-emerald-500',textColor:'text-emerald-600'},
  ]
  return map[level - 1] || map[0]
})

// ── Submit ─────────────────────────────────────────────────────────────────────
const handleSubmit = async () => {
  if (passwordMismatch.value) return
  loading.value      = true
  errorMessage.value = ''
  errors.value       = {}

  try {
    const res  = await fetch(`${API_URL}/register-cliente`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(form.value),
    })
    const data = await res.json()

    if (!res.ok) {
      if (data.errors) { errors.value = data.errors; return }
      throw new Error(data.message || 'No pudimos crear tu cuenta')
    }

    // Guardar sesión
    const storage = localStorage
    storage.setItem('token', data.token)
    storage.setItem('user',  JSON.stringify(data.user))

    successMessage.value = '¡Bienvenido! Explorando restaurantes...'
    setTimeout(() => router.push('/panel/cliente'), 1200)

  } catch (e: any) {
    errorMessage.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }
</style>