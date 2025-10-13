'use client';

import { createStore } from 'zustand';
import { StoreKey } from '../store-keys';
import { saveCookie } from '../store-utils';

export interface NavbarProps {
  opened: boolean;
  currentEditing?: string;
}

export type OnNavbarRenameFn = (param: { id: string; newName: string }) => void;

export interface NavbarState extends NavbarProps {
  toggle: () => void;
  open: () => void;
  close: () => void;
  setCurrentEditing: (id: string) => void;
  clearCurrentEditing: () => void;
  onNavbarRename?: OnNavbarRenameFn;
  setOnNavbarRename: (fn: OnNavbarRenameFn) => void;
}

export const createNavbarStore = (initProps?: NavbarProps) => {
  return createStore<NavbarState>()((set, get) => ({
    opened: false,
    currentEditing: '',
    ...initProps,
    open: () => {
      set({ opened: true });
      saveCookie(StoreKey.navbarOpened, true);
    },
    close: () => {
      set({ opened: false });
      saveCookie(StoreKey.navbarOpened, false);
    },
    toggle: () => {
      const prevState = get().opened;
      const nextState = !prevState;

      saveCookie(StoreKey.navbarOpened, nextState);

      set({ opened: !prevState });
    },
    setCurrentEditing: (id: string) => {
      set({ currentEditing: id });
    },
    clearCurrentEditing: () => set({ currentEditing: '' }),
    setOnNavbarRename: (fn: OnNavbarRenameFn) => set({ onNavbarRename: fn }),
  }));
};

export type NavbarStore = ReturnType<typeof createNavbarStore>;
