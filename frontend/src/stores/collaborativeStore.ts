// frontend/src/stores/collaborativeStore.ts
// Zustand store for collaborative trip planning state.

import { create } from "zustand";
import {
  collabApi,
  CollabTrip,
  CollabTripDetail,
  AddStopPayload,
  CreateCollabTripPayload,
} from "@/api/collaborative";
import toast from "react-hot-toast";

interface CollaborativeState {
  trips: CollabTrip[];
  activeTrip: CollabTripDetail | null;
  isLoading: boolean;
  isWorkspaceLoading: boolean;
  lastPollAt: string | null;

  fetchTrips: () => Promise<void>;
  fetchTrip: (id: string) => Promise<void>;
  createTrip: (data: CreateCollabTripPayload) => Promise<CollabTrip>;
  joinTrip: (inviteCode: string) => Promise<string>;
  leaveTrip: (id: string) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  addStop: (tripId: string, data: AddStopPayload) => Promise<void>;
  updateStop: (tripId: string, stopId: string, data: Partial<AddStopPayload>) => Promise<void>;
  deleteStop: (tripId: string, stopId: string) => Promise<void>;
  vote: (tripId: string, stopId: string, vote: "yes" | "no" | "maybe") => Promise<void>;
  addComment: (tripId: string, content: string, stopId?: string) => Promise<void>;
  removeMember: (tripId: string, userId: string) => Promise<void>;
  changeRole: (tripId: string, userId: string, role: string) => Promise<void>;
  pollForUpdates: (id: string) => Promise<boolean>;
}

export const useCollaborativeStore = create<CollaborativeState>((set, get) => ({
  trips: [],
  activeTrip: null,
  isLoading: false,
  isWorkspaceLoading: false,
  lastPollAt: null,

  fetchTrips: async () => {
    set({ isLoading: true });
    try {
      const { data } = await collabApi.list();
      set({ trips: data });
    } catch {
      toast.error("Failed to load collaborative trips");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTrip: async (id: string) => {
    set({ isWorkspaceLoading: true });
    try {
      const { data } = await collabApi.get(id);
      set({ activeTrip: data, lastPollAt: data.updated_at });
    } catch {
      toast.error("Failed to load trip details");
    } finally {
      set({ isWorkspaceLoading: false });
    }
  },

  createTrip: async (data: CreateCollabTripPayload) => {
    const { data: trip } = await collabApi.create(data);
    set((s) => ({ trips: [trip, ...s.trips] }));
    return trip;
  },

  joinTrip: async (inviteCode: string) => {
    const { data } = await collabApi.join(inviteCode);
    await get().fetchTrips();
    return data.trip_id;
  },

  leaveTrip: async (id: string) => {
    await collabApi.leave(id);
    set((s) => ({ trips: s.trips.filter((t) => t.id !== id), activeTrip: null }));
  },

  deleteTrip: async (id: string) => {
    await collabApi.remove(id);
    set((s) => ({ trips: s.trips.filter((t) => t.id !== id), activeTrip: null }));
  },

  addStop: async (tripId: string, data: AddStopPayload) => {
    await collabApi.addStop(tripId, data);
    await get().fetchTrip(tripId);
  },

  updateStop: async (tripId: string, stopId: string, data: Partial<AddStopPayload>) => {
    await collabApi.updateStop(tripId, stopId, data);
    await get().fetchTrip(tripId);
  },

  deleteStop: async (tripId: string, stopId: string) => {
    await collabApi.deleteStop(tripId, stopId);
    await get().fetchTrip(tripId);
  },

  vote: async (tripId: string, stopId: string, vote: "yes" | "no" | "maybe") => {
    await collabApi.vote(tripId, stopId, vote);
    // Optimistic: refetch
    await get().fetchTrip(tripId);
  },

  addComment: async (tripId: string, content: string, stopId?: string) => {
    await collabApi.addComment(tripId, content, stopId);
    await get().fetchTrip(tripId);
  },

  removeMember: async (tripId: string, userId: string) => {
    await collabApi.removeMember(tripId, userId);
    await get().fetchTrip(tripId);
  },

  changeRole: async (tripId: string, userId: string, role: string) => {
    await collabApi.changeRole(tripId, userId, role);
    await get().fetchTrip(tripId);
  },

  pollForUpdates: async (id: string) => {
    try {
      const { data } = await collabApi.poll(id);
      const lastPoll = get().lastPollAt;
      if (data.updated_at !== lastPoll) {
        set({ lastPollAt: data.updated_at });
        return true; // Data changed — caller should refetch
      }
      return false;
    } catch {
      return false;
    }
  },
}));
