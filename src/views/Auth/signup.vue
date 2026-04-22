<template>
  <div class="min-h-screen flex">

    <div class="flex items-center justify-center w-full lg:w-1/2 bg-white px-6 py-10">
      <div class="w-full max-w-2xl">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-indigo-600">Easy Order</h1>
          <p class="text-2xl font-semibold text-gray-700 mt-1">Crea tu cuenta de Propietario</p>
          <p class="text-sm text-gray-500 mt-1">Regístrate y configura tu primer restaurante en un solo paso</p>
        </div>

        <div v-if="errorMessage" class="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-lg">
          {{ successMessage }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">

          <!-- SECCIÓN 1: Información Personal -->
          <section>
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
              <span class="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Información Personal
            </h3>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">Nombre</label>
                <input v-model="formData.nombre" type="text" placeholder="Ej. Juan" required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">Apellido</label>
                <input v-model="formData.apellido" type="text" placeholder="Ej. Pérez" required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">Correo electrónico</label>
                <input v-model="formData.email" type="email" placeholder="info@gmail.com" required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
                <input v-model="formData.password" type="password" placeholder="Mínimo 8 caracteres" required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
          </section>

          <!-- SECCIÓN 2: Tu Primer Restaurante -->
          <section>
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
              <span class="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Tu Primer Restaurante
            </h3>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label class="block mb-1 text-sm font-medium text-gray-700">Nombre de la Sucursal</label>
                <input v-model="formData.restauranteNombre" type="text" placeholder="Ej. La Trattoria Centro" required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">Teléfono del Negocio</label>
                <input v-model="formData.telefono" type="tel" placeholder="2291234567" required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">Horario de Atención</label>
                <input v-model="formData.horario" type="text" placeholder="09:00 - 21:00"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>

              <div class="sm:col-span-2">
                <label class="block mb-1 text-sm font-medium text-gray-700">Calle y Número</label>
                <input v-model="formData.calle" type="text" placeholder="Ej. Av. Independencia 123" required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>

              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">Colonia</label>
                <input v-model="formData.colonia" type="text" placeholder="Ej. Centro" required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>

              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">Código Postal</label>
                <input v-model="formData.codigoPostal" type="text" placeholder="Ej. 91000" maxlength="5" required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>

              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">Ciudad</label>
                <input v-model="formData.ciudad" type="text" placeholder="Xalapa" required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">Estado</label>
                <input v-model="formData.estado" type="text" placeholder="Veracruz" required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
          </section>

          <!-- SECCIÓN 3: Suscripción y Datos Fiscales -->
          <section>
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
              <span class="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              Suscripción y Datos Fiscales
            </h3>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">RFC</label>
                <input v-model="formData.rfc" type="text" placeholder="XAXX010101000" maxlength="13" required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase" />
              </div>
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700">Régimen Fiscal</label>
                <select v-model="formData.regimenFiscal" required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-700">
                  <option value="" disabled>Selecciona régimen</option>
                  <option value="601">General de Ley Personas Morales</option>
                  <option value="603">Personas Morales con Fines no Lucrativos</option>
                  <option value="605">Sueldos y Salarios e Ingresos Asimilados</option>
                  <option value="606">Arrendamiento</option>
                  <option value="608">Demás ingresos</option>
                  <option value="612">Personas Físicas con Actividades Empresariales</option>
                  <option value="616">Sin obligaciones fiscales</option>
                  <option value="621">Incorporación Fiscal</option>
                  <option value="622">Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras</option>
                  <option value="626">Régimen Simplificado de Confianza</option>
                </select>
              </div>
            </div>

            <!-- Select de Licencia -->
            <div class="mt-4">
              <label class="block mb-1 text-sm font-medium text-gray-700">Tipo de Licencia</label>
              <select v-model="formData.tipoLicencia" required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                <option value="" disabled>Selecciona un plan</option>
                <option 
                  v-for="licencia in licencias" 
                  :key="licencia.id" 
                  :value="getLicenciaValue(licencia)"
                  :class="{ 'bg-green-50': licencia.es_prueba }"
                >
                  {{ getLicenciaTexto(licencia) }}
                </option>
              </select>
              <p v-if="cargandoLicencias" class="text-xs text-gray-500 mt-1">Cargando planes disponibles...</p>
              <p v-if="licencias.length === 0 && !cargandoLicencias" class="text-xs text-red-500 mt-1">
                No se pudieron cargar los planes. Verifica tu conexión.
              </p>
            </div>
          </section>

          <!-- Términos y Condiciones -->
          <div class="flex items-center gap-2 text-sm pt-4">
            <input v-model="aceptaTerminos" type="checkbox" required class="accent-indigo-600 w-4 h-4" />
            <span class="text-gray-600">
              Acepto los <a href="#" class="text-indigo-600 hover:underline">términos y condiciones</a>
            </span>
          </div>

          <!-- Botón de Envío -->
          <button type="submit" :disabled="cargando"
            class="w-full py-4 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-bold text-lg shadow-lg">
            {{ cargando ? 'Procesando registro...' : 'Comenzar ahora' }}
          </button>

        </form>

        <p class="mt-6 pb-10 text-sm text-gray-600 text-center">
          ¿Ya tienes cuenta?
          <RouterLink to="/" class="text-indigo-600 font-bold hover:underline">Iniciar sesión</RouterLink>
        </p>

      </div>
    </div>

    <!-- Lado Derecho Decorativo -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
      :style="{ backgroundImage: `url(${fondoSignUp})` }">
      <div class="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm"></div>
      <div class="relative z-10 flex flex-col items-center justify-center text-center text-white w-full px-12">
        <h2 class="text-4xl font-bold mb-6">Lleva tu restaurante al siguiente nivel</h2>
        <ul class="text-left space-y-4 text-lg">
          <li class="flex items-center gap-3">✅ Control de mesas en tiempo real</li>
          <li class="flex items-center gap-3">✅ Gestión de comandas y cocina</li>
          <li class="flex items-center gap-3">✅ Reportes de ventas diarios</li>
          <li class="flex items-center gap-3">✅ Facturación electrónica fácil</li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '@/config/api'
import fondoSignUp from '../../assets/imaguenes/fondo_signup.jpg'

// Types
interface Licencia {
  id: number
  nombre: string
  tipo: 'MENSUAL' | 'ANUAL' | 'PRUEBA' | 'EMPRESA'
  max_restaurantes: number | null
  max_usuarios: number | null
  precio: number | null
  precio_anual: number | null
  dias_prueba: number
  es_prueba?: boolean
  popular?: boolean
}

interface FormData {
  // Datos personales
  nombre: string
  apellido: string
  email: string
  password: string
  
  // Datos del restaurante
  restauranteNombre: string
  telefono: string
  horario: string
  calle: string
  colonia: string
  codigoPostal: string
  ciudad: string
  estado: string
  
  // Datos fiscales
  rfc: string
  regimenFiscal: string
  
  // Licencia
  tipoLicencia: string
}

interface ApiResponse {
  success: boolean
  message?: string
  data?: {
    token?: string
    user?: any
  }
  errors?: Record<string, string[]>
}

// Router
const router = useRouter()

// Estado del formulario
const formData = reactive<FormData>({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  restauranteNombre: '',
  telefono: '',
  horario: '',
  calle: '',
  colonia: '',
  codigoPostal: '',
  ciudad: '',
  estado: '',
  rfc: '',
  regimenFiscal: '612',
  tipoLicencia: ''
})

// Licencias
const licencias = ref<Licencia[]>([])
const cargandoLicencias = ref(false)

// UI State
const aceptaTerminos = ref(false)
const cargando = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// ============================================================
// CARGAR LICENCIAS DESDE LA API
// ============================================================
const cargarLicencias = async (): Promise<void> => {
  cargandoLicencias.value = true
  
  try {
    const response = await fetch(`${API_URL}/licencias/disponibles`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json() as ApiResponse

    if (data.success && data.data) {
      // Mapear y enriquecer las licencias
      licencias.value = (data.data as Licencia[]).map(lic => ({
        ...lic,
        es_prueba: lic.tipo === 'PRUEBA',
        popular: lic.id === 1 || lic.id === 2 // Básico y Premium son populares
      }))
      
      console.log('✅ Licencias cargadas:', licencias.value)
    } else {
      // Fallback con datos por defecto
      console.warn('⚠️ Usando licencias por defecto')
      licencias.value = obtenerLicenciasPorDefecto()
    }
  } catch (error) {
    console.error('❌ Error cargando licencias:', error)
    // Fallback con datos por defecto
    licencias.value = obtenerLicenciasPorDefecto()
  } finally {
    cargandoLicencias.value = false
  }
}

// Licencias por defecto en caso de error
const obtenerLicenciasPorDefecto = (): Licencia[] => {
  return [
    {
      id: 9,
      nombre: 'Prueba 30 días',
      tipo: 'PRUEBA',
      max_restaurantes: 1,
      max_usuarios: 5,
      precio: 0,
      precio_anual: 0,
      dias_prueba: 30,
      es_prueba: true
    },
    {
      id: 1,
      nombre: 'Básico Mensual',
      tipo: 'MENSUAL',
      max_restaurantes: 1,
      max_usuarios: 5,
      precio: 299,
      precio_anual: 3588,
      dias_prueba: 0,
      es_prueba: false
    },
    {
      id: 3,
      nombre: 'Básico Anual',
      tipo: 'ANUAL',
      max_restaurantes: 1,
      max_usuarios: 5,
      precio: 2999,
      precio_anual: 2999,
      dias_prueba: 0,
      es_prueba: false
    },
    {
      id: 2,
      nombre: 'Premium Mensual',
      tipo: 'MENSUAL',
      max_restaurantes: 2,
      max_usuarios: 10,
      precio: 499,
      precio_anual: 5988,
      dias_prueba: 0,
      es_prueba: false
    },
    {
      id: 4,
      nombre: 'Premium Anual',
      tipo: 'ANUAL',
      max_restaurantes: 2,
      max_usuarios: 10,
      precio: 4999,
      precio_anual: 4999,
      dias_prueba: 0,
      es_prueba: false
    }
  ]
}

// ============================================================
// UTILIDADES PARA LICENCIAS
// ============================================================
const getLicenciaValue = (licencia: Licencia): string => {
  if (licencia.tipo === 'PRUEBA') {
    return 'prueba-1'
  }
  return `${licencia.tipo.toLowerCase()}-${licencia.max_restaurantes}`
}

const getLicenciaTexto = (licencia: Licencia): string => {
  if (licencia.tipo === 'PRUEBA') {
    return `🎁 ${licencia.nombre} — ${licencia.dias_prueba} días gratis (${licencia.max_restaurantes} restaurante)`
  }
  if (licencia.tipo === 'MENSUAL') {
    const precio = licencia.precio || 0
    return `${licencia.nombre} — ${licencia.max_restaurantes} restaurante(s) — $${precio}/mes`
  }
  const precio = licencia.precio_anual || licencia.precio || 0
  return `${licencia.nombre} — ${licencia.max_restaurantes} restaurante(s) — $${precio}/año`
}

// ============================================================
// ENVÍO DEL FORMULARIO
// ============================================================
const handleSubmit = async (): Promise<void> => {
  // Limpiar mensajes previos
  errorMessage.value = ''
  successMessage.value = ''

  // Validar términos
  if (!aceptaTerminos.value) {
    errorMessage.value = 'Debes aceptar los términos y condiciones'
    return
  }

  // Validar licencia seleccionada
  if (!formData.tipoLicencia) {
    errorMessage.value = 'Debes seleccionar un tipo de licencia'
    return
  }

  // Validar contraseña
  if (formData.password.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  cargando.value = true

  try {
    // Preparar payload para la API
    const payload = {
      // Datos del propietario
      nombre: formData.nombre,
      apellido: formData.apellido,
      correo: formData.email,
      password: formData.password,

      // Datos fiscales
      rfc: formData.rfc.toUpperCase(),
      regimen_fiscal: formData.regimenFiscal,

      // Datos del restaurante
      restaurante_nombre: formData.restauranteNombre,
      telefono: formData.telefono,
      calle: formData.calle,
      colonia: formData.colonia,
      codigo_postal: formData.codigoPostal,
      ciudad: formData.ciudad,
      estado: formData.estado,
      restaurante_horario: formData.horario,

      // Tipo de licencia
      tipo_licencia: formData.tipoLicencia
    }

    console.log('📤 Enviando payload:', payload)

    const response = await fetch(`${API_URL}/propietarios`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json' 
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json() as ApiResponse

    if (!response.ok) {
      // Mostrar errores de validación específicos
      if (data.errors) {
        const errorMessages = Object.values(data.errors).flat().join(', ')
        throw new Error(errorMessages)
      }
      throw new Error(data.message || 'Error al procesar el registro')
    }

    // Guardar token y datos del usuario si vienen en la respuesta
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token)

      // ✅ FIX: guardar user con roles para que el guard funcione correctamente
      // La respuesta del propietario no incluye roles → los inferimos
      const userConRol = {
        ...data.data.user,
        roles: data.data.user?.roles?.length
          ? data.data.user.roles
          : [{ id: 1, nombre: 'PROPIETARIO' }]
      }
      localStorage.setItem('user', JSON.stringify(userConRol))

      successMessage.value = '¡Cuenta creada! Entrando al panel...'

      // ✅ FIX: redirigir directo a /panel/admin, no a '/'
      // Pasar por '/' con token activo puede causar que el guard
      // no redirija si el user en localStorage no tiene roles
      setTimeout(() => router.push('/panel/admin'), 1200)

    } else {
      // Sin token → que inicie sesión manualmente
      successMessage.value = '✅ ¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...'
      setTimeout(() => router.push('/'), 2000)
    }

  } catch (error: any) {
    console.error('❌ Error en registro:', error)
    errorMessage.value = error.message || 'Error de conexión con el servidor'
  } finally {
    cargando.value = false
  }
}

// ============================================================
// LIFECYCLE HOOKS
// ============================================================
onMounted(() => {
  cargarLicencias()
})
</script>