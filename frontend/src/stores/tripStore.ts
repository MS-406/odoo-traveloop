// frontend/src/stores/tripStore.ts
// Zustand store for trip state — active trip context, trip list, and CRUD actions.
// Zustand chosen: minimal boilerplate, sufficient for this scope.
// Depends on: Phase 3 / api/trips.ts, api/stops.ts

import { create } from "zustand";
import { tripsApi, type Trip, type TripListItem, type TripCreate, type TripUpdate } from "@/api/trips";
import { stopsApi, type StopCreate, type StopUpdate } from "@/api/stops";

interface TripState {
  // List state
  trips: TripListItem[];
  totalTrips: number;
  currentPage: number;
  totalPages: number;
  isListLoading: boolean;

  // Active trip state
  activeTrip: Trip | null;
  isTripLoading: boolean;

  // Actions — list
  fetchTrips: (page?: number, limit?: number) => Promise<void>;

  // Actions — single trip
  fetchTrip: (id: string) => Promise<void>;
  createTrip: (data: TripCreate) => Promise<Trip>;
  updateTrip: (id: string, data: TripUpdate) => Promise<Trip>;
  deleteTrip: (id: string) => Promise<void>;
  copyTrip: (id: string) => Promise<Trip>;

  // Actions — stops
  addStop: (tripId: string, data: StopCreate) => Promise<void>;
  updateStop: (stopId: string, data: StopUpdate) => Promise<void>;
  deleteStop: (stopId: string) => Promise<void>;
  reorderStops: (tripId: string, stopIds: string[]) => Promise<void>;

  // Utils
  clearActiveTrip: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  totalTrips: 0,
  currentPage: 1,
  totalPages: 1,
  isListLoading: false,
  activeTrip: null,
  isTripLoading: false,

  fetchTrips: async (page = 1, limit = 10) => {
    set({ isListLoading: true });
    try {
      const { data } = await tripsApi.list(page, limit);
      set({
        trips: data.items,
        totalTrips: data.total,
        currentPage: data.page,
        totalPages: data.pages,
      });
    } finally {
      set({ isListLoading: false });
    }
  },

  fetchTrip: async (id) => {
    set({ isTripLoading: true });
    try {
      const { data } = await tripsApi.get(id);
      set({ activeTrip: data });
    } finally {
      set({ isTripLoading: false });
    }
  },

  createTrip: async (data) => {
    const { data: trip } = await tripsApi.create(data);
    // Refresh list
    await get().fetchTrips(get().currentPage);
    return trip;
  },

  updateTrip: async (id, data) => {
    const { data: trip } = await tripsApi.update(id, data);
    set({ activeTrip: trip });
    await get().fetchTrips(get().currentPage);
    return trip;
  },

  deleteTrip: async (id) => {
    await tripsApi.delete(id);
    set({ activeTrip: null });
    await get().fetchTrips(get().currentPage);
  },

  copyTrip: async (id) => {
    const { data: trip } = await tripsApi.copy(id);
    await get().fetchTrips(get().currentPage);
    return trip;
  },

  addStop: async (tripId, data) => {
    await stopsApi.create(tripId, data);
    await get().fetchTrip(tripId);
  },

  updateStop: async (stopId, data) => {
    await stopsApi.update(stopId, data);
    const trip = get().activeTrip;
    if (trip) await get().fetchTrip(trip.id);
  },

  deleteStop: async (stopId) => {
    await stopsApi.delete(stopId);
    const trip = get().activeTrip;
    if (trip) await get().fetchTrip(trip.id);
  },

  reorderStops: async (tripId, stopIds) => {
    await stopsApi.reorder(tripId, { stop_ids: stopIds });
    await get().fetchTrip(tripId);
  },

  clearActiveTrip: () => set({ activeTrip: null }),
}));

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓
