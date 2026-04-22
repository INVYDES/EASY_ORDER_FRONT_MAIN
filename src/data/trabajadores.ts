import { ref } from 'vue'

export interface Trabajador {
    id: string;         // ID único del empleado
    ownerId: string;    // ID del dueño/cliente (User.id)
    nombre: string;
    apellidos: string;
    rol: string;        // 'Cajero', 'Mesero', 'Cocinero', 'Administrador', 'Barman'
    telefono: string;
    usuario: string;    // Username de acceso
    password?: string;  // Contraseña de acceso
    fechaIngreso: string;
}

const STORAGE_KEY = 'mta_mock_trabajadores'
const initialData = localStorage.getItem(STORAGE_KEY)
export const trabajadoresDB = ref<Trabajador[]>(initialData ? JSON.parse(initialData) : [])

export function agregarTrabajador(data: Omit<Trabajador, 'id'>) {
    // Validar usuario duplicado
    const exists = trabajadoresDB.value.find(t => t.usuario === data.usuario)
    if (exists) {
        return { success: false, message: 'El usuario ya existe.' }
    }

    const nuevo: Trabajador = {
        ...data,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9)
    }

    trabajadoresDB.value.push(nuevo)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trabajadoresDB.value))
    return { success: true, message: 'Trabajador agregado exitosamente.', trabajador: nuevo }
}

export function obtenerTrabajadoresPorOwner(ownerId: string) {
    const currentData = localStorage.getItem(STORAGE_KEY)
    if (currentData) {
        trabajadoresDB.value = JSON.parse(currentData)
    }
    return trabajadoresDB.value.filter(t => t.ownerId === ownerId)
}

export function eliminarTrabajador(id: string) {
    const currentData = localStorage.getItem(STORAGE_KEY)
    if (currentData) {
        trabajadoresDB.value = JSON.parse(currentData)
    }

    trabajadoresDB.value = trabajadoresDB.value.filter(t => t.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trabajadoresDB.value))
}
