export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed (quota likely exceeded):', key, e);
  }
}

export function readStorage<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Handle legacy encrypted data — clear it and start fresh
    localStorage.removeItem(key);
    return null;
  }
}

export function deleteStorage(key: string): void {
  localStorage.removeItem(key);
}
