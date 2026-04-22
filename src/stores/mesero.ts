import { defineStore } from 'pinia'
import { useKitchenStore } from './cocina'
import { useBarraStore } from './barra'
import { useCajaStore } from './caja'
import { useProductsStore } from './productos'

export interface OrderItem {
    id: number
    name: string
    quantity: number
    note: string
    category: string
    price: number
}

export interface WaiterOrder {
    id: number
    restaurantId: number
    table: number | null
    timestamp: string
    items: OrderItem[]
    total: number
}

export const useMeseroStore = defineStore('mesero', {
    state: () => ({
        orders: [] as WaiterOrder[]
    }),

    actions: {
        addOrder(order: WaiterOrder) {
            this.orders.push(order)
        },

        removeOrderItem(orderId: number, itemId: number) {
            const order = this.orders.find(o => o.id === orderId)
            if (!order) return

            const itemIndex = order.items.findIndex(i => i.id === itemId)
            if (itemIndex === -1) return

            const item = order.items[itemIndex]
            if (!item) return

            const productsStore = useProductsStore()

            // Devolver stock
            for (let i = 0; i < item.quantity; i++) {
                productsStore.increaseStock(item.id)
            }

            // Eliminar el item
            order.items.splice(itemIndex, 1)

            // Recalcular el total
            order.total = order.items.reduce((acc, i) => acc + i.price * i.quantity, 0)

            // Si la orden se queda sin items, la eliminamos
            if (order.items.length === 0) {
                this.orders = this.orders.filter(o => o.id !== orderId)
            }
        },

        updateOrderItemNote(orderId: number, itemId: number, newNote: string) {
            const order = this.orders.find(o => o.id === orderId)
            if (!order) return

            const item = order.items.find(i => i.id === itemId)
            if (item) {
                item.note = newNote
            }
        },

        confirmOrder(orderId: number) {
            const orderIndex = this.orders.findIndex(o => o.id === orderId)
            if (orderIndex === -1) return

            const order = this.orders[orderIndex]
            if (!order) return

            const kitchenStore = useKitchenStore()
            const bebidaStore = useBarraStore()
            const cajaStore = useCajaStore()

            const foodItems = order.items.filter(i => i.category === 'comida')
            const drinkItems = order.items.filter(i => i.category === 'bebida')

            const basePayload = {
                id: order.id,
                restaurantId: order.restaurantId,
                table: order.table,
                timestamp: order.timestamp
            }

            // Despachar a Cocina
            if (foodItems.length) {
                kitchenStore.addOrder({
                    ...basePayload,
                    items: foodItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        note: item.note,
                        category: item.category
                    })),
                    total: foodItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
                    status: 'pendiente'
                })
            }

            // Despachar a Barra
            if (drinkItems.length) {
                bebidaStore.addOrder({
                    ...basePayload,
                    items: drinkItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        note: item.note,
                        category: item.category
                    })),
                    total: drinkItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
                    status: 'pendiente'
                })
            }

            // Despachar a Caja (Siempre)
            cajaStore.addOrderToCaja({
                ...basePayload,
                items: order.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    note: item.note,
                    category: item.category
                })),
                total: order.total
            })

            // Eliminar de las órdenes del mesero
            this.orders.splice(orderIndex, 1)
        }
    }
})
