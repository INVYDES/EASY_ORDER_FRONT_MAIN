// src/config/planes.ts
// Fuente única de verdad de planes, precios y comparativas de eOrder.
// La consumen LandingView.vue (matriz resumida), PlanesView.vue (comparativa completa)
// y src/config/seo.ts (ofertas del JSON-LD).
// Cualquier cambio de precio o de alcance se hace SOLO aquí.

export type PlanId =
  | 'emprendimiento'
  | 'basico'
  | 'crecimiento'
  | 'pro'
  | 'foodhall'
  | 'enterprise'

export type PlanFact = {
  id: PlanId
  /** Nombre comercial del plan */
  name: string
  /** Abreviatura para encabezados compactos */
  short: string
  /** Precio mensual en MXN; null = sobre cotización */
  mensual: number | null
  /** Total del pago anual en MXN; null = sobre cotización */
  anual: number | null
  /** Sucursales incluidas */
  sucursales: string
  /** Usuarios conectados incluidos */
  conexiones: string
  /** Pantallas de cocina (KDS) incluidas */
  kds: string
  /** Inventario incluido */
  inventario: string
  /** Incluye reportes avanzados */
  reportesAvanzados: boolean
  /** Incluye comparativos entre sucursales */
  multiSucursal: boolean
  /** Para quién es el plan */
  idealPara: string
}

export const PLANES: PlanFact[] = [
  {
    id: 'emprendimiento',
    name: 'Emprendimiento',
    short: 'Emp.',
    mensual: 299,
    anual: 3189,
    sucursales: '1',
    conexiones: 'Hasta 5',
    kds: '1',
    inventario: 'De insumos',
    reportesAvanzados: false,
    multiSucursal: false,
    idealPara: 'Food trucks y locales pequeños',
  },
  {
    id: 'basico',
    name: 'Básico',
    short: 'Básico',
    mensual: 899,
    anual: 9549,
    sucursales: '1',
    conexiones: 'Hasta 15',
    kds: '2',
    inventario: 'De insumos',
    reportesAvanzados: true,
    multiSucursal: false,
    idealPara: 'Restaurantes con un solo salón',
  },
  {
    id: 'crecimiento',
    name: 'Crecimiento',
    short: 'Crec.',
    mensual: 1899,
    anual: 20219,
    sucursales: 'Hasta 2',
    conexiones: 'Hasta 15',
    kds: '4',
    inventario: 'Por sucursal',
    reportesAvanzados: true,
    multiSucursal: true,
    idealPara: 'Negocios que abren una segunda ubicación',
  },
  {
    id: 'pro',
    name: 'Pro',
    short: 'Pro',
    mensual: 3399,
    anual: 36189,
    sucursales: 'Hasta 4',
    conexiones: 'Hasta 15',
    kds: '8',
    inventario: 'Centralizado',
    reportesAvanzados: true,
    multiSucursal: true,
    idealPara: 'Negocios con varias sucursales',
  },
  {
    id: 'foodhall',
    name: 'Food Hall',
    short: 'Food Hall',
    mensual: 1499,
    anual: 15949,
    sucursales: '1',
    conexiones: 'Hasta 15',
    kds: 'Hasta 8',
    inventario: 'De insumos',
    reportesAvanzados: true,
    multiSucursal: false,
    idealPara: 'Mercados gastronómicos con varias estaciones',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    short: 'Enterprise',
    mensual: null,
    anual: null,
    sucursales: '5 o más',
    conexiones: 'A la medida',
    kds: 'A la medida',
    inventario: 'Centralizado',
    reportesAvanzados: true,
    multiSucursal: true,
    idealPara: 'Cadenas con 5 o más sucursales',
  },
]

export const PLAN_BY_ID = Object.fromEntries(
  PLANES.map((plan) => [plan.id, plan]),
) as Record<PlanId, PlanFact>

/** Formato de moneda mexicana sin decimales */
export function mxn(valor: number): string {
  return valor.toLocaleString('es-MX')
}

/** Equivalente mensual cuando el plan se paga anual */
export function equivalenciaMensual(plan: PlanFact): number | null {
  return plan.anual === null ? null : Math.round(plan.anual / 12)
}

/** Ahorro total al año pagando anual */
export function ahorroAnual(plan: PlanFact): number | null {
  if (plan.mensual === null || plan.anual === null) return null
  return plan.mensual * 12 - plan.anual
}

/** Descuento del plan anual respecto al mensual, con dos decimales */
export function descuentoAnual(plan: PlanFact): string | null {
  const ahorro = ahorroAnual(plan)
  if (ahorro === null || !plan.mensual) return null
  return `${((ahorro / (plan.mensual * 12)) * 100).toFixed(2)}%`
}

/** Planes que se muestran en la comparativa de /planes */
export const COMPARE_PLAN_IDS: PlanId[] = [
  'emprendimiento',
  'basico',
  'crecimiento',
  'pro',
  'foodhall',
]

/** Precio mensual formateado, ej. "$299" */
export function precioMensual(plan: PlanFact): string {
  return plan.mensual === null ? 'Sobre cotización' : `$${mxn(plan.mensual)}`
}

/** Etiqueta del precio mensual, ej. "$299/mes" */
export function precioMensualLabel(plan: PlanFact): string {
  return plan.mensual === null ? 'Sobre cotización' : `$${mxn(plan.mensual)}/mes`
}

/** Total del pago anual formateado, ej. "$3,189" */
export function precioAnual(plan: PlanFact): string {
  return plan.anual === null ? '—' : `$${mxn(plan.anual)}`
}

/** Equivalente mensual del plan anual formateado, ej. "$266" */
export function precioAnualMes(plan: PlanFact): string {
  const equivalente = equivalenciaMensual(plan)
  return equivalente === null ? '—' : `$${mxn(equivalente)}`
}

/** Ahorro anual formateado, ej. "$399" */
export function ahorroAnualTexto(plan: PlanFact): string {
  const ahorro = ahorroAnual(plan)
  return ahorro === null ? '—' : `$${mxn(ahorro)}`
}

const check = (incluido: boolean) => (incluido ? '✓' : '—')
const incluye = (incluido: boolean) => (incluido ? '✓' : '❌')

export type CompareRow = { label: string; values: string[] }

/** Filas de la comparativa completa (página /planes) */
export const COMPARE_ROWS: CompareRow[] = [
  {
    label: 'Restaurantes',
    values: COMPARE_PLAN_IDS.map((id) => PLAN_BY_ID[id].sucursales),
  },
  {
    label: 'Conexiones',
    values: COMPARE_PLAN_IDS.map((id) => PLAN_BY_ID[id].conexiones),
  },
  {
    label: 'KDS incluidos',
    values: COMPARE_PLAN_IDS.map((id) => PLAN_BY_ID[id].kds),
  },
  {
    label: 'Inventario',
    values: COMPARE_PLAN_IDS.map((id) => PLAN_BY_ID[id].inventario),
  },
  {
    label: 'Reportes avanzados',
    values: COMPARE_PLAN_IDS.map((id) => check(PLAN_BY_ID[id].reportesAvanzados)),
  },
  {
    label: 'Multi-sucursal',
    values: COMPARE_PLAN_IDS.map((id) => check(PLAN_BY_ID[id].multiSucursal)),
  },
]

/** Planes que se muestran en la matriz resumida de la landing */
export const LANDING_PLAN_IDS: PlanId[] = ['emprendimiento', 'basico', 'crecimiento']

export type MatrixRow = {
  label: string
  values: string[]
  /** true si la fila solo contiene ✓ / ❌ */
  boolean?: boolean
}

/** Filas de la matriz resumida (landing) — mismas cifras que /planes */
export const LANDING_MATRIX: MatrixRow[] = [
  {
    label: 'Ideal para',
    values: LANDING_PLAN_IDS.map((id) => PLAN_BY_ID[id].idealPara),
  },
  {
    label: 'Sucursales incluidas',
    values: LANDING_PLAN_IDS.map((id) => PLAN_BY_ID[id].sucursales),
  },
  {
    label: 'Usuarios conectados',
    values: LANDING_PLAN_IDS.map((id) => PLAN_BY_ID[id].conexiones),
  },
  {
    label: 'Pantallas de cocina (KDS)',
    values: LANDING_PLAN_IDS.map((id) => PLAN_BY_ID[id].kds),
  },
  {
    label: 'Inventario',
    values: LANDING_PLAN_IDS.map((id) => PLAN_BY_ID[id].inventario),
  },
  {
    label: 'Reportes avanzados',
    values: LANDING_PLAN_IDS.map((id) => incluye(PLAN_BY_ID[id].reportesAvanzados)),
    boolean: true,
  },
  {
    label: 'Comparativos entre sucursales',
    values: LANDING_PLAN_IDS.map((id) => incluye(PLAN_BY_ID[id].multiSucursal)),
    boolean: true,
  },
]
