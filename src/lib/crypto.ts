import { EncryptedPackage } from '../types/index.ts';

// Helper to convert ArrayBuffer to Base64 string
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 string to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derives an AES-GCM 256-bit encryption key from a user passphrase using PBKDF2.
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts markdown content using AES-256-GCM with a user-supplied passphrase.
 */
export async function encryptContent(
  plaintext: string,
  passphrase: string
): Promise<EncryptedPackage> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit standard IV for GCM

  const key = await deriveKey(passphrase, salt);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as any,
      tagLength: 128,
    },
    key,
    enc.encode(plaintext)
  );

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv.buffer),
    salt: bufferToBase64(salt.buffer),
    algorithm: 'AES-GCM-256 / PBKDF2-SHA256',
    tagLength: 128,
    encryptedAt: new Date().toISOString(),
  };
}

/**
 * Decrypts AES-256-GCM encrypted package back into original markdown plaintext.
 */
export async function decryptContent(
  pkg: EncryptedPackage,
  passphrase: string
): Promise<string> {
  const salt = new Uint8Array(base64ToBuffer(pkg.salt));
  const iv = new Uint8Array(base64ToBuffer(pkg.iv));
  const ciphertextBuffer = base64ToBuffer(pkg.ciphertext);

  const key = await deriveKey(passphrase, salt);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as any,
      tagLength: pkg.tagLength || 128,
    },
    key,
    ciphertextBuffer
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

/**
 * Tests if the given passphrase can successfully decrypt the package without throwing.
 */
export async function testPassphrase(
  pkg: EncryptedPackage,
  passphrase: string
): Promise<boolean> {
  try {
    await decryptContent(pkg, passphrase);
    return true;
  } catch {
    return false;
  }
}
