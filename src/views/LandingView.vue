<template>
  <div class="landing">
    <header class="topbar">
      <div class="wrap nav">
        <router-link to="/" class="logo"><span><i>e</i>Order</span><small>Easy Order</small></router-link>
        <nav class="nav-links">
          <router-link to="/planes" class="nav-link">Planes</router-link>
          <router-link to="/contactanos" class="nav-link">Contáctanos</router-link>
          <router-link to="/login" class="nav-link ghost">Ingresar</router-link>
          <router-link to="/registro/dueno" class="nav-cta">Crear cuenta</router-link>
        </nav>
        <button class="menu-btn" @click="mobileOpen = !mobileOpen">{{ mobileOpen ? '✕' : '☰' }}</button>
      </div>
      <div v-if="mobileOpen" class="mobile-menu">
        <router-link to="/planes" @click="mobileOpen = false">Planes</router-link>
        <router-link to="/contactanos" @click="mobileOpen = false">Contáctanos</router-link>
        <router-link to="/login" @click="mobileOpen = false">Ingresar</router-link>
        <router-link to="/registro/dueno" class="m-cta" @click="mobileOpen = false">Crear cuenta</router-link>
      </div>
    </header>

    <main>
      <!-- HERO -->
      <section class="hero">
        <div class="wrap hero-grid">
          <div class="hero-copy">
            <span class="eyebrow">Todo en uno para tu restaurante</span>
            <h1>Administra tu restaurante <em>en tiempo real</em></h1>
            <p>
              eOrder conecta meseros, cocina, barra y caja en una sola plataforma.
              Toma pedidos, controla tu inventario y mira tus ventas desde cualquier dispositivo.
            </p>
            <div class="hero-actions">
              <router-link to="/registro/dueno" class="btn btn-primary">Empieza gratis 30 días</router-link>
              <router-link to="/planes" class="btn btn-ghost">Ver planes</router-link>
            </div>
            <div class="hero-badges">
              <span>⚡ POS en tiempo real</span>
              <span>🍽️ Cocina y barra conectadas</span>
              <span>🇲🇽 Soporte en México</span>
            </div>
          </div>
          <div class="hero-card" aria-hidden="true">
            <div class="hc-head">
              <span class="hc-dot"></span><span class="hc-dot"></span><span class="hc-dot"></span>
              <b>Panel eOrder</b>
            </div>
            <div class="hc-row"><span>Órdenes hoy</span><b>128</b></div>
            <div class="hc-row"><span>Ventas del día</span><b>$18,450</b></div>
            <div class="hc-row"><span>Ticket promedio</span><b>$144</b></div>
            <div class="hc-bars">
              <span style="height:35%"></span><span style="height:55%"></span><span style="height:42%"></span>
              <span style="height:70%"></span><span style="height:62%"></span><span style="height:88%"></span>
              <span style="height:100%"></span>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURES -->
      <section class="section">
        <div class="wrap">
          <span class="eyebrow center">Módulos incluidos</span>
          <h2 class="center">Una plataforma, todo tu operación</h2>
          <div class="grid">
            <div class="card"><span class="ico">🧾</span><h3>POS y Caja</h3><p>Cobros rápidos, cortes de caja y control de métodos de pago sin hojas de cálculo.</p></div>
            <div class="card"><span class="ico">👨‍🍳</span><h3>Cocina (KDS)</h3><p>Comandas en pantalla, tiempos por orden y sincronización instantánea con los meseros.</p></div>
            <div class="card"><span class="ico">🍹</span><h3>Barra y Meseros</h3><p>Toma de pedidos desde el salon con rutas dedicadas para barra, cocina y postres.</p></div>
            <div class="card"><span class="ico">📊</span><h3>Análisis y Reportes</h3><p>Ventas por hora, producto más vendido, utilidad del día y tendencias de la semana.</p></div>
            <div class="card"><span class="ico">📦</span><h3>Inventario y Nómina</h3><p>Ingredientes, gastos y nómina de tu personal en el mismo panel administrativo.</p></div>
            <div class="card"><span class="ico">🔔</span><h3>Licencias y Avisos</h3><p>Control de suscripciones, avisos de renovación y soporte directo por WhatsApp.</p></div>
          </div>
        </div>
      </section>

      <!-- PLANES -->
      <section class="section alt">
        <div class="wrap">
          <span class="eyebrow center">Precios claros</span>
          <h2 class="center">Planes desde $299 MXN/mes</h2>
          <p class="center sub">30 días gratis · Sin permanencia · Cancela cuando quieras</p>
          <div class="plans">
            <div class="plan">
              <h3>Emprendimiento</h3>
              <p class="price">$299<span>/mes</span></p>
              <p class="desc">Para negocios que empiezan a digitalizarse.</p>
            </div>
            <div class="plan featured">
              <span class="tag">Más popular</span>
              <h3>Básico</h3>
              <p class="price">$899<span>/mes</span></p>
              <p class="desc">POS completo con cocina, barra y caja.</p>
            </div>
            <div class="plan">
              <h3>Crecimiento</h3>
              <p class="price">$1,899<span>/mes</span></p>
              <p class="desc">Análisis, inventario y nómina para crecer.</p>
            </div>
          </div>
          <div class="center" style="margin-top: 28px">
            <router-link to="/planes" class="btn btn-primary">Comparar todos los planes</router-link>
          </div>
        </div>
      </section>

      <!-- CTA FINAL -->
      <section class="section final">
        <div class="wrap center">
          <h2>¿Listo para digitalizar tu restaurante?</h2>
          <p class="sub">Crea tu cuenta hoy o platique con un representante de eOrder.</p>
          <div class="hero-actions center">
            <router-link to="/registro/dueno" class="btn btn-primary">Crear mi cuenta</router-link>
            <router-link to="/contactanos" class="btn btn-outline">Hablar con ventas</router-link>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="wrap foot-grid">
        <div>
          <span class="logo foot-logo"><span><i>e</i>Order</span><small>Easy Order</small></span>
          <p>El sistema integral para restaurantes: POS, cocina, barra, caja y administración en tiempo real.</p>
        </div>
        <div>
          <b>Producto</b>
          <router-link to="/planes">Planes</router-link>
          <router-link to="/login">Ingresar</router-link>
          <router-link to="/registro/dueno">Crear cuenta</router-link>
        </div>
        <div>
          <b>Compañía</b>
          <router-link to="/contactanos">Contáctanos</router-link>
          <router-link to="/terminos-y-condiciones">Términos y condiciones</router-link>
        </div>
      </div>
      <p class="copy">© {{ new Date().getFullYear() }} Easy Order · eorder.mx</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mobileOpen = ref(false)
</script>

<style scoped>
.landing { background: #fff; color: #0f172a; }
.wrap { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
.center { text-align: center; }

/* Nav */
.topbar { position: sticky; top: 0; z-index: 30; background: rgba(255,255,255,.9); backdrop-filter: blur(8px); border-bottom: 1px solid #eef2f7; }
.nav { display: flex; align-items: center; justify-content: space-between; height: 64px; }
.logo { display: flex; flex-direction: column; line-height: 1; text-decoration: none; color: #0f172a; }
.logo span { font-size: 22px; font-weight: 800; }
.logo i { font-style: normal; color: #4f46e5; }
.logo small { font-size: 10px; letter-spacing: .18em; color: #94a3b8; text-transform: uppercase; }
.nav-links { display: flex; align-items: center; gap: 18px; }
.nav-link { text-decoration: none; color: #334155; font-weight: 600; font-size: 14px; }
.nav-link:hover { color: #4f46e5; }
.nav-link.ghost { color: #4f46e5; }
.nav-cta { background: #4f46e5; color: #fff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 9px 16px; border-radius: 10px; }
.nav-cta:hover { background: #4338ca; }
.menu-btn { display: none; background: none; border: 0; font-size: 20px; color: #0f172a; }
.mobile-menu { display: none; }

/* Hero */
.hero { padding: 64px 0 40px; }
.hero-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 40px; align-items: center; }
.eyebrow { display: inline-block; font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #4f46e5; background: #eef2ff; padding: 6px 12px; border-radius: 999px; }
.eyebrow.center { margin-top: 8px; }
.hero h1 { font-size: 44px; line-height: 1.08; margin: 16px 0 14px; letter-spacing: -.02em; }
.hero h1 em { font-style: normal; color: #4f46e5; }
.hero p { font-size: 17px; color: #475569; max-width: 520px; }
.hero-actions { display: flex; gap: 12px; margin: 24px 0 18px; flex-wrap: wrap; }
.hero-actions.center { justify-content: center; }
.btn { display: inline-block; padding: 13px 22px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 15px; }
.btn-primary { background: #4f46e5; color: #fff; box-shadow: 0 8px 20px rgba(79,70,229,.25); }
.btn-primary:hover { background: #4338ca; }
.btn-ghost { color: #4f46e5; background: #eef2ff; }
.btn-outline { color: #4f46e5; border: 2px solid #c7d2fe; }
.hero-badges { display: flex; gap: 14px; flex-wrap: wrap; font-size: 13px; color: #64748b; }

.hero-card { background: #0f172a; border-radius: 18px; padding: 18px; color: #e2e8f0; box-shadow: 0 24px 50px rgba(15,23,42,.25); }
.hc-head { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; margin-bottom: 12px; }
.hc-head b { margin-left: auto; color: #e2e8f0; }
.hc-dot { width: 9px; height: 9px; border-radius: 50%; background: #475569; }
.hc-row { display: flex; justify-content: space-between; padding: 10px 4px; border-bottom: 1px solid #1e293b; font-size: 14px; color: #94a3b8; }
.hc-row b { color: #fff; font-size: 16px; }
.hc-bars { display: flex; align-items: flex-end; gap: 8px; height: 90px; margin-top: 16px; }
.hc-bars span { flex: 1; background: linear-gradient(180deg,#6366f1,#4f46e5); border-radius: 6px 6px 0 0; }

/* Secciones */
.section { padding: 64px 0; }
.section.alt { background: #f8fafc; }
.section.final { background: #0f172a; color: #fff; padding: 72px 0; }
.section.final h2 { margin: 10px 0 8px; }
h2 { font-size: 30px; letter-spacing: -.01em; margin: 8px 0 10px; }
.sub { color: #64748b; font-size: 15px; }
.section.final .sub { color: #94a3b8; }

.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 26px; }
.card { background: #fff; border: 1px solid #eef2f7; border-radius: 16px; padding: 22px; box-shadow: 0 6px 18px rgba(15,23,42,.05); }
.card .ico { font-size: 26px; }
.card h3 { margin: 10px 0 6px; font-size: 17px; }
.card p { color: #64748b; font-size: 14px; line-height: 1.55; }

.plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 26px; }
.plan { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; position: relative; }
.plan.featured { border-color: #4f46e5; box-shadow: 0 14px 34px rgba(79,70,229,.18); }
.plan .tag { position: absolute; top: -12px; left: 20px; background: #4f46e5; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 999px; letter-spacing: .06em; }
.plan h3 { font-size: 16px; color: #334155; }
.price { font-size: 32px; font-weight: 800; color: #0f172a; margin: 6px 0; }
.price span { font-size: 13px; font-weight: 600; color: #94a3b8; }
.desc { color: #64748b; font-size: 14px; }

/* Footer */
.footer { background: #0b1220; color: #94a3b8; padding: 44px 0 18px; }
.foot-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 28px; }
.foot-logo span { color: #fff; }
.footer p { font-size: 13px; line-height: 1.6; margin-top: 10px; }
.footer b { display: block; color: #e2e8f0; font-size: 13px; margin-bottom: 10px; }
.footer a { display: block; color: #94a3b8; text-decoration: none; font-size: 13px; padding: 3px 0; }
.footer a:hover { color: #c7d2fe; }
.copy { text-align: center; margin-top: 28px; font-size: 12px; color: #64748b; }

/* Responsive */
@media (max-width: 900px) {
  .hero-grid, .grid, .plans, .foot-grid { grid-template-columns: 1fr; }
  .hero h1 { font-size: 34px; }
  .nav-links { display: none; }
  .menu-btn { display: block; }
  .mobile-menu { display: flex; flex-direction: column; gap: 4px; padding: 10px 20px 16px; border-top: 1px solid #eef2f7; }
  .mobile-menu a { text-decoration: none; color: #334155; font-weight: 600; padding: 10px 4px; }
  .mobile-menu a.m-cta { background: #4f46e5; color: #fff; border-radius: 10px; text-align: center; margin-top: 6px; }
}
</style>
