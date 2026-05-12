<template>
  <div class="space-y-8">
    <!-- TOASTS -->
    <div class="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-72 pointer-events-auto animate-slide-in',
          toast.type === 'success' ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800'
                                   : 'bg-red-50 border-l-4 border-red-500 text-red-800']">
        <span>{{ toast.type === 'success' ? '✅' : '❌' }}</span>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
      </div>
    </div>
    <!-- Overlay de Autenticación -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="!isAuthenticated" class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm px-4">
        <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              🔐
            </div>
            <h2 class="text-2xl font-bold text-gray-900">Acceso Restringido</h2>
            <p class="text-gray-500 text-sm mt-2">Por seguridad, ingresa tu contraseña para ver la información de nómina.</p>
          </div>

          <form @submit.prevent="verifyPassword" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Contraseña de Administrador</label>
              <input 
                v-model="password" 
                type="password" 
                placeholder="••••••••" 
                required
                class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-lg"
                :disabled="verifying"
              />
            </div>

            <p v-if="authError" class="text-sm text-red-500 text-center font-medium">{{ authError }}</p>

            <button 
              type="submit" 
              :disabled="verifying"
              class="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span v-if="verifying" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ verifying ? 'Verificando...' : 'Desbloquear Nómina' }}
            </button>
          </form>
        </div>
      </div>
    </transition>

    <div v-if="isAuthenticated" class="max-w-7xl mx-auto space-y-8">
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">Gestión de Nóminas</h1>
          <p class="text-gray-500 mt-1">Control de pagos, sueldos y rendimientos del personal.</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
            <button @click="activeMainTab = 'historial'"
              :class="['px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2',
                activeMainTab === 'historial' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700']">
              <i class="fa-solid fa-clock-rotate-left"></i> Historial
            </button>
            <button @click="activeMainTab = 'personal'"
              :class="['px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2',
                activeMainTab === 'personal' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700']">
              <i class="fa-solid fa-users-gear"></i> Personal y Sueldos
            </button>
          </div>
          <button 
            @click="showGenerateModal = true"
            class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition flex items-center gap-2"
          >
            <i class="fa-solid fa-plus"></i> Generar Nómina
          </button>
        </div>
      </div>

      <!-- ══ VISTA HISTORIAL ══ -->
      <template v-if="activeMainTab === 'historial'">
        
        <!-- Resumen Rápido Mes Actual -->
        <div v-if="nominasActuales.length > 0" class="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">
              📅
            </div>
            <div>
              <h4 class="font-bold text-indigo-900">Nóminas del Mes Actual</h4>
              <p class="text-xs text-indigo-600 font-medium">Hay {{ nominasActuales.length }} nóminas registradas para este periodo.</p>
            </div>
          </div>
          <div class="flex gap-2">
            <div class="bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-100">
              <p class="text-[9px] font-bold text-gray-400 uppercase">Monto Total Mes</p>
              <p class="text-sm font-black text-indigo-600">${{ Number(montoTotalMesActual).toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <!-- Resumen de KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pendiente</p>
          <p class="text-3xl font-black text-gray-900">${{ Number(stats.total_pendiente || 0).toLocaleString() }}</p>
          <div class="mt-2 flex items-center gap-1 text-xs text-amber-600 font-bold">
             <span>⏳</span> {{ stats.pendientes || 0 }} pagos pendientes
          </div>
        </div>
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pagado</p>
          <p class="text-3xl font-black text-gray-900">${{ Number(stats.total_pagado || 0).toLocaleString() }}</p>
          <div class="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-bold">
             <span>✅</span> De {{ stats.pagadas || 0 }} nóminas pagadas
          </div>
        </div>
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Nóminas</p>
          <p class="text-3xl font-black text-gray-900">{{ stats.total_nominas || 0 }}</p>
          <div class="mt-2 flex items-center gap-1 text-xs text-indigo-600 font-bold">
             <span>👥</span> Históricas registradas
          </div>
        </div>
      </div>

      <!-- Tabla de Nóminas -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 class="font-bold text-gray-800">Historial de Nóminas</h3>
          <div class="flex items-center gap-2">
            <select v-model="filterEmpleado" class="bg-gray-50 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-indigo-500">
              <option value="">Todos los Empleados</option>
              <option v-for="emp in empleados" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
            <select v-model="filterYear" class="bg-gray-50 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-indigo-500">
              <option :value="2024">2024</option>
              <option :value="2025">2025</option>
              <option :value="2026">2026</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th class="px-6 py-4">Periodo</th>
                <th class="px-6 py-4">Empleado</th>
                <th class="px-6 py-4">Desglose</th>
                <th class="px-6 py-4">Total</th>
                <th class="px-6 py-4">Estado</th>
                <th class="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 text-sm">
              <tr v-if="loadingTable" class="animate-pulse">
                <td colspan="6" class="px-6 py-8 text-center text-gray-400 italic">Cargando registros...</td>
              </tr>
              <tr v-else-if="nominas.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-400 italic">No se han generado nóminas para este año.</td>
              </tr>
              <tr v-for="n in nominas" :key="n.id" class="hover:bg-gray-50/50 transition">
                <td class="px-6 py-4">
                  <p class="font-bold text-gray-800">{{ formatDateRange(n.periodo_inicio, n.periodo_fin) }}</p>
                  <p class="text-[10px] text-gray-400 font-medium">ID: #{{ n.id }}</p>
                </td>
                <td class="px-6 py-4">
                  <p class="font-bold text-indigo-700">{{ n.user?.name || `Usuario #${n.user_id}` }}</p>
                  <p class="text-[10px] text-gray-500">{{ n.user?.tipo_empleado || 'Empleado' }}</p>
                </td>
                <td class="px-6 py-4 text-gray-600 text-xs space-y-1">
                  <div><span class="font-bold">Base:</span> ${{ Number(n.salario_base || 0).toLocaleString() }} ({{ n.horas_totales }}h)</div>
                  <div v-if="n.comision_ventas > 0"><span class="font-bold">Comisiones:</span> ${{ Number(n.comision_ventas).toLocaleString() }}</div>
                  <div v-if="n.bonos > 0" class="text-emerald-600"><span class="font-bold">Bonos:</span> +${{ Number(n.bonos).toLocaleString() }}</div>
                  <div v-if="n.descuentos > 0" class="text-red-600"><span class="font-bold">Descuentos:</span> -${{ Number(n.descuentos).toLocaleString() }}</div>
                </td>
                <td class="px-6 py-4 font-black text-gray-900">
                  ${{ Number(n.pago_total || n.monto_total || 0).toLocaleString() }}
                </td>
                <td class="px-6 py-4">
                  <span :class="statusClass(n.estado)" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {{ n.estado }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button v-if="n.estado === 'PENDIENTE'" @click="abrirEditModal(n)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition" title="Editar Montos">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button v-if="n.estado === 'PENDIENTE'" @click="abrirPaymentModal(n)" class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition" title="Pagar Nómina">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <!-- Visualizar detalle general -->
                    <button @click="verDetalle(n)" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition" title="Ver Detalle Completo">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══ SECCIÓN DE VISUALIZACIÓN Y ANÁLISIS ══ -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-12 pb-10">
        <!-- Tendencia de Gasto -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h3 class="text-lg font-bold text-gray-800">Tendencia de Gasto</h3>
              <p class="text-sm text-gray-400">Inversión mensual en nómina durante el {{ filterYear }}</p>
            </div>
            <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl">
              📈
            </div>
          </div>
          <div class="relative h-72">
            <div v-if="loadingTable" class="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
              <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <canvas ref="chartTendencia"></canvas>
          </div>
        </div>

        <!-- Distribución de Costos -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h3 class="text-lg font-bold text-gray-800">Composición de Pagos</h3>
              <p class="text-sm text-gray-400">Desglose de Base vs Variables (Bonos/Comisiones)</p>
            </div>
            <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">
              📊
            </div>
          </div>
          <div class="relative h-72">
            <div v-if="loadingTable" class="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
              <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <canvas ref="chartComposicion"></canvas>
          </div>
        </div>
      </div>

      <!-- Inversión por Colaborador -->
      <div v-if="statsPorEmpleado.length > 0" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-12">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="text-lg font-bold text-gray-800">Inversión por Colaborador</h3>
            <p class="text-sm text-gray-400">Total acumulado pagado a cada empleado en {{ filterYear }}</p>
          </div>
          <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl">
            👨‍💻
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="emp in statsPorEmpleado" :key="emp.name" class="flex flex-col justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
            <div class="mb-4">
              <p class="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{{ emp.name }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="px-2 py-0.5 bg-gray-200 text-[9px] font-black rounded text-gray-500 uppercase">{{ emp.count }} Nóminas</span>
              </div>
            </div>
            <div class="border-t border-gray-100 pt-3 flex items-end justify-between">
              <div>
                <p class="text-[9px] font-bold text-gray-400 uppercase">Acumulado</p>
                <p class="font-black text-indigo-600 text-lg leading-none mt-1">${{ Number(emp.total).toLocaleString() }}</p>
              </div>
              <div class="text-right">
                <p class="text-[9px] font-bold text-emerald-500 uppercase">Var.</p>
                <p class="text-[11px] font-bold text-emerald-600 leading-none mt-1">+${{ Number(emp.variables).toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

      <!-- ══ VISTA PERSONAL Y SUELDOS ══ -->
      <template v-else-if="activeMainTab === 'personal'">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- KPI de Compromiso Mensual -->
          <div class="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden flex flex-col justify-between">
            <div class="relative z-10">
              <p class="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Compromiso Mensual</p>
              <h4 class="text-3xl font-black">${{ Number(totalSueldosBase).toLocaleString() }}</h4>
              <p class="text-[10px] text-indigo-100 mt-2 font-medium">Suma de salarios base de todo el personal activo.</p>
            </div>
            <div class="mt-8 relative z-10">
              <div class="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl border border-white/10 w-fit">
                <i class="fa-solid fa-user-check text-xs"></i>
                <span class="text-[10px] font-bold uppercase tracking-wider">{{ empleados.length }} Colaboradores</span>
              </div>
            </div>
            <!-- Decoración -->
            <div class="absolute -right-4 -bottom-4 text-white/10 text-9xl">
              <i class="fa-solid fa-vault"></i>
            </div>
          </div>

          <!-- Configuración Global -->
          <div v-if="nominaConfig" class="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Configuración Global</p>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">Valor Hora (Defecto)</span>
                  <span class="font-bold text-indigo-600">${{ Number(nominaConfig.valor_hora_por_defecto).toLocaleString() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">Base (Defecto)</span>
                  <span class="font-bold text-indigo-600">${{ Number(nominaConfig.salario_base_por_defecto).toLocaleString() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">Comisión (Defecto)</span>
                  <span class="font-bold text-emerald-600">{{ Number(nominaConfig.porcentaje_comision_ventas) }}%</span>
                </div>
              </div>
            </div>
            <div class="mt-6 pt-4 border-t border-gray-50">
              <p class="text-[9px] text-gray-400 italic leading-tight">Estos valores se usan cuando un empleado no tiene sueldos específicos asignados.</p>
            </div>
          </div>

          <!-- Lista de Empleados con Detalles -->
          <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="emp in empleados" :key="emp.id" 
              class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all group border-l-4"
              :class="emp.activo ? 'border-l-indigo-500' : 'border-l-gray-300'">
              <div class="flex justify-between items-start mb-6">
                <div>
                  <h4 class="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">{{ emp.name }}</h4>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="px-2 py-0.5 bg-gray-100 text-[9px] font-black rounded text-gray-500 uppercase">{{ emp.puesto || 'Empleado' }}</span>
                    <span v-if="!emp.activo" class="px-2 py-0.5 bg-red-100 text-[9px] font-black rounded text-red-500 uppercase tracking-tighter">Inactivo</span>
                  </div>
                </div>
                <div class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg">
                  {{ emp.puesto === 'mesero' ? '🤵' : emp.puesto === 'cocina' ? '👨‍🍳' : '💼' }}
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4 border-t border-gray-50 pt-4">
                <div>
                  <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Sueldo Base</p>
                  <p class="font-black text-gray-800 text-sm">${{ Number(emp.salario_base || 0).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Pago por Hora</p>
                  <p class="font-black text-indigo-600 text-sm">${{ Number(emp.salario_por_hora || 0).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Comisión %</p>
                  <p class="font-black text-emerald-600 text-sm">{{ Number(emp.comision_por_venta || 0) }}%</p>
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-2">
                <button class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition" title="Configurar Sueldo">
                  <i class="fa-solid fa-gear text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal Generar Nómina -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showGenerateModal" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
        <div class="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 overflow-hidden relative max-h-[90vh] overflow-y-auto">
          <div class="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
          
          <h3 class="text-xl font-bold text-gray-900 mb-2">Generar Nómina para Empleado</h3>
          <p class="text-sm text-gray-500 mb-6">Selecciona el empleado y el periodo. Puedes sobreescribir los montos si es necesario.</p>

          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Empleado *</label>
              <select v-model="newNomina.user_id" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm">
                <option value="" disabled>Seleccione un empleado...</option>
                <option v-for="emp in empleados" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Desde *</label>
                <input v-model="newNomina.inicio" type="date" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Hasta *</label>
                <input v-model="newNomina.fin" type="date" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Valor por Hora (Opcional)</label>
                <input v-model="newNomina.valor_hora" type="number" step="0.01" placeholder="Ej. 50" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Salario Base Fijo (Opcional)</label>
                <input v-model="newNomina.salario_base" type="number" step="0.01" placeholder="Ej. 8000" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Comisiones</label>
                <input v-model="newNomina.comision_ventas" type="number" step="0.01" placeholder="0.00" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bonos Extras</label>
                <input v-model="newNomina.bonos" type="number" step="0.01" placeholder="0.00" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-red-500">Descuentos</label>
                <input v-model="newNomina.descuentos" type="number" step="0.01" placeholder="0.00" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white transition text-sm text-red-600" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Observaciones</label>
              <textarea v-model="newNomina.observaciones" rows="2" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm" placeholder="Ej. Bono por puntualidad incluido"></textarea>
            </div>
          </div>

          <div class="flex gap-4">
            <button @click="showGenerateModal = false" class="flex-1 py-4 text-sm font-bold text-gray-500 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
              Cancelar
            </button>
            <button 
              @click="procesarGeneracion" 
              :disabled="loadingAction"
              class="flex-[2] py-4 text-sm font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition flex items-center justify-center gap-2"
            >
              <span v-if="loadingAction" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ loadingAction ? 'Procesando...' : 'Generar Nómina' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Editar Nómina -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showEditModal" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
        <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 overflow-hidden relative">
          <div class="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
          
          <h3 class="text-xl font-bold text-gray-900 mb-2">Modificar Nómina #{{ editNomina.id }}</h3>
          <p class="text-sm text-gray-500 mb-6">Ajusta los montos o las horas. El pago total se recalculará automáticamente en el servidor.</p>

          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Horas Totales</label>
              <input v-model="editNomina.horas_totales" type="number" step="0.5" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bonos</label>
              <input v-model="editNomina.bonos" type="number" step="0.01" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-red-500">Descuentos</label>
              <input v-model="editNomina.descuentos" type="number" step="0.01" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white transition text-sm text-red-600" />
            </div>
          </div>

          <div class="flex gap-4">
            <button @click="showEditModal = false" class="flex-1 py-4 text-sm font-bold text-gray-500 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
              Cancelar
            </button>
            <button 
              @click="procesarEdicion" 
              :disabled="loadingAction"
              class="flex-[2] py-4 text-sm font-black text-white bg-blue-600 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition flex items-center justify-center gap-2"
            >
              <span v-if="loadingAction" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ loadingAction ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Pagar Nómina -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showPaymentModal" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
        <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 overflow-hidden relative">
          <div class="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
          
          <h3 class="text-xl font-bold text-gray-900 mb-2">Registrar Pago</h3>
          <p class="text-sm text-gray-500 mb-6">Marca la nómina como pagada y añade los detalles de la transacción.</p>

          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fecha de Pago</label>
              <input v-model="paymentNomina.fecha_pago" type="date" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Método de Pago</label>
              <select v-model="paymentNomina.metodo_pago" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-sm">
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Referencia / Comprobante (Opcional)</label>
              <input v-model="paymentNomina.referencia_pago" type="text" placeholder="TRX-12345" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Observaciones</label>
              <textarea v-model="paymentNomina.observaciones" rows="2" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-sm"></textarea>
            </div>
          </div>

          <div class="flex gap-4">
            <button @click="showPaymentModal = false" class="flex-1 py-4 text-sm font-bold text-gray-500 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
              Cancelar
            </button>
            <button 
              @click="procesarPago" 
              :disabled="loadingAction"
              class="flex-[2] py-4 text-sm font-black text-white bg-emerald-600 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition flex items-center justify-center gap-2"
            >
              <span v-if="loadingAction" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ loadingAction ? 'Procesando...' : 'Confirmar Pago' }}
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

// --- Toasts Locales ---
const toasts = ref([])
const showToast = (message, type = 'success') => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 4000)
}

// --- Autenticación ---
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
    if (!userRaw) {
      authError.value = 'Sesión de usuario no encontrada. Por favor, reinicia sesión.'
      return
    }

    let user = {}
    try {
      user = JSON.parse(userRaw)
    } catch (e) {
      authError.value = 'Error en los datos de sesión. Por favor, reinicia sesión.'
      return
    }
    
    if (!user) {
      authError.value = 'Usuario no válido. Por favor, reinicia sesión.'
      return
    }
    
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
      authError.value = 'Contraseña incorrecta. Inténtalo de nuevo.'
    }
  } catch (err) {
    authError.value = 'Error al verificar. Revisa tu conexión.'
  } finally {
    verifying.value = false
    password.value = ''
  }
}

// --- Gestión de Nóminas ---
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

const getTenantHeader = () => {
  const restId = localStorage.getItem('restaurante_id_activo') || localStorage.getItem('restaurante_activo')
  return restId ? { 'X-Restaurante-Id': String(restId) } : {}
}

const stats = reactive({
  total_nominas: 0,
  total_pagado: 0,
  total_pendiente: 0,
  pendientes: 0,
  pagadas: 0
})

const newNomina = reactive({
  user_id: '',
  inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  fin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  valor_hora: '',
  salario_base: '',
  comision_ventas: '',
  bonos: '',
  descuentos: '',
  observaciones: ''
})

const editNomina = reactive({ id: null, bonos: '', descuentos: '', horas_totales: '' })
const paymentNomina = reactive({ id: null, fecha_pago: '', metodo_pago: 'Efectivo', referencia_pago: '', observaciones: '' })

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
  const mesActual = hoy.getMonth()
  const yearActual = hoy.getFullYear()
  return nominas.value.filter(n => {
    const fin = new Date(n.periodo_fin + 'T00:00:00')
    return fin.getMonth() === mesActual && fin.getFullYear() === yearActual
  })
})

const montoTotalMesActual = computed(() => {
  return nominasActuales.value.reduce((acc, n) => acc + Number(n.pago_total || n.monto_total || 0), 0)
})

const totalSueldosBase = computed(() => {
  return empleados.value.reduce((acc, emp) => acc + Number(emp.salario_base || 0), 0)
})

const initData = async () => {
  await loadEmpleados()
  await loadResumen()
  await loadNominas()
  await loadConfig()
}

const loadConfig = async () => {
  try {
    const resp = await apiClient.get('/nomina/configuracion', { headers: getTenantHeader() })
    if (resp.success) {
      nominaConfig.value = resp.data
    }
  } catch (err) {
    console.error('Error al cargar configuración de nómina:', err)
  }
}

const loadEmpleados = async () => {
  try {
    const resp = await apiClient.get('/empleados', { headers: getTenantHeader() })
    if (resp.success) {
      empleados.value = resp.data || []
    }
  } catch (err) {
    console.error('Error al cargar empleados:', err)
  }
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
  } catch (err) {
    console.error('Error al cargar resumen:', err)
  }
}

const loadNominas = async () => {
  loadingTable.value = true
  try {
    let url = `/nominas?fecha_desde=${filterYear.value}-01-01&fecha_hasta=${filterYear.value}-12-31`
    if (filterEmpleado.value) url += `&user_id=${filterEmpleado.value}`
    
    const resp = await apiClient.get(url, {
      headers: getTenantHeader()
    })
    if (resp.success) {
      const respData = resp.data?.data || resp.data || []
      nominas.value = Array.isArray(respData) ? respData : []
    }
  } catch (err) {
    console.error('Error al cargar nóminas:', err)
    if (err.response?.status === 401) {
      isAuthenticated.value = false
      sessionStorage.removeItem('nomina_unlocked')
      authError.value = 'Sesión expirada. Por favor, re-ingresa tu contraseña.'
    }
  } finally {
    loadingTable.value = false
  }
}

watch([filterYear, filterEmpleado], () => {
  if(isAuthenticated.value) loadNominas()
})

const procesarGeneracion = async () => {
  if (!newNomina.user_id || !newNomina.inicio || !newNomina.fin) {
    showToast('Debe seleccionar un empleado y el rango de fechas.', 'error')
    return
  }
  loadingAction.value = true
  
  try {
    const payload = {
      user_id: newNomina.user_id,
      periodo_inicio: newNomina.inicio,
      periodo_fin: newNomina.fin
    }
    if (newNomina.valor_hora !== '') payload.valor_hora = Number(newNomina.valor_hora)
    if (newNomina.salario_base !== '') payload.salario_base = Number(newNomina.salario_base)
    if (newNomina.comision_ventas !== '') payload.comision_ventas = Number(newNomina.comision_ventas)
    if (newNomina.bonos !== '') payload.bonos = Number(newNomina.bonos)
    if (newNomina.descuentos !== '') payload.descuentos = Number(newNomina.descuentos)
    if (newNomina.observaciones !== '') payload.observaciones = newNomina.observaciones

    const resp = await apiClient.post('/nominas/generar', payload, { headers: getTenantHeader() })
    
    if (resp.success) {
      showToast('La nómina se ha generado correctamente.')
      showGenerateModal.value = false
      // Reset form
      newNomina.user_id = ''
      newNomina.valor_hora = ''
      newNomina.salario_base = ''
      newNomina.comision_ventas = ''
      newNomina.bonos = ''
      newNomina.descuentos = ''
      newNomina.observaciones = ''

      loadNominas()
      loadResumen()
    } else {
      showToast(resp.message || 'No se pudo generar la nómina.', 'error')
    }
  } catch (err) {
    showToast('Error de conexión con el servidor.', 'error')
  } finally {
    loadingAction.value = false
  }
}

const abrirEditModal = (n) => {
  editNomina.id = n.id
  editNomina.bonos = n.bonos || 0
  editNomina.descuentos = n.descuentos || 0
  editNomina.horas_totales = n.horas_totales || 0
  showEditModal.value = true
}

const procesarEdicion = async () => {
  loadingAction.value = true
  try {
    const payload = {
      bonos: Number(editNomina.bonos),
      descuentos: Number(editNomina.descuentos),
      horas_totales: Number(editNomina.horas_totales)
    }
    const resp = await apiClient.put(`/nominas/${editNomina.id}`, payload, { headers: getTenantHeader() })
    if (resp.success) {
      showToast('Nómina actualizada exitosamente.')
      showEditModal.value = false
      loadNominas()
      loadResumen()
    } else {
      showToast(resp.message || 'No se pudo actualizar', 'error')
    }
  } catch (err) {
    showToast('Error de conexión', 'error')
  } finally {
    loadingAction.value = false
  }
}

const abrirPaymentModal = (n) => {
  paymentNomina.id = n.id
  paymentNomina.fecha_pago = new Date().toISOString().split('T')[0]
  paymentNomina.metodo_pago = 'Efectivo'
  paymentNomina.referencia_pago = ''
  paymentNomina.observaciones = ''
  showPaymentModal.value = true
}

const procesarPago = async () => {
  loadingAction.value = true
  try {
    const payload = {
      estado: 'PAGADA',
      fecha_pago: paymentNomina.fecha_pago,
      metodo_pago: paymentNomina.metodo_pago,
      referencia_pago: paymentNomina.referencia_pago,
      observaciones: paymentNomina.observaciones
    }
    const resp = await apiClient.put(`/nominas/${paymentNomina.id}/estado`, payload, { headers: getTenantHeader() })
    if (resp.success) {
      showToast('Nómina pagada exitosamente.')
      showPaymentModal.value = false
      loadNominas()
      loadResumen()
    } else {
      showToast(resp.message || 'No se pudo registrar el pago', 'error')
    }
  } catch (err) {
    showToast('Error de conexión', 'error')
  } finally {
    loadingAction.value = false
  }
}

const verDetalle = (n) => {
  let msg = `Nómina #${n.id} - ${n.user?.name || ''}\n`
  msg += `Periodo: ${formatDateRange(n.periodo_inicio, n.periodo_fin)}\n`
  msg += `Estado: ${n.estado}\n\n`
  msg += `Horas Totales: ${n.horas_totales}h\n`
  msg += `Salario Base: $${n.salario_base}\n`
  if(n.comision_ventas > 0) msg += `Comisiones: $${n.comision_ventas}\n`
  if(n.bonos > 0) msg += `Bonos: $${n.bonos}\n`
  if(n.descuentos > 0) msg += `Descuentos: $${n.descuentos}\n`
  msg += `Total a Pagar: $${n.pago_total || n.monto_total}\n`
  if(n.estado === 'PAGADA') {
    msg += `\nMétodo de Pago: ${n.metodo_pago || 'No especificado'}\n`
    msg += `Fecha Pago: ${n.fecha_pago || 'No especificada'}\n`
  }
  if(n.observaciones) msg += `\nObs: ${n.observaciones}`
  
  alert(msg)
}

// --- Utils ---
const loadChartJS = () => new Promise(resolve => {
  if (window.Chart) { resolve(); return }
  const s = document.createElement('script')
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
  s.onload = resolve; document.head.appendChild(s)
})

const updateCharts = async () => {
  await loadChartJS()
  if (!chartTendencia.value || !chartComposicion.value) return

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const datosMensuales = Array(12).fill(0)
  const datosBase = Array(12).fill(0)
  const datosVariables = Array(12).fill(0)

  nominas.value.forEach(n => {
    const fecha = new Date(n.periodo_inicio + 'T00:00:00')
    const mesIdx = fecha.getMonth()
    const total = Number(n.pago_total || n.monto_total || 0)
    const base = Number(n.salario_base || 0)
    const variable = total - base
    
    datosMensuales[mesIdx] += total
    datosBase[mesIdx] += base
    datosVariables[mesIdx] += variable
  })

  if (tendenciaInst) tendenciaInst.destroy()
  if (composicionInst) composicionInst.destroy()

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 8, usePointStyle: true, font: { size: 10, weight: 'bold' } } }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f8fafc' }, border: { display: false }, ticks: { font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
  }

  tendenciaInst = new window.Chart(chartTendencia.value, {
    type: 'line',
    data: {
      labels: meses,
      datasets: [{
        label: 'Inversión Total',
        data: datosMensuales,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.05)',
        fill: true,
        tension: 0.4,
        borderWidth: 4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#4f46e5'
      }]
    },
    options: { ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }
  })

  composicionInst = new window.Chart(chartComposicion.value, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [
        { label: 'Sueldo Base', data: datosBase, backgroundColor: '#4f46e5', borderRadius: 4, barThickness: 15 },
        { label: 'Bonos/Comisiones', data: datosVariables, backgroundColor: '#10b981', borderRadius: 4, barThickness: 15 }
      ]
    },
    options: { ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, stacked: true }, x: { ...chartOptions.scales.x, stacked: true } } }
  })
}

watch(nominas, () => {
  nextTick(updateCharts)
})

const formatDateRange = (start, end) => {
  if (!start || !end) return 'Periodo N/A'
  const options = { day: 'numeric', month: 'short' }
  const s = new Date(start).toLocaleDateString('es-ES', options)
  const e = new Date(end).toLocaleDateString('es-ES', options)
  const year = new Date(start).getFullYear()
  return `${s} - ${e}, ${year}`
}

const statusClass = (status) => {
  switch (status) {
    case 'PAGADA':    return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    case 'PENDIENTE': return 'bg-amber-100 text-amber-700 border border-amber-200'
    case 'ANULADA':   return 'bg-red-100 text-red-700 border border-red-200'
    case 'CANCELADA': return 'bg-red-100 text-red-700 border border-red-200'
    default:         return 'bg-gray-100 text-gray-700 border border-gray-200'
  }
}

onMounted(() => {
  if (sessionStorage.getItem('nomina_unlocked') === 'true') {
    isAuthenticated.value = true
    initData()
  } else {
    isAuthenticated.value = false
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>
