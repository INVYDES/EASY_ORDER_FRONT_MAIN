import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as { id: number; message: string; type: 'success' | 'error' | 'info'; duration: number }[],
  }),
  actions: {
    notify(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
      const id = Date.now()
      this.notifications.push({ id, message, type, duration })

      setTimeout(() => {
        this.remove(id)
      }, duration)
    },
    remove(id: number) {
      this.notifications = this.notifications.filter((n) => n.id !== id)
    },
  },
})
