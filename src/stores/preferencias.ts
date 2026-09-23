// src/stores/preferencias.ts
//
// Preferencias de presentación de la landing pública: idioma (ES/EN) y tema
// (claro/oscuro). Se guardan en localStorage, así que la elección sobrevive al
// refresco y a la navegación entre páginas.
//
// Alcance actual: SOLO la landing. El panel interno sigue en español y en claro.

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { IDIOMAS, TEXTOS, traducirValor, type ClaveTexto, type Idioma } from '@/i18n/landing'

export type Tema = 'claro' | 'oscuro'

const CLAVE = 'eorder:preferencias'

type Guardado = { tema?: Tema; idioma?: Idioma }

function leerGuardado(): Guardado {
  try {
    const bruto = localStorage.getItem(CLAVE)
    if (!bruto) return {}
    const datos = JSON.parse(bruto) as Guardado
    const tema = datos.tema === 'claro' || datos.tema === 'oscuro' ? datos.tema : undefined
    const idioma = datos.idioma === 'es' || datos.idioma === 'en' ? datos.idioma : undefined
    return { tema, idioma }
  } catch {
    // Navegador con almacenamiento bloqueado: se usan los valores por defecto.
    return {}
  }
}

/** ¿El sistema operativo del visitante pide tema oscuro? */
function sistemaPideOscuro(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export const usePreferencias = defineStore('preferencias', () => {
  const guardado = leerGuardado()

  // Si el visitante nunca eligió, se respeta la preferencia del sistema.
  const tema = ref<Tema>(guardado.tema ?? (sistemaPideOscuro() ? 'oscuro' : 'claro'))
  const idioma = ref<Idioma>(guardado.idioma ?? 'es')

  const oscuro = computed(() => tema.value === 'oscuro')

  /** Texto traducido de una clave del diccionario */
  const t = (clave: ClaveTexto): string => TEXTOS[idioma.value][clave] ?? TEXTOS.es[clave]

  /** Traduce valores que vienen de config/planes.ts (única fuente de precios) */
  const tv = (valor: string): string => traducirValor(valor, idioma.value)

  function persistir() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ tema: tema.value, idioma: idioma.value }))
    } catch {
      // Sin persistencia el cambio sigue funcionando durante la sesión.
    }
  }

  // No se toca el atributo lang del documento: el panel interno sigue en
  // español. La landing declara su propio idioma con :lang en su raíz.
  function setIdioma(valor: Idioma) {
    idioma.value = valor
    persistir()
  }

  function setTema(valor: Tema) {
    tema.value = valor
    persistir()
  }

  const alternarTema = () => setTema(oscuro.value ? 'claro' : 'oscuro')
  const alternarIdioma = () => setIdioma(idioma.value === 'es' ? 'en' : 'es')

  return { tema, idioma, oscuro, idiomas: IDIOMAS, t, tv, setIdioma, setTema, alternarTema, alternarIdioma }
})
