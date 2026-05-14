// src/config/api.ts

// 1. Obtenemos la URL base del .env
const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 2. Limpiamos la URL para evitar duplicidad de /api
// Quitamos barras al final y el /api si ya existe en la variable de entorno
const cleanBase = base.replace(/\/+$/, '').replace(/\/api$/, '');

if (!cleanBase) {
    console.warn('VITE_API_URL no está definido en el archivo .env, usando fallback');
}

// 3. Exportamos las constantes asegurando un solo prefijo
export const API_BASE_URL = cleanBase;
export const API_URL = `${cleanBase}/api`;

// URL para imágenes y archivos (quitamos index.php si existe para apuntar a la carpeta física)
export const STORAGE_URL = `${base.replace(/\/index\.php$/, '').replace(/\/api$/, '').replace(/\/+$/, '')}/storage/`;

export const getHeaders = (customHeaders: Record<string, string> = {}) => {
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    const restauranteId = localStorage.getItem('restaurante_id');

    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(restauranteId && { 'X-Restaurante-Id': restauranteId }),
        ...customHeaders
    };
};
