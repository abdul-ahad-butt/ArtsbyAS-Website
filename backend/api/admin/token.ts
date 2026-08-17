// Simple HMAC-SHA256 signed token — no external deps, uses Web Crypto (available in Workers)

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

/** Create a signed 24-hour token for the given username */
export async function createToken(username: string, secret: string): Promise<string> {
  const payload = btoa(JSON.stringify({ u: username, exp: Date.now() + 86_400_000 }))
  const key = await getKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
  return `${payload}.${sigB64}`
}

/** Verify a token. Returns the username or null if invalid/expired. */
export async function verifyToken(token: string, secret: string): Promise<string | null> {
  const dot = token.lastIndexOf('.')
  if (dot === -1) return null
  const payload = token.slice(0, dot)
  const sigB64 = token.slice(dot + 1)
  try {
    const key = await getKey(secret)
    const sigBytes = Uint8Array.from(atob(sigB64), ch => ch.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(payload))
    if (!valid) return null
    const data = JSON.parse(atob(payload))
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null
    return data.u as string
  } catch {
    return null
  }
}
