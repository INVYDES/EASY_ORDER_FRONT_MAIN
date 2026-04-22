import { defineStore } from 'pinia'

export const useCajaStore = defineStore('caja', {

  state: () => ({
    tickets: [] as any[],

    openingAmount: 0,
    movements: [] as any[],
    closures: [] as any[],

    isOpen: true   // 🔥 CONTROL MAESTRO
  }),

  getters: {

    openTickets: (state) =>
      state.tickets.filter(t => t.status === 'open'),

    closedTickets: (state) =>
      state.tickets.filter(t => t.status === 'closed'),

    dailySales: (state) =>
      state.tickets
        .filter(t => t.status === 'closed')
        .reduce((acc, t) => acc + t.total, 0),

    cashInRegister: (state) =>
      state.openingAmount +
      state.movements
        .filter(m => !m.paymentMethod || m.paymentMethod === 'Efectivo')
        .reduce((acc, m) => acc + m.amount, 0),

    salesByCard: (state) =>
      state.movements
        .filter(m => m.paymentMethod === 'Tarjeta')
        .reduce((acc, m) => acc + m.amount, 0),

    salesByTransfer: (state) =>
      state.movements
        .filter(m => m.paymentMethod === 'Transferencia')
        .reduce((acc, m) => acc + m.amount, 0)
  },

  actions: {

    addOrderToCaja(order: any) {

      if (!this.isOpen) return   // 🔥 BLOQUEO

      const existingTicket = this.tickets.find(
        t => t.table === order.table && t.status === 'open'
      )

      if (existingTicket) {

        order.items.forEach((newItem: any) => {

          const existingItem = existingTicket.items.find(
            (i: any) => i.id === newItem.id
          )

          if (existingItem) {
            existingItem.quantity += newItem.quantity
          } else {
            existingTicket.items.push(newItem)
          }

        })

        existingTicket.total += order.total

      } else {

        this.tickets.push({
          id: Date.now(),
          table: order.table,
          status: 'open',
          items: [...order.items],
          total: order.total,
          createdAt: new Date().toISOString()
        })
      }
    },

    setOpeningAmount(amount: number) {
      this.openingAmount = amount
      //this.isOpen = true     // 🔥 REABRIR
    },

    opencaja() {
      this.isOpen = true

    },

    closeTicket(ticketId: number) {
      const ticket = this.tickets.find(t => t.id === ticketId)
      if (ticket) ticket.status = 'closed'
    },

    registerPayment(ticket: any, paidAmount: number, paymentMethod: string = 'Efectivo', folio: string = 'NA') {

      if (!this.isOpen) return   // 🔥 BLOQUEO

      const change = paidAmount - ticket.total

      this.movements.push({
        id: Date.now(),
        table: ticket.table,
        ticketId: ticket.id,
        total: ticket.total,
        paid: paidAmount,
        change: change,
        amount: ticket.total,
        paymentMethod,
        folio,
        timestamp: new Date().toISOString()
      })

      this.closeTicket(ticket.id)
    },

    closeRegister(realCash: number) {

      const expectedCash = this.cashInRegister
      const difference = realCash - expectedCash

      const corte = {
        id: Date.now(),
        expected: expectedCash,
        real: realCash,
        difference,
        timestamp: new Date().toISOString()
      }

      this.closures.push(corte)

      console.log('CIERRE DE CAJA:', corte)

      // 🔥 RESET DE TURNO
      this.tickets = []
      this.movements = []
      this.openingAmount = 0

      // 🔥 BLOQUEAR CAJA
      this.isOpen = false
    }
  }
})