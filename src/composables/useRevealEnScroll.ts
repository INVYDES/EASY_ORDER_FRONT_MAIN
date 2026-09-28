// src/composables/useRevealEnScroll.ts
//
// Entrada animada de los bloques `.reveal` cuando entran en pantalla.
//
// Igual que en la landing: en vez de dejar TODO oculto por CSS desde el primer
// render, cada bloque se "arma" (.reveal-armed) solo si todavía no está a la
// vista, y hay una red de seguridad que lo muestra aunque el observer no llegue
// a dispararse. Así el contenido nunca se queda invisible.
//
// La vista que lo use debe declarar el estado oculto en su <style scoped>:
//   .reveal { transition: opacity .8s …, transform .8s …; }
//   .reveal-armed { opacity: 0; transform: translateY(30px); }
//   .reveal.revealed { opacity: 1; transform: translateY(0); }

import { onBeforeUnmount, onMounted } from 'vue'

export function useRevealEnScroll(selector = '.reveal') {
  let observer: IntersectionObserver | null = null
  let redSeguridad: number | undefined

  onMounted(() => {
    if (!('IntersectionObserver' in window)) return

    const elementos = Array.from(document.querySelectorAll<HTMLElement>(selector))
    if (!elementos.length) return

    // con movimiento reducido no se anima nada: todo visible de una vez
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elementos.forEach((el) => el.classList.add('revealed'))
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('revealed')
          observer?.unobserve(entry.target)
        })
      },
      // threshold 0 (y no 0.1) para que un bloque más alto que la pantalla
      // también se muestre al asomar por el borde inferior
      { threshold: 0, rootMargin: '0px 0px -40px 0px' },
    )

    elementos.forEach((el) => {
      const yaVisible = el.getBoundingClientRect().top < window.innerHeight * 0.92
      if (yaVisible) {
        el.classList.add('revealed')
        return
      }
      el.classList.add('reveal-armed')
      observer!.observe(el)
    })

    // Red de seguridad: lo que quede armado y ya esté en pantalla se muestra igual.
    redSeguridad = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>(`${selector}.reveal-armed:not(.revealed)`)
        .forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('revealed')
        })
    }, 2500)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    if (redSeguridad) window.clearTimeout(redSeguridad)
  })
}
