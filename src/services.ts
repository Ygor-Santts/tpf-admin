import { api } from './api'
import type { AdminProfile } from './session'

export interface SignInResponse {
  access_token: string
  user: AdminProfile & { isAdmin?: boolean }
}

export async function signInRequest(email: string, password: string): Promise<SignInResponse> {
  const { data } = await api.post('/auth/sign-in', { email, password })
  return data
}

export interface AdminOccupation { id: number; name: string; approved: boolean; workers: number }
export interface AdminCategory { id: number; name: string; approved: boolean; occupations: AdminOccupation[] }

export async function getCategories(): Promise<AdminCategory[]> {
  const { data } = await api.get('/admin/categories')
  return data
}
export const createCategory = (name: string) => api.post('/admin/categories', { name }).then(() => {})
export const updateCategory = (id: number, changes: { name?: string; approved?: boolean }) =>
  api.patch(`/admin/categories/${id}`, changes).then(() => {})
export const mergeCategory = (id: number, intoId: number) =>
  api.post(`/admin/categories/${id}/merge`, { intoId }).then(() => {})
export const deleteCategory = (id: number) => api.delete(`/admin/categories/${id}`).then(() => {})

export const createOccupation = (categoryId: number, name: string) =>
  api.post(`/admin/categories/${categoryId}/occupations`, { name }).then(() => {})
export const updateOccupation = (
  id: number,
  changes: { name?: string; approved?: boolean; categoryId?: number }
) => api.patch(`/admin/occupations/${id}`, changes).then(() => {})
export const mergeOccupation = (id: number, intoId: number) =>
  api.post(`/admin/occupations/${id}/merge`, { intoId }).then(() => {})
export const deleteOccupation = (id: number) => api.delete(`/admin/occupations/${id}`).then(() => {})

export type UserFilter = 'all' | 'workers' | 'clients' | 'disabled'
export interface AdminUser {
  id: number; name: string; email: string; phone: string
  enabled: boolean; isAdmin: boolean; isWorker: boolean; workerId?: number
  createdAt: string; lastAccess?: string; occupations: number; cities: number
}
export interface AdminUserDetail extends AdminUser {
  bio?: string; occupationNames: string[]; cityNames: string[]
  ratingsReceived: number; portfolioItems: number
}
export interface UserPage { data: AdminUser[]; total: number; pages: number }

export async function getUsers(params: { search?: string; filter?: UserFilter; page?: number }): Promise<UserPage> {
  const { data } = await api.get('/admin/users', { params })
  return data
}
export async function getUser(id: number): Promise<AdminUserDetail> {
  const { data } = await api.get(`/admin/users/${id}`)
  return data
}
export const setUserEnabled = (id: number, enabled: boolean) =>
  api.patch(`/admin/users/${id}`, { enabled }).then(() => {})
export const deleteUser = (id: number) => api.delete(`/admin/users/${id}`).then(() => {})
