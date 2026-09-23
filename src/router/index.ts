import { sessionGet } from '@/utils/session'
import { createRouter, createWebHistory } from "vue-router";
import { useSeo } from '@/composables/useSeo'
import { ROUTE_SEO, type SeoMeta } from '@/config/seo'
import { trackPageview } from '@/plugins/analytics'

// ───────────────────────────────────────────────────────────────────────
// Code-splitting de rutas:
// SOLO la landing se importa estáticamente (es la página de aterrizaje y su
// código viaja en el chunk inicial para el LCP). Todas las demás vistas
// (auth, panel, kiosco, legales) van con import() perezoso: cada ruta genera
// su propio chunk y el bundle inicial baja de ~2.2 MB a <1 MB.
// ───────────────────────────────────────────────────────────────────────
import LandingView from "../views/LandingView.vue";

const routes = [

  // -------------------------
  // RUTAS PÚBLICAS
  // -------------------------

  { path: "/",                   name: "landing",          component: LandingView,   meta: { seo: ROUTE_SEO['/'] as SeoMeta } },
  { path: "/login",             name: "login",            component: () => import("../views/Auth/signin.vue"),         meta: { seo: ROUTE_SEO['/login'] as SeoMeta } },
  { path: "/registro/dueno",     name: "registro-dueno",   component: () => import("../views/Auth/signup.vue"),         meta: { seo: ROUTE_SEO['/registro/dueno'] as SeoMeta } },
  
  { path: "/registro/cliente",   name: "registro-cliente", component: () => import("../views/Auth/siginupCliente.vue"),  meta: { seo: ROUTE_SEO['/registro/cliente'] as SeoMeta } },
  { path: "/recuperar-contrasena", name: "forgot-password",component: () => import("../views/Auth/Forgotpassword.vue"), meta: { seo: ROUTE_SEO['/recuperar-contrasena'] as SeoMeta } },
  { path: "/reset-password",     name: "reset-password",   component: () => import("../views/Auth/ResetPassword.vue"),   meta: { seo: ROUTE_SEO['/reset-password'] as SeoMeta } },
  { path: "/registro",           redirect: { name: "registro-dueno" }                },

  // Landing — Planes y Contacto (públicas, indexables)
  { path: "/planes",       name: "planes",       component: () => import("../views/PlanesView.vue"),       meta: { seo: ROUTE_SEO['/planes'] as SeoMeta } },
  { path: "/contactanos",  name: "contactanos",  component: () => import("../views/ContactanosView.vue"),  meta: { seo: ROUTE_SEO['/contactanos'] as SeoMeta } },
  { path: "/contacto",     redirect: "/contactanos" },
  { path: "/pricing",      redirect: "/planes" },

  // -------------------------
  // KIOSKO DE MENÚ (Sin barra lateral)
  // -------------------------
  {
    path: "/menu",
    name: "menu",
    component: () => import("../views/menuview.vue"),
    meta: { requiresAuth: true, roles: ["MENU", "ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/menu'] as SeoMeta }
  },

  // -------------------------
  // PANEL
  // -------------------------

  {
    path: "/panel",
    component: () => import("../views/panelincialviews.vue"),
    meta: { requiresAuth: true },

    children: [

      {
        path: "mesero",
        name: "mesero",
        component: () => import("../views/meserosview.vue"),
        meta: { roles: ["MESERO", "ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/mesero'] as SeoMeta }
      },

      {
        path: "cliente",
        name: "cliente",
        component: () => import("../views/clienteview.vue"),
        meta: { roles: ["CLIENTE"], seo: ROUTE_SEO['/panel/cliente'] as SeoMeta }
      },

      {
        path: "Gestion",
        name: "Gestion",
        component: () => import("../views/administraccionview.vue"),
        meta: { roles: ["ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/Gestion'] as SeoMeta }
      },

      {
        path: "caja",
        name: "caja",
        component: () => import("../views/cajaviews.vue"),
        meta: { roles: ["CAJA", "ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/caja'] as SeoMeta }
      },
      {
        path: "analisis",
        name: "analisis",
        component: () => import("../views/Analisisview.vue"),
        meta: { roles: ["ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/analisis'] as SeoMeta }
      },

      {
        path: "cocina",
        name: "cocina",
        component: () => import("../views/cocinaview.vue"),
        meta: { roles: ["COCINA", "ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/cocina'] as SeoMeta }
      },

      {
        path: "postres",
        name: "postres",
        component: () => import("../views/postresview.vue"),
        meta: { roles: ["COCINA", "ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/postres'] as SeoMeta }
      },

      {
        path: "productos",
        name: "productos",
        component: () => import("../views/productosview.vue"),
        meta: { roles: ["ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/productos'] as SeoMeta }
      },

      {
        path: "contactos",
        name: "contactos",
        component: () => import("../views/ContactosView.vue"),
        meta: { roles: ["ADMIN", "PROPIETARIO", "SUPER_ADMIN"], seo: ROUTE_SEO['/panel/contactos'] as SeoMeta }
      },

      {
        path: "barra",
        name: "barra",
        component: () => import("../views/barraview.vue"),
        meta: { roles: ["BARRA", "COCINA", "ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/barra'] as SeoMeta }
      },

      {
        path: "perfil",
        name: "perfil",
        component: () => import("../views/perfilview.vue"),
        meta: { requiresAuth: true, seo: ROUTE_SEO['/panel/perfil'] as SeoMeta }
      },

      {
        path: "licencias",
        name: "licencias",
        component: () => import("../views/LicenciasView.vue"),
        meta: { roles: ["PROPIETARIO", "ADMIN"], seo: ROUTE_SEO['/panel/licencias'] as SeoMeta }
      },

      {
        path: "nomina",
        name: "nomina",
        component: () => import("../views/NominaView.vue"),
        meta: { roles: ["PROPIETARIO", "ADMIN"], seo: ROUTE_SEO['/panel/nomina'] as SeoMeta }
      },

      {
        path: "plataforma",
        name: "plataforma",
        component: () => import("../views/PlataformaView.vue"),
        meta: { roles: ["SUPER_ADMIN"], seo: ROUTE_SEO['/panel/plataforma'] as SeoMeta }
      },

      // Redirección por defecto al entrar a /panel
      {
        path: "",
        redirect: "/panel/Gestion"
      }

    ]
  },


  // -------------------------
  // LEGAL
  // -------------------------
  {
    path: "/terminos-y-condiciones",
    name: "Terms",
    component: () => import("../views/Legal/TermsView.vue"),
    meta: { seo: ROUTE_SEO['/terminos-y-condiciones'] as SeoMeta }
  },
  {
    path: "/politica-de-seguridad",
    name: "Security",
    component: () => import("../views/Legal/SecurityView.vue"),
    meta: { seo: ROUTE_SEO['/politica-de-seguridad'] as SeoMeta }
  },

  // -------------------------
  // CONVERSIÓN
  // -------------------------
  {
    path: "/gracias",
    name: "Gracias",
    component: () => import("../views/GraciasView.vue"),
    meta: { seo: ROUTE_SEO['/gracias'] as SeoMeta }
  },

  // -------------------------
  // 404 — SIEMPRE al final
  // -------------------------
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFoundView.vue"),
    meta: { seo: ROUTE_SEO['/404'] as SeoMeta }
  }

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Al cambiar de página se vuelve arriba (o a la posición recordada al volver atrás)
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 };
  }
});


// -------------------------
// HELPERS
// -------------------------

const getSession = () => {
  const token = sessionGet('token');
  const raw   = sessionGet('user');
  const user  = raw ? JSON.parse(raw) : null;
  return { token, user };
};

const defaultRouteForRole = (role?: string): string => {
  const map: Record<string, string> = {
    MESERO:      "/panel/mesero",
    COCINA:      "/panel/cocina",
    CAJA:        "/panel/caja",
    BARRA:       "/panel/barra",
    MENU:        "/menu",
    ADMIN:       "/panel/Gestion",
    PROPIETARIO: "/panel/Gestion",
    CLIENTE:     "/panel/cliente",   // ← directo al menú
    SUPER_ADMIN: "/panel/plataforma",
  };
  return map[role ?? ""] ?? "/panel/Gestion";
};

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/registro",
  "/registro/dueno",
  "/registro/empleado",
  "/registro/cliente",
  "/recuperar-contrasena",
  "/reset-password",
  "/terminos-y-condiciones",
  "/planes",
  "/contactanos",
  "/contacto",
  "/pricing",
  "/politica-de-seguridad",
  "/gracias",
];


// -------------------------
// ROUTER GUARD
// -------------------------

router.beforeEach((to, _from, next) => {
  const { token, user } = getSession();
  const roleRaw = user?.roles?.[0];
  const role = typeof roleRaw === 'string' ? roleRaw : roleRaw?.nombre;

  // 1. Ya logueado intentando ir al login → redirigir a su panel o licencias si está vencida
  if (token && (to.path === "/login" || to.name === "login")) {
    if (user && user.licencia_activa === false) {
      return next("/panel/licencias");
    }
    const dest = defaultRouteForRole(role);
    // Evitar loop si defaultRoute también es "/"
    if (dest !== "/") return next(dest);
    return next();
  }

  // 2. Rutas públicas → siempre accesibles
  if (PUBLIC_PATHS.includes(to.path)) {
    return next();
  }

  // 2b. La página 404 es pública: si no, cualquier URL rota pediría login
  if (to.name === "NotFound") {
    return next();
  }

  // 3. Sin token → login
  if (!token) {
    return next("/login");
  }

  // 3b. Si la licencia no está activa, redirigir siempre a licencias
  if (user && user.licencia_activa === false && to.path !== "/panel/licencias") {
    return next("/panel/licencias");
  }

  // 4. Verificar rol
  if (to.meta.roles) {
    const allowed = to.meta.roles as string[];
    // Obtener todos los nombres de roles del usuario
    const userRoles = user?.roles?.map((r: any) => typeof r === 'string' ? r : r.nombre) || [];
    
    // Verificar si alguno de los roles del usuario está permitido
    const hasPermission = userRoles.some((r: string) => allowed.includes(r));

    if (!hasPermission) {
      // Excepción: Si la licencia está inactiva y la ruta es /panel/licencias, permitir acceso
      if (user?.licencia_activa === false && to.path === "/panel/licencias") {
        return next();
      }

      const fallback = defaultRouteForRole(role);
      if (fallback !== to.path) return next(fallback);
    }
  }
  console.log('Guard:', { to: to.path, token: !!token, role });

  next();
});

// -------------------------
// SEO — Actualización dinámica de <head>
// -------------------------
router.afterEach((to) => {
  // SEO definido en meta.seo, fallback por path, fallback global con noindex si es privada
  const matchedSeo = (to.meta as any)?.seo as SeoMeta | undefined
  const fallbackSeo = ROUTE_SEO[to.path] as SeoMeta | undefined
  const isPrivate = (to.meta as any)?.requiresAuth || !!(to.meta as any)?.roles

  const seo: SeoMeta = matchedSeo || fallbackSeo || {
    title: (to.name as string) || undefined,
    noindex: isPrivate ? true : false,
    canonical: to.fullPath,
  }

  // Asegurar canonical siempre refleje la ruta actual
  const finalSeo: SeoMeta = {
    ...seo,
    canonical: seo.canonical || to.fullPath,
  }

  useSeo(finalSeo)

  // Analítica (opcional): registra la vista de la ruta pública
  trackPageview(to.path, document.title)
})

export default router;