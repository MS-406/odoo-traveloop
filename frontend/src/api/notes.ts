// frontend/src/api/notes.ts
import api from "./axiosInstance";

export interface Note {
  id: string; user_id: string; trip_id: string; stop_id: string | null;
  content: string; created_at: string; updated_at: string;
}
export interface NoteCreate { content: string; stop_id?: string; }
export interface NoteUpdate { content?: string; stop_id?: string | null; }

export const notesApi = {
  list: (tripId: string) => api.get<Note[]>(`/trips/${tripId}/notes`),
  create: (tripId: string, data: NoteCreate) => api.post<Note>(`/trips/${tripId}/notes`, data),
  update: (noteId: string, data: NoteUpdate) => api.put<Note>(`/notes/${noteId}`, data),
  delete: (noteId: string) => api.delete(`/notes/${noteId}`),
};
