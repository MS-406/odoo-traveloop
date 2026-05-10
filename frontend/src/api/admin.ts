// frontend/src/api/admin.ts
import api from "./axiosInstance";

export interface AdminUser {
  id: string; email: string; full_name: string;
  is_admin: boolean; is_active: boolean; created_at: string; updated_at: string;
}
export interface AdminStats {
  total_users: number; active_users: number; total_trips: number;
  total_cities: number; total_activities: number;
}

export const adminApi = {
  listUsers: () => api.get<AdminUser[]>("/admin/users"),
  getStats: () => api.get<AdminStats>("/admin/stats"),
  toggleUser: (userId: string) => api.patch<AdminUser>(`/admin/users/${userId}/toggle`),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
};
