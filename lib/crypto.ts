import { AES, enc } from 'crypto-js';

const ENCRYPTION_KEY = 'E2XNdpaAVDaAHkrzjuar';

export function encrypt(plaintext: string): string {
  return AES.encrypt(plaintext, ENCRYPTION_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(enc.Utf8);
}
