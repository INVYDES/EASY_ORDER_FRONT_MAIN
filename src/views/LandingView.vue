<template>
  <div class="landing" :class="{ oscuro }" :lang="idioma">
    <!-- Fondo dinámico que sube al hacer scroll -->
    <div class="scroll-bg" :style="{ height: scrollProgress + '%' }"></div>

    <!-- Elementos decorativos (Blobs) -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <header class="topbar">
      <div class="wrap nav">
        <router-link to="/" class="logo" :aria-label="t('nav.ariaLogo')">
          <img src="/logo-eorder.jpg" alt="eOrder - Easy Order" class="logo-img" width="210" height="52" loading="eager" decoding="async" />
        </router-link>
        <nav class="nav-links">
          <router-link to="/planes" @mouseenter="prefetchRuta('/planes')" @focusin="prefetchRuta('/planes')" class="nav-link">{{ t('nav.planes') }}</router-link>
          <router-link to="/contactanos" @mouseenter="prefetchRuta('/contactanos')" @focusin="prefetchRuta('/contactanos')" class="nav-link">{{ t('nav.contactanos') }}</router-link>
          <router-link to="/login" class="nav-link ghost">{{ t('nav.ingresar') }}</router-link>
          <router-link to="/registro/dueno" class="nav-cta">{{ t('nav.crearCuenta') }}</router-link>
          <PreferenciasControl />
        </nav>
        <div class="nav-auth-mobile">
          <router-link to="/login" class="nav-link ghost">{{ t('nav.ingresar') }}</router-link>
          <PreferenciasControl />
        </div>
        <button
          class="menu-btn"
          :aria-expanded="mobileOpen"
          aria-controls="menu-movil"
          :aria-label="mobileOpen ? t('nav.cerrarMenu') : t('nav.abrirMenu')"
          @click="mobileOpen = !mobileOpen"
        >
          {{ mobileOpen ? '✕' : '☰' }}
        </button>
      </div>
      <div v-if="mobileOpen" id="menu-movil" class="mobile-menu">
        <router-link to="/planes" @click="mobileOpen = false">{{ t('nav.planes') }}</router-link>
        <router-link to="/contactanos" @click="mobileOpen = false">{{ t('nav.contactanos') }}</router-link>
        <router-link to="/registro/dueno" class="m-cta" @click="mobileOpen = false">{{ t('nav.crearCuenta') }}</router-link>
        <PreferenciasControl />
      </div>
    </header>

    <main>
      <!-- HERO -->
      <section class="hero reveal">
        <div class="wrap hero-grid">
          <div class="hero-copy">
            <span class="eyebrow">{{ t('hero.eyebrow') }}</span>
            <h1 class="text-gradient">{{ t('hero.tituloA') }}<em>{{ t('hero.tituloEm') }}</em>{{ t('hero.tituloB') }}</h1>
            <p>{{ t('hero.parrafo') }}</p>
            <div class="hero-actions">
              <router-link to="/registro/dueno" class="btn btn-primary">{{ t('hero.ctaPrueba') }} <small>{{ t('hero.ctaPruebaNota') }}</small></router-link>
              <a href="#demo" class="btn btn-ghost">{{ t('hero.ctaDemo') }}</a>
            </div>
            <div class="proof-bar">{{ t('hero.proof') }}</div>
          </div>
          <div class="hero-card" aria-hidden="true">
            <div class="hc-head">
              <span class="hc-dot"></span><span class="hc-dot"></span><span class="hc-dot"></span>
              <b>{{ t('hero.kdsTitulo') }}</b>
            </div>
            <div class="hc-order"><span class="hc-num">{{ t('hero.kdsOrden') }}</span><span class="hc-timer">{{ t('hero.kdsTimer') }}</span></div>
            <div class="hc-item done"><span>{{ t('hero.kdsItem1') }}</span><b>{{ t('hero.kdsEstado1') }}</b></div>
            <div class="hc-item warn"><span>{{ t('hero.kdsItem2') }}</span><b>{{ t('hero.kdsEstado2') }}</b></div>
            <div class="hc-item"><span>{{ t('hero.kdsItem3') }}</span><b>{{ t('hero.kdsEstado3') }}</b></div>
            <div class="hc-foot">{{ t('hero.kdsFoot') }}</div>
          </div>
        </div>
      </section>

      <!-- DEMO INTERACTIVA -->
      <section id="demo" class="section demo reveal" aria-labelledby="demo-title">
        <div class="wrap">
          <span class="eyebrow center">{{ t('demo.eyebrow') }}</span>
          <h2 id="demo-title" class="center">{{ t('demo.titulo') }}</h2>
          <p class="center sub">{{ t('demo.sub') }}</p>

          <div class="demo-shell">
            <div class="demo-tabs" role="tablist" :aria-label="t('demo.estacionesAria')">
              <button
                v-for="(tab, i) in DEMO_TABS"
                :key="tab.id"
                ref="tabButtons"
                type="button"
                role="tab"
                :id="`tab-${tab.id}`"
                :aria-selected="demoTab === tab.id"
                :aria-controls="`panel-${tab.id}`"
                :tabindex="demoTab === tab.id ? 0 : -1"
                :class="{ active: demoTab === tab.id }"
                @click="activarTab(tab.id, i)"
                @keydown="onTabKey($event, i)"
              >
                <span class="tb-ico" aria-hidden="true">{{ tab.icon }}</span>
                <span class="lbl-lg">{{ t(tab.labelKey) }}</span>
                <span class="lbl-sm">{{ t(tab.labelCortoKey) }}</span>
              </button>
              <button type="button" class="btn-reset" @click="resetDemo" :title="t('demo.reset')">🔄</button>
            </div>

            <div class="demo-panel">
              <Transition name="fade" mode="out-in">
                <div
                  :key="demoTab"
                  class="dp-frame"
                  role="tabpanel"
                  :id="`panel-${demoTab}`"
                  :aria-labelledby="`tab-${demoTab}`"
                >
                  <div class="dp-head">
                    <span class="dp-dot"></span><span class="dp-dot"></span><span class="dp-dot"></span>
                    <b>{{ t(demo.titleKey) }}</b>
                    <span class="dp-live"><i></i>{{ t('demo.enVivo') }}</span>
                    <em>{{ metaPanel }}</em>
                  </div>

                  <button
                    v-for="(item, i) in demo.items"
                    :key="item.nombreKey"
                    type="button"
                    class="dp-row"
                    @click="avanzar(i)"
                  >
                    <span class="dp-name">{{ t(item.nombreKey) }}</span>
                    <span class="dp-meta">
                      <span v-if="item.extra" class="dp-price">{{ item.extra }}</span>
                      <span
                        v-if="demo.arranque"
                        class="dp-timer"
                        :class="tonoTiempo(transcurrido(i))"
                      >
                        {{ mmss(transcurrido(i)) }}
                      </span>
                      <em class="pill" :class="`pill-${estadoDe(i).tone}`">{{ estadoDe(i).label }}</em>
                    </span>
                  </button>

                  <div class="dp-progress">
                    <div
                      class="dp-bar"
                      role="progressbar"
                      :aria-label="t('demo.avanceAria')"
                      :aria-valuenow="completos"
                      aria-valuemin="0"
                      :aria-valuemax="demo.items.length"
                    >
                      <span :style="{ width: `${progreso}%` }"></span>
                    </div>
                    <p class="dp-status" aria-live="polite">{{ resumen }}</p>
                  </div>

                  <div class="dp-foot">{{ t(demo.footKey) }}</div>
                </div>
              </Transition>
            </div>
          </div>

          <div class="impact">
            <div class="impact-card">
              <span class="ico">⏱️</span>
              <h3>{{ t('impacto.1.titulo') }}</h3>
              <p>{{ t('impacto.1.texto') }}</p>
            </div>
            <div class="impact-card">
              <span class="ico">📴</span>
              <h3>{{ t('impacto.2.titulo') }}</h3>
              <p>{{ t('impacto.2.texto') }}</p>
            </div>
            <div class="impact-card">
              <span class="ico">📊</span>
              <h3>{{ t('impacto.3.titulo') }}</h3>
              <p>{{ t('impacto.3.texto') }}</p>
            </div>
          </div>

          <div class="hero-actions center">
            <router-link to="/planes" class="btn btn-primary">{{ t('planes.verTodos') }}</router-link>
            <router-link to="/contactanos" class="btn btn-outline">{{ t('cta.demo') }}</router-link>
          </div>
        </div>
      </section>

      <!-- MÓDULOS: problema → solución -->
      <section class="section reveal">
        <div class="wrap">
          <span class="eyebrow center">{{ t('modulos.eyebrow') }}</span>
          <h2 class="center">{{ t('modulos.titulo') }}</h2>
          <div class="grid">
            <div class="card">
              <span class="ico">🧾</span>
              <h3>{{ t('modulos.1.titulo') }}</h3>
              <p><b>{{ t('modulos.problema') }}</b> {{ t('modulos.1.problema') }}</p>
              <p class="sol"><b>{{ t('modulos.solucion') }}</b> {{ t('modulos.1.solucion') }}</p>
            </div>
            <div class="card">
              <span class="ico">👨‍🍳</span>
              <h3>{{ t('modulos.2.titulo') }}</h3>
              <p><b>{{ t('modulos.problema') }}</b> {{ t('modulos.2.problema') }}</p>
              <p class="sol"><b>{{ t('modulos.solucion') }}</b> {{ t('modulos.2.solucion') }}</p>
            </div>
            <div class="card">
              <span class="ico">🍹</span>
              <h3>{{ t('modulos.3.titulo') }}</h3>
              <p><b>{{ t('modulos.problema') }}</b> {{ t('modulos.3.problema') }}</p>
              <p class="sol"><b>{{ t('modulos.solucion') }}</b> {{ t('modulos.3.solucion') }}</p>
            </div>
            <div class="card">
              <span class="ico">📊</span>
              <h3>{{ t('modulos.4.titulo') }}</h3>
              <p><b>{{ t('modulos.problema') }}</b> {{ t('modulos.4.problema') }}</p>
              <p class="sol"><b>{{ t('modulos.solucion') }}</b> {{ t('modulos.4.solucion') }}</p>
            </div>
            <div class="card">
              <span class="ico">📈</span>
              <h3>{{ t('modulos.5.titulo') }}</h3>
              <p><b>{{ t('modulos.problema') }}</b> {{ t('modulos.5.problema') }}</p>
              <p class="sol"><b>{{ t('modulos.solucion') }}</b> {{ t('modulos.5.solucion') }}</p>
            </div>
            <div class="card">
              <span class="ico">🔔</span>
              <h3>{{ t('modulos.6.titulo') }}</h3>
              <p><b>{{ t('modulos.problema') }}</b> {{ t('modulos.6.problema') }}</p>
              <p class="sol"><b>{{ t('modulos.solucion') }}</b> {{ t('modulos.6.solucion') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA INTERMEDIO — repite la llamada a la acción a media página -->
      <section class="section cta-band reveal">
        <div class="wrap center">
          <span class="eyebrow center">{{ t('cta.eyebrow') }}</span>
          <h2 class="center">{{ t('cta.titulo') }}</h2>
          <p class="sub center">{{ t('cta.sub') }}</p>
          <div class="hero-actions center">
            <router-link to="/registro/dueno" class="btn btn-primary">{{ t('cta.principal') }} <span class="arrow">→</span></router-link>
            <router-link to="/contactanos" class="btn btn-outline">{{ t('cta.demo') }}</router-link>
          </div>
        </div>
      </section>

      <!-- MATRIZ DE PLANES -->
      <section class="section alt reveal">
        <div class="wrap">
          <span class="eyebrow center">{{ t('planes.eyebrow') }}</span>
          <h2 class="center">{{ t('planes.titulo') }}</h2>
          <p class="center sub">{{ t('planes.sub') }}</p>
          <figure class="planes-figure">
            <img
              src="/Planes.jpg"
              width="1280"
              height="853"
              loading="lazy"
              decoding="async"
              :alt="t('planes.altImagen')"
            >
          </figure>
          <div class="table-wrap">
            <table class="matrix">
              <thead>
                <tr>
                  <th>{{ t('planes.caracteristica') }}</th>
                  <th
                    v-for="plan in matrixPlans"
                    :key="plan.id"
                    :class="{ hl: plan.id === 'basico' }"
                  >
                    <div v-if="plan.id === 'basico'" class="plan-badge">{{ t('planes.popular') }}</div>{{ plan.name }}
                    <small>{{ plan.mensual !== null ? `$${mxn(plan.mensual)}${t('planes.porMes')}` : t('planes.cotizacion') }}</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in LANDING_MATRIX" :key="row.label">
                  <td>{{ etiquetaFila(row.label) }}</td>
                  <td
                    v-for="(value, i) in row.values"
                    :key="i"
                    :class="{ hl: matrixPlans[i].id === 'basico', flag: row.boolean }"
                  >
                    {{ tv(value) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="table-hint">{{ t('planes.hint') }}</p>
          <p class="matrix-note">{{ t('planes.nota') }}</p>
          <div class="center" style="margin-top: 24px">
            <router-link to="/planes" class="btn btn-primary">{{ t('planes.verTodos') }}</router-link>
            <router-link to="/contactanos" class="btn btn-outline">{{ t('planes.asesor') }}</router-link>
          </div>
        </div>
      </section>

      <!-- TESTIMONIOS -->
      <section v-if="testimonios.length" class="section alt reveal" aria-labelledby="testimonios-title">
        <div class="wrap">
          <span class="eyebrow center">{{ t('test.eyebrow') }}</span>
          <h2 id="testimonios-title" class="center">{{ t('test.titulo') }}</h2>

          <div class="testimonios-grid">
            <figure v-for="testimonio in testimonios" :key="testimonio.nombre" class="testimonio-card">
              <div class="stars" role="img" :aria-label="t('test.estrellasAria')">★★★★★</div>
              <blockquote>“{{ testimonio.texto }}”</blockquote>
              <figcaption>
                <span class="avatar" aria-hidden="true">{{ testimonio.inicial }}</span>
                <span>
                  <b>{{ testimonio.nombre }}</b>
                  <small>{{ testimonio.negocio }}<template v-if="testimonio.ciudad"> · {{ testimonio.ciudad }}</template></small>
                </span>
              </figcaption>
            </figure>
          </div>

          <p class="testimonios-nota">
            {{ t('test.notaA') }}
            <router-link to="/contactanos">{{ t('test.referencias') }}</router-link>{{ t('test.notaB') }}
          </p>
        </div>
      </section>

      <!-- FAQ -->
      <section class="section reveal">
        <div class="wrap">
          <span class="eyebrow center">{{ t('faq.eyebrow') }}</span>
          <h2 class="center">{{ t('faq.titulo') }}</h2>
          <div class="faq-list">
            <details open><summary>{{ t('faq.1.q') }}</summary><p>{{ t('faq.1.a') }}</p></details>
            <details><summary>{{ t('faq.2.q') }}</summary><p>{{ t('faq.2.a') }}</p></details>
            <details><summary>{{ t('faq.3.q') }}</summary><p>{{ t('faq.3.a') }}</p></details>
            <details><summary>{{ t('faq.4.q') }}</summary><p>{{ t('faq.4.a') }}</p></details>
            <details><summary>{{ t('faq.5.q') }}</summary><p>{{ t('faq.5.a') }}</p></details>
            <details><summary>{{ t('faq.6.q') }}</summary><p>{{ t('faq.6.a') }}</p></details>
          </div>
        </div>
      </section>

      <!-- CTA FINAL -->
      <section class="section final reveal">
        <div class="wrap center">
          <h2>{{ t('final.titulo') }}</h2>
          <p class="sub">{{ t('final.sub') }}</p>
          <div class="hero-actions center">
            <router-link to="/registro/dueno" class="btn btn-primary">{{ t('final.crearCuenta') }}</router-link>
            <router-link to="/contactanos" class="btn btn-outline">{{ t('final.agendar') }}</router-link>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="wrap foot-grid">
        <div>
          <router-link to="/" class="logo foot-logo" :aria-label="t('nav.ariaLogo')">
            <img src="/logo-eorder.jpg" alt="eOrder - Easy Order" class="logo-img foot-logo-img" width="160" height="40" loading="lazy" decoding="async" />
          </router-link>
          <p>{{ t('footer.desc') }}</p>
        </div>
        <div>
          <b>{{ t('footer.producto') }}</b>
          <router-link to="/planes">{{ t('nav.planes') }}</router-link>
          <router-link to="/login">{{ t('nav.ingresar') }}</router-link>
          <router-link to="/registro/dueno">{{ t('nav.crearCuenta') }}</router-link>
        </div>
        <div>
          <b>{{ t('footer.compania') }}</b>
          <router-link to="/contactanos">{{ t('nav.contactanos') }}</router-link>
          <router-link to="/terminos-y-condiciones">{{ t('footer.terminos') }}</router-link>
          <router-link to="/politica-de-seguridad">{{ t('footer.seguridad') }}</router-link>
        </div>
      </div>
      <p class="copy">© {{ new Date().getFullYear() }} {{ t('footer.copy') }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { LANDING_MATRIX, LANDING_PLAN_IDS, PLAN_BY_ID, mxn } from '@/config/planes'
import type { ClaveTexto } from '@/i18n/landing'
import PreferenciasControl from '@/components/PreferenciasControl.vue'
import { usePreferencias } from '@/stores/preferencias'
import { crearPrefetchDeRutas } from '@/utils/prefetch'
import { useRouter } from 'vue-router'

// Idioma (ES/EN) y tema (claro/oscuro) de la landing. El panel interno no los usa.
const { idioma, oscuro, t, tv } = usePreferencias()

// Precarga de chunks al hover: Planes/Contacto se sienten instantáneos.
const router = useRouter()
const prefetchRuta = crearPrefetchDeRutas(router)

const mobileOpen = ref(false)
const scrollProgress = ref(0)

type DemoTab = 'pos' | 'cocina' | 'barra'
type DemoTone = 'ok' | 'warn' | 'idle'
type DemoEstado = { label: string; tone: DemoTone }
/** Estado tal y como se guarda: el texto se resuelve con el idioma activo */
type DemoEstadoBase = { labelKey: ClaveTexto; tone: DemoTone }

const DEMO_TABS: { id: DemoTab; labelKey: ClaveTexto; labelCortoKey: ClaveTexto; icon: string }[] = [
  { id: 'pos', labelKey: 'demo.tab.pos', labelCortoKey: 'demo.tab.posCorto', icon: '🧾' },
  { id: 'cocina', labelKey: 'demo.tab.cocina', labelCortoKey: 'demo.tab.cocinaCorto', icon: '👨‍🍳' },
  { id: 'barra', labelKey: 'demo.tab.barra', labelCortoKey: 'demo.tab.barraCorto', icon: '🍹' },
]

type DemoPanel = {
  titleKey: ClaveTexto
  metaKey: ClaveTexto
  items: { nombreKey: ClaveTexto; extra?: string }[]
  /** Ciclo de estados por el que avanza cada renglón al tocarlo */
  estados: DemoEstadoBase[]
  /** Índice de estado con el que arranca cada renglón */
  inicial: number[]
  /** Segundos ya transcurridos al cargar cada renglón; null = estación sin cronómetro */
  arranque: number[] | null
  footKey: ClaveTexto
}

const DEMO: Record<DemoTab, DemoPanel> = {
  pos: {
    titleKey: 'demo.panel.pos.titulo',
    metaKey: 'demo.panel.pos.meta',
    items: [
      { nombreKey: 'demo.item.tacos', extra: '$180' },
      { nombreKey: 'demo.item.gringa', extra: '$95' },
      { nombreKey: 'demo.item.aguas', extra: '$90' },
    ],
    estados: [
      { labelKey: 'demo.estado.porCobrar', tone: 'idle' },
      { labelKey: 'demo.estado.cobrado', tone: 'ok' },
    ],
    inicial: [0, 0, 1],
    arranque: null,
    footKey: 'demo.panel.pos.foot',
  },
  cocina: {
    titleKey: 'demo.panel.cocina.titulo',
    metaKey: 'demo.panel.cocina.meta',
    items: [
      { nombreKey: 'demo.item.tacos' },
      { nombreKey: 'demo.item.gringa' },
      { nombreKey: 'demo.item.aguas' },
    ],
    estados: [
      { labelKey: 'demo.estado.nueva', tone: 'idle' },
      { labelKey: 'demo.estado.enPreparacion', tone: 'warn' },
      { labelKey: 'demo.estado.listo', tone: 'ok' },
    ],
    inicial: [2, 1, 0],
    arranque: [272, 130, 6],
    footKey: 'demo.panel.cocina.foot',
  },
  barra: {
    titleKey: 'demo.panel.barra.titulo',
    metaKey: 'demo.panel.barra.meta',
    items: [
      { nombreKey: 'demo.item.aguas' },
      { nombreKey: 'demo.item.limonada' },
      { nombreKey: 'demo.item.cafe' },
    ],
    estados: [
      { labelKey: 'demo.estado.nueva', tone: 'idle' },
      { labelKey: 'demo.estado.enPreparacion', tone: 'warn' },
      { labelKey: 'demo.estado.listo', tone: 'ok' },
    ],
    inicial: [1, 0, 2],
    arranque: [70, 20, 205],
    footKey: 'demo.panel.barra.foot',
  },
}

const demoTab = ref<DemoTab>('pos')
const demo = computed(() => DEMO[demoTab.value])
const tabButtons = ref<HTMLButtonElement[]>([])

/** Estado actual de cada renglón, independiente por estación */
const estados = reactive<Record<DemoTab, number[]>>({
  pos: [...DEMO.pos.inicial],
  cocina: [...DEMO.cocina.inicial],
  barra: [...DEMO.barra.inicial],
})

const estadoDe = (i: number): DemoEstado => {
  const base = demo.value.estados[estados[demoTab.value][i]]
  return { label: t(base.labelKey), tone: base.tone }
}

/* ---------- Cronómetro real por comanda (solo estaciones con KDS) ---------- */

// ⚠️ TESTIMONIOS — son EJEMPLOS de maquetación, no clientes reales.
// Sustitúyelos por testimonios verdaderos y con autorización por escrito del
// cliente para publicar su nombre y su negocio (en México la publicidad
// engañosa es sancionable). Si dejas el arreglo vacío, la sección no se muestra.
const testimonios = ref([
  {
    inicial: 'A',
    nombre: 'Nombre del cliente',
    negocio: 'Nombre del restaurante',
    ciudad: 'Ciudad',
    texto:
      'Ejemplo: qué problema tenías antes (comandas perdidas, tiempos, descuadres), qué cambió con eOrder y en cuánto tiempo lo notaste. Dos o tres líneas funcionan mejor que un párrafo largo.',
  },
  {
    inicial: 'B',
    nombre: 'Nombre del cliente',
    negocio: 'Nombre del restaurante',
    ciudad: 'Ciudad',
    texto:
      'Ejemplo: un dato concreto y verificable, como cuánto bajó el tiempo de servicio o cuántas ventas dejaste de perder en horas pico.',
  },
  {
    inicial: 'C',
    nombre: 'Nombre del cliente',
    negocio: 'Nombre del restaurante',
    ciudad: 'Ciudad',
    texto:
      'Ejemplo: cómo fue el arranque, qué tan fácil fue capacitar al equipo y por qué lo recomendarías a otro restaurante.',
  },
])

const ahora = ref(Date.now())
let tick: ReturnType<typeof setInterval> | undefined

let handleScroll: (() => void) | null = null
let revealObserver: IntersectionObserver | null = null

onMounted(() => {
  tick = setInterval(() => {
    ahora.value = Date.now()
  }, 1000)

  // Manejo del progreso de scroll para el fondo azul - throttled con rAF para no atorarse
  let ticking = false
  handleScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const winScroll = window.pageYOffset || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - window.innerHeight
      scrollProgress.value = height > 0 ? (winScroll / height) * 100 : 0
      ticking = false
    })
  }
  window.addEventListener('scroll', handleScroll, { passive: true })

  // Reveal sections on scroll
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  )
  // Solo se "arma" (se oculta con transición) lo que todavía no está en pantalla.
  // Así, si el observer no llegara a dispararse, el contenido se ve igual.
  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  document.querySelectorAll('.reveal').forEach((el) => {
    const yaVisible = el.getBoundingClientRect().top < window.innerHeight * 0.92

    if (movimientoReducido || yaVisible) {
      el.classList.add('revealed')
      return
    }

    el.classList.add('reveal-armed')
    revealObserver!.observe(el)
  })

  // Red de seguridad: lo que quede armado y ya esté en pantalla se muestra igual.
  window.setTimeout(() => {
    document.querySelectorAll('.reveal-armed:not(.revealed)').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('revealed')
    })
  }, 2500)
})

onBeforeUnmount(() => {
  if (tick) clearInterval(tick)
  if (handleScroll) window.removeEventListener('scroll', handleScroll)
  if (revealObserver) revealObserver.disconnect()
})

const t0 = Date.now()

/** Momento en que arrancó el cronómetro de cada renglón */
const inicio = reactive<Record<DemoTab, number[]>>(
  Object.fromEntries(
    (Object.keys(DEMO) as DemoTab[]).map((id) => [
      id,
      (DEMO[id].arranque ?? DEMO[id].items.map(() => 0)).map((segundos) => t0 - segundos * 1000),
    ]),
  ) as Record<DemoTab, number[]>,
)

/** Momento en que se detuvo el cronómetro (null = sigue corriendo) */
const congelado = reactive<Record<DemoTab, (number | null)[]>>(
  Object.fromEntries(
    (Object.keys(DEMO) as DemoTab[]).map((id) => [
      id,
      estados[id].map((estado) => (estado === DEMO[id].estados.length - 1 ? t0 : null)),
    ]),
  ) as Record<DemoTab, (number | null)[]>,
)

/** Milisegundos transcurridos de la comanda i (congelado cuando ya se entregó) */
function transcurrido(i: number) {
  const tab = demoTab.value
  return (congelado[tab][i] ?? ahora.value) - inicio[tab][i]
}

const mmss = (ms: number) => {
  const segundos = Math.max(0, Math.floor(ms / 1000))
  return `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`
}

/** Semáforo del cronómetro: normal, tarde a los 5 min, crítico a los 10 */
const tonoTiempo = (ms: number) => (ms >= 600000 ? 'critico' : ms >= 300000 ? 'tarde' : 'normal')

/** Encabezado del panel: en KDS suma la comanda más vieja que sigue pendiente */
const metaPanel = computed(() => {
  const panel = demo.value
  if (!panel.arranque) return t(panel.metaKey)
  const ultimo = panel.estados.length - 1
  const pendientes = estados[demoTab.value]
    .map((estado, i) => ({ estado, i }))
    .filter(({ estado }) => estado !== ultimo)
  if (!pendientes.length) return `${t(panel.metaKey)} · ${t('demo.todoEntregado')}`
  return `${t(panel.metaKey)} · ${mmss(Math.max(...pendientes.map(({ i }) => transcurrido(i))))}`
})

/** Avanza el estado del renglón y su cronómetro (nueva → en preparación → listo) */
function avanzar(i: number) {
  const tab = demoTab.value
  const ciclo = demo.value.estados.length
  const siguiente = (estados[tab][i] + 1) % ciclo
  estados[tab][i] = siguiente
  if (siguiente === ciclo - 1) {
    congelado[tab][i] = Date.now()
  } else if (siguiente === 0) {
    inicio[tab][i] = Date.now()
    congelado[tab][i] = null
  } else {
    congelado[tab][i] = null
  }
}

function resetDemo() {
  (Object.keys(DEMO) as DemoTab[]).forEach((id) => {
    estados[id] = [...DEMO[id].inicial]
    congelado[id] = estados[id].map((estado) => (estado === DEMO[id].estados.length - 1 ? Date.now() : null))
    inicio[id] = (DEMO[id].arranque ?? DEMO[id].items.map(() => 0)).map((segundos) => Date.now() - segundos * 1000)
  })
}

/** Renglones que llegaron al estado final del ciclo */
const completos = computed(() => {
  const ultimo = demo.value.estados.length - 1
  return estados[demoTab.value].filter((e) => e === ultimo).length
})

const progreso = computed(() => (completos.value / demo.value.items.length) * 100)

/** Resumen en vivo del avance del panel */
const resumen = computed(() => {
  const ciclo = demo.value.estados
  return `${completos.value}/${demo.value.items.length} ${t(ciclo[ciclo.length - 1].labelKey)}`
})

async function activarTab(id: DemoTab, indice: number) {
  demoTab.value = id
  await nextTick()
  tabButtons.value[indice]?.focus()
}

/** Navegación por teclado del tablist (patrón ARIA de pestañas) */
function onTabKey(evento: KeyboardEvent, indice: number) {
  const total = DEMO_TABS.length
  let destino: number | null = null
  if (evento.key === 'ArrowRight' || evento.key === 'ArrowDown') destino = (indice + 1) % total
  else if (evento.key === 'ArrowLeft' || evento.key === 'ArrowUp') destino = (indice - 1 + total) % total
  else if (evento.key === 'Home') destino = 0
  else if (evento.key === 'End') destino = total - 1
  if (destino === null) return
  evento.preventDefault()
  activarTab(DEMO_TABS[destino].id, destino)
}

const matrixPlans = computed(() => LANDING_PLAN_IDS.map((id) => PLAN_BY_ID[id]))

/**
 * Etiquetas de la matriz. Los datos siguen viviendo en config/planes.ts (única
 * fuente de precios): aquí solo se traduce la etiqueta. Si algún día se añade
 * una fila nueva, se muestra su texto original en vez de romperse.
 */
const CLAVE_FILA: Record<string, ClaveTexto> = {
  'Ideal para': 'planes.fila.idealPara',
  'Sucursales incluidas': 'planes.fila.sucursales',
  'Usuarios conectados': 'planes.fila.usuarios',
  'Pantallas de cocina (KDS)': 'planes.fila.kds',
  Inventario: 'planes.fila.inventario',
  'Reportes avanzados': 'planes.fila.reportes',
  'Comparativos entre sucursales': 'planes.fila.comparativos',
}

const etiquetaFila = (label: string) => {
  const clave = CLAVE_FILA[label]
  return clave ? t(clave) : label
}
</script>

<style scoped>
.landing { background: #fff; color: #0f172a; position: relative; overflow-x: hidden; }
.wrap { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
.center { text-align: center; }

/* Dynamic Scroll Background - desactivado para no tener desplazamiento automático */
.scroll-bg { display: none; }

/* Decorative Blobs - sin desplazamiento automático */
.blob {
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%);
  filter: blur(60px);
  z-index: -1;
  border-radius: 50%;
  pointer-events: none;
}
.blob-1 { top: -100px; right: -100px; }
.blob-2 { top: 40%; left: -150px; background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%); }
.blob-3 { bottom: -100px; right: 10%; background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%); }

@keyframes blob-move {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(50px, 100px) scale(1.2); }
}

/* Eye-catching Typography */
.text-gradient {
  background: linear-gradient(135deg, #0f172a 0%, #4f46e5 50%, #9333ea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Reveal al hacer scroll.
   Por defecto TODO es visible: solo se oculta lo que el JS marca con
   .reveal-armed, de modo que si algo falla la página nunca queda en blanco. */
.reveal {
  opacity: 1;
  transform: none;
}

.reveal-armed {
  opacity: 0;
  transform: translateY(26px);
  transition: opacity .65s cubic-bezier(.22,.61,.36,1), transform .65s cubic-bezier(.22,.61,.36,1);
}

.reveal-armed.revealed {
  opacity: 1;
  transform: none;
}

/* Nav - header más grande en PC - fix clics */
.topbar { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,.96); backdrop-filter: blur(10px); border-bottom: 1px solid #e2e8f0; box-shadow: 0 2px 12px rgba(15,23,42,.06); pointer-events: auto; }
.nav { display: flex; align-items: center; justify-content: space-between; height: 80px; position: relative; z-index: 51; }
.logo { display: flex; flex-direction: column; line-height: 1; padding: 6px 0; text-decoration: none; color: #0f172a; }
.logo span { font-size: 22px; font-weight: 800; }
.logo i { font-style: normal; color: #4f46e5; }
.logo small { font-size: 10px; letter-spacing: .18em; color: #94a3b8; text-transform: uppercase; }
.logo-img { height: 52px; width: auto; max-width: 210px; object-fit: contain; display: block; border-radius: 8px; }
.foot-logo { padding: 0; }
.foot-logo-img { background: #fff; padding: 4px 8px; border-radius: 8px; }
.nav-links { display: flex; align-items: center; gap: 14px; position: relative; z-index: 52; pointer-events: auto; }
.nav-link { text-decoration: none; color: #334155; font-weight: 600; font-size: 15px; padding: 14px 12px; border-radius: 10px; pointer-events: auto; position: relative; }
.nav-link:hover { color: #4f46e5; background: #f8fafc; }
.nav-link.ghost { color: #4f46e5; }
.nav-cta { background: #4f46e5; color: #fff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 22px; border-radius: 12px; box-shadow: 0 4px 14px rgba(79,70,229,.2); pointer-events: auto; position: relative; }
.nav-cta:hover { background: #4338ca; box-shadow: 0 6px 18px rgba(79,70,229,.3); }
.nav-cta:hover { background: #4338ca; }
.nav-auth-mobile { display: none; }
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
.hero-actions { display: flex; gap: 12px; margin: 24px 0 14px; flex-wrap: wrap; align-items: center; }
.hero-actions.center { justify-content: center; }
.btn { display: inline-block; padding: 13px 22px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 15px; }
.btn small { display: block; font-size: 11px; font-weight: 600; opacity: .85; }
.btn-primary {
  background: #4f46e5;
  color: #fff;
  box-shadow: 0 8px 20px rgba(79,70,229,.25);
  position: relative;
  overflow: hidden;
}
.btn-primary:hover { background: #4338ca; }
.btn-ghost { color: #4f46e5; background: #eef2ff; }
.btn-outline { color: #4f46e5; border: 2px solid #c7d2fe; }
.proof-bar { font-size: 13px; color: #64748b; border-top: 1px solid #eef2f7; padding-top: 14px; max-width: 520px; }

/* Mock KDS - sin desplazamiento automático */
.hero-card {
  background: #0f172a;
  border-radius: 18px;
  padding: 18px;
  color: #e2e8f0;
  box-shadow: 0 24px 50px rgba(15,23,42,.25);
}
.hc-head { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; margin-bottom: 12px; }
.hc-head b { margin-left: auto; color: #e2e8f0; }
.hc-dot { width: 9px; height: 9px; border-radius: 50%; background: #475569; }
.hc-order { display: flex; justify-content: space-between; align-items: center; padding: 8px 4px; }
.hc-num { font-size: 20px; font-weight: 800; color: #fff; }
.hc-timer { font-size: 13px; color: #fbbf24; font-weight: 700; }
.hc-item { display: flex; justify-content: space-between; padding: 9px 4px; border-bottom: 1px solid #1e293b; font-size: 14px; color: #cbd5e1; }
.hc-item b { font-size: 12px; font-weight: 700; }
.hc-item.done b { color: #34d399; }
.hc-item.warn b { color: #fbbf24; }
.hc-item b:not(.hc-timer) { color: #94a3b8; }
.hc-foot { font-size: 11px; color: #64748b; padding-top: 12px; }

/* Secciones */
.section { padding: 64px 0; }
.section.alt { background: #f8fafc; }
.section.final { background: #0f172a; color: #fff; padding: 72px 0; }
.section.final h2 { margin: 10px 0 8px; }
h2 { font-size: 30px; letter-spacing: -.01em; margin: 8px 0 10px; }
.sub { color: #64748b; font-size: 15px; }
.section.final .sub { color: #94a3b8; }

.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 26px; }
.card {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 6px 18px rgba(15,23,42,.05);
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, color 0.25s ease;
  cursor: default;
  touch-action: manipulation;
}
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    background: #4f46e5;
    border-color: #4f46e5;
    transform: translateY(-6px);
    box-shadow: 0 16px 32px rgba(79,70,229,.25);
  }
  .card:hover h3 { color: #fff; }
  .card:hover p { color: #e0e7ff; }
  .card:hover p.sol { color: #fff; }
  .card:hover p.sol b { color: #fff; }
  .card:hover .ico { filter: brightness(1.2); }
}
.card:active {
  transform: translateY(-2px);
}
.card .ico { font-size: 26px; transition: filter 0.25s ease; }
.card h3 { margin: 10px 0 8px; font-size: 17px; transition: color 0.25s ease; }
.card p { color: #64748b; font-size: 13.5px; line-height: 1.55; margin-bottom: 6px; transition: color 0.25s ease; }
.card p.sol { color: #334155; }

/* Matriz de planes */
.table-wrap { overflow-x: auto; margin-top: 26px; border-radius: 14px; border: 1px solid #e2e8f0; }
.matrix { width: 100%; border-collapse: collapse; background: #fff; font-size: 14px; min-width: 640px; }
.matrix th, .matrix td { padding: 13px 16px; text-align: center; border-bottom: 1px solid #eef2f7; }
.matrix th:first-child, .matrix td:first-child { text-align: left; color: #334155; font-weight: 600; }
.matrix thead th { background: #f8fafc; color: #0f172a; font-size: 15px; }
.matrix thead th small { display: block; font-size: 12px; color: #64748b; font-weight: 600; }
.matrix .hl {
  background: #eef2ff;
  position: relative;
  box-shadow: inset 0 0 0 2px #4f46e5;
}
.plan-badge {
  display: block;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: #4f46e5;
  background: #fff;
  border: 1px solid #4f46e5;
  border-radius: 999px;
  padding: 2px 6px;
  width: fit-content;
  margin: 0 auto 6px;
}
.matrix tbody tr:last-child td { border-bottom: 0; }

/* Demo interactiva */
.section.demo { background: linear-gradient(180deg, #fff 0%, #eef2ff 100%); scroll-margin-top: 80px; }
.demo-shell { max-width: 760px; margin: 26px auto 0; }

/* Pestañas */
.demo-tabs { display: flex; gap: 6px; justify-content: center; background: #dfe5fb; padding: 6px; border-radius: 16px; box-shadow: inset 0 1px 3px rgba(15,23,42,.10); }
.demo-tabs button { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; border: 0; background: transparent; padding: 12px 8px; min-height: 44px; border-radius: 12px; font-size: 14px; font-weight: 700; color: #4f46e5; cursor: pointer; font-family: inherit; white-space: nowrap; transition: background .18s, color .18s, box-shadow .18s; }
.demo-tabs .btn-reset {
  flex: 0 0 auto;
  background: #fff;
  color: #4f46e5;
  width: 44px;
  border: 1px solid #c7d2fe;
  box-shadow: 0 2px 4px rgba(0,0,0,.05);
}
.demo-tabs .btn-reset:hover {
  background: #eef2ff;
  transform: rotate(45deg);
}
.demo-tabs button:hover { background: rgba(255,255,255,.6); }
.demo-tabs button.active { background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; box-shadow: 0 10px 20px -8px rgba(79,70,229,.85); }
.demo-tabs button:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }
.tb-ico { font-size: 16px; line-height: 1; }
.lbl-sm { display: none; }

/* Panel */
.demo-panel { margin-top: 16px; }
.dp-frame { position: relative; overflow: hidden; background: linear-gradient(180deg, #131f36, #0f172a 45%); border: 1px solid #24324d; border-radius: 20px; padding: 18px; color: #e2e8f0; box-shadow: 0 34px 60px -24px rgba(30,41,90,.55); }
.dp-frame::before { content: ""; position: absolute; inset: -50% 28% 55% 28%; background: radial-gradient(closest-side, rgba(99,102,241,.4), transparent); pointer-events: none; }
.dp-head { position: relative; display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; margin-bottom: 14px; }
.dp-head b { margin-left: auto; color: #f8fafc; font-size: 13px; }
.dp-head em { font-style: normal; color: #94a3b8; }
.dp-dot { width: 9px; height: 9px; border-radius: 50%; background: #334155; }
.dp-live { display: inline-flex; align-items: center; gap: 5px; background: rgba(52,211,153,.14); color: #34d399; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; padding: 3px 8px; border-radius: 999px; }
.dp-live i { width: 6px; height: 6px; border-radius: 50%; background: #34d399; }

/* Renglones interactivos */
.dp-row { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-height: 44px; padding: 12px 10px; border: 0; border-bottom: 1px solid #1e293b; background: transparent; color: #cbd5e1; font-family: inherit; font-size: 14px; text-align: left; cursor: pointer; transition: background .15s; }
.dp-row:hover { background: #1b2740; }
.dp-row:focus-visible { outline: 2px solid #818cf8; outline-offset: -2px; }
.dp-name { font-weight: 500; }
.dp-meta { display: inline-flex; align-items: center; gap: 8px; }
.dp-price { font-size: 12px; color: #94a3b8; font-variant-numeric: tabular-nums; }
.dp-timer { min-width: 48px; text-align: right; font-size: 12px; font-weight: 800; color: #94a3b8; font-variant-numeric: tabular-nums; letter-spacing: .02em; }
.dp-timer.tarde { color: #fbbf24; }
.dp-timer.critico { color: #f87171; }
.pill { font-style: normal; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
.pill-idle { background: #1e293b; color: #94a3b8; }
.pill-warn { background: rgba(251,191,36,.16); color: #fbbf24; }
.pill-ok { background: rgba(52,211,153,.16); color: #34d399; }

/* Progreso */
.dp-progress { position: relative; display: flex; align-items: center; gap: 12px; padding: 16px 10px 0; }
.dp-bar { flex: 1; height: 6px; border-radius: 999px; background: #1e293b; overflow: hidden; }
.dp-bar span { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #6366f1, #34d399); transition: width .3s ease; }
.dp-status { font-size: 11px; font-weight: 700; color: #a5b4fc; white-space: nowrap; }
.dp-foot { position: relative; font-size: 11px; color: #94a3b8; padding-top: 14px; margin-top: 14px; border-top: 1px dashed #24324d; }

.fade-enter-active, .fade-leave-active { transition: all .25s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.98) translateY(10px); }

/* Tarjetas de impacto */
.impact { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 26px; }
.impact-card {
  background: #fff;
  border: 1px solid #e6ebf7;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 12px 28px -20px rgba(30,41,90,.45);
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease, color 0.25s ease;
  cursor: default;
  touch-action: manipulation;
}
@media (hover: hover) and (pointer: fine) {
  .impact-card:hover {
    background: #0f172a;
    border-color: #0f172a;
    transform: translateY(-6px);
    box-shadow: 0 16px 32px rgba(15,23,42,.25);
  }
  .impact-card:hover h3 { color: #fff; }
  .impact-card:hover p { color: #cbd5e1; }
  .impact-card:hover .ico { background: rgba(99,102,241,.25); }
}
.impact-card:active { transform: translateY(-2px); }
.impact-card .ico { display: inline-grid; place-items: center; width: 42px; height: 42px; font-size: 20px; border-radius: 13px; background: linear-gradient(135deg, #eef2ff, #e0e7ff); transition: background 0.25s ease; }
.impact-card h3 { margin: 12px 0 6px; font-size: 16px; transition: color 0.25s ease; }
.impact-card p { color: #64748b; font-size: 13.5px; line-height: 1.55; transition: color 0.25s ease; }
.planes-figure { margin: 26px 0 0; }
.planes-figure img { display: block; width: 100%; height: auto; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(15,23,42,.08); }
.matrix-note { text-align: center; color: #64748b; font-size: 13px; margin-top: 14px; }
.table-hint { display: none; text-align: center; color: #94a3b8; font-size: 12px; margin-top: 10px; }
.matrix td.flag { font-weight: 800; font-size: 15px; }

/* FAQ */
.faq-list { max-width: 760px; margin: 26px auto 0; }
.faq-list details { background: #fff; border: 1px solid #eef2f7; border-radius: 12px; padding: 10px 20px; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(15,23,42,.04); overflow: hidden; }
.faq-list summary { font-weight: 700; cursor: pointer; color: #0f172a; font-size: 15px; padding: 11px 0; }
.faq-list p {
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  margin-top: 10px;
  animation: faq-fade-in 0.3s ease-out;
}
@keyframes faq-fade-in {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Footer normal al final del contenido */
.footer { background: #0b1220; color: #94a3b8; padding: 44px 0 18px; }
.foot-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 28px; }
.foot-logo span { color: #fff; }
.footer p { font-size: 13px; line-height: 1.6; margin-top: 10px; }
.footer b { display: block; color: #e2e8f0; font-size: 13px; margin-bottom: 10px; }
.footer a { display: block; color: #94a3b8; text-decoration: none; font-size: 13px; padding: 13px 0; }
.footer a:hover { color: #c7d2fe; }
.copy { text-align: center; margin-top: 28px; font-size: 12px; color: #64748b; }

/* Responsive */
@media (max-width: 900px) {
  .nav { height: 64px; }
  .logo-img { height: 40px; max-width: 160px; }
  .hero-grid { grid-template-columns: 1fr; }
  .grid, .impact, .foot-grid { grid-template-columns: repeat(2, 1fr); }
  .hero h1 { font-size: 34px; }
  .nav-links { display: none; }
  .nav-auth-mobile { display: flex; margin-right: 12px; }
  .nav-auth-mobile .nav-link { padding: 8px 12px; font-size: 13px; }
  .menu-btn { display: grid; place-items: center; width: 44px; height: 44px; margin-left: auto; }
  .mobile-menu { display: flex; flex-direction: column; gap: 4px; padding: 10px 20px 16px; border-top: 1px solid #eef2f7; }
  .mobile-menu a { text-decoration: none; color: #334155; font-weight: 600; padding: 12px 4px; }
  .mobile-menu a.m-cta { background: #4f46e5; color: #fff; border-radius: 10px; text-align: center; margin-top: 6px; }
}

@media (max-width: 650px) {
  .hero { padding: 44px 0 28px; }
  .hero h1 { font-size: 30px; }
  .hero-actions .btn { width: 100%; text-align: center; }
  .demo-tabs { padding: 4px; gap: 4px; }
  .demo-tabs button { padding: 12px 6px; font-size: 13px; }
  .lbl-lg { display: none; }
  .lbl-sm { display: inline; }
  .table-hint { display: block; }
  .grid, .impact, .foot-grid { grid-template-columns: 1fr; }
}

/* ── Animaciones del hero (entrada escalonada + flotación) ─────────── */
@keyframes hero-up {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: none; }
}

.hero.revealed .hero-copy > * {
  animation: hero-up .7s cubic-bezier(.22,.61,.36,1) both;
}
.hero.revealed .hero-copy > *:nth-child(1) { animation-delay: .05s; }
.hero.revealed .hero-copy > *:nth-child(2) { animation-delay: .15s; }
.hero.revealed .hero-copy > *:nth-child(3) { animation-delay: .25s; }
.hero.revealed .hero-copy > *:nth-child(4) { animation-delay: .35s; }
.hero.revealed .hero-copy > *:nth-child(5) { animation-delay: .45s; }

@keyframes hero-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}
.hero.revealed .hero-card {
  animation: hero-up .8s cubic-bezier(.22,.61,.36,1) .2s both, hero-float 6s ease-in-out 1.4s infinite;
}

/* ── Microinteracciones de botones ─────────────────────────────────── */
.btn { transition: transform .18s ease, box-shadow .18s ease, background .18s ease, color .18s ease; }
.btn:active { transform: translateY(1px) scale(.985); }

.btn-primary .arrow {
  display: inline-block;
  margin-left: 6px;
  transition: transform .18s ease;
}
.btn-primary:hover .arrow { transform: translateX(4px); }

/* ── CTA intermedio ────────────────────────────────────────────────── */
.cta-band {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #db2777 100%);
}
.cta-band h2 { color: #fff; }
.cta-band .sub, .cta-band .eyebrow { color: rgba(255,255,255,.9); }
.cta-band .btn-primary { background: #fff; color: #4f46e5; }
.cta-band .btn-primary:hover { background: #f1f5f9; }
.cta-band .btn-outline { border-color: rgba(255,255,255,.65); color: #fff; }
.cta-band .btn-outline:hover { background: rgba(255,255,255,.15); }

/* ── Testimonios ───────────────────────────────────────────────────── */
.testimonios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 34px;
}

.testimonio-card {
  margin: 0;
  padding: 26px 24px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(15,23,42,.05);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
}
.testimonio-card:hover {
  transform: translateY(-5px);
  border-color: #c7d2fe;
  box-shadow: 0 18px 34px rgba(79,70,229,.14);
}
.testimonio-card .stars { color: #f59e0b; letter-spacing: 3px; font-size: 15px; }
.testimonio-card blockquote { margin: 0; font-size: 15px; line-height: 1.65; color: #334155; }
.testimonio-card figcaption { display: flex; align-items: center; gap: 12px; margin-top: auto; }
.testimonio-card figcaption b { display: block; font-size: 14px; color: #0f172a; }
.testimonio-card figcaption small { display: block; font-size: 12px; color: #94a3b8; }
.testimonio-card .avatar {
  width: 42px; height: 42px; flex: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: #fff; font-weight: 800; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
}
.testimonios-nota { margin-top: 22px; text-align: center; font-size: 13px; color: #64748b; }
.testimonios-nota a { color: #4f46e5; font-weight: 600; text-decoration: none; }
.testimonios-nota a:hover { text-decoration: underline; }

/* ── Elevación suave de tarjetas al pasar el cursor ────────────────── */
.grid > * {
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
}
.grid > *:hover {
  transform: translateY(-4px);
  border-color: #c7d2fe;
  box-shadow: 0 16px 30px rgba(79,70,229,.12);
}

@media (prefers-reduced-motion: reduce) {
  .reveal-armed { opacity: 1; transform: none; transition: none; }
  .hero.revealed .hero-copy > *,
  .hero.revealed .hero-card { animation: none; }
  .grid > *, .testimonio-card, .btn, .btn-primary .arrow { transition: none; }
}

/* ── Modo oscuro (solo la landing) ──────────────────────────────────────
   Se activa con la clase .oscuro, que pone PreferenciasControl a través del
   store. Solo se reescriben los colores: estructura, tamaños y animaciones
   son los mismos que en claro. */
.landing.oscuro { background: #0b1220; color: #e6edfb; }

.landing.oscuro .topbar {
  background: rgba(11, 18, 32, .94);
  border-bottom-color: rgba(255, 255, 255, .09);
  box-shadow: 0 2px 12px rgba(0, 0, 0, .45);
}
.landing.oscuro .logo { color: #e6edfb; }
.landing.oscuro .logo small { color: #64748b; }
.landing.oscuro .nav-link { color: #c7d2e4; }
.landing.oscuro .nav-link:hover { color: #a5b4fc; background: rgba(255, 255, 255, .06); }
.landing.oscuro .nav-link.ghost { color: #a5b4fc; }
.landing.oscuro .menu-btn { color: #e6edfb; }
.landing.oscuro .mobile-menu { border-top-color: rgba(255, 255, 255, .09); }
.landing.oscuro .mobile-menu a { color: #c7d2e4; }

.landing.oscuro .text-gradient {
  background: linear-gradient(135deg, #f1f5ff 0%, #a5b4fc 50%, #d8b4fe 100%);
  -webkit-background-clip: text;
  background-clip: text;
}
.landing.oscuro .eyebrow { color: #a5b4fc; background: rgba(99, 102, 241, .18); }
.landing.oscuro .hero h1 em { color: #a5b4fc; }
.landing.oscuro .hero p { color: #b6c2d9; }
.landing.oscuro .proof-bar { color: #8fa0bd; border-top-color: rgba(255, 255, 255, .1); }
.landing.oscuro .btn-ghost { color: #c7d2fe; background: rgba(99, 102, 241, .18); }
.landing.oscuro .btn-outline { color: #c7d2fe; border-color: rgba(165, 180, 252, .45); }

.landing.oscuro h2 { color: #f1f5ff; }
.landing.oscuro .sub { color: #8fa0bd; }
.landing.oscuro .section.alt { background: #0f1a2e; }

.landing.oscuro .card {
  background: #111c33;
  border-color: rgba(255, 255, 255, .08);
  box-shadow: 0 6px 18px rgba(0, 0, 0, .35);
}
.landing.oscuro .card p { color: #9fb0cb; }
.landing.oscuro .card p.sol { color: #d7e0f2; }

.landing.oscuro .section.demo { background: linear-gradient(180deg, #0b1220 0%, #131f36 100%); }
.landing.oscuro .demo-tabs { background: #16233c; box-shadow: inset 0 1px 3px rgba(0, 0, 0, .5); }
.landing.oscuro .demo-tabs button { color: #a5b4fc; }
.landing.oscuro .demo-tabs button:hover { background: rgba(255, 255, 255, .08); }
.landing.oscuro .demo-tabs .btn-reset { background: #111c33; border-color: rgba(165, 180, 252, .3); color: #a5b4fc; }
.landing.oscuro .demo-tabs .btn-reset:hover { background: #1b2740; }

.landing.oscuro .impact-card { background: #111c33; border-color: rgba(255, 255, 255, .08); }
.landing.oscuro .impact-card p { color: #9fb0cb; }
.landing.oscuro .impact-card .ico { background: linear-gradient(135deg, #1b2740, #22304d); }

.landing.oscuro .table-wrap { border-color: rgba(255, 255, 255, .1); }
.landing.oscuro .matrix { background: #111c33; }
.landing.oscuro .matrix th, .landing.oscuro .matrix td { border-bottom-color: rgba(255, 255, 255, .07); }
.landing.oscuro .matrix th:first-child, .landing.oscuro .matrix td:first-child { color: #d7e0f2; }
.landing.oscuro .matrix thead th { background: #16233c; color: #f1f5ff; }
.landing.oscuro .matrix thead th small { color: #8fa0bd; }
.landing.oscuro .matrix .hl { background: rgba(99, 102, 241, .18); }
.landing.oscuro .plan-badge { background: #111c33; color: #a5b4fc; border-color: #6366f1; }
.landing.oscuro .planes-figure img { border-color: rgba(255, 255, 255, .1); }
.landing.oscuro .matrix-note, .landing.oscuro .table-hint { color: #8fa0bd; }

.landing.oscuro .faq-list details { background: #111c33; border-color: rgba(255, 255, 255, .08); }
.landing.oscuro .faq-list summary { color: #f1f5ff; }
.landing.oscuro .faq-list p { color: #9fb0cb; }

.landing.oscuro .testimonio-card { background: #111c33; border-color: rgba(255, 255, 255, .08); }
.landing.oscuro .testimonio-card blockquote { color: #d7e0f2; }
.landing.oscuro .testimonio-card figcaption b { color: #f1f5ff; }
.landing.oscuro .testimonios-nota { color: #8fa0bd; }
.landing.oscuro .testimonios-nota a { color: #a5b4fc; }
.landing.oscuro .grid > *:hover { border-color: rgba(165, 180, 252, .45); }
</style>

<style>
html, body { margin: 0 !important; padding: 0 !important; background: #0b1220 !important; min-height: 100vh !important; }
#app { background: #0b1220 !important; min-height: 100vh !important; margin: 0 !important; padding: 0 !important; }
.landing { background: #fff !important; margin: 0 !important; padding-bottom: 0 !important; }
.landing.oscuro { background: #0b1220 !important; }
.footer { background: #0b1220 !important; margin: 0 !important; padding: 44px 0 18px !important; }
.footer .copy { margin: 28px 0 0 !important; padding-bottom: 0 !important; }
</style>
