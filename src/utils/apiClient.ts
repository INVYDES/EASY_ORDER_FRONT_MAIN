// src/utils/apiClient.ts
import { API_URL, getHeaders } from '@/config/api';

export interface ApiResponse<T = any> {
    data?: T;
    statistics?: any;
    meta?: any;
    links?: any;
    success?: boolean;
    message?: string;
    errors?: Record<string, string[]>;
    token?: string; // Legacy support
    user?: any;    // Legacy support
}

export async function request<T = any>(
    endpoint: string,
    options: RequestInit & { params?: Record<string, any> } = {}
): Promise<ApiResponse<T>> {
    let url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    if (options.params) {
        const queryParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '' || value === false) return
            queryParams.append(key, String(value));
        });
        const queryString = queryParams.toString();
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
        delete options.params;
    }

    const defaultHeaders = getHeaders();
    const headers = {
        ...defaultHeaders,
        ...(options.headers || {})
    };

    // If body is FormData, delete Content-Type to let browser set it with boundary
    if (options.body instanceof FormData) {
        // @ts-ignore
        delete headers['Content-Type'];
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        let data;

        if (isJson) {
            let text = await response.text();
            // Corrección global de zona horaria: El backend de Laravel envía la hora local pero 
            // le añade una 'Z' al final (indicando UTC). Esto causaba que el frontend restara 6 horas.
            // Al remover la 'Z' antes de parsear, el frontend respeta la hora tal cual viene.
            if (text) {
                text = text.replace(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?)Z/g, '$1');
            }
            data = text ? JSON.parse(text) : {};
        } else {
            data = {};
        }

        if (!response.ok) {
            const error = new Error(data.error || data.message || `Error ${response.status}`);
            (error as any).response = { status: response.status, data };
            throw error;
        }

        return data;
    } catch (error: any) {
        console.error(`API Request Error [${url}]:`, error);
        if (error instanceof SyntaxError) {
            const err = new Error('Respuesta inválida del servidor');
            throw err;
        }
        throw error;
    }
}

export const apiClient = {
    get: <T = any>(endpoint: string, options?: RequestInit & { params?: Record<string, any> }) =>
        request<T>(endpoint, { ...options, method: 'GET' }),

    post: <T = any>(endpoint: string, body?: any, options?: RequestInit & { params?: Record<string, any> }) =>
        request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body)
        }),

    put: <T = any>(endpoint: string, body?: any, options?: RequestInit & { params?: Record<string, any> }) =>
        request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body instanceof FormData ? body : JSON.stringify(body)
        }),

    patch: <T = any>(endpoint: string, body?: any, options?: RequestInit & { params?: Record<string, any> }) =>
        request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: body instanceof FormData ? body : JSON.stringify(body)
        }),

    delete: <T = any>(endpoint: string, options?: RequestInit & { params?: Record<string, any> }) =>
        request<T>(endpoint, { ...options, method: 'DELETE' }),
};
