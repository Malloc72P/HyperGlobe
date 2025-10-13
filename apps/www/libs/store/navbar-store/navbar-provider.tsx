'use client';

import { createContext, PropsWithChildren, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import { NavbarStore, NavbarProps, createNavbarStore, NavbarState } from './navbar-store';

export const NavbarContext = createContext<NavbarStore | null>(null);

export function NavbarProvider({ opened, children }: NavbarProps & PropsWithChildren) {
  const store = useRef(createNavbarStore({ opened })).current;

  return <NavbarContext.Provider value={store}>{children}</NavbarContext.Provider>;
}

export function useNavbarStore<T>(selector: (state: NavbarState) => T): T {
  const store = useContext(NavbarContext);

  if (!store) {
    throw new Error('No NavbarProvider Error');
  }

  return useStore(store, selector);
}
