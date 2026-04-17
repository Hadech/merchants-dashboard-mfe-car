export interface DashboardUser {
  id: string
  name: string
  email: string
  phone: string | null
  role: UserRole
  status: 'ACTIVE' | 'DISABLED'
  created_at: string
}

export interface UserRole {
  id: string
  name: string
  permissions: Permission[]
}

export interface Permission {
  id: string
  module: string
  action: string
}

export interface CreateUserRequest {
  name: string
  email: string
  phone: string
  role_id: string
}
