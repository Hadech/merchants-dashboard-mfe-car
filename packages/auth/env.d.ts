interface ImportMetaEnv {
  readonly VITE_API_GW_BASE_URL: string
  readonly VITE_DASHBOARD_USER_POOL_ID: string
  readonly VITE_DASHBOARD_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
