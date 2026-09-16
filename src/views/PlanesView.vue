<template>
  <div class="planes-page">
    <!-- Top navigation minimalista -->
    <header class="topbar">
      <div class="wrap nav">
        <router-link to="/planes" class="logo" aria-label="eOrder">
          <span><i>e</i>Order</span><small>Easy Order</small>
        </router-link>
        <nav class="nav-links" aria-label="Navegación principal">
          <router-link to="/planes" class="nav-link active">Planes</router-link>
          <router-link to="/contactanos" class="nav-link">Contáctanos</router-link>
          <router-link to="/" class="nav-link ghost">Ingresar</router-link>
          <router-link to="/registro/dueno" class="nav-cta">Crear cuenta</router-link>
        </nav>
        <button class="menu-btn" @click="mobileOpen = !mobileOpen" aria-label="Abrir menú">
          <span v-if="!mobileOpen">☰</span>
          <span v-else>✕</span>
        </button>
      </div>
      <div v-if="mobileOpen" class="mobile-menu">
        <router-link to="/planes" @click="mobileOpen=false">Planes</router-link>
        <router-link to="/contactanos" @click="mobileOpen=false">Contáctanos</router-link>
        <router-link to="/" @click="mobileOpen=false">Ingresar</router-link>
        <router-link to="/registro/dueno" class="mobile-cta" @click="mobileOpen=false">Crear cuenta gratis</router-link>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero wrap" aria-labelledby="titulo-planes">
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

    <!-- Planes grid -->
    <section class="wrap plans" aria-label="Planes y precios de eOrder">
      <!-- Emprendimiento -->
      <article class="card emprendimiento" :class="{highlight: billing==='anual'}">
        <span class="badge">Desde $299</span>
        <div class="plan-title">
          <span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 10h18l-2-6H5l-2 6Z"/><path d="M5 10v10h14V10M9 20v-6h6v6M3 10c0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0"/></svg></span>
          <div><h2>Emprendimiento</h2><div class="scope">1 restaurante · hasta 5 conexiones</div></div>
        </div>
        <div class="price">
          <template v-if="billing==='mensual'">
            <strong>$299</strong> <span>MXN / mes</span>
            <div class="annual"><strong>$3,189</strong> MXN / año <span class="discount">11.12% dto.</span></div>
          </template>
          <template v-else>
            <strong>$266</strong> <span>MXN / mes <em class="annual-hint">(pago anual $3,189)</em></span>
            <div class="annual ok">Ahorras $399 al año</div>
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
            <strong>$899</strong> <span>MXN / mes</span>
            <div class="annual"><strong>$9,549</strong> MXN / año <span class="discount">11.49% dto.</span></div>
          </template>
          <template v-else>
            <strong>$796</strong> <span>MXN / mes <em class="annual-hint">(pago anual $9,549)</em></span>
            <div class="annual ok">Ahorras $1,239 al año</div>
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
            <strong>$1,899</strong> <span>MXN / mes</span>
            <div class="annual"><strong>$20,219</strong> MXN / año <span class="discount">11.27% dto.</span></div>
          </template>
          <template v-else>
            <strong>$1,685</strong> <span>MXN / mes <em class="annual-hint">($20,219 /año)</em></span>
            <div class="annual ok">Ahorras $2,569 al año</div>
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
            <strong>$3,399</strong> <span>MXN / mes</span>
            <div class="annual"><strong>$36,189</strong> MXN / año <span class="discount">11.27% dto.</span></div>
          </template>
          <template v-else>
            <strong>$3,016</strong> <span>MXN / mes <em class="annual-hint">($36,189 /año)</em></span>
            <div class="annual ok">Ahorras $4,599 al año</div>
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
            <strong>$1,499</strong> <span>MXN / mes</span>
            <div class="annual"><strong>$15,949</strong> MXN / año <span class="discount">11.33% dto.</span></div>
          </template>
          <template v-else>
            <strong>$1,329</strong> <span>MXN / mes <em class="annual-hint">($15,949 /año)</em></span>
            <div class="annual ok">Ahorras $2,039 al año</div>
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
    <section class="wrap compare" aria-label="Comparativa de planes">
      <h3>¿Cuál plan te conviene?</h3>
      <div class="compare-grid">
        <div class="compare-head"><span></span><span>Emp.</span><span>Básico</span><span>Crec.</span><span>Pro</span><span>Food Hall</span></div>
        <div class="compare-row"><span>Restaurantes</span><span>1</span><span>1</span><span>2</span><span>4</span><span>1</span></div>
        <div class="compare-row"><span>Conexiones</span><span>5</span><span>15</span><span>15</span><span>15</span><span>15</span></div>
        <div class="compare-row"><span>KDS incluidos</span><span>1</span><span>2</span><span>4</span><span>8</span><span>8</span></div>
        <div class="compare-row"><span>Reportes avanzados</span><span>—</span><span>✓</span><span>✓</span><span>✓</span><span>✓</span></div>
        <div class="compare-row"><span>Multi-sucursal</span><span>—</span><span>—</span><span>✓</span><span>✓</span><span>—</span></div>
      </div>
    </section>

    <section class="wrap common" aria-label="Funciones incluidas en los planes">
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

    <section class="wrap benefits" aria-label="Beneficios eOrder">
      <div class="benefit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M10 20V4M16 20v-7M22 20V7M2 20h22"/></svg>Más ventas y mejor control</div>
      <div class="benefit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Operación eficiente</div>
      <div class="benefit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 3h16v18H4zM8 16l3-4 2 2 3-5"/></svg>Métricas en tiempo real</div>
      <div class="benefit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 18a5 5 0 0 1 .5-10A7 7 0 0 1 21 10.5 4 4 0 0 1 20 18M12 12v9m0 0-3-3m3 3 3-3"/></svg>Información segura</div>
      <div class="benefit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 13a8 8 0 0 1 16 0M4 13v5h3v-5H4Zm13 0v5h3v-5h-3ZM17 20h-5"/></svg>Soporte humano</div>
    </section>

    <!-- FAQ + garantías -->
    <section class="wrap faq">
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

const billing = ref<'mensual'|'anual'>('mensual')
const mobileOpen = ref(false)
const year = new Date().getFullYear()

onMounted(() => {
  useSeo(ROUTE_SEO['/planes'])
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
}
.wrap { width: min(1500px, calc(100% - 40px)); margin: auto; }

/* Topbar */
.topbar { position: sticky; top:0; z-index:30; backdrop-filter: blur(12px); background: rgba(255,255,255,.82); border-bottom: 1px solid #e6edf7; }
.nav { display:flex; align-items:center; justify-content:space-between; padding:14px 0; }
.logo { display:inline-flex; flex-direction:column; line-height:.72; letter-spacing:-2.6px; font-weight:900; font-size:34px; color:#075bc9; text-decoration:none; }
.logo i { font-style: italic; }
.logo small { margin-top:6px; padding-left:22px; color:#f15a00; font-size:.34em; letter-spacing:-.7px; }
.nav-links { display:flex; gap:18px; align-items:center; }
.nav-link { font-size:14px; font-weight:600; color:#34435a; text-decoration:none; padding:8px 10px; border-radius:8px; }
.nav-link.active, .nav-link:hover { color:#075bc9; background:#eef4ff; }
.nav-link.ghost { border:1px solid #dbe6f6; }
.nav-cta { background:#075bc9; color:#fff; padding:10px 16px; border-radius:10px; font-weight:800; font-size:14px; text-decoration:none; box-shadow:0 8px 18px rgba(7,91,201,.18); }
.menu-btn { display:none; background:#fff; border:1px solid #dde6f4; border-radius:8px; width:42px; height:42px; font-size:20px; }
.mobile-menu { display:none; }
@media (max-width:780px){
  .nav-links{ display:none; }
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
.billing-toggle { display:inline-flex; background:#eef2f8; padding:4px; border-radius:12px; gap:4px; margin:10px auto 0; }
.billing-toggle button { border:0; padding:8px 16px; border-radius:9px; font-weight:800; font-size:13px; cursor:pointer; background:transparent; color:#5a6b86; display:flex; align-items:center; gap:7px; }
.billing-toggle button.active { background:#fff; color:#07183a; box-shadow:0 2px 10px rgba(0,0,0,.08); }
.billing-toggle small { background:#e6f5ea; color:#0a7a33; padding:2px 7px; border-radius:999px; font-size:10px; }

/* Plans */
.plans { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:22px; align-items:stretch; padding: 28px 0 18px; }
.card { --accent:#075bc9; position:relative; display:flex; flex-direction:column; min-width:0; padding:30px 28px 26px; overflow:hidden; background: rgba(255,255,255,.94); border:1px solid #dfe5ee; border-top:5px solid var(--accent); border-radius:18px; box-shadow:0 16px 42px rgba(18,37,70,.10); transition: transform .2s, box-shadow .2s; }
.card:hover { transform: translateY(-5px); box-shadow:0 22px 52px rgba(18,37,70,.16); }
.card.popular { transform: translateY(-2px); border-color: #b8d0f0; box-shadow:0 20px 50px rgba(7,91,201,.12); }
.card.emprendimiento{ --accent:#0794d2; } .card.basico{ --accent:#075bc9; } .card.crecimiento{ --accent:#069d41; } .card.pro{ --accent:#6322af; } .card.foodhall{ --accent:#f15a00; } .card.enterprise{ --accent:#06265f; }
.badge { position:absolute; top:13px; right:14px; padding:6px 11px; color:#fff; background:var(--accent); border-radius:999px; font-size:11px; font-weight:900; letter-spacing:.8px; text-transform:uppercase; }
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
.cta{ display:block; margin-top:auto; padding:14px 18px; color:#fff; background:var(--accent); border-radius:10px; box-shadow:0 9px 20px color-mix(in srgb, var(--accent) 20%, transparent); text-align:center; text-decoration:none; font-weight:800; transition: filter .2s, transform .2s; }
.cta:hover{ filter:brightness(.92); transform: translateY(-1px); }
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
details{ padding:17px 20px; background:#fff; border:1px solid #dfe5ee; border-radius:12px; }
summary{ cursor:pointer; font-weight:800; }
details p{ margin:10px 0 0; color:#5f6c82; line-height:1.5; }
.cta-block{ margin:22px auto 0; max-width:860px; background:linear-gradient(135deg, #071d48, #0d3a86); color:#fff; border-radius:16px; padding:26px; display:flex; gap:20px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
.cta-block h4{ margin:0 0 4px; font-size:20px; }
.cta-block p{ margin:0; color:#d7e4f6; }
.cta-actions{ display:flex; gap:10px; }
.btn-primary{ background:#f15a00; color:#fff; padding:12px 18px; border-radius:10px; text-decoration:none; font-weight:800; }
.btn-outline{ background:rgba(255,255,255,.12); color:#fff; border:1px solid rgba(255,255,255,.3); padding:12px 18px; border-radius:10px; text-decoration:none; font-weight:800; }

.site-footer{ padding:22px 0 28px; color:#657187; text-align:center; font-size:13px; border-top:1px solid #e6edf7; background:#fbfdff; }
.site-footer a{ color:#075bc9; font-weight:800; text-decoration:none; }

@media (max-width: 1050px){
  .plans{ grid-template-columns: repeat(2, minmax(0,1fr)); }
  .common-grid{ grid-template-columns: repeat(2,1fr); }
  .benefits{ grid-template-columns: repeat(2,1fr); }
  .benefit + .benefit{ border:0; border-top:1px solid #e6edf7; }
  .compare-head, .compare-row{ grid-template-columns: 1.2fr .8fr .8fr .8fr .8fr .8fr; }
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
