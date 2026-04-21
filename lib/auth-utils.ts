/**
 * Password hashing utility using Web Crypto API (supported on Cloudflare Workers/Edge)
 */

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Use a static salt for simplicity in this example, 
  // but in production you should use a random salt per user and store it.
  const salt = encoder.encode("pinnacle-community-salt-2026"); 
  
  const baseKey = await crypto.subtle.importKey(
    "raw",
    data,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  
  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    256
  );
  
  const buffer = new Uint8Array(derivedKey);
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}
