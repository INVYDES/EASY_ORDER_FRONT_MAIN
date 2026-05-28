import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)
  const systemPrefersDark = ref(false)
  let mediaQuery: MediaQueryList | null = null
  let mediaListener: ((e: MediaQueryListEvent) => void) | null = null

  function init() {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemPrefersDark.value = mediaQuery.matches

    const stored = localStorage.getItem('theme')
    isDark.value = stored !== null ? stored === 'dark' : systemPrefersDark.value
    apply()

    mediaListener = (e: MediaQueryListEvent) => {
      systemPrefersDark.value = e.matches
      if (localStorage.getItem('theme') === null) {
        isDark.value = e.matches
      }
    }
    mediaQuery.addEventListener('change', mediaListener)
  }

  function destroy() {
    if (mediaQuery && mediaListener) {
      mediaQuery.removeEventListener('change', mediaListener)
    }
  }

  function apply() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggle() {
    localStorage.setItem('theme', isDark.value ? 'light' : 'dark')
    isDark.value = !isDark.value
  }

  watch(isDark, apply)

  return { isDark, init, destroy, toggle }
})
