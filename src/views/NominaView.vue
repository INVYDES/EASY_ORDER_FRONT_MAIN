<template>
  <div class="nomina-root">

    <!-- ── TOASTS ─────────────────────────────────────────────────────── -->
    <div class="toast-stack">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', toast.type === 'success' ? 'toast--success' : 'toast--error']"
      >
        <span class="toast__icon">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
        <span class="toast__msg">{{ toast.message }}</span>
      </div>
    </div>

    <!-- ── AUTH OVERLAY ───────────────────────────────────────────────── -->
    <transition name="fade">
      <div v-if="!isAuthenticated" class="auth-overlay">
        <div class="auth-card">
          <div class="auth-card__icon">🔐</div>
          <h2 class="auth-card__title">Acceso Restringido</h2>
          <p class="auth-card__desc">Ingresa tu contraseña de administrador para ver la información de nómina.</p>

          <form @submit.prevent="verifyPassword" class="auth-form">
            <div class="field">
              <label class="field__label">Contraseña</label>
              <input
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
                :disabled="verifying"
                class="field__input"
              />
            </div>
            <p v-if="authError" class="auth-error">{{ authError }}</p>
            <button type="submit" :disabled="verifying" class="btn btn--primary btn--full">
              <span v-if="verifying" class="spinner"></span>
              {{ verifying ? 'Verificando…' : 'Desbloquear' }}
            </button>
          </form>
        </div>
      </div>
    </transition>

    <!-- ── MAIN SHELL ─────────────────────────────────────────────────── -->
    <div v-if="isAuthenticated" class="shell">

      <!-- Header -->
      <header class="page-header">
        <div class="page-header__left">
          <p class="page-header__eyebrow">Panel Administrativo</p>
          <h1 class="page-header__title">Gestión de Nóminas</h1>
        </div>
        <div class="page-header__right">
          <div class="tab-switcher">
            <button
              @click="activeMainTab = 'historial'"
              :class="['tab-switcher__btn', activeMainTab === 'historial' && 'tab-switcher__btn--active']"
            >
              <i class="fa-solid fa-clock-rotate-left"></i> Historial
            </button>
            <button
              @click="activeMainTab = 'personal'"
              :class="['tab-switcher__btn', activeMainTab === 'personal' && 'tab-switcher__btn--active']"
            >
              <i class="fa-solid fa-users-gear"></i> Personal
            </button>
          </div>
          <button @click="showGenerateModal = true" class="btn btn--primary">
            <i class="fa-solid fa-plus"></i> Nueva Nómina
          </button>
        </div>
      </header>

      <!-- ═══ HISTORIAL ════════════════════════════════════════════════ -->
      <template v-if="activeMainTab === 'historial'">

        <!-- Banner mes actual -->
        <div v-if="nominasActuales.length > 0" class="banner-mes">
          <div class="banner-mes__left">
            <span class="banner-mes__icon">📅</span>
            <div>
              <p class="banner-mes__title">Nóminas del Mes Actual</p>
              <p class="banner-mes__sub">{{ nominasActuales.length }} registros · Periodo en curso</p>
            </div>
          </div>
          <div class="banner-mes__stat">
            <p class="stat-micro-label">Total del Mes</p>
            <p class="stat-micro-value">${{ Number(montoTotalMesActual).toLocaleString() }}</p>
          </div>
        </div>

        <!-- KPIs -->
        <div class="kpi-row">
          <div class="kpi-card">
            <p class="kpi-card__label">Total Pendiente</p>
            <p class="kpi-card__value">${{ Number(stats.total_pendiente || 0).toLocaleString() }}</p>
            <p class="kpi-card__foot kpi-card__foot--warn">⏳ {{ stats.pendientes || 0 }} pagos pendientes</p>
          </div>
          <div class="kpi-card">
            <p class="kpi-card__label">Total Pagado</p>
            <p class="kpi-card__value">${{ Number(stats.total_pagado || 0).toLocaleString() }}</p>
            <p class="kpi-card__foot kpi-card__foot--ok">✓ {{ stats.pagadas || 0 }} nóminas pagadas</p>
          </div>
          <div class="kpi-card">
            <p class="kpi-card__label">Total Nóminas</p>
            <p class="kpi-card__value">{{ stats.total_nominas || 0 }}</p>
            <p class="kpi-card__foot kpi-card__foot--info">👥 Registros históricos</p>
          </div>
        </div>

        <!-- Tabla -->
        <div class="panel">
          <div class="panel__header">
            <h3 class="panel__title">Historial de Nóminas</h3>
            <div class="panel__controls">
              <select v-model="filterEmpleado" class="select">
                <option value="">Todos los empleados</option>
                <option v-for="emp in empleados" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
              </select>
              <select v-model="filterYear" class="select">
                <option :value="2024">2024</option>
                <option :value="2025">2025</option>
                <option :value="2026">2026</option>
              </select>
            </div>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Periodo</th>
                  <th>Empleado</th>
                  <th>Desglose</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingTable">
                  <td colspan="6" class="table-empty">Cargando registros…</td>
                </tr>
                <tr v-else-if="nominas.length === 0">
                  <td colspan="6" class="table-empty">Sin nóminas para este periodo.</td>
                </tr>
                <tr v-for="n in nominas" :key="n.id">
                  <td>
                    <p class="cell-primary">{{ formatDateRange(n.periodo_inicio, n.periodo_fin) }}</p>
                    <p class="cell-secondary">#{{ n.id }}</p>
                  </td>
                  <td>
                    <p class="cell-primary cell-primary--accent">{{ n.user?.name || `Usuario #${n.user_id}` }}</p>
                    <p class="cell-secondary">{{ n.user?.tipo_empleado || 'Empleado' }}</p>
                  </td>
                  <td class="breakdown-cell">
                    <span class="breakdown-item">Base: ${{ Number(n.salario_base || 0).toLocaleString() }} ({{ n.horas_totales }}h)</span>
                    <span v-if="n.comision_ventas > 0" class="breakdown-item">Comisiones: ${{ Number(n.comision_ventas).toLocaleString() }}</span>
                    <span v-if="n.bonos > 0" class="breakdown-item breakdown-item--ok">Bonos: +${{ Number(n.bonos).toLocaleString() }}</span>
                    <span v-if="n.descuentos > 0" class="breakdown-item breakdown-item--neg">Descuentos: -${{ Number(n.descuentos).toLocaleString() }}</span>
                  </td>
                  <td>
                    <p class="cell-total">${{ Number(n.pago_total || n.monto_total || 0).toLocaleString() }}</p>
                  </td>
                  <td>
                    <span :class="['badge', statusClass(n.estado)]">{{ n.estado }}</span>
                  </td>
                  <td class="text-right">
                    <div class="action-group">
                      <button v-if="n.estado === 'PENDIENTE'" @click="abrirEditModal(n)" class="icon-btn icon-btn--blue" title="Editar">
                        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button v-if="n.estado === 'PENDIENTE'" @click="abrirPaymentModal(n)" class="icon-btn icon-btn--green" title="Pagar">
                        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </button>
                      <button @click="verDetalle(n)" class="icon-btn icon-btn--indigo" title="Ver detalle">
                        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Charts -->
        <div class="charts-row">
          <div class="panel chart-panel">
            <div class="chart-panel__header">
              <div>
                <h3 class="panel__title">Tendencia de Gasto</h3>
                <p class="panel__subtitle">Inversión mensual · {{ filterYear }}</p>
              </div>
              <span class="chart-panel__icon">📈</span>
            </div>
            <div class="chart-wrap">
              <div v-if="loadingTable" class="chart-loader"><div class="spinner spinner--lg"></div></div>
              <canvas ref="chartTendencia"></canvas>
            </div>
          </div>

          <div class="panel chart-panel">
            <div class="chart-panel__header">
              <div>
                <h3 class="panel__title">Composición de Pagos</h3>
                <p class="panel__subtitle">Base vs. Variables</p>
              </div>
              <span class="chart-panel__icon">📊</span>
            </div>
            <div class="chart-wrap">
              <div v-if="loadingTable" class="chart-loader"><div class="spinner spinner--lg"></div></div>
              <canvas ref="chartComposicion"></canvas>
            </div>
          </div>
        </div>

        <!-- Inversión por colaborador -->
        <div v-if="statsPorEmpleado.length > 0" class="panel">
          <div class="panel__header">
            <div>
              <h3 class="panel__title">Inversión por Colaborador</h3>
              <p class="panel__subtitle">Acumulado pagado en {{ filterYear }}</p>
            </div>
            <span class="chart-panel__icon">👨‍💻</span>
          </div>
          <div class="emp-grid">
            <div v-for="emp in statsPorEmpleado" :key="emp.name" class="emp-stat-card">
              <div class="emp-stat-card__top">
                <p class="emp-stat-card__name">{{ emp.name }}</p>
                <span class="badge badge--neutral">{{ emp.count }} nóminas</span>
              </div>
              <div class="emp-stat-card__bottom">
                <div>
                  <p class="stat-micro-label">Acumulado</p>
                  <p class="emp-stat-card__total">${{ Number(emp.total).toLocaleString() }}</p>
                </div>
                <div class="text-right">
                  <p class="stat-micro-label">Variables</p>
                  <p class="emp-stat-card__var">+${{ Number(emp.variables).toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </template>

      <!-- ═══ PERSONAL ══════════════════════════════════════════════════ -->
      <template v-else-if="activeMainTab === 'personal'">
        <div class="personal-layout">

          <!-- Sidebar: KPI + Config -->
          <div class="personal-sidebar">
            <div class="commitment-card">
              <p class="commitment-card__label">NOMINA TOTAL BASE</p>
              <p class="commitment-card__value">${{ Number(totalSueldosBase).toLocaleString() }}</p>
              <div class="commitment-card__badge">
                <i class="fa-solid fa-user-check"></i> {{ empleados.length }} Colaboradores
              </div>
            </div>

            <!-- Config. Global eliminada por petición del usuario -->
          </div>

          <!-- Employee cards -->
          <div class="emp-cards">
            <div
              v-for="emp in empleados"
              :key="emp.id"
              @click="abrirEmpConfigModal(emp)"
              :class="['emp-card', emp.activo ? 'emp-card--active' : 'emp-card--inactive']"
            >
              <div class="emp-card__head">
                <div class="emp-card__avatar">
                  {{ emp.puesto === 'mesero' ? '🤵' : emp.puesto === 'cocina' ? '👨‍🍳' : '💼' }}
                </div>
                <div class="emp-card__info">
                  <h4 class="emp-card__name">{{ emp.name }}</h4>
                  <div class="emp-card__tags">
                    <span class="badge badge--indigo">{{ emp.puesto || 'Empleado' }}</span>
                    <span v-if="!emp.activo" class="badge badge--red">Inactivo</span>
                    <span v-else class="badge badge--green">Activo</span>
                  </div>
                </div>
                <button class="icon-btn icon-btn--ghost"><i class="fa-solid fa-pen-to-square"></i></button>
              </div>

              <div class="emp-card__stats">
                <div class="emp-card__stat">
                  <p class="emp-card__stat-label">Sueldo Base</p>
                  <p class="emp-card__stat-val">${{ Number(emp.salario_base || 0).toLocaleString() }}</p>
                </div>
                <div class="emp-card__stat emp-card__stat--divider">
                  <p class="emp-card__stat-label">Valor Hora</p>
                  <p class="emp-card__stat-val emp-card__stat-val--accent">${{ Number(emp.salario_por_hora || 0).toLocaleString() }}</p>
                </div>
                <div class="emp-card__stat">
                  <p class="emp-card__stat-label">Comisión</p>
                  <p class="emp-card__stat-val emp-card__stat-val--green">{{ Number(emp.comision_por_venta || 0) }}%</p>
                </div>
              </div>

              <p class="emp-card__footer">
                Último ajuste: {{ emp.updated_at ? new Date(emp.updated_at).toLocaleDateString('es-MX') : 'N/A' }}
              </p>
            </div>
          </div>

        </div>
      </template>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         MODALS
    ═══════════════════════════════════════════════════════════════════ -->

    <!-- Modal: Generar Nómina -->
    <transition name="modal">
      <div v-if="showGenerateModal" class="modal-overlay" @click.self="showGenerateModal = false">
        <div class="modal">
          <div class="modal__stripe modal__stripe--indigo"></div>
          <h3 class="modal__title">Generar Nómina</h3>
          <p class="modal__desc">Selecciona el empleado y el periodo. Los campos opcionales sobreescriben los valores configurados.</p>

          <div class="modal__body">
            <div class="field">
              <label class="field__label">Empleado *</label>
              <select v-model="newNomina.user_id" class="field__input">
                <option value="" disabled>Selecciona un empleado…</option>
                <option v-for="emp in empleados" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
              </select>
            </div>

            <div class="field-row">
              <div class="field">
                <label class="field__label">Desde *</label>
                <input v-model="newNomina.inicio" type="date" class="field__input" />
              </div>
              <div class="field">
                <label class="field__label">Hasta *</label>
                <input v-model="newNomina.fin" type="date" class="field__input" />
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label class="field__label">Valor / Hora <span class="optional">opcional</span></label>
                <input v-model="newNomina.valor_hora" type="number" step="0.01" placeholder="50.00" class="field__input" />
              </div>
              <div class="field">
                <label class="field__label">Salario Base Fijo <span class="optional">opcional</span></label>
                <input v-model="newNomina.salario_base" type="number" step="0.01" placeholder="8000.00" class="field__input" />
              </div>
            </div>

            <div class="field-row field-row--3">
              <div class="field">
                <label class="field__label">Comisiones</label>
                <input v-model="newNomina.comision_ventas" type="number" step="0.01" placeholder="0.00" class="field__input" />
              </div>
              <div class="field">
                <label class="field__label">Bonos</label>
                <input v-model="newNomina.bonos" type="number" step="0.01" placeholder="0.00" class="field__input" />
              </div>
              <div class="field">
                <label class="field__label field__label--red">Descuentos</label>
                <input v-model="newNomina.descuentos" type="number" step="0.01" placeholder="0.00" class="field__input field__input--red" />
              </div>
            </div>

            <div class="field">
              <label class="field__label">Observaciones</label>
              <textarea v-model="newNomina.observaciones" rows="2" class="field__input" placeholder="Bono por puntualidad, etc."></textarea>
            </div>
          </div>

          <div class="modal__actions">
            <button @click="showGenerateModal = false" class="btn btn--ghost">Cancelar</button>
            <button @click="procesarGeneracion" :disabled="loadingAction" class="btn btn--primary btn--grow">
              <span v-if="loadingAction" class="spinner"></span>
              {{ loadingAction ? 'Procesando…' : 'Generar Nómina' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal: Editar Nómina -->
    <transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal modal--sm">
          <div class="modal__stripe modal__stripe--blue"></div>
          <h3 class="modal__title">Modificar Nómina <span class="modal__id">#{{ editNomina.id }}</span></h3>
          <p class="modal__desc">Ajusta los montos. El total se recalculará en el servidor.</p>

          <div class="modal__body">
            <div class="field">
              <label class="field__label">Horas Totales</label>
              <input v-model="editNomina.horas_totales" type="number" step="0.5" class="field__input" />
            </div>
            <div class="field">
              <label class="field__label">Bonos</label>
              <input v-model="editNomina.bonos" type="number" step="0.01" class="field__input" />
            </div>
            <div class="field">
              <label class="field__label field__label--red">Descuentos</label>
              <input v-model="editNomina.descuentos" type="number" step="0.01" class="field__input field__input--red" />
            </div>
          </div>

          <div class="modal__actions">
            <button @click="showEditModal = false" class="btn btn--ghost">Cancelar</button>
            <button @click="procesarEdicion" :disabled="loadingAction" class="btn btn--blue btn--grow">
              <span v-if="loadingAction" class="spinner"></span>
              {{ loadingAction ? 'Guardando…' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal: Pagar Nómina -->
    <transition name="modal">
      <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
        <div class="modal modal--sm">
          <div class="modal__stripe modal__stripe--green"></div>
          <h3 class="modal__title">Registrar Pago</h3>
          <p class="modal__desc">Marca la nómina como pagada y añade los detalles de la transacción.</p>

          <div class="modal__body">
            <div class="field">
              <label class="field__label">Fecha de Pago</label>
              <input v-model="paymentNomina.fecha_pago" type="date" class="field__input" />
            </div>
            <div class="field">
              <label class="field__label">Método de Pago</label>
              <select v-model="paymentNomina.metodo_pago" class="field__input">
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div class="field">
              <label class="field__label">Referencia <span class="optional">opcional</span></label>
              <input v-model="paymentNomina.referencia_pago" type="text" placeholder="TRX-12345" class="field__input" />
            </div>
            <div class="field">
              <label class="field__label">Observaciones</label>
              <textarea v-model="paymentNomina.observaciones" rows="2" class="field__input"></textarea>
            </div>
          </div>

          <div class="modal__actions">
            <button @click="showPaymentModal = false" class="btn btn--ghost">Cancelar</button>
            <button @click="procesarPago" :disabled="loadingAction" class="btn btn--green btn--grow">
              <span v-if="loadingAction" class="spinner"></span>
              {{ loadingAction ? 'Procesando…' : 'Confirmar Pago' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal: Configurar Empleado -->
    <transition name="modal">
      <div v-if="showEmpConfigModal" class="modal-overlay" @click.self="showEmpConfigModal = false">
        <div class="modal">
          <div class="modal__stripe modal__stripe--indigo"></div>
          <div class="modal__emp-head">
            <div class="modal__emp-avatar">⚙️</div>
            <div>
              <h3 class="modal__title" style="margin-bottom:0.25rem">Configurar Sueldos</h3>
              <p class="modal__desc" style="margin-bottom:0">{{ selectedEmp.name }} · {{ selectedEmp.puesto || 'Empleado' }}</p>
            </div>
          </div>

          <div class="modal__body">
            <div class="field-row">
              <div class="field">
                <label class="field__label">Salario Base Mensual</label>
                <div class="field__prefix-wrap">
                  <span class="field__prefix">$</span>
                  <input v-model="selectedEmp.salario_base" type="number" step="0.01" class="field__input field__input--prefixed" placeholder="0.00" />
                </div>
                <p class="field__hint">Sueldo fijo sin horas extras ni comisiones.</p>
              </div>
              <div class="field">
                <label class="field__label">Valor por Hora</label>
                <div class="field__prefix-wrap">
                  <span class="field__prefix">$</span>
                  <input v-model="selectedEmp.salario_por_hora" type="number" step="0.01" class="field__input field__input--prefixed" placeholder="0.00" />
                </div>
                <p class="field__hint">Monto por cada hora registrada.</p>
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label class="field__label">Comisión por Ventas</label>
                <div class="field__suffix-wrap">
                  <input v-model="selectedEmp.comision_por_venta" type="number" step="0.01" class="field__input field__input--suffixed" placeholder="0.00" />
                  <span class="field__suffix">%</span>
                </div>
                <p class="field__hint">Porcentaje de ventas que recibe.</p>
              </div>
              <div class="field field--centered">
                <label class="field__label">Estado</label>
                <label class="toggle-label">
                  <div class="toggle-wrap">
                    <input type="checkbox" v-model="selectedEmp.activo" class="toggle-input">
                    <div class="toggle-track">
                      <div class="toggle-thumb"></div>
                    </div>
                  </div>
                  <span class="toggle-text">{{ selectedEmp.activo ? 'Empleado Activo' : 'Inactivo' }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal__actions">
            <button @click="showEmpConfigModal = false" class="btn btn--ghost">Cancelar</button>
            <button @click="procesarEmpConfig" :disabled="loadingAction" class="btn btn--primary btn--grow">
              <span v-if="loadingAction" class="spinner"></span>
              {{ loadingAction ? 'Guardando…' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch, nextTick, computed } from 'vue'
import { apiClient } from '@/utils/apiClient'

// --- Charts ---
const chartTendencia = ref(null)
const chartComposicion = ref(null)
let tendenciaInst = null
let composicionInst = null

// --- Toasts ---
const toasts = ref([])
const showToast = (message, type = 'success') => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 4000)
}

// --- Auth ---
const isAuthenticated = ref(false)
const verifying = ref(false)
const password = ref('')
const authError = ref('')

const verifyPassword = async () => {
  if (!password.value) return
  verifying.value = true
  authError.value = ''
  try {
    const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (!userRaw) { authError.value = 'Sesión no encontrada. Reinicia sesión.'; return }
    let user = {}
    try { user = JSON.parse(userRaw) } catch { authError.value = 'Error en datos de sesión.'; return }
    if (!user) { authError.value = 'Usuario no válido.'; return }
    const resp = await apiClient.post('/login', {
      login: user.email || user.username || user.usuario || user.name || '',
      password: password.value
    })
    if (resp.success || resp.data?.token || resp.token) {
      const newToken = resp.data?.token || resp.token
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage
      storage.setItem('token', newToken)
      sessionStorage.setItem('nomina_unlocked', 'true')
      isAuthenticated.value = true
      initData()
    } else {
      authError.value = 'Contraseña incorrecta.'
    }
  } catch { authError.value = 'Error al verificar. Revisa tu conexión.' }
  finally { verifying.value = false; password.value = '' }
}

// --- State ---
const nominas = ref([])
const empleados = ref([])
const loadingTable = ref(false)
const loadingAction = ref(false)
const filterYear = ref(new Date().getFullYear())
const filterEmpleado = ref('')
const activeMainTab = ref('historial')
const nominaConfig = ref(null)

const showGenerateModal = ref(false)
const showEditModal = ref(false)
const showPaymentModal = ref(false)
const showEmpConfigModal = ref(false)

const getTenantHeader = () => {
  const restId = localStorage.getItem('restaurante_id_activo') || localStorage.getItem('restaurante_activo')
  return restId ? { 'X-Restaurante-Id': String(restId) } : {}
}

const stats = reactive({ total_nominas: 0, total_pagado: 0, total_pendiente: 0, pendientes: 0, pagadas: 0 })

const newNomina = reactive({
  user_id: '',
  inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  fin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  valor_hora: '', salario_base: '', comision_ventas: '', bonos: '', descuentos: '', observaciones: ''
})

const editNomina = reactive({ id: null, bonos: '', descuentos: '', horas_totales: '' })
const paymentNomina = reactive({ id: null, fecha_pago: '', metodo_pago: 'Efectivo', referencia_pago: '', observaciones: '' })
const selectedEmp = reactive({ id: null, name: '', puesto: '', salario_base: 0, salario_por_hora: 0, comision_por_venta: 0, activo: true })

// --- Computed ---
const statsPorEmpleado = computed(() => {
  const map = {}
  nominas.value.forEach(n => {
    const name = n.user?.name || `Usuario #${n.user_id}`
    if (!map[name]) map[name] = { total: 0, count: 0, base: 0, variables: 0 }
    const total = Number(n.pago_total || n.monto_total || 0)
    const base = Number(n.salario_base || 0)
    map[name].total += total
    map[name].base += base
    map[name].variables += (total - base)
    map[name].count++
  })
  return Object.entries(map).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.total - a.total)
})

const nominasActuales = computed(() => {
  const hoy = new Date()
  return nominas.value.filter(n => {
    const fin = new Date(n.periodo_fin + 'T00:00:00')
    return fin.getMonth() === hoy.getMonth() && fin.getFullYear() === hoy.getFullYear()
  })
})

const montoTotalMesActual = computed(() =>
  nominasActuales.value.reduce((acc, n) => acc + Number(n.pago_total || n.monto_total || 0), 0)
)

const totalSueldosBase = computed(() =>
  empleados.value.reduce((acc, emp) => acc + Number(emp.salario_base || 0), 0)
)

// --- Data Loading ---
const initData = async () => {
  await loadEmpleados(); await loadResumen(); await loadNominas(); await loadConfig()
}

const loadConfig = async () => {
  try {
    const resp = await apiClient.get('/nomina/configuracion', { headers: getTenantHeader() })
    if (resp.success) nominaConfig.value = resp.data
  } catch (err) { console.error(err) }
}

const loadEmpleados = async () => {
  try {
    const resp = await apiClient.get('/empleados', { headers: getTenantHeader() })
    if (resp.success) empleados.value = resp.data || []
  } catch (err) { console.error(err) }
}

const loadResumen = async () => {
  try {
    const resp = await apiClient.get('/nominas/resumen', { headers: getTenantHeader() })
    if (resp.success && resp.data) {
      stats.total_nominas = resp.data.total_nominas || 0
      stats.total_pagado = resp.data.total_pagado || 0
      stats.total_pendiente = resp.data.total_pendiente || 0
      stats.pendientes = resp.data.por_estado?.PENDIENTE || 0
      stats.pagadas = resp.data.por_estado?.PAGADA || 0
    }
  } catch (err) { console.error(err) }
}

const loadNominas = async () => {
  loadingTable.value = true
  try {
    let url = `/nominas?fecha_desde=${filterYear.value}-01-01&fecha_hasta=${filterYear.value}-12-31`
    if (filterEmpleado.value) url += `&user_id=${filterEmpleado.value}`
    const resp = await apiClient.get(url, { headers: getTenantHeader() })
    if (resp.success) {
      const d = resp.data?.data || resp.data || []
      nominas.value = Array.isArray(d) ? d : []
    }
  } catch (err) {
    console.error(err)
    if (err.response?.status === 401) {
      isAuthenticated.value = false
      sessionStorage.removeItem('nomina_unlocked')
      authError.value = 'Sesión expirada. Vuelve a ingresar tu contraseña.'
    }
  } finally { loadingTable.value = false }
}

watch([filterYear, filterEmpleado], () => { if (isAuthenticated.value) loadNominas() })

// --- Actions ---
const procesarGeneracion = async () => {
  if (!newNomina.user_id || !newNomina.inicio || !newNomina.fin) {
    showToast('Selecciona un empleado y el rango de fechas.', 'error'); return
  }
  loadingAction.value = true
  try {
    const payload = { user_id: newNomina.user_id, periodo_inicio: newNomina.inicio, periodo_fin: newNomina.fin }
    if (newNomina.valor_hora !== '') payload.valor_hora = Number(newNomina.valor_hora)
    if (newNomina.salario_base !== '') payload.salario_base = Number(newNomina.salario_base)
    if (newNomina.comision_ventas !== '') payload.comision_ventas = Number(newNomina.comision_ventas)
    if (newNomina.bonos !== '') payload.bonos = Number(newNomina.bonos)
    if (newNomina.descuentos !== '') payload.descuentos = Number(newNomina.descuentos)
    if (newNomina.observaciones !== '') payload.observaciones = newNomina.observaciones
    const resp = await apiClient.post('/nominas/generar', payload, { headers: getTenantHeader() })
    if (resp.success) {
      showToast('Nómina generada correctamente.')
      showGenerateModal.value = false
      Object.assign(newNomina, { user_id: '', valor_hora: '', salario_base: '', comision_ventas: '', bonos: '', descuentos: '', observaciones: '' })
      loadNominas(); loadResumen()
    } else { showToast(resp.message || 'No se pudo generar la nómina.', 'error') }
  } catch { showToast('Error de conexión con el servidor.', 'error') }
  finally { loadingAction.value = false }
}

const abrirEditModal = (n) => {
  Object.assign(editNomina, { id: n.id, bonos: n.bonos || 0, descuentos: n.descuentos || 0, horas_totales: n.horas_totales || 0 })
  showEditModal.value = true
}

const procesarEdicion = async () => {
  loadingAction.value = true
  try {
    const resp = await apiClient.put(`/nominas/${editNomina.id}`, {
      bonos: Number(editNomina.bonos), descuentos: Number(editNomina.descuentos), horas_totales: Number(editNomina.horas_totales)
    }, { headers: getTenantHeader() })
    if (resp.success) { showToast('Nómina actualizada.'); showEditModal.value = false; loadNominas(); loadResumen() }
    else showToast(resp.message || 'No se pudo actualizar.', 'error')
  } catch { showToast('Error de conexión.', 'error') }
  finally { loadingAction.value = false }
}

const abrirPaymentModal = (n) => {
  Object.assign(paymentNomina, { id: n.id, fecha_pago: new Date().toISOString().split('T')[0], metodo_pago: 'Efectivo', referencia_pago: '', observaciones: '' })
  showPaymentModal.value = true
}

const procesarPago = async () => {
  loadingAction.value = true
  try {
    const resp = await apiClient.put(`/nominas/${paymentNomina.id}/estado`, {
      estado: 'PAGADA', fecha_pago: paymentNomina.fecha_pago, metodo_pago: paymentNomina.metodo_pago,
      referencia_pago: paymentNomina.referencia_pago, observaciones: paymentNomina.observaciones
    }, { headers: getTenantHeader() })
    if (resp.success) { showToast('Nómina pagada exitosamente.'); showPaymentModal.value = false; loadNominas(); loadResumen() }
    else showToast(resp.message || 'No se pudo registrar el pago.', 'error')
  } catch { showToast('Error de conexión.', 'error') }
  finally { loadingAction.value = false }
}

const verDetalle = (n) => {
  let msg = `Nómina #${n.id} — ${n.user?.name || ''}\nPeriodo: ${formatDateRange(n.periodo_inicio, n.periodo_fin)}\nEstado: ${n.estado}\n\nHoras: ${n.horas_totales}h\nBase: $${n.salario_base}`
  if (n.comision_ventas > 0) msg += `\nComisiones: $${n.comision_ventas}`
  if (n.bonos > 0) msg += `\nBonos: +$${n.bonos}`
  if (n.descuentos > 0) msg += `\nDescuentos: -$${n.descuentos}`
  msg += `\nTotal: $${n.pago_total || n.monto_total}`
  if (n.estado === 'PAGADA') msg += `\n\nMétodo: ${n.metodo_pago || 'N/E'}\nFecha pago: ${n.fecha_pago || 'N/E'}`
  if (n.observaciones) msg += `\n\nObs: ${n.observaciones}`
  alert(msg)
}

const abrirEmpConfigModal = (emp) => {
  Object.assign(selectedEmp, { id: emp.id, name: emp.name, puesto: emp.puesto, salario_base: emp.salario_base || 0, salario_por_hora: emp.salario_por_hora || 0, comision_por_venta: emp.comision_por_venta || 0, activo: !!emp.activo })
  showEmpConfigModal.value = true
}

const procesarEmpConfig = async () => {
  loadingAction.value = true
  try {
    const resp = await apiClient.put(`/empleados/${selectedEmp.id}`, {
      salario_base: Number(selectedEmp.salario_base), salario_por_hora: Number(selectedEmp.salario_por_hora),
      comision_por_venta: Number(selectedEmp.comision_por_venta), activo: selectedEmp.activo ? 1 : 0
    }, { headers: getTenantHeader() })
    if (resp.success) { showToast(`Configuración de ${selectedEmp.name} guardada.`); showEmpConfigModal.value = false; loadEmpleados() }
    else showToast(resp.message || 'No se pudo actualizar.', 'error')
  } catch { showToast('Error de conexión.', 'error') }
  finally { loadingAction.value = false }
}

// --- Charts ---
const loadChartJS = () => new Promise(resolve => {
  if (window.Chart) { resolve(); return }
  const s = document.createElement('script')
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
  s.onload = resolve; document.head.appendChild(s)
})

const updateCharts = async () => {
  await loadChartJS()
  if (!chartTendencia.value || !chartComposicion.value) return
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const datosMensuales = Array(12).fill(0)
  const datosBase = Array(12).fill(0)
  const datosVariables = Array(12).fill(0)
  nominas.value.forEach(n => {
    const idx = new Date(n.periodo_inicio + 'T00:00:00').getMonth()
    const total = Number(n.pago_total || n.monto_total || 0)
    const base = Number(n.salario_base || 0)
    datosMensuales[idx] += total; datosBase[idx] += base; datosVariables[idx] += (total - base)
  })
  if (tendenciaInst) tendenciaInst.destroy()
  if (composicionInst) composicionInst.destroy()
  const baseOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, usePointStyle: true, font: { size: 10, weight: '600' }, color: '#64748b' } } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { size: 10 }, color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94a3b8' } }
    }
  }
  tendenciaInst = new window.Chart(chartTendencia.value, {
    type: 'line',
    data: {
      labels: meses,
      datasets: [{ label: 'Total', data: datosMensuales, borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.06)', fill: true, tension: 0.4, borderWidth: 3, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: '#4f46e5' }]
    },
    options: { ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: false } } }
  })
  composicionInst = new window.Chart(chartComposicion.value, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [
        { label: 'Sueldo Base', data: datosBase, backgroundColor: '#4f46e5', borderRadius: 4, barThickness: 14 },
        { label: 'Bonos/Comisiones', data: datosVariables, backgroundColor: '#10b981', borderRadius: 4, barThickness: 14 }
      ]
    },
    options: { ...baseOpts, scales: { ...baseOpts.scales, y: { ...baseOpts.scales.y, stacked: true }, x: { ...baseOpts.scales.x, stacked: true } } }
  })
}

watch(nominas, () => nextTick(updateCharts))

// --- Utils ---
const formatDateRange = (start, end) => {
  if (!start || !end) return 'Periodo N/A'
  const opts = { day: 'numeric', month: 'short' }
  const s = new Date(start).toLocaleDateString('es-MX', opts)
  const e = new Date(end).toLocaleDateString('es-MX', opts)
  const y = new Date(start).getFullYear()
  return `${s} – ${e}, ${y}`
}

const statusClass = (s) => ({
  'PAGADA': 'badge--green',
  'PENDIENTE': 'badge--warn',
  'ANULADA': 'badge--red',
  'CANCELADA': 'badge--red',
}[s] || 'badge--neutral')

onMounted(() => {
  if (sessionStorage.getItem('nomina_unlocked') === 'true') {
    isAuthenticated.value = true; initData()
  }
})
</script>

<style scoped>
/* ─── Reset & tokens ─────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.nomina-root {
  --c-bg:        #f8fafc;
  --c-surface:   #ffffff;
  --c-border:    #e9edf2;
  --c-border-2:  #d1d9e0;
  --c-text:      #0f172a;
  --c-text-2:    #475569;
  --c-text-3:    #94a3b8;
  --c-indigo:    #4f46e5;
  --c-indigo-lt: #eef2ff;
  --c-green:     #059669;
  --c-green-lt:  #d1fae5;
  --c-amber:     #d97706;
  --c-amber-lt:  #fef3c7;
  --c-red:       #dc2626;
  --c-red-lt:    #fee2e2;
  --c-blue:      #2563eb;
  --c-blue-lt:   #dbeafe;
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   18px;
  --radius-xl:   24px;
  --shadow-sm:   0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
  --shadow-md:   0 4px 16px rgba(0,0,0,.08);
  --shadow-lg:   0 12px 40px rgba(0,0,0,.12);
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--c-bg);
  color: var(--c-text);
  min-height: 100vh;
}

/* ─── Toast ───────────────────────────────────────────────────────────── */
.toast-stack {
  position: fixed; top: 1.25rem; right: 1.25rem;
  z-index: 300; display: flex; flex-direction: column; gap: .625rem;
  pointer-events: none;
}
.toast {
  display: flex; align-items: center; gap: .625rem;
  padding: .75rem 1.125rem;
  border-radius: var(--radius-md);
  font-size: .8125rem; font-weight: 600;
  box-shadow: var(--shadow-md);
  pointer-events: auto;
  animation: slideIn .25s ease;
  min-width: 260px;
}
.toast--success { background: #f0fdf4; border-left: 3px solid var(--c-green); color: #166534; }
.toast--error   { background: #fef2f2; border-left: 3px solid var(--c-red);   color: #991b1b; }
.toast__icon    { font-size: .875rem; }
@keyframes slideIn { from { opacity:0; transform: translateX(1rem); } to { opacity:1; transform: none; } }

/* ─── Auth overlay ───────────────────────────────────────────────────── */
.auth-overlay {
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: center; justify-content: center;
  background: rgba(15,23,42,.75); backdrop-filter: blur(6px);
  padding: 1rem;
}
.auth-card {
  width: 100%; max-width: 420px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-lg);
  text-align: center;
}
.auth-card__icon {
  width: 3.5rem; height: 3.5rem;
  background: var(--c-indigo-lt);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; margin: 0 auto 1.25rem;
}
.auth-card__title { font-size: 1.375rem; font-weight: 800; margin-bottom: .5rem; }
.auth-card__desc  { font-size: .8125rem; color: var(--c-text-2); margin-bottom: 1.75rem; line-height: 1.6; }
.auth-form        { display: flex; flex-direction: column; gap: 1rem; text-align: left; }
.auth-error       { font-size: .8125rem; color: var(--c-red); font-weight: 600; text-align: center; }

/* ─── Shell ──────────────────────────────────────────────────────────── */
.shell { max-width: 1280px; margin: 0 auto; padding: 2rem 1.5rem 4rem; display: flex; flex-direction: column; gap: 1.75rem; }

/* ─── Page header ─────────────────────────────────────────────────────── */
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 1rem;
}
.page-header__eyebrow { font-size: .6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--c-indigo); margin-bottom: .375rem; }
.page-header__title   { font-size: 1.875rem; font-weight: 900; letter-spacing: -.03em; }
.page-header__right   { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }

/* ─── Tab switcher ───────────────────────────────────────────────────── */
.tab-switcher {
  display: flex;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: .25rem;
  gap: .25rem;
  box-shadow: var(--shadow-sm);
}
.tab-switcher__btn {
  padding: .5rem 1.125rem;
  border: none; background: transparent; cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: .75rem; font-weight: 700;
  color: var(--c-text-3); transition: all .15s;
  display: flex; align-items: center; gap: .4rem;
}
.tab-switcher__btn--active { background: var(--c-indigo-lt); color: var(--c-indigo); }
.tab-switcher__btn:not(.tab-switcher__btn--active):hover { color: var(--c-text-2); background: var(--c-bg); }

/* ─── Buttons ─────────────────────────────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .625rem 1.25rem;
  border: none; border-radius: var(--radius-md);
  font-size: .8125rem; font-weight: 700; cursor: pointer;
  transition: all .15s; white-space: nowrap;
}
.btn--primary { background: var(--c-indigo); color: #fff; }
.btn--primary:hover:not(:disabled) { background: #4338ca; }
.btn--blue    { background: var(--c-blue); color: #fff; }
.btn--blue:hover:not(:disabled) { background: #1d4ed8; }
.btn--green   { background: var(--c-green); color: #fff; }
.btn--green:hover:not(:disabled) { background: #047857; }
.btn--ghost   { background: var(--c-bg); color: var(--c-text-2); border: 1px solid var(--c-border); }
.btn--ghost:hover { background: var(--c-border); }
.btn--full    { width: 100%; justify-content: center; }
.btn--grow    { flex: 2; justify-content: center; }
.btn:disabled { opacity: .5; cursor: not-allowed; }

/* ─── Banner mes actual ──────────────────────────────────────────────── */
.banner-mes {
  background: var(--c-indigo-lt);
  border: 1px solid #c7d2fe;
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 1rem;
}
.banner-mes__left  { display: flex; align-items: center; gap: .875rem; }
.banner-mes__icon  { font-size: 1.5rem; }
.banner-mes__title { font-size: .9375rem; font-weight: 800; color: #312e81; }
.banner-mes__sub   { font-size: .75rem; color: #4338ca; margin-top: .2rem; }
.banner-mes__stat  { text-align: right; }

/* ─── KPI cards ──────────────────────────────────────────────────────── */
.kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
.kpi-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}
.kpi-card__label { font-size: .6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--c-text-3); margin-bottom: .5rem; }
.kpi-card__value { font-size: 2rem; font-weight: 900; letter-spacing: -.04em; }
.kpi-card__foot  { font-size: .75rem; font-weight: 700; margin-top: .625rem; }
.kpi-card__foot--warn { color: var(--c-amber); }
.kpi-card__foot--ok   { color: var(--c-green); }
.kpi-card__foot--info { color: var(--c-indigo); }

/* ─── Panels ─────────────────────────────────────────────────────────── */
.panel {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.panel__header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--c-border);
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: .75rem;
}
.panel__title    { font-size: 1rem; font-weight: 800; }
.panel__subtitle { font-size: .75rem; color: var(--c-text-3); margin-top: .2rem; }
.panel__controls { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }

/* ─── Select ─────────────────────────────────────────────────────────── */
.select {
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  padding: .45rem .875rem;
  font-size: .75rem; font-weight: 600; color: var(--c-text-2);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right .6rem center;
  padding-right: 2rem;
}

/* ─── Table ──────────────────────────────────────────────────────────── */
.table-wrap { overflow-x: auto; }
.data-table {
  width: 100%; border-collapse: collapse; font-size: .8125rem;
}
.data-table thead tr {
  background: #f8fafc;
}
.data-table th {
  padding: .875rem 1.25rem;
  text-align: left;
  font-size: .6875rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: .08em;
  color: var(--c-text-3);
  border-bottom: 1px solid var(--c-border);
  white-space: nowrap;
}
.data-table tbody tr { border-bottom: 1px solid var(--c-bg); transition: background .1s; }
.data-table tbody tr:last-child { border-bottom: none; }
.data-table tbody tr:hover { background: #f8fafc; }
.data-table td { padding: 1rem 1.25rem; vertical-align: top; }
.text-right { text-align: right !important; }
.table-empty { text-align: center; color: var(--c-text-3); font-style: italic; padding: 3rem !important; }

.cell-primary         { font-weight: 700; }
.cell-primary--accent { color: var(--c-indigo); }
.cell-secondary       { font-size: .6875rem; color: var(--c-text-3); margin-top: .2rem; }
.cell-total           { font-size: 1rem; font-weight: 900; letter-spacing: -.02em; }
.breakdown-cell { display: flex; flex-direction: column; gap: .25rem; }
.breakdown-item     { color: var(--c-text-2); }
.breakdown-item--ok  { color: var(--c-green); }
.breakdown-item--neg { color: var(--c-red); }

/* ─── Badges ─────────────────────────────────────────────────────────── */
.badge {
  display: inline-block;
  padding: .25rem .625rem;
  border-radius: 99px;
  font-size: .625rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: .06em;
  white-space: nowrap;
}
.badge--green   { background: var(--c-green-lt); color: #065f46; }
.badge--warn    { background: var(--c-amber-lt); color: #92400e; }
.badge--red     { background: var(--c-red-lt);   color: #991b1b; }
.badge--indigo  { background: var(--c-indigo-lt); color: #3730a3; }
.badge--neutral { background: #f1f5f9; color: var(--c-text-2); }

/* ─── Icon buttons ────────────────────────────────────────────────────── */
.icon-btn {
  width: 2rem; height: 2rem;
  display: inline-flex; align-items: center; justify-content: center;
  border: none; border-radius: var(--radius-sm);
  cursor: pointer; transition: all .15s;
}
.icon-btn .icon { width: 1rem; height: 1rem; }
.icon-btn--blue   { color: var(--c-blue);  background: transparent; } .icon-btn--blue:hover   { background: var(--c-blue-lt); }
.icon-btn--green  { color: var(--c-green); background: transparent; } .icon-btn--green:hover  { background: var(--c-green-lt); }
.icon-btn--indigo { color: var(--c-indigo); background: transparent; } .icon-btn--indigo:hover { background: var(--c-indigo-lt); }
.icon-btn--ghost  { color: var(--c-text-3); background: transparent; } .icon-btn--ghost:hover  { background: var(--c-bg); color: var(--c-indigo); }
.action-group { display: flex; align-items: center; justify-content: flex-end; gap: .25rem; }

/* ─── Charts ─────────────────────────────────────────────────────────── */
.charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; }
.chart-panel .panel__header, .chart-panel > .chart-panel__header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.5rem; border-bottom: 1px solid var(--c-border);
}
.chart-panel__header { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid var(--c-border); }
.chart-panel__icon   { font-size: 1.25rem; opacity: .7; }
.chart-wrap { position: relative; height: 220px; padding: 1rem 1.5rem 1.5rem; }
.chart-loader { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.7); backdrop-filter: blur(2px); z-index: 1; }

/* ─── Employee stats grid ─────────────────────────────────────────────── */
.emp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; padding: 1.5rem; }
.emp-stat-card {
  padding: 1.125rem;
  background: #f8fafc;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  transition: all .15s;
}
.emp-stat-card:hover { background: #fff; box-shadow: var(--shadow-sm); }
.emp-stat-card__top    { display: flex; align-items: center; justify-content: space-between; margin-bottom: .875rem; gap: .5rem; }
.emp-stat-card__name   { font-weight: 700; font-size: .875rem; }
.emp-stat-card__bottom { display: flex; justify-content: space-between; }
.emp-stat-card__total  { font-size: 1.25rem; font-weight: 900; color: var(--c-indigo); letter-spacing: -.02em; }
.emp-stat-card__var    { font-size: .875rem; font-weight: 700; color: var(--c-green); }
.stat-micro-label { font-size: .625rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--c-text-3); margin-bottom: .2rem; }
.stat-micro-value { font-size: 1.125rem; font-weight: 900; color: var(--c-indigo); }

/* ─── Personal layout ────────────────────────────────────────────────── */
.personal-layout { display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; align-items: start; }
@media (max-width: 900px) { .personal-layout { grid-template-columns: 1fr; } }
.personal-sidebar { display: flex; flex-direction: column; gap: 1rem; }

/* Commitment card */
.commitment-card {
  background: var(--c-indigo);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  color: #fff; position: relative; overflow: hidden;
}
.commitment-card__label { font-size: .6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #a5b4fc; margin-bottom: .5rem; }
.commitment-card__value { font-size: 2rem; font-weight: 900; letter-spacing: -.04em; margin-bottom: .375rem; }
.commitment-card__sub   { font-size: .75rem; color: #c7d2fe; margin-bottom: 1.25rem; }
.commitment-card__badge {
  display: inline-flex; align-items: center; gap: .5rem;
  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.15);
  border-radius: var(--radius-sm);
  padding: .4rem .875rem;
  font-size: .6875rem; font-weight: 700;
}

/* Config panel inside sidebar */
.config-panel { padding: 1.25rem 1.5rem; }
.config-row   { display: flex; justify-content: space-between; align-items: center; padding: .5rem 0; border-bottom: 1px solid var(--c-bg); }
.config-row:last-of-type { border-bottom: none; }
.config-row__label { font-size: .8125rem; color: var(--c-text-2); }
.config-row__val   { font-weight: 700; font-size: .875rem; color: var(--c-indigo); }
.config-row__val--green { color: var(--c-green); }
.config-panel__note { font-size: .6875rem; color: var(--c-text-3); font-style: italic; line-height: 1.5; margin-top: 1rem; }

/* Employee cards */
.emp-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.emp-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all .2s;
  border-left-width: 4px;
  box-shadow: var(--shadow-sm);
}
.emp-card--active   { border-left-color: var(--c-indigo); }
.emp-card--inactive { border-left-color: var(--c-border-2); opacity: .75; }
.emp-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.emp-card__head    { display: flex; align-items: center; gap: .875rem; margin-bottom: 1.25rem; }
.emp-card__avatar  { width: 3rem; height: 3rem; background: #f1f5f9; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
.emp-card__info    { flex: 1; }
.emp-card__name    { font-size: 1rem; font-weight: 800; margin-bottom: .375rem; }
.emp-card__tags    { display: flex; gap: .375rem; flex-wrap: wrap; }
.emp-card__stats   { display: grid; grid-template-columns: 1fr 1fr 1fr; background: var(--c-bg); border: 1px solid var(--c-border); border-radius: var(--radius-md); padding: .875rem; gap: .5rem; margin-bottom: .875rem; }
.emp-card__stat         { text-align: center; }
.emp-card__stat--divider{ border-left: 1px solid var(--c-border); border-right: 1px solid var(--c-border); }
.emp-card__stat-label   { font-size: .6rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--c-text-3); margin-bottom: .3rem; }
.emp-card__stat-val     { font-size: .9375rem; font-weight: 900; }
.emp-card__stat-val--accent { color: var(--c-indigo); }
.emp-card__stat-val--green  { color: var(--c-green); }
.emp-card__footer { font-size: .6875rem; color: var(--c-text-3); }

/* ─── Modals ─────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 250;
  display: flex; align-items: center; justify-content: center;
  background: rgba(15,23,42,.6); backdrop-filter: blur(4px);
  padding: 1rem;
}
.modal {
  width: 100%; max-width: 580px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-xl);
  padding: 2rem;
  box-shadow: var(--shadow-lg);
  position: relative; overflow: hidden;
  max-height: 90vh; overflow-y: auto;
}
.modal--sm { max-width: 440px; }
.modal__stripe { height: 3px; position: absolute; top: 0; left: 0; right: 0; }
.modal__stripe--indigo { background: var(--c-indigo); }
.modal__stripe--blue   { background: var(--c-blue); }
.modal__stripe--green  { background: var(--c-green); }
.modal__title   { font-size: 1.25rem; font-weight: 900; margin-bottom: .375rem; }
.modal__id      { color: var(--c-text-3); font-weight: 500; font-size: 1rem; }
.modal__desc    { font-size: .8125rem; color: var(--c-text-2); margin-bottom: 1.5rem; line-height: 1.6; }
.modal__body    { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
.modal__actions { display: flex; gap: .75rem; }
.modal__emp-head { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.modal__emp-avatar { width: 3rem; height: 3rem; background: var(--c-indigo-lt); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.375rem; flex-shrink: 0; }

/* ─── Fields ─────────────────────────────────────────────────────────── */
.field { display: flex; flex-direction: column; gap: .4rem; }
.field-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.field-row--3 { grid-template-columns: 1fr 1fr 1fr; }
@media (max-width: 520px) { .field-row, .field-row--3 { grid-template-columns: 1fr; } }
.field--centered { justify-content: flex-end; }
.field__label     { font-size: .6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--c-text-3); }
.field__label--red { color: var(--c-red); }
.field__hint       { font-size: .6875rem; color: var(--c-text-3); font-style: italic; margin-top: .2rem; }
.optional          { font-weight: 400; text-transform: none; letter-spacing: 0; font-style: italic; color: var(--c-text-3); }
.field__input {
  padding: .625rem .875rem;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  font-size: .875rem; color: var(--c-text);
  transition: all .15s;
  width: 100%; outline: none;
}
.field__input:focus { border-color: var(--c-indigo); background: #fff; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
.field__input--red:focus { border-color: var(--c-red); box-shadow: 0 0 0 3px rgba(220,38,38,.1); }
.field__input--red { color: var(--c-red); }
textarea.field__input { resize: vertical; min-height: 72px; }
.field__prefix-wrap, .field__suffix-wrap { position: relative; }
.field__prefix { position: absolute; left: .75rem; top: 50%; transform: translateY(-50%); font-weight: 600; color: var(--c-text-3); pointer-events: none; }
.field__suffix { position: absolute; right: .75rem; top: 50%; transform: translateY(-50%); font-weight: 600; color: var(--c-text-3); pointer-events: none; }
.field__input--prefixed { padding-left: 1.75rem; }
.field__input--suffixed { padding-right: 1.75rem; }

/* ─── Toggle ─────────────────────────────────────────────────────────── */
.toggle-label  { display: flex; align-items: center; gap: .75rem; cursor: pointer; padding: .625rem .875rem; background: var(--c-bg); border: 1px solid var(--c-border); border-radius: var(--radius-sm); transition: all .15s; }
.toggle-label:hover { border-color: var(--c-indigo); }
.toggle-wrap   { position: relative; }
.toggle-input  { position: absolute; opacity: 0; width: 0; height: 0; }
.toggle-track  { width: 2.5rem; height: 1.375rem; background: #cbd5e1; border-radius: 99px; transition: background .2s; }
.toggle-thumb  { width: 1rem; height: 1rem; background: #fff; border-radius: 50%; position: absolute; top: .1875rem; left: .1875rem; transition: transform .2s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.toggle-input:checked ~ .toggle-track { background: var(--c-indigo); }
.toggle-input:checked + .toggle-track .toggle-thumb { transform: translateX(1.125rem); }
/* Fix: JS-based toggle */
.toggle-text { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--c-text-2); }

/* ─── Spinner ─────────────────────────────────────────────────────────── */
.spinner {
  width: 1rem; height: 1rem;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
}
.spinner--lg { width: 1.75rem; height: 1.75rem; border-width: 3px; border-color: #e0e7ff; border-top-color: var(--c-indigo); }
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Transitions ─────────────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
.modal-enter-active { transition: opacity .2s, transform .2s; }
.modal-leave-active { transition: opacity .15s, transform .15s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal { transform: scale(.96) translateY(.5rem); }
.modal-leave-to   .modal { transform: scale(.96) translateY(.5rem); }
</style>