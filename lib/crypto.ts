// AES-256-GCM encryption for sensitive tokens stored in the database.
// Requires TOKEN_ENCRYPTION_KEY env var: a 64-char hex string (32 bytes).
// Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

const ALGORITHM = "AES-GCM"
const KEY_LENGTH = 256

function getKeyMaterial(): string {
  const key = process.env.TOKEN_ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)")
  }
  return key
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("")
}

async function importKey(): Promise<CryptoKey> {
  const keyBytes = hexToBytes(getKeyMaterial())
  return crypto.subtle.importKey("raw", keyBytes, { name: ALGORITHM }, false, ["encrypt", "decrypt"])
}

/** Encrypts a plaintext string. Returns "iv:ciphertext" as hex. */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await importKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded)
  return `${bytesToHex(iv)}:${bytesToHex(new Uint8Array(ciphertext))}`
}

/** Decrypts a "iv:ciphertext" hex string back to plaintext. */
export async function decrypt(encrypted: string): Promise<string> {
  const [ivHex, ciphertextHex] = encrypted.split(":")
  if (!ivHex || !ciphertextHex) throw new Error("Formato de token inválido")
  const key = await importKey()
  const iv = hexToBytes(ivHex)
  const ciphertext = hexToBytes(ciphertextHex)
  const plaintext = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext)
  return new TextDecoder().decode(plaintext)
}
