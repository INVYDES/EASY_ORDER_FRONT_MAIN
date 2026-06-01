import { ref, onMounted, onUnmounted } from 'vue'

export function useDeviceZoom() {
  const zoom = ref(1)

  function updateZoom() {
    const w = window.innerWidth
    if (w >= 768 && w <= 1366) {
      zoom.value = 1.2
    } else {
      zoom.value = 1
    }
  }

  onMounted(() => {
    updateZoom()
    window.addEventListener('resize', updateZoom)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateZoom)
  })

  return { zoom }
}
