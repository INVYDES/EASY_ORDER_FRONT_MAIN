import { defineStore } from 'pinia'

export interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  stock: number 
}

export const useProductsStore = defineStore('products', {

  state: () => ({
    products: [] as Product[],
    search: ''
  }),

    getters: {

    filteredProducts: (state) => {

      if (!state.search) return state.products

      return state.products.filter(p =>
        p.name.toLowerCase().includes(state.search.toLowerCase())
      )
    }

  },


  actions: {

    addProduct(product: Omit<Product, 'id'>) {

      this.products.push({
        id: Date.now(),
        ...product
      })
    console.log('Producto agregado:', product)

    },

    updateProduct(updatedProduct: Product) {

      const index = this.products.findIndex(p => p.id === updatedProduct.id)

      if (index !== -1) {
        this.products[index] = updatedProduct
      }
    },

    deleteProduct(id: number) {
      this.products = this.products.filter(p => p.id !== id)
    },

    decreaseStock(productId: number) {

      const product = this.products.find(p => p.id === productId)

      if (!product) return

      if (product.stock > 0) {
        product.stock--
      }
    },

    increaseStock(productId: number) {

      const product = this.products.find(p => p.id === productId)

      if (!product) return
       product.stock++
    }

  }

})