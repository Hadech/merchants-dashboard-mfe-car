function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s+/g, '')
  const binary = atob(b64)
  const buffer = new ArrayBuffer(binary.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i)
  }
  return buffer
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export interface EncryptedPayload {
  payload: string
  encryptedKey: string
  iv: string
}

export async function performEnvelopeEncryption(
  data: Record<string, unknown>,
  publicKey: string,
): Promise<EncryptedPayload> {
  const symmetricKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )

  const encoder = new TextEncoder()
  const encodedData = encoder.encode(JSON.stringify(data))
  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  const encryptedData = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    symmetricKey,
    encodedData,
  )

  const rawPublicKey = await window.crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(publicKey),
    { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
    true,
    ['encrypt'],
  )

  const rawSymmetricKey = await window.crypto.subtle.exportKey('raw', symmetricKey)
  const encryptedKey = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    rawPublicKey,
    rawSymmetricKey,
  )

  return {
    payload: arrayBufferToBase64(encryptedData),
    encryptedKey: arrayBufferToBase64(encryptedKey),
    iv: arrayBufferToBase64(iv.buffer),
  }
}
