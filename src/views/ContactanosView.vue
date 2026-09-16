<template>
  <div class="contact-page">
    <header class="topbar">
      <div class="wrap nav">
        <router-link to="/planes" class="logo"><span><i>e</i>Order</span><small>Easy Order</small></router-link>
        <nav class="nav-links">
          <router-link to="/planes" class="nav-link">Planes</router-link>
          <router-link to="/contactanos" class="nav-link active">Contáctanos</router-link>
          <router-link to="/" class="nav-link ghost">Ingresar</router-link>
          <router-link to="/registro/dueno" class="nav-cta">Crear cuenta</router-link>
        </nav>
        <button class="menu-btn" @click="mobileOpen=!mobileOpen">{{ mobileOpen ? '✕' : '☰' }}</button>
      </div>
      <div v-if="mobileOpen" class="mobile-menu">
        <router-link to="/planes" @click="mobileOpen=false">Planes</router-link>
        <router-link to="/contactanos" @click="mobileOpen=false">Contáctanos</router-link>
        <router-link to="/" @click="mobileOpen=false">Ingresar</router-link>
      </div>
    </header>

    <main class="wrap">
      <section class="hero">
        <span class="eyebrow">Estamos para ayudarte</span>
        <h1>Hablemos de tu restaurante</h1>
        <p>Déjanos tus datos y un distribuidor o representante de eOrder te ayudará a elegir la solución adecuada para tu operación.</p>
        <div class="hero-badges">
          <span>⚡ Respuesta &lt; 24h</span>
          <span>💬 Asesoría gratuita</span>
          <span>🛡️ Sin compromiso</span>
        </div>
      </section>

      <section class="layout">
        <div class="panel form-panel">
          <h2>Solicita información</h2>
          <p class="intro">Completa el formulario. Los campos marcados con <span class="required">*</span> son obligatorios.</p>

          <form @submit.prevent="submitForm" novalidate>
            <div class="grid">
              <div class="field">
                <label for="nombre">Nombre completo <span class="required">*</span></label>
                <input id="nombre" v-model="form.nombre" type="text" maxlength="120" autocomplete="name" required placeholder="Ej. Juan Pérez" />
                <span v-if="errors.nombre" class="err">{{ errors.nombre }}</span>
              </div>
              <div class="field">
                <label for="negocio">Restaurante o empresa</label>
                <input id="negocio" v-model="form.negocio" type="text" maxlength="150" placeholder="Ej. Tacos El Buen Sazón" />
              </div>
              <div class="field">
                <label for="email">Correo electrónico <span class="required">*</span></label>
                <input id="email" v-model="form.email" type="email" maxlength="190" autocomplete="email" required placeholder="tucorreo@ejemplo.com" />
                <span v-if="errors.email" class="err">{{ errors.email }}</span>
              </div>
              <div class="field">
                <label for="telefono">Teléfono <span class="required">*</span></label>
                <input id="telefono" v-model="form.telefono" type="tel" maxlength="25" autocomplete="tel" inputmode="tel" required placeholder="10 dígitos" />
                <span v-if="errors.telefono" class="err">{{ errors.telefono }}</span>
              </div>
              <div class="field">
                <label for="ciudad">Ciudad / Estado</label>
                <input id="ciudad" v-model="form.ciudad" type="text" maxlength="120" placeholder="Veracruz, Ver." />
              </div>
              <div class="field">
                <label for="tipo_contacto">Deseo que me contacte <span class="required">*</span></label>
                <select id="tipo_contacto" v-model="form.tipo_contacto" required>
                  <option value="">Selecciona una opción</option>
                  <option value="distribuidor">Un distribuidor</option>
                  <option value="representante">Un representante eOrder</option>
                  <option value="indistinto">Cualquiera de los dos</option>
                </select>
              </div>
              <div class="field">
                <label for="medio_preferido">Medio preferido</label>
                <select id="medio_preferido" v-model="form.medio_preferido">
                  <option value="telefono">Llamada telefónica</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Correo electrónico</option>
                </select>
              </div>
              <div class="field">
                <label for="horario">Horario preferido</label>
                <select id="horario" v-model="form.horario">
                  <option value="cualquiera">Cualquier horario</option>
                  <option value="manana">9:00 a 13:00</option>
                  <option value="tarde">13:00 a 18:00</option>
                </select>
              </div>
              <div class="field full">
                <label for="mensaje">¿Cómo podemos ayudarte? <span class="required">*</span></label>
                <textarea id="mensaje" v-model="form.mensaje" maxlength="2000" required placeholder="Cuéntanos cuántas sucursales tienes y qué necesitas mejorar."></textarea>
                <div class="char-count">{{ form.mensaje.length }}/2000</div>
                <span v-if="errors.mensaje" class="err">{{ errors.mensaje }}</span>
              </div>
              <!-- Honeypot -->
              <input v-model="form.sitio_web" type="text" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
              <div class="field full">
                <label class="check">
                  <input v-model="form.aviso_privacidad" type="checkbox" :true-value="true" :false-value="false" required />
                  <span>Acepto que eOrder utilice estos datos para responder mi solicitud y acepto el <router-link to="/terminos-y-condiciones">aviso de privacidad</router-link>. <span class="required">*</span></span>
                </label>
              </div>
              <div class="field full">
                <button class="submit" type="submit" :disabled="loading">
                  <span v-if="loading" class="spinner"></span>
                  {{ loading ? 'Enviando…' : 'Solicitar contacto' }}
                </button>
                <div v-if="status.message" :class="['status', status.type, 'show']" role="status" aria-live="polite">{{ status.message }}</div>
              </div>
            </div>
          </form>

          <div class="trust-row">
            <span>🔒 Tus datos están protegidos</span>
            <span>📞 Te contactamos en horario solicitado</span>
          </div>
        </div>

        <aside class="side">
          <section class="panel contact-card">
            <h2>Contacto directo</h2>
            <p class="intro">También puedes comunicarte con nosotros por estos medios.</p>
            <div class="contact-list">
              <div class="contact-item">
                <span class="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.9Z"/></svg></span>
                <div><strong>Teléfono / WhatsApp</strong><a href="https://wa.me/5210000000000" target="_blank" rel="noopener" class="link">Enviar WhatsApp</a><span class="muted">Respuesta rápida L-V 9am-7pm</span></div>
              </div>
              <div class="contact-item">
                <span class="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4zM4 6l8 7 8-7"/></svg></span>
                <div><strong>Correo</strong><a href="mailto:contacto@eorder.mx" class="link">contacto@eorder.mx</a><span class="muted">Respuesta en 24h</span></div>
              </div>
              <div class="contact-item">
                <span class="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-5 7-12a7 7 0 1 0-14 0c0 7 7 12 7 12Z"/><circle cx="12" cy="9" r="2"/></svg></span>
                <div><strong>Atención</strong><span>Veracruz, México · Atención remota nacional</span></div>
              </div>
            </div>
            <div class="social-proof">
              <strong>+500 restaurantes</strong> confían en eOrder
            </div>
          </section>

          <section class="panel chat-card">
            <span class="pill">Chat gratuito</span>
            <h2>¿Tienes una duda rápida?</h2>
            <p>Conversa con nuestro equipo en línea. Si no estamos disponibles, déjanos tu mensaje y te responderemos después.</p>
            <button class="chat-button" type="button" @click="openChat">Abrir chat en línea</button>
            <small class="chat-note">Horario: Lun–Sáb 9:00–19:00 (GMT-6)</small>
          </section>

          <section class="panel info-card">
            <h3>¿Qué pasa después de enviar?</h3>
            <ol>
              <li>Recibimos tu solicitud y la asignamos al asesor más cercano</li>
              <li>Te contactamos por tu medio preferido</li>
              <li>Agendamos una demo de 20 min sin compromiso</li>
            </ol>
          </section>
        </aside>
      </section>

      <section class="faq">
        <h2>Preguntas frecuentes</h2>
        <div class="faq-list">
          <details open><summary>¿Puedo probar eOrder antes de contratar?</summary><p>Sí. Los planes disponibles en línea incluyen 30 días de prueba para una sucursal, excepto Enterprise.</p></details>
          <details><summary>¿Necesito comprar equipo especial?</summary><p>No necesariamente. eOrder puede trabajar con computadoras, tabletas y otros equipos compatibles que ya tengas.</p></details>
          <details><summary>¿Me ayudan con la implementación?</summary><p>Sí. Un distribuidor o representante revisará tu operación y te orientará sobre la configuración adecuada sin costo extra.</p></details>
          <details><summary>¿En cuánto tiempo me contactan?</summary><p>Generalmente en menos de 4 horas hábiles. Si escribes por WhatsApp, la respuesta es inmediata en horario de atención.</p></details>
        </div>
      </section>
    </main>

    <footer class="site-footer">© {{ year }} eOrder · Easy Order. Todos los derechos reservados. <router-link to="/planes">Planes</router-link> · <router-link to="/terminos-y-condiciones">Términos</router-link></footer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useSeo } from '@/composables/useSeo'
import { ROUTE_SEO } from '@/config/seo'
import { apiClient } from '@/utils/apiClient'

const year = new Date().getFullYear()
const mobileOpen = ref(false)
const loading = ref(false)
const status = reactive<{message:string, type:'ok'|'error'|''}>({message:'', type:''})
const errors = reactive<Record<string,string>>({})

const form = reactive({
  nombre: '',
  negocio: '',
  email: '',
  telefono: '',
  ciudad: '',
  tipo_contacto: '',
  medio_preferido: 'whatsapp',
  horario: 'cualquiera',
  mensaje: '',
  sitio_web: '',
  aviso_privacidad: false,
})

function validate(): boolean {
  Object.keys(errors).forEach(k=>delete errors[k])
  if (!form.nombre.trim() || form.nombre.trim().length < 3) errors.nombre = 'Ingresa tu nombre completo'
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Correo no válido'
  if (!form.telefono.trim() || form.telefono.replace(/\D/g,'').length < 10) errors.telefono = 'Teléfono de 10 dígitos'
  if (!form.tipo_contacto) errors.tipo_contacto = 'Selecciona una opción'
  if (!form.mensaje.trim() || form.mensaje.trim().length < 10) errors.mensaje = 'Cuéntanos un poco más (mín. 10 caracteres)'
  if (!form.aviso_privacidad) errors.aviso = 'Debes aceptar el aviso'
  return Object.keys(errors).length===0
}

async function submitForm(){
  status.message=''; status.type=''
  if (!validate()) {
    status.message='Revisa los campos marcados.'
    status.type='error'
    return
  }
  if (form.sitio_web) return // honeypot
  loading.value=true
  try {
    // Enviar la solicitud al backend (POST /api/contacto)
    const payload = {
      nombre: form.nombre.trim(),
      negocio: form.negocio.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      ciudad: form.ciudad.trim(),
      tipo_contacto: form.tipo_contacto,
      medio_preferido: form.medio_preferido,
      horario: form.horario,
      mensaje: form.mensaje.trim(),
      acepta_privacidad: form.aviso_privacidad,
      origen: 'landing-contactanos',
    }
    let ok = false
    try {
      const res = await apiClient.post('/contacto', payload)
      if (res && (res.success !== false)) ok=true
      status.message = (res as any)?.message || '¡Gracias! Te contactaremos muy pronto.'
    } catch(e:any){
      // 422 del backend: reflejar los errores de validación en el formulario
      const errores = e.response?.data?.errors
      const camposConocidos = ['nombre', 'email', 'telefono', 'tipo_contacto', 'mensaje', 'aviso']
      if (errores) {
        Object.entries(errores).forEach(([campo, msgs]) => {
          const key = campo === 'acepta_privacidad' ? 'aviso' : campo
          if (camposConocidos.includes(key)) errors[key] = (msgs as string[])?.[0] || 'Revisa este campo'
        })
        status.message = (Object.values(errores)[0] as string[])?.[0] || 'Revisa los campos marcados.'
        status.type = 'error'
      } else {
        throw e
      }
    }
    status.type = ok ? 'ok' : 'error'
    if (ok) {
      form.nombre=''; form.negocio=''; form.email=''; form.telefono=''; form.ciudad=''; form.tipo_contacto=''; form.mensaje=''; form.aviso_privacidad=false
    }
  } catch(err:any){
    status.message = err.response?.data?.message || err.message || 'No se pudo enviar. Intenta por WhatsApp.'
    status.type='error'
  } finally { loading.value=false }
}

function openChat(){
  // Integración futura con Tawk.to / ChatBotWidget global
  // Por ahora delegar al widget existente o mostrar alerta útil
  const w = window as any
  if (w.Tawk_API?.maximize) w.Tawk_API.maximize()
  else {
    // intentar abrir chat bot widget si existe
    document.dispatchEvent(new CustomEvent('open-chatbot'))
    // feedback
    if (!status.message) {
      status.message='El chat estará disponible próximamente. Por ahora usa el formulario o WhatsApp.'
      status.type='error'
      setTimeout(()=> status.message='', 4000)
    }
  }
}

onMounted(()=> useSeo(ROUTE_SEO['/contactanos']))
</script>

<style scoped>
.contact-page{ color:#07183a; background: radial-gradient(circle at 50% 0, rgba(7,91,201,.10), transparent 34rem), #f7faff; min-height:100vh; font-family:Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; -webkit-font-smoothing:antialiased; }
.wrap{ width:min(1180px, calc(100% - 36px)); margin:auto; }
a{ color:inherit; }
.topbar{ position:sticky; top:0; z-index:30; backdrop-filter:blur(12px); background:rgba(255,255,255,.86); border-bottom:1px solid #e6edf7; }
.nav{ display:flex; align-items:center; justify-content:space-between; padding:14px 0; }
.logo{ display:inline-flex; flex-direction:column; color:#075bc9; font-size:32px; font-weight:900; line-height:.7; letter-spacing:-2.3px; text-decoration:none; }
.logo i{ font-style:italic; }
.logo small{ margin:7px 0 0 18px; color:#f15a00; font-size:12px; letter-spacing:-.2px; }
.nav-links{ display:flex; gap:16px; align-items:center; }
.nav-link{ font-size:14px; font-weight:600; color:#34435a; text-decoration:none; padding:8px 10px; border-radius:8px; }
.nav-link.active, .nav-link:hover{ color:#075bc9; background:#eef4ff; }
.nav-link.ghost{ border:1px solid #dbe6f6; }
.nav-cta{ background:#075bc9; color:#fff; padding:10px 16px; border-radius:10px; font-weight:800; font-size:14px; text-decoration:none; box-shadow:0 8px 18px rgba(7,91,201,.18); }
.menu-btn{ display:none; background:#fff; border:1px solid #dde6f4; border-radius:8px; width:42px; height:42px; }
.mobile-menu{ display:grid; gap:8px; padding:0 0 16px; }
.hero{ max-width:820px; margin:28px auto 34px; text-align:center; }
.eyebrow{ color:#f15a00; font-size:12px; font-weight:900; letter-spacing:1.2px; text-transform:uppercase; background:#fff3eb; border:1px solid #ffd8bc; padding:6px 12px; border-radius:999px; }
.hero h1{ margin:10px 0 14px; font-size:clamp(32px,5vw,54px); line-height:1.02; letter-spacing:-1.8px; }
.hero p{ margin:0; color:#394a63; font-size:clamp(15px,2vw,19px); line-height:1.55; }
.hero-badges{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:16px; }
.hero-badges span{ background:#fff; border:1px solid #e6edf7; padding:6px 12px; border-radius:999px; font-size:12px; font-weight:700; box-shadow:0 4px 14px rgba(0,0,0,.04); }
.layout{ display:grid; grid-template-columns: minmax(0,1.35fr) minmax(310px,.65fr); gap:24px; align-items:start; padding-bottom:42px; }
.panel{ background:#fff; border:1px solid #dce4ef; border-radius:20px; box-shadow:0 18px 50px rgba(18,37,70,.11); }
.form-panel{ padding:32px; }
.panel h2{ margin:0 0 8px; font-size:24px; letter-spacing:-.4px; }
.intro{ margin:0 0 22px; color:#607089; line-height:1.5; font-size:14px; }
.grid{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.field{ display:flex; flex-direction:column; gap:6px; }
.field.full{ grid-column:1/-1; }
label{ font-size:13px; font-weight:750; }
.required{ color:#f15a00; }
input,select,textarea{ width:100%; padding:12px 14px; color:#07183a; background:#fff; border:1px solid #cbd5e2; border-radius:9px; font:inherit; outline:none; transition:border-color .15s, box-shadow .15s; }
input:focus,select:focus,textarea:focus{ border-color:#075bc9; box-shadow:0 0 0 3px rgba(7,91,201,.12); }
textarea{ min-height:120px; resize:vertical; }
.char-count{ font-size:11px; color:#8a9ab1; text-align:right; }
.check{ display:flex; flex-direction:row; align-items:flex-start; gap:10px; color:#46556b; font-size:13px; font-weight:500; line-height:1.4; }
.check input{ width:17px; height:17px; margin-top:1px; flex:none; }
.check a{ color:#075bc9; font-weight:700; text-decoration:underline; }
.hp{ position:absolute!important; left:-9999px!important; width:1px!important; height:1px!important; overflow:hidden!important; }
.err{ color:#b42318; font-size:11px; font-weight:600; }
.submit{ display:flex; align-items:center; justify-content:center; gap:10px; width:100%; padding:14px 20px; color:#fff; background:linear-gradient(135deg,#075bc9,#0649a2); border:0; border-radius:10px; font:inherit; font-weight:850; cursor:pointer; box-shadow:0 10px 22px rgba(7,91,201,.22); transition: transform .15s; }
.submit:hover{ transform: translateY(-1px); }
.submit:disabled{ opacity:.65; cursor:wait; }
.spinner{ width:16px; height:16px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
@keyframes spin{ to{ transform:rotate(360deg); } }
.status{ display:none; margin-top:12px; padding:12px 14px; border-radius:9px; font-size:14px; line-height:1.4; }
.status.show{ display:block; }
.status.ok{ color:#056735; background:#eaf8f0; border:1px solid #b8e5c9; }
.status.error{ color:#b42318; background:#fff0ee; border:1px solid #f3c2bd; }
.trust-row{ display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:16px; color:#5f6c82; font-size:12px; font-weight:600; }
.side{ display:grid; gap:22px; }
.contact-card,.chat-card,.info-card{ padding:26px; }
.contact-list{ display:grid; gap:16px; margin-top:18px; }
.contact-item{ display:flex; gap:12px; }
.contact-icon{ display:grid; place-items:center; width:42px; height:42px; flex:none; color:#075bc9; background:#edf5ff; border-radius:12px; }
.contact-icon svg{ width:22px; height:22px; }
.contact-item strong{ display:block; font-size:14px; }
.link{ color:#075bc9; font-weight:700; font-size:13px; }
.muted{ display:block; color:#607089; font-size:12px; margin-top:2px; }
.social-proof{ margin-top:18px; background:#f5f8fc; border:1px dashed #cbd5e2; border-radius:10px; padding:12px; text-align:center; font-size:13px; color:#34435a; }
.chat-card{ color:#fff; background: linear-gradient(145deg, #071d48, #06387e); border:0; }
.chat-card .pill{ display:inline-block; padding:5px 9px; color:#bfe6ff; background:rgba(255,255,255,.12); border-radius:999px; font-size:11px; font-weight:850; text-transform:uppercase; }
.chat-card p{ color:#d7e4f6; line-height:1.5; font-size:14px; }
.chat-button{ width:100%; padding:13px 18px; color:#fff; background:#f15a00; border:0; border-radius:9px; font:inherit; font-weight:850; cursor:pointer; margin-top:6px; }
.chat-note{ display:block; margin-top:8px; color:#9ab6e0; font-size:11px; text-align:center; }
.info-card h3{ margin:0 0 12px; font-size:16px; }
.info-card ol{ margin:0; padding-left:18px; display:grid; gap:8px; color:#4b5a72; font-size:13px; line-height:1.45; }
.faq{ margin:0 auto 50px; }
.faq h2{ text-align:center; font-size:26px; }
.faq-list{ display:grid; max-width:850px; margin:18px auto 0; gap:10px; }
details{ padding:16px 20px; background:#fff; border:1px solid #dce4ef; border-radius:12px; }
summary{ cursor:pointer; font-weight:800; font-size:14px; }
details p{ margin:10px 0 0; color:#607089; line-height:1.5; font-size:14px; }
.site-footer{ padding:20px; color:#68768a; text-align:center; font-size:13px; border-top:1px solid #dce4ef; }
.site-footer a{ color:#075bc9; font-weight:700; text-decoration:none; }
@media(max-width:820px){ .layout{ grid-template-columns:1fr; } }
@media(max-width:620px){
  .wrap{ width:min(100% - 24px, 520px); }
  .nav-links{ display:none; } .menu-btn{ display:grid; place-items:center; }
  .grid{ grid-template-columns:1fr; }
  .form-panel,.contact-card,.chat-card,.info-card{ padding:22px; }
}
</style>
