export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Intentar servir asset estático exacto (incluye prerenderizados: /registro/dueno/index.html, /terminos-y-condiciones/index.html, etc.)
    //    Cloudflare Assets resuelve /registro/dueno -> /registro/dueno/index.html automáticamente si existe.
    let response = await env.ASSETS.fetch(request);

    // Si existe (200-399), devolver con headers de seguridad + cache
    if (response.status !== 404) {
      return withSecurityHeaders(response, pathname);
    }

    // 2. Si es una ruta SPA sin archivo estático (ej. /panel/Gestion, /panel/mesero) -> fallback a /
    //    Esto permite que Vue Router tome el control en el cliente y aplique SEO dinámico via useSeo
    const fallbackRequest = new Request(new URL('/', url), request);
    response = await env.ASSETS.fetch(fallbackRequest);
    return withSecurityHeaders(response, pathname);
  },
};

function withSecurityHeaders(response, pathname) {
  const newHeaders = new Headers(response.headers);

  // Seguridad básica
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Cache: HTML no cache agresivo, assets sí
  const isHtml = pathname === '/' || !pathname.includes('.') || pathname.endsWith('.html') || pathname.endsWith('/');
  const isAsset = pathname.startsWith('/assets/');

  if (isAsset) {
    // Assets hasheados -> cache largo
    newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (isHtml) {
    // HTML prerenderizado / index -> revalidar rápido para SEO fresco
    newHeaders.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }

  // Headers SEO adicionales para rutas privadas (defensa en profundidad, el meta robots ya hace noindex)
  // Si la ruta es de panel, añadir X-Robots-Tag para bots que respeten header
  if (pathname.startsWith('/panel') || pathname.startsWith('/menu')) {
    newHeaders.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
