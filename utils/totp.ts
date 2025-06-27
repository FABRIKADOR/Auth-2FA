// Implementación TOTP personalizada usando Web Crypto API
export class TOTP {
  private static base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

  // Generar secreto aleatorio en base32
  static generateSecret(length = 32): string {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)

    let result = ""
    for (let i = 0; i < bytes.length; i++) {
      result += this.base32Chars[bytes[i] % 32]
    }
    return result
  }

  // Decodificar base32 a bytes
  private static base32Decode(encoded: string): Uint8Array {
    const cleanInput = encoded.toUpperCase().replace(/[^A-Z2-7]/g, "")
    const bytes: number[] = []
    let bits = 0
    let value = 0

    for (const char of cleanInput) {
      const index = this.base32Chars.indexOf(char)
      if (index === -1) continue

      value = (value << 5) | index
      bits += 5

      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255)
        bits -= 8
      }
    }

    return new Uint8Array(bytes)
  }

  // Convertir número a bytes (big-endian)
  private static numberToBytes(num: number): Uint8Array {
    const bytes = new Uint8Array(8)
    for (let i = 7; i >= 0; i--) {
      bytes[i] = num & 0xff
      num = num >>> 8
    }
    return bytes
  }

  // Generar HMAC-SHA1
  private static async hmacSha1(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"])

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, data)
    return new Uint8Array(signature)
  }

  // Generar código TOTP
  static async generate(secret: string, timeStep = 30, digits = 6): Promise<string> {
    const key = this.base32Decode(secret)
    const time = Math.floor(Date.now() / 1000 / timeStep)
    const timeBytes = this.numberToBytes(time)

    const hmac = await this.hmacSha1(key, timeBytes)

    // Truncamiento dinámico
    const offset = hmac[hmac.length - 1] & 0xf
    const code =
      (((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff)) %
      Math.pow(10, digits)

    return code.toString().padStart(digits, "0")
  }

  // Verificar código TOTP
  static async verify(secret: string, token: string, window = 1): Promise<boolean> {
    const timeStep = 30
    const currentTime = Math.floor(Date.now() / 1000 / timeStep)

    // Verificar en ventana de tiempo (actual, anterior y siguiente)
    for (let i = -window; i <= window; i++) {
      const time = currentTime + i
      const timeBytes = this.numberToBytes(time)
      const key = this.base32Decode(secret)

      const hmac = await this.hmacSha1(key, timeBytes)
      const offset = hmac[hmac.length - 1] & 0xf
      const code =
        (((hmac[offset] & 0x7f) << 24) |
          ((hmac[offset + 1] & 0xff) << 16) |
          ((hmac[offset + 2] & 0xff) << 8) |
          (hmac[offset + 3] & 0xff)) %
        1000000

      if (code.toString().padStart(6, "0") === token) {
        return true
      }
    }

    return false
  }

  // Generar URL para QR code
  static generateQRUrl(secret: string, issuer: string, accountName: string): string {
    const params = new URLSearchParams({
      secret,
      issuer,
      algorithm: "SHA1",
      digits: "6",
      period: "30",
    })

    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?${params}`
  }
}
