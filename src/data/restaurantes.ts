import { ref } from 'vue'

export interface Restaurante {
    id: string;         // ID único de la sucursal/restaurante
    ownerId: string;    // ID del dueño/cliente (User.id)
    nombre: string;
    direccion: string;
    telefono: string;
    horario: string;
    estado: boolean;    // Activo o inactivo
}

const STORAGE_KEY = 'mta_mock_restaurantes'
const initialData = localStorage.getItem(STORAGE_KEY)
export const restaurantesDB = ref<Restaurante[]>(initialData ? JSON.parse(initialData) : [])

export function agregarRestaurante(data: Omit<Restaurante, 'id'>) {
    const nuevo: Restaurante = {
        ...data,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9)
    }

    restaurantesDB.value.push(nuevo)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurantesDB.value))
    return { success: true, message: 'Restaurante creado exitosamente.', restaurante: nuevo }
}

export function obtenerRestaurantesPorOwner(ownerId: string) {
    const currentData = localStorage.getItem(STORAGE_KEY)
    if (currentData) {
        restaurantesDB.value = JSON.parse(currentData)
    }
    return restaurantesDB.value.filter(r => r.ownerId === ownerId)
}

export function eliminarRestaurante(id: string) {
    const currentData = localStorage.getItem(STORAGE_KEY)
    if (currentData) {
        restaurantesDB.value = JSON.parse(currentData)
    }

    restaurantesDB.value = restaurantesDB.value.filter(r => r.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurantesDB.value))
}
