// src/i18n/landing.ts
//
// Textos de la landing en español e inglés.
//
// El español es la fuente de verdad: su objeto define las claves válidas, así
// que si a una traducción le falta una clave TypeScript lo marca al compilar.
//
// Solo cubre la landing pública. El panel interno sigue en español.

export type Idioma = 'es' | 'en'

const ES = {
  // ── Navegación ──────────────────────────────────────────────────────
  'nav.planes': 'Planes',
  'nav.contactanos': 'Contáctanos',
  'nav.ingresar': 'Ingresar',
  'nav.crearCuenta': 'Crear cuenta',
  'nav.abrirMenu': 'Abrir menú',
  'nav.cerrarMenu': 'Cerrar menú',
  'nav.ariaLogo': 'eOrder - Inicio',

  // ── Controles de preferencias ───────────────────────────────────────
  'pref.idioma': 'Idioma',
  'pref.cambiarIdioma': 'Cambiar idioma',
  'pref.modoOscuro': 'Activar modo oscuro',
  'pref.modoClaro': 'Activar modo claro',

  // ── Hero ────────────────────────────────────────────────────────────
  'hero.eyebrow': 'La plataforma todo en uno para tu restaurante',
  'hero.tituloA': 'El sistema punto de venta que hace volar la ',
  'hero.tituloEm': 'cocina y la caja',
  'hero.tituloB': '',
  'hero.parrafo':
    'Conecta meseros, barra, cocina y administración en una sola pantalla. Toma pedidos en segundos, elimina comandas perdidas y controla tus costos en tiempo real.',
  'hero.ctaPrueba': 'Empieza tu prueba gratis de 30 días',
  'hero.ctaPruebaNota': 'sin tarjeta',
  'hero.ctaDemo': 'Ver demo interactiva',
  'hero.proof': 'Impulsando la operación de restaurantes y cafeterías en México 🇲🇽',

  // Mock de KDS
  'hero.kdsTitulo': 'KDS — Cocina en vivo',
  'hero.kdsOrden': '#42',
  'hero.kdsTimer': '04:32',
  'hero.kdsItem1': '2× Tacos arrachera',
  'hero.kdsItem2': '1× Gringa especial',
  'hero.kdsItem3': '3× Aguas frescas',
  'hero.kdsEstado1': 'listo',
  'hero.kdsEstado2': '3 min',
  'hero.kdsEstado3': 'nueva',
  'hero.kdsFoot': 'Ruteo automático → Cocina · Barra · Postres',

  // ── Demo interactiva ────────────────────────────────────────────────
  'demo.eyebrow': 'Míralo funcionando',
  'demo.titulo': 'Las tres pantallas que mueven tu restaurante',
  'demo.sub': 'Cambia de estación con las flechas ← → y toca una comanda para avanzar su estado.',
  'demo.estacionesAria': 'Estaciones de eOrder',
  'demo.reset': 'Reiniciar demo',
  'demo.enVivo': 'en vivo',
  'demo.avanceAria': 'Avance de la comanda',
  'demo.todoEntregado': 'todo entregado',

  'demo.tab.pos': 'POS y caja',
  'demo.tab.posCorto': 'POS',
  'demo.tab.cocina': 'Cocina (KDS)',
  'demo.tab.cocinaCorto': 'Cocina',
  'demo.tab.barra': 'Barra',
  'demo.tab.barraCorto': 'Barra',

  'demo.panel.pos.titulo': 'POS — Caja',
  'demo.panel.pos.meta': 'Ticket #128',
  'demo.panel.pos.foot': 'Cierre ciego por método de pago → Efectivo · Tarjeta · Transferencia',
  'demo.panel.cocina.titulo': 'KDS — Cocina',
  'demo.panel.cocina.meta': 'Orden #42',
  'demo.panel.cocina.foot': 'Ruteo automático → Cocina · Barra · Postres',
  'demo.panel.barra.titulo': 'Barra — Bebidas',
  'demo.panel.barra.meta': 'Orden #43',
  'demo.panel.barra.foot': 'El mesero recibe el aviso en cuanto la bebida está lista',

  'demo.item.tacos': '2× Tacos arrachera',
  'demo.item.gringa': '1× Gringa especial',
  'demo.item.aguas': '3× Aguas frescas',
  'demo.item.limonada': '2× Limonada mineral',
  'demo.item.cafe': '1× Café americano',

  'demo.estado.porCobrar': 'por cobrar',
  'demo.estado.cobrado': 'cobrado',
  'demo.estado.nueva': 'nueva',
  'demo.estado.enPreparacion': 'en preparación',
  'demo.estado.listo': 'listo',

  // Tarjetas de impacto
  'impacto.1.titulo': 'Cierres de caja en minutos',
  'impacto.1.texto':
    'Cierres ciegos por método de pago: efectivo, tarjeta y transferencia, sin hojas de cálculo.',
  'impacto.2.titulo': 'Cero comandas en papel',
  'impacto.2.texto':
    'Cada platillo se rutea solo a cocina, barra o postres, y el mesero recibe el aviso al instante.',
  'impacto.3.titulo': 'Operación visible en tiempo real',
  'impacto.3.texto':
    'Ventas, insumos y desempeño del personal en el mismo panel, sin instalar equipo especializado.',

  // ── Módulos: problema → solución ────────────────────────────────────
  'modulos.eyebrow': 'Todo tu operación, un solo sistema',
  'modulos.titulo': 'Diseñado para los dolores reales de tu restaurante',
  'modulos.problema': 'Problema:',
  'modulos.solucion': 'Solución:',

  'modulos.1.titulo': 'POS y caja a prueba de errores',
  'modulos.1.problema': 'cierres largos y fugas de dinero.',
  'modulos.1.solucion':
    'cierra turnos en menos de 5 minutos con cierres ciegos de caja: efectivo, tarjeta y transferencia bajo control.',

  'modulos.2.titulo': 'Cocina (KDS) sin gritos ni papel',
  'modulos.2.problema': 'comandas perdidas y tiempos muertos.',
  'modulos.2.solucion':
    'pantallas digitales con alertas de tiempo por platillo, prioridad visual de órdenes y aviso instantáneo al mesero.',

  'modulos.3.titulo': 'Comandero móvil para barra y meseros',
  'modulos.3.problema': 'filas y cuellos de botella en el mostrador.',
  'modulos.3.solucion':
    'toma la orden a pie de mesa desde tablet o celular; el pedido se rutea solo a Cocina, Barra o Postres.',

  'modulos.4.titulo': 'Control total: costos, inventario y nómina',
  'modulos.4.problema': 'decisiones a ciegas.',
  'modulos.4.solucion':
    'margen de utilidad diario, consumo de insumos por receta y desempeño del personal en dashboards en tiempo real.',

  'modulos.5.titulo': 'Reportes que sí se entienden',
  'modulos.5.problema': 'cálculos en hojas de cálculo.',
  'modulos.5.solucion':
    'ventas por hora, top productos, ticket promedio y comparativas de semana generados automáticamente.',

  'modulos.6.titulo': 'Licencias y avisos automáticos',
  'modulos.6.problema': 'renovaciones que se pasan por alto.',
  'modulos.6.solucion':
    'notificaciones por correo y WhatsApp antes de cada vencimiento, con renovación en un clic.',

  // ── CTA intermedio ──────────────────────────────────────────────────
  'cta.eyebrow': 'Sin tarjeta · Sin permanencia',
  'cta.titulo': 'Prueba eOrder 30 días gratis en tu restaurante',
  'cta.sub':
    'Te ayudamos a montar tu menú, tus mesas y tus usuarios. Si no te convence, lo dejas sin costo.',
  'cta.principal': 'Empezar ahora',
  'cta.demo': 'Agendar demo guiada',

  // ── Planes ──────────────────────────────────────────────────────────
  'planes.eyebrow': 'Precios transparentes',
  'planes.titulo': 'Elige el plan según tu operación',
  'planes.sub': '30 días gratis · Sin permanencia · Cancela cuando quieras',
  'planes.altImagen': 'Comparativa de planes y precios de eOrder para restaurantes',
  'planes.caracteristica': 'Característica',
  'planes.popular': 'Más Popular',
  'planes.porMes': '/mes',
  'planes.cotizacion': 'Sobre cotización',
  'planes.hint': 'Desliza para comparar los tres planes →',
  'planes.nota':
    'Todos los planes incluyen POS, menú y kiosco digital, KDS para cocina y barra, comanda de mesero, soporte en línea y actualizaciones.',
  'planes.verTodos': 'Ver todos los planes y detalles',
  'planes.asesor': 'Hablar con un asesor',

  'planes.fila.idealPara': 'Ideal para',
  'planes.fila.sucursales': 'Sucursales incluidas',
  'planes.fila.usuarios': 'Usuarios conectados',
  'planes.fila.kds': 'Pantallas de cocina (KDS)',
  'planes.fila.inventario': 'Inventario',
  'planes.fila.reportes': 'Reportes avanzados',
  'planes.fila.comparativos': 'Comparativos entre sucursales',

  // ── Testimonios ─────────────────────────────────────────────────────
  'test.eyebrow': 'Lo que dicen nuestros clientes',
  'test.titulo': 'Restaurantes que ya operan con eOrder',
  'test.estrellasAria': 'Calificación: 5 de 5',
  'test.notaA': '¿Quieres hablar con alguien que ya lo usa?',
  'test.notaB': ' y te conectamos con un restaurante cliente.',
  'test.referencias': 'Pide referencias',

  // ── FAQ ─────────────────────────────────────────────────────────────
  'faq.eyebrow': 'Antes de decidir',
  'faq.titulo': 'Preguntas frecuentes',
  'faq.1.q': '¿Necesito comprar hardware especializado?',
  'faq.1.a':
    'No. eOrder funciona desde cualquier navegador web, iPad, tablet Android o computadora convencional.',
  'faq.2.q': '¿Qué pasa si se cae el internet?',
  'faq.2.a':
    'El POS cuenta con modo de resiliencia local para seguir registrando ventas y sincronizar automáticamente cuando la conexión vuelva.',
  'faq.3.q': '¿Puedo cancelar en cualquier momento?',
  'faq.3.a': 'Sin plazos forzosos ni letras chiquitas. Cancela o cambia de plan con un clic desde tu panel.',
  'faq.4.q': '¿Puedo cambiar de plan después?',
  'faq.4.a':
    'Sí, puedes escalar o reducir tu plan en cualquier momento. El cambio aplica en el siguiente ciclo de facturación.',
  'faq.5.q': '¿Los precios incluyen IVA?',
  'faq.5.a': 'Sí, todos los precios mostrados son en MXN e incluyen IVA.',
  'faq.6.q': '¿Qué incluye la prueba de 30 días?',
  'faq.6.a':
    'Acceso completo a todas las funciones de tu plan (menos Enterprise) para una sucursal, sin compromiso ni tarjeta.',

  // ── CTA final ───────────────────────────────────────────────────────
  'final.titulo': 'Pon en piloto automático la operación de tu restaurante hoy',
  'final.sub': 'Crea tu cuenta gratis o agenda una llamada con un especialista.',
  'final.crearCuenta': 'Crear cuenta gratis',
  'final.agendar': 'Agendar llamada',

  // ── Pie de página ───────────────────────────────────────────────────
  'footer.desc':
    'El sistema integral para restaurantes: POS, cocina, barra, caja y administración en tiempo real.',
  'footer.producto': 'Producto',
  'footer.compania': 'Compañía',
  'footer.terminos': 'Términos y condiciones',
  'footer.seguridad': 'Política de seguridad',
  'footer.copy': 'Easy Order · eorder.mx',
} as const

export type ClaveTexto = keyof typeof ES

const EN: Record<ClaveTexto, string> = {
  'nav.planes': 'Plans',
  'nav.contactanos': 'Contact us',
  'nav.ingresar': 'Sign in',
  'nav.crearCuenta': 'Create account',
  'nav.abrirMenu': 'Open menu',
  'nav.cerrarMenu': 'Close menu',
  'nav.ariaLogo': 'eOrder - Home',

  'pref.idioma': 'Language',
  'pref.cambiarIdioma': 'Change language',
  'pref.modoOscuro': 'Turn on dark mode',
  'pref.modoClaro': 'Turn on light mode',

  'hero.eyebrow': 'The all-in-one platform for your restaurant',
  'hero.tituloA': 'The point-of-sale system that keeps your ',
  'hero.tituloEm': 'kitchen and register',
  'hero.tituloB': ' moving',
  'hero.parrafo':
    'Connect waiters, bar, kitchen and management on a single screen. Take orders in seconds, stop losing tickets and track your costs in real time.',
  'hero.ctaPrueba': 'Start your 30-day free trial',
  'hero.ctaPruebaNota': 'no card required',
  'hero.ctaDemo': 'See the interactive demo',
  'hero.proof': 'Powering restaurants and cafés across Mexico 🇲🇽',

  'hero.kdsTitulo': 'KDS — Live kitchen',
  'hero.kdsOrden': '#42',
  'hero.kdsTimer': '04:32',
  'hero.kdsItem1': '2× Arrachera tacos',
  'hero.kdsItem2': '1× Special gringa',
  'hero.kdsItem3': '3× Aguas frescas',
  'hero.kdsEstado1': 'ready',
  'hero.kdsEstado2': '3 min',
  'hero.kdsEstado3': 'new',
  'hero.kdsFoot': 'Automatic routing → Kitchen · Bar · Desserts',

  'demo.eyebrow': 'See it in action',
  'demo.titulo': 'The three screens that run your restaurant',
  'demo.sub': 'Switch stations with ← → and tap a ticket to move it along.',
  'demo.estacionesAria': 'eOrder stations',
  'demo.reset': 'Reset demo',
  'demo.enVivo': 'live',
  'demo.avanceAria': 'Ticket progress',
  'demo.todoEntregado': 'all delivered',

  'demo.tab.pos': 'POS & register',
  'demo.tab.posCorto': 'POS',
  'demo.tab.cocina': 'Kitchen (KDS)',
  'demo.tab.cocinaCorto': 'Kitchen',
  'demo.tab.barra': 'Bar',
  'demo.tab.barraCorto': 'Bar',

  'demo.panel.pos.titulo': 'POS — Register',
  'demo.panel.pos.meta': 'Ticket #128',
  'demo.panel.pos.foot': 'Blind close by payment method → Cash · Card · Transfer',
  'demo.panel.cocina.titulo': 'KDS — Kitchen',
  'demo.panel.cocina.meta': 'Order #42',
  'demo.panel.cocina.foot': 'Automatic routing → Kitchen · Bar · Desserts',
  'demo.panel.barra.titulo': 'Bar — Drinks',
  'demo.panel.barra.meta': 'Order #43',
  'demo.panel.barra.foot': 'The waiter is notified the moment the drink is ready',

  'demo.item.tacos': '2× Arrachera tacos',
  'demo.item.gringa': '1× Special gringa',
  'demo.item.aguas': '3× Aguas frescas',
  'demo.item.limonada': '2× Sparkling lemonade',
  'demo.item.cafe': '1× American coffee',

  'demo.estado.porCobrar': 'unpaid',
  'demo.estado.cobrado': 'paid',
  'demo.estado.nueva': 'new',
  'demo.estado.enPreparacion': 'preparing',
  'demo.estado.listo': 'ready',

  'impacto.1.titulo': 'Cash closes in minutes',
  'impacto.1.texto': 'Blind closes by payment method: cash, card and transfer, with no spreadsheets.',
  'impacto.2.titulo': 'Zero paper tickets',
  'impacto.2.texto':
    'Every dish routes itself to kitchen, bar or desserts, and the waiter is notified instantly.',
  'impacto.3.titulo': 'Your operation, visible in real time',
  'impacto.3.texto':
    'Sales, supplies and staff performance on the same dashboard, with no special hardware.',

  'modulos.eyebrow': 'Your whole operation, one system',
  'modulos.titulo': 'Built for the real pain points of your restaurant',
  'modulos.problema': 'Problem:',
  'modulos.solucion': 'Solution:',

  'modulos.1.titulo': 'POS and register, error-proof',
  'modulos.1.problema': 'slow closes and money leaks.',
  'modulos.1.solucion':
    'close shifts in under 5 minutes with blind cash closes: cash, card and transfer under control.',

  'modulos.2.titulo': 'Kitchen (KDS) with no shouting, no paper',
  'modulos.2.problema': 'lost tickets and idle time.',
  'modulos.2.solucion':
    'digital screens with per-dish time alerts, visual order priority and instant waiter notifications.',

  'modulos.3.titulo': 'Mobile ordering for bar and waiters',
  'modulos.3.problema': 'queues and bottlenecks at the counter.',
  'modulos.3.solucion':
    'take the order tableside from a tablet or phone; it routes itself to Kitchen, Bar or Desserts.',

  'modulos.4.titulo': 'Full control: costs, inventory and payroll',
  'modulos.4.problema': 'decisions made blind.',
  'modulos.4.solucion':
    'daily profit margin, ingredient usage per recipe and staff performance on real-time dashboards.',

  'modulos.5.titulo': 'Reports you can actually read',
  'modulos.5.problema': 'spreadsheet calculations.',
  'modulos.5.solucion':
    'sales by hour, top products, average ticket and week-over-week comparisons, generated automatically.',

  'modulos.6.titulo': 'Automatic licences and reminders',
  'modulos.6.problema': 'renewals that slip by.',
  'modulos.6.solucion': 'email and WhatsApp reminders before every due date, with one-click renewal.',

  'cta.eyebrow': 'No card · No commitment',
  'cta.titulo': 'Try eOrder free for 30 days in your restaurant',
  'cta.sub':
    'We help you set up your menu, your tables and your users. If it is not for you, walk away at no cost.',
  'cta.principal': 'Get started now',
  'cta.demo': 'Book a guided demo',

  'planes.eyebrow': 'Transparent pricing',
  'planes.titulo': 'Pick the plan that fits your operation',
  'planes.sub': '30 days free · No commitment · Cancel anytime',
  'planes.altImagen': 'eOrder pricing and plan comparison for restaurants',
  'planes.caracteristica': 'Feature',
  'planes.popular': 'Most Popular',
  'planes.porMes': '/mo',
  'planes.cotizacion': 'Custom quote',
  'planes.hint': 'Swipe to compare all three plans →',
  'planes.nota':
    'Every plan includes POS, digital menu and kiosk, KDS for kitchen and bar, waiter ordering, online support and updates.',
  'planes.verTodos': 'See all plans and details',
  'planes.asesor': 'Talk to an advisor',

  'planes.fila.idealPara': 'Best for',
  'planes.fila.sucursales': 'Locations included',
  'planes.fila.usuarios': 'Connected users',
  'planes.fila.kds': 'Kitchen screens (KDS)',
  'planes.fila.inventario': 'Inventory',
  'planes.fila.reportes': 'Advanced reports',
  'planes.fila.comparativos': 'Location comparisons',

  'test.eyebrow': 'What our customers say',
  'test.titulo': 'Restaurants already running on eOrder',
  'test.estrellasAria': 'Rated 5 out of 5',
  'test.notaA': 'Want to talk to someone already using it?',
  'test.notaB': ' and we will connect you with a customer restaurant.',
  'test.referencias': 'Ask for references',

  'faq.eyebrow': 'Before you decide',
  'faq.titulo': 'Frequently asked questions',
  'faq.1.q': 'Do I need to buy special hardware?',
  'faq.1.a':
    'No. eOrder runs in any web browser, on an iPad, an Android tablet or a regular computer.',
  'faq.2.q': 'What happens if the internet goes down?',
  'faq.2.a':
    'The POS has a local resilience mode so you can keep recording sales and sync automatically once the connection returns.',
  'faq.3.q': 'Can I cancel at any time?',
  'faq.3.a': 'No forced terms, no small print. Cancel or switch plans in one click from your panel.',
  'faq.4.q': 'Can I change plans later?',
  'faq.4.a':
    'Yes, you can upgrade or downgrade at any time. The change applies on the next billing cycle.',
  'faq.5.q': 'Do the prices include VAT?',
  'faq.5.a': 'Yes, all prices shown are in MXN and include VAT.',
  'faq.6.q': 'What does the 30-day trial include?',
  'faq.6.a':
    'Full access to every feature in your plan (except Enterprise) for one location, with no commitment and no card.',

  'final.titulo': 'Put your restaurant operation on autopilot today',
  'final.sub': 'Create your free account or book a call with a specialist.',
  'final.crearCuenta': 'Create a free account',
  'final.agendar': 'Book a call',

  'footer.desc':
    'The complete system for restaurants: POS, kitchen, bar, register and management in real time.',
  'footer.producto': 'Product',
  'footer.compania': 'Company',
  'footer.terminos': 'Terms and conditions',
  'footer.seguridad': 'Security policy',
  'footer.copy': 'Easy Order · eorder.mx',
}

export const TEXTOS: Record<Idioma, Record<ClaveTexto, string>> = { es: ES, en: EN }

export const IDIOMAS: { id: Idioma; etiqueta: string; label: string }[] = [
  { id: 'es', etiqueta: 'ES', label: 'Español' },
  { id: 'en', etiqueta: 'EN', label: 'English' },
]

/**
 * Traduce los valores que vienen de `config/planes.ts` (única fuente de verdad
 * de precios y alcances). Los planes se siguen llamando igual en ambos idiomas:
 * son nombres comerciales.
 */
const VALORES_EN: Record<string, string> = {
  'Hasta 5': 'Up to 5',
  'Hasta 15': 'Up to 15',
  'Hasta 2': 'Up to 2',
  'Hasta 4': 'Up to 4',
  'Hasta 8': 'Up to 8',
  '5 o más': '5 or more',
  'A la medida': 'Tailored',
  'De insumos': 'Ingredients',
  'Por sucursal': 'Per location',
  'Centralizado': 'Centralized',
  'Food trucks y locales pequeños': 'Food trucks and small venues',
  'Restaurantes con un solo salón': 'Restaurants with a single dining room',
  'Negocios que abren una segunda ubicación': 'Businesses opening a second location',
  'Negocios con varias sucursales': 'Businesses with several locations',
  'Mercados gastronómicos con varias estaciones': 'Food halls with several stations',
  'Cadenas con 5 o más sucursales': 'Chains with 5 or more locations',
  'Sí': 'Yes',
  'No': 'No',
}

export function traducirValor(valor: string, idioma: Idioma): string {
  if (idioma === 'es') return valor
  return VALORES_EN[valor] ?? valor
}
