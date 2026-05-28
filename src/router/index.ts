import { createRouter, createWebHistory } from "vue-router";

const routes = [

  // -------------------------
  // RUTAS PÚBLICAS
  // -------------------------

  { path: "/",                   name: "login",            component: () => import("../views/Auth/signin.vue") },
  { path: "/registro/dueno",     name: "registro-dueno",   component: () => import("../views/Auth/signup.vue") },
  
  { path: "/registro/cliente",   name: "registro-cliente", component: () => import("../views/Auth/siginupCliente.vue") },
  { path: "/recuperar-contrasena", name: "forgot-password",component: () => import("../views/Auth/Forgotpassword.vue") },
  { path: "/reset-password",     name: "reset-password",   component: () => import("../views/Auth/ResetPassword.vue") },
  { path: "/registro",           redirect: { name: "registro-dueno" }                },

  // -------------------------
  // KIOSKO DE MENÚ (Sin barra lateral)
  // -------------------------
  {
    path: "/menu",
    name: "menu",
    component: () => import("../views/menuview.vue"),
    meta: { requiresAuth: true, roles: ["MENU", "ADMIN", "PROPIETARIO"] }
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
        meta: { roles: ["MESERO", "ADMIN", "PROPIETARIO"] }
      },

      {
        path: "cliente",
        name: "cliente",
        component: () => import("../views/clienteview.vue"),
        meta: { roles: ["CLIENTE"] }
      },

      {
        path: "Gestion",
        name: "Gestion",
        component: () => import("../views/administraccionview.vue"),
        meta: { roles: ["ADMIN", "PROPIETARIO"] }
      },

      {
        path: "caja",
        name: "caja",
        component: () => import("../views/cajaviews.vue"),
        meta: { roles: ["CAJA", "ADMIN", "PROPIETARIO"] }
      },
      {
        path: "analisis",
        name: "analisis",
        component: () => import("../views/Analisisview.vue"),
        meta: { roles: ["ADMIN", "PROPIETARIO"] }
      },

      {
        path: "cocina",
        name: "cocina",
        component: () => import("../views/cocinaview.vue"),
        meta: { roles: ["COCINA", "ADMIN", "PROPIETARIO"] }
      },

      {
        path: "postres",
        name: "postres",
        component: () => import("../views/postresview.vue"),
        meta: { roles: ["COCINA", "ADMIN", "PROPIETARIO"] }
      },

      {
        path: "productos",
        name: "productos",
        component: () => import("../views/productosview.vue"),
        meta: { roles: ["ADMIN", "PROPIETARIO"] }
      },

      {
        path: "barra",
        name: "barra",
        component: () => import("../views/barraview.vue"),
        meta: { roles: ["BARRA", "COCINA", "ADMIN", "PROPIETARIO"] }
      },

      {
        path: "perfil",
        name: "perfil",
        component: () => import("../views/Perfilview.vue"),
        meta: { requiresAuth: true }
      },

      {
        path: "licencias",
        name: "licencias",
        component: () => import("../views/LicenciasView.vue"),
        meta: { roles: ["PROPIETARIO", "ADMIN"] }
      },

      {
        path: "nomina",
        name: "nomina",
        component: () => import("../views/NominaView.vue"),
        meta: { roles: ["PROPIETARIO", "ADMIN"] }
      },

      {
        path: "plataforma",
        name: "plataforma",
        component: () => import("../views/PlataformaView.vue"),
        meta: { roles: ["SUPER_ADMIN"] }
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
    component: () => import("../views/Legal/TermsView.vue")
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
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const raw   = localStorage.getItem("user")  || sessionStorage.getItem("user");
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
    CLIENTE:     "/panel/cliente",
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
];


// -------------------------
// ROUTER GUARD
// -------------------------

router.beforeEach((to, _from, next) => {
  const { token, user } = getSession();
  const roleRaw = user?.roles?.[0];
  const role = typeof roleRaw === 'string' ? roleRaw : roleRaw?.nombre;

  if (token && to.path === "/") {
    const dest = defaultRouteForRole(role);
    if (dest !== "/") return next(dest);
    return next();
  }

  if (PUBLIC_PATHS.includes(to.path)) {
    return next();
  }

  if (!token) {
    return next("/");
  }

  if (to.meta.roles) {
    const allowed = to.meta.roles as string[];
    const userRoles = user?.roles?.map((r: any) => typeof r === 'string' ? r : r.nombre) || [];
    const hasPermission = userRoles.some((r: string) => allowed.includes(r));

    if (!hasPermission) {
      const fallback = defaultRouteForRole(role);
      if (fallback !== to.path) return next(fallback);
    }
  }

  next();
});

export default router;
