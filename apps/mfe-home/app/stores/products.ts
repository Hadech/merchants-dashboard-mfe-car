import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProductsStore = defineStore('products', () => {
  const payoutsAvailable = ref(false)
  const products = ref<any[]>([])
  const correspondentBanksAvailable = ref(false)

  async function fetchProducts(merchantId: string) {
    try {
      const data = await $fetch<any[]>(`/products?merchant_id=${merchantId}`)
      products.value = data
      payoutsAvailable.value = data.some(
        (p: any) => p.name === 'payouts' && p.status === 'ACTIVE'
      )
      correspondentBanksAvailable.value = data.some(
        (p: any) => p.name === 'correspondent_banks' && p.status === 'ACTIVE'
      )
    } catch {
      console.error('Failed to fetch products')
    }
  }

  return { payoutsAvailable, products, correspondentBanksAvailable, fetchProducts }
})
