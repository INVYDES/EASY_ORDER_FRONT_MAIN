<template>
  <div class="space-y-6">

    <SucursalBadge />

    <!-- TOASTS -->
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-lg shadow-md flex items-center gap-3 min-w-72 animate-slide-in pointer-events-auto border',
          toast.type==='success' ? 'bg-[#E8F1ED] border-[#26734D]/30 text-[#202723]' :
          toast.type==='error'   ? 'bg-[#FEF2F2] border-[#B93838]/30 text-[#202723]' :
          'bg-[#F0F2EF] border-[#DDE3DE] text-[#202723]']">
        <i :class="[
          toast.type==='success' ? 'fa-solid fa-circle-check text-[#26734D]' :
          toast.type==='error'   ? 'fa-solid fa-circle-xmark text-[#B93838]' :
          'fa-solid fa-circle-info text-[#315F8C]'
        ]"></i>
        <span class="text-xs font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-[#68736C] hover:text-[#202723]">
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
    </div>

    <!-- Banner Licencia Inactiva -->
    <div v-if="currentUser?.licencia_activa === false || (licenciaActiva && licenciaActiva.estado === 'INACTIVA')" class="bg-[#FEF2F2] border border-[#B93838]/30 p-4 rounded-xl flex items-center justify-between shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-[#B93838]/10 text-[#B93838] flex items-center justify-center shrink-0">
          <i class="fa-solid fa-triangle-exclamation text-base"></i>
        </div>
        <div>
          <h4 class="font-semibold text-[#B93838] text-sm">Licencia Inactiva</h4>
          <p class="text-xs text-[#68736C] mt-0.5">Tu suscripción actual se encuentra inactiva. Algunas funciones y creación de usuarios o sucursales podrían estar restringidas.</p>
        </div>
      </div>
      <RouterLink to="/panel/licencias" class="px-3.5 py-1.5 bg-[#B93838] hover:bg-[#962D2D] text-white font-semibold text-xs rounded-lg transition shrink-0 shadow-xs">
        Renovar Licencia
      </RouterLink>
    </div>

    <!-- Encabezado -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-semibold text-[#202723]">Administración</h2>
        <p class="text-xs text-[#68736C] mt-0.5">Panel de control y gestión operativa del restaurante</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button 
          @click="puedeCrearMasEmpleados ? abrirModalEmpleado() : null"
          :class="[
            'flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition shadow-xs',
            puedeCrearMasEmpleados 
              ? 'bg-[#245C4F] text-white hover:bg-[#19483D] cursor-pointer' 
              : 'bg-[#F0F2EF] text-[#68736C] border border-[#DDE3DE] cursor-not-allowed opacity-60'
          ]"
          :title="!puedeCrearMasEmpleados ? 'Has alcanzado el límite de usuarios permitidos en tu plan de licencia.' : 'Registrar nuevo empleado'"
        >
          <i class="fa-solid fa-user-plus text-xs"></i> Nuevo Empleado
        </button>
        <button 
          @click="puedeCrearMasEmpleados ? abrirModalCuentaMenu() : null"
          :class="[
            'flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition shadow-xs border',
            puedeCrearMasEmpleados 
              ? 'bg-white border-[#DDE3DE] text-[#202723] hover:bg-[#F6F7F5] cursor-pointer' 
              : 'bg-[#F0F2EF] text-[#68736C] border-[#DDE3DE] cursor-not-allowed opacity-60'
          ]"
          :title="!puedeCrearMasEmpleados ? 'Has alcanzado el límite de usuarios permitidos en tu plan de licencia.' : 'Registrar nueva cuenta de menú'"
        >
          <i class="fa-solid fa-tablet-screen-button text-xs text-[#245C4F]"></i> Nueva Cuenta de Menú
        </button>
        <button 
          @click="puedeCrearMasRestaurantes ? abrirModalRestaurante() : null"
          :class="[
            'flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition shadow-xs border',
            puedeCrearMasRestaurantes 
              ? 'bg-white border-[#DDE3DE] text-[#202723] hover:bg-[#F6F7F5] cursor-pointer' 
              : 'bg-[#F0F2EF] text-[#68736C] border-[#DDE3DE] cursor-not-allowed opacity-60'
          ]"
          :title="!puedeCrearMasRestaurantes ? 'Has alcanzado el límite de restaurantes permitidos en tu plan de licencia.' : 'Registrar nueva sucursal'"
        >
          <i class="fa-solid fa-store text-xs text-[#245C4F]"></i> Nuevo Restaurante
        </button>
      </div>
    </div>

    <!-- Tabs Principales -->
    <div class="flex flex-wrap items-center gap-1.5 bg-[#F0F2EF] border border-[#DDE3DE] rounded-xl p-1 w-fit">
      <button v-for="t in mainTabs" :key="t.key" @click="mainTab = t.key"
        :class="['px-5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2',
          mainTab === t.key ? 'bg-white shadow-xs text-[#245C4F] border border-[#DDE3DE]' : 'text-[#68736C] hover:text-[#202723] hover:bg-white/60 border border-transparent']">
        <i v-if="t.icon" :class="t.icon"></i>
        {{ t.label }}
      </button>
    </div>

    <!-- ══ TAB RESUMEN (Personal y Sucursales) ══ -->
    <template v-if="mainTab === 'resumen'">
      <div v-if="loading.general" class="flex items-center justify-center py-20 gap-3">
        <div class="w-8 h-8 border-4 border-[#E8F1ED] border-t-[#245C4F] rounded-full animate-spin"></div>
        <p class="text-xs text-[#68736C] font-medium">Cargando...</p>
      </div>

      <template v-else>
        <!-- Título de sección operativa -->
        <div class="mb-4">
          <h3 class="text-base font-semibold text-[#202723]">Control Operativo</h3>
          <p class="text-xs text-[#68736C] mt-0.5">Gestión de personal de nómina, terminales de menú y sucursales activas</p>
        </div>

        <!-- Tabs CRUD -->
        <div class="border-b border-[#DDE3DE] mb-5">
          <nav class="-mb-px flex flex-wrap gap-6">
            <button v-for="tab in crudTabs" :key="tab.key" @click="activeTab = tab.key"
              :class="['py-3 px-1 border-b-2 text-xs font-semibold transition cursor-pointer flex items-center gap-2',
                activeTab===tab.key ? 'border-[#245C4F] text-[#245C4F]' : 'border-transparent text-[#68736C] hover:text-[#202723]']">
              {{ tab.label }}
              <span v-if="tab.key !== 'sesiones'" class="bg-[#E8F1ED] text-[#245C4F] rounded-full px-2 py-0.5 text-[11px] font-semibold">{{ tab.count }}</span>
            </button>
          </nav>
        </div>

        <!-- Tabla empleados -->
        <div v-if="activeTab === 'empleados'" class="bg-white rounded-xl shadow-xs overflow-hidden border border-[#DDE3DE]">
          <div v-if="loading.empleados" class="text-center py-12 text-[#68736C] text-xs">Cargando empleados...</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-[#DDE3DE]">
              <thead class="bg-[#F0F2EF]">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Empleado</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Rol</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Sucursal</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Estado</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Usuario</th>
                  <th class="px-5 py-3 text-right text-xs font-semibold text-[#68736C] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#DDE3DE]">
                <tr v-if="personalNomina.length===0">
                  <td colspan="6" class="px-5 py-10 text-center text-[#68736C] italic text-xs">No hay empleados registrados</td>
                </tr>
                <tr v-for="emp in personalNomina" :key="emp.id" class="hover:bg-[#F6F7F5] transition-colors">
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xs font-semibold shrink-0">
                        {{ getInitials(emp.name) }}
                      </div>
                      <div class="flex flex-col">
                        <span class="font-semibold text-[#202723] text-xs">{{ emp.name }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#E8F1ED] text-[#245C4F]">
                      {{ getRolNombre(emp) }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="text-xs font-medium text-[#68736C] bg-[#F0F2EF] px-2 py-0.5 rounded-md border border-[#DDE3DE]">
                      {{ emp.restaurante_activo?.nombre || emp.restaurante_activo_nombre || '—' }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-2">
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" :checked="emp.activo !== false" @change="toggleEstadoEmpleado(emp)" class="sr-only peer">
                        <div class="w-9 h-5 bg-[#DDE3DE] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DDE3DE] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#26734D]"></div>
                      </label>
                      <span :class="['text-[11px] font-semibold uppercase w-12', emp.activo !== false ? 'text-[#26734D]' : 'text-[#B93838]']">
                        {{ emp.activo !== false ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-5 py-3.5 text-xs text-[#68736C] font-mono">{{ emp.username }}</td>
                  <td class="px-5 py-3.5 text-right">
                    <div class="flex justify-end gap-1.5">
                      <button @click="editarEmpleado(emp)"
                        class="text-xs text-[#245C4F] font-semibold bg-[#E8F1ED] hover:bg-[#245C4F] hover:text-white px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-pen-to-square text-[11px]"></i> Editar
                      </button>
                      <button @click="eliminarEmpleado(emp)"
                        class="text-xs text-[#B93838] font-semibold bg-[#B93838]/10 hover:bg-[#B93838] hover:text-white px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-trash-can text-[11px]"></i> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabla Cuentas de Menú -->
        <div v-if="activeTab === 'menu'" class="bg-white rounded-xl shadow-xs overflow-hidden border border-[#DDE3DE]">
          <div v-if="loading.empleados" class="text-center py-12 text-[#68736C] text-xs">Cargando cuentas...</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-[#DDE3DE]">
              <thead class="bg-[#F0F2EF]">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Nombre de Cuenta</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Sucursal</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Estado</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Cadena de Acceso</th>
                  <th class="px-5 py-3 text-right text-xs font-semibold text-[#68736C] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#DDE3DE]">
                <tr v-if="cuentasMenu.length===0">
                  <td colspan="5" class="px-5 py-10 text-center text-[#68736C] italic text-xs">No hay cuentas de menú creadas</td>
                </tr>
                <tr v-for="emp in cuentasMenu" :key="emp.id" class="hover:bg-[#F6F7F5] transition-colors">
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xs shrink-0">
                        <i class="fa-solid fa-tablet-screen-button"></i>
                      </div>
                      <span class="font-semibold text-[#202723] text-xs">{{ emp.name }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="text-xs font-medium text-[#68736C] bg-[#F0F2EF] px-2 py-0.5 rounded-md border border-[#DDE3DE]">
                      {{ emp.restaurante_activo?.nombre || emp.restaurante_activo_nombre || '—' }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-2">
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" :checked="emp.activo !== false" @change="toggleEstadoEmpleado(emp)" class="sr-only peer">
                        <div class="w-9 h-5 bg-[#DDE3DE] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DDE3DE] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#26734D]"></div>
                      </label>
                      <span :class="['text-[11px] font-semibold uppercase w-12', emp.activo !== false ? 'text-[#26734D]' : 'text-[#B93838]']">
                        {{ emp.activo !== false ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-5 py-3.5 text-xs font-mono text-[#245C4F] font-semibold">{{ emp.username }}</td>
                  <td class="px-5 py-3.5 text-right">
                    <div class="flex justify-end gap-1.5">
                      <button @click="editarCuentaMenu(emp)"
                        class="text-xs text-[#245C4F] font-semibold bg-[#E8F1ED] hover:bg-[#245C4F] hover:text-white px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-pen-to-square text-[11px]"></i> Editar
                      </button>
                      <button @click="eliminarEmpleado(emp)"
                        class="text-xs text-[#B93838] font-semibold bg-[#B93838]/10 hover:bg-[#B93838] hover:text-white px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-trash-can text-[11px]"></i> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabla Entradas y Salidas (Sesiones) -->
        <div v-if="activeTab === 'sesiones'" class="bg-white rounded-xl shadow-xs overflow-hidden border border-[#DDE3DE]">
          <!-- Filtros de Sesiones y Botón Imprimir -->
          <div class="flex flex-wrap items-center justify-between gap-4 bg-[#F6F7F5] p-4 border-b border-[#DDE3DE]">
            <div class="flex items-center gap-3 flex-wrap">
              <!-- Filtro por Rango de Fechas -->
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-[#68736C]">Período:</span>
                <div class="relative">
                  <select v-model="filtroSesiones" class="appearance-none bg-white border border-[#DDE3DE] rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-[#202723] focus:outline-none focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] cursor-pointer shadow-xs">
                    <option value="hoy">Hoy</option>
                    <option value="7d">Últimos 7 días</option>
                    <option value="14d">Últimos 14 días</option>
                    <option value="30d">Últimos 30 días</option>
                    <option value="todos">Todos los registros</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-[#68736C]">
                    <i class="fa-solid fa-chevron-down text-[10px]"></i>
                  </div>
                </div>
              </div>

              <!-- Filtro por Empleado -->
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-[#68736C]">Empleado:</span>
                <div class="relative">
                  <select v-model="filtroEmpleadoId" class="appearance-none bg-white border border-[#DDE3DE] rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-[#202723] focus:outline-none focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] cursor-pointer shadow-xs">
                    <option value="todos">Todos los empleados</option>
                    <option v-for="emp in empleadosFiltrados" :key="emp.id" :value="emp.id">
                      {{ emp.name }}
                    </option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-[#68736C]">
                    <i class="fa-solid fa-chevron-down text-[10px]"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botón Imprimir -->
            <button @click="imprimirTablaSesiones" class="flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-[#F6F7F5] border border-[#DDE3DE] text-[#202723] text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer">
              <i class="fa-solid fa-print text-xs text-[#245C4F]"></i> Imprimir Reporte
            </button>
          </div>

          <div v-if="loading.general" class="text-center py-12 text-[#68736C] text-xs">
            <div class="w-8 h-8 border-4 border-[#E8F1ED] border-t-[#245C4F] rounded-full animate-spin mx-auto mb-3"></div>
            Cargando historial de entradas y salidas...
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-[#DDE3DE]">
              <thead class="bg-[#F0F2EF]">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Empleado</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Rol</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Sucursal</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Hora Entrada</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Hora Salida / Estado</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Duración</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#DDE3DE]">
                <tr v-if="sesionesFiltradas.length===0">
                  <td colspan="6" class="px-5 py-10 text-center text-[#68736C] italic text-xs">No hay registros de entradas y salidas en esta sucursal</td>
                </tr>
                <tr v-for="ses in sesionesFiltradas" :key="ses.id" class="hover:bg-[#F6F7F5] transition-colors">
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xs font-semibold shrink-0">
                        {{ getInitials(ses.user?.name) }}
                      </div>
                      <span class="font-semibold text-[#202723] text-xs">{{ ses.user?.name || 'Empleado Eliminado' }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#E8F1ED] text-[#245C4F]">
                      {{ ses.user ? getRolNombre(ses.user) : '—' }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="text-xs font-medium text-[#68736C] bg-[#F0F2EF] px-2 py-0.5 rounded-md border border-[#DDE3DE]">
                      {{ ses.restaurante?.nombre || '—' }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-xs text-[#202723] font-medium">
                    {{ formatDateTime(ses.hora_entrada) }}
                  </td>
                  <td class="px-5 py-3.5">
                    <span v-if="!ses.hora_salida" class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#E8F1ED] text-[#26734D] border border-[#26734D]/20 inline-flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#26734D]"></span>
                      En línea / Activo
                    </span>
                    <span v-else class="text-xs text-[#68736C] font-medium">
                      {{ formatDateTime(ses.hora_salida) }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-xs font-semibold text-[#202723]">
                    {{ calcularDuracion(ses.hora_entrada, ses.hora_salida) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabla restaurantes -->
        <div v-if="activeTab === 'restaurantes'" class="bg-white rounded-xl shadow-xs overflow-hidden border border-[#DDE3DE]">
          <div v-if="loading.restaurantes" class="text-center py-12 text-[#68736C] text-xs">Cargando restaurantes...</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-[#DDE3DE]">
              <thead class="bg-[#F0F2EF]">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Nombre</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Dirección</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Estado</th>
                  <th class="px-5 py-3 text-right text-xs font-semibold text-[#68736C] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#DDE3DE]">
                <tr v-if="restaurantes.length===0">
                  <td colspan="4" class="px-5 py-10 text-center text-[#68736C] italic text-xs">No hay restaurantes registrados</td>
                </tr>
                <tr v-for="rest in restaurantes" :key="rest.id" class="hover:bg-[#F6F7F5] transition-colors">
                  <td class="px-5 py-3.5">
                    <p class="text-xs font-semibold text-[#202723]">{{ rest.nombre }}</p>
                    <p class="text-[11px] text-[#68736C] mt-0.5">{{ rest.telefono || 'Sin teléfono' }}</p>
                  </td>
                  <td class="px-5 py-3.5 text-xs text-[#68736C]">
                    {{ [rest.calle, rest.ciudad, rest.estado].filter(Boolean).join(', ') || '—' }}
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="px-2.5 py-0.5 text-xs font-medium rounded-full"
                      :class="rest.es_activo!==false ? 'bg-[#E8F1ED] text-[#26734D]' : 'bg-[#F0F2EF] text-[#68736C]'">
                      {{ rest.es_activo!==false ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-right">
                    <div class="flex justify-end gap-1.5">
                      <button @click="editarRestaurante(rest)"
                        class="text-xs text-[#245C4F] font-semibold bg-[#E8F1ED] hover:bg-[#245C4F] hover:text-white px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-pen-to-square text-[11px]"></i> Editar
                      </button>
                      <button @click="eliminarRestaurante(rest.id)"
                        class="text-xs text-[#B93838] font-semibold bg-[#B93838]/10 hover:bg-[#B93838] hover:text-white px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-trash-can text-[11px]"></i> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>




    <!-- ══ TAB GASTOS ══ -->
    <template v-if="mainTab === 'gastos'">
      <GastoView />
    </template>

    <!-- ══ TAB FINANCIERO ══ -->
    <template v-if="mainTab === 'financiero'">
      <FinancieroView />
    </template>

    <!-- ══ TAB MESEROS ══ -->
    <template v-if="mainTab === 'meseros'">
      <MeserosManager />
    </template>

    <!-- ══ TAB NOMINA ══ -->
    <template v-if="mainTab === 'nomina'">
      <NominaView />
    </template>

    <!-- ══ MODAL EMPLEADO (Componente Nuevo) ══ -->
    <div v-if="showModalEmpleado" class="fixed inset-0 bg-[#202723]/50 z-50 flex items-center justify-center px-4"
      @click.self="cerrarModalEmpleado">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative border border-[#DDE3DE]">
        <!-- Botón cerrar X -->
        <button @click="cerrarModalEmpleado" class="absolute top-3.5 right-3.5 text-[#68736C] hover:text-[#202723] w-7 h-7 rounded-lg hover:bg-[#F0F2EF] flex items-center justify-center text-sm transition z-10 cursor-pointer">
          <i class="fa-solid fa-xmark"></i>
        </button>
        
        <FormularioTrabajador 
          ref="formEmpleadoRef"
          :empleado="empleadoEditando"
          :restaurantes="sucursalesDueno"
          :restaurante-activo-id="restauranteActivoId"
          :es-cuenta-menu="esModoMenu"
          @guardar="handleGuardarEmpleado"
          @cancelar="cerrarModalEmpleado"
        />
      </div>
    </div>

    <!-- ══ MODAL RESTAURANTE ══ -->
    <div v-if="showModalRestaurante" class="fixed inset-0 bg-[#202723]/50 z-50 flex items-center justify-center px-4"
      @click.self="cerrarModalRestaurante">
      <div class="bg-white rounded-xl shadow-xl border border-[#DDE3DE] w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4 border-b border-[#DDE3DE] pb-3">
          <h3 class="text-base font-semibold text-[#202723]">{{ restauranteEditando ? 'Editar Restaurante' : 'Nuevo Restaurante' }}</h3>
          <button @click="cerrarModalRestaurante" class="text-[#68736C] hover:text-[#202723] w-7 h-7 rounded-lg hover:bg-[#F0F2EF] flex items-center justify-center text-sm transition cursor-pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div v-if="formError" class="mb-4 p-3 text-xs text-[#B93838] bg-[#FEF2F2] border border-[#B93838]/20 rounded-lg">{{ formError }}</div>
        <div class="space-y-3.5">
          <div>
            <label class="block text-xs font-semibold text-[#202723] mb-1">Nombre *</label>
            <input v-model="restForm.nombre" type="text"
              class="w-full px-3 py-2 border border-[#DDE3DE] rounded-lg text-xs focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#202723] mb-1">Teléfono</label>
            <input v-model="restForm.telefono" type="text"
              class="w-full px-3 py-2 border border-[#DDE3DE] rounded-lg text-xs focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#202723] mb-1">Calle y número</label>
            <input v-model="restForm.calle" type="text"
              class="w-full px-3 py-2 border border-[#DDE3DE] rounded-lg text-xs focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-[#202723] mb-1">Ciudad</label>
              <input v-model="restForm.ciudad" type="text"
                class="w-full px-3 py-2 border border-[#DDE3DE] rounded-lg text-xs focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#202723] mb-1">Estado</label>
              <input v-model="restForm.estado" type="text"
                class="w-full px-3 py-2 border border-[#DDE3DE] rounded-lg text-xs focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none" />
            </div>
          </div>
          <div class="space-y-2 pt-1">
            <label class="block text-xs font-semibold text-[#202723]">Logo o Foto del Restaurante</label>
            <div class="flex items-center gap-3">
              <div class="w-16 h-16 rounded-lg bg-[#F6F7F5] border border-dashed border-[#DDE3DE] flex items-center justify-center overflow-hidden shrink-0">
                <img v-if="imgPreview || restForm.imagen_url" :src="imgPreview || getImageUrl(restForm.imagen_url)" alt="Imagen del restaurante" class="w-full h-full object-cover" />
                <i v-else class="fa-solid fa-image text-xl text-[#68736C]"></i>
              </div>
              <div class="flex-1">
                <input type="file" @change="onFileChange" accept="image/*" class="hidden" ref="fileInput" />
                <div class="flex flex-wrap gap-2">
                  <button @click="$refs.fileInput.click()" type="button"
                    class="px-3 py-1.5 bg-[#E8F1ED] text-[#245C4F] text-xs font-semibold rounded-lg hover:bg-[#245C4F] hover:text-white transition cursor-pointer">
                    {{ (imgPreview || restForm.imagen_url) ? 'Cambiar imagen' : 'Seleccionar imagen' }}
                  </button>
                  <button v-if="imgPreview || restForm.imagen_url" @click="quitarImagen" type="button"
                    class="px-3 py-1.5 bg-[#FEF2F2] text-[#B93838] text-xs font-semibold rounded-lg hover:bg-[#B93838] hover:text-white transition cursor-pointer">
                    Quitar
                  </button>
                </div>
                <div v-if="errorMsg" class="mt-2 p-2 text-xs text-[#B93838] bg-[#FEF2F2] border border-[#B93838]/20 rounded-lg flex items-center gap-2">
                  <i class="fa-solid fa-circle-exclamation text-xs"></i>
                  <span class="font-medium">{{ typeof errorMsg === 'object' ? Object.values(errorMsg)[0][0] : errorMsg }}</span>
                </div>
                <p class="text-[10px] text-[#68736C] mt-1">JPG, PNG o WebP. Máx 5MB.</p>
              </div>
            </div>
          </div>
          <div class="p-3 bg-[#FEF7EC] border border-[#A96517]/20 rounded-lg space-y-1">
            <div class="flex items-center gap-2">
              <input v-model="restForm.servicio_rapido" type="checkbox" id="servicio-rapido-check" class="accent-[#245C4F] w-4 h-4 cursor-pointer" />
              <label for="servicio-rapido-check" class="text-xs font-semibold text-[#202723] cursor-pointer flex items-center gap-1.5">
                <i class="fa-solid fa-bolt text-[#A96517] text-xs"></i> Modo Servicio Rápido (Comida Rápida)
              </label>
            </div>
            <p class="text-[11px] text-[#68736C] pl-6 leading-tight">
              Elimina la vista de estaciones de producción y centraliza la impresión de comandas y entrega directa en Caja.
            </p>
          </div>
          <div v-if="restauranteEditando" class="flex items-center gap-2 pt-1">
            <input v-model="restForm.activo" type="checkbox" id="activo-check" class="accent-[#245C4F] w-4 h-4" />
            <label for="activo-check" class="text-xs font-medium text-[#202723] cursor-pointer">Restaurante activo</label>
          </div>
        </div>
        <div class="flex gap-2.5 mt-5">
          <button @click="cerrarModalRestaurante"
            class="flex-1 py-2 text-xs font-semibold text-[#202723] bg-[#F0F2EF] hover:bg-[#DDE3DE] rounded-lg transition cursor-pointer">Cancelar</button>
          <button @click="guardarRestaurante" :disabled="loading.guardando"
            class="flex-1 py-2 text-xs font-semibold text-white bg-[#245C4F] hover:bg-[#19483D] rounded-lg transition disabled:opacity-50 cursor-pointer shadow-xs">
            {{ loading.guardando ? 'Guardando...' : (restauranteEditando ? 'Guardar cambios' : 'Crear restaurante') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ MODAL CONFIRMACIÓN ELIMINAR ══ -->
    <div v-if="showConfirmDelete" class="fixed inset-0 bg-[#202723]/50 z-[60] flex items-center justify-center px-4"
      @click.self="cancelarEliminacion">
      <div class="bg-white rounded-xl shadow-xl border border-[#DDE3DE] w-full max-w-sm overflow-hidden p-6 text-center">
        <div class="w-12 h-12 bg-[#FEF2F2] text-[#B93838] rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
          <i class="fa-solid fa-user-slash"></i>
        </div>
        <h3 class="text-base font-semibold text-[#202723] mb-1.5">¿Eliminar usuario?</h3>
        <p class="text-[#68736C] text-xs leading-relaxed mb-5">
          Estás a punto de eliminar a <span class="font-semibold text-[#202723]">{{ nameToDelete }}</span>. 
          Esta acción no se puede deshacer.
        </p>
        
        <div class="flex gap-2.5">
          <button @click="cancelarEliminacion"
            class="flex-1 py-2 text-xs font-semibold text-[#202723] bg-[#F0F2EF] hover:bg-[#DDE3DE] rounded-lg transition cursor-pointer">
            Cancelar
          </button>
          <button @click="handleConfirmDelete" :disabled="loading.guardando"
            class="flex-1 py-2 text-xs font-semibold text-white bg-[#B93838] hover:bg-[#962D2D] rounded-lg transition shadow-xs disabled:opacity-50 cursor-pointer">
            {{ loading.guardando ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { sessionGet, sessionSet, sessionRemove } from '@/utils/session'
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import SucursalBadge       from '../components/SucursalBadge.vue'
import IngredientesView    from './ingredientesview.vue'
import AnunciosView        from './anunciosview.vue'
import GastoView           from './GastoView.vue'
import FinancieroView      from './FinancieroView.vue'
import NominaView          from './NominaView.vue'
import MeserosManager      from '../components/administraccion/MeserosManager.vue'
import FormularioTrabajador from '../components/administraccion/FormularioTrabajador.vue'
import { apiClient } from '@/utils/apiClient'
import { STORAGE_URL } from '@/config/api'

const router = useRouter()

// ── Estado ─────────────────────────────────────────────────────────────────────
const mainTab   = ref('resumen')
const activeTab = ref('empleados')
const empleados    = ref([])
const sesiones     = ref([])
const filtroSesiones = ref('hoy')
const filtroEmpleadoId = ref('todos')
const restaurantes = ref([])
const currentUser  = ref(null)
const toasts       = ref([])
const formError    = ref('')

const licenciaActiva = ref(null)
const totalUsuariosSistema = ref(0)

const puedeCrearMasRestaurantes = computed(() => {
  if (!licenciaActiva.value) return true
  const max = licenciaActiva.value.max_restaurantes || 1
  const actuales = restaurantes.value.length
  return actuales < max
})

const puedeCrearMasEmpleados = computed(() => {
  if (!licenciaActiva.value) return true
  const max = licenciaActiva.value.max_usuarios || 5
  const actuales = totalUsuariosSistema.value || empleados.value.length
  return actuales < max
})

const cargarTotalUsuariosSistema = async () => {
  try {
    const propDashboard = await apiClient.get('/propietarios/dashboard').catch(() => null)
    if (propDashboard?.success && propDashboard.data) {
      totalUsuariosSistema.value = propDashboard.data.estadisticas?.total_usuarios ?? 0
    }
  } catch (err) {
    console.error('Error fetching propietarios dashboard:', err)
  }
}

const loadLicencia = async () => {
  if (!currentUser.value) return
  const roleRaw = currentUser.value.roles?.[0]
  const rol = typeof roleRaw === 'string' ? roleRaw : roleRaw?.nombre
  if (!currentUser.value.propietario_id && rol !== 'PROPIETARIO' && rol !== 'ADMIN') {
    licenciaActiva.value = null
    return
  }

  try {
    const propietarioId = currentUser.value.propietario_id || currentUser.value.id
    const data = await apiClient.get(`/propietarios/${propietarioId}/licencias-activas`)

    if (data?.success && data.data?.length > 0) {
      const lic = data.data[0]
      licenciaActiva.value = {
        id:               lic.id,
        nombre:           lic.licencia?.nombre   || lic.nombre,
        tipo:             lic.licencia?.tipo      || lic.tipo,
        max_restaurantes: lic.licencia?.max_restaurantes ?? lic.max_restaurantes ?? 1,
        max_usuarios:     lic.licencia?.max_usuarios     ?? lic.max_usuarios ?? 5,
      }
    } else {
      licenciaActiva.value = null
    }
  } catch (e) {
    console.error('Error fetching license info in admin view:', e)
    licenciaActiva.value = null
  }
}

const esRolIgnorado = (emp) => {
  if (!emp) return true
  const rol = String(getRolNombre(emp)).toLowerCase()
  return rol.includes('propietario') || rol.includes('owner') || rol.includes('menu') || rol.includes('kiosk')
}

const empleadosFiltrados = computed(() => {
  return empleados.value.filter(emp => !esRolIgnorado(emp))
})

const sesionesFiltradas = computed(() => {
  let list = sesiones.value
  list = list.filter(s => s.user && !esRolIgnorado(s.user))
  
  if (filtroEmpleadoId.value === 'todos') {
    return list
  }
  return list.filter(s => s.user_id === Number(filtroEmpleadoId.value))
})

const showModalEmpleado    = ref(false)
const showModalRestaurante = ref(false)
const showConfirmDelete    = ref(false)
const idToDelete           = ref(null)
const nameToDelete         = ref(null)
const empleadoEditando     = ref(null)
const restauranteEditando  = ref(null)
const esModoMenu           = ref(false)

const dashData           = reactive({ ventas_hoy: 0, ordenes_hoy: 0, ordenes_por_estado: [] })
const ordenesCerradasHoy = ref([])
const loading = reactive({ general: true, empleados: false, restaurantes: false, guardando: false, sucursales: false })

const empForm  = reactive({ nombre:'', apellidos:'', email:'', usuario:'', password:'', password_confirmation:'', rol:'', restaurante_id: null })
const restForm = reactive({ nombre:'', telefono:'', calle:'', ciudad:'', estado:'', servicio_rapido: false, activo:true, imagen: null, imagen_url: null, eliminar_imagen: false })
const imgPreview = ref(null)
const fileInput  = ref(null)
const sucursalesDueno = ref([])

// ── Tabs ───────────────────────────────────────────────────────────────────────
const mainTabs = [
  { key:'resumen',    label:'Personal y Sucursales', icon:'fa-solid fa-building-user' },
  { key:'meseros',    label:'Meseros',               icon:'fa-solid fa-user-group' },
  { key:'nomina',     label:'Nóminas',               icon:'fa-solid fa-money-check-dollar' },
  { key:'gastos',     label:'Gastos',                icon:'fa-solid fa-receipt' },
  { key:'financiero', label:'Configuración Financiera', icon:'fa-solid fa-sliders' },
]

const crudTabs = computed(() => [
  { key:'empleados',    label:'Personal de Nómina', count: personalNomina.value.length },
  { key:'menu',         label:'Cuentas de Menú',   count: cuentasMenu.value.length    },
  { key:'sesiones',     label:'Entradas y Salidas', count: sesiones.value.length       },
  { key:'restaurantes', label:'Restaurantes',      count: restaurantes.value.length   },
])

const personalNomina = computed(() => empleados.value.filter(e => {
  const rolId = String(getRolId(e)).toLowerCase()
  const rolName = String(getRolNombre(e)).toLowerCase()
  return rolId !== '7' && rolId !== 'menu' && !rolName.includes('menu') && !rolName.includes('cliente')
}))

const cuentasMenu = computed(() => empleados.value.filter(e => {
  const rolId = String(getRolId(e)).toLowerCase()
  const rolName = String(getRolNombre(e)).toLowerCase()
  return rolId === '7' || rolId === 'menu' || rolName.includes('menu') || rolName.includes('cliente')
}))

// ── Helpers ────────────────────────────────────────────────────────────────────
const getHeaders = () => {
  const token = sessionGet('token')
  return { 'Content-Type':'application/json', Accept:'application/json', Authorization: token ? `Bearer ${token}` : '' }
}

const ROLES_MAP = { 1:'Super Admin', 2:'Administrador', 3:'Mesero', 4:'Cocina', 5:'Caja', 6:'Barra', 7:'Cliente' }

const getRolNombre = (emp) => {
  if (emp.roles?.length) {
    const r = emp.roles[0]
    if (typeof r === 'string') return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()
    if (r?.nombre) return r.nombre
    if (r?.name)   return r.name
    if (typeof r === 'number') return ROLES_MAP[r] || `Rol ${r}`
    if (r?.id) return ROLES_MAP[r.id] || r.nombre || `Rol ${r.id}`
  }
  if (emp.rol)    return ROLES_MAP[emp.rol]    || emp.rol
  if (emp.rol_id) return ROLES_MAP[emp.rol_id] || `Rol ${emp.rol_id}`
  return 'Empleado'
}

const getRolId = (emp) => {
  if (emp.roles?.length) {
    const r = emp.roles[0]
    if (typeof r === 'string') {
      // Intentar mapear de string a ID si es necesario para lógica interna
      const invMap = Object.fromEntries(Object.entries(ROLES_MAP).map(([k,v]) => [v.toUpperCase(), k]))
      return invMap[r.toUpperCase()] || '0'
    }
    if (r?.id) return String(r.id)
    if (typeof r === 'number') return String(r)
  }
  if (emp.rol_id) return String(emp.rol_id)
  if (emp.rol)    return String(emp.rol)
  return ''
}

const getInitials = (name) => !name ? 'U' : name.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0,2)

// Helper robusto para servicio_rapido: corrige bug !! "0" === true
const toBoolServicioRapido = (v) => {
  if (v === true || v === 1) return true
  if (v === false || v === 0 || v == null) return false
  const s = String(v).trim().toLowerCase()
  return s === '1' || s === 'true'
}

const showToast = (message, type='info') => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), 4000)
}
const removeToast = (id) => { const i=toasts.value.findIndex(t=>t.id===id); if(i!==-1) toasts.value.splice(i,1) }

// ── Cargar empleados desde /empleados (devuelve activo correctamente) ──────────
const cargarEmpleados = async () => {
  loading.empleados = true
  try {
    const r = await apiClient.get('/empleados')
    if (r.success) {
      empleados.value = r.data || []
    }
  } catch(e) {
    console.error('Error cargando empleados:', e)
  } finally {
    loading.empleados = false
  }
}

// ── Cargar datos ───────────────────────────────────────────────────────────────
const loadData = async () => {
  const token = sessionGet('token')
  if (!token) { router.push('/login'); return }
  loading.general = true
  try {
    const today = new Date().toLocaleDateString('en-CA')

    const [uData, rData, dData, cData] = await Promise.all([
      apiClient.get('/me'),
      apiClient.get('/restaurantes'),
      apiClient.get('/reportes/dashboard').catch(() => ({ success: false, data: {} })),
      apiClient.get(`/ordenes?estado=CERRADA&fecha_desde=${today}&fecha_hasta=${today}&per_page=100`),
    ])

    if (uData.success || uData.data) {
      const rawUser = uData.data || uData
      // Normalizar servicio_rapido en restaurante_activo
      if (rawUser?.restaurante_activo && typeof rawUser.restaurante_activo === 'object' && rawUser.restaurante_activo.servicio_rapido !== undefined) {
        rawUser.restaurante_activo.servicio_rapido = toBoolServicioRapido(rawUser.restaurante_activo.servicio_rapido)
      }
      currentUser.value = rawUser
    }
    if (rData.success || rData.data) {
      const rawRest = rData.data?.restaurantes || rData.data || []
      restaurantes.value = rawRest.map(r => ({ ...r, servicio_rapido: toBoolServicioRapido(r.servicio_rapido) }))
    }

    await loadLicencia()
    await cargarTotalUsuariosSistema()

    ordenesCerradasHoy.value = Array.isArray(cData.data) ? cData.data : []

    if (cData.statistics) {
      dashData.ventas_hoy        = cData.statistics.total_ventas_hoy || 0
      dashData.ordenes_hoy       = cData.statistics.total_ordenes    || 0
      dashData.ordenes_por_estado = cData.statistics.por_estado      || []
    } else if (dData.success || dData.data) {
      const dashboard = dData.data || dData
      dashData.ventas_hoy         = dashboard.ventas_hoy         || 0
      dashData.ordenes_por_estado = dashboard.ordenes_por_estado || []
      dashData.ordenes_hoy        = dashboard.ordenes_hoy
        ?? dashData.ordenes_por_estado.reduce((s, x) => s + Number(x.total || 0), 0)
    }

    if (rData.success || rData.data) {
      const raId     = currentUser.value?.restaurante_activo?.id ?? currentUser.value?.restaurante_activo ?? null
      const restList = rData.data?.restaurantes || rData.data || []
      const restActivo = restList.find(r => r.id === raId)
      if (restActivo?.estadisticas) {
        if (!dashData.ordenes_hoy && restActivo.estadisticas.ordenes_hoy) dashData.ordenes_hoy = restActivo.estadisticas.ordenes_hoy
        if (!dashData.ventas_hoy  && restActivo.estadisticas.ventas_hoy)  dashData.ventas_hoy  = restActivo.estadisticas.ventas_hoy
      }
    }

    // Cargar empleados desde /empleados para tener el campo activo correcto
    await cargarEmpleados()
    await cargarSucursalesDueno()
    if (activeTab.value === 'sesiones') {
      await cargarSesiones()
    }

  } catch(e) { console.error('Error loadData:', e) }
  finally { loading.general = false }
}

const cargarSucursalesDueno = async () => {
  loading.sucursales = true
  try {
    const r = await apiClient.get('/user/owner-restaurants')
    if (r.success || r.data) sucursalesDueno.value = r.data || r
  } catch(err) { console.error('Error sucursales:', err) }
  finally { loading.sucursales = false }
}

const cargarSesiones = async () => {
  loading.general = true
  try {
    const fechaDesde = getFechaDesdeFiltro(filtroSesiones.value)
    let url = '/empleados/sesiones'
    if (fechaDesde) {
      url += `?fecha_desde=${fechaDesde}`
    }
    const r = await apiClient.get(url)
    if (r.success) {
      sesiones.value = r.data || []
    }
  } catch(e) {
    console.error('Error cargando sesiones:', e)
  } finally {
    loading.general = false
  }
}

const getFechaDesdeFiltro = (filtro) => {
  const d = new Date()
  if (filtro === 'hoy') {
    return d.toLocaleDateString('en-CA') // YYYY-MM-DD
  } else if (filtro === '7d') {
    d.setDate(d.getDate() - 7)
    return d.toLocaleDateString('en-CA')
  } else if (filtro === '14d') {
    d.setDate(d.getDate() - 14)
    return d.toLocaleDateString('en-CA')
  } else if (filtro === '30d') {
    d.setDate(d.getDate() - 30)
    return d.toLocaleDateString('en-CA')
  }
  return ''
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  const cleanStr = dateStr.replace('T', ' ').replace(/\..+/, '').replace('Z', '').trim()
  const parts = cleanStr.split(' ')
  if (parts.length < 2) return dateStr
  
  const dateParts = parts[0].split('-')
  const timeParts = parts[1].split(':')
  
  const year = dateParts[0]
  const month = dateParts[1]
  const day = dateParts[2]
  
  let hours = parseInt(timeParts[0], 10)
  const minutes = timeParts[1]
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.'
  hours = hours % 12
  hours = hours ? hours : 12
  
  return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`
}

const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date()
  const cleanStr = dateStr.replace('T', ' ').replace(/\..+/, '').replace('Z', '').trim()
  const parts = cleanStr.split(' ')
  const dateParts = parts[0].split('-')
  const timeParts = parts[1].split(':')
  return new Date(
    parseInt(dateParts[0], 10),
    parseInt(dateParts[1], 10) - 1,
    parseInt(dateParts[2], 10),
    parseInt(timeParts[0], 10),
    parseInt(timeParts[1], 10),
    parseInt(timeParts[2], 10)
  )
}

const calcularDuracion = (entrada, salida) => {
  const start = parseLocalDate(entrada)
  const end = salida ? parseLocalDate(salida) : new Date()
  const diffMs = end - start
  if (diffMs < 0) return '0 min'
  
  const diffMins = Math.round(diffMs / 60000)
  if (diffMins === 0 && diffMs > 0) {
    return '1 min'
  }
  
  const hrs = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  if (hrs > 0) {
    return `${hrs}h ${mins}m`
  }
  return `${mins} min`
}

const imprimirTablaSesiones = () => {
  // Resolver el nombre real de la sucursal desde diferentes orígenes
  let restNombre = 'Mi Sucursal'
  const activeId = restauranteActivoId.value
  if (activeId) {
    const found = restaurantes.value.find(r => Number(r.id) === Number(activeId))
    if (found?.nombre) restNombre = found.nombre
  }
  if (restNombre === 'Mi Sucursal') {
    const rActivo = currentUser.value?.restaurante_activo
    if (rActivo && typeof rActivo === 'object' && rActivo.nombre) {
      restNombre = rActivo.nombre
    } else {
      const conRest = sesionesFiltradas.value.find(s => s.restaurante?.nombre)
      if (conRest?.restaurante?.nombre) {
        restNombre = conRest.restaurante.nombre
      }
    }
  }

  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head>
        <title>Reporte de Entradas y Salidas - ${restNombre}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 25px; color: #1f2937; }
          .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 20px; }
          h2 { color: #111827; margin: 0 0 5px 0; font-size: 22px; }
          .meta { color: #4b5563; font-size: 13px; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border-bottom: 1px solid #e5e7eb; padding: 10px 8px; text-align: left; font-size: 12px; }
          th { background-color: #f9fafb; color: #374151; font-weight: 600; text-transform: uppercase; font-size: 10px; }
          .badge { padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; background-color: #e0e7ff; color: #4338ca; }
          .badge-active { background-color: #d1fae5; color: #065f46; }
          .duration { font-weight: 600; color: #4f46e5; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Reporte de Entradas y Salidas de Personal</h2>
          <p class="meta">Sucursal: <strong>${restNombre}</strong> | Generado el: ${new Date().toLocaleDateString('es-MX')} a las ${new Date().toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit', hour12: true})}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Rol</th>
              <th>Hora Entrada</th>
              <th>Hora Salida / Estado</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
  `)

  sesionesFiltradas.value.forEach(ses => {
    const empName = ses.user?.name || 'Empleado Eliminado'
    const rol = ses.user ? getRolNombre(ses.user) : '—'
    const entrada = formatDateTime(ses.hora_entrada)
    const salida = ses.hora_salida ? formatDateTime(ses.hora_salida) : 'En línea / Activo'
    const duracion = calcularDuracion(ses.hora_entrada, ses.hora_salida)
    const activeClass = !ses.hora_salida ? 'badge-active' : ''
    
    printWindow.document.write(`
      <tr>
        <td><strong>${empName}</strong></td>
        <td><span class="badge ${activeClass}">${rol}</span></td>
        <td>${entrada}</td>
        <td>${salida}</td>
        <td class="duration">${duracion}</td>
      </tr>
    `)
  })

  printWindow.document.write(`
          </tbody>
        </table>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          }
        </` + `script>
      </body>
    </html>
  `)
  printWindow.document.close()
}

// ── Modales empleado ───────────────────────────────────────────────────────────
const abrirModalEmpleado = () => {
  empleadoEditando.value = null; formError.value = ''; esModoMenu.value = false
  const rActivo = currentUser.value?.restaurante_activo
  const rId = (rActivo && typeof rActivo === 'object') ? Number(rActivo.id) : (rActivo ? Number(rActivo) : null)
  Object.assign(empForm, { nombre:'', apellidos:'', email:'', usuario:'', password:'', password_confirmation:'', rol:'', restaurante_activo: rId })
  showModalEmpleado.value = true
}

const abrirModalCuentaMenu = () => {
  empleadoEditando.value = null; formError.value = ''; esModoMenu.value = true
  const rActivo = currentUser.value?.restaurante_activo
  const rId = (rActivo && typeof rActivo === 'object') ? Number(rActivo.id) : (rActivo ? Number(rActivo) : null)
  Object.assign(empForm, { nombre:'', apellidos:'', email:'', usuario:'', password:'', password_confirmation:'', rol:'7', restaurante_activo: rId })
  showModalEmpleado.value = true
}

const editarEmpleado = (emp) => {
  empleadoEditando.value = emp; formError.value = ''; esModoMenu.value = false
  const parts = (emp.name || '').split(' ')
  Object.assign(empForm, {
    nombre: parts[0] || '', apellidos: parts.slice(1).join(' ') || '',
    email: emp.email || '', usuario: emp.username || '',
    password: '', password_confirmation: '',
    rol: getRolId(emp),
    restaurante_id: (emp.restaurante_activo && typeof emp.restaurante_activo === 'object')
      ? Number(emp.restaurante_activo.id) : (emp.restaurante_activo ? Number(emp.restaurante_activo) : null)
  })
  showModalEmpleado.value = true
}

const editarCuentaMenu = (emp) => {
  empleadoEditando.value = emp; formError.value = ''; esModoMenu.value = true
  Object.assign(empForm, {
    nombre: emp.name || '', apellidos: '',
    email: emp.email || '', usuario: emp.username || '',
    password: '', password_confirmation: '',
    rol: '7',
    restaurante_id: (emp.restaurante_activo && typeof emp.restaurante_activo === 'object')
      ? Number(emp.restaurante_activo.id) : (emp.restaurante_activo ? Number(emp.restaurante_activo) : null)
  })
  showModalEmpleado.value = true
}

const cerrarModalEmpleado = () => {
  showModalEmpleado.value = false; empleadoEditando.value = null
  formError.value = ''; empForm.password = ''; empForm.password_confirmation = ''
}

const formEmpleadoRef = ref(null)

const handleGuardarEmpleado = async (payload) => {
  loading.guardando = true
  try {
    if (!payload.restaurante_id) payload.restaurante_id = restauranteActivoId.value
    payload.propietario_id = currentUser.value?.propietario_id

    const isEdit = !!empleadoEditando.value
    const r = isEdit
      ? await apiClient.put(`/users/${empleadoEditando.value.id}`, payload)
      : await apiClient.post('/register-empleado', payload)

    if (r.success) {
      showToast(isEdit ? 'Empleado actualizado' : 'Empleado creado', 'success')
      if (r.cadena_acceso) {
        formEmpleadoRef.value?.setCadena(r.cadena_acceso)
      } else {
        cerrarModalEmpleado()
      }
      await cargarEmpleados()
      await cargarTotalUsuariosSistema()
    } else {
      const msg = r.message || Object.values(r.errors||{}).flat().join(' · ') || 'Error al guardar'
      formEmpleadoRef.value?.setError(msg)
    }
  } catch (err) {
    formEmpleadoRef.value?.setError('Error de conexión con el servidor')
  } finally {
    loading.guardando = false
  }
}

const restauranteActivoId = computed(() => {
  const r = currentUser.value?.restaurante_activo
  return (r && typeof r === 'object') ? Number(r.id) : (r ? Number(r) : null)
})

const eliminarEmpleado = (emp) => {
  idToDelete.value  = emp.id
  nameToDelete.value = emp.name
  showConfirmDelete.value = true
}

const cancelarEliminacion = () => {
  showConfirmDelete.value = false
  idToDelete.value   = null
  nameToDelete.value = null
}

const handleConfirmDelete = async () => {
  if (!idToDelete.value) return
  loading.guardando = true
  try {
    const r = await apiClient.delete(`/users/${idToDelete.value}`)
    if (r.success) {
      empleados.value = empleados.value.filter(e => e.id !== idToDelete.value)
      showToast('Empleado eliminado permanentemente', 'success')
      cancelarEliminacion()
      await cargarTotalUsuariosSistema()
    } else {
      showToast(r.message || 'Error al eliminar', 'error')
    }
  } catch {
    showToast('Error de conexión', 'error')
  } finally {
    loading.guardando = false
  }
}

// ── Toggle activo/inactivo ─────────────────────────────────────────────────────
const toggleEstadoEmpleado = async (emp) => {
  console.log('ANTES toggle - emp.activo:', emp.activo, 'emp.id:', emp.id)
  try {
    const r = await apiClient.patch(`/empleados/${emp.id}/toggle-activo`)
    console.log('RESPONSE toggle:', r)
    if (r.success) {
      const idx = empleados.value.findIndex(e => e.id === emp.id)
      console.log('IDX encontrado:', idx, 'nuevo activo:', r.data.activo)
      if (idx !== -1) {
        empleados.value[idx] = { ...empleados.value[idx], activo: r.data.activo }
        console.log('empleados[idx] después:', empleados.value[idx].activo)
      }
      showToast(`Empleado ${r.data.activo ? 'activado' : 'desactivado'}`, 'success')
    } else {
      showToast(r.message || 'Error al cambiar estado', 'error')
    }
  } catch (err) {
    console.error('ERROR toggle:', err)
    showToast('Error de conexión', 'error')
  }
}

// ── Modales restaurante ────────────────────────────────────────────────────────
const abrirModalRestaurante = () => {
  restauranteEditando.value = null; formError.value = ''
  Object.assign(restForm, { nombre:'', telefono:'', calle:'', ciudad:'', estado:'', servicio_rapido: false, activo:true, imagen: null, imagen_url: null, eliminar_imagen: false })
  imgPreview.value = null
  showModalRestaurante.value = true
}

const editarRestaurante = (rest) => {
  restauranteEditando.value = rest; formError.value = ''
  Object.assign(restForm, {
    nombre: rest.nombre||'', telefono: rest.telefono||'', calle: rest.calle||'',
    ciudad: rest.ciudad||'', estado: rest.estado||'', servicio_rapido: toBoolServicioRapido(rest.servicio_rapido), activo: rest.es_activo!==false,
    imagen: null, imagen_url: rest.imagen_url, eliminar_imagen: false
  })
  imgPreview.value = null
  showModalRestaurante.value = true
}

const cerrarModalRestaurante = () => {
  showModalRestaurante.value = false; restauranteEditando.value = null
  formError.value = ''; imgPreview.value = null
}

const onFileChange = (e) => {
  const file = e.target.files[0]; if (!file) return
  restForm.imagen = file; restForm.eliminar_imagen = false
  const reader = new FileReader()
  reader.onload = (ev) => imgPreview.value = ev.target.result
  reader.readAsDataURL(file)
}

const quitarImagen = () => {
  restForm.imagen = null; restForm.imagen_url = null
  restForm.eliminar_imagen = true; imgPreview.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const guardarRestaurante = async () => {
  formError.value = ''
  if (!restForm.nombre) { formError.value = 'El nombre es obligatorio'; return }
  loading.guardando = true
  try {
    const isEdit   = !!restauranteEditando.value
    const formData = new FormData()
    formData.append('nombre',          restForm.nombre)
    formData.append('telefono',        restForm.telefono || '')
    formData.append('calle',           restForm.calle    || '')
    formData.append('ciudad',          restForm.ciudad   || '')
    formData.append('estado',          restForm.estado   || '')
    formData.append('servicio_rapido', restForm.servicio_rapido ? '1' : '0')
    formData.append('activo',          restForm.activo ? '1' : '0')
    if (isEdit) formData.append('_method', 'PUT')
    if (restForm.imagen)          formData.append('imagen',           restForm.imagen)
    if (restForm.eliminar_imagen) formData.append('eliminar_imagen',  '1')
    
    const r = isEdit
      ? await apiClient.post(`/restaurantes/${restauranteEditando.value.id}`, formData)
      : await apiClient.post('/restaurantes', formData)
    
    if (r.success) {
      // Normalizar servicio_rapido del response con helper robusto
      if (r.data && r.data.servicio_rapido !== undefined) {
        r.data.servicio_rapido = toBoolServicioRapido(r.data.servicio_rapido)
      }
      if (isEdit) {
        const idx = restaurantes.value.findIndex(x => x.id === restauranteEditando.value.id)
        if (idx !== -1) restaurantes.value[idx] = { ...restaurantes.value[idx], ...(r.data || {}) }
        // Sincronizar sucursal activa en currentUser y sessionStorage para reactividad inmediata (fix bug: cambio no se veía hasta F5)
        const activeId = restauranteActivoId.value
        if (activeId && Number(activeId) === Number(restauranteEditando.value.id)) {
          if (currentUser.value?.restaurante_activo && typeof currentUser.value.restaurante_activo === 'object') {
            currentUser.value.restaurante_activo.servicio_rapido = toBoolServicioRapido(r.data?.servicio_rapido ?? restForm.servicio_rapido)
          } else if (currentUser.value) {
            currentUser.value.restaurante_activo = { id: activeId, servicio_rapido: toBoolServicioRapido(r.data?.servicio_rapido ?? restForm.servicio_rapido) }
          }
          try {
            const raw = sessionGet('user')
            if (raw) {
              const u = JSON.parse(raw)
              const nuevoValor = toBoolServicioRapido(r.data?.servicio_rapido ?? restForm.servicio_rapido)
              if (u.restaurante_activo && typeof u.restaurante_activo === 'object') {
                u.restaurante_activo.servicio_rapido = nuevoValor
              } else if (u.restaurante_activo != null) {
                // Si era solo ID numérico, convertir a objeto para persistir el flag
                u.restaurante_activo = { id: activeId, servicio_rapido: nuevoValor }
              }
              sessionSet('user', JSON.stringify(u))
              // Disparar evento para que AppSidebar/caja/mesero reaccionen sin recargar
              const detail = (u.restaurante_activo && typeof u.restaurante_activo === 'object') ? u.restaurante_activo : { id: activeId, servicio_rapido: nuevoValor }
              window.dispatchEvent(new CustomEvent('restaurante:actualizado', { detail }))
            }
          } catch {}
        }
      } else {
        if (r.data && r.data.servicio_rapido !== undefined) r.data.servicio_rapido = toBoolServicioRapido(r.data.servicio_rapido)
        restaurantes.value.push(r.data)
      }
      showToast(isEdit ? 'Restaurante actualizado' : 'Restaurante creado', 'success')
      cerrarModalRestaurante()
    } else {
      formError.value = r.message || Object.values(r.errors||{}).flat().join(' · ') || 'Error al guardar'
    }
  } catch {
    formError.value = 'Error de conexión'
  } finally {
    loading.guardando = false
  }
}

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}${path}`
}

const eliminarRestaurante = async (id) => {
  if (!confirm('¿Eliminar restaurante?')) return
  try {
    const r = await apiClient.delete(`/restaurantes/${id}`)
    if (r.success) {
      restaurantes.value = restaurantes.value.filter(x => x.id !== id)
      showToast('Restaurante eliminado', 'success')
    } else {
      showToast(r.message || 'Error al eliminar', 'error')
    }
  } catch {
    showToast('Error de conexión', 'error')
  }
  
}

watch(filtroSesiones, () => { cargarSesiones() })
watch(activeTab, (val) => { if (val === 'sesiones') cargarSesiones() })
watch(mainTab, (val) => { if (val === 'resumen') loadData() })
onMounted(loadData)
</script>
<style scoped>
@keyframes slideIn { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
.animate-slide-in { animation: slideIn 0.3s ease-out; }
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes bounceSubtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.animate-bounce-subtle { animation: bounceSubtle 2s infinite ease-in-out; }
</style>