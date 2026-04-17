export interface ApiResponse<T> {
  data: T
  meta?: {
    total?: number
    page?: number
    per_page?: number
  }
}

export interface ApiError {
  error: string
  message: string
  status_code: number
}
