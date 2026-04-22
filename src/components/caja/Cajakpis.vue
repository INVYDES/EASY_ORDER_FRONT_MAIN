<template>
  <div class="kpi-grid">
    <div class="kpi-card br-slate">
      <div class="kpi-content">
        <div class="kpi-icon bg-slate">💵</div>
        <div>
          <p class="kpi-label">Apertura</p>
          <p class="kpi-value text-slate">${{ format(openingAmount) }}</p>
        </div>
      </div>
    </div>

    <div class="kpi-card br-emerald">
      <div class="kpi-content">
        <div class="kpi-icon bg-emerald">💰</div>
        <div>
          <p class="kpi-label">Ventas Efectivo</p>
          <p class="kpi-value text-emerald">${{ format(efectivoSales) }}</p>
        </div>
      </div>
    </div>

    <div class="kpi-card br-blue">
      <div class="kpi-content">
        <div class="kpi-icon bg-blue">💳</div>
        <div>
          <p class="kpi-label">Ventas Tarjeta</p>
          <p class="kpi-value text-blue">${{ format(cardSales) }}</p>
        </div>
      </div>
    </div>

    <div class="kpi-card br-purple">
      <div class="kpi-content">
        <div class="kpi-icon bg-purple">📲</div>
        <div>
          <p class="kpi-label">Transferencias</p>
          <p class="kpi-value text-purple">${{ format(transferSales) }}</p>
        </div>
      </div>
    </div>

    <div class="kpi-card br-sky">
      <div class="kpi-content">
        <div class="kpi-icon bg-sky">🧾</div>
        <div>
          <p class="kpi-label">Efectivo en Caja</p>
          <p class="kpi-value text-sky">${{ format(cashInRegister) }}</p>
        </div>
      </div>
    </div>

    <div class="kpi-card br-amber">
      <div class="kpi-content">
        <div class="kpi-icon bg-amber">✨</div>
        <div>
          <p class="kpi-label">Propinas</p>
          <p class="kpi-value text-amber">${{ format(totalTips) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  openingAmount:    { type: Number, default: 0 },
  cashInRegister:   { type: Number, default: 0 },
  efectivoSales:    { type: Number, default: 0 },
  cardSales:        { type: Number, default: 0 },
  transferSales:    { type: Number, default: 0 },
  totalTips:        { type: Number, default: 0 },
})

const format = (v) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 1024px) {
  .kpi-grid { grid-template-columns: repeat(6, 1fr); }
}

.kpi-card {
  background: white;
  padding: 0.85rem;
  border-radius: 1rem;
  border: 1px solid #f1f5f9;
  border-left: 4px solid #cbd5e1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.kpi-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.kpi-icon {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.kpi-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin: 0;
}

.kpi-value {
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
}

/* --- Variantes de Color --- */
.br-slate { border-left-color: #64748b; }
.bg-slate { background-color: #f1f5f9; }
.text-slate { color: #1e293b; }

.br-emerald { border-left-color: #10b981; }
.bg-emerald { background-color: #ecfdf5; }
.text-emerald { color: #065f46; }

.br-blue { border-left-color: #3b82f6; }
.bg-blue { background-color: #eff6ff; }
.text-blue { color: #1d4ed8; }

.br-purple { border-left-color: #a855f7; }
.bg-purple { background-color: #faf5ff; }
.text-purple { color: #7e22ce; }

.br-sky { border-left-color: #0ea5e9; }
.bg-sky { background-color: #f0f9ff; }
.text-sky { color: #0369a1; }

.br-amber { border-left-color: #f59e0b; }
.bg-amber { background-color: #fffbeb; }
.text-amber { color: #b45309; }
</style>
