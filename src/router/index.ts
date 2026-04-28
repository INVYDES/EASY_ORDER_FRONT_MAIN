import { createRouter, createWebHistory } from "vue-router";

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

const routes = [

  // -------------------------
  // RUTAS PÚBLICAS
  // -------------------------

  { path: "/",                   name: "login",            component: Signin         },
  { path: "/registro/dueno",     name: "registro-dueno",   component: Signup         },
  
  { path: "/registro/cliente",   name: "registro-cliente", component: SignupCliente  },
  { path: "/recuperar-contrasena", name: "forgot-password",component: ForgotPassword },
  { path: "/reset-password",     name: "reset-password",   component: ResetPassword  },
  { path: "/registro",           redirect: { name: "registro-dueno" }                },

  // -------------------------
  // KIOSKO DE MENÚ (Sin barra lateral)
  // -------------------------
  {
    path: "/menu",
    name: "menu",
    component: Menuview,
    meta: { requiresAuth: true, roles: ["MENU", "ADMIN", "PROPIETARIO"] }
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
        meta: { roles: ["MESERO", "ADMIN", "PROPIETARIO"] }
      },

      {
        path: "cliente",
        name: "cliente",
        component: Clienteview,
        meta: { roles: ["CLIENTE"] }
      },

      {
        path: "Gestion",
        name: "Gestion",
        component: Administraccionview,
        meta: { roles: ["ADMIN", "PROPIETARIO"] }
      },

      {
        path: "caja",
        name: "caja",
        component: Cajaviews,
        meta: { roles: ["CAJA", "ADMIN", "PROPIETARIO"] }
      },
      {
  path: "analisis",
  name:"analisis",
  component:Analisisview,
  meta: { roles:["ADMIN"] }
},

      {
        path: "cocina",
        name: "cocina",
        component: Cocinaview,
        meta: { roles: ["COCINA", "ADMIN", "PROPIETARIO"] }
      },

      {
        path: "postres",
        name: "postres",
        component: Postresview,
        meta: { roles: ["COCINA", "ADMIN", "PROPIETARIO"] }
      },

      {
        path: "productos",
        name: "productos",
        component: Productosview,
        meta: { roles: ["ADMIN", "PROPIETARIO"] }
      },

      {
        path: "barra",
        name: "barra",
        component: Barraview,
        meta: { roles: ["BARRA", "ADMIN", "PROPIETARIO"] }
      },

      {
        path: "perfil",
        name: "perfil",
        component: Perfilview,
        meta: { requiresAuth: true }
      },

      {
        path: "licencias",
        name: "licencias",
        component: LicenciasView,
        meta: { roles: ["PROPIETARIO", "ADMIN"] }
      },

      // Redirección por defecto al entrar a /panel
      {
        path: "",
        redirect: "/panel/Gestion"
      }

    ]
  },


  // -------------------------
  // 404
  // -------------------------

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
    CLIENTE:     "/panel/cliente",   // ← directo al menú
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
];


// -------------------------
// ROUTER GUARD
// -------------------------

router.beforeEach((to, _from, next) => {
  const { token, user } = getSession();
  const role = user?.roles?.[0]?.nombre as string | undefined;

  // 1. Ya logueado intentando ir al login → redirigir a su panel
  if (token && to.path === "/") {
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

  // 4. Verificar rol
  if (to.meta.roles) {
    const allowed = to.meta.roles as string[];
    // Obtener todos los nombres de roles del usuario
    const userRoles = user?.roles?.map((r: any) => r.nombre) || [];
    
    // Verificar si alguno de los roles del usuario está permitido
    const hasPermission = userRoles.some((r: string) => allowed.includes(r));

    if (!hasPermission) {
      const fallback = defaultRouteForRole(role);
      if (fallback !== to.path) return next(fallback);
    }
  }
  console.log('Guard:', { to: to.path, token: !!token, role });

  next();
});

export default router;