import { create } from 'zustand';

export interface GlobalLoadingState {
  globalLoading: boolean;
  setGlobalLoading: (v: boolean) => void;
}

export const useGlobalLoadingStore = create<GlobalLoadingState>((set) => ({
  globalLoading: false,
  setGlobalLoading: (globalLoading) => set({ globalLoading }),
}));
