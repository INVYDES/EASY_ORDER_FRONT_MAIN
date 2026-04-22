// src/config/api.ts

// 1. Obtenemos la URL base del .env
const base = import.meta.env.VITE_API_URL || '';

// 2. Limpiamos la URL para evitar duplicidad de /api
// Quitamos barras al final y el /api si ya existe en la variable de entorno
const cleanBase = base.replace(/\/+$/, '').replace(/\/api$/, '');

if (!cleanBase) {
    throw new Error('VITE_API_URL no está definido en el archivo .env');
}

// 3. Exportamos las constantes asegurando un solo prefijo
export const API_BASE_URL = cleanBase;
export const API_URL = `${cleanBase}/api`;
export const STORAGE_URL = `${cleanBase}/storage/`;

export const getHeaders = (customHeaders: Record<string, string> = {}) => {
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');

    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...customHeaders
    };
};
