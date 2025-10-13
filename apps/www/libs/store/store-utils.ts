export function saveCookie(key: string, nextState: any) {
  if (typeof window !== 'undefined') {
    const value = JSON.stringify(nextState);

    document.cookie = `${key}=${value}; path=/; max-age=31536000`;
  }
}
