<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <div class="flex items-center gap-2">
          <span class="text-2xl">✂️</span>
          <h3 class="modal-title">Realizar Corte X</h3>
        </div>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <div class="alert-info">
        Este movimiento registrará un retiro de efectivo bajo el concepto de <strong>CORTE X</strong>.
      </div>

      <div v-if="error" class="alert-error">
        {{ error }}
      </div>

      <div class="form-body">
        <div class="input-group">
          <label class="input-label">Monto a retirar de caja</label>
          <div class="input-wrapper">
            <span class="currency-symbol">$</span>
            <input 
              v-model="form.monto" 
              type="number" 
              min="0.01" 
              step="0.01" 
              placeholder="0.00"
              autofocus
              class="form-input pl-money" 
              @keyup.enter="guardar"
            />
          </div>
        </div>

        <div class="input-group opacity-60 pointer-events-none">
          <label class="input-label">Concepto fijo</label>
          <input 
            value="CORTE X" 
            readonly
            type="text" 
            class="form-input bg-gray-50" 
          />
        </div>

        <div class="modal-actions">
          <button @click="$emit('close')" class="btn-cancel">
            Cancelar
          </button>
          <button 
            @click="guardar" 
            :disabled="loading || !form.monto || form.monto <= 0"
            class="btn-submit bg-blue"
          >
            {{ loading ? 'Procesando...' : 'Confirmar Retiro (Corte X)' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { apiClient } from '@/utils/apiClient'

const emit = defineEmits(['close', 'saved'])

const form    = reactive({ monto: '' })
const loading = ref(false)
const error   = ref('')

const guardar = async () => {
  error.value = ''
  const montoNum = Number(form.monto)
  
  if (!form.monto || montoNum <= 0) {
    error.value = 'Ingresa un monto válido mayor a 0'
    return
  }

  loading.value = true
  try {
    const data = await apiClient.post('/caja/movimientos', {
      tipo: 'egreso',
      monto: montoNum,
      descripcion: 'CORTE X',
      referencia: 'CORTE-X-' + Date.now().toString().slice(-6)
    })

    if (data?.success) {
      emit('saved', { tipo: 'egreso', monto: montoNum, concepto: 'CORTE X' })
    } else {
      error.value = data?.message || 'Error al registrar el Corte X'
    }
  } catch (err) {
    console.error('Error Corte X:', err)
    error.value = 'Error de conexión con el servidor'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  background: white;
  border-radius: 2rem;
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  color: #64748b;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover { background: #e2e8f0; color: #0f172a; }

.alert-info {
  background: #eff6ff;
  border: 1px solid #dbeafe;
  color: #1e40af;
  padding: 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fee2e2;
  color: #b91c1c;
  padding: 0.85rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.form-body { display: flex; flex-direction: column; gap: 1.5rem; }

.input-group { display: flex; flex-direction: column; gap: 0.5rem; }

.input-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper { position: relative; }

.currency-symbol {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-weight: 700;
  font-size: 1.1rem;
}

.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.pl-money { padding-left: 2.5rem; }

.bg-gray-50 { background-color: #f8fafc; }

.modal-actions { display: flex; gap: 1rem; margin-top: 1rem; }

.btn-cancel {
  flex: 1;
  padding: 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; }

.btn-submit {
  flex: 2;
  padding: 1rem;
  border: none;
  border-radius: 1rem;
  color: white;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

.bg-blue { background-color: #3b82f6; }
.btn-submit:not(:disabled):hover { background-color: #2563eb; transform: translateY(-2px); }

@keyframes modalPop {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
