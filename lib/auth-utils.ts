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

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Generates a signed url-safe token containing the payload.
 */
export async function signToken(payload: any, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const payloadBase64 = btoa(unescape(encodeURIComponent(payloadStr)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadBase64)
  );
  
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
    
  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Verifies a signed token and returns the decoded payload if valid, or null.
 */
export async function verifyToken(token: string, secret: string): Promise<any | null> {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  
  const [payloadBase64, signatureBase64] = parts;
  
  try {
    const encoder = new TextEncoder();
    const key = await getHmacKey(secret);
    
    // Reconstruct signature bytes from url-safe base64
    const base64 = signatureBase64
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const pad = base64.length % 4;
    const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
    const sigBytes = Uint8Array.from(atob(paddedBase64), c => c.charCodeAt(0));
    
    // Reconstruct payload bytes from url-safe base64
    const payloadBase64Standard = payloadBase64
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const payloadPad = payloadBase64Standard.length % 4;
    const paddedPayloadBase64 = payloadPad ? payloadBase64Standard + '='.repeat(4 - payloadPad) : payloadBase64Standard;
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(payloadBase64)
    );
    
    if (!isValid) return null;
    
    const payloadStr = decodeURIComponent(escape(atob(paddedPayloadBase64)));
    const payload = JSON.parse(payloadStr);
    
    // Check expiration if present
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    
    return payload;
  } catch (e) {
    return null;
  }
}

