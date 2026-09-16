import { sessionGet } from '@/utils/session'
import { createRouter, createWebHistory } from "vue-router";
import { useSeo } from '@/composables/useSeo'
import { ROUTE_SEO, type SeoMeta } from '@/config/seo'

// Auth
import Signin         from "../views/Auth/signin.vue";
import Signup         from "../views/Auth/signup.vue";

import SignupCliente   from "../views/Auth/siginupCliente.vue";
import ForgotPassword from "../views/Auth/Forgotpassword.vue";
import ResetPassword  from "../views/Auth/ResetPassword.vue";

// Panel Layout
import Panelincialviews from "../views/panelincialviews.vue";

// Vistas
import Meserosview        from "../views/meserosview.vue";
import Clienteview        from "../views/clienteview.vue";
import Administraccionview from "../views/administraccionview.vue";
import Analisisview from "../views/Analisisview.vue";
import Cajaviews          from "../views/cajaviews.vue";
import Cocinaview         from "../views/cocinaview.vue";
import Postresview        from "../views/postresview.vue";
import Productosview      from "../views/productosview.vue";
import Barraview          from "../views/barraview.vue";
import Perfilview         from "../views/perfilview.vue";
import LicenciasView      from "../views/LicenciasView.vue";
import Menuview           from "../views/menuview.vue";
import NominaView         from "../views/NominaView.vue";
import PlataformaView     from "../views/PlataformaView.vue";

const routes = [

  // -------------------------
  // RUTAS PÚBLICAS
  // -------------------------

  { path: "/",                   name: "login",            component: Signin,        meta: { seo: ROUTE_SEO['/'] as SeoMeta } },
  { path: "/registro/dueno",     name: "registro-dueno",   component: Signup,        meta: { seo: ROUTE_SEO['/registro/dueno'] as SeoMeta } },
  
  { path: "/registro/cliente",   name: "registro-cliente", component: SignupCliente, meta: { seo: ROUTE_SEO['/registro/cliente'] as SeoMeta } },
  { path: "/recuperar-contrasena", name: "forgot-password",component: ForgotPassword, meta: { seo: ROUTE_SEO['/recuperar-contrasena'] as SeoMeta } },
  { path: "/reset-password",     name: "reset-password",   component: ResetPassword, meta: { seo: ROUTE_SEO['/reset-password'] as SeoMeta } },
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
    component: Menuview,
    meta: { requiresAuth: true, roles: ["MENU", "ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/menu'] as SeoMeta }
  },

  // -------------------------
  // PANEL
  // -------------------------

  {
    path: "/panel",
    component: Panelincialviews,
    meta: { requiresAuth: true },

    children: [

      {
        path: "mesero",
        name: "mesero",
        component: Meserosview,
        meta: { roles: ["MESERO", "ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/mesero'] as SeoMeta }
      },

      {
        path: "cliente",
        name: "cliente",
        component: Clienteview,
        meta: { roles: ["CLIENTE"], seo: ROUTE_SEO['/panel/cliente'] as SeoMeta }
      },

      {
        path: "Gestion",
        name: "Gestion",
        component: Administraccionview,
        meta: { roles: ["ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/Gestion'] as SeoMeta }
      },

      {
        path: "caja",
        name: "caja",
        component: Cajaviews,
        meta: { roles: ["CAJA", "ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/caja'] as SeoMeta }
      },
      {
        path: "analisis",
        name: "analisis",
        component: Analisisview,
        meta: { roles: ["ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/analisis'] as SeoMeta }
      },

      {
        path: "cocina",
        name: "cocina",
        component: Cocinaview,
        meta: { roles: ["COCINA", "ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/cocina'] as SeoMeta }
      },

      {
        path: "postres",
        name: "postres",
        component: Postresview,
        meta: { roles: ["COCINA", "ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/postres'] as SeoMeta }
      },

      {
        path: "productos",
        name: "productos",
        component: Productosview,
        meta: { roles: ["ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/productos'] as SeoMeta }
      },

      {
        path: "contactos",
        name: "contactos",
        component: () => import("../views/ContactosView.vue"),
        meta: { roles: ["ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/contactos'] as SeoMeta }
      },

      {
        path: "barra",
        name: "barra",
        component: Barraview,
        meta: { roles: ["BARRA", "COCINA", "ADMIN", "PROPIETARIO"], seo: ROUTE_SEO['/panel/barra'] as SeoMeta }
      },

      {
        path: "perfil",
        name: "perfil",
        component: Perfilview,
        meta: { requiresAuth: true, seo: ROUTE_SEO['/panel/perfil'] as SeoMeta }
      },

      {
        path: "licencias",
        name: "licencias",
        component: LicenciasView,
        meta: { roles: ["PROPIETARIO", "ADMIN"], seo: ROUTE_SEO['/panel/licencias'] as SeoMeta }
      },

      {
        path: "nomina",
        name: "nomina",
        component: NominaView,
        meta: { roles: ["PROPIETARIO", "ADMIN"], seo: ROUTE_SEO['/panel/nomina'] as SeoMeta }
      },

      {
        path: "plataforma",
        name: "plataforma",
        component: PlataformaView,
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

  { path: "/:pathMatch(.*)*", redirect: "/" }

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
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
];


// -------------------------
// ROUTER GUARD
// -------------------------

router.beforeEach((to, _from, next) => {
  const { token, user } = getSession();
  const roleRaw = user?.roles?.[0];
  const role = typeof roleRaw === 'string' ? roleRaw : roleRaw?.nombre;

  // 1. Ya logueado intentando ir al login → redirigir a su panel o licencias si está vencida
  if (token && to.path === "/") {
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

  // 3. Sin token → login
  if (!token) {
    return next("/");
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
})

export default router;