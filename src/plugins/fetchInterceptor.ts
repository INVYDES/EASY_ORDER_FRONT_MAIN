// src/plugins/fetchInterceptor.ts

const originalFetch = window.fetch;

window.fetch = async (...args) => {
    try {
        const response = await originalFetch(...args);

        // Global Error Handling: Rate Limiting
        if (response.status === 429) {
            alert("Has excedido el límite de intentos. Por favor, espera un minuto.");
            // We can throw here or let the application handle the 429 gracefully, 
            // but the guide specifies to intercept and alert.
        }

        // Global Error Handling: Single Session (Unauthorized)
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            
            // Only redirect if not already on the login page
            if (!window.location.pathname.includes('/login') && window.location.pathname !== '/' && !window.location.pathname.includes('/registro')) {
                window.location.href = '/';
            }
        }

        // --- BACKWARDS COMPATIBILITY PARA JSONRESOURCES DE LARAVEL ---
        // Los nuevos endpoints usan Paginación Estándar de Laravel sin el wrapper 'success'.
        // Inyectamos 'success: true' automáticamente para que el frontend antiguo no se rompa.
        if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const clonedResponse = response.clone();
                try {
                    const data = await clonedResponse.json();
                    if (data && typeof data === 'object' && !('success' in data)) {
                        const newData = { ...data, success: true };
                        return new Response(JSON.stringify(newData), {
                            status: response.status,
                            statusText: response.statusText,
                            headers: response.headers
                        });
                    }
                } catch (e) {
                    // Si falla el parseo, simplemente retornamos el original
                }
            }
        }

        return response;
    } catch (error) {
        // Network errors or other fetch failures
        console.error('Fetch Interceptor Error:', error);
        throw error;
    }
};

export default {};
