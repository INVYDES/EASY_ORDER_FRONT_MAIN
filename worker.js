export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (
      path.startsWith('/assets/') ||
      path === '/' ||
      path === '/logo.svg' ||
      path === '/vite.svg' ||
      /\.\w+$/.test(path)
    ) {
      return env.ASSETS.fetch(request);
    }

    return env.ASSETS.fetch(new URL('/', url));
  }
};
