<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Movimiento de efectivo</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <div class="type-selector">
        <button 
          @click="form.tipo = 'ingreso'"
          :class="['type-btn', 'btn-in', { 'active': form.tipo === 'ingreso' }]"
        >
          <span class="icon">↑</span> Entrada
        </button>
        <button 
          @click="form.tipo = 'egreso'"
          :class="['type-btn', 'btn-out', { 'active': form.tipo === 'egreso' }]"
        >
          <span class="icon">↓</span> Salida
        </button>
      </div>

      <div v-if="error" class="alert-error">
        {{ error }}
      </div>

      <div class="form-body">
        <div class="input-group">
          <label class="input-label">Monto</label>
          <div class="input-wrapper">
            <span class="currency-symbol">$</span>
            <input 
              v-model="form.monto" 
              type="number" 
              min="0.01" 
              step="0.01" 
              placeholder="0.00"
              class="form-input pl-money" 
            />
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">Concepto</label>
          <input 
            v-model="form.concepto" 
            type="text" 
            placeholder="Ej. Pago a proveedor..."
            class="form-input" 
          />
        </div>

        <div class="modal-actions">
          <button @click="$emit('close')" class="btn-cancel">
            Cancelar
          </button>
          <button 
            @click="guardar" 
            :disabled="loading || !form.monto || !form.concepto"
            :class="['btn-submit', form.tipo === 'ingreso' ? 'bg-in' : 'bg-out']"
          >
            {{ loading ? 'Registrando...' : `Registrar ${form.tipo === 'ingreso' ? 'Entrada' : 'Salida'}` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* Fondo y Contenedor */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  background: white;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Encabezado */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.close-btn:hover { color: #475569; }

/* Selector Tipo */
.type-selector {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.type-btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.85rem;
  font-size: 0.875rem;
  font-weight: 700;
  border: 2px solid #f1f5f9;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Estados Activos Selector */
.btn-in.active {
  border-color: #10b981;
  background-color: #ecfdf5;
  color: #065f46;
}

.btn-out.active {
  border-color: #ef4444;
  background-color: #fef2f2;
  color: #991b1b;
}

/* Inputs */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  letter-spacing: 0.025em;
}

.input-wrapper { position: relative; }

.currency-symbol {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  transition: all 0.2s;
  box-sizing: border-box; /* Crucial para que el padding no rompa el ancho */
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.pl-money { padding-left: 2rem; }

/* Botones Acción */
.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-cancel {
  flex: 1;
  padding: 0.85rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit {
  flex: 2;
  padding: 0.85rem;
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.bg-in { background-color: #10b981; }
.bg-out { background-color: #ef4444; }

/* Error Alert */
.alert-error {
  padding: 0.75rem;
  background-color: #fef2f2;
  color: #b91c1c;
  border-radius: 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
<script setup>
import { reactive, ref } from 'vue'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

const emit = defineEmits(['close', 'saved'])

const form    = reactive({ tipo: 'ingreso', monto: '', concepto: '' })
const loading = ref(false)
const error   = ref('')

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 'Content-Type':'application/json', Accept:'application/json', Authorization: token ? `Bearer ${token}` : '' }
}

const guardar = async () => {
  error.value = ''
  if (!form.monto || Number(form.monto) <= 0) { error.value = 'El monto debe ser mayor a 0'; return }
  if (!form.concepto.trim()) { error.value = 'El concepto es obligatorio'; return }
  loading.value = true
  try {
    const res  = await fetch(`${API_URL}/caja/movimientos`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ tipo: form.tipo, monto: Number(form.monto), descripcion: form.concepto.trim(), referencia: 'MOV-MANUAL' }),
    })
    const data = await res.json()
    if (res.ok && data.success) {
      emit('saved', { tipo: form.tipo, monto: Number(form.monto) })
    } else {
      error.value = data.message || 'Error al registrar'
    }
  } catch { error.value = 'Error de conexión' }
  finally { loading.value = false }
}
</script>