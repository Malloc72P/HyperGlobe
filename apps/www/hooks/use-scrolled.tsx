import { useState } from 'react';

export function useScrolled() {
  const [chatSessionScrollY, setChatSessionScrollY] = useState(0);

  return {
    isScrolled: chatSessionScrollY > 0,
    watchScroll: (e: { x: number; y: number }) => {
      setChatSessionScrollY(e.y);
    },
  };
}
