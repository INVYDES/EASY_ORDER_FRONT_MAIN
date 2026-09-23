<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#0b1220] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
    <div class="max-w-4xl mx-auto flex items-center justify-between mb-6">
      <router-link to="/" class="inline-flex items-center gap-2 no-underline" aria-label="eOrder — Ir al inicio">
        <span class="text-2xl font-black tracking-tighter text-gray-900 dark:text-slate-100"><i class="not-italic text-indigo-600 dark:text-indigo-400">e</i>Order</span>
      </router-link>
      <PreferenciasControl />
    </div>

    <div class="max-w-4xl mx-auto bg-white dark:bg-white/5 shadow-xl rounded-3xl overflow-hidden">
      <!-- Encabezado -->
      <div class="bg-white dark:bg-white/5 px-8 py-10 border-b border-gray-100 dark:border-white/10">
        <h1 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-slate-100 border-b-4 border-black dark:border-indigo-500 pb-4 uppercase tracking-tighter">
          POLÍTICA DE SEGURIDAD DE LA INFORMACIÓN — eOrder
        </h1>
        <p class="mt-4 text-gray-500 dark:text-slate-400 font-medium">Última actualización: 18 de septiembre de 2026</p>
      </div>

      <div class="px-8 py-10 text-gray-700 dark:text-slate-300 leading-relaxed space-y-8 text-sm md:text-base">
        <p>
          Esta política describe cómo <strong>eOrder (Easy Order)</strong>, operada por
          <strong>Merag Comercial / Materiales, Tecnología y Automatización / Food Software Services Mexico / eOrder
          Mexico</strong>, con domicilio fiscal en Trapiche 96, El Cortijo, Veracruz, Veracruz, México, RFC
          MCO2404269V5, protege la información que se procesa en la plataforma.
        </p>

        <div class="bg-blue-50 dark:bg-blue-500/10 border-l-8 border-blue-400 p-5 rounded-r-xl text-blue-900 dark:text-blue-200">
          Este documento describe <strong>prácticas y controles operativos</strong> de la plataforma. No constituye una
          certificación ni una garantía de cumplimiento de estándares específicos (ISO, PCI-DSS, SOC 2 u otros) que
          eOrder no haya acreditado formalmente por escrito.
        </div>

        <!-- 1 -->
        <section>
          <h2 class="text-2xl font-bold text-black dark:text-slate-100 border-l-4 border-black dark:border-indigo-500 pl-4 mb-4 uppercase">1. ALCANCE</h2>
          <p>Aplica a la plataforma SaaS eOrder: sitio web, panel administrativo, pantallas de mesero, cocina, barra, caja y postres, APIs e integraciones. Cubre la información de los negocios clientes, sus usuarios y sus comensales.</p>
          <p class="mt-3">El cliente es responsable de la información que captura y de las credenciales que entrega a su personal. eOrder es responsable de resguardar la información dentro de su infraestructura.</p>
        </section>

        <!-- 2 -->
        <section>
          <h2 class="text-2xl font-bold text-black dark:text-slate-100 border-l-4 border-black dark:border-indigo-500 pl-4 mb-4 uppercase">2. INFRAESTRUCTURA Y CIFRADO EN TRÁNSITO</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li>Toda la comunicación entre el navegador o la aplicación y nuestros servidores viaja cifrada mediante <strong>HTTPS / TLS</strong>.</li>
            <li>La aplicación y sus APIs se ejecutan en infraestructura en la nube de proveedores especializados (hosting administrado y red de distribución de contenido), con sistema operativo y dependencias mantenidas por el proveedor.</li>
            <li>La base de datos no se expone públicamente: solo es alcanzable desde la aplicación a través de credenciales privadas.</li>
            <li>Los secretos de configuración (llaves de API, contraseñas de base de datos, tokens de terceros) se mantienen en variables de entorno, fuera del código fuente y de los repositorios.</li>
          </ul>
        </section>

        <!-- 3 -->
        <section>
          <h2 class="text-2xl font-bold text-black dark:text-slate-100 border-l-4 border-black dark:border-indigo-500 pl-4 mb-4 uppercase">3. AUTENTICACIÓN Y CONTROL DE ACCESO</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li>El acceso requiere autenticación mediante <strong>tokens de sesión</strong>; cada sesión se emite de forma individual y puede revocarse.</li>
            <li>Las contraseñas se almacenan únicamente como <strong>hash criptográfico con sal</strong> (bcrypt). Nunca se guardan ni se transmiten en texto claro.</li>
            <li>El acceso a cada módulo está limitado por <strong>roles y permisos</strong> (propietario, administrador, mesero, cocina, barra, caja).</li>
            <li>Al iniciar sesión con credenciales nuevas, las sesiones anteriores de ese usuario se invalidan.</li>
            <li>La plataforma registra actividad operativa relevante (cambios de precio, cancelaciones, ajustes) para poder auditar quién hizo qué y cuándo.</li>
          </ul>
        </section>

        <!-- 4 -->
        <section>
          <h2 class="text-2xl font-bold text-black dark:text-slate-100 border-l-4 border-black dark:border-indigo-500 pl-4 mb-4 uppercase">4. AISLAMIENTO DE DATOS POR NEGOCIO</h2>
          <p>
            Cada restaurante opera en un espacio de datos separado. Las consultas se filtran por el negocio activo del
            usuario autenticado, de modo que un cliente <strong>no puede ver ni modificar información de otro</strong>,
            incluso si comparte la misma instalación de la plataforma.
          </p>
          <p class="mt-3">Un mismo dispositivo puede trabajar con distintos negocios, y cada sesión queda aislada por pestaña.</p>
        </section>

        <!-- 5 -->
        <section>
          <h2 class="text-2xl font-bold text-black dark:text-slate-100 border-l-4 border-black dark:border-indigo-500 pl-4 mb-4 uppercase">5. DATOS DE PAGO</h2>
          <p>
            eOrder <strong>no almacena números de tarjeta ni códigos de seguridad</strong>. Cuando se habilita el cobro en
            línea, el procesamiento lo realiza el proveedor de pagos correspondiente (por ejemplo PayPal o Mercado Pago); de
            la plataforma solo se guardan identificadores de la operación (referencia, orden y estado).
          </p>
          <p class="mt-3">Los datos fiscales y bancarios para cobros y facturación se gestionan por canales administrativos, no dentro de la aplicación.</p>
        </section>

        <!-- 6 -->
        <section>
          <h2 class="text-2xl font-bold text-black dark:text-slate-100 border-l-4 border-black dark:border-indigo-500 pl-4 mb-4 uppercase">6. RESPALDO Y CONTINUIDAD</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li>Se realizan respaldos de la base de datos de forma periódica.</li>
            <li>Antes de operaciones de mantenimiento que puedan afectar datos, se genera un respaldo previo verificable.</li>
            <li>El objetivo de recuperación se acuerda con cada cliente según el volumen y criticidad de su operación; en caso de requerir objetivos específicos (RTO/RPO) deben pactarse por escrito.</li>
          </ul>
        </section>

        <!-- 7 -->
        <section>
          <h2 class="text-2xl font-bold text-black dark:text-slate-100 border-l-4 border-black dark:border-indigo-500 pl-4 mb-4 uppercase">7. GESTIÓN DE VULNERABILIDADES Y RESPUESTA A INCIDENTES</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li>Las dependencias del proyecto se actualizan para corregir vulnerabilidades conocidas publicadas por sus mantenedores.</li>
            <li>Los reportes de seguridad se atienden con prioridad; confirmamos recepción y damos seguimiento.</li>
            <li>Ante un incidente que comprometa información, se contiene la causa, se restaura el servicio desde respaldo si es necesario y se informa a los clientes afectados por los medios de contacto registrados.</li>
          </ul>
        </section>

        <!-- 8 -->
        <section>
          <h2 class="text-2xl font-bold text-black dark:text-slate-100 border-l-4 border-black dark:border-indigo-500 pl-4 mb-4 uppercase">8. RETENCIÓN Y ELIMINACIÓN</h2>
          <p>
            La información operativa se conserva mientras la cuenta permanezca activa y durante el plazo necesario para
            cumplir obligaciones fiscales, contables o legales aplicables. Al término de la relación contractual, el
            cliente puede solicitar la exportación y posterior eliminación de su información por los canales oficiales.
          </p>
        </section>

        <!-- 9 -->
        <section>
          <h2 class="text-2xl font-bold text-black dark:text-slate-100 border-l-4 border-black dark:border-indigo-500 pl-4 mb-4 uppercase">9. TERCEROS Y SUBCENCARGADOS</h2>
          <p>
            Para operar el servicio nos apoyamos en proveedores especializados (infraestructura en la nube, base de datos
            administrada, correo transaccional, mensajería por WhatsApp, pagos y analítica). Cada proveedor accede
            únicamente a la información necesaria para la función que presta y bajo sus propias condiciones de seguridad.
          </p>
        </section>

        <!-- 10 -->
        <section>
          <h2 class="text-2xl font-bold text-black dark:text-slate-100 border-l-4 border-black dark:border-indigo-500 pl-4 mb-4 uppercase">10. RESPONSABILIDADES DEL CLIENTE</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li>Asignar permisos solo al personal que los necesita y retirarlos cuando la persona deja de laborar.</li>
            <li>No compartir credenciales entre empleados ni entre negocios.</li>
            <li>Usar contraseñas robustas y dispositivos actualizados.</li>
            <li>Reportar de inmediato cualquier acceso no reconocido o comportamiento anómalo.</li>
          </ul>
        </section>

        <!-- 11 -->
        <section>
          <h2 class="text-2xl font-bold text-black dark:text-slate-100 border-l-4 border-black dark:border-indigo-500 pl-4 mb-4 uppercase">11. CONTACTO Y REPORTE DE VULNERABILIDADES</h2>
          <p>
            Para reportar una vulnerabilidad, un incidente de seguridad o solicitar información adicional sobre esta
            política, escríbenos a través de la
            <router-link to="/contactanos" class="font-bold underline">página de contacto</router-link>
            indicando «Seguridad» en el asunto.
          </p>
          <p class="mt-3">
            Te pedimos no divulgar públicamente una vulnerabilidad antes de que podamos evaluarla y corregirla. Nos
            comprometemos a darte seguimiento.
          </p>
        </section>

        <div class="pt-6 border-t border-gray-100 dark:border-white/10 flex flex-wrap gap-4 text-sm">
          <router-link to="/terminos-y-condiciones" class="text-indigo-600 dark:text-indigo-400 hover:underline">Términos y condiciones</router-link>
          <router-link to="/contactanos" class="text-indigo-600 dark:text-indigo-400 hover:underline">Contacto</router-link>
          <router-link to="/" class="text-indigo-600 dark:text-indigo-400 hover:underline">Inicio</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeo } from '@/composables/useSeo'
import { ROUTE_SEO } from '@/config/seo'
import PreferenciasControl from '@/components/PreferenciasControl.vue'

useSeo(ROUTE_SEO['/politica-de-seguridad'])
</script>
