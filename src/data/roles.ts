export interface Role {
  id: number
  nombre: string
  display_name: string
}

export interface Permission {
  key: string
  label: string
}

export interface PermissionGroup {
  key: string
  label: string
  permissions: Permission[]
}

export const ROLES: Role[] = [
  { id: 2, nombre: 'ADMIN', display_name: 'Administrador' },
  { id: 3, nombre: 'MESERO', display_name: 'Mesero' },
  { id: 4, nombre: 'COCINA', display_name: 'Cocina' },
  { id: 5, nombre: 'CAJA', display_name: 'Caja' },
  { id: 6, nombre: 'BARRA', display_name: 'Barra' },
  { id: 7, nombre: 'MENU', display_name: 'Menú' },
]

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: 'modulos',
    label: 'Módulos',
    permissions: [
      { key: 'VER_MESERO', label: 'Mesero' },
      { key: 'VER_COCINA', label: 'Cocina' },
      { key: 'VER_BARRA', label: 'Barra' },
      { key: 'VER_CAJA', label: 'Caja' },
      { key: 'VER_CLIENTE', label: 'Cliente' },
    ],
  },
  {
    key: 'gestion',
    label: 'Gestión',
    permissions: [
      { key: 'GESTIONAR_PRODUCTOS', label: 'Productos' },
      { key: 'GESTIONAR_EMPLEADOS', label: 'Empleados' },
      { key: 'GESTIONAR_INGREDIENTES', label: 'Ingredientes' },
      { key: 'GESTIONAR_GASTOS', label: 'Gastos' },
      { key: 'GESTIONAR_MESAS', label: 'Mesas' },
    ],
  },
  {
    key: 'reportes',
    label: 'Reportes',
    permissions: [
      { key: 'VER_REPORTES_VENTAS', label: 'Ventas' },
      { key: 'EXPORTAR_DATOS', label: 'Exportar' },
    ],
  },
]

export const ROLE_PRESETS: Record<number, string[]> = {
  1: PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key)),
  2: PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key)),
  3: ['VER_MESERO', 'VER_CLIENTE', 'GESTIONAR_MESAS'],
  4: ['VER_COCINA'],
  5: ['VER_CAJA', 'VER_REPORTES_VENTAS', 'EXPORTAR_DATOS'],
  6: ['VER_BARRA'],
  7: ['VER_CLIENTE'],
}
