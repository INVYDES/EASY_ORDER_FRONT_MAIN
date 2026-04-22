import { ref } from 'vue'
import { trabajadoresDB, type Trabajador } from './trabajadores'
import { restaurantesDB, type Restaurante } from './restaurantes'

export type Role = 'owner' | 'employee' | null

// O puedes exportar un tipo para tus usuarios
export interface User {
    id?: string; // ID único del dueño/cliente
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    telefono?: string;
    rfc?: string;
    regimenFiscal?: string;
    calle?: string;
    colonia?: string;
    codigoPostal?: string;
    ciudad?: string;
    estado?: string;
    tipoLicencia?: string;
}

// Simulamos una base de datos local en memoria, respaldada por localStorage
const STORAGE_KEY = 'mta_mock_users'
const SESSION_KEY = 'mta_current_session'
const ROLE_KEY = 'mta_current_role'
const EMPLOYEE_KEY = 'mta_current_employee'
const RESTAURANT_KEY = 'mta_current_restaurant'

const initialData = localStorage.getItem(STORAGE_KEY)
export const usersDB = ref<User[]>(initialData ? JSON.parse(initialData) : [])

// Sesión actual del Owner (si es Dueño)
const initialSession = localStorage.getItem(SESSION_KEY)
export const currentUser = ref<User | null>(initialSession ? JSON.parse(initialSession) : null)

// Roles y sesión de empleado
export const currentRole = ref<Role>(localStorage.getItem(ROLE_KEY) as Role || null)
export const currentEmployee = ref<Trabajador | null>(localStorage.getItem(EMPLOYEE_KEY) ? JSON.parse(localStorage.getItem(EMPLOYEE_KEY) as string) : null)
export const currentRestaurant = ref<Restaurante | null>(localStorage.getItem(RESTAURANT_KEY) ? JSON.parse(localStorage.getItem(RESTAURANT_KEY) as string) : null)

export function registerUser(userData: User) {
    // Verificamos si el usuario ya existe
    const exists = usersDB.value.find(u => u.email === userData.email)
    if (exists) {
        return { success: false, message: 'El correo electrónico ya está registrado.' }
    }

    // Generar un ID único simple para el usuario
    userData.id = Date.now().toString() + Math.random().toString(36).substring(2, 9)

    usersDB.value.push(userData)
    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usersDB.value))

    return { success: true, message: 'Usuario registrado exitosamente.' }
}

export function loginUser(email: string, password?: string) {
    // Forzamos la lectura del localStorage por precaución al recargar
    const currentData = localStorage.getItem(STORAGE_KEY)
    if (currentData) {
        usersDB.value = JSON.parse(currentData)
    }

    const user = usersDB.value.find(u => u.email === email && u.password === password)

    if (user) {
        // Almacenar en la sesión
        currentUser.value = user
        currentRole.value = 'owner'
        currentEmployee.value = null
        currentRestaurant.value = null

        localStorage.setItem(SESSION_KEY, JSON.stringify(user))
        localStorage.setItem(ROLE_KEY, 'owner')
        localStorage.removeItem(EMPLOYEE_KEY)
        localStorage.removeItem(RESTAURANT_KEY)

        return { success: true, user }
    }
    return { success: false, message: 'Credenciales inválidas.' }
}

export function loginEmpleado(usuario: string, password?: string, restauranteNombre?: string) {
    // 1. Buscar al empleado
    const currentTrabajadoresData = localStorage.getItem('mta_mock_trabajadores')
    if (currentTrabajadoresData) trabajadoresDB.value = JSON.parse(currentTrabajadoresData)

    const empleado = trabajadoresDB.value.find(t => t.usuario === usuario && t.password === password)

    if (!empleado) {
        return { success: false, message: 'Credenciales de empleado inválidas.' }
    }

    // 2. Buscar el restaurante del dueño que coincide con el nombre
    const currentRestaurantesData = localStorage.getItem('mta_mock_restaurantes')
    if (currentRestaurantesData) restaurantesDB.value = JSON.parse(currentRestaurantesData)

    const restaurante = restaurantesDB.value.find(r =>
        r.ownerId === empleado.ownerId &&
        r.nombre.toLowerCase() === restauranteNombre?.toLowerCase()
    )

    if (!restaurante) {
        return { success: false, message: 'Restaurante no encontrado o no pertenece a su cuenta.' }
    }

    // 3. Establecer sesión
    currentRole.value = 'employee'
    currentEmployee.value = empleado
    currentRestaurant.value = restaurante
    currentUser.value = null

    localStorage.setItem(ROLE_KEY, 'employee')
    localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(empleado))
    localStorage.setItem(RESTAURANT_KEY, JSON.stringify(restaurante))
    localStorage.removeItem(SESSION_KEY)

    return { success: true, empleado, restaurante }
}

export function logoutUser() {
    currentUser.value = null
    currentRole.value = null
    currentEmployee.value = null
    currentRestaurant.value = null

    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(EMPLOYEE_KEY)
    localStorage.removeItem(RESTAURANT_KEY)
}
