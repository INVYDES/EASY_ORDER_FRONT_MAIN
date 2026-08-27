<template>
  <div class="cv">

    <!-- ══ Resumen: rango de fechas ══ -->
    <div class="cv-summary">
      <div class="cv-chip" :class="{ 'cv-chip--on': inicio }">
        <span class="cv-chip__dot cv-chip__dot--start"></span>
        <div class="cv-chip__body">
          <span class="cv-chip__label">Inicio</span>
          <span class="cv-chip__value">{{ inicio ? formatLargo(inicio) : 'Ahora mismo' }}</span>
        </div>
      </div>

      <span class="cv-summary__arrow">→</span>

      <div class="cv-chip" :class="{ 'cv-chip--on': fin }">
        <span class="cv-chip__dot cv-chip__dot--end"></span>
        <div class="cv-chip__body">
          <span class="cv-chip__label">Fin</span>
          <span class="cv-chip__value">{{ fin ? formatLargo(fin) : 'Indefinido' }}</span>
        </div>
      </div>

      <button v-if="inicio || fin || dias.length" @click="limpiar" type="button" class="cv-clear">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cv-clear__icon">
          <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>
        </svg>
        Limpiar
      </button>
    </div>

    <!-- ══ Repetición semanal ══ -->
    <div class="cv-repeat">
      <div class="cv-repeat__head">
        <span class="cv-repeat__title">Repetición semanal</span>
        <span class="cv-repeat__sub">Elige los días de la semana en que se mostrará</span>
      </div>

      <div class="cv-seg">
        <button type="button" @click="dias=[]; repetir = false"
          :class="['cv-seg__btn', !repetir && 'cv-seg__btn--on']">Todos los días</button>
        <button type="button" @click="repetir = true"
          :class="['cv-seg__btn', repetir && 'cv-seg__btn--on']">Solo estos días</button>
      </div>

      <div v-show="repetir" class="cv-days animate-slide-up">
        <button v-for="(d, i) in NOMBRES_DIA" :key="i" type="button" @click="toggleDia(i)"
          :class="['cv-day', esDiaSeleccionado(i) && 'cv-day--on']">
          {{ d }}
        </button>
      </div>
      <p v-show="repetir" class="cv-repeat__hint">
        Se repite cada semana. Para "todos los jueves" elige solo <b>Jue</b>.
      </p>
    </div>

    <!-- ══ Calendarios (a pantalla completa, apilados) ══ -->
    <div class="cv-cals">
      <section class="cv-months">
        <div class="cv-cal">
          <div class="cv-cal__head">
            <button type="button" @click="cambiarMes(0, -1)" class="cv-nav" aria-label="Mes anterior">‹</button>
            <div class="cv-cal__titles">
              <span class="cv-cal__cap">Desde</span>
              <span class="cv-cal__month">{{ tituloMes(0) }}</span>
            </div>
            <button type="button" @click="cambiarMes(0, 1)" class="cv-nav" aria-label="Mes siguiente">›</button>
          </div>
          <CalendarioMes :grid="grid(0)" :inicio="inicio" :fin="fin" :dias="dias" :hoy="hoyYMD"
            @seleccion="elegir(0, $event)" />
        </div>

        <div class="cv-cal">
          <div class="cv-cal__head">
            <button type="button" @click="cambiarMes(1, -1)" class="cv-nav" aria-label="Mes anterior">‹</button>
            <div class="cv-cal__titles">
              <span class="cv-cal__cap">Hasta</span>
              <span class="cv-cal__month">{{ tituloMes(1) }}</span>
            </div>
            <button type="button" @click="cambiarMes(1, 1)" class="cv-nav" aria-label="Mes siguiente">›</button>
          </div>
          <CalendarioMes :grid="grid(1)" :inicio="inicio" :fin="fin" :dias="dias" :hoy="hoyYMD"
            @seleccion="elegir(1, $event)" />
        </div>
      </section>
    </div>

    <!-- ══ Accesos rápidos ══ -->
    <div class="cv-quick">
      <span class="cv-quick__label">Rápido</span>
      <button v-for="r in rapidos" :key="r.label" type="button" @click="aplicarRapido(r)"
        :class="['cv-quick__btn', activoRapido(r) && 'cv-quick__btn--on']">
        {{ r.label }}
      </button>
      <button v-if="dias.length > 0" type="button" @click="dias=[]" class="cv-quick__btn cv-quick__btn--del">
        Quitar días
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, defineComponent, h } from 'vue'

const props = defineProps({
  inicio: { type: String, default: '' }, // yyyy-mm-dd
  fin:    { type: String, default: '' },
  dias:   { type: Array,  default: () => [] }, // 0=Dom ... 6=Sáb
})
const emit = defineEmits(['update:inicio', 'update:fin', 'update:dias'])

const hoy = new Date()
const hoyYMD = toYMD(hoy)
const meses = ref([
  { year: hoy.getFullYear(), month: hoy.getMonth() },
  { year: hoy.getFullYear(), month: hoy.getMonth() + 1 }
])

const NOMBRES_DIA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const repetir = ref(props.dias.length > 0)

function toYMD(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const parseYMD = (v) => {
  if (!v) return null
  const [y, m, d] = v.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const formatLargo = (v) => {
  const d = parseYMD(v)
  if (!d) return ''
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}
const agregarDias = (d, n) => {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

const tituloMes = (idx) => {
  const m = meses.value[idx]
  return new Date(m.year, m.month, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
}

const cambiarMes = (idx, delta) => {
  const m = meses.value[idx]
  let ny = m.year, nm = m.month + delta
  if (nm < 0) { nm = 11; ny-- }
  if (nm > 11) { nm = 0; ny++ }
  meses.value[idx] = { year: ny, month: nm }
}

const grid = (idx) => {
  const m = meses.value[idx]
  const startDow = new Date(m.year, m.month, 1).getDay()
  const daysInMonth = new Date(m.year, m.month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(toYMD(new Date(m.year, m.month, d)))
  while (cells.length % 7 !== 0) cells.push(null)
  return { headers: NOMBRES_DIA, cells }
}

const esDiaSeleccionado = (i) => props.dias.includes(i)

const toggleDia = (i) => {
  const next = esDiaSeleccionado(i)
    ? props.dias.filter(d => d !== i)
    : [...props.dias, i].sort((a, b) => a - b)
  emit('update:dias', next)
}

const elegir = (idx, ymd) => {
  const d = parseYMD(ymd)
  if (!d) return
  const iniD = parseYMD(props.inicio)
  const finD = parseYMD(props.fin)
  if (idx === 0) {
    if (finD && d > finD) { emit('update:inicio', ymd); emit('update:fin', ''); return }
    emit('update:inicio', ymd)
    return
  }
  if (iniD && d < iniD) { emit('update:inicio', ''); emit('update:fin', ymd); return }
  emit('update:fin', ymd)
}

const rapidos = [
  { label: 'Hoy', set: () => ({ inicio: toYMD(new Date()), fin: '' }) },
  { label: '1 semana', set: () => ({ inicio: toYMD(new Date()), fin: toYMD(agregarDias(new Date(), 7)) }) },
  { label: '1 mes', set: () => ({ inicio: toYMD(new Date()), fin: toYMD(agregarDias(new Date(), 30)) }) },
  { label: 'Fines de semana', set: () => ({ inicio: '', fin: '', dias: [0, 6] }) },
  { label: 'Permanente', set: () => ({ inicio: toYMD(new Date()), fin: '' }) }
]

const aplicarRapido = (r) => {
  const o = r.set()
  emit('update:inicio', o.inicio ?? '')
  emit('update:fin', o.fin ?? '')
  if (o.dias) emit('update:dias', o.dias)
}

const activoRapido = (r) => {
  const o = r.set()
  return o.inicio === props.inicio && (o.fin || '') === (props.fin || '')
}

const limpiar = () => {
  emit('update:inicio', '')
  emit('update:fin', '')
  emit('update:dias', [])
}

// Subcomponente: mes del calendario
const CalendarioMes = defineComponent({
  name: 'CalendarioMes',
  props: {
    grid: { type: Object, required: true },
    inicio: { type: String, default: '' },
    fin: { type: String, default: '' },
    dias: { type: Array, default: () => [] },
    hoy: { type: String, default: '' }
  },
  emits: ['seleccion'],
  setup(props, { emit }) {
    return () => h('div', [
      h('div', { class: 'cv-month-grid' }, [
        h('div', { class: 'cv-week' },
          (props.grid.headers || []).map((dv, i) => h('span', { key: i, class: 'cv-week__item' }, dv))),
        h('div', { class: 'cv-cells' },
          (props.grid.cells || []).map((ymd, i) => {
            if (!ymd) return h('span', { key: 'e' + i, class: 'cv-cell cv-cell--blank' }, '')
            const fecha = parseYMD(ymd)
            const dow = fecha.getDay()
            const esInicio = ymd === props.inicio
            const esFin = ymd === props.fin
            const esHoy = ymd === props.hoy
            const enRango = props.inicio && props.fin && ymd >= props.inicio && ymd <= props.fin
            const diaRepetido = props.dias && props.dias.includes(dow)

            let cls = 'cv-cell cv-cell--normal'
            if (esInicio) cls = 'cv-cell cv-cell--start'
            else if (esFin) cls = 'cv-cell cv-cell--end'
            else if (enRango) cls = 'cv-cell cv-cell--range'
            else if (diaRepetido) cls = 'cv-cell cv-cell--repeat'
            if (esHoy) cls += ' cv-cell--today'

            return h('button', {
              key: ymd,
              class: cls,
              type: 'button',
              onClick: () => emit('seleccion', ymd),
              title: `${formatLargo(ymd)}${diaRepetido && !esInicio && !esFin ? ' · se repite cada semana' : ''}`
            }, [
              h('span', { class: 'cv-cell__num' }, String(fecha.getDate())),
              esInicio || esFin ? h('span', { class: 'cv-cell__tag' }, esInicio ? 'INI' : 'FIN') : null,
            ])
          }))
      ])
    ])
  }
})
</script>

<style>
/* ═══ Contenedor ═══ */
.cv {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, .06);
  font-family: inherit;
}

/* ═══ Resumen ═══ */
.cv-summary {
  display: flex;
  align-items: stretch;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}
.cv-chip {
  flex: 1;
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .9rem 1.1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  min-width: 0;
  transition: all .15s;
}
.cv-chip--on { background: #f5f7ff; border-color: #ddd6fe; }
.cv-chip__dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.cv-chip__dot--start { background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.15); }
.cv-chip__dot--end   { background: #f43f5e; box-shadow: 0 0 0 3px rgba(244,63,94,.15); }
.cv-chip__body { display: flex; flex-direction: column; min-width: 0; }
.cv-chip__label {
  font-size: .65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .1em;
  color: #94a3b8;
}
.cv-chip__value {
  font-size: .95rem; font-weight: 700; color: #1e293b;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cv-summary__arrow {
  align-self: center; color: #cbd5e1; font-size: 1.2rem; flex-shrink: 0;
}
.cv-clear {
  display: flex; align-items: center; gap: .35rem;
  padding: 0 .6rem; background: transparent; border: none;
  color: #94a3b8; font-size: .72rem; font-weight: 600; cursor: pointer;
  border-radius: 8px; flex-shrink: 0; transition: all .15s;
}
.cv-clear:hover { color: #e11d48; background: #fff1f2; }
.cv-clear__icon { width: 14px; height: 14px; }

/* ═══ Repetición ═══ */
.cv-repeat {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.1rem 1.25rem;
}
.cv-repeat__head { display: flex; flex-direction: column; gap: .15rem; margin-bottom: .9rem; }
.cv-repeat__title { font-size: .85rem; font-weight: 700; color: #334155; }
.cv-repeat__sub { font-size: .7rem; color: #94a3b8; }

.cv-seg {
  display: inline-flex; background: #fff; border: 1px solid #e2e8f0;
  border-radius: 11px; padding: .25rem; gap: .25rem; margin-bottom: 1rem;
}
.cv-seg__btn {
  border: none; background: transparent; padding: .5rem 1.2rem;
  border-radius: 8px; font-size: .78rem; font-weight: 600;
  color: #64748b; cursor: pointer; transition: all .15s;
}
.cv-seg__btn--on { background: #4f46e5; color: #fff; box-shadow: 0 2px 6px rgba(79,70,229,.3); }

.cv-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: .6rem; }
.cv-day {
  padding: .8rem 0; border-radius: 12px; cursor: pointer;
  border: 1px solid #e2e8f0; background: #fff;
  font-size: .85rem; font-weight: 700; color: #475569;
  transition: all .15s;
}
.cv-day:hover { border-color: #c7d2fe; color: #4338ca; }
.cv-day--on {
  background: #4f46e5; border-color: #4f46e5; color: #fff;
  box-shadow: 0 2px 8px rgba(79,70,229,.3);
}
.cv-repeat__hint { font-size: .7rem; color: #94a3b8; margin-top: .8rem; font-style: italic; }

/* ═══ Calendarios apilados ═══ */
.cv-cals { display: flex; flex-direction: column; gap: 1rem; }
.cv-cal {
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 16px; padding: 1.25rem;
}
.cv-cal__head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1rem;
}
.cv-cal__titles { display: flex; flex-direction: column; align-items: center; gap: .15rem; }
.cv-cal__cap {
  font-size: .6rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .15em; color: #a5b4fc;
}
.cv-cal__month {
  font-size: 1rem; font-weight: 700; color: #1e293b;
  text-transform: capitalize;
}
.cv-nav {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  border: 1px solid #e2e8f0; background: #fff; border-radius: 9px;
  color: #64748b; font-size: 1rem; cursor: pointer; transition: all .15s;
}
.cv-nav:hover { background: #eef2ff; border-color: #c7d2fe; color: #4338ca; }

.cv-month-grid { display: flex; flex-direction: column; }
.cv-week {
  display: grid; grid-template-columns: repeat(7, 1fr);
  margin-bottom: .5rem;
}
.cv-week__item {
  font-size: .72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .06em;
  color: #a5b4fc; text-align: center; padding: .35rem 0;
}
.cv-cells { display: grid; grid-template-columns: repeat(7, 1fr); gap: .5rem; }

.cv-cell {
  position: relative;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: .2rem;
  border-radius: 12px; border: 1px solid transparent;
  cursor: pointer; transition: all .15s;
  font-size: .85rem; font-weight: 600;
  aspect-ratio: 1 / 1;
  min-height: 44px;
}
.cv-cell__num { line-height: 1; }
.cv-cell--blank { cursor: default; }
.cv-cell--normal { color: #475569; background: #f8fafc; border-color: #eef0f6; }
.cv-cell--normal:hover { background: #eef2ff; color: #4338ca; border-color: #c7d2fe; }
.cv-cell--repeat { background: #eef2ff; color: #4338ca; border-color: #dbe3ff; }
.cv-cell--repeat:hover { background: #e0e7ff; }
.cv-cell--range { background: #e0e7ff; color: #3730a3; border-color: #c7d2fe; }
.cv-cell--start {
  background: #10b981; color: #fff; font-weight: 700;
  box-shadow: 0 4px 10px rgba(16, 185, 129, .35);
}
.cv-cell--end {
  background: #f43f5e; color: #fff; font-weight: 700;
  box-shadow: 0 4px 10px rgba(244, 63, 94, .35);
}
.cv-cell--today { outline: 2px solid #818cf8; outline-offset: 2px; }
.cv-cell__tag {
  position: absolute; top: 4px; right: 4px;
  font-size: .42rem; font-weight: 800; letter-spacing: .04em;
  background: rgba(255,255,255,.4); color: #fff;
  padding: 2px 4px; border-radius: 4px; line-height: 1;
}

/* ═══ Rápidos ═══ */
.cv-quick {
  display: flex; align-items: center; gap: .6rem; flex-wrap: wrap;
  padding-top: .1rem;
}
.cv-quick__label {
  font-size: .65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .1em; color: #94a3b8; flex-shrink: 0;
}
.cv-quick__btn {
  padding: .5rem 1rem; border-radius: 10px; border: 1px solid #e2e8f0;
  background: #fff; color: #475569; font-size: .74rem; font-weight: 600;
  cursor: pointer; transition: all .15s;
}
.cv-quick__btn:hover { border-color: #c7d2fe; color: #4338ca; background: #f8faff; }
.cv-quick__btn--on { background: #4f46e5; border-color: #4f46e5; color: #fff; }
.cv-quick__btn--del { border-color: #fecdd3; color: #e11d48; background: #fff1f2; }
.cv-quick__btn--del:hover { background: #ffe4e6; border-color: #fb7185; }

/* ═══ Responsive ═══ */
@media (max-width: 520px) {
  .cv { padding: 1rem; }
  .cv-summary { flex-wrap: wrap; }
  .cv-days { gap: .4rem; }
  .cv-cell { min-height: 36px; font-size: .78rem; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up { animation: slideUp .25s ease-out forwards; }
</style>