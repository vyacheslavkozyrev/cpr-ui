/**
 * Stub Token Generator for Local Development
 * Generates HMAC-SHA256 signed tokens compatible with JwtStubAuthenticationHandler
 *
 * Token format: {userId}.{base64Signature}
 * where signature = HMACSHA256(signingKey, userId)
 */

/**
 * Generate a stub authentication token using HMAC-SHA256
 * @param userId - The user ID to encode in the token
 * @param signingKey - The signing key (defaults to 'test-key' to match backend)
 * @returns Token in format: {userId}.{base64Signature}
 */
export async function generateStubToken(
  userId: string,
  signingKey: string = 'test-key'
): Promise<string> {
  try {
    // Convert signing key and user ID to byte arrays
    const encoder = new TextEncoder()
    const keyBytes = encoder.encode(signingKey)
    const dataBytes = encoder.encode(userId)

    // Import key for HMAC
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    // Generate HMAC signature
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBytes)

    // Convert signature to base64
    const signatureArray = new Uint8Array(signature)
    const signatureBase64 = btoa(String.fromCharCode(...signatureArray))

    // Return token in format: userId.signature
    return `${userId}.${signatureBase64}`
  } catch {
    throw new Error('Token generation failed')
  }
}

/**
 * Get the signing key from environment or use default
 * @returns The JWT signing key
 */
export function getSigningKey(): string {
  return import.meta.env['VITE_JWT_SIGNING_KEY'] || 'test-key'
}
