// frontend/src/api/checklist.ts
import api from "./axiosInstance";

export interface ChecklistItem {
  id: string; trip_id: string; name: string;
  category: string; is_packed: boolean; created_at: string;
}
export interface ChecklistCreate { name: string; category: string; }
export interface ChecklistUpdate { name?: string; category?: string; is_packed?: boolean; }

export const checklistApi = {
  list: (tripId: string) => api.get<ChecklistItem[]>(`/trips/${tripId}/checklist`),
  create: (tripId: string, data: ChecklistCreate) => api.post<ChecklistItem>(`/trips/${tripId}/checklist`, data),
  update: (itemId: string, data: ChecklistUpdate) => api.put<ChecklistItem>(`/checklist/${itemId}`, data),
  toggle: (itemId: string) => api.patch<ChecklistItem>(`/checklist/${itemId}/toggle`),
  delete: (itemId: string) => api.delete(`/checklist/${itemId}`),
};
