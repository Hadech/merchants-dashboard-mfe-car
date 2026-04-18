import { useApiClient } from '@wompi/api-client'

/**
 * Matches legacy:
 * - apiCalls.js > documentsApi(filters), documentById(id)
 * - GET /documents with params: from_date, until_date, page_size, page, type
 * - GET /documents/{id} → returns { data: { url } }
 */
export function useDocumentsApi() {
  const api = useApiClient()

  /** GET /documents — legacy: documentsApi(filters) */
  async function getDocuments(filters: Record<string, unknown>) {
    return api<{ data: any[]; meta: { total_results: number; page_size: number } }>('/documents', {
      query: filters,
    })
  }

  /** GET /documents/{id} — legacy: documentById(id) → returns download URL */
  async function getDocumentUrl(id: string) {
    const res = await api<{ data: { url: string } }>(`/documents/${id}`)
    return res.data.url
  }

  return { getDocuments, getDocumentUrl }
}
