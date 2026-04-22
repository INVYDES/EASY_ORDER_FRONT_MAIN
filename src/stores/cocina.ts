import { defineStore } from 'pinia'

export const useKitchenStore = defineStore('kitchen', {
  state: () => ({
    orders: [] as any[]
  }),

  getters: {
    pendingOrders: (state) =>
      state.orders.filter(order => order.status === 'pendiente'),

    preparingOrders: (state) =>
      state.orders.filter(order => order.status === 'preparando'),

    readyOrders: (state) =>
      state.orders.filter(order => order.status === 'lista')
  },

  actions: {
    addOrder(order: any) {
      this.orders.push({
        ...order,
        status: 'pendiente'
      })
    },

    startPreparing(id: number) {
      const order = this.orders.find(o => o.id === id)
      if (order) order.status = 'preparando'
    },

    markAsReady(id: number) {
      const order = this.orders.find(o => o.id === id)
      if (order) order.status = 'lista'
    }
  }
})
