// frontend/src/api/collaborative.ts
// API client for collaborative trip planning feature.

import api from "@/api/axiosInstance";

// ── Types ─────────────────────────────────────────────────────────

export interface CollabTrip {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  status: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  stop_count: number;
  my_role: string | null;
}

export interface CollabMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export interface CollabVote {
  id: string;
  user_id: string;
  vote: "yes" | "no" | "maybe";
  full_name: string;
}

export interface CollabStop {
  id: string;
  trip_id: string;
  city_name: string;
  country: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  added_by: string | null;
  added_by_name: string | null;
  position_order: number;
  created_at: string;
  votes: CollabVote[];
  vote_summary: { yes: number; no: number; maybe: number };
}

export interface CollabComment {
  id: string;
  trip_id: string;
  stop_id: string | null;
  user_id: string;
  content: string;
  created_at: string;
  full_name: string;
  avatar_url: string | null;
}

export interface CollabTripDetail extends CollabTrip {
  members: CollabMember[];
  stops: CollabStop[];
  comments: CollabComment[];
}

export interface CollabPollResponse {
  updated_at: string;
  member_count: number;
  stop_count: number;
  latest_comments: CollabComment[];
}

export interface CreateCollabTripPayload {
  title: string;
  description?: string;
}

export interface AddStopPayload {
  city_name: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  position_order?: number;
}

// ── API Functions ─────────────────────────────────────────────────

export const collabApi = {
  list: () => api.get<CollabTrip[]>("/collaborative"),
  get: (id: string) => api.get<CollabTripDetail>(`/collaborative/${id}`),
  create: (data: CreateCollabTripPayload) =>
    api.post<CollabTrip>("/collaborative", data),
  update: (id: string, data: { title?: string; description?: string; status?: string }) =>
    api.put(`/collaborative/${id}`, data),
  remove: (id: string) => api.delete(`/collaborative/${id}`),

  join: (code: string) =>
    api.post<{ message: string; trip_id: string; role: string }>(`/collaborative/join/${code}`),
  leave: (id: string) => api.delete(`/collaborative/${id}/leave`),
  removeMember: (id: string, userId: string) =>
    api.delete(`/collaborative/${id}/members/${userId}`),
  changeRole: (id: string, userId: string, role: string) =>
    api.patch(`/collaborative/${id}/members/${userId}/role`, { role }),

  addStop: (id: string, data: AddStopPayload) =>
    api.post(`/collaborative/${id}/stops`, data),
  updateStop: (id: string, stopId: string, data: Partial<AddStopPayload>) =>
    api.put(`/collaborative/${id}/stops/${stopId}`, data),
  deleteStop: (id: string, stopId: string) =>
    api.delete(`/collaborative/${id}/stops/${stopId}`),

  vote: (id: string, stopId: string, vote: "yes" | "no" | "maybe") =>
    api.post(`/collaborative/${id}/stops/${stopId}/vote`, { vote }),

  addComment: (id: string, content: string, stopId?: string) =>
    api.post(`/collaborative/${id}/comments`, { content, stop_id: stopId }),
  listComments: (id: string, limit = 50, offset = 0) =>
    api.get<CollabComment[]>(`/collaborative/${id}/comments`, { params: { limit, offset } }),

  poll: (id: string) => api.get<CollabPollResponse>(`/collaborative/${id}/poll`),
};
