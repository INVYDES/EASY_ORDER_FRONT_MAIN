<template>
  <div class="min-h-screen flex">

    <!-- ── FORMULARIO ── -->
    <div class="flex items-center justify-center w-full lg:w-1/2 bg-white px-6 py-10">
      <div class="w-full max-w-md">

        <!-- Header -->
        <div class="mb-8">
          <div class="inline-flex items-center gap-2 bg-[#E8F1ED] text-[#245C4F] text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-[#DDE3DE]">
            <i class="fa-solid fa-utensils"></i> Easy Order
          </div>
          <h1 class="text-3xl font-black text-[#202723] leading-tight">Crea tu cuenta</h1>
          <p class="text-[#68736C] mt-1.5 text-sm">Explora menús, haz pedidos y sigue tus órdenes en tiempo real.</p>
        </div>

        <!-- Alerts -->
        <div v-if="errorMessage" class="mb-4 p-3.5 text-sm text-[#B93838] bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <i class="fa-solid fa-circle-xmark"></i> <span>{{ errorMessage }}</span>
        </div>
        <div v-if="successMessage" class="mb-4 p-3.5 text-sm text-[#26734D] bg-[#E8F1ED] border border-[#26734D]/30 rounded-xl flex items-center gap-2">
          <i class="fa-solid fa-circle-check"></i> <span>{{ successMessage }}</span>
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
                :class="['w-full px-4 py-3 pr-12 border rounded-xl focus:ring-1 focus:ring-[#245C4F] focus:outline-none transition-all text-sm',
                  errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200']" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition text-sm cursor-pointer">
                <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
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
            class="w-full py-3.5 text-white bg-[#245C4F] rounded-xl hover:bg-[#1D4A3F] transition-all disabled:opacity-50 font-bold text-sm shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer">
            <div v-if="loading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
            <span class="inline-flex items-center gap-2">
              <i class="fa-solid fa-arrow-right"></i>
              {{ loading ? 'Creando cuenta...' : 'Comenzar a pedir' }}
            </span>
          </button>

        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?
          <RouterLink to="/login" class="text-[#245C4F] font-bold hover:underline">Inicia sesión</RouterLink>
        </p>

        <p class="mt-3 text-center text-xs text-gray-400">
          ¿Eres dueño de un restaurante?
          <RouterLink to="/registro/dueno" class="text-[#245C4F] hover:underline">Regístrate aquí</RouterLink>
        </p>

      </div>
    </div>

    <!-- ── PANEL DECORATIVO ── -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#245C4F] via-[#1D4A3F] to-[#14332B] items-center justify-center overflow-hidden">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:28px_28px]"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600 rounded-full blur-3xl opacity-20"></div>
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-[#245C4F] rounded-full blur-3xl opacity-20"></div>

      <div class="relative z-10 text-center text-white px-12 space-y-8">
        <div class="flex justify-center items-center gap-5 text-4xl text-emerald-200">
          <i class="fa-solid fa-pizza-slice"></i>
          <i class="fa-solid fa-burger"></i>
          <i class="fa-solid fa-mug-hot"></i>
        </div>
        <h2 class="text-4xl font-black leading-tight">
          El menú de todos<br>tus restaurantes<br>favoritos
        </h2>
        <p class="text-emerald-100 text-lg leading-relaxed">
          Haz pedidos, sigue tus órdenes en tiempo real<br>y disfruta de ofertas exclusivas.
        </p>
        <div class="flex justify-center gap-8 text-sm text-emerald-200">
          <div class="flex flex-col items-center gap-1.5">
            <i class="fa-solid fa-motorcycle text-2xl"></i>
            <span>A domicilio</span>
          </div>
          <div class="flex flex-col items-center gap-1.5">
            <i class="fa-solid fa-store text-2xl"></i>
            <span>Para recoger</span>
          </div>
          <div class="flex flex-col items-center gap-1.5">
            <i class="fa-solid fa-location-dot text-2xl"></i>
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
import { apiClient } from '@/utils/apiClient'
import { sessionSet } from '@/utils/session'

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
    const data = await apiClient.post('/register-cliente', form.value)

    if (!data.success) throw new Error(data.message || 'No pudimos crear tu cuenta')

    sessionSet('token', data.token || data.data?.token, true)
    sessionSet('user',  JSON.stringify(data.user || data.data), true)

    successMessage.value = '¡Bienvenido! Explorando restaurantes...'
    setTimeout(() => router.push('/panel/cliente'), 1200)

  } catch (e: any) {
    if (e.response?.data?.errors) {
      errors.value = e.response.data.errors
      errorMessage.value = 'Por favor, corrige los errores del formulario.'
    } else {
      errorMessage.value = e.response?.data?.message || e.message || 'Error al procesar el registro'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }
</style>