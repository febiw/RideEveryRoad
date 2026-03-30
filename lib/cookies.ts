import Cookies from 'js-cookie';
import { encrypt, decrypt } from './crypto';

export function writeCookie(name: string, value: string, days: number): void {
  const encrypted = encrypt(value);
  Cookies.set(name, encrypted, { expires: days });
}

export function readCookie(name: string): string | null {
  const raw = Cookies.get(name);
  if (!raw) return null;
  return decrypt(raw);
}

export function cookieExists(name: string): boolean {
  return Cookies.get(name) !== undefined;
}
