import { defineStore } from 'pinia'
import type { Product } from '../stores/productos'
import { useMeseroStore } from '../stores/mesero'
import { useProductsStore } from '../stores/productos'


export const useOrderStore = defineStore('order', {
  state: () => ({
    items: [] as Array<Product & { quantity: number; note: string }>,
    table: null as number | null
  }),

  getters: {
    total: (state) =>
      state.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  },

  actions: {
    addItem(product: Product) {

      const productsStore = useProductsStore()

      if (product.stock === 0) return

      const existing = this.items.find(p => p.id === product.id)

      if (existing) {
        existing.quantity++
      } else {
        this.items.push({
          ...product,
          quantity: 1,
          note: ''
        })
      }

      productsStore.decreaseStock(product.id)

    },

    removeItem(id: number) {

      const productsStore = useProductsStore()

      const item = this.items.find(p => p.id === id)

      if (!item) return

      // 🔥 DEVOLVER STOCK COMPLETO
      productsStore.increaseStock(id)

      this.items = this.items.filter(item => item.id !== id)
    },

    increaseQuantity(id: number) {
      const productsStore = useProductsStore()
      const item = this.items.find(p => p.id === id)
      if (!item) return
      const product = productsStore.products.find(p => p.id === id)
      if (!product || product.stock === 0) return
      item.quantity++
      // 🔥 DESCUENTO
      productsStore.decreaseStock(id)
    },

    decreaseQuantity(id: number) {
      const productsStore = useProductsStore()
      const item = this.items.find(p => p.id === id)
      if (!item) return
      if (item.quantity > 1) {
        item.quantity--
        productsStore.increaseStock(id)
      } else {
        this.removeItem(id)
      }
    },

    updateNote(id: number, note: string) {
      const item = this.items.find(p => p.id === id)
      if (item) item.note = note
    },


    sendOrder() {
      const meseroStore = useMeseroStore()

      if (this.items.length === 0) return;

      /* ✅ Payload base enviado al mesero */
      const meseroPayload = {
        id: Date.now(),
        restaurantId: 1, // o el id de restaurante actual según tu sesión real
        table: this.table,
        timestamp: new Date().toISOString(),
        items: this.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          note: item.note,
          category: item.category,
          price: item.price
        })),
        total: this.total
      }

      meseroStore.addOrder(meseroPayload)
      console.log('Orden enviada al mesero (pendiente):', meseroPayload)

      /* ✅ RESET */
      this.items = []
      this.table = null
    },

  }
})
