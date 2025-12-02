import { PropsWithChildren, useRef } from 'react';
import { createMainStore, MainStore, MainStoreContext } from './main-store';
import { StoreApi } from 'zustand';

export function MainStoreProvider({ children }: PropsWithChildren) {
  const storeRef = useRef<StoreApi<MainStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createMainStore();
  }

  return <MainStoreContext.Provider value={storeRef.current}>{children}</MainStoreContext.Provider>;
}
