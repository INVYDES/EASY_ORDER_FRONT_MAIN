// src/utils/tema.ts
//
// Aplica el tema (claro/oscuro) elegido por el visitante a TODO el sitio
// público, no solo a la landing: añade la clase `tema-oscuro` a <html> para
// que las utilidades `dark:` de Tailwind y los overrides `html.tema-oscuro …`
// de los estilos con scope respondan al toggle de PreferenciasControl.
//
// El panel interno sigue sin depender de esto (sus vistas no usan dark:).

import { watch } from 'vue'
import { usePreferencias } from '@/stores/preferencias'

let iniciado = false

/** Llamar una sola vez tras montar Pinia (ver main.ts). */
export function iniciarTemaGlobal(): void {
  if (iniciado) return
  iniciado = true

  const preferencias = usePreferencias()

  const aplicar = (oscuro: boolean) => {
    document.documentElement.classList.toggle('tema-oscuro', oscuro)

    // La barra del navegador acompaña al tema en las páginas públicas.
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', oscuro ? '#0b1220' : '#4f46e5')
  }

  aplicar(preferencias.oscuro)
  watch(() => preferencias.oscuro, aplicar)
}
