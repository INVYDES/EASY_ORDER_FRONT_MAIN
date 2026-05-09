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
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

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
            const text = await response.text();
            data = text ? JSON.parse(text) : {};
        } else {
            data = {};
        }

        if (!response.ok) {
            const error = new Error(data.message || `Error ${response.status}`);
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
    get: <T = any>(endpoint: string, options?: RequestInit) =>
        request<T>(endpoint, { ...options, method: 'GET' }),

    post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
        request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body)
        }),

    put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
        request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body instanceof FormData ? body : JSON.stringify(body)
        }),

    patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
        request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: body instanceof FormData ? body : JSON.stringify(body)
        }),

    delete: <T = any>(endpoint: string, options?: RequestInit) =>
        request<T>(endpoint, { ...options, method: 'DELETE' }),
};
