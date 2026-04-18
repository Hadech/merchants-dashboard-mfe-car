export const useProductsStore = defineStore('products', () => {
  const payoutsAvailable = ref(false)
  const products = ref<any[]>([])
  const correspondentBanksAvailable = ref(false)

  function getPayoutProduct(data: any[]): any | null {
    return data.find(product => product.product && product.product.code === 'payouts') || null
  }

  function checkProductStatus(status: string): boolean {
    return status === 'ACTIVE'
  }

  function hasCorrespondentBanks(data: any[]): boolean {
    if (!Array.isArray(data) || data.length === 0) return false
    return data.some(
      product => product.product && product.product.code === 'correspondents' && product.status === 'ACTIVE'
    )
  }

  async function fetchProducts(merchantId: string) {
    try {
      const data = await $fetch<{ data: any[] }>(`/products?merchantId=${merchantId}`)
      products.value = data.data

      const payoutProduct = getPayoutProduct(data.data)
      if (payoutProduct) {
        payoutsAvailable.value = checkProductStatus(payoutProduct.status)
      }

      correspondentBanksAvailable.value = hasCorrespondentBanks(data.data)
    } catch (err: any) {
      console.error('[mfe-home] Failed to fetch products:', err?.message)
      correspondentBanksAvailable.value = false
    }
  }

  return {
    payoutsAvailable,
    products,
    correspondentBanksAvailable,
    fetchProducts,
  }
})
