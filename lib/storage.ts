import { encrypt, decrypt } from './crypto';

export function writeStorage(key: string, value: unknown): void {
  const encrypted = encrypt(JSON.stringify(value));
  localStorage.setItem(key, encrypted);
}

export function readStorage<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const decrypted = decrypt(raw);
  if (!decrypted) return null;
  return JSON.parse(decrypted) as T;
}

export function deleteStorage(key: string): void {
  localStorage.removeItem(key);
}
