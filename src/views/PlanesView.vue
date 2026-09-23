<template>
  <div class="planes-page">
    <div class="bg-blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>
    <!-- Top navigation minimalista -->
    <header class="topbar">
      <div class="wrap nav">
        <router-link to="/" class="logo" aria-label="eOrder - Inicio">
          <span><i>e</i>Order</span><small>Easy Order</small>
        </router-link>
        <nav class="nav-links" aria-label="Navegación principal">
          <router-link to="/planes" class="nav-link active">Planes</router-link>
          <router-link to="/contactanos" class="nav-link">Contáctanos</router-link>
          <router-link to="/login" class="nav-link ghost">Ingresar</router-link>
          <router-link to="/registro/dueno" class="nav-cta">Crear cuenta</router-link>
        </nav>
        <div class="nav-auth-mobile">
          <router-link to="/login" class="nav-link ghost">Ingresar</router-link>
        </div>
        <button class="menu-btn" @click="mobileOpen = !mobileOpen" aria-label="Abrir menú">
          <span v-if="!mobileOpen">☰</span>
          <span v-else>✕</span>
        </button>
      </div>
      <div v-if="mobileOpen" class="mobile-menu">
        <router-link to="/planes" @click="mobileOpen=false">Planes</router-link>
        <router-link to="/contactanos" @click="mobileOpen=false">Contáctanos</router-link>
        <router-link to="/registro/dueno" class="mobile-cta" @click="mobileOpen=false">Crear cuenta gratis</router-link>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero wrap reveal" aria-labelledby="titulo-planes">
      <span class="eyebrow">30 días gratis · Sin compromiso · Cancela cuando quieras</span>
      <h1 id="titulo-planes">El plan perfecto para cada tipo de restaurante</h1>
      <p>Elige el plan que mejor se adapte a tu operación y comienza a optimizar tus pedidos, ventas e inventario desde hoy. Todos los planes incluyen soporte y actualizaciones.</p>
      <div class="trial">
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>
          30 días gratis en todos los planes*
        </span>
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10v12H3V10h4Zm0 10h11.5a2 2 0 0 0 1.94-1.52l1.25-5A2 2 0 0 0 19.75 11H15l.8-4A3.3 3.3 0 0 0 12.56 3L7 10Z"/></svg>
          Soporte en línea incluido
        </span>
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M9 12l2 2 4-4"/></svg>
          Datos seguros
        </span>
      </div>
      <!-- toggle anual/mensual -->
      <div class="billing-toggle" role="group" aria-label="Tipo de facturación">
        <button :class="{active: billing==='mensual'}" @click="billing='mensual'">Mensual</button>
        <button :class="{active: billing==='anual'}" @click="billing='anual'">Anual <small>ahorra hasta 11%</small></button>
      </div>
    </section>

    <!-- Imagen de planes -->
    <figure class="wrap plans-media reveal">
      <img
        src="/Planes.jpg"
        width="1280"
        height="853"
        loading="lazy"
        decoding="async"
        alt="Resumen visual de los planes y precios de eOrder"
      >
    </figure>

    <!-- Planes grid -->
    <section class="wrap plans reveal" aria-label="Planes y precios de eOrder">
      <!-- Emprendimiento -->
      <article class="card emprendimiento" :class="{highlight: billing==='anual'}">
        <span class="badge">Desde $299</span>
        <div class="plan-title">
          <span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 10h18l-2-6H5l-2 6Z"/><path d="M5 10v10h14V10M9 20v-6h6v6M3 10c0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0"/></svg></span>
          <div><h2>Emprendimiento</h2><div class="scope">1 restaurante · hasta 5 conexiones</div></div>
        </div>
        <div class="price">
          <template v-if="billing==='mensual'">
            <strong>{{ precioMensual(PLAN.emprendimiento) }}</strong> <span>MXN / mes</span>
            <div class="annual"><strong>{{ precioAnual(PLAN.emprendimiento) }}</strong> MXN / año <span class="discount">{{ descuentoAnual(PLAN.emprendimiento) }} dto.</span></div>
          </template>
          <template v-else>
            <strong>{{ precioAnualMes(PLAN.emprendimiento) }}</strong> <span>MXN / mes <em class="annual-hint">(pago anual {{ precioAnual(PLAN.emprendimiento) }})</em></span>
            <div class="annual ok">Ahorras {{ ahorroAnualTexto(PLAN.emprendimiento) }} al año</div>
          </template>
        </div>
        <p class="summary">Todo lo necesario para comenzar a digitalizar y controlar tu restaurante.</p>
        <strong class="includes">Incluye:</strong>
        <ul>
          <li>POS y gestión de pedidos</li>
          <li>KPI de ventas, operación y productos</li>
          <li>Inventario de insumos</li>
          <li>Menú y kiosco digital</li>
          <li>KDS y comanda de mesero</li>
          <li>Hasta 5 usuarios conectados</li>
        </ul>
        <router-link class="cta" to="/registro/dueno">Contratar — Prueba 30 días</router-link>
        <span class="cta-note">Sin tarjeta requerida para prueba</span>
      </article>

      <!-- Básico -->
      <article class="card basico popular">
        <span class="badge">Más popular</span>
        <div class="plan-title">
          <span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 10h18l-2-6H5l-2 6Z"/><path d="M5 10v10h14V10M9 20v-6h6v6M3 10c0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0"/></svg></span>
          <div><h2>Plan Básico</h2><div class="scope">1 restaurante · hasta 15 conexiones</div></div>
        </div>
        <div class="price">
          <template v-if="billing==='mensual'">
            <strong>{{ precioMensual(PLAN.basico) }}</strong> <span>MXN / mes</span>
            <div class="annual"><strong>{{ precioAnual(PLAN.basico) }}</strong> MXN / año <span class="discount">{{ descuentoAnual(PLAN.basico) }} dto.</span></div>
          </template>
          <template v-else>
            <strong>{{ precioAnualMes(PLAN.basico) }}</strong> <span>MXN / mes <em class="annual-hint">(pago anual {{ precioAnual(PLAN.basico) }})</em></span>
            <div class="annual ok">Ahorras {{ ahorroAnualTexto(PLAN.basico) }} al año</div>
          </template>
        </div>
        <p class="summary">Más capacidad para una operación completa, ágil y organizada.</p>
        <strong class="includes">Todo lo de Emprendimiento, más:</strong>
        <ul>
          <li>Hasta 15 usuarios conectados</li>
          <li>Mayor capacidad operativa</li>
          <li>Administración integral del restaurante</li>
          <li>Reportes de ventas y rendimiento</li>
          <li>Soporte en línea</li>
        </ul>
        <router-link class="cta" to="/registro/dueno">Contratar — Prueba 30 días</router-link>
        <span class="cta-note">Ideal para restaurantes con turno completo</span>
      </article>

      <!-- Crecimiento -->
      <article class="card crecimiento">
        <div class="plan-title">
          <span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 10h18l-2-6H5l-2 6Z"/><path d="M5 10v10h14V10M9 20v-6h6v6M3 10c0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0"/></svg></span>
          <div><h2>Plan Crecimiento</h2><div class="scope">Hasta 2 restaurantes · 15 conexiones</div></div>
        </div>
        <div class="price">
          <template v-if="billing==='mensual'">
            <strong>{{ precioMensual(PLAN.crecimiento) }}</strong> <span>MXN / mes</span>
            <div class="annual"><strong>{{ precioAnual(PLAN.crecimiento) }}</strong> MXN / año <span class="discount">{{ descuentoAnual(PLAN.crecimiento) }} dto.</span></div>
          </template>
          <template v-else>
            <strong>{{ precioAnualMes(PLAN.crecimiento) }}</strong> <span>MXN / mes <em class="annual-hint">(pago anual {{ precioAnual(PLAN.crecimiento) }})</em></span>
            <div class="annual ok">Ahorras {{ ahorroAnualTexto(PLAN.crecimiento) }} al año</div>
          </template>
        </div>
        <p class="summary">Ideal para negocios que abren una segunda ubicación.</p>
        <strong class="includes">Todo lo del Plan Básico, más:</strong>
        <ul>
          <li>Gestión de hasta 2 restaurantes</li>
          <li>Comparativos entre sucursales</li>
          <li>Métricas y KPI avanzados</li>
          <li>Inventarios por restaurante</li>
          <li>Información operativa en tiempo real</li>
        </ul>
        <router-link class="cta" to="/registro/dueno">Contratar</router-link>
      </article>

      <!-- Pro -->
      <article class="card pro">
        <div class="plan-title">
          <span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 10h18l-2-6H5l-2 6Z"/><path d="M5 10v10h14V10M9 20v-6h6v6M3 10c0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0"/></svg></span>
          <div><h2>Plan Pro</h2><div class="scope">Hasta 4 restaurantes · 15 conexiones</div></div>
        </div>
        <div class="price">
          <template v-if="billing==='mensual'">
            <strong>{{ precioMensual(PLAN.pro) }}</strong> <span>MXN / mes</span>
            <div class="annual"><strong>{{ precioAnual(PLAN.pro) }}</strong> MXN / año <span class="discount">{{ descuentoAnual(PLAN.pro) }} dto.</span></div>
          </template>
          <template v-else>
            <strong>{{ precioAnualMes(PLAN.pro) }}</strong> <span>MXN / mes <em class="annual-hint">(pago anual {{ precioAnual(PLAN.pro) }})</em></span>
            <div class="annual ok">Ahorras {{ ahorroAnualTexto(PLAN.pro) }} al año</div>
          </template>
        </div>
        <p class="summary">Control centralizado para operaciones con varias sucursales.</p>
        <strong class="includes">Todo lo del Plan Crecimiento, más:</strong>
        <ul>
          <li>Gestión de hasta 4 restaurantes</li>
          <li>Inventario centralizado</li>
          <li>Costos y márgenes por producto</li>
          <li>Reportes consolidados</li>
          <li>Análisis avanzado de operación</li>
        </ul>
        <router-link class="cta" to="/registro/dueno">Contratar</router-link>
      </article>

      <!-- Food Hall -->
      <article class="card foodhall">
        <span class="badge">Food Hall</span>
        <div class="plan-title">
          <span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 10h18l-2-6H5l-2 6Z"/><path d="M5 10v10h14V10M9 20v-6h6v6M3 10c0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0"/></svg></span>
          <div><h2>Plan Food Hall</h2><div class="scope">1 restaurante · hasta 8 KDS</div></div>
        </div>
        <div class="price">
          <template v-if="billing==='mensual'">
            <strong>{{ precioMensual(PLAN.foodhall) }}</strong> <span>MXN / mes</span>
            <div class="annual"><strong>{{ precioAnual(PLAN.foodhall) }}</strong> MXN / año <span class="discount">{{ descuentoAnual(PLAN.foodhall) }} dto.</span></div>
          </template>
          <template v-else>
            <strong>{{ precioAnualMes(PLAN.foodhall) }}</strong> <span>MXN / mes <em class="annual-hint">(pago anual {{ precioAnual(PLAN.foodhall) }})</em></span>
            <div class="annual ok">Ahorras {{ ahorroAnualTexto(PLAN.foodhall) }} al año</div>
          </template>
        </div>
        <p class="summary">Diseñado para mercados gastronómicos con distintas estaciones.</p>
        <strong class="includes">Todo lo del Plan Básico, más:</strong>
        <ul>
          <li>Gestión de hasta 8 KDS</li>
          <li>Máximo 15 usuarios conectados</li>
          <li>Pedidos y producción por estación</li>
          <li>Inventario de insumos</li>
          <li>Reportes consolidados</li>
        </ul>
        <router-link class="cta" to="/registro/dueno">Contratar</router-link>
      </article>

      <!-- Enterprise -->
      <article class="card enterprise">
        <div class="plan-title">
          <span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 21V4h10v17M14 9h6v12M7 8h3M7 12h3M7 16h3M17 13h1M17 17h1M2 21h20"/></svg></span>
          <div><h2>Plan Enterprise</h2><div class="scope">5 o más sucursales</div></div>
        </div>
        <div class="price"><strong class="quote">Sobre cotización</strong><div class="annual" style="font-weight:600;color:#5f6c82">Infraestructura dedicada · SLA</div></div>
        <p class="summary">Infraestructura dedicada y soluciones a la medida para cadenas.</p>
        <strong class="includes">Incluye:</strong>
        <ul>
          <li>5 o más sucursales</li>
          <li>Servidores dedicados en red local o nube</li>
          <li>Personalización y roles avanzados</li>
          <li>Integraciones a la medida</li>
          <li>Implementación y soporte especializado</li>
        </ul>
        <router-link class="cta" to="/contactanos">Solicitar cotización</router-link>
        <span class="cta-note">Respuesta en &lt; 24h hábiles</span>
      </article>
    </section>

    <!-- tabla comparativa simplificada (extra necesario) -->
    <section class="wrap compare reveal" aria-label="Comparativa de planes">
      <h3>¿Cuál plan te conviene?</h3>
      <div class="compare-grid">
        <div class="compare-head">
          <span></span>
          <span v-for="id in COMPARE_PLAN_IDS" :key="id">{{ PLAN[id].short }}</span>
        </div>
        <div v-for="row in COMPARE_ROWS" :key="row.label" class="compare-row">
          <span>{{ row.label }}</span>
          <span v-for="(value, i) in row.values" :key="i">{{ value }}</span>
        </div>
      </div>
    </section>

    <section class="wrap common reveal" aria-label="Funciones incluidas en los planes">
      <h3>La operación esencial de tu restaurante, en una sola plataforma</h3>
      <div class="common-grid">
        <span><b>✓</b> Punto de venta (POS)</span>
        <span><b>✓</b> KPI de ventas y operación</span>
        <span><b>✓</b> Inventario de insumos</span>
        <span><b>✓</b> Menú digital</span>
        <span><b>✓</b> Kiosco digital</span>
        <span><b>✓</b> KDS para cocina y barras</span>
        <span><b>✓</b> Comanda de mesero</span>
        <span><b>✓</b> Soporte en línea</span>
      </div>
    </section>

    <section class="wrap benefits reveal" aria-label="Beneficios eOrder">
      <div class="benefit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M10 20V4M16 20v-7M22 20V7M2 20h22"/></svg>Más ventas y mejor control</div>
      <div class="benefit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Operación eficiente</div>
      <div class="benefit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 3h16v18H4zM8 16l3-4 2 2 3-5"/></svg>Métricas en tiempo real</div>
      <div class="benefit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 18a5 5 0 0 1 .5-10A7 7 0 0 1 21 10.5 4 4 0 0 1 20 18M12 12v9m0 0-3-3m3 3 3-3"/></svg>Información segura</div>
      <div class="benefit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 13a8 8 0 0 1 16 0M4 13v5h3v-5H4Zm13 0v5h3v-5h-3ZM17 20h-5"/></svg>Soporte humano</div>
    </section>

    <!-- FAQ + garantías -->
    <section class="wrap faq reveal">
      <h3>Preguntas frecuentes</h3>
      <div class="faq-list">
        <details open><summary>¿Puedo cambiar de plan después?</summary><p>Sí, puedes escalar o reducir tu plan en cualquier momento. El cambio aplica en el siguiente ciclo de facturación.</p></details>
        <details><summary>¿Los precios incluyen IVA?</summary><p>Sí, todos los precios mostrados son en MXN e incluyen IVA.</p></details>
        <details><summary>¿Qué incluye la prueba de 30 días?</summary><p>Acceso completo a todas las funciones de tu plan (menos Enterprise) para una sucursal, sin compromiso ni tarjeta.</p></details>
        <details><summary>¿Necesito hardware especial?</summary><p>No necesariamente. eOrder funciona con computadoras, tabletas y equipos que ya tengas. Te asesoramos en la implementación.</p></details>
      </div>
      <div class="cta-block">
        <h4>¿Aún tienes dudas?</h4>
        <p>Habla con un asesor y te ayudamos a elegir el plan ideal para tu operación.</p>
        <div class="cta-actions">
          <router-link to="/contactanos" class="btn-primary">Hablar con un asesor</router-link>
          <a href="https://wa.me/5210000000000" target="_blank" rel="noopener" class="btn-outline">WhatsApp</a>
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <div class="wrap">
        <p>*La prueba gratuita aplica a todos los planes excepto Enterprise, está limitada a una sucursal y no requiere compromiso. Visita <router-link to="/planes">eOrder planes</router-link>.</p>
        <p>© {{ year }} eOrder · Easy Order. Todos los derechos reservados. <router-link to="/terminos-y-condiciones">Términos</router-link> · <router-link to="/contactanos">Contacto</router-link></p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSeo } from '@/composables/useSeo'
import { ROUTE_SEO } from '@/config/seo'
import {
  COMPARE_PLAN_IDS,
  COMPARE_ROWS,
  PLAN_BY_ID,
  ahorroAnualTexto,
  descuentoAnual,
  precioAnual,
  precioAnualMes,
  precioMensual,
} from '@/config/planes'

const billing = ref<'mensual'|'anual'>('mensual')
const mobileOpen = ref(false)
const year = new Date().getFullYear()
// Fuente única de verdad: src/config/planes.ts
const PLAN = PLAN_BY_ID

onMounted(() => {
  useSeo(ROUTE_SEO['/planes'])

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed')
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})
</script>

<style scoped>
.planes-page {
  color: #07183a;
  background:
    radial-gradient(circle at 50% 0, rgba(7,91,201,.08), transparent 27rem),
    linear-gradient(180deg, #fbfdff 0%, #fff 40%, #f6f9fd 100%);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* Dynamic Background Blobs */
.bg-blobs {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
  animation: float-blob 20s infinite alternate ease-in-out;
}
.blob-1 { width: 40rem; height: 40rem; background: #eef4ff; top: -10rem; left: -10rem; animation-delay: 0s; }
.blob-2 { width: 30rem; height: 30rem; background: #fff3eb; bottom: 10rem; right: -5rem; animation-delay: -5s; }
.blob-3 { width: 25rem; height: 25rem; background: #e6f5ea; top: 40%; left: 50%; animation-delay: -10s; }

@keyframes float-blob {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(5rem, 5rem) scale(1.1); }
}

/* Reveal Animation */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

.wrap { width: min(1500px, calc(100% - 40px)); margin: auto; }

/* Topbar */
.topbar { position: sticky; top:0; z-index:30; backdrop-filter: blur(12px); background: rgba(255,255,255,.82); border-bottom: 1px solid #e6edf7; }
.nav { display:flex; align-items:center; justify-content:space-between; padding:14px 0; }
.logo { display:inline-flex; flex-direction:column; line-height:.72; padding:3px 0; letter-spacing:-2.6px; font-weight:900; font-size:34px; color:#075bc9; text-decoration:none; }
.logo i { font-style: italic; }
.logo small { margin-top:6px; padding-left:22px; color:#f15a00; font-size:.34em; letter-spacing:-.7px; }
.nav-links { display:flex; gap:18px; align-items:center; }
.nav-link { font-size:14px; font-weight:600; color:#34435a; text-decoration:none; padding:12px 10px; border-radius:8px; }
.nav-link.active, .nav-link:hover { color:#075bc9; background:#eef4ff; }
.nav-link.ghost { border:1px solid #dbe6f6; }.nav-cta{ background:#075bc9; color:#fff; padding:12px 16px; border-radius:10px; font-weight:800; font-size:14px; text-decoration:none; box-shadow:0 8px 18px rgba(7,91,201,.18); transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
.nav-cta:hover{ transform: translateY(-1px); box-shadow:0 10px 24px rgba(7,91,201,.28); }
.nav-cta:active{ transform: translateY(0) scale(.98); }
.nav-auth-mobile { display:none; }
.menu-btn { display:none; background:#fff; border:1px solid #dde6f4; border-radius:8px; width:44px; height:44px; font-size:20px; }
.mobile-menu { display:none; }
@media (max-width:900px){
  /* Mismo punto de quiebre que la landing: 900px */
  .nav-links{ display:none; }
  .nav-auth-mobile{ display:flex; margin-right: 12px; }
  .menu-btn{ display:grid; place-items:center; }
  .mobile-menu{ display:grid; gap:8px; padding:0 0 16px; }
  .mobile-menu a{ padding:12px 14px; background:#fff; border:1px solid #e6edf7; border-radius:10px; text-decoration:none; color:#0a1e40; font-weight:700; }
  .mobile-menu .mobile-cta{ background:#075bc9; color:#fff; border-color:#075bc9; text-align:center; }
}

/* Hero */
.eyebrow { display:inline-block; margin:0 auto; background:#fff3eb; color:#c54800; border:1px solid #ffd8bc; padding:6px 12px; border-radius:999px; font-size:12px; font-weight:800; letter-spacing:.4px; }
.hero { max-width:950px; margin:22px auto 26px; text-align:center; }
.hero h1 { margin:14px 0 0; font-size: clamp(30px, 4vw, 52px); letter-spacing:-1.7px; line-height:1.06; }
.hero > p { margin:14px auto 0; max-width: 780px; font-size: clamp(15px, 1.7vw, 19px); line-height:1.55; color:#24344f; }
.trial { display:flex; justify-content:center; gap:36px; margin:22px auto 20px; font-size:14px; font-weight:700; flex-wrap:wrap; }
.trial span { display:flex; align-items:center; gap:10px; }
.trial span + span { padding-left:36px; border-left:1px solid #bac5d4; }
.trial svg { width:24px; height:24px; color:#075bc9; flex:0 0 auto; }
.billing-toggle { display:inline-flex; background:#eef2f8; padding:4px; border-radius:12px; gap:4px; margin:10px auto 0; transition: background .3s ease; }
.billing-toggle button { border:0; padding:10px 16px; min-height:44px; border-radius:9px; font-weight:800; font-size:13px; cursor:pointer; background:transparent; color:#5a6b86; display:flex; align-items:center; gap:7px; transition: all .2s cubic-bezier(0.4, 0, 0.2, 1); }
.billing-toggle button:not(.active):hover { color:#07183a; background: rgba(7,91,201,.08); }
.billing-toggle button.active { background:#fff; color:#07183a; box-shadow:0 2px 10px rgba(0,0,0,.08); transform: scale(1.02); }
.billing-toggle small { background:#e6f5ea; color:#0a7a33; padding:2px 7px; border-radius:999px; font-size:10px; }

/* Imagen de planes */
.plans-media { margin: 0 auto 6px; }
.plans-media img { display:block; width:100%; max-width:1280px; height:auto; margin:0 auto; border-radius:18px; border:1px solid #dfe5ee; box-shadow: 0 16px 42px rgba(18,37,70,.10); }

/* Plans */
.plans { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:22px; align-items:stretch; padding: 28px 0 18px; }
.card { --accent:#075bc9; position:relative; display:flex; flex-direction:column; min-width:0; padding:30px 28px 26px; overflow:hidden; background: rgba(255,255,255,.94); border:1px solid #dfe5ee; border-top:5px solid var(--accent); border-radius:18px; box-shadow:0 16px 42px rgba(18,37,70,.10); transition: transform .3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow .3s ease; }
.card:hover { transform: translateY(-8px); box-shadow:0 25px 55px rgba(18,37,70,.18); }
.card.popular { transform: translateY(-4px); border-color: #b8d0f0; box-shadow:0 20px 50px rgba(7,91,201,.15); outline: 2px solid rgba(7,91,201,.1); }
.card.emprendimiento{ --accent:#0794d2; } .card.basico{ --accent:#075bc9; } .card.crecimiento{ --accent:#069d41; } .card.pro{ --accent:#6322af; } .card.foodhall{ --accent:#f15a00; } .card.enterprise{ --accent:#06265f; }
.badge { position:absolute; top:13px; right:14px; padding:6px 11px; color:#fff; background:var(--accent); border-radius:999px; font-size:11px; font-weight:900; letter-spacing:.8px; text-transform:uppercase; box-shadow: 0 4px 10px color-mix(in srgb, var(--accent) 30%, transparent); }
.plan-title { display:flex; gap:14px; align-items:center; padding-right:64px; }
.icon { display:grid; place-items:center; width:48px; height:48px; flex:0 0 48px; color:#fff; background:var(--accent); border-radius:15px; box-shadow:0 8px 20px color-mix(in srgb, var(--accent) 22%, transparent); }
.icon svg { width:27px; height:27px; }
h2 { margin:0; color:var(--accent); font-size:22px; letter-spacing:-.4px; }
.scope { margin-top:3px; color:#4b5a72; font-size:14px; }
.price { margin:24px 0 16px; padding-bottom:18px; border-bottom:1px solid #dfe5ee; }
.price strong { font-size:31px; letter-spacing:-1.1px; }
.price span { font-size:17px; }
.annual { display:flex; flex-wrap:wrap; align-items:center; gap:7px; margin-top:10px; color:var(--accent); font-size:15px; font-weight:800; }
.annual strong{ font-size:20px; letter-spacing:-.4px; }
.annual.ok{ color:#087a35; }
.annual-hint{ font-weight:600; color:#667a95; font-style:normal; font-size:13px; }
.discount { padding:3px 8px; color:#087a35; background:#e4f6e9; border-radius:999px; font-size:10px; font-weight:800; }
.price .quote{ display:block; min-height:38px; padding-top:3px; font-size:24px; letter-spacing:-.5px; }
.summary{ min-height:50px; margin:0 0 16px; color:#34435a; font-size:15px; line-height:1.5; }
.includes{ margin:0 0 9px; font-size:14px; }
ul{ display:grid; gap:10px; margin:0 0 20px; padding:0; list-style:none; }
li{ position:relative; padding-left:23px; font-size:14px; line-height:1.35; }
li::before{ content:"✓"; position:absolute; left:0; top:1px; display:grid; place-items:center; width:16px; height:16px; color:#fff; background:var(--accent); border-radius:50%; font-size:11px; font-weight:900; }
.cta{ display:block; margin-top:auto; padding:14px 18px; color:#fff; background:var(--accent); border-radius:10px; box-shadow:0 9px 20px color-mix(in srgb, var(--accent) 20%, transparent); text-align:center; text-decoration:none; font-weight:800; transition: filter .2s, transform .2s, box-shadow .2s; }
.cta:hover{ filter:brightness(.92); transform: translateY(-2px); box-shadow:0 14px 28px color-mix(in srgb, var(--accent) 30%, transparent); }
.cta:active{ transform: translateY(0) scale(.985); }
.cta-note{ display:block; text-align:center; margin-top:8px; color:#7a8aa3; font-size:12px; }

/* Compare */
.compare{ margin: 6px auto 26px; background:#fff; border:1px solid #dfe5ee; border-radius:18px; padding:22px; box-shadow:0 16px 42px rgba(18,37,70,.06); }
.compare h3{ margin:0 0 16px; text-align:center; font-size:20px; }
.compare-grid{ display:grid; gap:1px; background:#e6edf7; border:1px solid #e6edf7; border-radius:12px; overflow:hidden; }
.compare-head, .compare-row{ display:grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr; background:#fff; }
.compare-head{ background:#071d48; color:#fff; font-weight:800; font-size:13px; }
.compare-head span, .compare-row span{ padding:12px 10px; text-align:center; font-size:13px; }
.compare-head span:first-child, .compare-row span:first-child{ text-align:left; font-weight:700; }
.compare-row span{ color:#34435a; }

.common{ margin:0 auto 34px; padding:26px 30px; background:#071d48; color:white; border-radius:18px; box-shadow:0 16px 42px rgba(18,37,70,.10); }
.common h3{ margin:0 0 16px; text-align:center; font-size:21px; }
.common-grid{ display:grid; grid-template-columns: repeat(4,1fr); gap:12px 22px; }
.common-grid span{ display:flex; gap:9px; align-items:center; font-size:14px; line-height:1.3; }
.common-grid b{ color:#ff7a20; font-size:17px; }
.benefits{ display:grid; grid-template-columns: repeat(5,1fr); gap:0; margin:0 auto 28px; text-align:center; background:#fff; border:1px solid #dfe5ee; border-radius:18px; overflow:hidden; box-shadow:0 16px 42px rgba(18,37,70,.06); }
.benefit{ padding:18px; font-size:14px; font-weight:700; }
.benefit + .benefit{ border-left:1px solid #e6edf7; }
.benefit svg{ display:block; width:29px; height:29px; margin:0 auto 8px; color:#075bc9; }

/* FAQ */
.faq{ margin:0 auto 28px; }
.faq h3{ text-align:center; font-size:26px; margin:0 0 16px; }
.faq-list{ display:grid; max-width:860px; margin:0 auto; gap:10px; }
details{ padding:10px 20px; background:#fff; border:1px solid #dfe5ee; border-radius:12px; transition: all .3s ease; }
summary{ cursor:pointer; font-weight:800; padding:11px 0; }
details p{ margin:10px 0 0; color:#5f6c82; line-height:1.5; animation: fadeIn 0.4s ease-out; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.cta-block{ margin:22px auto 0; max-width:860px; background:linear-gradient(135deg, #071d48, #0d3a86); color:#fff; border-radius:16px; padding:26px; display:flex; gap:20px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
.cta-block h4{ margin:0 0 4px; font-size:20px; }
.cta-block p{ margin:0; color:#d7e4f6; }
.cta-actions{ display:flex; gap:10px; }
.btn-primary{ background:#f15a00; color:#fff; padding:12px 18px; border-radius:10px; text-decoration:none; font-weight:800; }
.btn-outline{ background:rgba(255,255,255,.12); color:#fff; border:1px solid rgba(255,255,255,.3); padding:12px 18px; border-radius:10px; text-decoration:none; font-weight:800; }

.site-footer{ padding:22px 0 28px; color:#657187; text-align:center; font-size:13px; border-top:1px solid #e6edf7; background:#fbfdff; }
.site-footer a{ display:inline-block; padding:13px 2px; color:#075bc9; font-weight:800; text-decoration:none; }

@media (max-width: 1050px){
  .plans{ grid-template-columns: repeat(2, minmax(0,1fr)); }
  .common-grid{ grid-template-columns: repeat(2,1fr); }
  .benefits{ grid-template-columns: repeat(2,1fr); }
  .benefit + .benefit{ border:0; border-top:1px solid #e6edf7; }
  .compare-head, .compare-row{ grid-template-columns: 1.2fr .8fr .8fr .8fr .8fr .8fr; }
}
@media (max-width: 820px){
  /* El bloque de garantías envuelve a 2 filas: sin divisor colgando */
  .trial{ gap:14px 24px; }
  .trial span + span{ padding:0; border:0; }
}
/* Microinteracciones generales de la página: botones y enlaces del pie */
.btn-primary, .btn-outline{ transition: transform .18s ease, box-shadow .18s ease, filter .18s ease; }
.btn-primary:hover{ transform: translateY(-2px); box-shadow:0 12px 26px rgba(241,90,0,.35); filter:brightness(1.05); }
.btn-primary:active, .btn-outline:active{ transform: translateY(0) scale(.98); }
.btn-outline:hover{ background: rgba(255,255,255,.2); }
.site-footer a{ transition: color .15s ease; }

@media (prefers-reduced-motion: reduce){
  .nav-cta, .cta, .btn-primary, .btn-outline { transition: none; }
}

@media (max-width: 650px){
  .wrap{ width:min(100% - 24px, 520px); }
  .hero{ margin-top:12px; }
  .trial{ flex-direction:column; gap:13px; align-items:center; margin:18px 0 16px; }
  .trial span + span{ padding:0; border:0; }
  .plans{ grid-template-columns:1fr; gap:16px; }
  .card{ padding:25px 22px 22px; }
  .summary{ min-height:0; }
  .common{ padding:23px 20px; }
  .common-grid, .benefits{ grid-template-columns:1fr; }
  .benefit{ padding:14px; }
  .compare{ padding:14px; overflow:auto; }
  .compare-head, .compare-row{ min-width:560px; }
}
</style>
